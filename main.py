import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def convert_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj

def analyze_clusters(input_file='producttrust64k.csv'):
    """
    Analyze data by clusters using chunking for memory efficiency,
    create separate CSV files for each cluster, and generate comprehensive JSON analysis
    """
    
    # First pass: Get basic info and unique clusters using chunking
    print("Analyzing dataset structure using chunking...")
    chunk_size = 10000  # Process 10k rows at a time
    unique_clusters = set()
    total_rows = 0
    column_names = None
    
    try:
        # First pass to get unique clusters and total count
        for chunk_num, chunk in enumerate(pd.read_csv(input_file, 
                                                     chunksize=chunk_size,
                                                     dtype={'cluster_ID': 'int16', 'fake': 'int8', 'product_ID': 'int32'},
                                                     low_memory=False), 1):
            if column_names is None:
                column_names = list(chunk.columns)
            
            unique_clusters.update(chunk['cluster_ID'].unique())
            total_rows += len(chunk)
            
            if chunk_num % 3 == 0:  # Progress every 30k rows
                print(f"  Processed {total_rows:,} rows, found {len(unique_clusters)} clusters so far...")
                
    except Exception as e:
        print(f"Error reading file: {e}")
        print("Make sure the file exists and is accessible")
        return
    
    unique_clusters = sorted(list(unique_clusters))
    print(f"\nDataset analysis complete:")
    print(f"- Total rows: {total_rows:,}")
    print(f"- Columns: {column_names}")
    print(f"- Found {len(unique_clusters)} unique clusters")
    print(f"- Cluster range: {min(unique_clusters)} to {max(unique_clusters)}")
    
    # Check if we really have ~20 clusters as expected
    if len(unique_clusters) > 30:
        print(f"Warning: Found {len(unique_clusters)} clusters, which is more than expected (~20)")
        print("Proceeding with analysis for all clusters...")
    
    # Create output directory
    output_dir = 'cluster_analysis_output'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Initialize comprehensive analysis dictionary
    comprehensive_analysis = {
        'analysis_timestamp': datetime.now().isoformat(),
        'total_records': int(total_rows),
        'total_clusters': int(len(unique_clusters)),
        'cluster_list': [int(x) for x in unique_clusters],
        'overall_statistics': {},
        'cluster_details': {},
        'comparative_analysis': {}
    }
    
    # Initialize cluster data collectors and overall statistics accumulators
    cluster_data_collectors = {cluster_id: [] for cluster_id in unique_clusters}
    overall_stats = {
        'total_fake': 0,
        'total_real': 0,
        'fake_score_sum': 0.0,
        'review_rating_sum': 0.0,
        'n_reviews_sum': 0.0,
        'days_between_sum': 0.0,
        'total_processed': 0
    }
    
    print(f"\nSecond pass: Processing clusters using chunking...")
    start_time = datetime.now()
    
    # Second pass: Collect data by cluster using chunking
    for chunk_num, chunk in enumerate(pd.read_csv(input_file, 
                                                 chunksize=chunk_size,
                                                 dtype={'cluster_ID': 'int16', 'fake': 'int8', 'product_ID': 'int32'},
                                                 low_memory=False), 1):
        
        # Update overall statistics
        overall_stats['total_fake'] += int(chunk['fake'].sum())
        overall_stats['total_real'] += int((chunk['fake'] == 0).sum())
        overall_stats['fake_score_sum'] += float(chunk['fake_score'].sum())
        overall_stats['review_rating_sum'] += float(chunk['avg_review_rating'].sum())
        overall_stats['n_reviews_sum'] += float(chunk['n_of_reviews'].sum())
        overall_stats['days_between_sum'] += float(chunk['avg_days_between_reviews'].sum())
        overall_stats['total_processed'] += len(chunk)
        
        # Distribute rows to respective cluster collectors
        for cluster_id in unique_clusters:
            cluster_chunk = chunk[chunk['cluster_ID'] == cluster_id]
            if len(cluster_chunk) > 0:
                cluster_data_collectors[cluster_id].append(cluster_chunk)
        
        # Progress update
        if chunk_num % 3 == 0:
            elapsed = (datetime.now() - start_time).total_seconds()
            print(f"  Processed {overall_stats['total_processed']:,} rows in {elapsed:.1f}s...")
    
    # Calculate overall statistics
    comprehensive_analysis['overall_statistics'] = {
        'total_fake_reviews': overall_stats['total_fake'],
        'total_real_reviews': overall_stats['total_real'],
        'overall_fake_percentage': float(overall_stats['total_fake'] / overall_stats['total_processed'] * 100),
        'avg_fake_score': float(overall_stats['fake_score_sum'] / overall_stats['total_processed']),
        'avg_review_rating': float(overall_stats['review_rating_sum'] / overall_stats['total_processed']),
        'avg_number_of_reviews': float(overall_stats['n_reviews_sum'] / overall_stats['total_processed']),
        'avg_days_between_reviews': float(overall_stats['days_between_sum'] / overall_stats['total_processed'])
    }
    
    print(f"\nGenerating cluster CSV files and statistics...")
    
    # Process each cluster's collected data
    cluster_stats = []
    total_clusters = len(unique_clusters)
    
    for i, cluster_id in enumerate(unique_clusters):
        if i % 5 == 0 or i == total_clusters - 1:
            print(f"Processing cluster {cluster_id} ({i+1}/{total_clusters})...")
        
        # Combine all chunks for this cluster
        if cluster_data_collectors[cluster_id]:
            cluster_data = pd.concat(cluster_data_collectors[cluster_id], ignore_index=True)
        else:
            # Empty cluster
            cluster_data = pd.DataFrame(columns=column_names)
        
        # Save cluster data to CSV (all data, no compression)
        cluster_filename = f'{output_dir}/cluster_{cluster_id}_data.csv'
        cluster_data.to_csv(cluster_filename, index=False)
        
        if len(cluster_data) > 0:
            print(f"  Saved cluster {cluster_id} with {len(cluster_data):,} rows to {cluster_filename}")
        
        # Calculate cluster statistics efficiently
        cluster_size = len(cluster_data)
        if cluster_size > 0:
            fake_count = int(cluster_data['fake'].sum())
            real_count = cluster_size - fake_count
            fake_percentage = (fake_count / cluster_size) * 100
        else:
            fake_count = 0
            real_count = 0
            fake_percentage = 0.0
        
        # Calculate statistics with proper handling of empty clusters
        if cluster_size > 0:
            stats = {
                'avg_fake_score': round(float(cluster_data['fake_score'].mean()), 4),
                'std_fake_score': round(float(cluster_data['fake_score'].std()) if len(cluster_data) > 1 else 0.0, 4),
                'min_fake_score': round(float(cluster_data['fake_score'].min()), 4),
                'max_fake_score': round(float(cluster_data['fake_score'].max()), 4),
                'avg_review_rating': round(float(cluster_data['avg_review_rating'].mean()), 3),
                'std_review_rating': round(float(cluster_data['avg_review_rating'].std()) if len(cluster_data) > 1 else 0.0, 3),
                'avg_n_reviews': round(float(cluster_data['n_of_reviews'].mean()), 1),
                'std_n_reviews': round(float(cluster_data['n_of_reviews'].std()) if len(cluster_data) > 1 else 0.0, 1),
                'avg_days_between_reviews': round(float(cluster_data['avg_days_between_reviews'].mean()), 2),
                'avg_pagerank': round(float(cluster_data['pagerank'].mean()), 8),
                'avg_eigenvector_cent': round(float(cluster_data['eigenvector_cent'].mean()), 12),
                'avg_clustering_coef': round(float(cluster_data['clustering_coef'].mean()), 4),
                'avg_w_degree': round(float(cluster_data['w_degree'].mean()), 2)
            }
        else:
            # Empty cluster
            stats = {
                'avg_fake_score': 0.0, 'std_fake_score': 0.0, 'min_fake_score': 0.0, 'max_fake_score': 0.0,
                'avg_review_rating': 0.0, 'std_review_rating': 0.0, 'avg_n_reviews': 0.0, 'std_n_reviews': 0.0,
                'avg_days_between_reviews': 0.0, 'avg_pagerank': 0.0, 'avg_eigenvector_cent': 0.0,
                'avg_clustering_coef': 0.0, 'avg_w_degree': 0.0
            }
        
        cluster_analysis = {
            'cluster_id': int(cluster_id),
            'total_products': cluster_size,
            'fake_products': fake_count,
            'real_products': real_count,
            'fake_percentage': round(fake_percentage, 2),
            'statistics': stats,
            'risk_assessment': 'High' if fake_percentage > 15 else 'Medium' if fake_percentage > 5 else 'Low',
            'top_suspicious_products': []
        }
        
        # Get top suspicious products (limit to reasonable number for large clusters)
        if cluster_size > 0:
            n_suspicious = min(10, len(cluster_data))
            top_suspicious = cluster_data.nlargest(n_suspicious, 'fake_score')
            for _, product in top_suspicious.iterrows():
                cluster_analysis['top_suspicious_products'].append({
                    'product_id': int(product['product_ID']),
                    'fake_score': round(float(product['fake_score']), 4),
                    'is_fake': int(product['fake']),
                    'n_reviews': int(product['n_of_reviews']),
                    'avg_rating': round(float(product['avg_review_rating']), 3)
                })
        
        # Add cluster size category for better analysis
        if cluster_size < 100:
            size_category = 'Small'
        elif cluster_size < 1000:
            size_category = 'Medium'
        elif cluster_size < 5000:
            size_category = 'Large'
        else:
            size_category = 'Very Large'
        
        cluster_analysis['size_category'] = size_category
        cluster_analysis['percentile_rank_fake'] = 0  # Will be calculated later
        
        comprehensive_analysis['cluster_details'][f'cluster_{cluster_id}'] = cluster_analysis
        cluster_stats.append({
            'cluster_id': cluster_id,
            'fake_percentage': fake_percentage,
            'size': cluster_size,
            'avg_fake_score': cluster_analysis['statistics']['avg_fake_score']
        })
        
        # Clean up memory by removing processed cluster data
        del cluster_data
        cluster_data_collectors[cluster_id] = None
    
    # Calculate percentile ranks for fake percentages
    fake_percentages = [stats['fake_percentage'] for stats in cluster_stats]
    for i, cluster_stat in enumerate(cluster_stats):
        cluster_id = cluster_stat['cluster_id']
        percentile = (sorted(fake_percentages).index(cluster_stat['fake_percentage']) + 1) / len(fake_percentages) * 100
        comprehensive_analysis['cluster_details'][f'cluster_{cluster_id}']['percentile_rank_fake'] = round(percentile, 1)
    
    # Enhanced comparative analysis for large dataset
    cluster_stats_df = pd.DataFrame(cluster_stats)
    
    comprehensive_analysis['comparative_analysis'] = {
        'highest_risk_cluster': {
            'cluster_id': int(cluster_stats_df.loc[cluster_stats_df['fake_percentage'].idxmax(), 'cluster_id']),
            'fake_percentage': round(float(cluster_stats_df['fake_percentage'].max()), 2)
        },
        'lowest_risk_cluster': {
            'cluster_id': int(cluster_stats_df.loc[cluster_stats_df['fake_percentage'].idxmin(), 'cluster_id']),
            'fake_percentage': round(float(cluster_stats_df['fake_percentage'].min()), 2)
        },
        'largest_cluster': {
            'cluster_id': int(cluster_stats_df.loc[cluster_stats_df['size'].idxmax(), 'cluster_id']),
            'size': int(cluster_stats_df['size'].max())
        },
        'smallest_cluster': {
            'cluster_id': int(cluster_stats_df.loc[cluster_stats_df['size'].idxmin(), 'cluster_id']),
            'size': int(cluster_stats_df['size'].min())
        },
        'cluster_size_distribution': {
            'mean_size': round(float(cluster_stats_df['size'].mean()), 1),
            'median_size': round(float(cluster_stats_df['size'].median()), 1),
            'std_size': round(float(cluster_stats_df['size'].std()), 1),
            'min_size': int(cluster_stats_df['size'].min()),
            'max_size': int(cluster_stats_df['size'].max()),
            'q1_size': int(cluster_stats_df['size'].quantile(0.25)),
            'q3_size': int(cluster_stats_df['size'].quantile(0.75))
        },
        'fake_percentage_distribution': {
            'mean_fake_pct': round(float(cluster_stats_df['fake_percentage'].mean()), 2),
            'median_fake_pct': round(float(cluster_stats_df['fake_percentage'].median()), 2),
            'std_fake_pct': round(float(cluster_stats_df['fake_percentage'].std()), 2),
            'min_fake_pct': round(float(cluster_stats_df['fake_percentage'].min()), 2),
            'max_fake_pct': round(float(cluster_stats_df['fake_percentage'].max()), 2)
        },
        'fake_score_by_cluster': {
            'highest_avg_fake_score_cluster': int(cluster_stats_df.loc[cluster_stats_df['avg_fake_score'].idxmax(), 'cluster_id']),
            'lowest_avg_fake_score_cluster': int(cluster_stats_df.loc[cluster_stats_df['avg_fake_score'].idxmin(), 'cluster_id']),
            'avg_fake_score_overall': round(float(cluster_stats_df['avg_fake_score'].mean()), 4)
        },
        'high_risk_clusters': list(cluster_stats_df[cluster_stats_df['fake_percentage'] > 15]['cluster_id'].astype(int)),
        'medium_risk_clusters': list(cluster_stats_df[(cluster_stats_df['fake_percentage'] > 5) & (cluster_stats_df['fake_percentage'] <= 15)]['cluster_id'].astype(int)),
        'low_risk_clusters': list(cluster_stats_df[cluster_stats_df['fake_percentage'] <= 5]['cluster_id'].astype(int))
    }
    
    # Save comprehensive analysis to JSON
    json_filename = f'{output_dir}/comprehensive_cluster_analysis.json'
    # Convert numpy types to Python native types for JSON serialization
    comprehensive_analysis_clean = convert_numpy_types(comprehensive_analysis)
    with open(json_filename, 'w') as f:
        json.dump(comprehensive_analysis_clean, f, indent=2)
    
    # Clean up memory
    del cluster_data_collectors
    processing_time = (datetime.now() - start_time).total_seconds()
    
    print(f"\nAnalysis complete!")
    print(f"- Created {len(unique_clusters)} cluster CSV files using chunking")
    print(f"- All clusters saved as regular CSV files with complete data")
    print(f"- Saved comprehensive analysis to {json_filename}")
    print(f"- Total processing time: {processing_time:.2f} seconds")
    
    # Print enhanced summary
    print("\n" + "="*60)
    print("MEMORY-EFFICIENT CLUSTER ANALYSIS SUMMARY")
    print("="*60)
    print(f"Dataset Size: {comprehensive_analysis['total_records']:,} products")
    print(f"Total Clusters: {comprehensive_analysis['total_clusters']}")
    print(f"Overall Fake Percentage: {comprehensive_analysis['overall_statistics']['overall_fake_percentage']:.2f}%")
    print(f"Total Fake Products: {comprehensive_analysis['overall_statistics']['total_fake_reviews']:,}")
    print(f"Average Fake Score: {comprehensive_analysis['overall_statistics']['avg_fake_score']:.4f}")
    print(f"Processing Method: Chunked processing (10k rows per chunk)")
    print(f"Memory Usage: Optimized with chunking and cleanup")
    
    print(f"\nCluster Size Distribution:")
    print(f"  Largest Cluster: {comprehensive_analysis['comparative_analysis']['largest_cluster']['cluster_id']} ({comprehensive_analysis['comparative_analysis']['largest_cluster']['size']:,} products)")
    print(f"  Smallest Cluster: {comprehensive_analysis['comparative_analysis']['smallest_cluster']['cluster_id']} ({comprehensive_analysis['comparative_analysis']['smallest_cluster']['size']} products)")
    print(f"  Average Size: {comprehensive_analysis['comparative_analysis']['cluster_size_distribution']['mean_size']:.0f} products")
    print(f"  Median Size: {comprehensive_analysis['comparative_analysis']['cluster_size_distribution']['median_size']:.0f} products")
    
    print(f"\nRisk Assessment:")
    print(f"  Highest Risk Cluster: {comprehensive_analysis['comparative_analysis']['highest_risk_cluster']['cluster_id']} ({comprehensive_analysis['comparative_analysis']['highest_risk_cluster']['fake_percentage']:.2f}% fake)")
    print(f"  Lowest Risk Cluster: {comprehensive_analysis['comparative_analysis']['lowest_risk_cluster']['cluster_id']} ({comprehensive_analysis['comparative_analysis']['lowest_risk_cluster']['fake_percentage']:.2f}% fake)")
    print(f"  High Risk Clusters (>15% fake): {len(comprehensive_analysis['comparative_analysis']['high_risk_clusters'])}")
    print(f"  Medium Risk Clusters (5-15% fake): {len(comprehensive_analysis['comparative_analysis']['medium_risk_clusters'])}")
    print(f"  Low Risk Clusters (<5% fake): {len(comprehensive_analysis['comparative_analysis']['low_risk_clusters'])}")
    
    print(f"\nProcessing completed in cluster_analysis_output/ directory")
    
    return comprehensive_analysis

