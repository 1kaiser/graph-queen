import * as d3 from 'd3';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - match the installed version 5.4.296
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

console.log('🚀 Graph Queen - Starting initialization with D3.js + PDF support...');

// Get container for D3 SVG
const graphArea = document.getElementById('graphArea');
const container = document.getElementById('container');

// Graph data storage
let graphNodes = [];
let graphEdges = [];

// Undo/Redo history
let history = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

function saveState() {
  // Remove any future history if we're in the middle
  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }

  // Save current state
  const state = {
    nodes: JSON.parse(JSON.stringify(graphNodes)),
    edges: JSON.parse(JSON.stringify(graphEdges))
  };

  history.push(state);

  // Limit history size
  if (history.length > MAX_HISTORY) {
    history.shift();
  } else {
    historyIndex++;
  }

  console.log(`💾 State saved (${historyIndex + 1}/${history.length})`);
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    const state = history[historyIndex];
    graphNodes = JSON.parse(JSON.stringify(state.nodes));
    graphEdges = JSON.parse(JSON.stringify(state.edges));
    drawGraph();
    console.log(`↶ Undo (${historyIndex + 1}/${history.length})`);
  } else {
    console.log('⚠️ Nothing to undo');
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    const state = history[historyIndex];
    graphNodes = JSON.parse(JSON.stringify(state.nodes));
    graphEdges = JSON.parse(JSON.stringify(state.edges));
    drawGraph();
    console.log(`↷ Redo (${historyIndex + 1}/${history.length})`);
  } else {
    console.log('⚠️ Nothing to redo');
  }
}

