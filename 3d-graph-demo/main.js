console.log('🚀 Graph Queen - Starting initialization...');

// Canvas setup for simple graph drawing
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

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

  console.log('✅ Simple graph drawn');
}

// Initialize canvas
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

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
  if (e.key === 'Enter') {
    console.log(`✅ Enter pressed with text: "${e.target.value}"`);
    // You can add functionality here to create nodes/edges based on text input
  }
});

// Slide panel click handler (can be used to show/hide additional content)
const slidePanel = document.getElementById('slidePanel');
slidePanel.addEventListener('click', (e) => {
  if (e.target.tagName !== 'A') {
    console.log('🎯 Slide panel clicked - could trigger slide-in functionality');
    // Add slide-in panel functionality here if needed
  }
});

console.log('✨ Graph Queen ready!');
console.log('💡 Drag panels to reposition them');
console.log('💡 Click upload button to select files');
console.log('💡 Type in text box to add content');
