# 3D Force Graph Demo

Interactive 3D force-directed graph visualization with clean, modern styling.

## 🌐 Live Demo

**https://1kaiser.github.io/graph-queen/**

## ✨ Features

- **Interactive 3D Visualization** - WebGL-powered force-directed graph
- **Real-time Controls**:
  - Background color picker
  - Node color customization
  - Link opacity adjustment (0-100%)
  - Node count slider (10-200 nodes)
  - Multiple layout modes:
    - Force Directed (default)
    - Top-Down / Bottom-Up DAG
    - Left-Right / Right-Left DAG
    - Radial Inward / Outward
- **Graph Controls**:
  - Zoom to fit
  - Pause/Resume animation
  - Regenerate with custom node count
- **Node Interaction**:
  - Click nodes to view details
  - Hover effects
  - Info panel with node data

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

Visit http://localhost:5173 (also available on network)

### Build

```bash
npm run build
```

Outputs to `dist/` directory

### Deploy to GitHub Pages

```bash
npm run deploy
```

Builds and deploys to gh-pages branch automatically

## 🧪 Testing

### Local Testing

```bash
npm test                 # Run all tests with local dev server
npm run test:headed      # Run with visible browser
npm run test:debug       # Run in debug mode
```

### Deployed Site Testing

```bash
npm run test:deployed    # Test against live GitHub Pages site
```

Test suites:
- **Visual Inspection** - Page load, rendering, screenshots
- **Interactions** - Color changes, layouts, zoom, regeneration
- **Console Logs** - Initialization, events, error detection

## 📁 Project Structure

```
3d-graph-demo/
├── index.html                      # Main HTML file
├── main.js                         # Application logic
├── package.json                    # Dependencies & scripts
├── vite.config.js                  # Build configuration
├── playwright.config.js            # Local testing config
├── playwright.deployed.config.js   # Deployed testing config
└── tests/
    ├── visual-inspection.spec.js   # UI & rendering tests
    ├── interaction.spec.js         # User interaction tests
    └── console-logs.spec.js        # Console output tests
```

## 🛠️ Technology Stack

- **Visualization**: [3d-force-graph](https://github.com/vasturiano/3d-force-graph) (WebGL)
- **Build Tool**: Vite 5.x
- **Testing**: Playwright (Chrome)
- **Deployment**: GitHub Pages (gh-pages)

## 📊 Test Coverage

- 21 comprehensive tests across 3 test suites
- Visual inspection (6 tests)
- Interactive controls (9 tests)
- Console log verification (6 tests)
- Screenshots and videos on failure
- Parallel execution with 4 workers

## 🎨 Design Philosophy

- Clean, flat 2D UI design
- No unnecessary shadows or 3D effects
- White background with blue accent color (#1976D2)
- Responsive controls in fixed sidebar
- Minimal, modern aesthetic

## 📝 Development Workflow

1. Make changes to source files
2. Test locally: `npm run dev`
3. Run tests: `npm test`
4. Build: `npm run build`
5. Deploy: `npm run deploy`
6. Verify: `npm run test:deployed`

## 🤖 Generated with Claude Code

This project was created with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