def create_cluster_summary_csv(output_dir='cluster_analysis_output'):
    """Create a summary CSV with key metrics for each cluster"""
    
    json_file = f'{output_dir}/comprehensive_cluster_analysis.json'
    if not os.path.exists(json_file):
        print("Comprehensive analysis JSON not found. Run analyze_clusters() first.")
        return
    
    with open(json_file, 'r') as f:
        analysis = json.load(f)
    
    # Create summary dataframe
    summary_data = []
    for cluster_key, cluster_data in analysis['cluster_details'].items():
        summary_data.append({
            'cluster_id': cluster_data['cluster_id'],
            'total_products': cluster_data['total_products'],
            'fake_products': cluster_data['fake_products'],
            'fake_percentage': cluster_data['fake_percentage'],
            'risk_assessment': cluster_data['risk_assessment'],
            'size_category': cluster_data['size_category'],
            'percentile_rank_fake': cluster_data['percentile_rank_fake'],
            'avg_fake_score': cluster_data['statistics']['avg_fake_score'],
            'avg_review_rating': cluster_data['statistics']['avg_review_rating'],
            'avg_n_reviews': cluster_data['statistics']['avg_n_reviews'],
            'avg_days_between_reviews': cluster_data['statistics']['avg_days_between_reviews'],
            'avg_pagerank': cluster_data['statistics']['avg_pagerank'],
            'avg_clustering_coef': cluster_data['statistics']['avg_clustering_coef']
        })
    
    summary_df = pd.DataFrame(summary_data)
    summary_df = summary_df.sort_values('cluster_id')
    
    summary_filename = f'{output_dir}/cluster_summary.csv'
    summary_df.to_csv(summary_filename, index=False)
    print(f"Cluster summary saved to {summary_filename}")
    
    return summary_df