function saveGraph() {
  const graphData = {
    nodes: graphNodes,
    edges: graphEdges,
    metadata: {
      created: new Date().toISOString(),
      nodeCount: graphNodes.length,
      edgeCount: graphEdges.length
    }
  };

  const jsonString = JSON.stringify(graphData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `graph_${timestamp}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
  console.log(`💾 Graph saved as ${filename}`);
}

// D3 force simulation setup
let width = graphArea.clientWidth;
let height = graphArea.clientHeight;

// Create SVG with modern background
const svg = d3.select('#graphArea')
  .append('svg')
  .attr('width', '100%')
  .attr('height', '100%')
  .style('background', '#F8FAFC');

// Create groups for edges and nodes
const linkGroup = svg.append('g').attr('class', 'links');
const nodeGroup = svg.append('g').attr('class', 'nodes');

// Selection state
let selectedNodes = new Set();
let selectedEdges = new Set();
let connectMode = false;
let firstSelectedNode = null;

// Force simulation with adjusted parameters for smaller nodes
let simulation = d3.forceSimulation(graphNodes)
  .force('link', d3.forceLink(graphEdges).id(d => d.id).distance(100))
  .force('charge', d3.forceManyBody().strength(-200))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(30));

function updateGraph() {
  width = graphArea.clientWidth;
  height = graphArea.clientHeight;

  // Update simulation
  simulation.nodes(graphNodes);
  simulation.force('link').links(graphEdges);
  simulation.force('center', d3.forceCenter(width / 2, height / 2));
  simulation.alpha(0.3).restart();

  // Draw edges
  const links = linkGroup.selectAll('line')
    .data(graphEdges, d => `${d.source.id}-${d.target.id}`);

  links.exit().remove();

  const linksEnter = links.enter()
    .append('line')
    .attr('stroke', '#94A3B8')
    .attr('stroke-width', 2)
    .attr('opacity', 0.5)
    .style('cursor', 'pointer')
    .on('click', edgeClicked);

  const allLinks = linksEnter.merge(links);

  // Update edge appearance based on selection with modern colors
  allLinks
    .attr('stroke', d => {
      const edgeId = `${d.source.id}-${d.target.id}`;
      return selectedEdges.has(edgeId) ? '#EF4444' : '#94A3B8';
    })
    .attr('stroke-width', d => {
      const edgeId = `${d.source.id}-${d.target.id}`;
      return selectedEdges.has(edgeId) ? 3 : 2;
    })
    .attr('opacity', d => {
      const edgeId = `${d.source.id}-${d.target.id}`;
      return selectedEdges.has(edgeId) ? 0.9 : 0.5;
    });

  // Draw nodes
  const nodes = nodeGroup.selectAll('g')
    .data(graphNodes, d => d.id);

  nodes.exit().remove();

  const nodesEnter = nodes.enter()
    .append('g')
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded))
    .on('click', nodeClicked)
    .on('dblclick', nodeDoubleClicked)
    .on('mouseenter', function(event, d) { nodeMouseEnter(d, this); })
    .on('mouseleave', function(event, d) { nodeMouseLeave(d, this); });

  // Node circle - smaller with modern color palette
  nodesEnter.append('circle')
    .attr('r', 8)
    .attr('fill', '#6366F1')
    .attr('stroke', '#4F46E5')
    .attr('stroke-width', 2);

  // Permanent text label above each node
  nodesEnter.append('text')
    .attr('class', 'node-label-permanent')
    .attr('y', -15)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .attr('fill', '#1E293B')
    .attr('pointer-events', 'none')
    .text(d => d.label);

  const allNodes = nodesEnter.merge(nodes);

  // Update node appearance with modern color palette
  allNodes.select('circle')
    .attr('fill', d => selectedNodes.has(d.id) ? '#F59E0B' : '#6366F1')
    .attr('stroke', d => selectedNodes.has(d.id) ? '#D97706' : '#4F46E5')
    .attr('stroke-width', d => selectedNodes.has(d.id) ? 2.5 : 2);

  // Update text labels
  allNodes.select('.node-label-permanent')
    .text(d => d.label)
    .attr('fill', d => selectedNodes.has(d.id) ? '#D97706' : '#1E293B')
    .attr('font-weight', d => selectedNodes.has(d.id) ? '700' : '600');

  // Attach drag-to-connect handlers to all nodes
  allNodes
    .on('mousedown.connect', function(event, d) {
      if (!connectMode) return;

      event.stopPropagation();
      dragConnectionSource = d;

      // Create temporary line with modern colors
      dragConnectionLine = svg.insert('line', ':first-child + *')
        .attr('class', 'drag-connection-temp')
        .attr('x1', d.x)
        .attr('y1', d.y)
        .attr('x2', d.x)
        .attr('y2', d.y)
        .attr('stroke', '#8B5CF6')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '8,4')
        .attr('opacity', 0.8);

      console.log(`🎨 Started connection from: ${d.label}`);
    });

  // Simulation tick
  simulation.on('tick', () => {
    allLinks
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    allNodes
      .attr('transform', d => `translate(${d.x},${d.y})`);
  });

  console.log('✅ D3 graph updated:', graphNodes.length, 'nodes,', graphEdges.length, 'edges');
}

// Molecular-style hover effects with labels (like Distill GNN)
function addNodeLabel(element, node) {
  const group = d3.select(element);

  // Add text with white stroke outline for readability (Distill style)
  group.append('text')
    .attr('class', 'node-label-outline')
    .text(node.label)
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('pointer-events', 'none');

  // Add black text on top
  group.append('text')
    .attr('class', 'node-label-text')
    .text(node.label)
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#000')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('pointer-events', 'none');
}

function removeNodeLabel(element) {
  d3.select(element).selectAll('.node-label-outline, .node-label-text').remove();
}

function nodeMouseEnter(node, element) {
  // Highlight this node with modern colors
  d3.select(element).select('circle')
    .attr('r', 10)
    .attr('stroke', '#8B5CF6')
    .attr('stroke-width', 3);

  // Enlarge label on hover
  d3.select(element).select('.node-label-permanent')
    .attr('font-size', '14px')
    .attr('font-weight', '700')
    .attr('fill', '#8B5CF6');

  // Highlight connected edges with modern palette
  linkGroup.selectAll('line')
    .attr('stroke', edge => {
      const isConnected = (edge.source.id === node.id || edge.target.id === node.id);
      return isConnected ? '#8B5CF6' : '#94A3B8';
    })
    .attr('stroke-width', edge => {
      const isConnected = (edge.source.id === node.id || edge.target.id === node.id);
      return isConnected ? 3 : 2;
    })
    .attr('opacity', edge => {
      const isConnected = (edge.source.id === node.id || edge.target.id === node.id);
      return isConnected ? 0.9 : 0.3;
    });

  // Highlight connected nodes
  nodeGroup.selectAll('g').select('circle')
    .attr('r', d => {
      if (d.id === node.id) return 10;
      const isConnected = graphEdges.some(edge =>
        (edge.source.id === node.id && edge.target.id === d.id) ||
        (edge.target.id === node.id && edge.source.id === d.id)
      );
      return isConnected ? 9 : 8;
    })
    .attr('stroke', d => {
      if (d.id === node.id) return '#8B5CF6';
      const isConnected = graphEdges.some(edge =>
        (edge.source.id === node.id && edge.target.id === d.id) ||
        (edge.target.id === node.id && edge.source.id === d.id)
      );
      return isConnected ? '#8B5CF6' : (selectedNodes.has(d.id) ? '#D97706' : '#4F46E5');
    })
    .attr('stroke-width', d => {
      if (d.id === node.id) return 3;
      const isConnected = graphEdges.some(edge =>
        (edge.source.id === node.id && edge.target.id === d.id) ||
        (edge.target.id === node.id && edge.source.id === d.id)
      );
      return isConnected ? 2.5 : 2;
    });

  // Highlight connected node labels
  nodeGroup.selectAll('g').select('.node-label-permanent')
    .attr('fill', d => {
      if (d.id === node.id) return '#8B5CF6';
      const isConnected = graphEdges.some(edge =>
        (edge.source.id === node.id && edge.target.id === d.id) ||
        (edge.target.id === node.id && edge.source.id === d.id)
      );
      return isConnected ? '#8B5CF6' : (selectedNodes.has(d.id) ? '#D97706' : '#1E293B');
    });
}

function nodeMouseLeave(node, element) {
  // Reset node size and style with modern colors
  nodeGroup.selectAll('g').select('circle')
    .attr('r', 8)
    .attr('fill', d => selectedNodes.has(d.id) ? '#F59E0B' : '#6366F1')
    .attr('stroke', d => selectedNodes.has(d.id) ? '#D97706' : '#4F46E5')
    .attr('stroke-width', d => selectedNodes.has(d.id) ? 2.5 : 2);

  // Reset labels to normal size
  nodeGroup.selectAll('g').select('.node-label-permanent')
    .attr('font-size', '12px')
    .attr('fill', d => selectedNodes.has(d.id) ? '#D97706' : '#1E293B')
    .attr('font-weight', d => selectedNodes.has(d.id) ? '700' : '600');

  // Reset all edges to default style
  linkGroup.selectAll('line')
    .attr('stroke', d => {
      const edgeId = `${d.source.id}-${d.target.id}`;
      return selectedEdges.has(edgeId) ? '#EF4444' : '#94A3B8';
    })
    .attr('stroke-width', d => {
      const edgeId = `${d.source.id}-${d.target.id}`;
      return selectedEdges.has(edgeId) ? 3 : 2;
    })
    .attr('opacity', d => {
      const edgeId = `${d.source.id}-${d.target.id}`;
      return selectedEdges.has(edgeId) ? 0.9 : 0.5;
    });
}

// Drag functions
function dragStarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragEnded(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  // Keep position fixed after drag
  // d.fx = null;
  // d.fy = null;
}

// Node selection and connection
function nodeClicked(event, d) {
  event.stopPropagation();

  if (connectMode) {
    // Connect mode: create edge between nodes
    if (!firstSelectedNode) {
      firstSelectedNode = d;
      selectedNodes.add(d.id);
      console.log(`🔗 First node selected: ${d.label}`);
    } else if (firstSelectedNode.id !== d.id) {
      // Create edge
      const edgeExists = graphEdges.some(e =>
        (e.source.id === firstSelectedNode.id && e.target.id === d.id) ||
        (e.source.id === d.id && e.target.id === firstSelectedNode.id)
      );

      if (!edgeExists) {
        graphEdges.push({
          source: firstSelectedNode.id,
          target: d.id
        });
        console.log(`✅ Edge created: ${firstSelectedNode.label} → ${d.label}`);
        saveState();
      }

      // Reset selection
      selectedNodes.clear();
      firstSelectedNode = null;
      updateGraph();
    }
  } else {
    // Selection mode
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      if (selectedNodes.has(d.id)) {
        selectedNodes.delete(d.id);
      } else {
        selectedNodes.add(d.id);
      }
    } else {
      // Single select
      selectedNodes.clear();
      selectedNodes.add(d.id);
    }
    updateGraph();
    console.log(`📍 Selected nodes: ${Array.from(selectedNodes).join(', ')}`);
  }
}

// Node double-click to edit label
function nodeDoubleClicked(event, d) {
  event.stopPropagation();

  const newLabel = prompt('Edit node label:', d.label);
  if (newLabel !== null && newLabel.trim() !== '') {
    d.label = newLabel.trim();
    updateGraph();
    saveState();
    console.log(`✏️ Node label updated to: "${newLabel}"`);
  }
}

// Edge click handler
function edgeClicked(event, d) {
  event.stopPropagation();

  const edgeId = `${d.source.id}-${d.target.id}`;

  if (event.ctrlKey || event.metaKey) {
    // Multi-select edges
    if (selectedEdges.has(edgeId)) {
      selectedEdges.delete(edgeId);
    } else {
      selectedEdges.add(edgeId);
    }
  } else {
    // Single select edge
    selectedEdges.clear();
    selectedNodes.clear();
    selectedEdges.add(edgeId);
  }

  updateGraph();
  console.log(`📍 Selected edges: ${Array.from(selectedEdges).join(', ')}`);
}

// Delete selected nodes and edges
function deleteSelected() {
  if (selectedNodes.size === 0 && selectedEdges.size === 0) {
    console.log('⚠️ Nothing selected to delete');
    return;
  }

  let deletedCount = 0;

  // Delete selected nodes
  if (selectedNodes.size > 0) {
    const selectedIds = Array.from(selectedNodes);
    deletedCount += selectedIds.length;

    // Remove nodes
    graphNodes = graphNodes.filter(node => !selectedNodes.has(node.id));

    // Remove edges connected to deleted nodes
    graphEdges = graphEdges.filter(edge => {
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
      return !selectedNodes.has(sourceId) && !selectedNodes.has(targetId);
    });

    console.log(`🗑️ Deleted ${selectedIds.length} nodes`);
  }

  // Delete selected edges
  if (selectedEdges.size > 0) {
    const selectedEdgeIds = Array.from(selectedEdges);
    deletedCount += selectedEdgeIds.length;

    graphEdges = graphEdges.filter(edge => {
      const edgeId = `${edge.source.id}-${edge.target.id}`;
      const reverseEdgeId = `${edge.target.id}-${edge.source.id}`;
      return !selectedEdges.has(edgeId) && !selectedEdges.has(reverseEdgeId);
    });

    console.log(`🗑️ Deleted ${selectedEdgeIds.length} edges`);
  }

  // Clear selection
  selectedNodes.clear();
  selectedEdges.clear();
  firstSelectedNode = null;

  updateGraph();
  saveState();

  console.log(`✅ Total deleted: ${deletedCount} items`);
}

// Initialize
updateGraph();

window.addEventListener('resize', () => {
  width = graphArea.clientWidth;
  height = graphArea.clientHeight;
  simulation.force('center', d3.forceCenter(width / 2, height / 2));
  simulation.alpha(0.3).restart();
});

// Save initial state
saveState();

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
  // Ctrl+S: Save graph
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveGraph();
  }

  // Ctrl+Z: Undo
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
    e.preventDefault();
    undo();
  }

  // Ctrl+Shift+Z: Redo
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
    e.preventDefault();
    redo();
  }

  // Delete or Backspace: Delete selected nodes
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // Only delete if not typing in an input field
    if (document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      deleteSelected();
    }
  }
});

console.log('⌨️ Keyboard shortcuts enabled:');
console.log('  Ctrl+S: Save graph');
console.log('  Ctrl+Z: Undo');
console.log('  Ctrl+Shift+Z: Redo');
console.log('  Delete/Backspace: Delete selected nodes');
console.log('  Double-click node: Edit node label');

// Draggable functionality
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

const draggablePanels = document.querySelectorAll('.draggable-panel');

draggablePanels.forEach(panel => {
  panel.addEventListener('mousedown', (e) => {
    // Don't start dragging if clicking on a link or the file input trigger
    if (e.target.tagName === 'A' || e.target.closest('#fileInput')) {
      return;
    }

    draggedElement = panel;
    draggedElement.classList.add('dragging');

    const rect = draggedElement.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    console.log(`🖱️ Started dragging: ${panel.id}`);
  });
});

document.addEventListener('mousemove', (e) => {
  if (draggedElement) {
    const container = document.getElementById('container');
    const containerRect = container.getBoundingClientRect();

    let newX = e.clientX - containerRect.left - offsetX;
    let newY = e.clientY - containerRect.top - offsetY;

    // Constrain to container bounds
    newX = Math.max(0, Math.min(newX, containerRect.width - draggedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - draggedElement.offsetHeight));

    draggedElement.style.left = newX + 'px';
    draggedElement.style.top = newY + 'px';
    draggedElement.style.right = 'auto';
  }
});

document.addEventListener('mouseup', () => {
  if (draggedElement) {
    console.log(`✅ Stopped dragging: ${draggedElement.id}`);
    draggedElement.classList.remove('dragging');
    draggedElement = null;
  }
});

// File upload handler
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    console.log(`📁 File selected: ${file.name}`);

    const reader = new FileReader();
    reader.onload = (event) => {
      console.log('📄 File contents:', event.target.result.substring(0, 200) + '...');
      alert(`File uploaded: ${file.name}\nSize: ${file.size} bytes`);
    };
    reader.readAsText(file);
  }
});

// Text box handler
const textBox = document.getElementById('textBox');
textBox.addEventListener('input', (e) => {
  console.log(`✏️ Text input: "${e.target.value}"`);
});

textBox.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && e.target.value.trim()) {
    const text = e.target.value.trim();
    console.log(`✅ Enter pressed with text: "${text}"`);

    // Add text as a node to the graph
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: text,
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200
    };
    graphNodes.push(newNode);

    // If there are selected nodes, create edges from new node to all selected nodes
    if (selectedNodes.size > 0) {
      selectedNodes.forEach(selectedId => {
        graphEdges.push({
          source: newNode.id,
          target: selectedId
        });
        console.log(`🔗 Connected new node "${text}" to selected node: ${selectedId}`);
      });
      console.log(`✨ Created ${selectedNodes.size} connections to selected nodes`);
    }

    updateGraph();
    saveState(); // Save state for undo/redo

    e.target.value = '';
    console.log(`📊 Added node: ${text}`);

    if (selectedNodes.size > 0) {
      alert(`Created node "${text}" connected to ${selectedNodes.size} selected node${selectedNodes.size > 1 ? 's' : ''}!`);
    }
  }
});

// ========== WORDY-STYLE SLIDING PANEL FUNCTIONALITY ==========

// Toggle functions for slide panels
function toggleOCRPanel() {
  const panel = document.getElementById('ocr-slide-panel');
  const btn = event.target;

  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
    btn.classList.remove('active');
  } else {
    closeAllPanels();
    panel.classList.add('visible');
    btn.classList.add('active');
  }
}

function toggleHelpPanel() {
  const panel = document.getElementById('help-slide-panel');
  const btn = event.target;

  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
    btn.classList.remove('active');
  } else {
    closeAllPanels();
    panel.classList.add('visible');
    btn.classList.add('active');
  }
}

function toggleSettingsPanel() {
  const panel = document.getElementById('settings-slide-panel');
  const btn = event.target;

  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
    btn.classList.remove('active');
  } else {
    closeAllPanels();
    panel.classList.add('visible');
    btn.classList.add('active');
  }
}

function closeAllPanels() {
  // Close all slide panels
  const panels = document.querySelectorAll('.slide-container');
  panels.forEach(panel => panel.classList.remove('visible'));

  // Remove active state from all buttons
  const buttons = document.querySelectorAll('.top-toggle-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
}

// Export comprehensive graph data
function exportGraphData() {
  if (graphNodes.length === 0) {
    alert('No graph data to export! Create some nodes first.');
    return;
  }

  const graphData = {
    metadata: {
      exported: new Date().toISOString(),
      nodeCount: graphNodes.length,
      edgeCount: graphEdges.length,
      graphQueenVersion: '1.0.0',
      hasOCRData: ocrVisualizationMode || graphNodes.some(n => n.wordBBox)
    },
    nodes: graphNodes.map(node => ({
      id: node.id,
      label: node.label,
      x: node.x,
      y: node.y,
      wordBBox: node.wordBBox || null,
      confidence: node.confidence || null
    })),
    edges: graphEdges.map(edge => ({
      source: typeof edge.source === 'object' ? edge.source.id : edge.source,
      target: typeof edge.target === 'object' ? edge.target.id : edge.target,
      similarity: edge.similarity || null
    })),
    statistics: {
      avgDegree: graphEdges.length > 0 ? (2 * graphEdges.length / graphNodes.length).toFixed(2) : 0,
      density: graphNodes.length > 1 ?
        (2 * graphEdges.length / (graphNodes.length * (graphNodes.length - 1))).toFixed(4) : 0
    }
  };

  // Create JSON file
  const jsonString = JSON.stringify(graphData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `graph_queen_${timestamp}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

  console.log(`💾 Exported graph: ${graphNodes.length} nodes, ${graphEdges.length} edges`);
  console.log(`📊 Statistics: Avg degree ${graphData.statistics.avgDegree}, Density ${graphData.statistics.density}`);

  alert(`Graph exported successfully!\n\nFile: ${filename}\nNodes: ${graphNodes.length}\nEdges: ${graphEdges.length}\nAvg Degree: ${graphData.statistics.avgDegree}\nDensity: ${graphData.statistics.density}`);
}

// Make functions available globally for onclick handlers
window.toggleOCRPanel = toggleOCRPanel;
window.toggleHelpPanel = toggleHelpPanel;
window.toggleSettingsPanel = toggleSettingsPanel;
window.closeAllPanels = closeAllPanels;
window.createGraphFromWords = createGraphFromWords;
window.exportGraphData = exportGraphData;

// OCR Image Upload
const ocrImageInput = document.getElementById('ocrImageInput');
const ocrPreview = document.getElementById('ocrPreview');
const extractBtn = document.getElementById('extractBtn');
let currentImageFile = null;

ocrImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    currentImageFile = file;
    console.log(`📷 Image selected: ${file.name}`);

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      ocrPreview.src = event.target.result;
      ocrPreview.style.display = 'block';
      extractBtn.disabled = false;
      console.log('✅ Image preview loaded');
    };
    reader.readAsDataURL(file);
  }
});

