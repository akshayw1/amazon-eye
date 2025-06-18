import pandas as pd
import os
import requests
import json
import csv
import uuid
from datetime import datetime
import time

def generate_product_with_groq():
    """
    Generates product details using Groq API based on reviews for each product
    """
    
    # File paths
    product_clean_dir = 'product_clean'
    reviews_file = os.path.join(product_clean_dir, 'limited_reviews_15per_product.csv')
    output_file = os.path.join(product_clean_dir, 'generated_products.csv')
    
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
            
        print(f"Reading reviews from {reviews_file}...")
        reviews_df = pd.read_csv(reviews_file)
        
        # Get unique product IDs
        product_ids = reviews_df['product_ID'].unique()
        total_products = len(product_ids)
        print(f"Found {total_products} unique products to process")
        
        # Create CSV file with headers
        csv_headers = ['id', 'name', 'description', 'price', 'stock', 'images', 'category', 'product_ID']
        
        # Open CSV file for writing
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(csv_headers)
            
            print(f"Starting product generation...")
            start_time = datetime.now()
            
            for idx, product_id in enumerate(product_ids, 1):
                print(f"\nProcessing Product {product_id} ({idx}/{total_products})")
                
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
                        
                except Exception as e:
                    print(f"  ✗ Error processing product {product_id}: {e}")
                
                # Add delay to avoid rate limiting (increased to 2 seconds for safety)
                time.sleep(2)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        print(f"\n" + "="*60)
        print(f"PROCESSING COMPLETE")
        print(f"="*60)
        print(f"- Total products processed: {total_products}")
        print(f"- Processing time: {processing_time:.2f} seconds")
        print(f"- Output file: {output_file}")
        
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

def call_groq_api(prompt, headers, groq_url):
    """
    Calls the Groq API with the given prompt
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
    
    try:
        response = requests.post(groq_url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        return result['choices'][0]['message']['content']
        
    except requests.exceptions.RequestException as e:
        print(f"    API request failed: {e}")
        return None
    except Exception as e:
        print(f"    Error parsing API response: {e}")
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
    generate_product_with_groq()