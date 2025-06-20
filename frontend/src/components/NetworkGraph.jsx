import React, { useEffect, useRef, useState } from 'react';
import Sigma from 'sigma';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { color } from 'd3-color';
import Papa from 'papaparse';
import { Download, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

const NetworkGraph = () => {
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [clusters, setClusters] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  
  // Color palette for different clusters
  const clusterColors = {
    2: '#FF6B6B',   // Red
    11: '#4ECDC4',  // Teal
    18: '#45B7D1',  // Blue
    19: '#96CEB4',  // Green
    default: '#9B59B6' // Purple for others
  };

  useEffect(() => {
    loadCSVData();
  }, []);

  const loadCSVData = async () => {
    try {
      setIsLoading(true);
      // Load the CSV file from the public directory
      const response = await fetch('/product_clean/selected_120_products.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const data = results.data.filter(row => row.product_ID); // Filter out empty rows
          processData(data);
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

  const processData = (data) => {
    const graph = new Graph();
    const clusterMap = new Map();
    
    // Group products by cluster
    data.forEach(product => {
      const clusterId = product.cluster_ID;
      if (!clusterMap.has(clusterId)) {
        clusterMap.set(clusterId, []);
      }
      clusterMap.get(clusterId).push(product);
    });

    // Add nodes for each product
    data.forEach((product, index) => {
      const nodeId = product.product_ID;
      const clusterId = product.cluster_ID;
      const color = clusterColors[clusterId] || clusterColors.default;
      
      // Calculate node size based on PageRank and weighted degree
      const pagerank = parseFloat(product.pagerank) || 0;
      const wDegree = parseFloat(product.w_degree) || 0;
      const size = Math.max(3, Math.min(20, pagerank * 1000 + wDegree / 100));
      
      graph.addNode(nodeId, {
        label: `Product ${nodeId}`,
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
        trustScore: parseFloat(product.trust_score) || 0,
        fake: product.fake === '1',
        avgRating: parseFloat(product.avg_review_rating) || 0,
        numReviews: parseInt(product.n_of_reviews) || 0
      });
    });

    // Add edges based on clusters and network features
    // Products in the same cluster are connected
    clusterMap.forEach((products, clusterId) => {
      for (let i = 0; i < products.length; i++) {
        for (let j = i + 1; j < products.length; j++) {
          const product1 = products[i];
          const product2 = products[j];
          
          // Create edge weight based on similarity of network features
          const weight = calculateEdgeWeight(product1, product2);
          
          if (weight > 0.1) { // Only add edges with significant weight
            const edgeId = `${product1.product_ID}-${product2.product_ID}`;
            graph.addEdge(product1.product_ID, product2.product_ID, {
              weight: weight,
              size: weight * 2,
              color: '#E0E0E0'
            });
          }
        }
      }
    });

    // Apply force-directed layout
    const positions = forceAtlas2(graph, {
      iterations: 50,
      settings: {
        gravity: 1,
        scalingRatio: 10,
        strongGravityMode: false,
        barnesHutOptimize: true
      }
    });

    // Set unique clusters for filter
    const uniqueClusters = [...new Set(data.map(p => p.cluster_ID))].sort();
    setClusters(uniqueClusters);
    setGraphData(graph);
    setIsLoading(false);
  };

  const calculateEdgeWeight = (product1, product2) => {
    // Calculate similarity based on network features
    const pageRankSim = 1 - Math.abs(parseFloat(product1.pagerank) - parseFloat(product2.pagerank));
    const eigenSim = 1 - Math.abs(parseFloat(product1.eigenvector_cent) - parseFloat(product2.eigenvector_cent));
    const clusteringSim = 1 - Math.abs(parseFloat(product1.clustering_coef) - parseFloat(product2.clustering_coef));
    
    return (pageRankSim + eigenSim + clusteringSim) / 3;
  };

  useEffect(() => {
    if (graphData && containerRef.current && !sigmaRef.current) {
      // Initialize Sigma
      sigmaRef.current = new Sigma(graphData, containerRef.current, {
        renderer: {
          type: 'canvas',
          backgroundColor: '#FAFAFA'
        },
        settings: {
          defaultNodeColor: '#999',
          defaultEdgeColor: '#E0E0E0',
          labelColor: '#333',
          labelSize: 12,
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
          <p className="text-gray-600">Loading network graph...</p>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Product Network Analysis</h3>
            <p className="text-sm text-gray-600">Interactive visualization of product clusters and their connections</p>
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
                  <div className="text-xs font-semibold text-blue-800">Total Products</div>
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
                  <div className="text-xs font-semibold text-purple-800">Clusters</div>
                  <div className="text-lg font-bold text-purple-900">{clusters.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Cluster Legend</h4>
            <div className="space-y-2">
              {clusters.map(cluster => (
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
            </div>
          </div>

          {/* Network Metrics Info */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Network Metrics</h4>
            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-800 mb-1">PageRank</div>
                <div className="text-gray-600">Importance of a product in the review network. Higher values indicate central/influential products.</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-800 mb-1">Eigenvector Centrality</div>
                <div className="text-gray-600">Measures influence based on connections to other influential products.</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-800 mb-1">Clustering Coefficient</div>
                <div className="text-gray-600">Density of connections. Values &gt;0.7 may indicate review cartels.</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-800 mb-1">Weighted Degree</div>
                <div className="text-gray-600">Total strength of connections. High values suggest shared reviewers.</div>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="mt-auto">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">How to Use</h4>
            <div className="text-xs text-gray-600 space-y-2">
              <div>• <strong>Node Size:</strong> Larger nodes = Higher PageRank + Weighted Degree</div>
              <div>• <strong>Colors:</strong> Different clusters shown in different colors</div>
              <div>• <strong>Hover:</strong> Mouse over nodes for detailed information</div>
              <div>• <strong>Filter:</strong> Use cluster dropdown to focus on specific groups</div>
              <div>• <strong>Navigate:</strong> Drag to pan, scroll to zoom</div>
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
                  Product ID: {tooltip.data.label?.replace('Product ', '')}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cluster:</span>
                    <span className="font-medium">{tooltip.data.clusterId}</span>
                  </div>
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

export default NetworkGraph; 