// OCR Extraction using Tesseract.js
const ocrStatus = document.getElementById('ocrStatus');
const ocrResult = document.getElementById('ocrResult');
const useTextBtn = document.getElementById('useTextBtn');
let lastOCRData = null; // Store full OCR data with bounding boxes

extractBtn.addEventListener('click', async () => {
  if (!currentImageFile) {
    console.error('❌ No image file selected');
    return;
  }

  console.log('🔍 Starting OCR with Tesseract.js...');

  ocrStatus.className = 'loading';
  ocrStatus.textContent = '⏳ Running OCR... This may take a moment.';
  extractBtn.disabled = true;

  try {
    // Run Tesseract OCR
    const result = await Tesseract.recognize(currentImageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const progress = Math.round(m.progress * 100);
          ocrStatus.textContent = `⏳ Recognizing text: ${progress}%`;
        }
      }
    });

    console.log('✅ OCR completed:', result);
    console.log('OCR data structure:', result.data);

    // Validate OCR result structure
    if (!result || !result.data) {
      throw new Error('OCR returned invalid result structure');
    }

    // Store full OCR data for word rectangle extraction
    lastOCRData = result.data;

    // Extract text - with fallback handling
    const text = result.data.text || '';

    // Get words array safely
    let words = [];
    if (result.data.words && Array.isArray(result.data.words)) {
      words = result.data.words;
    } else if (result.data.lines && Array.isArray(result.data.lines)) {
      // Fallback: extract words from lines
      words = result.data.lines.flatMap(line =>
        (line.words && Array.isArray(line.words)) ? line.words : []
      );
    } else if (result.data.paragraphs && Array.isArray(result.data.paragraphs)) {
      // Fallback: extract words from paragraphs
      words = result.data.paragraphs.flatMap(para =>
        (para.lines && Array.isArray(para.lines)) ? para.lines.flatMap(line =>
          (line.words && Array.isArray(line.words)) ? line.words : []
        ) : []
      );
    }

    // Update lastOCRData with processed words
    if (!lastOCRData.words || !Array.isArray(lastOCRData.words)) {
      lastOCRData.words = words;
    }

    const wordCount = words.length;

    if (wordCount === 0) {
      ocrStatus.className = 'error';
      ocrStatus.textContent = '⚠️ No text detected in image. Try a clearer image with more contrast.';
      ocrResult.value = text || 'No text detected';
      extractBtn.disabled = false;
      return;
    }

    ocrResult.value = text;
    ocrStatus.className = 'success';
    ocrStatus.textContent = `✅ OCR complete! Found ${wordCount} words.`;
    useTextBtn.disabled = false;
    extractBtn.disabled = false;

    console.log(`📊 Extracted ${wordCount} words with bounding boxes`);
    console.log('Sample words:', words.slice(0, 3));
  } catch (error) {
    console.error('❌ OCR failed:', error);
    console.error('Error stack:', error.stack);
    ocrStatus.className = 'error';
    ocrStatus.textContent = `❌ OCR failed: ${error.message}`;
    extractBtn.disabled = false;
  }
});

