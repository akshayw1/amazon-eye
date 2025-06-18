import pandas as pd
import os
import requests
import json
import csv
import uuid
from datetime import datetime
import time

def generate_missing_products_with_groq():
    """
    Processes only the products that are in reviews but missing from generated products CSV
    """
    
    # File paths
    product_clean_dir = 'product_clean'
    reviews_file = os.path.join(product_clean_dir, 'limited_reviews_15per_product.csv')
    existing_products_file = os.path.join(product_clean_dir, 'generated_products.csv')
    output_file = os.path.join(product_clean_dir, 'generated_products_updated.csv')
    
    # Groq API configuration
    groq_api_key = "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"
    groq_url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {groq_api_key}"
    }
    
    try:
        # Check if files exist
        if not os.path.exists(reviews_file):
            print(f"Error: {reviews_file} not found!")
            return
            
        if not os.path.exists(existing_products_file):
            print(f"Error: {existing_products_file} not found!")
            return
            
        print(f"Reading reviews from {reviews_file}...")
        reviews_df = pd.read_csv(reviews_file)
        
        print(f"Reading existing products from {existing_products_file}...")
        existing_products_df = pd.read_csv(existing_products_file)
        
        # Get product IDs from both files
        all_product_ids = set(reviews_df['product_ID'].unique())
        existing_product_ids = set(existing_products_df['product_ID'].unique())
        
        # Find missing product IDs
        missing_product_ids = all_product_ids - existing_product_ids
        
        print(f"\n" + "="*60)
        print(f"ANALYSIS RESULTS")
        print(f"="*60)
        print(f"- Total products in reviews: {len(all_product_ids)}")
        print(f"- Products already generated: {len(existing_product_ids)}")
        print(f"- Missing products to process: {len(missing_product_ids)}")
        
        if not missing_product_ids:
            print(f"\n✓ All products have been processed! No missing products found.")
            return
        
        print(f"- Missing product IDs: {sorted(list(missing_product_ids))}")
        
        # Copy existing products to new file first
        print(f"\nCopying existing products to {output_file}...")
        existing_products_df.to_csv(output_file, index=False)
        
        # Now append missing products
        print(f"Processing missing products...")
        start_time = datetime.now()
        
        # Open CSV file for appending
        with open(output_file, 'a', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            
            for idx, product_id in enumerate(sorted(missing_product_ids), 1):
                print(f"\nProcessing Missing Product {product_id} ({idx}/{len(missing_product_ids)})")
                
                # Get reviews for this product
                product_reviews = reviews_df[reviews_df['product_ID'] == product_id]
                reviews_count = len(product_reviews)
                print(f"  Found {reviews_count} reviews for product {product_id}")
                
                # Create prompt based on reviews
                prompt = create_product_prompt(product_reviews, product_id)
                
                # Call Groq API
                try:
                    print(f"  Generating product details with Groq...")
                    product_data = call_groq_api(prompt, headers, groq_url)
                    
                    if product_data:
                        # Parse the generated product data
                        parsed_data = parse_groq_response(product_data, product_id)
                        
                        # Write to CSV
                        writer.writerow([
                            parsed_data['id'],
                            parsed_data['name'],
                            parsed_data['description'],
                            parsed_data['price'],
                            parsed_data['stock'],
                            '',  # images - keeping empty for now
                            parsed_data['category'],
                            product_id
                        ])
                        
                        print(f"  ✓ Generated: {parsed_data['name']}")
                        csvfile.flush()  # Ensure data is written immediately
                        
                    else:
                        print(f"  ✗ Failed to generate product for ID {product_id}")
                        # Write a fallback entry
                        fallback_data = parse_groq_response("", product_id)
                        writer.writerow([
                            fallback_data['id'],
                            fallback_data['name'],
                            fallback_data['description'],
                            fallback_data['price'],
                            fallback_data['stock'],
                            '',
                            fallback_data['category'],
                            product_id
                        ])
                        print(f"  ↳ Added fallback entry for product {product_id}")
                        csvfile.flush()
                        
                except Exception as e:
                    print(f"  ✗ Error processing product {product_id}: {e}")
                    # Write a fallback entry even on error
                    fallback_data = parse_groq_response("", product_id)
                    writer.writerow([
                        fallback_data['id'],
                        fallback_data['name'],
                        fallback_data['description'],
                        fallback_data['price'],
                        fallback_data['stock'],
                        '',
                        fallback_data['category'],
                        product_id
                    ])
                    print(f"  ↳ Added fallback entry for product {product_id}")
                    csvfile.flush()
                
                # Add delay to avoid rate limiting
                time.sleep(2)
        
        # Final verification
        print(f"\nVerifying results...")
        final_df = pd.read_csv(output_file)
        final_product_ids = set(final_df['product_ID'].unique())
        
        processing_time = (datetime.now() - start_time).total_seconds()
        print(f"\n" + "="*60)
        print(f"PROCESSING COMPLETE")
        print(f"="*60)
        print(f"- Missing products processed: {len(missing_product_ids)}")
        print(f"- Total products in final file: {len(final_product_ids)}")
        print(f"- Processing time: {processing_time:.2f} seconds")
        print(f"- Updated file: {output_file}")
        
        # Check if we got all products
        remaining_missing = all_product_ids - final_product_ids
        if remaining_missing:
            print(f"- Still missing: {sorted(list(remaining_missing))}")
        else:
            print(f"- ✓ All products successfully processed!")
        
    except Exception as e:
        print(f"Error: {e}")

def create_product_prompt(product_reviews, product_id):
    """
    Creates a prompt for Groq based on product reviews
    """
    # Collect review texts and titles
    review_texts = []
    review_titles = []
    avg_rating = product_reviews['review_rating'].mean()
    
    for _, review in product_reviews.iterrows():
        if pd.notna(review['review_title']) and review['review_title'].strip():
            review_titles.append(review['review_title'].strip())
        if pd.notna(review['review_body']) and review['review_body'].strip():
            review_texts.append(review['review_body'].strip()[:500])  # Limit length
    
    # Create the prompt
    prompt = f"""Based on the following customer reviews for Product ID {product_id}, generate a professional product listing with the following details:

CUSTOMER REVIEWS:
Average Rating: {avg_rating:.1f}/5.0

Review Titles: {' | '.join(review_titles[:5])}

Review Content:
{chr(10).join([f"- {text}" for text in review_texts[:3]])}

Please generate a JSON response with the following structure:
{{
    "name": "Professional product name (2-8 words)",
    "description": "Detailed product description (100-300 words) highlighting key features and benefits mentioned in reviews",
    "price": "Estimated price in USD (numeric value only, reasonable for this type of product)",
    "stock": "Random stock number between 10-100",
    "category": "Product category (e.g., 'Kitchen & Dining', 'Electronics', 'Home & Garden', etc.)"
}}

Requirements:
- Name should be professional and marketable
- Description should be comprehensive but concise
- Price should be realistic based on review quality and product type
- Category should be broad but accurate
- Use insights from customer reviews to highlight key selling points
- Make it sound appealing to potential buyers

Only return the JSON, no additional text."""
    
    return prompt

def call_groq_api(prompt, headers, groq_url, max_retries=3):
    """
    Calls the Groq API with the given prompt, handles 429 rate limit errors
    """
    data = {
        "model": "llama-3.1-8b-instant",  # Using a reliable model
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.post(groq_url, headers=headers, json=data, timeout=30)
            
            # Check for rate limit (429) error
            if response.status_code == 429:
                print(f"    Rate limit hit (429), waiting 5 seconds... (attempt {attempt + 1}/{max_retries})")
                time.sleep(5)
                continue
            
            response.raise_for_status()
            
            result = response.json()
            return result['choices'][0]['message']['content']
            
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                print(f"    Rate limit hit (429), waiting 5 seconds... (attempt {attempt + 1}/{max_retries})")
                time.sleep(5)
                continue
            else:
                print(f"    HTTP error: {e}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"    API request failed: {e}")
            if attempt < max_retries - 1:
                print(f"    Retrying in 2 seconds... (attempt {attempt + 1}/{max_retries})")
                time.sleep(2)
                continue
            return None
            
        except Exception as e:
            print(f"    Error parsing API response: {e}")
            return None
    
    print(f"    Failed after {max_retries} attempts")
    return None

def parse_groq_response(response_text, product_id):
    """
    Parses the Groq API response and returns structured data
    """
    try:
        # Try to extract JSON from the response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx]
            data = json.loads(json_str)
            
            # Add default values and generate UUID
            parsed_data = {
                'id': str(uuid.uuid4()),
                'name': data.get('name', f'Product {product_id}'),
                'description': data.get('description', 'High-quality product based on customer reviews.'),
                'price': float(data.get('price', 29.99)),
                'stock': int(data.get('stock', 50)),
                'category': data.get('category', 'General')
            }
            
            return parsed_data
            
    except Exception as e:
        print(f"    Error parsing JSON: {e}")
    
    # Fallback if JSON parsing fails
    return {
        'id': str(uuid.uuid4()),
        'name': f'Product {product_id}',
        'description': 'Quality product with positive customer reviews.',
        'price': 29.99,
        'stock': 50,
        'category': 'General'
    }

if __name__ == "__main__":
    generate_missing_products_with_groq()