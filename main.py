import pandas as pd
import os
from datetime import datetime

import pandas as pd
import os
from datetime import datetime

def limit_reviews_per_product():
    """
    Takes product IDs from producttrust700.csv and limits to 15 reviews per product
    """
    
    # File paths - all files are in product_clean directory
    product_clean_dir = 'product_clean'
    producttrust700_file = os.path.join(product_clean_dir, 'selected_120_products.csv')
    reviews_file = os.path.join(product_clean_dir, 'shifted_reviews_data.csv')
    output_file = os.path.join(product_clean_dir, 'limited_reviews_200per_product.csv')
    
    # Maximum reviews per product
    max_reviews_per_product = 200
    
    try:
        # Check if product_clean directory exists
        if not os.path.exists(product_clean_dir):
            print(f"Error: {product_clean_dir} directory not found!")
            return
            
        # Check if required files exist
        if not os.path.exists(producttrust700_file):
            print(f"Error: {producttrust700_file} not found!")
            return
            
        if not os.path.exists(reviews_file):
            print(f"Error: {reviews_file} not found!")
            return
        
        print(f"Reading {producttrust700_file}...")
        start_time = datetime.now()
        
        # Read the producttrust700 file to get product IDs
        product_trust_df = pd.read_csv(producttrust700_file)
        
        # Extract unique product IDs from producttrust700
        product_ids = set(product_trust_df['product_ID'].unique())
        print(f"Found {len(product_ids)} unique product IDs in producttrust700.csv")
        print(f"Product IDs: {sorted(list(product_ids))}")
        
        # Process the reviews file in chunks and limit to 15 reviews per product
        print(f"\nProcessing reviews and limiting to {max_reviews_per_product} per product...")
        
        chunk_size = 100000  # Process 100k rows at a time
        product_review_counts = {pid: 0 for pid in product_ids}  # Track how many reviews we have for each product
        limited_reviews_list = []
        total_processed = 0
        
        # Read and process the file in chunks
        for chunk_num, chunk in enumerate(pd.read_csv(reviews_file, chunksize=chunk_size), 1):
            # Filter chunk for matching product IDs
            filtered_chunk = chunk[chunk['product_ID'].isin(product_ids)]
            
            # For each product in this chunk, take only what we need (up to 15 total)
            for product_id in filtered_chunk['product_ID'].unique():
                if product_review_counts[product_id] < max_reviews_per_product:
                    # Get reviews for this product in current chunk
                    product_reviews = filtered_chunk[filtered_chunk['product_ID'] == product_id]
                    
                    # Calculate how many more reviews we need for this product
                    needed_reviews = max_reviews_per_product - product_review_counts[product_id]
                    
                    # Take only the needed number of reviews
                    reviews_to_add = product_reviews.head(needed_reviews)
                    
                    if len(reviews_to_add) > 0:
                        limited_reviews_list.append(reviews_to_add)
                        product_review_counts[product_id] += len(reviews_to_add)
            
            total_processed += len(chunk)
            
            # Progress update every 10 chunks (1M rows)
            if chunk_num % 10 == 0:
                elapsed = datetime.now() - start_time
                current_total = sum(product_review_counts.values())
                print(f"  Processed {total_processed:,} rows in {elapsed.total_seconds():.1f}s - Collected {current_total} limited reviews")
            
            # Check if we have enough reviews for all products
            if all(count >= max_reviews_per_product for count in product_review_counts.values()):
                print(f"  ✓ Reached {max_reviews_per_product} reviews for all products, stopping early...")
                break
        
        print(f"\nCombining limited reviews...")
        
        if limited_reviews_list:
            # Combine all limited reviews
            limited_reviews = pd.concat(limited_reviews_list, ignore_index=True)
            
            # Save the limited reviews to product_clean folder
            print(f"Saving limited reviews to {output_file}...")
            limited_reviews.to_csv(output_file, index=False)
            print(f"✓ Limited reviews saved successfully!")
            
            # Calculate final statistics
            final_review_count = len(limited_reviews)
            products_with_reviews = len([count for count in product_review_counts.values() if count > 0])
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Display detailed statistics
            print(f"\n" + "="*60)
            print(f"PROCESSING COMPLETE")
            print(f"="*60)
            print(f"- Total rows processed: {total_processed:,}")
            print(f"- Products in trust file: {len(product_ids)}")
            print(f"- Products with reviews found: {products_with_reviews}")
            print(f"- Total limited reviews saved: {final_review_count:,}")
            print(f"- Max reviews per product: {max_reviews_per_product}")
            print(f"- Processing time: {processing_time:.2f} seconds")
            
            # Show exact count per product
            print(f"\nReview count per product ID:")
            for product_id in sorted(product_ids):
                count = product_review_counts[product_id]
                print(f"  Product {product_id}: {count} reviews")
            
            # Show sample of the limited dataset
            print(f"\nSample of limited reviews:")
            sample_df = limited_reviews[['product_ID', 'review_rating', 'review_title', 'review_date']].head(10)
            print(sample_df.to_string(index=False))
            
        else:
            print(f"\n⚠️  No reviews found matching the product IDs from producttrust700.csv")
            print(f"Please verify that the product_ID column values match between the two files.")
        
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
        print("Please make sure the following files exist in the product_clean directory:")
        print("- producttrust700.csv")
        print("- shifted_reviews_data.csv")

if __name__ == "__main__":
    limit_reviews_per_product()