// Variables for OCR visualization
let ocrImageScale = 1;
let ocrImageOffsetX = 0;
let ocrImageOffsetY = 0;
let ocrVisualizationMode = false;

// Show word rectangles on image
function showWordRectangles() {
  if (!lastOCRData) {
    console.error('❌ No OCR data available');
    alert('Please run OCR first!');
    return;
  }

  // Validate words array
  if (!lastOCRData.words || !Array.isArray(lastOCRData.words) || lastOCRData.words.length === 0) {
    console.error('❌ No words detected in OCR data');
    alert('No words were detected in the image.\n\nThis could mean:\n- The image has no text\n- The text is too blurry or low quality\n- OCR failed to detect readable text\n\nTry uploading a clearer image with higher contrast.');
    return;
  }

  console.log('📊 Visualizing word rectangles...');
  console.log(`Processing ${lastOCRData.words.length} words`);
  ocrVisualizationMode = true;

  // Display the uploaded image with word rectangles
  if (currentImageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Clear existing graph
        const clearConfirm = graphNodes.length > 0 ?
          confirm('This will clear the current graph. Continue?') : true;

        if (!clearConfirm) return;

        graphNodes = [];
        graphEdges = [];
        updateGraph();

        // Add image to SVG as background
        const existingImage = svg.select('image.ocr-background');
        if (!existingImage.empty()) {
          existingImage.remove();
        }

        // Calculate scale to fit image in viewport
        const imgWidth = img.width;
        const imgHeight = img.height;
        ocrImageScale = Math.min(width / imgWidth, height / imgHeight, 1);

        ocrImageOffsetX = (width - imgWidth * ocrImageScale) / 2;
        ocrImageOffsetY = (height - imgHeight * ocrImageScale) / 2;

        // Add image with higher opacity for visualization
        svg.insert('image', ':first-child')
          .attr('class', 'ocr-background')
          .attr('href', e.target.result)
          .attr('width', imgWidth * ocrImageScale)
          .attr('height', imgHeight * ocrImageScale)
          .attr('x', ocrImageOffsetX)
          .attr('y', ocrImageOffsetY)
          .attr('opacity', 0.7);

        // Draw word bounding boxes
        const rectGroup = svg.insert('g', ':first-child + *')
          .attr('class', 'word-rectangles');

        let validWordCount = 0;
        lastOCRData.words.forEach((word, i) => {
          // Validate word structure
          if (!word || !word.bbox) {
            console.warn(`Skipping word ${i}: missing bbox`, word);
            return;
          }

          const bbox = word.bbox;

          // Validate bbox coordinates
          if (typeof bbox.x0 !== 'number' || typeof bbox.y0 !== 'number' ||
              typeof bbox.x1 !== 'number' || typeof bbox.y1 !== 'number') {
            console.warn(`Skipping word ${i}: invalid bbox coordinates`, bbox);
            return;
          }

          const rectX = ocrImageOffsetX + bbox.x0 * ocrImageScale;
          const rectY = ocrImageOffsetY + bbox.y0 * ocrImageScale;
          const rectWidth = (bbox.x1 - bbox.x0) * ocrImageScale;
          const rectHeight = (bbox.y1 - bbox.y0) * ocrImageScale;

          // Skip invalid rectangles
          if (rectWidth <= 0 || rectHeight <= 0) {
            console.warn(`Skipping word ${i}: invalid dimensions`, { rectWidth, rectHeight });
            return;
          }

          const rect = rectGroup.append('rect')
            .attr('class', 'word-bbox')
            .attr('data-word-index', i)
            .attr('x', rectX)
            .attr('y', rectY)
            .attr('width', rectWidth)
            .attr('height', rectHeight)
            .attr('fill', 'none')
            .attr('stroke', '#FF6B6B')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('click', function() {
              // Toggle rectangle selection
              const isSelected = d3.select(this).attr('stroke') === 'steelblue';
              d3.select(this)
                .attr('stroke', isSelected ? '#FF6B6B' : 'steelblue')
                .attr('stroke-width', isSelected ? 2 : 3);
            });

          // Add word label if text exists
          const wordText = word.text || word.word || '';
          if (wordText) {
            rectGroup.append('text')
              .attr('x', rectX + rectWidth / 2)
              .attr('y', rectY - 5)
              .attr('text-anchor', 'middle')
              .attr('fill', '#FF6B6B')
              .attr('stroke', '#fff')
              .attr('stroke-width', 3)
              .attr('paint-order', 'stroke')
              .attr('font-size', '10px')
              .attr('font-weight', 'bold')
              .text(wordText);
          }

          validWordCount++;
        });

        if (validWordCount === 0) {
          alert('No valid word rectangles could be drawn!\n\nThe OCR data may be corrupted or the image format is not supported.');
          svg.selectAll('.word-rectangles').remove();
          svg.selectAll('.ocr-background').remove();
          return;
        }

        console.log(`✅ Visualized ${validWordCount} word rectangles (out of ${lastOCRData.words.length} total)`);
        alert(`Showing ${validWordCount} detected words!\n\nClick rectangles to select them (they turn blue), then click "Create Graph from Selected" or "Create Graph from All".`);

        // Update OCR panel buttons
        document.getElementById('createGraphBtn').disabled = false;
        document.getElementById('createGraphSelectedBtn').disabled = false;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(currentImageFile);
  }
}

