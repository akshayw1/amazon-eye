# 🔍 Amazon Eye - Cluster Graph Visualization

## 📁 Files Generated
- `cluster_graph_viewer.html` - Interactive visualization
- `cluster_summary.csv` - Cluster overview data  
- `cluster_0_data.csv` to `cluster_19_data.csv` - Individual cluster product data
- `comprehensive_cluster_analysis.json` - Detailed analysis

## 🚀 How to Use

### 1. Open the Visualization
```bash
# Navigate to the cluster analysis output directory
cd cluster_analysis_output

# Open the HTML file in your browser
open cluster_graph_viewer.html
# OR double-click on cluster_graph_viewer.html
```

### 2. Two-Level Interactive Graph

#### **Level 1: Cluster Overview**
- **Nodes**: Each circle represents a cluster (C0, C1, C2, etc.)
- **Size**: Larger circles = more products in cluster
- **Color**: 
  - 🟢 **Green** = Low Risk (<5% fake)
  - 🟡 **Yellow** = Medium Risk (5-15% fake)  
  - 🔴 **Red** = High Risk (>15% fake)
- **Click**: Click any cluster to drill down to products

#### **Level 2: Product Details**
- **Nodes**: Each dot represents a product within the cluster
- **Size**: Based on number of reviews
- **Color**:
  - 🟢 **Green** = Real product
  - 🔴 **Red** = Fake product
- **Hover**: See product details (ID, fake score, rating, etc.)

## ✨ Features

### 🎯 **Interactive Controls**
- **Cluster Overview** / **Product Details** buttons
- **Reset View** - Return to cluster overview
- **Search Bar** - Find specific clusters or products
- **Breadcrumb Navigation** - Track where you are

### 🔍 **Visual Elements**
- **Zoom & Pan** - Mouse wheel to zoom, drag to pan
- **Drag Nodes** - Click and drag any node
- **Tooltips** - Hover over nodes for detailed info
- **Force Simulation** - Nodes repel each other naturally

### 📊 **Information Panel**
- Total clusters, products, fake products
- Overall fake percentage
- Real-time updates based on current view

## 🎨 **Color Legend**
- **Green Clusters/Products**: Low risk / Real products
- **Yellow Clusters**: Medium risk (5-15% fake)
- **Red Clusters/Products**: High risk / Fake products

## 📈 **Data Insights**

From your analysis, you can see:
- **20 clusters** total
- **64,585 products** analyzed
- **High-risk clusters**: 2, 7, 19 (>15% fake)
- **Largest cluster**: 18 (10,444 products)
- **Most suspicious**: Cluster 19 (100% fake, but only 16 products)

## 🔧 **Technical Details**
- Built with **D3.js** for smooth interactions
- Handles up to **1,000 products** per cluster visualization
- Force-directed layout for natural node positioning
- Responsive design works on all screen sizes

## 💡 **Tips**
1. **Start with Cluster Overview** to see the big picture
2. **Click suspicious clusters** (red/yellow) to investigate
3. **Use search** to find specific product IDs
4. **Zoom in** when viewing products for better detail
5. **Drag nodes** to organize the layout as you prefer

Enjoy exploring your Amazon product trust data! 🚀 