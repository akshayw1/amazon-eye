import json
import pandas as pd

# Read the CSV files
df_metrics = pd.read_csv('product_clean/selected_120_products.csv')
df_reviews = pd.read_csv('product_clean/limited_reviews_200per_product.csv')

# Read the JSON file
with open('product_clean/combined_products.json', 'r') as f:
    products = json.load(f)

# Create a dictionary for quick lookup of product metrics
product_metrics = df_metrics.set_index('product_ID')[['fake_score', 'trust_score', 'n_of_reviews', 'avg_review_rating']].to_dict('index')

# Create a dictionary for reviews grouped by product_ID
reviews_by_product = df_reviews.groupby('product_ID').apply(lambda x: x.to_dict('records')).to_dict()

# Update each product in the JSON with the metrics and reviews
for product in products:
    product_id = product['product_ID']
    
    # Add metrics if available
    if product_id in product_metrics:
        metrics = product_metrics[product_id]
        product.update({
            'fake_score': metrics['fake_score'],
            'trust_score': metrics['trust_score'],
            'n_of_reviews': metrics['n_of_reviews'],
            'avg_review_rating': metrics['avg_review_rating']
        })
    
    # Add reviews if available
    if product_id in reviews_by_product:
        reviews = reviews_by_product[product_id]
        # Clean up each review to only include relevant fields
        cleaned_reviews = []
        for review in reviews:
            cleaned_reviews.append({
                'rating': review['review_rating'],
                'helpful_votes': review['number_of_helpful'],
                'review_text': review['review_body'],
                'title': review['review_title'],
                'date': review['review_date'],
                'reviewer_id': review['reviewer_ID'],
                'ai_generated': bool(review['ai_generated']),
                'generated_score': review['generated_score']
            })
        product['reviews'] = cleaned_reviews

# Write the updated JSON back to file
with open('product_clean/combined_products.json', 'w') as f:
    json.dump(products, f, indent=2)

print("Successfully updated combined_products.json with metrics and reviews from CSV files") 