// Create graph from all or selected word rectangles
function createGraphFromWords(selectedOnly = false) {
  if (!lastOCRData || !lastOCRData.words || lastOCRData.words.length === 0) {
    alert('Please run OCR and visualize word rectangles first!');
    return;
  }

  let wordsToAdd = [];

  if (selectedOnly) {
    // Get selected rectangles
    const selectedRects = svg.selectAll('.word-bbox').filter(function() {
      return d3.select(this).attr('stroke') === 'steelblue';
    });

    if (selectedRects.empty()) {
      alert('Please select some word rectangles first by clicking on them!');
      return;
    }

    selectedRects.each(function() {
      const index = parseInt(d3.select(this).attr('data-word-index'));
      wordsToAdd.push({ word: lastOCRData.words[index], index });
    });
  } else {
    // Add all words
    wordsToAdd = lastOCRData.words.map((word, index) => ({ word, index }));
  }

  // Create nodes from selected words with validation
  const newNodes = wordsToAdd
    .filter(({ word }) => word && word.bbox && word.bbox.x0 !== undefined)
    .map(({ word, index }) => {
      const bbox = word.bbox;
      const nodeX = ocrImageOffsetX + (bbox.x0 + bbox.x1) / 2 * ocrImageScale;
      const nodeY = ocrImageOffsetY + (bbox.y0 + bbox.y1) / 2 * ocrImageScale;

      return {
        id: `ocr_${Date.now()}_${index}`,
        label: word.text || word.word || 'Unknown',
        x: nodeX,
        y: nodeY,
        fx: nodeX,
        fy: nodeY,
        wordBBox: bbox,
        confidence: word.confidence || null
      };
    });

  if (newNodes.length === 0) {
    alert('No valid nodes could be created from the selected words!');
    return;
  }

  // Remove word rectangles visualization
  svg.selectAll('.word-rectangles').remove();

  // Add nodes to graph
  graphNodes.push(...newNodes);
  updateGraph();
  saveState();

  ocrVisualizationMode = false;

  console.log(`✅ Created ${newNodes.length} nodes from OCR word rectangles`);
  alert(`Created ${newNodes.length} nodes!\n\nNow you can:\n- Manually connect them in Connect Mode\n- Use Auto-Connect Similar\n- Export the graph with Ctrl+S`);

  // Close the OCR panel
  closeAllPanels();
}

