import React, { useEffect, useRef, useState, useCallback } from 'react';
import Sigma from 'sigma';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import Papa from 'papaparse';
import { Download, Maximize2, RotateCcw, ZoomIn, ZoomOut, Play, Pause, Settings } from 'lucide-react';

const NetworkGraphOptimized = () => {
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [clusters, setClusters] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  const [datasetSize, setDatasetSize] = useState('small'); // 'small' or 'large'
  const [renderMode, setRenderMode] = useState('cluster'); // 'cluster', 'sample', 'full'
  const [sampleSize, setSampleSize] = useState(1000);
  const [isLayoutRunning, setIsLayoutRunning] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // Color palette for different clusters
  const clusterColors = {
    0: '#FF6B6B',   // Red
    1: '#4ECDC4',   // Teal  
    2: '#45B7D1',   // Blue
    3: '#96CEB4',   // Green
    4: '#FECA57',   // Yellow
    5: '#FF9FF3',   // Pink
    6: '#54A0FF',   // Light Blue
    7: '#5F27CD',   // Purple
    8: '#00D2D3',   // Cyan
    9: '#FF9F43',   // Orange
    default: '#9B59B6' // Default Purple
  };

  useEffect(() => {
    // Auto-select dataset based on size preference
    if (datasetSize === 'large') {
      loadCSVData('producttrust64k.csv');
    } else {
      loadCSVData('selected_120_products.csv');
    }
  }, [datasetSize]);

  const loadCSVData = async (fileName) => {
    try {
      setIsLoading(true);
      setLoadProgress(0);
      
      const response = await fetch(`/product_clean/${fileName}`);
      const csvText = await response.text();
      
      setLoadProgress(30);
      
      Papa.parse(csvText, {
        header: true,
        step: (result, parser) => {
          // Update progress during parsing
          const progress = Math.min(30 + (parser.getCharIndex() / csvText.length) * 40, 70);
          setLoadProgress(progress);
        },
        complete: (results) => {
          const data = results.data.filter(row => row.product_ID && row.product_ID.trim()); 
          setLoadProgress(80);
          processDataOptimized(data);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error loading CSV:', error);
      setIsLoading(false);
    }
  };

  const processDataOptimized = (data) => {
    console.log(`Processing ${data.length} products...`);
    
    const graph = new Graph();
    const clusterMap = new Map();
    
    // Group products by cluster and get unique clusters
    const uniqueClusters = [...new Set(data.map(p => p.cluster_ID))].sort();
    setClusters(uniqueClusters);
    
    data.forEach(product => {
      const clusterId = product.cluster_ID;
      if (!clusterMap.has(clusterId)) {
        clusterMap.set(clusterId, []);
      }
      clusterMap.get(clusterId).push(product);
    });

    let processedData = data;
    
    // Apply rendering strategy based on data size and mode
    if (data.length > 5000) {
      switch (renderMode) {
        case 'sample':
          processedData = sampleData(data, sampleSize);
          break;
        case 'cluster':
          processedData = clusterAggregation(clusterMap);
          break;
        case 'full':
          processedData = data; // Use full dataset
          break;
      }
    }

    // Add nodes
    processedData.forEach((product, index) => {
      const nodeId = product.product_ID || `cluster_${product.cluster_ID}`;
      const clusterId = product.cluster_ID;
      const color = clusterColors[clusterId] || clusterColors.default;
      
      // Calculate node size based on importance
      const pagerank = parseFloat(product.pagerank) || 0;
      const wDegree = parseFloat(product.w_degree) || 0;
      let size;
      
      if (renderMode === 'cluster' && product.isClusterNode) {
        size = Math.max(8, Math.min(30, Math.log(product.nodeCount) * 3));
      } else {
        size = Math.max(2, Math.min(15, pagerank * 500 + wDegree / 200));
      }
      
      graph.addNode(nodeId, {
        label: product.isClusterNode ? `Cluster ${clusterId} (${product.nodeCount})` : `Product ${nodeId}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: size,
        color: color,
        clusterId: clusterId,
        pagerank: pagerank,
        eigenvectorCent: parseFloat(product.eigenvector_cent) || 0,
        clusteringCoef: parseFloat(product.clustering_coef) || 0,
        wDegree: wDegree,
        fakeScore: parseFloat(product.fake_score) || 0,
        trustScore: parseFloat(product.trust_score) || (1 - (parseFloat(product.fake_score) || 0)) * 20,
        fake: product.fake === '1',
        avgRating: parseFloat(product.avg_review_rating) || 0,
        numReviews: parseInt(product.n_of_reviews) || 0,
        isClusterNode: product.isClusterNode || false,
        nodeCount: product.nodeCount || 1
      });
    });

    // Add edges with optimization
    if (renderMode === 'cluster') {
      addClusterEdges(graph, clusterMap);
    } else {
      addOptimizedEdges(graph, processedData, Math.min(processedData.length, 2000));
    }

    setLoadProgress(90);

    // Apply layout with performance settings
    const layoutSettings = getLayoutSettings(processedData.length);
    const positions = forceAtlas2(graph, layoutSettings);

    setLoadProgress(100);
    setGraphData(graph);
    setIsLoading(false);
  };

  const sampleData = (data, sampleSize) => {
    // Stratified sampling to maintain cluster distribution
    const clusterSamples = new Map();
    const clusterCounts = new Map();
    
    // Count products per cluster
    data.forEach(product => {
      const cluster = product.cluster_ID;
      clusterCounts.set(cluster, (clusterCounts.get(cluster) || 0) + 1);
    });
    
    // Calculate sample size per cluster
    const totalProducts = data.length;
    clusterCounts.forEach((count, cluster) => {
      const clusterSampleSize = Math.max(1, Math.floor((count / totalProducts) * sampleSize));
      clusterSamples.set(cluster, clusterSampleSize);
    });
    
    // Sample from each cluster
    const sampledData = [];
    const clusterData = new Map();
    
    data.forEach(product => {
      const cluster = product.cluster_ID;
      if (!clusterData.has(cluster)) {
        clusterData.set(cluster, []);
      }
      clusterData.get(cluster).push(product);
    });
    
    clusterData.forEach((products, cluster) => {
      const sampleSize = clusterSamples.get(cluster) || 1;
      const shuffled = products.sort(() => 0.5 - Math.random());
      sampledData.push(...shuffled.slice(0, sampleSize));
    });
    
    return sampledData;
  };

  const clusterAggregation = (clusterMap) => {
    // Create aggregated cluster nodes
    const aggregatedData = [];
    
    clusterMap.forEach((products, clusterId) => {
      if (products.length === 0) return;
      
      // Calculate aggregated metrics
      const avgPagerank = products.reduce((sum, p) => sum + (parseFloat(p.pagerank) || 0), 0) / products.length;
      const avgEigenvector = products.reduce((sum, p) => sum + (parseFloat(p.eigenvector_cent) || 0), 0) / products.length;
      const avgClustering = products.reduce((sum, p) => sum + (parseFloat(p.clustering_coef) || 0), 0) / products.length;
      const totalWDegree = products.reduce((sum, p) => sum + (parseFloat(p.w_degree) || 0), 0);
      const avgFakeScore = products.reduce((sum, p) => sum + (parseFloat(p.fake_score) || 0), 0) / products.length;
      const avgTrustScore = products.reduce((sum, p) => sum + (parseFloat(p.trust_score) || (1 - (parseFloat(p.fake_score) || 0)) * 20), 0) / products.length;
      const fakeCount = products.filter(p => p.fake === '1').length;
      const avgRating = products.reduce((sum, p) => sum + (parseFloat(p.avg_review_rating) || 0), 0) / products.length;
      const totalReviews = products.reduce((sum, p) => sum + (parseInt(p.n_of_reviews) || 0), 0);
      
      aggregatedData.push({
        product_ID: `cluster_${clusterId}`,
        cluster_ID: clusterId,
        pagerank: avgPagerank,
        eigenvector_cent: avgEigenvector,
        clustering_coef: avgClustering,
        w_degree: totalWDegree,
        fake_score: avgFakeScore,
        trust_score: avgTrustScore,
        fake: fakeCount > products.length / 2 ? '1' : '0',
        avg_review_rating: avgRating,
        n_of_reviews: totalReviews,
        isClusterNode: true,
        nodeCount: products.length
      });
    });
    
    return aggregatedData;
  };

  const addOptimizedEdges = (graph, data, maxEdges) => {
    const clusterConnections = new Map();
    let edgeCount = 0;
    
    // Group by cluster for edge creation
    const clusters = new Map();
    data.forEach(product => {
      const cluster = product.cluster_ID;
      if (!clusters.has(cluster)) {
        clusters.set(cluster, []);
      }
      clusters.get(cluster).push(product);
    });
    
    // Add edges within clusters (limited)
    clusters.forEach((products, clusterId) => {
      const maxClusterEdges = Math.min(products.length * 2, 100);
      for (let i = 0; i < products.length && edgeCount < maxEdges; i++) {
        for (let j = i + 1; j < products.length && edgeCount < maxClusterEdges; j++) {
          const product1 = products[i];
          const product2 = products[j];
          
          const weight = calculateEdgeWeight(product1, product2);
          if (weight > 0.3) { // Higher threshold for large datasets
            try {
              graph.addEdge(product1.product_ID, product2.product_ID, {
                weight: weight,
                size: weight * 1.5,
                color: '#E0E0E0'
              });
              edgeCount++;
            } catch (e) {
              // Skip if edge already exists
            }
          }
        }
      }
    });
  };

  const addClusterEdges = (graph, clusterMap) => {
    // Add edges between cluster nodes based on similarity
    const clusterNodes = Array.from(clusterMap.keys());
    
    for (let i = 0; i < clusterNodes.length; i++) {
      for (let j = i + 1; j < clusterNodes.length; j++) {
        const cluster1 = clusterNodes[i];
        const cluster2 = clusterNodes[j];
        
        // Calculate cluster similarity based on average metrics
        const products1 = clusterMap.get(cluster1);
        const products2 = clusterMap.get(cluster2);
        
        if (products1.length > 0 && products2.length > 0) {
          const similarity = calculateClusterSimilarity(products1, products2);
          
          if (similarity > 0.2) {
            try {
              graph.addEdge(`cluster_${cluster1}`, `cluster_${cluster2}`, {
                weight: similarity,
                size: similarity * 3,
                color: '#CCCCCC'
              });
            } catch (e) {
              // Skip if edge already exists
            }
          }
        }
      }
    }
  };

  const calculateClusterSimilarity = (products1, products2) => {
    const avg1 = calculateClusterAverage(products1);
    const avg2 = calculateClusterAverage(products2);
    
    const pageRankSim = 1 - Math.abs(avg1.pagerank - avg2.pagerank);
    const eigenSim = 1 - Math.abs(avg1.eigenvector - avg2.eigenvector);
    const clusteringSim = 1 - Math.abs(avg1.clustering - avg2.clustering);
    
    return (pageRankSim + eigenSim + clusteringSim) / 3;
  };

  const calculateClusterAverage = (products) => {
    return {
      pagerank: products.reduce((sum, p) => sum + (parseFloat(p.pagerank) || 0), 0) / products.length,
      eigenvector: products.reduce((sum, p) => sum + (parseFloat(p.eigenvector_cent) || 0), 0) / products.length,
      clustering: products.reduce((sum, p) => sum + (parseFloat(p.clustering_coef) || 0), 0) / products.length
    };
  };

  const getLayoutSettings = (nodeCount) => {
    if (nodeCount > 10000) {
      return {
        iterations: 30,
        settings: {
          gravity: 0.5,
          scalingRatio: 5,
          strongGravityMode: false,
          barnesHutOptimize: true,
          barnesHutTheta: 0.8
        }
      };
    } else if (nodeCount > 1000) {
      return {
        iterations: 50,
        settings: {
          gravity: 1,
          scalingRatio: 8,
          strongGravityMode: false,
          barnesHutOptimize: true
        }
      };
    } else {
      return {
        iterations: 100,
        settings: {
          gravity: 1,
          scalingRatio: 10,
          strongGravityMode: false,
          barnesHutOptimize: true
        }
      };
    }
  };

  const calculateEdgeWeight = (product1, product2) => {
    const pageRankSim = 1 - Math.abs(parseFloat(product1.pagerank) - parseFloat(product2.pagerank));
    const eigenSim = 1 - Math.abs(parseFloat(product1.eigenvector_cent) - parseFloat(product2.eigenvector_cent));
    const clusteringSim = 1 - Math.abs(parseFloat(product1.clustering_coef) - parseFloat(product2.clustering_coef));
    
    return (pageRankSim + eigenSim + clusteringSim) / 3;
  };

  useEffect(() => {
    if (graphData && containerRef.current && !sigmaRef.current) {
      // Use WebGL renderer for better performance with large datasets
      const rendererType = graphData.order > 1000 ? 'webgl' : 'canvas';
      
      sigmaRef.current = new Sigma(graphData, containerRef.current, {
        renderer: {
          type: rendererType,
          backgroundColor: '#FAFAFA'
        },
        settings: {
          defaultNodeColor: '#999',
          defaultEdgeColor: '#E0E0E0',
          labelColor: '#333',
          labelSize: 12,
          labelThreshold: graphData.order > 1000 ? 10 : 5, // Hide labels on zoom out for performance
          nodeReducer: (node, data) => {
            if (selectedCluster !== 'all' && data.clusterId !== selectedCluster) {
              return { ...data, hidden: true };
            }
            return data;
          },
          edgeReducer: (edge, data) => {
            const sourceNode = graphData.getNodeAttributes(graphData.source(edge));
            const targetNode = graphData.getNodeAttributes(graphData.target(edge));
            
            if (selectedCluster !== 'all' && 
                (sourceNode.clusterId !== selectedCluster || targetNode.clusterId !== selectedCluster)) {
              return { ...data, hidden: true };
            }
            return data;
          }
        }
      });

      // Add hover interactions
      sigmaRef.current.on('enterNode', ({ node }) => {
        const nodeData = graphData.getNodeAttributes(node);
        const mousePos = sigmaRef.current.getMouseCaptor().getLastMousePosition();
        
        setTooltip({
          visible: true,
          x: mousePos.x + 10,
          y: mousePos.y - 10,
          data: nodeData
        });
      });

      sigmaRef.current.on('leaveNode', () => {
        setTooltip({ visible: false, x: 0, y: 0, data: null });
      });
    }
  }, [graphData, selectedCluster]);

  const handleClusterFilter = (clusterId) => {
    setSelectedCluster(clusterId);
    if (sigmaRef.current) {
      sigmaRef.current.refresh();
    }
  };

  const resetCamera = () => {
    if (sigmaRef.current) {
      sigmaRef.current.getCamera().reset();
    }
  };

  const zoomIn = () => {
    if (sigmaRef.current) {
      const camera = sigmaRef.current.getCamera();
      camera.animatedZoom({ duration: 200 });
    }
  };

  const zoomOut = () => {
    if (sigmaRef.current) {
      const camera = sigmaRef.current.getCamera();
      camera.animatedUnzoom({ duration: 200 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Loading network graph...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{loadProgress.toFixed(0)}% Complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative h-full">
      <div className="flex h-full">
        {/* Left Sidebar - 30% width */}
        <div className="w-[30%] border-r border-gray-200 p-4 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Optimized Network Analysis
              {datasetSize === 'large' && <span className="text-sm text-blue-600 ml-2">(64K Dataset)</span>}
            </h3>
            <p className="text-sm text-gray-600">High-performance visualization with smart optimizations</p>
          </div>

          {/* Dataset Controls */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Dataset Size</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Choose Dataset</label>
                <select
                  value={datasetSize}
                  onChange={(e) => setDatasetSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Small Dataset (120 products)</option>
                  <option value="large">Large Dataset (64K products)</option>
                </select>
              </div>
              
              {datasetSize === 'large' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Render Mode</label>
                  <select
                    value={renderMode}
                    onChange={(e) => setRenderMode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cluster">Cluster View (Aggregated)</option>
                    <option value="sample">Sample View (Subset)</option>
                    <option value="full">Full View (All 64K)</option>
                  </select>
                </div>
              )}
              
              {renderMode === 'sample' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sample Size</label>
                  <select
                    value={sampleSize}
                    onChange={(e) => setSampleSize(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={500}>500 products</option>
                    <option value={1000}>1,000 products</option>
                    <option value={2000}>2,000 products</option>
                    <option value={5000}>5,000 products</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Controls</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Filter by Cluster</label>
                <select
                  value={selectedCluster}
                  onChange={(e) => handleClusterFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Clusters</option>
                  {clusters.map(cluster => (
                    <option key={cluster} value={cluster}>Cluster {cluster}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2">Graph Controls</label>
                <div className="flex gap-2">
                  <button
                    onClick={zoomIn}
                    className="flex-1 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                    title="Zoom In"
                  >
                    <ZoomIn size={14} className="mx-auto" />
                  </button>
                  
                  <button
                    onClick={zoomOut}
                    className="flex-1 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} className="mx-auto" />
                  </button>
                  
                  <button
                    onClick={resetCamera}
                    className="flex-1 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                    title="Reset View"
                  >
                    <RotateCcw size={14} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {graphData && (
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Statistics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-blue-800">
                    {renderMode === 'cluster' ? 'Clusters' : 'Products'}
                  </div>
                  <div className="text-lg font-bold text-blue-900">{graphData.order}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-green-800">Genuine</div>
                  <div className="text-lg font-bold text-green-900">
                    {graphData.nodes().filter(node => !graphData.getNodeAttribute(node, 'fake')).length}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-red-800">Fake</div>
                  <div className="text-lg font-bold text-red-900">
                    {graphData.nodes().filter(node => graphData.getNodeAttribute(node, 'fake')).length}
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-purple-800">Edges</div>
                  <div className="text-lg font-bold text-purple-900">{graphData.size}</div>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Cluster Legend</h4>
            <div className="space-y-2">
              {clusters.slice(0, 10).map(cluster => (
                <div key={cluster} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: clusterColors[cluster] || clusterColors.default }}
                    />
                    <span className="text-sm text-gray-600">Cluster {cluster}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {graphData ? graphData.nodes().filter(node => 
                      graphData.getNodeAttribute(node, 'clusterId') === cluster
                    ).length : 0}
                  </span>
                </div>
              ))}
              {clusters.length > 10 && (
                <div className="text-xs text-gray-500 italic">
                  +{clusters.length - 10} more clusters
                </div>
              )}
            </div>
          </div>

          {/* Performance Info */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Performance Info</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Renderer:</span>
                <span className="font-medium">{graphData && graphData.order > 1000 ? 'WebGL' : 'Canvas'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mode:</span>
                <span className="font-medium capitalize">{renderMode}</span>
              </div>
              {renderMode === 'sample' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sample:</span>
                  <span className="font-medium">{sampleSize}</span>
                </div>
              )}
            </div>
          </div>

          {/* How to Use */}
          <div className="mt-auto">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Optimization Modes</h4>
            <div className="text-xs text-gray-600 space-y-2">
              <div>• <strong>Cluster View:</strong> Shows aggregated cluster nodes for overview</div>
              <div>• <strong>Sample View:</strong> Shows stratified sample of products</div>
              <div>• <strong>Full View:</strong> Shows all products (may be slow)</div>
              <div>• <strong>WebGL:</strong> Used automatically for large datasets</div>
            </div>
          </div>
        </div>

        {/* Right Graph Container - 70% width */}
        <div className="w-[70%] relative">
          <div 
            ref={containerRef} 
            className="w-full h-full"
            style={{ background: '#FAFAFA' }}
          />
          
          {/* Tooltip */}
          {tooltip.visible && tooltip.data && (
            <div
              className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-sm"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="text-sm">
                <div className="font-semibold text-gray-900 mb-2">
                  {tooltip.data.isClusterNode 
                    ? `Cluster ${tooltip.data.clusterId} (${tooltip.data.nodeCount} products)`
                    : `Product ID: ${tooltip.data.label?.replace('Product ', '')}`
                  }
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cluster:</span>
                    <span className="font-medium">{tooltip.data.clusterId}</span>
                  </div>
                  {!tooltip.data.isClusterNode && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trust Score:</span>
                        <span className={`font-medium ${tooltip.data.trustScore > 10 ? 'text-green-600' : 'text-red-600'}`}>
                          {tooltip.data.trustScore.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fake Score:</span>
                        <span className={`font-medium ${tooltip.data.fakeScore > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                          {tooltip.data.fakeScore.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${tooltip.data.fake ? 'text-red-600' : 'text-green-600'}`}>
                          {tooltip.data.fake ? 'Fake' : 'Genuine'}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Rating:</span>
                    <span className="font-medium">{tooltip.data.avgRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reviews:</span>
                    <span className="font-medium">{tooltip.data.numReviews}</span>
                  </div>
                  <div className="border-t pt-1 mt-1">
                    <div className="text-gray-500 text-xs mb-1">Network Metrics:</div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PageRank:</span>
                      <span className="font-medium">{tooltip.data.pagerank.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Eigenvector:</span>
                      <span className="font-medium">{tooltip.data.eigenvectorCent.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clustering:</span>
                      <span className="font-medium">{tooltip.data.clusteringCoef.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">W-Degree:</span>
                      <span className="font-medium">{tooltip.data.wDegree}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkGraphOptimized; 