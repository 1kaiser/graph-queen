console.log('🚀 Graph Queen - Starting initialization...');

// Canvas setup for simple graph drawing
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

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

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  drawGraph();
}

// Draw simple graph lines (like in the mockup)
function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2 - 200;
  const centerY = canvas.height / 2 - 100;

  // Draw intersecting lines to represent a simple graph
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;

  // Line 1
  ctx.beginPath();
  ctx.moveTo(centerX - 100, centerY + 150);
  ctx.lineTo(centerX + 50, centerY);
  ctx.stroke();

  // Line 2
  ctx.beginPath();
  ctx.moveTo(centerX - 50, centerY - 100);
  ctx.lineTo(centerX + 100, centerY + 100);
  ctx.stroke();

  // Line 3
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 50);
  ctx.lineTo(centerX + 150, centerY + 150);
  ctx.stroke();

  // Draw nodes if any
  ctx.fillStyle = '#1976D2';
  graphNodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.fillText(node.label, node.x + 12, node.y + 4);
    ctx.fillStyle = '#1976D2';
  });

  console.log('✅ Graph drawn with', graphNodes.length, 'nodes');
}

// Initialize canvas
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

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
});

console.log('⌨️ Keyboard shortcuts enabled:');
console.log('  Ctrl+S: Save graph');
console.log('  Ctrl+Z: Undo');
console.log('  Ctrl+Shift+Z: Redo');

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
      x: Math.random() * (canvas.width - 100) + 50,
      y: Math.random() * (canvas.height - 100) + 50,
      label: text
    };
    graphNodes.push(newNode);
    drawGraph();
    saveState(); // Save state for undo/redo

    e.target.value = '';
    console.log(`📊 Added node: ${text}`);
  }
});

// ========== OCR SLIDE-IN PANEL FUNCTIONALITY ==========

// Slide panel click handler - opens the OCR panel
const slidePanel = document.getElementById('slidePanel');
const ocrSlidePanel = document.getElementById('ocrSlidePanel');

slidePanel.addEventListener('click', (e) => {
  if (e.target.tagName !== 'A') {
    console.log('🎯 Opening OCR slide-in panel...');
    ocrSlidePanel.classList.add('open');
  }
});

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

// OCR Extraction using Scribe.js
const ocrStatus = document.getElementById('ocrStatus');
const ocrResult = document.getElementById('ocrResult');
const useTextBtn = document.getElementById('useTextBtn');

extractBtn.addEventListener('click', async () => {
  if (!currentImageFile) {
    console.error('❌ No image file selected');
    return;
  }

  console.log('🔍 OCR integration in progress...');

  // Temporary placeholder - will integrate scribeocr
  ocrStatus.className = 'loading';
  ocrStatus.textContent = '⏳ ScribeOCR integration in progress... Please check back soon!';

  // For demo purposes, show a sample extraction
  setTimeout(() => {
    const sampleText = `Sample OCR Text
This is a placeholder until ScribeOCR is fully integrated.
Node 1
Node 2
Node 3`;

    ocrResult.value = sampleText;
    ocrStatus.className = 'success';
    ocrStatus.textContent = `✅ Demo text loaded (ScribeOCR integration coming soon)`;
    useTextBtn.disabled = false;
    console.log('💡 ScribeOCR will be integrated after studying the full repository');
  }, 1000);
});

// Use extracted text to create graph nodes
useTextBtn.addEventListener('click', () => {
  const text = ocrResult.value.trim();
  if (!text) return;

  console.log('📊 Adding OCR text to graph...');

  // Split text into lines and create nodes
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const newNodes = lines.slice(0, 10).map((line, i) => {
    // Clean up the line (max 30 chars)
    const label = line.trim().substring(0, 30);
    return {
      x: 100 + (i % 3) * 150,
      y: 100 + Math.floor(i / 3) * 100,
      label: label
    };
  });

  graphNodes.push(...newNodes);
  drawGraph();
  saveState(); // Save state for undo/redo

  console.log(`✅ Added ${newNodes.length} nodes from OCR text`);
  alert(`Added ${newNodes.length} nodes to the graph!`);
});

console.log('✨ Graph Queen ready with OCR!');
console.log('💡 Drag panels to reposition them');
console.log('💡 Click slide-in button to open OCR panel');
console.log('💡 Click upload button to select files');
console.log('💡 Type in text box and press Enter to add nodes');