// Use extracted text button - now shows visualization first
useTextBtn.addEventListener('click', () => {
  showWordRectangles();
});

// Connect mode toggle - now with drag-to-connect
const connectModeBtn = document.getElementById('connectModeBtn');
connectModeBtn.addEventListener('click', () => {
  connectMode = !connectMode;
  connectModeBtn.classList.toggle('active', connectMode);
  connectModeBtn.textContent = connectMode ? '🔗 Connect Mode: ON' : '🔗 Connect Mode: OFF';

  // Reset selection when toggling
  selectedNodes.clear();
  firstSelectedNode = null;
  cleanupDragConnection();
  updateGraph();

  // Update cursor style
  if (connectMode) {
    svg.style('cursor', 'crosshair');
    console.log('🔗 Connect mode: ON');
    console.log('  → Drag from one node to another to create connection');
  } else {
    svg.style('cursor', 'default');
    console.log('🔗 Connect mode: OFF');
    console.log('  → Click nodes to select');
  }
});

// ========== AI SIMILARITY-BASED AUTO-CONNECTION ==========

/**
 * Calculate text similarity between two strings using Levenshtein distance
 * Returns a score between 0 (completely different) and 1 (identical)
 */
function calculateSimilarity(str1, str2) {
  // Normalize strings
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // If identical, return 1
  if (s1 === s2) return 1;

  // Calculate Levenshtein distance
  const matrix = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);

  // Convert distance to similarity (0-1)
  return 1 - (distance / maxLength);
}

/**
 * Calculate cosine similarity between two strings using character bigrams
 */
function cosineSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  // Generate character bigrams
  const getBigrams = (str) => {
    const bigrams = new Map();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const bigrams1 = getBigrams(s1);
  const bigrams2 = getBigrams(s2);

  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  // Union of all bigrams
  const allBigrams = new Set([...bigrams1.keys(), ...bigrams2.keys()]);

  allBigrams.forEach(bigram => {
    const count1 = bigrams1.get(bigram) || 0;
    const count2 = bigrams2.get(bigram) || 0;
    dotProduct += count1 * count2;
    magnitude1 += count1 * count1;
    magnitude2 += count2 * count2;
  });

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

/**
 * Auto-connect similar nodes based on text similarity
 */
function autoConnectSimilarNodes(threshold = 0.6) {
  if (graphNodes.length < 2) {
    alert('Need at least 2 nodes to auto-connect!');
    return;
  }

  console.log('🤖 Auto-connecting similar nodes...');
  let edgesCreated = 0;

  // Compare each pair of nodes
  for (let i = 0; i < graphNodes.length; i++) {
    for (let j = i + 1; j < graphNodes.length; j++) {
      const node1 = graphNodes[i];
      const node2 = graphNodes[j];

      // Skip if edge already exists
      const edgeExists = graphEdges.some(e =>
        (e.source.id === node1.id && e.target.id === node2.id) ||
        (e.source.id === node2.id && e.target.id === node1.id)
      );

      if (edgeExists) continue;

      // Calculate similarity using both methods and take average
      const levenshteinSim = calculateSimilarity(node1.label, node2.label);
      const cosineSim = cosineSimilarity(node1.label, node2.label);
      const similarity = (levenshteinSim + cosineSim) / 2;

      console.log(`📊 Similarity "${node1.label}" ↔ "${node2.label}": ${(similarity * 100).toFixed(1)}%`);

      // Create edge if similarity exceeds threshold
      if (similarity >= threshold) {
        graphEdges.push({
          source: node1.id,
          target: node2.id,
          similarity: similarity
        });
        edgesCreated++;
        console.log(`✅ Connected: "${node1.label}" ↔ "${node2.label}" (${(similarity * 100).toFixed(1)}%)`);
      }
    }
  }

  updateGraph();
  saveState();

  console.log(`🎉 Auto-connect complete! Created ${edgesCreated} edges.`);
  alert(`Auto-connect complete!\nCreated ${edgesCreated} new connections based on text similarity (threshold: ${(threshold * 100).toFixed(0)}%)`);
}

// Auto-connect button handler
const autoConnectBtn = document.getElementById('autoConnectBtn');
autoConnectBtn.addEventListener('click', () => {
  // Ask user for similarity threshold
  const thresholdStr = prompt('Enter similarity threshold (0-100%):', '60');
  if (thresholdStr === null) return; // User cancelled

  const threshold = parseInt(thresholdStr) / 100;
  if (isNaN(threshold) || threshold < 0 || threshold > 1) {
    alert('Invalid threshold! Please enter a number between 0 and 100.');
    return;
  }

  autoConnectSimilarNodes(threshold);
});

// ========== AUTOMATIC OCR WORKFLOW (STREAMLINED) ==========

/**
 * Automatic OCR processing when image is uploaded
 * Workflow: Upload → Auto OCR → Auto create nodes → Ready to connect
 */
const autoOCRInput = document.getElementById('autoOCRInput');
const ocrProgress = document.getElementById('ocrProgress');
const ocrProgressText = document.getElementById('ocrProgressText');
const ocrProgressPercent = document.getElementById('ocrProgressPercent');

autoOCRInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const isPDF = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');

  if (!isPDF && !isImage) {
    alert('Please select a valid image or PDF file!');
    return;
  }

  console.log(`📷 Auto-processing ${isPDF ? 'PDF' : 'image'}: ${file.name}`);

  // Show progress indicator
  ocrProgress.style.display = 'block';
  ocrProgressText.textContent = isPDF ? 'Loading PDF...' : 'Reading image...';
  ocrProgressPercent.textContent = '0%';

  try {
    let imageToProcess = file;

    // If PDF, convert first page to image
    if (isPDF) {
      ocrProgressText.textContent = 'Converting PDF to image...';
      ocrProgressPercent.textContent = '25%';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); // Get first page

      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convert canvas to blob
      imageToProcess = await new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png');
      });

      ocrProgressText.textContent = 'PDF converted, starting OCR...';
      ocrProgressPercent.textContent = '50%';
    }
    // Run Tesseract OCR with progress tracking
    const result = await Tesseract.recognize(imageToProcess, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const progress = Math.round(m.progress * 100);
          const baseProgress = isPDF ? 50 : 0;
          const adjustedProgress = baseProgress + (progress * (isPDF ? 0.5 : 1));
          ocrProgressText.textContent = `Extracting text...`;
          ocrProgressPercent.textContent = `${Math.round(adjustedProgress)}%`;
        }
      }
    });

    // Validate OCR result
    if (!result || !result.data) {
      throw new Error('OCR returned invalid result');
    }

    // Extract words with fallback hierarchy
    let words = [];
    if (result.data.words && Array.isArray(result.data.words)) {
      words = result.data.words;
    } else if (result.data.lines && Array.isArray(result.data.lines)) {
      words = result.data.lines.flatMap(line =>
        (line.words && Array.isArray(line.words)) ? line.words : []
      );
    } else if (result.data.paragraphs && Array.isArray(result.data.paragraphs)) {
      words = result.data.paragraphs.flatMap(para =>
        (para.lines && Array.isArray(para.lines)) ? para.lines.flatMap(line =>
          (line.words && Array.isArray(line.words)) ? line.words : []
        ) : []
      );
    }

    if (words.length === 0) {
      throw new Error('No text detected in image. Try a clearer image.');
    }

    ocrProgressText.textContent = 'Creating graph nodes...';
    ocrProgressPercent.textContent = '100%';

    // Clear existing graph
    const clearConfirm = graphNodes.length > 0 ?
      confirm(`Found ${words.length} words!\n\nClear current graph and create nodes from detected text?`) : true;

    if (!clearConfirm) {
      ocrProgress.style.display = 'none';
      return;
    }

    graphNodes = [];
    graphEdges = [];

    // Load image to get dimensions for node positioning
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        console.log(`📐 Image dimensions: ${img.width} x ${img.height}`);
        // Calculate scale to fit in viewport
        const imgWidth = img.width;
        const imgHeight = img.height;
        const scale = Math.min(width / imgWidth, height / imgHeight, 1) * 0.8;
        const offsetX = (width - imgWidth * scale) / 2;
        const offsetY = (height - imgHeight * scale) / 2;

        // Create nodes from words at their exact positions
        const validWords = words.filter(word =>
          word && word.bbox &&
          typeof word.bbox.x0 === 'number' &&
          typeof word.bbox.y0 === 'number'
        );

        validWords.forEach((word, index) => {
          const bbox = word.bbox;
          const centerX = offsetX + (bbox.x0 + bbox.x1) / 2 * scale;
          const centerY = offsetY + (bbox.y0 + bbox.y1) / 2 * scale;

          graphNodes.push({
            id: `ocr_${Date.now()}_${index}`,
            label: word.text || word.word || 'Unknown',
            x: centerX,
            y: centerY,
            fx: centerX, // Fix position initially
            fy: centerY,
            wordBBox: bbox,
            confidence: word.confidence || null
          });
        });

        updateGraph();
        saveState();

        // Hide progress and show success
        ocrProgress.style.display = 'none';

        console.log(`✅ Created ${graphNodes.length} nodes from OCR`);
        alert(`✅ Success!\n\nCreated ${graphNodes.length} nodes from detected words.\n\nNext steps:\n• Use "🔗 Connect Mode" to manually draw connections\n• Use "🤖 Auto-Connect Similar" to link related words\n• Drag nodes to reposition them\n• Press Ctrl+S to save or "💾 Export Graph"`);

        // Reset file input
        autoOCRInput.value = '';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(imageToProcess);

  } catch (error) {
    console.error('❌ Auto-OCR failed:', error);
    ocrProgress.style.display = 'none';
    alert(`❌ OCR failed: ${error.message}\n\nPlease try:\n• A clearer image with better contrast\n• A different image format\n• An image with readable text`);
    autoOCRInput.value = '';
  }
});

// ========== ENHANCED DRAG-TO-CONNECT MODE (Basil.js/Obsidian style) ==========

/**
 * Enhanced connect mode: drag from one node to another to create connection
 * Like Obsidian's canvas or basil.js drawing
 */
let dragConnectionLine = null;
let dragConnectionSource = null;

function enableDragToConnect() {
  // Track mouse movement to show connection line
  svg.on('mousemove.connect', function(event) {
    if (!connectMode || !dragConnectionLine || !dragConnectionSource) return;

    const [mouseX, mouseY] = d3.pointer(event);
    dragConnectionLine
      .attr('x2', mouseX)
      .attr('y2', mouseY);
  });

  // Complete connection on mouseup over a node
  svg.on('mouseup.connect', function(event) {
    if (!connectMode || !dragConnectionSource) {
      cleanupDragConnection();
      return;
    }

    // Check if mouse is over a node
    const [mouseX, mouseY] = d3.pointer(event);
    const targetNode = graphNodes.find(node => {
      const dist = Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2);
      return dist < 25; // Within node radius
    });

    if (targetNode && targetNode.id !== dragConnectionSource.id) {
      // Create edge
      const edgeExists = graphEdges.some(e =>
        (e.source.id === dragConnectionSource.id && e.target.id === targetNode.id) ||
        (e.source.id === targetNode.id && e.target.id === dragConnectionSource.id)
      );

      if (!edgeExists) {
        graphEdges.push({
          source: dragConnectionSource.id,
          target: targetNode.id
        });
        console.log(`✅ Connected: ${dragConnectionSource.label} → ${targetNode.label}`);
        updateGraph();
        saveState();
      }
    }

    cleanupDragConnection();
  });
}

