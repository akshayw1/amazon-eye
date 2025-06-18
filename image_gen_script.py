#!/usr/bin/env python3
"""
Product Image Scraper
Scrapes top 3 Google Images for products from CSV and saves to JSON
"""

import csv
import json
import requests
import time
import re
from urllib.parse import urlencode, quote_plus
from bs4 import BeautifulSoup
import random
from typing import List, Dict, Optional

class ProductImageScraper:
    def __init__(self):
        # Rotate through different user agents to avoid detection
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
    
    def get_headers(self) -> Dict[str, str]:
        """Get random headers to avoid detection"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    
    def search_google_images(self, query: str, num_images: int = 3) -> List[str]:
        """
        Search Google Images and return direct image URLs
        """
        try:
            # Clean and encode the search query
            clean_query = re.sub(r'[^\w\s-]', ' ', query).strip()
            search_url = f"https://www.google.com/search?{urlencode({'q': clean_query, 'tbm': 'isch'})}"
            
            print(f"Searching for: {clean_query}")
            
            # Make request with headers
            response = requests.get(search_url, headers=self.get_headers(), timeout=10)
            response.raise_for_status()
            
            # Parse the HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find image URLs using multiple methods
            image_urls = []
            
            # Method 1: Look for img tags with data-src
            img_tags = soup.find_all('img', {'data-src': True})
            for img in img_tags:
                src = img.get('data-src')
                if src and self.is_valid_image_url(src):
                    image_urls.append(src)
                    if len(image_urls) >= num_images:
                        break
            
            # Method 2: Look for img tags with src if not enough found
            if len(image_urls) < num_images:
                img_tags = soup.find_all('img', {'src': True})
                for img in img_tags:
                    src = img.get('src')
                    if src and self.is_valid_image_url(src) and src not in image_urls:
                        image_urls.append(src)
                        if len(image_urls) >= num_images:
                            break
            
            # Method 3: Extract from JavaScript/JSON data
            if len(image_urls) < num_images:
                scripts = soup.find_all('script')
                for script in scripts:
                    if script.string:
                        # Look for image URLs in script content
                        urls = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|gif|webp)', script.string, re.IGNORECASE)
                        for url in urls:
                            if self.is_valid_image_url(url) and url not in image_urls:
                                image_urls.append(url)
                                if len(image_urls) >= num_images:
                                    break
                        if len(image_urls) >= num_images:
                            break
            
            return image_urls[:num_images]
            
        except Exception as e:
            print(f"Error searching for '{query}': {str(e)}")
            return []
    
    def is_valid_image_url(self, url: str) -> bool:
        """Check if URL is a valid direct image link"""
        if not url or not url.startswith(('http://', 'https://')):
            return False
        
        # Skip certain domains/patterns that aren't direct images
        skip_patterns = [
            'google.com/url',
            'googleusercontent.com/gadgets',
            'data:image',
            'base64',
            '.svg',  # Skip SVGs as they might not be product images
        ]
        
        for pattern in skip_patterns:
            if pattern in url.lower():
                return False
        
        # Check if URL ends with image extension or has image-like patterns
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        url_lower = url.lower()
        
        return any(ext in url_lower for ext in image_extensions) or 'image' in url_lower
    
    def read_csv_products(self, csv_file: str) -> List[Dict]:
        """Read products from CSV file"""
        products = []
        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    products.append({
                        'id': row.get('id', ''),
                        'product_ID': row.get('product_ID', ''),
                        'name': row.get('name', ''),
                        'description': row.get('description', ''),
                    })
        except Exception as e:
            print(f"Error reading CSV file: {str(e)}")
        
        return products
    
    def create_search_query(self, product: Dict) -> str:
        """Create an optimized search query for the product"""
        name = product.get('name', '').strip()
        
        # Clean up the name for better search results
        # Remove brand-specific terms that might limit results
        search_terms = name
        
        # Add context for better image results
        search_terms += " product"
        
        return search_terms
    
    def load_existing_results(self, output_file: str) -> List[Dict]:
        """Load existing results from JSON file if it exists"""
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def save_single_result(self, result: Dict, output_file: str):
        """Save a single product result to JSON file"""
        try:
            # Load existing results
            results = self.load_existing_results(output_file)
            
            # Check if product already exists (by id)
            existing_index = -1
            for i, existing in enumerate(results):
                if existing.get('id') == result.get('id'):
                    existing_index = i
                    break
            
            # Create simplified result with only id and images
            simplified_result = {
                'id': result.get('id'),
                'images': result.get('images', [])
            }
            
            # Update existing or add new
            if existing_index >= 0:
                results[existing_index] = simplified_result
                print(f"Updated existing entry for ID: {result['id']}")
            else:
                results.append(simplified_result)
                print(f"Added new entry for ID: {result['id']}")
            
            # Save back to file
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Saved to {output_file}")
            
        except Exception as e:
            print(f"❌ Error saving result: {str(e)}")
    
    def scrape_product_images(self, csv_file: str, output_file: str = 'product_images.json'):
        """Main method to scrape images for all products"""
        print("Starting product image scraping...")
        
        # Read products from CSV
        products = self.read_csv_products(csv_file)
        if not products:
            print("No products found in CSV file!")
            return
        
        print(f"Found {len(products)} products to process")
        
        # Load existing results to check what's already processed
        existing_results = self.load_existing_results(output_file)
        processed_ids = {r.get('id') for r in existing_results}
        
        total_processed = 0
        
        for i, product in enumerate(products, 1):
            print(f"\n[{i}/{len(products)}] Processing: {product['name']}")
            
            # Skip if already processed
            if product['id'] in processed_ids:
                print(f"⏭️  Skipping - already processed")
                continue
            
            # Create search query
            search_query = self.create_search_query(product)
            
            # Search for images
            image_urls = self.search_google_images(search_query, num_images=3)
            
            # Create result with only id and images
            result = {
                'id': product['id'],
                'images': image_urls
            }
            
            print(f"Found {len(image_urls)} images")
            for j, url in enumerate(image_urls, 1):
                print(f"  {j}. {url}")
            
            # Save immediately after processing each product
            self.save_single_result(result, output_file)
            total_processed += 1
            
            # Add delay to avoid being blocked
            if i < len(products):
                delay = random.uniform(2, 5)
                print(f"Waiting {delay:.1f} seconds...")
                time.sleep(delay)
        
        # Final summary
        print(f"\n🎉 Processing completed!")
        print(f"Products processed in this run: {total_processed}")
        
        # Load final results for summary
        final_results = self.load_existing_results(output_file)
        print(f"Total products in file: {len(final_results)}")
        
        # Products with no images
        no_images = [r for r in final_results if len(r.get('images', [])) == 0]
        if no_images:
            print(f"\n⚠️ Products with no images found ({len(no_images)}):")
            for product in no_images:
                print(f"  - Product ID: {product.get('id', 'Unknown')}")

def main():
    """Main function to run the scraper"""
    scraper = ProductImageScraper()
    
    # Input CSV file from product clean folder
    csv_file = 'product_clean/generated_products_updated.csv'  # CSV file in product clean folder
    output_file = 'product_images.json'
    
    print("🔍 Product Image Scraper")
    print("=" * 50)
    
    # Run the scraper
    scraper.scrape_product_images(csv_file, output_file)
    
    print("\n✨ Scraping completed!")

if __name__ == "__main__":
    main()