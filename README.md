# Graph Queen 👑

**Transform documents into interactive knowledge graphs with automatic OCR and AI-powered connections**

<div align="center">

![Graph Queen Demo](./3d-graph-demo/demo.gif)

**[🚀 Live Demo](https://1kaiser.github.io/graph-queen/)** | **[📖 Full Documentation](./3d-graph-demo/README.md)** | **[💻 Source Code](./3d-graph-demo)**

</div>

---

## 📦 Project Location

The main Graph Queen project is located in the **[3d-graph-demo](./3d-graph-demo)** directory.

**👉 [View Full Documentation](./3d-graph-demo/README.md)**

---

## ✨ What is Graph Queen?

Graph Queen is an intelligent document visualization tool that converts images and PDFs into interactive knowledge graphs. Simply upload a document, and watch as OCR technology extracts every word, positions them at their exact locations, and overlays them on the original image - creating a powerful visual representation of your content.

### 🎯 Key Features

- 📸 **Automatic OCR** - Upload images or PDFs and instantly extract all text
- 🎨 **Interactive Graph** - Nodes positioned at exact word locations
- 🔗 **Smart Connections** - Manually draw or use AI to auto-connect similar words
- 🔍 **Zoom & Pan** - Smooth, infinite zoom and pan capabilities
- 💾 **Export** - Save your graph as JSON with full metadata

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/1kaiser/graph-queen.git
cd graph-queen/3d-graph-demo

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see Graph Queen in action!

---

## 📁 Repository Structure

```
graph-queen/
├── 3d-graph-demo/          # Main Graph Queen application
│   ├── README.md           # Full project documentation
│   ├── index.html          # Application entry point
│   ├── main.js             # Core application logic
│   ├── demo.gif            # Demonstration GIF
│   └── tests/              # Playwright test suite
├── basil.js/               # Basil.js text graph examples
├── post--gnn-intro/        # GNN visualization references
└── README.md               # This file
```

---

**For complete documentation, installation instructions, API reference, and examples, please see the [full README](./3d-graph-demo/README.md).**

---

## 🤖 Generated with Claude Code

This project was created with [Claude Code](https://claude.com/claude-code)

**Built by:** [Kaiser Roy](https://github.com/1kaiser)

**Co-Authored-By:** Claude <noreply@anthropic.com>

---

## 📚 References & Attributions

- **3D & Force-Directed Graph Rendering:** [`3d-force-graph`](https://github.com/vasturiano/3d-force-graph), [Three.js](https://threejs.org/), and [D3.js](https://d3js.org/) (`d3-force`).
- **Optical Character Recognition & Document Parsing:** [PDF.js](https://mozilla.github.io/pdf.js/), [Tesseract.js](https://tesseract.projectnaptha.com/), [Scribe.js](https://github.com/scribeocr/scribe.js), and Web Speech API.
- **Creative Coding & Graph Specifications:** [p5.js](https://p5js.org/), [Basil.js](https://basiljs.ch/gallery/) (`01_connecting_all_words_with_lines`), [JSON Canvas](https://jsoncanvas.org/), and [A Gentle Introduction to Graph Neural Networks](https://distill.pub/2021/gnn-intro/) (`doi:10.23915/distill.00033`).
- **Home:** [1kaiser.github.io](https://1kaiser.github.io/) | [Live Demo](https://1kaiser.github.io/graph-queen/)
