import ForceGraph3D from '3d-force-graph';

console.log('🚀 3D Force Graph Demo - Starting initialization...');

// Generate sample data
function generateData(numNodes = 50) {
  console.log(`📊 Generating graph data with ${numNodes} nodes...`);

  const nodes = [];
  const links = [];

  // Create nodes
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      id: i,
      name: `Node ${i}`,
      group: Math.floor(Math.random() * 5),
      value: Math.random() * 10 + 1
    });
  }

  // Create links (approximately 2-3 links per node)
  const numLinks = Math.floor(numNodes * 2.5);
  for (let i = 0; i < numLinks; i++) {
    const source = Math.floor(Math.random() * numNodes);
    const target = Math.floor(Math.random() * numNodes);
    if (source !== target) {
      links.push({
        source,
        target,
        value: Math.random()
      });
    }
  }

  console.log(`✅ Generated ${nodes.length} nodes and ${links.length} links`);
  return { nodes, links };
}

// Update stats display
function updateStats(data) {
  document.getElementById('nodeCountDisplay').textContent = data.nodes.length;
  document.getElementById('linkCountDisplay').textContent = data.links.length;
  document.getElementById('statusDisplay').textContent = 'Active';
  console.log(`📈 Stats updated - Nodes: ${data.nodes.length}, Links: ${data.links.length}`);
}

// Initialize graph
console.log('🎨 Initializing 3D Force Graph...');
let isPaused = false;

const graphData = generateData();
const graph = ForceGraph3D(document.getElementById('graph'))
  .graphData(graphData)

  // ✨ CLEAN STYLING
  .backgroundColor('#FFFFFF')

  // Nodes
  .nodeLabel('name')
  .nodeVal('value')
  .nodeAutoColorBy('group')
  .nodeOpacity(0.9)
  .nodeResolution(16)

  // Links
  .linkColor(() => '#90CAF9')
  .linkOpacity(0.3)
  .linkWidth(1)

  // Interactions
  .onNodeClick((node, event) => {
    console.log('🖱️ Node clicked:', node.name, node);
    const panel = document.getElementById('infoPanel');
    document.getElementById('nodeTitle').textContent = node.name;
    document.getElementById('nodeDetails').textContent =
      `Group: ${node.group}\nValue: ${node.value.toFixed(2)}\nID: ${node.id}`;
    panel.classList.add('active');
  })
  .onNodeHover(node => {
    document.body.style.cursor = node ? 'pointer' : 'default';
    if (node) {
      console.log('👆 Hovering node:', node.name);
    }
  })
  .onBackgroundClick(() => {
    console.log('🖱️ Background clicked');
    document.getElementById('infoPanel').classList.remove('active');
  });

console.log('✅ Graph initialized successfully');

// Remove loading indicator
setTimeout(() => {
  const loading = document.getElementById('loading');
  if (loading) loading.remove();
  updateStats(graphData);
}, 500);

// Event listeners
document.getElementById('bgColor').addEventListener('input', (e) => {
  console.log('🎨 Background color changed to:', e.target.value);
  graph.backgroundColor(e.target.value);
});

document.getElementById('nodeColor').addEventListener('input', (e) => {
  console.log('🎨 Node color changed to:', e.target.value);
  graph.nodeColor(() => e.target.value);
});

document.getElementById('linkOpacity').addEventListener('input', (e) => {
  const value = e.target.value / 100;
  console.log('🎨 Link opacity changed to:', value);
  graph.linkOpacity(value);
  document.getElementById('linkOpacityValue').textContent = e.target.value + '%';
});

document.getElementById('layout').addEventListener('change', (e) => {
  const layout = e.target.value || null;
  console.log('📐 Layout changed to:', layout || 'Force Directed');
  graph.dagMode(layout);
});

document.getElementById('zoomFitBtn').addEventListener('click', () => {
  console.log('🔍 Fitting graph to view...');
  graph.zoomToFit(400);
});

document.getElementById('regenerateBtn').addEventListener('click', () => {
  const nodeCount = parseInt(document.getElementById('nodeCount').value) || 50;
  console.log(`🔄 Regenerating graph with ${nodeCount} nodes...`);
  const newData = generateData(nodeCount);
  graph.graphData(newData);
  updateStats(newData);
  setTimeout(() => graph.zoomToFit(400), 100);
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  isPaused = !isPaused;
  const btn = document.getElementById('pauseBtn');
  if (isPaused) {
    console.log('⏸️ Pausing animation...');
    graph.pauseAnimation();
    btn.textContent = '▶️ Resume Animation';
    document.getElementById('statusDisplay').textContent = 'Paused';
  } else {
    console.log('▶️ Resuming animation...');
    graph.resumeAnimation();
    btn.textContent = '⏸️ Pause Animation';
    document.getElementById('statusDisplay').textContent = 'Active';
  }
});

// Initial fit
setTimeout(() => {
  console.log('🔍 Initial zoom to fit...');
  graph.zoomToFit(400);
}, 500);

// Expose graph globally for debugging
window.graph = graph;
window.generateData = generateData;

console.log('✨ Demo ready! Graph available as window.graph');
console.log('💡 Use window.generateData(n) to generate new data');
