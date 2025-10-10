# 3D Force Graph - Clean Background Styling Guide

**Repository**: https://github.com/vasturiano/3d-force-graph
**Author**: Vasco Asturiano
**Date**: October 10, 2025

---

## Executive Summary

**3D Force-Directed Graph** is a WebGL-accelerated 3D graph visualization library using Three.js. It supports **force-directed layouts**, **DAG (Directed Acyclic Graph) modes**, and extensive customization including **clean, minimal styling** with white/light backgrounds.

### Key Features:
- ✅ **WebGL-powered**: Hardware-accelerated via Three.js
- ✅ **Force simulation**: d3-force-3d or ngraph physics engines
- ✅ **Multiple layouts**: Force-directed, DAG (tree), radial
- ✅ **Fully customizable**: Colors, sizes, shapes, backgrounds
- ✅ **Interactive**: Click, hover, drag nodes, zoom, rotate
- ✅ **Clean styling**: Easy to implement minimal, professional designs

---

## Background Color Configuration

### Default vs Clean Styling

**Default Dark Background**:
```javascript
// Default background (dark blue-black)
const graph = new ForceGraph3D(document.getElementById('graph'));
// Default: backgroundColor = '#000011'
```

**Clean White Background**:
```javascript
const graph = new ForceGraph3D(document.getElementById('graph'))
  .backgroundColor('#FFFFFF')     // Pure white
  .nodeColor('#2196F3')           // Blue nodes
  .linkColor('#90CAF9')           // Light blue links
  .linkOpacity(0.3);              // Subtle links
```

**Light Gray Background** (Recommended):
```javascript
const graph = new ForceGraph3D(document.getElementById('graph'))
  .backgroundColor('#F5F5F5')     // Light gray (better contrast)
  .nodeColor('#1976D2')           // Darker blue nodes
  .linkColor('#64B5F6')           // Medium blue links
  .linkOpacity(0.4);
```

### Background Color API

```javascript
// Getter/setter for background color
graph.backgroundColor([color: string])

// Examples
graph.backgroundColor('#FFFFFF');          // White
graph.backgroundColor('#F5F5F5');          // Light gray
graph.backgroundColor('#FAFAFA');          // Very light gray
graph.backgroundColor('#E3F2FD');          // Light blue tint
graph.backgroundColor('rgb(255,255,255)'); // RGB format
graph.backgroundColor('white');            // CSS color names
```

---

## Complete Clean Styling Implementation

### Example 1: Minimal White Background

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Clean 3D Graph</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #FFFFFF;
    }
    #graph {
      width: 100vw;
      height: 100vh;
    }
  </style>
  <script src="//cdn.jsdelivr.net/npm/3d-force-graph"></script>
</head>
<body>
  <div id="graph"></div>

  <script>
    // Sample data
    const nodes = [
      { id: 1, name: 'Node 1', group: 1 },
      { id: 2, name: 'Node 2', group: 1 },
      { id: 3, name: 'Node 3', group: 2 },
      { id: 4, name: 'Node 4', group: 2 },
      { id: 5, name: 'Node 5', group: 3 },
    ];

    const links = [
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
      { source: 4, target: 5 },
      { source: 5, target: 1 },
    ];

    // Create graph with clean white styling
    const graph = new ForceGraph3D(document.getElementById('graph'))
      .graphData({ nodes, links })

      // ✨ CLEAN BACKGROUND
      .backgroundColor('#FFFFFF')

      // Node styling
      .nodeLabel('name')
      .nodeAutoColorBy('group')        // Auto-color by group
      .nodeOpacity(0.9)                // Slight transparency
      .nodeResolution(16)              // Smooth spheres

      // Link styling
      .linkColor(() => '#BBDEFB')      // Light blue links
      .linkOpacity(0.3)                // Subtle connections
      .linkWidth(1)                    // Thin lines

      // Camera
      .cameraPosition({ z: 400 })

      // Interactions
      .onNodeClick(node => {
        console.log('Clicked:', node.name);
      })
      .onNodeHover(node => {
        document.body.style.cursor = node ? 'pointer' : 'default';
      });

    // Fit graph to view
    graph.zoomToFit(400);
  </script>
</body>
</html>
```

### Example 2: Light Gray with Material Design Colors

```javascript
const graph = new ForceGraph3D(document.getElementById('graph'))
  .graphData(data)

  // ✨ MATERIAL DESIGN CLEAN STYLING
  .backgroundColor('#FAFAFA')           // Material light background

  // Nodes
  .nodeLabel('name')
  .nodeVal('size')
  .nodeColor(node => {
    // Material Design color palette
    const colors = {
      1: '#1976D2',  // Blue
      2: '#388E3C',  // Green
      3: '#D32F2F',  // Red
      4: '#7B1FA2',  // Purple
      5: '#F57C00',  // Orange
    };
    return colors[node.group] || '#757575';
  })
  .nodeOpacity(0.95)

  // Links
  .linkColor(() => '#90A4AE')          // Blue gray
  .linkOpacity(0.2)                    // Very subtle
  .linkWidth(0.5)

  // Lighting (adjusted for light background)
  .lights([
    new THREE.AmbientLight(0x808080, 3),      // Ambient light
    new THREE.DirectionalLight(0xffffff, 1.5) // Directional light
  ])

  // Show navigation info
  .showNavInfo(true);
```

### Example 3: Professional Light Blue Tint

```javascript
const graph = new ForceGraph3D(document.getElementById('graph'))
  .graphData(data)

  // ✨ SOFT BLUE BACKGROUND
  .backgroundColor('#E3F2FD')          // Light blue tint

  // Nodes with depth
  .nodeLabel('name')
  .nodeVal('connections')
  .nodeColor(node => {
    const intensity = node.connections || 1;
    const base = 0x1565C0;  // Dark blue
    return `#${(base - intensity * 0x100000).toString(16)}`;
  })
  .nodeOpacity(0.9)
  .nodeResolution(20)                  // High quality spheres

  // Gradient links
  .linkColor(() => '#42A5F5')          // Medium blue
  .linkOpacity(0.25)
  .linkWidth(link => Math.sqrt(link.value || 1))
  .linkDirectionalParticles(2)         // Animated particles
  .linkDirectionalParticleSpeed(0.005)
  .linkDirectionalParticleColor(() => '#1976D2')

  // Camera animation
  .cameraPosition({ z: 600 }, { x: 0, y: 0, z: 0 }, 1000);
```

---

## Complete Styling Options for Clean Backgrounds

### 1. **Background Colors**

Recommended clean background options:

```javascript
// Pure white (high contrast)
.backgroundColor('#FFFFFF')

// Light gray (softer, better for long viewing)
.backgroundColor('#F5F5F5')
.backgroundColor('#FAFAFA')
.backgroundColor('#F8F9FA')

// Subtle tints (adds character)
.backgroundColor('#E3F2FD')  // Light blue
.backgroundColor('#F3E5F5')  // Light purple
.backgroundColor('#E8F5E9')  // Light green
.backgroundColor('#FFF3E0')  // Light orange

// Off-white (warm)
.backgroundColor('#FFF8E1')
.backgroundColor('#FFFDE7')
```

### 2. **Node Colors for Light Backgrounds**

Use **darker, saturated colors** for visibility:

```javascript
// Single color scheme
.nodeColor('#1976D2')        // Dark blue
.nodeColor('#388E3C')        // Dark green
.nodeColor('#D32F2F')        // Red
.nodeColor('#7B1FA2')        // Purple

// Multi-color by group
.nodeColor(node => {
  const palette = [
    '#1976D2',  // Blue
    '#388E3C',  // Green
    '#D32F2F',  // Red
    '#F57C00',  // Orange
    '#7B1FA2',  // Purple
    '#00796B',  // Teal
  ];
  return palette[node.group % palette.length];
})

// Dynamic coloring by value
.nodeColor(node => {
  const value = node.value || 0;
  const hue = value * 240;  // Blue to red gradient
  return `hsl(${240 - hue}, 70%, 45%)`;
})
```

### 3. **Link Colors for Light Backgrounds**

Use **light, desaturated colors**:

```javascript
// Subtle gray
.linkColor(() => '#BDBDBD')
.linkOpacity(0.2)

// Light blue (recommended)
.linkColor(() => '#90CAF9')
.linkOpacity(0.3)

// Adaptive (matches node colors)
.linkColor(link => {
  const sourceColor = link.source.color || '#BDBDBD';
  return sourceColor;
})
.linkOpacity(0.2)

// Gradient links
.linkColor(link => {
  // Calculate gradient between source and target
  return calculateGradient(link.source.color, link.target.color);
})
```

### 4. **Lighting for Light Backgrounds**

Adjust lighting for better visibility:

```javascript
// Default lights (work for dark backgrounds)
// Need adjustment for light backgrounds

// Adjusted for light backgrounds
.lights([
  new THREE.AmbientLight(0x808080, 2.5),        // Stronger ambient
  new THREE.DirectionalLight(0xffffff, 1.0),    // Softer directional
  new THREE.DirectionalLight(0xffffff, 0.3)     // Fill light from below
    .position.set(0, -1, 0)
])
```

### 5. **Complete Material Design Theme**

```javascript
const MaterialDesignGraph = new ForceGraph3D(container)
  .graphData(data)

  // Background
  .backgroundColor('#FAFAFA')

  // Nodes
  .nodeLabel('name')
  .nodeVal('size')
  .nodeAutoColorBy('category')
  .nodeOpacity(0.9)
  .nodeResolution(16)

  // Links
  .linkColor(() => '#CFD8DC')    // Blue gray 100
  .linkOpacity(0.25)
  .linkWidth(0.8)

  // Lighting
  .lights([
    new THREE.AmbientLight(0x808080, 2.5),
    new THREE.DirectionalLight(0xffffff, 1.2)
  ])

  // Interactions
  .enableNodeDrag(true)
  .onNodeHover(node => {
    container.style.cursor = node ? 'pointer' : 'default';
  });
```

---

## Advanced Clean Styling Techniques

### 1. **Glassmorphism Effect**

```javascript
const graph = new ForceGraph3D(container)
  .backgroundColor('rgba(255, 255, 255, 0.1)')  // Semi-transparent
  .nodeColor(() => 'rgba(33, 150, 243, 0.8)')   // Translucent nodes
  .nodeOpacity(0.7)
  .linkColor(() => 'rgba(255, 255, 255, 0.15)')
  .linkOpacity(0.5);

// Add backdrop-filter via CSS
container.style.backdropFilter = 'blur(10px)';
```

### 2. **Monochrome Minimalist**

```javascript
const graph = new ForceGraph3D(container)
  .backgroundColor('#FFFFFF')
  .nodeColor(() => '#000000')     // Black nodes
  .nodeOpacity(0.8)
  .linkColor(() => '#9E9E9E')     // Gray links
  .linkOpacity(0.15)
  .linkWidth(0.5);
```

### 3. **Soft Gradient Background**

```javascript
// Use CSS gradient background
const container = document.getElementById('graph');
container.style.background = 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%)';

const graph = new ForceGraph3D(container)
  .backgroundColor('transparent')  // Let CSS gradient show
  .nodeColor(() => '#1976D2')
  .linkColor(() => '#90CAF9')
  .linkOpacity(0.3);
```

### 4. **High Contrast Accessibility**

```javascript
const graph = new ForceGraph3D(container)
  .backgroundColor('#FFFFFF')
  .nodeColor(node => {
    // WCAG AA compliant colors
    const colors = {
      A: '#0D47A1',  // Dark blue (4.5:1 contrast)
      B: '#1B5E20',  // Dark green (4.5:1 contrast)
      C: '#B71C1C',  // Dark red (4.5:1 contrast)
    };
    return colors[node.type] || '#000000';
  })
  .nodeOpacity(1.0)      // Full opacity for clarity
  .linkColor(() => '#616161')  // Dark gray (high contrast)
  .linkOpacity(0.6)
  .linkWidth(2);         // Thicker links for visibility
```

### 5. **Paper/Print Style**

```javascript
const graph = new ForceGraph3D(container)
  .backgroundColor('#FFFFFF')
  .nodeColor(() => '#000000')
  .nodeOpacity(1.0)
  .linkColor(() => '#000000')
  .linkOpacity(0.3)
  .linkWidth(1)
  .showNavInfo(false)    // Hide UI for cleaner look

  // Disable lighting for flat appearance
  .lights([
    new THREE.AmbientLight(0xFFFFFF, 3)  // Flat, even lighting
  ]);
```

---

## Complete Working Example: Clean Dashboard

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clean 3D Graph Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #FAFAFA;
      color: #333;
    }

    .container {
      display: flex;
      height: 100vh;
    }

    .sidebar {
      width: 300px;
      background: #FFFFFF;
      padding: 20px;
      box-shadow: 2px 0 8px rgba(0,0,0,0.05);
      overflow-y: auto;
    }

    .sidebar h1 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #1976D2;
    }

    .control-group {
      margin-bottom: 20px;
    }

    .control-group label {
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
      color: #666;
    }

    .control-group input,
    .control-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #E0E0E0;
      border-radius: 4px;
      font-size: 14px;
    }

    .btn {
      width: 100%;
      padding: 10px;
      background: #1976D2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
    }

    .btn:hover {
      background: #1565C0;
    }

    #graph {
      flex: 1;
      background: #FFFFFF;
    }

    .info-panel {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 300px;
      display: none;
    }

    .info-panel.active {
      display: block;
    }
  </style>
  <script src="//cdn.jsdelivr.net/npm/3d-force-graph"></script>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <h1>3D Graph Controls</h1>

      <div class="control-group">
        <label>Background Color</label>
        <input type="color" id="bgColor" value="#FFFFFF">
      </div>

      <div class="control-group">
        <label>Node Color</label>
        <input type="color" id="nodeColor" value="#1976D2">
      </div>

      <div class="control-group">
        <label>Link Opacity</label>
        <input type="range" id="linkOpacity" min="0" max="100" value="30">
        <span id="linkOpacityValue">30%</span>
      </div>

      <div class="control-group">
        <label>Layout</label>
        <select id="layout">
          <option value="">Force Directed</option>
          <option value="td">Top-Down (DAG)</option>
          <option value="bu">Bottom-Up (DAG)</option>
          <option value="lr">Left-Right (DAG)</option>
          <option value="rl">Right-Left (DAG)</option>
          <option value="radialout">Radial Out</option>
        </select>
      </div>

      <button class="btn" onclick="graph.zoomToFit(400)">
        Fit to View
      </button>

      <button class="btn" onclick="generateRandomGraph()">
        Randomize Data
      </button>
    </div>

    <div style="flex: 1; position: relative;">
      <div id="graph"></div>
      <div class="info-panel" id="infoPanel">
        <h3 id="nodeTitle"></h3>
        <p id="nodeDetails"></p>
      </div>
    </div>
  </div>

  <script>
    // Generate sample data
    function generateData(numNodes = 50) {
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

      // Create links
      for (let i = 0; i < numNodes * 2; i++) {
        const source = Math.floor(Math.random() * numNodes);
        const target = Math.floor(Math.random() * numNodes);
        if (source !== target) {
          links.push({ source, target, value: Math.random() });
        }
      }

      return { nodes, links };
    }

    // Initialize graph
    const graph = new ForceGraph3D(document.getElementById('graph'))
      .graphData(generateData())

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
        const panel = document.getElementById('infoPanel');
        document.getElementById('nodeTitle').textContent = node.name;
        document.getElementById('nodeDetails').textContent =
          `Group: ${node.group}\\nValue: ${node.value.toFixed(2)}\\nConnections: ${node.neighbors?.length || 0}`;
        panel.classList.add('active');
      })
      .onNodeHover(node => {
        document.body.style.cursor = node ? 'pointer' : 'default';
      })
      .onBackgroundClick(() => {
        document.getElementById('infoPanel').classList.remove('active');
      });

    // Event listeners
    document.getElementById('bgColor').addEventListener('input', (e) => {
      graph.backgroundColor(e.target.value);
    });

    document.getElementById('nodeColor').addEventListener('input', (e) => {
      graph.nodeColor(() => e.target.value);
    });

    document.getElementById('linkOpacity').addEventListener('input', (e) => {
      const value = e.target.value / 100;
      graph.linkOpacity(value);
      document.getElementById('linkOpacityValue').textContent = e.target.value + '%';
    });

    document.getElementById('layout').addEventListener('change', (e) => {
      graph.dagMode(e.target.value || null);
    });

    function generateRandomGraph() {
      const numNodes = Math.floor(Math.random() * 50) + 30;
      graph.graphData(generateData(numNodes));
      setTimeout(() => graph.zoomToFit(400), 100);
    }

    // Initial fit
    setTimeout(() => graph.zoomToFit(400), 100);
  </script>
</body>
</html>
```

---

## Color Palettes for Clean Backgrounds

### Material Design Palette

```javascript
const MaterialColors = {
  // Primary colors (dark, high contrast)
  Blue:   '#1976D2',
  Green:  '#388E3C',
  Red:    '#D32F2F',
  Purple: '#7B1FA2',
  Orange: '#F57C00',
  Teal:   '#00796B',

  // Link colors (light, subtle)
  LinkBlue:  '#90CAF9',
  LinkGreen: '#A5D6A7',
  LinkRed:   '#EF9A9A',
  LinkGray:  '#CFD8DC',

  // Backgrounds
  White:     '#FFFFFF',
  LightGray: '#FAFAFA',
  LightBlue: '#E3F2FD',
};
```

### Corporate/Professional Palette

```javascript
const CorporateColors = {
  // Nodes
  Primary:   '#003D6B',  // Deep blue
  Secondary: '#0066A1',  // Medium blue
  Accent:    '#E67E22',  // Orange

  // Links
  LinkLight: '#B0BEC5',  // Blue gray

  // Background
  Background: '#F8F9FA',
};
```

### Pastel/Soft Palette

```javascript
const PastelColors = {
  // Nodes (saturated for visibility)
  Pink:   '#E91E63',
  Purple: '#9C27B0',
  Blue:   '#2196F3',
  Teal:   '#009688',
  Green:  '#4CAF50',

  // Links (very subtle)
  LinkPink:   '#F8BBD0',
  LinkPurple: '#E1BEE7',
  LinkBlue:   '#BBDEFB',

  // Background
  Background: '#FAFAFA',
};
```

---

## Performance Tips for Large Graphs

### 1. **Reduce Visual Quality**

```javascript
const graph = new ForceGraph3D(container)
  .nodeResolution(8)      // Lower resolution (default: 8)
  .linkResolution(4)      // Lower resolution (default: 6)
  .cooldownTicks(100);    // Stop simulation faster
```

### 2. **Simplify Rendering**

```javascript
const graph = new ForceGraph3D(container)
  .nodeOpacity(0.8)       // Slight transparency = faster
  .linkWidth(0)           // Lines instead of cylinders
  .linkOpacity(0.2)       // Lower = faster
  .enablePointerInteraction(false);  // Disable if not needed
```

### 3. **Use DAG Mode for Trees**

```javascript
const graph = new ForceGraph3D(container)
  .dagMode('td')          // Much faster than force simulation
  .dagLevelDistance(100);
```

---

## Comparison: Dark vs Light Backgrounds

| Aspect | Dark Background | Light Background |
|--------|----------------|------------------|
| **Default** | `#000011` | Custom required |
| **Node colors** | Bright, saturated | Darker, muted |
| **Link opacity** | 0.2-0.4 | 0.2-0.3 |
| **Best for** | Presentations, demos | Dashboards, reports |
| **Eye strain** | Lower (dark = easier) | Higher (use subtle grays) |
| **Print/Screenshot** | Poor (loses detail) | Excellent |
| **Accessibility** | Lower contrast | Higher contrast (if done right) |
| **Professional** | Tech/Gaming aesthetic | Business/Corporate |

**Recommendation**: Use **light gray (#F5F5F5)** instead of pure white for long-term viewing comfort.

---

## Troubleshooting Clean Backgrounds

### Problem 1: Nodes Too Light / Hard to See

**Solution**: Use darker, more saturated colors

```javascript
// ❌ Too light
.nodeColor(() => '#90CAF9')

// ✅ Good contrast
.nodeColor(() => '#1976D2')
```

### Problem 2: Links Dominate the View

**Solution**: Reduce link opacity

```javascript
// ❌ Too visible
.linkOpacity(0.5)

// ✅ Subtle
.linkOpacity(0.2)
```

### Problem 3: Graph Looks Washed Out

**Solution**: Adjust lighting

```javascript
// ❌ Default lighting (too bright for light backgrounds)
// (default)

// ✅ Adjusted lighting
.lights([
  new THREE.AmbientLight(0x808080, 2),
  new THREE.DirectionalLight(0xffffff, 0.8)
])
```

### Problem 4: Background Not Showing

**Solution**: Check CSS and container styling

```javascript
// Ensure container has no background
#graph {
  background: transparent;  // Let graph background show
}

// Set graph background
graph.backgroundColor('#FFFFFF');
```

---

## Best Practices for Clean Styling

### ✅ DO:

1. **Use light gray backgrounds** (#F5F5F5) instead of pure white
2. **Use dark, saturated node colors** for visibility
3. **Keep link opacity low** (0.2-0.3) for subtlety
4. **Adjust lighting** for light backgrounds
5. **Test accessibility** (WCAG contrast ratios)
6. **Provide hover feedback** (cursor changes, highlights)
7. **Use consistent color schemes** (Material Design, etc.)

### ❌ DON'T:

1. **Don't use pure white** (#FFFFFF) without careful color selection
2. **Don't use light node colors** on light backgrounds
3. **Don't overdo link visibility** (keeps focus on nodes)
4. **Don't ignore lighting** (default is for dark backgrounds)
5. **Don't forget mobile** (test responsive behavior)
6. **Don't use too many colors** (limit palette to 5-6)

---

## Conclusion

### Key Takeaways:

1. **Background Color Control**: Simple `.backgroundColor('#FFFFFF')` method
2. **Clean Styling**: Requires coordinated node colors, link opacity, and lighting
3. **Best Background**: Light gray (#F5F5F5) for professional dashboards
4. **Color Selection**: Use Material Design or corporate palettes
5. **Performance**: Light backgrounds don't affect performance

### Recommended Clean Setup:

```javascript
const graph = new ForceGraph3D(container)
  .graphData(data)
  .backgroundColor('#F5F5F5')          // Light gray
  .nodeAutoColorBy('group')             // Auto-color
  .nodeOpacity(0.9)                     // Slight transparency
  .linkColor(() => '#90CAF9')           // Light blue
  .linkOpacity(0.25)                    // Subtle
  .linkWidth(1)                         // Thin
  .lights([
    new THREE.AmbientLight(0x808080, 2.5),
    new THREE.DirectionalLight(0xffffff, 1.0)
  ]);
```

### Use Cases:

- **White/Light backgrounds**: Business dashboards, reports, documentation
- **Dark backgrounds**: Presentations, demos, gaming/tech aesthetics
- **Colored tints**: Branding, thematic consistency

**Perfect for**: Knowledge graphs, network visualization, organizational charts, dependency graphs, social networks

---

*Guide completed: October 10, 2025*
*Repository: https://github.com/vasturiano/3d-force-graph*