# Main execution
if __name__ == "__main__":
    # Check if file exists
    input_file = 'producttrust64k.csv'
    if not os.path.exists(input_file):
        # Try the product_clean directory as fallback
        input_file = 'product_clean/producttrust64k.csv'
        if not os.path.exists(input_file):
            print(f"Error: File not found at {input_file}")
            print("Please make sure the producttrust64k.csv file exists in the root directory or product_clean/ directory.")
            print("Current directory:", os.getcwd())
            exit(1)
    
    # Run the analysis
    print("Starting comprehensive cluster analysis for large dataset...")
    print("This may take several minutes for 64k rows...")
    analysis_results = analyze_clusters(input_file)
    
    if analysis_results:
        # Create summary CSV
        print("\nCreating cluster summary...")
        summary_df = create_cluster_summary_csv()
        
        print("\n" + "="*60)
        print("ANALYSIS COMPLETE!")
        print("="*60) 
        print("Generated files in 'cluster_analysis_output/' directory:")
        print("  - cluster_X_data.csv (complete cluster data for each cluster)")
        print("  - comprehensive_cluster_analysis.json (detailed analysis)")
        print("  - cluster_summary.csv (summary table)")
        print("\nAll cluster CSV files contain complete data - no sampling or compression!")
        print("Ready for further analysis and visualization!")
    else:
        print("Analysis failed. Please check the file path and format.")