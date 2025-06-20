import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Download, 
  Maximize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  Target,
  Network,
  Info
} from 'lucide-react';

const ClusterNetworkGraph = () => {
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [clusters, setClusters] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  const [viewMode, setViewMode] = useState('clusters');
  const [connectionType, setConnectionType] = useState('trust');
  const [isLayoutRunning, setIsLayoutRunning] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [graphStats, setGraphStats] = useState({});
  const [currentView, setCurrentView] = useState('summary');
  const [selectedClusterData, setSelectedClusterData] = useState(null);
  const [error, setError] = useState(null);
  const [comprehensiveData, setComprehensiveData] = useState(null);
  
  // Enhanced color palette for clusters with risk-based colors
  const getClusterColor = (clusterId, fakePercentage = 0) => {
    const baseColors = {
      0: '#4CAF50',   // Green
      1: '#2196F3',   // Blue  
      2: '#FF5722',   // Deep Orange (high risk)
      3: '#9C27B0',   // Purple
      4: '#FF9800',   // Orange
      5: '#00BCD4',   // Cyan
      6: '#795548',   // Brown
      7: '#F44336',   // Red (high risk)
      8: '#607D8B',   // Blue Grey
      9: '#8BC34A',   // Light Green
      10: '#FFC107',  // Amber
      11: '#E91E63',  // Pink
      12: '#009688',  // Teal
      13: '#673AB7',  // Deep Purple
      14: '#FF6F00',  // Orange
      15: '#3F51B5',  // Indigo
      16: '#CDDC39',  // Lime
      17: '#00E676',  // Green
      18: '#1565C0',  // Blue
      19: '#D32F2F',  // Red (100% fake)
    };
    
    // Apply risk-based intensity
    const baseColor = baseColors[clusterId] || '#9E9E9E';
    if (fakePercentage > 50) {
      return '#D32F2F'; // High risk - Red
    } else if (fakePercentage > 15) {
      return '#FF5722'; // Medium-high risk - Deep Orange
    } else if (fakePercentage > 5) {
      return '#FF9800'; // Medium risk - Orange
    }
    return baseColor; // Low risk - Original color
  };

  // Parse CSV data
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index].trim();
        });
        data.push(row);
      }
    }
    return data;
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadProgress(10);
      
      // Load comprehensive JSON data first
      const jsonResponse = await fetch('/cluster_analysis_output/comprehensive_cluster_analysis.json');
      if (!jsonResponse.ok) {
        throw new Error(`Failed to load JSON data: ${jsonResponse.status}`);
      }
      const jsonData = await jsonResponse.json();
      setComprehensiveData(jsonData);
      
      setLoadProgress(50);
      
      // Load cluster summary CSV
      const summaryResponse = await fetch('/cluster_analysis_output/cluster_summary.csv');
      if (!summaryResponse.ok) {
        throw new Error(`Failed to load cluster summary: ${summaryResponse.status}`);
      }
      const summaryText = await summaryResponse.text();
      
      setLoadProgress(80);
      
      const summaryData = parseCSV(summaryText);
      const clusterInfo = {};
      
      summaryData.forEach(row => {
        if (row.cluster_id !== undefined) {
          const clusterId = parseInt(row.cluster_id);
          clusterInfo[clusterId] = {
            total_products: parseInt(row.total_products),
            fake_products: parseInt(row.fake_products),
            fake_percentage: parseFloat(row.fake_percentage),
            risk_assessment: row.risk_assessment,
            size_category: row.size_category,
            avg_fake_score: parseFloat(row.avg_fake_score),
            avg_review_rating: parseFloat(row.avg_review_rating),
            avg_n_reviews: parseFloat(row.avg_n_reviews),
            avg_days_between_reviews: parseFloat(row.avg_days_between_reviews),
            avg_pagerank: parseFloat(row.avg_pagerank),
            avg_clustering_coef: parseFloat(row.avg_clustering_coef),
            percentile_rank_fake: parseFloat(row.percentile_rank_fake)
          };
        }
      });
      
      setClusters(Object.keys(clusterInfo).map(id => parseInt(id)).sort((a, b) => a - b));
      setLoadProgress(90);
      
      // Create cluster summary visualization
      processClusterSummaryData(clusterInfo);
      setLoadProgress(100);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError(`Failed to load data: ${error.message}`);
      setIsLoading(false);
    }
  };

  const loadIndividualCluster = async (clusterId) => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadProgress(10);
      setCurrentView('cluster');
      
      // Load individual cluster CSV data
      const clusterResponse = await fetch(`/cluster_analysis_output/cluster_${clusterId}_data.csv`);
      if (!clusterResponse.ok) {
        throw new Error(`Failed to load cluster ${clusterId} data: ${clusterResponse.status}`);
      }
      const clusterText = await clusterResponse.text();
      
      setLoadProgress(50);
      
      const data = parseCSV(clusterText);
      const filteredData = data.filter(row => row.product_ID && row.product_ID.trim());
      
      setLoadProgress(80);
      setSelectedClusterData({ clusterId, data: filteredData });
      processIndividualClusterData(clusterId, filteredData);
      setLoadProgress(100);
    } catch (error) {
      console.error('Error loading individual cluster:', error);
      setError(`Failed to load cluster ${clusterId} data: ${error.message}`);
      setIsLoading(false);
    }
  };

  const processClusterSummaryData = (clusterInfo) => {
    console.log(`Processing cluster summary with ${Object.keys(clusterInfo).length} clusters...`);
    
    const nodes = [];
    const edges = [];
    
    // Create cluster nodes
    Object.keys(clusterInfo).forEach(clusterId => {
      const cluster = clusterInfo[clusterId];
      
      const clusterNodeId = `cluster_${clusterId}`;
      const color = getClusterColor(parseInt(clusterId), cluster.fake_percentage);
      
      // Calculate node size based on total products (logarithmic scale for better visualization)
      const nodeSize = Math.max(15, Math.min(80, Math.log(cluster.total_products + 1) * 8));
      
      nodes.push({
        id: clusterNodeId,
        label: `Cluster ${clusterId}`,
        x: Math.random() * 800 - 400,
        y: Math.random() * 600 - 300,
        size: nodeSize,
        color: color,
        nodeType: 'cluster',
        clusterId: parseInt(clusterId),
        totalProducts: cluster.total_products,
        fakeProducts: cluster.fake_products,
        fakePercentage: cluster.fake_percentage,
        riskAssessment: cluster.risk_assessment,
        sizeCategory: cluster.size_category,
        avgFakeScore: cluster.avg_fake_score,
        avgReviewRating: cluster.avg_review_rating,
        avgNReviews: cluster.avg_n_reviews,
        avgDaysBetweenReviews: cluster.avg_days_between_reviews,
        avgPagerank: cluster.avg_pagerank,
        avgClusteringCoef: cluster.avg_clustering_coef,
        percentileRankFake: cluster.percentile_rank_fake
      });
    });

    // Add edges between clusters based on similarity
    const clusterIds = Object.keys(clusterInfo);
    clusterIds.forEach((clusterId1, i) => {
      clusterIds.slice(i + 1).forEach(clusterId2 => {
        const cluster1 = clusterInfo[clusterId1];
        const cluster2 = clusterInfo[clusterId2];
        
        // Connect clusters based on multiple similarity factors
        const riskDiff = Math.abs(cluster1.fake_percentage - cluster2.fake_percentage);
        const ratingDiff = Math.abs(cluster1.avg_review_rating - cluster2.avg_review_rating);
        const sizeSimilarity = cluster1.size_category === cluster2.size_category;
        
        // Create connection if clusters are similar
        let shouldConnect = false;
        let connectionStrength = 0;
        
        if (riskDiff < 10 && ratingDiff < 1.0) {
          shouldConnect = true;
          connectionStrength = Math.max(0.3, 1 - (riskDiff / 20) - (ratingDiff / 2));
        } else if (sizeSimilarity && cluster1.total_products > 1000 && cluster2.total_products > 1000) {
          shouldConnect = true;
          connectionStrength = 0.4;
        } else if (cluster1.risk_assessment === cluster2.risk_assessment && cluster1.risk_assessment === 'High') {
          shouldConnect = true;
          connectionStrength = 0.8;
        }
        
        if (shouldConnect) {
          edges.push({
            id: `edge_${clusterId1}_${clusterId2}`,
            source: `cluster_${clusterId1}`,
            target: `cluster_${clusterId2}`,
            type: 'cluster',
            weight: connectionStrength,
            size: Math.max(1, connectionStrength * 4),
            color: cluster1.risk_assessment === 'High' || cluster2.risk_assessment === 'High' ? '#FF5722' : '#B0BEC5'
          });
        }
      });
    });

    // Calculate graph statistics
    const stats = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      clusterNodes: Object.keys(clusterInfo).length,
      productNodes: 0,
      clusters: Object.keys(clusterInfo).length,
      highRiskClusters: Object.values(clusterInfo).filter(c => c.risk_assessment === 'High').length,
      totalProducts: Object.values(clusterInfo).reduce((sum, c) => sum + c.total_products, 0),
      totalFakeProducts: Object.values(clusterInfo).reduce((sum, c) => sum + c.fake_products, 0)
    };
    setGraphStats(stats);

    setGraphData({ nodes, edges });
    setIsLoading(false);
  };

  const processIndividualClusterData = (clusterId, data) => {
    console.log(`Processing individual cluster ${clusterId} with ${data.length} products...`);
    
    const nodes = [];
    const edges = [];
    
    // Add products as nodes
    data.forEach((product, index) => {
      const productId = `product_${product.product_ID}`;
      const isFake = product.fake === '1';
      const fakeScore = parseFloat(product.fake_score) || 0;
      const avgRating = parseFloat(product.avg_review_rating) || 0;
      const nReviews = parseInt(product.n_of_reviews) || 0;
      
      // Arrange products in a grid-like circular layout
      const angle = (index / data.length) * 2 * Math.PI;
      const radius = Math.min(250, Math.max(100, data.length * 2));
      const variation = Math.random() * 50 - 25; // Add some randomness
      
      // Calculate node size based on fake score and review count
      const nodeSize = Math.max(6, Math.min(25, (fakeScore * 30) + (Math.log(nReviews + 1) * 2) + 8));
      
      nodes.push({
        id: productId,
        label: `Product ${product.product_ID}`,
        x: Math.cos(angle) * radius + variation,
        y: Math.sin(angle) * radius + variation,
        size: nodeSize,
        color: isFake ? '#F44336' : '#4CAF50',
        nodeType: 'product',
        clusterId: parseInt(clusterId),
        productId: product.product_ID,
        isFake: isFake,
        fakeScore: fakeScore,
        avgRating: avgRating,
        numReviews: nReviews,
        pagerank: parseFloat(product.pagerank) || 0,
        eigenvectorCent: parseFloat(product.eigenvector_cent) || 0,
        clusteringCoef: parseFloat(product.clustering_coef) || 0,
        wDegree: parseFloat(product.w_degree) || 0,
        avgDaysBetweenReviews: parseFloat(product.avg_days_between_reviews) || 0,
        maxDaysBetweenReviews: parseFloat(product.max_days_between_reviews) || 0,
        minDaysBetweenReviews: parseFloat(product.min_days_between_reviews) || 0
      });
    });

    // Add connections between products
    addProductConnections(nodes, edges, data, connectionType);

    // Calculate graph statistics
    const fakeCount = data.filter(p => p.fake === '1').length;
    const stats = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      clusterNodes: 0,
      productNodes: data.length,
      clusters: 1,
      currentCluster: clusterId,
      fakeProducts: fakeCount,
      realProducts: data.length - fakeCount,
      fakePercentage: ((fakeCount / data.length) * 100).toFixed(2),
      avgFakeScore: (data.reduce((sum, p) => sum + (parseFloat(p.fake_score) || 0), 0) / data.length).toFixed(4),
      avgRating: (data.reduce((sum, p) => sum + (parseFloat(p.avg_review_rating) || 0), 0) / data.length).toFixed(2)
    };
    setGraphStats(stats);

    setGraphData({ nodes, edges });
    setIsLoading(false);
  };

  const addProductConnections = (nodes, edges, products, connectionType) => {
    // Limit connections for performance - use a subset for large clusters
    const maxNodes = Math.min(products.length, 200);
    const limitedProducts = products.slice(0, maxNodes);
    
    // Connect products based on similarity
    limitedProducts.forEach((product1, i) => {
      // Limit connections per product to avoid overcrowding
      const maxConnectionsPerProduct = Math.min(8, limitedProducts.length - i - 1);
      const potentialConnections = limitedProducts.slice(i + 1, i + 1 + maxConnectionsPerProduct);
      
      potentialConnections.forEach(product2 => {
        const product1Id = `product_${product1.product_ID}`;
        const product2Id = `product_${product2.product_ID}`;
        
        let shouldConnect = false;
        let connectionStrength = 0;
        
        switch (connectionType) {
          case 'trust':
            const fakeScore1 = parseFloat(product1.fake_score) || 0;
            const fakeScore2 = parseFloat(product2.fake_score) || 0;
            const trustSimilarity = 1 - Math.abs(fakeScore1 - fakeScore2);
            shouldConnect = trustSimilarity > 0.8;
            connectionStrength = trustSimilarity;
            break;
            
          case 'review':
            const rating1 = parseFloat(product1.avg_review_rating) || 0;
            const rating2 = parseFloat(product2.avg_review_rating) || 0;
            const ratingDiff = Math.abs(rating1 - rating2);
            shouldConnect = ratingDiff < 1.0;
            connectionStrength = Math.max(0.1, 1 - (ratingDiff / 5));
            break;
            
          case 'cluster':
            // Connect based on network properties
            const pagerank1 = parseFloat(product1.pagerank) || 0;
            const pagerank2 = parseFloat(product2.pagerank) || 0;
            const pagerankSimilarity = 1 - Math.abs(pagerank1 - pagerank2) / Math.max(pagerank1, pagerank2, 0.001);
            shouldConnect = pagerankSimilarity > 0.7 || Math.random() < 0.2;
            connectionStrength = Math.max(0.3, pagerankSimilarity);
            break;
        }
        
        if (shouldConnect) {
          const edgeColor = (product1.fake === '1' && product2.fake === '1') ? '#FF5722' : 
                           (product1.fake === '0' && product2.fake === '0') ? '#4CAF50' : '#FFC107';
          
          edges.push({
            id: `edge_${product1Id}_${product2Id}`,
            source: product1Id,
            target: product2Id,
            type: 'product',
            weight: connectionStrength,
            size: Math.max(0.5, connectionStrength * 3),
            color: edgeColor
          });
        }
      });
    });
  };

  const handleNodeClick = (nodeId) => {
    if (!graphData) return;
    
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    if (node.nodeType === 'cluster' && currentView === 'summary') {
      setSelectedCluster(node.clusterId.toString());
      loadIndividualCluster(node.clusterId);
    } else if (node.nodeType === 'cluster') {
      highlightCluster(node.clusterId);
    }
    
    setTooltip({
      visible: true,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      data: node
    });
  };

  const handleNodeHover = (nodeId, event) => {
    if (!graphData) return;
    
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setTooltip({
      visible: true,
      x: event?.clientX || window.innerWidth / 2,
      y: event?.clientY || window.innerHeight / 2,
      data: node
    });
  };

  const highlightCluster = (clusterId) => {
    if (!graphData) return;
    
    const updatedNodes = graphData.nodes.map(node => ({
      ...node,
      highlighted: node.clusterId === clusterId,
      size: node.clusterId === clusterId ? node.size * 1.5 : node.size * 0.7
    }));
    
    setGraphData({ ...graphData, nodes: updatedNodes });
  };

  const resetView = () => {
    if (graphData) {
      const updatedNodes = graphData.nodes.map(node => ({
        ...node,
        highlighted: false,
        size: node.originalSize || node.size
      }));
      setGraphData({ ...graphData, nodes: updatedNodes });
    }
    setSelectedCluster('all');
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  };

  const backToSummary = () => {
    setCurrentView('summary');
    setSelectedCluster('all');
    setSelectedClusterData(null);
    loadInitialData();
  };

  // Simple D3-like force simulation for layout
  const applyForceLayout = useCallback(() => {
    if (!graphData || !graphData.nodes) return;

    const nodes = [...graphData.nodes];
    const edges = graphData.edges || [];
    
    // Simple force simulation
    for (let iteration = 0; iteration < 100; iteration++) {
      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = Math.min(2000, 5000 / (distance * distance));
          
          nodes[i].x -= (dx / distance) * force;
          nodes[i].y -= (dy / distance) * force;
          nodes[j].x += (dx / distance) * force;
          nodes[j].y += (dy / distance) * force;
        }
      }
      
      // Attraction along edges
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDistance = currentView === 'summary' ? 100 : 80;
          const force = (distance - targetDistance) * 0.02;
          
          source.x += (dx / distance) * force;
          source.y += (dy / distance) * force;
          target.x -= (dx / distance) * force;
          target.y -= (dy / distance) * force;
        }
      });
      
      // Center gravity
      const centerX = 0, centerY = 0;
      nodes.forEach(node => {
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.x += dx * 0.005;
        node.y += dy * 0.005;
      });
    }
    
    setGraphData({ ...graphData, nodes });
  }, [graphData, currentView]);

  // Apply layout when graph data changes
  useEffect(() => {
    if (graphData && graphData.nodes && graphData.nodes.length > 0) {
      const timer = setTimeout(() => {
        applyForceLayout();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [graphData, applyForceLayout]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Make sure the CSV files are available at: /cluster_analysis_output/
          </p>
          <button
            onClick={() => {
              setError(null);
              if (currentView === 'summary') {
                loadInitialData();
              } else {
                loadIndividualCluster(selectedCluster);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentView === 'summary' ? 'Loading Cluster Summary' : `Loading Cluster ${selectedCluster} Products`}
          </h3>
          <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{loadProgress}% Complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-gray-50 overflow-hidden">
      {/* Controls Panel */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Network size={16} />
              Network Controls
            </h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff size={16} />
            </button>
          </div>
          
          {/* Current View Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800">
              Current View: {currentView === 'summary' ? 'Cluster Summary' : `Cluster ${selectedCluster} Products`}
            </div>
            {currentView === 'cluster' && (
              <button
                onClick={backToSummary}
                className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                ← Back to Summary
              </button>
            )}
          </div>

          {/* Connection Type - Only show for individual cluster view */}
          {currentView === 'cluster' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Connections</label>
              <select
                value={connectionType}
                onChange={(e) => {
                  setConnectionType(e.target.value);
                  if (selectedClusterData) {
                    processIndividualClusterData(selectedClusterData.clusterId, selectedClusterData.data);
                  }
                }}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="trust">Trust Similarity</option>
                <option value="review">Review Similarity</option>
                <option value="cluster">Network Properties</option>
              </select>
            </div>
          )}

          {/* Cluster Filter - Only show for summary view */}
          {currentView === 'summary' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlight Cluster</label>
              <select
                value={selectedCluster}
                onChange={(e) => {
                  setSelectedCluster(e.target.value);
                  if (e.target.value !== 'all') {
                    highlightCluster(parseInt(e.target.value));
                  } else {
                    resetView();
                  }
                }}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Clusters</option>
                {clusters.map(clusterId => (
                  <option key={clusterId} value={clusterId}>
                    Cluster {clusterId}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Graph Stats */}
          <div className="text-xs text-gray-600 space-y-1 border-t pt-3">
            <div className="font-medium text-gray-800 mb-2">Statistics</div>
            <div>Nodes: {graphStats.totalNodes}</div>
            <div>Edges: {graphStats.totalEdges}</div>
            {currentView === 'summary' ? (
              <>
                <div>Clusters: {graphStats.clusters}</div>
                <div>High Risk: {graphStats.highRiskClusters}</div>
                <div>Total Products: {graphStats.totalProducts?.toLocaleString()}</div>
                <div>Fake Products: {graphStats.totalFakeProducts?.toLocaleString()}</div>
              </>
            ) : (
              <>
                <div>Products: {graphStats.productNodes}</div>
                <div>Cluster: {graphStats.currentCluster}</div>
                <div>Fake: {graphStats.fakeProducts} ({graphStats.fakePercentage}%)</div>
                <div>Real: {graphStats.realProducts}</div>
                <div>Avg Fake Score: {graphStats.avgFakeScore}</div>
                <div>Avg Rating: {graphStats.avgRating}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {!showControls && (
          <button
            onClick={() => setShowControls(true)}
            className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
            title="Show Controls"
          >
            <Eye size={20} />
          </button>
        )}
        <button
          onClick={resetView}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
          title="Reset View"
        >
          <Target size={20} />
        </button>
      </div>

      {/* Main Graph Container */}
      <div className="w-full h-full relative">
        <svg
          width="100%"
          height="100%"
          style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}
          onClick={() => setTooltip({ visible: false, x: 0, y: 0, data: null })}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
          
          {/* Render edges */}
          {graphData && graphData.edges && graphData.edges.map(edge => {
            const source = graphData.nodes.find(n => n.id === edge.source);
            const target = graphData.nodes.find(n => n.id === edge.target);
            
            if (!source || !target) return null;
            
            return (
              <line
                key={edge.id}
                x1={source.x + 400}
                y1={source.y + 300}
                x2={target.x + 400}
                y2={target.y + 300}
                stroke={edge.color}
                strokeWidth={edge.size}
                strokeOpacity={0.6}
                strokeLinecap="round"
              />
            );
          })}
          
          {/* Render nodes */}
          {graphData && graphData.nodes && graphData.nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x + 400}
                cy={node.y + 300}
                r={node.size}
                fill={node.color}
                stroke={node.highlighted ? '#FFD700' : '#fff'}
                strokeWidth={node.highlighted ? 3 : 2}
                style={{ 
                  cursor: 'pointer',
                  filter: node.highlighted ? 'url(#glow)' : 'url(#shadow)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.id);
                }}
                onMouseEnter={(e) => handleNodeHover(node.id, e)}
                onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, data: null })}
              />
              
              {/* Node labels */}
              <text
                x={node.x + 400}
                y={node.y + 300 + node.size + 15}
                textAnchor="middle"
                fill="#333"
                fontSize={currentView === 'summary' ? "12" : "9"}
                fontWeight="500"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {currentView === 'summary' ? `C${node.clusterId}` : `P${node.productId}`}
              </text>
              
              {/* Risk indicator for high-risk clusters */}
              {node.nodeType === 'cluster' && node.riskAssessment === 'High' && (
                <text
                  x={node.x + 400 + node.size - 5}
                  y={node.y + 300 - node.size + 8}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="10"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  ⚠
                </text>
              )}
              
              {/* Fake indicator for fake products */}
              {node.nodeType === 'product' && node.isFake && (
                <text
                  x={node.x + 400}
                  y={node.y + 300 + 3}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="8"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  ✗
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="font-semibold text-gray-800 mb-2">Legend</div>
        {currentView === 'summary' ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Low Risk Cluster</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Medium Risk Cluster</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>High Risk Cluster</span>
            </div>
            <div className="text-gray-600 mt-2">
              Size = Product Count<br/>
              ⚠ = High Risk<br/>
              Click to explore
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Real Product</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Fake Product</span>
            </div>
            <div className="text-gray-600 mt-2">
              Size = Fake Score + Reviews<br/>
              ✗ = Confirmed Fake<br/>
              Connection = {connectionType}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.data && (
        <div
          className="fixed z-20 bg-black text-white text-xs rounded-lg p-3 pointer-events-none max-w-xs"
          style={{
            left: Math.min(tooltip.x + 10, window.innerWidth - 250),
            top: Math.max(tooltip.y - 100, 10),
          }}
        >
          {tooltip.data.nodeType === 'cluster' ? (
            <div>
              <div className="font-semibold text-yellow-300">{tooltip.data.label}</div>
              <div className="mt-1 space-y-1">
                <div>Total Products: <span className="text-blue-300">{tooltip.data.totalProducts.toLocaleString()}</span></div>
                <div>Fake Products: <span className="text-red-300">{tooltip.data.fakeProducts.toLocaleString()}</span></div>
                <div>Fake Rate: <span className="text-orange-300">{tooltip.data.fakePercentage.toFixed(2)}%</span></div>
                <div>Risk Level: <span className={`${tooltip.data.riskAssessment === 'High' ? 'text-red-300' : 
                  tooltip.data.riskAssessment === 'Medium' ? 'text-orange-300' : 'text-green-300'}`}>
                  {tooltip.data.riskAssessment}
                </span></div>
                <div>Size Category: <span className="text-purple-300">{tooltip.data.sizeCategory}</span></div>
                <div>Avg Rating: <span className="text-green-300">{tooltip.data.avgReviewRating?.toFixed(2)}</span></div>
                <div>Avg Reviews: <span className="text-blue-300">{Math.round(tooltip.data.avgNReviews)}</span></div>
              </div>
              {currentView === 'summary' && (
                <div className="text-yellow-300 text-xs mt-2 font-medium">💡 Click to explore products</div>
              )}
            </div>
          ) : (
            <div>
              <div className="font-semibold text-yellow-300">{tooltip.data.label}</div>
              <div className="mt-1 space-y-1">
                <div>Status: <span className={tooltip.data.isFake ? 'text-red-300' : 'text-green-300'}>
                  {tooltip.data.isFake ? 'FAKE' : 'REAL'}
                </span></div>
                <div>Fake Score: <span className="text-orange-300">{tooltip.data.fakeScore.toFixed(4)}</span></div>
                <div>Rating: <span className="text-green-300">{tooltip.data.avgRating.toFixed(2)}</span></div>
                <div>Reviews: <span className="text-blue-300">{tooltip.data.numReviews.toLocaleString()}</span></div>
                <div>PageRank: <span className="text-purple-300">{tooltip.data.pagerank.toExponential(2)}</span></div>
                <div>Clustering: <span className="text-cyan-300">{tooltip.data.clusteringCoef?.toFixed(3)}</span></div>
                <div>Network Degree: <span className="text-indigo-300">{tooltip.data.wDegree}</span></div>
                {tooltip.data.avgDaysBetweenReviews > 0 && (
                  <div>Avg Days Between Reviews: <span className="text-yellow-300">{tooltip.data.avgDaysBetweenReviews.toFixed(1)}</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Info Panel */}
      {comprehensiveData && (
        <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 text-xs max-w-xs">
          <div className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
            <Info size={14} />
            Dataset Info
          </div>
          <div className="space-y-1 text-gray-600">
            <div>Total Records: {comprehensiveData.total_records?.toLocaleString()}</div>
            <div>Total Clusters: {comprehensiveData.total_clusters}</div>
            <div>Overall Fake Rate: {comprehensiveData.overall_statistics?.overall_fake_percentage?.toFixed(2)}%</div>
            <div>Avg Rating: {comprehensiveData.overall_statistics?.avg_review_rating?.toFixed(2)}</div>
            <div>Avg Reviews: {Math.round(comprehensiveData.overall_statistics?.avg_number_of_reviews)}</div>
            <div className="text-xs text-gray-500 mt-2">
              Updated: {new Date(comprehensiveData.analysis_timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusterNetworkGraph;