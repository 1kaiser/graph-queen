# Graph Queen 👑

**Transform documents into interactive knowledge graphs with automatic OCR and AI-powered connections**

<div align="center">

![Graph Queen Demo](demo.gif)

**[🚀 Live Demo](https://1kaiser.github.io/graph-queen/)** | **[📦 GitHub](https://github.com/1kaiser/graph-queen)** | **[📖 Documentation](#features)** | **[🧪 Testing](#testing)**

</div>

---

## ✨ What is Graph Queen?

Graph Queen is an intelligent document visualization tool that converts images and PDFs into interactive knowledge graphs. Simply upload a document, and watch as OCR technology extracts every word, positions them at their exact locations, and overlays them on the original image - creating a powerful visual representation of your content.

### 🎯 Key Highlights

- **📸 Automatic OCR** - Upload images or PDFs and instantly extract all text with bounding boxes
- **🖼️ Image Background** - See your original document as a semi-transparent background
- **🎨 Interactive Graph** - Nodes positioned at exact word locations from the document
- **🔗 Smart Connections** - Manually draw connections or use AI to auto-connect similar words
- **🔍 Zoom & Pan** - Smooth, infinite zoom and pan capabilities with wheel and drag
- **🎤 Voice Input** - Speak to create new nodes (Web Speech API)
- **💾 Export** - Save your graph as JSON with full metadata

---

## 🚀 Quick Start

### Try it Online

Visit **[https://1kaiser.github.io/graph-queen/](https://1kaiser.github.io/graph-queen/)** and upload any image or PDF!

### Run Locally

```bash
# Clone the repository
git clone https://github.com/1kaiser/graph-queen.git
cd graph-queen

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see Graph Queen in action!

---

## 📸 Complete Workflow

### Step 1: Upload Document
Click "📸 Upload Image/PDF" and select any document image or PDF file.

### Step 2: Automatic OCR Processing
Graph Queen automatically:
- 🔍 Extracts all text using Tesseract.js OCR
- 📦 Gets word-level bounding boxes
- 🎯 Creates nodes at exact word positions
- 🖼️ Displays original image as background

### Step 3: Interact with Your Graph
- **Zoom**: Mouse wheel to zoom in/out
- **Pan**: Click and drag on canvas
- **Select**: Click any node to select it (turns orange)
- **Edit**: Double-click a node to edit its label
- **Delete**: Select nodes and press Delete/Backspace

### Step 4: Create Connections
**Manual Mode:**
1. Click "🔗 Connect Mode" (turns ON)
2. Drag from one node to another to draw a connection
3. Click "🔗 Connect Mode" again to turn OFF

**Auto-Connect Mode:**
1. Click "🤖 Auto-Connect Similar"
2. Enter similarity threshold (0-100%)
3. Graph Queen automatically connects similar words using:
   - Levenshtein distance
   - Cosine similarity (character bigrams)

### Step 5: Export Your Work
Click "💾 Export Graph" to download JSON with:
- All nodes with labels and positions
- All edges with connections
- OCR metadata and confidence scores
- Graph statistics (avg degree, density)

---

## 🎨 Features

### Document Processing

#### 📄 Supported Formats
- **Images**: JPG, PNG, WEBP, BMP
- **PDFs**: Single or multi-page documents (processes first page)

#### 🔍 OCR Technology
- **Engine**: Tesseract.js (WebAssembly)
- **Speed**: Typically 5-15 seconds per document
- **Accuracy**: Word-level bounding boxes with confidence scores
- **Languages**: English (extendable to 100+ languages)

### Graph Visualization

#### 🎯 Node Features
- **Positioning**: Nodes placed at exact word locations from OCR
- **Labels**: Permanent labels above each node
- **Colors**:
  - Default: Indigo (#6366F1)
  - Selected: Amber (#F59E0B)
  - Hovered: Purple (#8B5CF6)
- **Interactions**:
  - Click to select
  - Double-click to edit label
  - Hover to see connections
  - Drag to reposition (position is fixed after drag)

#### 🔗 Edge Features
- **Creation**: Manual drag-to-connect or auto-connect
- **Colors**:
  - Default: Slate (#94A3B8)
  - Selected: Red (#EF4444)
  - Hovered: Purple (#8B5CF6)
- **Metadata**: Stores similarity scores for auto-connections

#### 🖼️ Background Image
- **Display**: Semi-transparent overlay (60% opacity)
- **Zoom**: Image scales with graph zoom level
- **Positioning**: Centered and fitted to viewport
- **Persistence**: Remains visible throughout workflow

### Smart Features

#### 🤖 AI-Powered Auto-Connect
Connects similar words automatically using dual similarity metrics:

**Levenshtein Distance:**
- Calculates character-level edit distance
- Best for catching typos and variations
- Example: "color" and "colour" = 83% similar

**Cosine Similarity (Character Bigrams):**
- Analyzes character pair frequencies
- Best for detecting semantic similarity
- Example: "graph" and "graphics" = 75% similar

**Combined Score:**
- Takes average of both metrics
- Configurable threshold (default 60%)
- Creates edges only when threshold is exceeded

#### 🎤 Voice Input
- **Activation**: Click microphone button 🎤
- **Recording**: Button turns red 🔴
- **Result**: Transcribed text added to text box
- **Browser Support**: Chrome, Edge, Safari (Web Speech API)

### User Interface

#### 🎛️ Control Panel
- **📸 Upload Image/PDF** - Trigger automatic OCR workflow
- **🔗 Connect Mode** - Toggle manual connection drawing
- **🤖 Auto-Connect Similar** - AI-powered connection creation
- **💾 Export Graph** - Download graph as JSON
- **🗑️ Clear Background** - Remove image overlay

#### 🎨 Top Toggles
- **📸 OCR** - Manual OCR panel (advanced options)
- **❓ Help** - Usage instructions and keyboard shortcuts
- **⚙️ Settings** - Basil.js text graph demo

#### ⌨️ Keyboard Shortcuts
- `Ctrl+S` - Save graph to JSON
- `Ctrl+Z` - Undo last action
- `Ctrl+Shift+Z` - Redo
- `Delete` / `Backspace` - Delete selected nodes/edges

---

## 🛠️ Technology Stack

### Core Libraries
- **[D3.js](https://d3js.org/)** v7 - Data visualization and force simulation
- **[Tesseract.js](https://tesseract.projectnaptha.com/)** v5 - OCR engine (WebAssembly)
- **[PDF.js](https://mozilla.github.io/pdf.js/)** v5.4 - PDF rendering
- **[p5.js](https://p5js.org/)** v1.9 - Settings panel demonstrations

### Build & Development
- **[Vite](https://vitejs.dev/)** v5.4 - Build tool and dev server
- **[Playwright](https://playwright.dev/)** v1.48 - End-to-end testing
- **Chrome Canary** - Testing browser (WebGPU support)

### Deployment
- **[GitHub Pages](https://pages.github.com/)** - Static site hosting
- **[gh-pages](https://www.npmjs.com/package/gh-pages)** - Automated deployment

---

## 🧪 Testing

### Local Testing

```bash
# Run all tests against local dev server
npm test

# Run tests with visible browser
npm run test:headed

# Run specific test suite
npx playwright test tests/local-image-background-test.spec.js

# Open test report
npx playwright show-report
```

### Deployed Site Testing

```bash
# Test production deployment
npm run test:deployed

# Test specific deployed feature
npx playwright test tests/deployed-visual-inspection.spec.js
```

### Test Coverage

**Comprehensive Test Suites:**
- ✅ **Local Build Tests** (18 tests) - Page load, UI elements, controls, functionality
- ✅ **Deployed Build Tests** (18 tests) - Production site verification
- ✅ **OCR Workflow Tests** - Full automatic OCR pipeline
- ✅ **Image Background Tests** - Background image display verification
- ✅ **Visual Inspection Tests** - Step-by-step workflow validation

**Test Features:**
- 📹 Video recording for demos
- 📸 Screenshot capture on failure
- 🔍 Console log monitoring
- ⚡ Parallel execution (4 workers)
- 🎯 Chrome-specific testing (WebGPU support)

---

## 📁 Project Structure

```
graph-queen/
├── index.html                              # Main application HTML
├── main.js                                 # Core application logic (2000+ lines)
├── package.json                            # Dependencies and scripts
├── vite.config.js                          # Vite build configuration
├── playwright.config.js                    # Playwright test configuration
├── demo.gif                                # Demonstration GIF for README
├── tests/
│   ├── comprehensive.spec.js               # Full test suite (local + deployed)
│   ├── deployed-visual-inspection.spec.js  # Deployed site visual tests
│   ├── local-image-background-test.spec.js # Image background feature test
│   ├── deployed-image-background-quick-test.spec.js
│   └── demo-recording.spec.js              # Demo video recording test
└── test-results/
    └── playwright-report/                  # Test screenshots and videos
```

---

## 🎨 Design Philosophy

### Visual Design
- **Modern Flat UI** - Clean 2D interface, no unnecessary shadows
- **Color Palette**: Tailwind-inspired (Indigo, Amber, Purple, Slate)
- **Typography**: System fonts with modern sans-serif fallbacks
- **Background**: Light gray (#F8FAFC) for better contrast

### User Experience
- **Zero Configuration** - Works immediately after page load
- **Progressive Enhancement** - Core features work without advanced APIs
- **Responsive Design** - Adapts to different screen sizes
- **Keyboard Accessible** - Full keyboard navigation support

### Performance
- **WebAssembly** - OCR processing runs at near-native speed
- **Web Workers** - OCR runs off main thread (when supported)
- **Canvas Rendering** - Efficient SVG-based visualization
- **Lazy Loading** - Heavy libraries loaded on demand

---

## 📖 API & Architecture

### Graph Data Structure

```javascript
{
  "nodes": [
    {
      "id": "ocr_1696123456789_0",
      "label": "Hello",
      "x": 320.5,
      "y": 125.8,
      "fx": 320.5,  // Fixed X position
      "fy": 125.8,  // Fixed Y position
      "wordBBox": {
        "x0": 40, "y0": 53,
        "x1": 101, "y1": 76
      },
      "confidence": 89.5
    }
  ],
  "edges": [
    {
      "source": "ocr_1696123456789_0",
      "target": "ocr_1696123456789_1",
      "similarity": 0.75  // For auto-connected edges
    }
  ]
}
```

### Export Format

```javascript
{
  "metadata": {
    "exported": "2025-10-11T12:34:56.789Z",
    "nodeCount": 46,
    "edgeCount": 14,
    "graphQueenVersion": "1.0.0",
    "hasOCRData": true
  },
  "nodes": [...],  // Node array with full data
  "edges": [...],  // Edge array with connections
  "statistics": {
    "avgDegree": "0.61",
    "density": "0.0135"
  }
}
```

---

## 🚀 Development Workflow

### 1. Local Development

```bash
# Start dev server with hot reload
npm run dev

# Server runs on:
# - Local: http://localhost:5173
# - Network: http://[your-ip]:5173
```

### 2. Testing

```bash
# Run all local tests
npm test

# Run with visible browser (for debugging)
npm run test:headed

# Run specific test file
npx playwright test tests/local-image-background-test.spec.js
```

### 3. Build for Production

```bash
# Create optimized production build
npm run build

# Output: dist/ directory
# - Minified JavaScript bundle (~550 KB)
# - Optimized HTML
# - Assets copied and hashed
```

### 4. Deploy to GitHub Pages

```bash
# Build and deploy in one command
npm run deploy

# Behind the scenes:
# 1. Runs `npm run build`
# 2. Pushes dist/ to gh-pages branch
# 3. GitHub Pages serves from gh-pages branch
```

### 5. Verify Deployment

```bash
# Test deployed site
npm run test:deployed

# Opens: https://1kaiser.github.io/graph-queen/
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Areas for Contribution
- 🌍 **Multi-language OCR** - Add support for more languages
- 🎨 **Visual Themes** - Create alternative color schemes
- 🔧 **Performance** - Optimize OCR processing speed
- 📱 **Mobile Support** - Improve touch interactions
- 🧪 **Testing** - Add more comprehensive test cases
- 📖 **Documentation** - Improve guides and examples

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/graph-queen.git`
3. Create a branch: `git checkout -b feature/amazing-feature`
4. Make changes and test: `npm test`
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📝 Changelog

### v1.0.0 (2025-10-11) - Current Release
- ✅ **Feature**: Automatic OCR workflow with image background display
- ✅ **Feature**: Manual and AI-powered connection modes
- ✅ **Feature**: Voice input support (Web Speech API)
- ✅ **Feature**: Comprehensive export with metadata
- ✅ **Feature**: Undo/Redo functionality
- ✅ **Feature**: Zoom and pan with image synchronization
- ✅ **Testing**: Full Playwright test suite (36+ tests)
- ✅ **Deployment**: GitHub Pages with automated workflow
- ✅ **Documentation**: Complete README with demo GIF

---

## 📚 References & Acknowledgments

### Libraries & Tools
- [`3d-force-graph`](https://github.com/vasturiano/3d-force-graph) & [Three.js](https://threejs.org/) - Force-directed & 3D WebGL graph rendering
- [D3.js](https://d3js.org/) - Mike Bostock and contributors (`d3-force`)
- [Tesseract.js](https://tesseract.projectnaptha.com/) & [Scribe.js](https://github.com/scribeocr/scribe.js) - Client-side OCR
- [PDF.js](https://mozilla.github.io/pdf.js/) - Mozilla Foundation
- [p5.js](https://p5js.org/), [Vite](https://vitejs.dev/), and [Playwright](https://playwright.dev/)

### Academic & Open Specifications
- Sanchez-Lengeling, B., Reif, E., Pearce, A., & Wiltschko, A. B. (2021). *A Gentle Introduction to Graph Neural Networks*. Distill. [doi:10.23915/distill.00033](https://doi.org/10.23915/distill.00033)
- [Basil.js](https://basiljs.ch/) - Text graph connections (`01_connecting_all_words_with_lines`)
- [JSON Canvas](https://jsoncanvas.org/) - Open graph interchange format
- Back to [1kaiser.github.io](https://1kaiser.github.io/)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤖 Generated with Claude Code

This project was created with [Claude Code](https://claude.com/claude-code)

**Built by:** [Kaiser Roy](https://github.com/1kaiser)

**Co-Authored-By:** Claude <noreply@anthropic.com>

---

<div align="center">

**[⬆ Back to Top](#graph-queen-)**

Made with ❤️ and powered by OCR technology

</div>