function cleanupDragConnection() {
  if (dragConnectionLine) {
    dragConnectionLine.remove();
    dragConnectionLine = null;
  }
  dragConnectionSource = null;
}

// Initialize drag-to-connect
enableDragToConnect();

// ========== BASIL.JS TEXT GRAPH DEMO ==========

/**
 * Classic basil.js example: "01_connecting_all_words_with_lines"
 * Connects every word from left text block to every word in right text block
 * Based on: https://basiljs.ch/gallery/
 */
let p5Instance = null;
let words1 = [];
let words2 = [];
let animating = true;
let animOffset = 0;

window.initializeP5Demo = function() {
  // Only initialize when Settings panel is opened
  if (p5Instance) return;

  const sketch = (p) => {
    p.setup = function() {
      const canvas = p.createCanvas(800, 400);
      canvas.parent('p5-demo-container');
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      p.textFont('helvetica');

      // Initial word processing
      updateWords(p);
    };

    p.draw = function() {
      p.background(248, 250, 252); // Match our #F8FAFC background

      if (animating) {
        animOffset += 0.5;
      }

      // Draw left text block words
      p.fill(79, 70, 229); // Indigo #4F46E5
      p.noStroke();
      words1.forEach(word => {
        p.text(word.text, word.x, word.y);

        // Small circle behind text
        p.fill(79, 70, 229, 50);
        p.ellipse(word.x, word.y, word.width + 10, 28);
        p.fill(79, 70, 229);
      });

      // Draw right text block words
      p.fill(139, 92, 246); // Purple #8B5CF6
      words2.forEach(word => {
        p.text(word.text, word.x, word.y);

        // Small circle behind text
        p.fill(139, 92, 246, 50);
        p.ellipse(word.x, word.y, word.width + 10, 28);
        p.fill(139, 92, 246);
      });

      // Draw connecting lines (basil.js style)
      p.strokeWeight(0.5);

      for (let i = 0; i < words1.length; i++) {
        for (let j = 0; j < words2.length; j++) {
          const w1 = words1[i];
          const w2 = words2[j];

          // Animated opacity based on connection index
          const connectionIndex = i * words2.length + j;
          const opacity = animating ?
            p.map(p.sin((animOffset + connectionIndex * 10) * 0.02), -1, 1, 20, 120) : 80;

          // Color gradient from indigo to purple
          const t = j / Math.max(1, words2.length - 1);
          const r = p.lerp(79, 139, t);
          const g = p.lerp(70, 92, t);
          const b = p.lerp(229, 246, t);

          p.stroke(r, g, b, opacity);
          p.line(w1.x, w1.y, w2.x, w2.y);
        }
      }

      // Draw connection count
      p.noStroke();
      p.fill(99, 102, 241, 200);
      p.rect(10, 10, 200, 30, 5);
      p.fill(255);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(14);
      p.text(`Connections: ${words1.length * words2.length}`, 20, 25);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
    };

    function updateWords(p) {
      const text1 = document.getElementById('basilText1')?.value || 'Hello World';
      const text2 = document.getElementById('basilText2')?.value || 'Graph Networks';

      // Extract words (split by whitespace and newlines)
      const extractWords = (text) => {
        return text.split(/\s+/).filter(w => w.trim().length > 0);
      };

      const leftWords = extractWords(text1);
      const rightWords = extractWords(text2);

      // Layout words in columns
      const leftX = 150;
      const rightX = 650;
      const startY = 100;
      const verticalSpacing = 40;

      words1 = leftWords.map((text, i) => ({
        text: text,
        x: leftX,
        y: startY + i * verticalSpacing,
        width: p.textWidth(text)
      }));

      words2 = rightWords.map((text, i) => ({
        text: text,
        x: rightX,
        y: startY + i * verticalSpacing,
        width: p.textWidth(text)
      }));
    }

    // Expose update function to global scope via sketch reference
    sketch.updateWords = updateWords;
  };

  p5Instance = new p5(sketch);
  console.log('🎨 Basil.js text graph demo initialized');
};

window.updateBasilDemo = function() {
  if (!p5Instance) return;

  // Re-process words from textareas
  const text1 = document.getElementById('basilText1')?.value || '';
  const text2 = document.getElementById('basilText2')?.value || '';

  const extractWords = (text) => {
    return text.split(/\s+/).filter(w => w.trim().length > 0);
  };

  const leftWords = extractWords(text1);
  const rightWords = extractWords(text2);

  const leftX = 150;
  const rightX = 650;
  const startY = 100;
  const verticalSpacing = 40;

  words1 = leftWords.map((text, i) => ({
    text: text,
    x: leftX,
    y: startY + i * verticalSpacing,
    width: p5Instance.textWidth(text)
  }));

  words2 = rightWords.map((text, i) => ({
    text: text,
    x: rightX,
    y: startY + i * verticalSpacing,
    width: p5Instance.textWidth(text)
  }));

  console.log(`🔄 Updated: ${words1.length} ↔ ${words2.length} = ${words1.length * words2.length} connections`);
};

window.toggleBasilAnimation = function() {
  animating = !animating;
  const btn = document.getElementById('animToggleBtn');
  if (btn) {
    btn.textContent = animating ? '⏸️ Pause Animation' : '▶️ Play Animation';
  }
  console.log(`Animation: ${animating ? 'ON' : 'OFF'}`);
};

window.saveP5Canvas = function() {
  if (!p5Instance) return;
  p5Instance.saveCanvas('basil-text-graph', 'png');
  console.log('💾 Canvas saved');
};

// Initialize p5 when Settings panel is opened
const originalToggleSettings = window.toggleSettingsPanel;
window.toggleSettingsPanel = function() {
  originalToggleSettings();
  // Initialize p5 demo after a short delay to ensure container is visible
  setTimeout(() => {
    if (document.getElementById('settings-slide-panel').classList.contains('visible')) {
      window.initializeP5Demo();
    }
  }, 100);
};

console.log('✨ Graph Queen ready with STREAMLINED workflow!');
console.log('💡 📸 Upload Image/PDF → Automatic OCR → Nodes created at word positions');
console.log('💡 🔗 Connect Mode → Drag from one node to another to draw connections');
console.log('💡 🤖 Auto-Connect → AI links similar words automatically');
console.log('💡 Drag nodes to reposition, double-click to edit labels');
console.log('💡 ⚙️ Settings → Basil.js + p5.js interactive demo included!');
console.log('💡 Keyboard: Ctrl+S (save), Ctrl+Z (undo), Ctrl+Shift+Z (redo), Delete (remove)');
