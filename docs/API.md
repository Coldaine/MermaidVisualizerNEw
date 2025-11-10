# API Documentation

## Build Scripts

### build-mermaid.js

Script to build Mermaid.js from source with specific version targeting.

#### Usage

```bash
node build-mermaid.js [version]
```

#### Parameters

- `version` (optional): Mermaid version to build
  - Format: `vX.Y.Z` (e.g., `v11.12.0`)
  - Special values:
    - `latest` - Build latest stable release (default)
    - `main` - Build from main branch (bleeding edge)
    - `develop` - Build from develop branch

#### Examples

```bash
# Build latest stable release
node build-mermaid.js

# Build specific version
node build-mermaid.js v11.12.0

# Build from main branch
node build-mermaid.js main
```

#### Output

Creates the following files in `packages/shared/vendor/`:

```
vendor/
├── mermaid.esm.min.mjs    # ES module bundle
├── mermaid.d.ts           # TypeScript definitions
└── build-info.json        # Build metadata
```

#### Build Metadata

The `build-info.json` file contains:

```json
{
  "version": "11.12.0",
  "buildDate": "2025-01-10T12:00:00.000Z",
  "source": "v11.12.0",
  "hash": "abc123..."
}
```

#### Error Handling

The script will:
- ✅ Validate Node.js version (>= 20.0.0)
- ✅ Check for required dependencies
- ✅ Clone Mermaid repository if not present
- ✅ Checkout requested version/branch
- ✅ Run build process
- ✅ Copy artifacts to vendor directory
- ❌ Exit with error code 1 on failure

---

## Test Scripts

### diagram-validator.js

Validates Mermaid diagram syntax for all test files.

#### Usage

```bash
node tests/diagram-validator.js [options]
```

#### Options

- `--type <type>` - Test only specific diagram type
- `--verbose` - Show detailed output
- `--all` - Test all diagrams including beta

#### Examples

```bash
# Test all diagrams
node tests/diagram-validator.js

# Test specific type
node tests/diagram-validator.js --type architecture

# Verbose mode
node tests/diagram-validator.js --verbose

# Test flowchart diagrams only
node tests/diagram-validator.js --type flowchart
```

#### Supported Diagram Types

**Stable:**
- `flowchart` - Process flows and decision trees
- `sequence` - Sequence diagrams
- `class` - Class diagrams
- `state` - State diagrams
- `er` - Entity-relationship diagrams
- `gantt` - Gantt charts

**Beta:**
- `architecture` - Architecture diagrams
- `block` - Block diagrams
- `mindmap` - Mindmaps
- `xychart` - XY charts
- `sankey` - Sankey diagrams
- `quadrant` - Quadrant charts

#### Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

#### Output Format

```
╔══════════════════════════════════════════════════════════╗
║     Mermaid Diagram Validator - Test Suite Runner      ║
╚══════════════════════════════════════════════════════════╝

📊 Test Summary:
   Total diagrams: 13
   Stable: 6
   Beta: 7

────────────────────────────────────────────────────────────

📄 Testing [STABLE] flowchart... ✅ PASSED (45ms)
⚡ Testing [BETA] architecture... ✅ PASSED (67ms)
...

═══════════════════════════════════════════════════════════

📈 Test Results:
───────────────────────────────────────────────────────────

  ✅ Passed: 13
  ❌ Failed: 0
  ⏭️  Skipped: 0
  📊 Pass Rate: 100.0%
  ⏱️  Duration: 1.23s

═══════════════════════════════════════════════════════════

🎉 All tests passed!
```

---

### beta-features.test.js

Specialized tests for beta diagram syntax compliance.

#### Usage

```bash
node tests/beta-features.test.js
```

#### What It Tests

1. **Architecture Diagrams**
   - Uses `architecture-beta` keyword
   - Defines services and groups
   - Uses valid icon syntax
   - Defines connections

2. **Block Diagrams**
   - Uses `block-beta` keyword
   - Defines column layout
   - Uses block grouping syntax
   - Defines connections

3. **Mindmaps**
   - Uses `mindmap` keyword
   - Defines root node
   - Has hierarchical structure

4. **XY Charts**
   - Uses `xychart-beta` keyword
   - Defines x-axis and y-axis
   - Has data series

5. **Sankey Diagrams**
   - Uses `sankey-beta` keyword
   - Defines flow connections
   - Has minimum required flows

6. **Quadrant Charts**
   - Uses `quadrantChart` keyword
   - Defines axis labels
   - Defines all four quadrants
   - Has data points with coordinates

7. **Version Compatibility**
   - All diagrams use correct keywords
   - No deprecated syntax

#### Exit Codes

- `0` - All beta tests passed
- `1` - One or more beta tests failed

---

## Desktop Application API

### index_1.html

Standalone desktop application for Mermaid diagram editing.

#### JavaScript API

##### Configuration

```javascript
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose'
});
```

##### Functions

###### `renderDiagram()`

Renders the diagram from editor content.

```javascript
async function renderDiagram()
```

**Returns:** `Promise<void>`

**Throws:** Error if diagram syntax is invalid

**Example:**
```javascript
await renderDiagram();
```

###### `exportSVG()`

Exports current diagram as SVG file.

```javascript
function exportSVG()
```

**Returns:** `void`

**Side Effects:** Downloads SVG file with timestamp

**Example:**
```javascript
exportSVG(); // Downloads: mermaid-diagram-2025-01-10-12-00-00.svg
```

###### `exportPNG()`

Exports current diagram as PNG file with 2x DPI.

```javascript
function exportPNG()
```

**Returns:** `void`

**Side Effects:** Downloads PNG file with timestamp

**Example:**
```javascript
exportPNG(); // Downloads: mermaid-diagram-2025-01-10-12-00-00.png
```

###### `loadExample(type)`

Loads predefined example diagram.

```javascript
function loadExample(type: string)
```

**Parameters:**
- `type` - Diagram type (flowchart, sequence, class, state, er, gantt, architecture, block, mindmap, xychart, sankey, quadrant)

**Example:**
```javascript
loadExample('architecture'); // Loads architecture diagram example
```

###### `clearEditor()`

Clears editor content and preview.

```javascript
function clearEditor()
```

**Returns:** `void`

**Example:**
```javascript
clearEditor();
```

##### Example Templates

Built-in examples available via `loadExample()`:

```javascript
const examples = {
    flowchart: '...',
    sequence: '...',
    class: '...',
    state: '...',
    er: '...',
    gantt: '...',
    architecture: '...',  // Beta
    block: '...',         // Beta
    mindmap: '...',       // Beta
    xychart: '...',       // Beta
    sankey: '...',        // Beta
    quadrant: '...'       // Beta
};
```

#### Keyboard Shortcuts

- `Ctrl+Enter` - Render diagram
- `Tab` - Insert 4 spaces in editor

#### Status Messages

The app uses a status bar to show:
- `Ready` - Application ready
- `Rendering...` - Diagram being rendered
- `Diagram rendered successfully` - Success (green)
- `Render failed` - Error (red)

---

## Chrome Extension API (Planned)

### Content Script

Future API for Chrome extension content script.

#### Functions (Planned)

##### `scanPage()`

Scans page for Mermaid code blocks.

```javascript
function scanPage()
```

##### `renderBlock(element)`

Renders a specific Mermaid code block.

```javascript
async function renderBlock(element: HTMLElement)
```

##### `observeDOM()`

Sets up MutationObserver for dynamic content.

```javascript
function observeDOM()
```

---

## Configuration Files

### manifest.json

Chrome extension manifest configuration.

#### Key Fields

```json
{
  "manifest_version": 3,
  "name": "Mermaid Visualizer",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab"],
  "content_scripts": [...],
  "background": {...}
}
```

### tauri.conf.json

Desktop app (Tauri) configuration.

#### Key Fields

```json
{
  "build": {
    "distDir": "../dist"
  },
  "package": {
    "productName": "Mermaid Visualizer",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "fs": {...},
      "dialog": {...}
    }
  }
}
```

---

## Mermaid Configuration

### Initialization Options

```javascript
mermaid.initialize({
    // Rendering
    startOnLoad: false,      // Don't auto-render on page load
    theme: 'default',        // default | dark | forest | neutral
    securityLevel: 'loose',  // strict | loose | antiscript

    // Logging
    logLevel: 'error',       // fatal | error | warn | info | debug

    // Font
    fontFamily: 'system-ui, -apple-system, sans-serif',

    // Flow diagram
    flowchart: {
        htmlLabels: true,
        curve: 'basis'
    }
});
```

### Theme Options

- `default` - Standard theme
- `dark` - Dark background theme
- `forest` - Green-themed
- `neutral` - Grayscale theme

### Security Levels

- `strict` - Maximum security, no scripts
- `loose` - Allows more features (recommended for desktop)
- `antiscript` - Prevents JavaScript execution

---

## NPM Scripts Reference

### Building

```bash
pnpm run build:mermaid      # Build Mermaid from source
pnpm run build:extension    # Build Chrome extension
pnpm run build:desktop      # Build desktop app
pnpm run build:all          # Build everything
```

### Development

```bash
pnpm run dev:extension      # Open extension demo
pnpm run dev:desktop        # Open desktop app
pnpm run serve              # Start local server
```

### Testing

```bash
pnpm test                   # Run diagram validator
pnpm test:verbose           # Verbose test output
pnpm test:beta              # Test beta features
pnpm test:all               # Run all tests
pnpm validate               # Validate all diagrams
```

### Maintenance

```bash
pnpm run clean              # Clean build artifacts
pnpm run lint               # Lint code (not implemented)
pnpm run format             # Format code (not implemented)
```

---

## Error Codes

### Build Errors

- `1001` - Node.js version too old
- `1002` - Git not installed
- `1003` - Build failed
- `1004` - Invalid version specified

### Test Errors

- `2001` - Diagram file not found
- `2002` - Syntax validation failed
- `2003` - Required keyword missing
- `2004` - Invalid diagram structure

### Runtime Errors

- `3001` - Mermaid library failed to load
- `3002` - Diagram rendering failed
- `3003` - Export operation failed
- `3004` - Invalid diagram syntax

---

## Contributing to API

When adding new API functions:

1. **Document parameters and return values**
2. **Provide usage examples**
3. **List possible errors**
4. **Update this API documentation**
5. **Add tests for new functions**

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

**Last Updated:** 2025-01-10
**Version:** 1.0.0
