# Implementation Notes and Technical Details

## Chrome MV3 Extension Implementation

### Content Script Architecture

The content script (`content.ts`) follows a modular pattern:

```typescript
// State management
const processedBlocks = new WeakSet<HTMLElement>();
let mermaidModule: any = null;

// Configuration
const CONFIG = {
  selectors: [
    'pre.mermaid',
    'pre code.language-mermaid',
    'code.language-mermaid'
  ],
  buttonPosition: { top: '8px', left: '8px' },
  themes: ['default', 'dark', 'forest', 'neutral']
};

// Lazy load Mermaid
async function loadMermaid() {
  if (mermaidModule) return mermaidModule;
  
  const mod = await import(
    chrome.runtime.getURL('vendor/mermaid.esm.min.mjs')
  );
  mermaidModule = mod.default;
  
  // Initialize with user preferences
  const { theme = 'default' } = await chrome.storage.sync.get('theme');
  mermaidModule.initialize({ 
    startOnLoad: false,
    theme,
    securityLevel: 'strict'
  });
  
  return mermaidModule;
}

// Block detection and decoration
function decorateBlock(element: HTMLElement) {
  if (processedBlocks.has(element)) return;
  processedBlocks.add(element);
  
  const container = element.closest('pre') || element;
  container.style.position = 'relative';
  
  const button = createOverlayButton();
  button.addEventListener('click', () => renderBlock(element));
  container.appendChild(button);
}

// Rendering logic
async function renderBlock(element: HTMLElement) {
  const code = extractCode(element);
  if (!code) return;
  
  try {
    const mermaid = await loadMermaid();
    const id = `mermaid-${crypto.randomUUID()}`;
    const { svg } = await mermaid.render(id, code);
    
    const wrapper = createSvgWrapper(svg);
    element.closest('pre')?.replaceWith(wrapper);
    
    // Add toggle button to view original code
    addCodeToggle(wrapper, code);
  } catch (error) {
    showError(element, error);
  }
}

// MutationObserver for SPAs
function observeDOM() {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          scanElement(node as HTMLElement);
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize
function init() {
  scanElement(document.body);
  observeDOM();
  
  // Listen for keyboard shortcuts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'rescan') {
      processedBlocks = new WeakSet();
      scanElement(document.body);
    }
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

### Background Service Worker

```typescript
// background.ts
chrome.runtime.onInstalled.addListener(() => {
  // Set default options
  chrome.storage.sync.set({
    theme: 'default',
    autoRender: false,
    enabledDomains: []
  });
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'rescan') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'rescan' });
      }
    });
  }
});

// Context menu integration
chrome.contextMenus.create({
  id: 'mermaid-render',
  title: 'Render Mermaid Diagram',
  contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'mermaid-render' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'renderSelection',
      code: info.selectionText
    });
  }
});
```

### Popup UI

```html
<!-- popup.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 300px;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .option {
      margin-bottom: 12px;
    }
    label {
      display: block;
      font-weight: 500;
      margin-bottom: 4px;
    }
    select, button {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      background: #0066cc;
      color: white;
      border: none;
      cursor: pointer;
      margin-top: 16px;
    }
    button:hover {
      background: #0052a3;
    }
  </style>
</head>
<body>
  <h2>Mermaid Renderer</h2>
  
  <div class="option">
    <label>Theme:</label>
    <select id="theme">
      <option value="default">Default</option>
      <option value="dark">Dark</option>
      <option value="forest">Forest</option>
      <option value="neutral">Neutral</option>
    </select>
  </div>
  
  <div class="option">
    <label>
      <input type="checkbox" id="autoRender">
      Auto-render on page load
    </label>
  </div>
  
  <button id="rescan">Re-scan Current Page</button>
  
  <div id="status"></div>
  
  <script src="popup.js"></script>
</body>
</html>
```

```typescript
// popup.ts
document.addEventListener('DOMContentLoaded', async () => {
  const themeSelect = document.getElementById('theme') as HTMLSelectElement;
  const autoRenderCheckbox = document.getElementById('autoRender') as HTMLInputElement;
  const rescanButton = document.getElementById('rescan') as HTMLButtonElement;
  
  // Load saved settings
  const settings = await chrome.storage.sync.get(['theme', 'autoRender']);
  themeSelect.value = settings.theme || 'default';
  autoRenderCheckbox.checked = settings.autoRender || false;
  
  // Save on change
  themeSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ theme: themeSelect.value });
  });
  
  autoRenderCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ autoRender: autoRenderCheckbox.checked });
  });
  
  // Rescan button
  rescanButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'rescan' });
      showStatus('Page re-scanned!');
    }
  });
});

function showStatus(message: string) {
  const status = document.getElementById('status')!;
  status.textContent = message;
  setTimeout(() => status.textContent = '', 2000);
}
```

---

## Desktop App Implementation

### Main Application Structure

```typescript
// src/main.ts
import { invoke } from '@tauri-apps/api/tauri';
import { save } from '@tauri-apps/api/dialog';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import mermaid from './vendor/mermaid.esm.min.mjs';

// Application state
interface AppState {
  currentCode: string;
  currentSvg: string | null;
  theme: string;
  isDirty: boolean;
}

const state: AppState = {
  currentCode: '',
  currentSvg: null,
  theme: 'default',
  isDirty: false
};

// DOM elements
const editor = document.querySelector('#editor') as HTMLTextAreaElement;
const preview = document.querySelector('#preview') as HTMLDivElement;
const statusBar = document.querySelector('#status') as HTMLDivElement;

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: state.theme,
  securityLevel: 'loose',
  fontFamily: 'system-ui, -apple-system, sans-serif'
});

// Render function
async function renderDiagram() {
  const code = editor.value.trim();
  if (!code) {
    showStatus('Editor is empty', 'warning');
    return;
  }
  
  state.currentCode = code;
  showStatus('Rendering...', 'info');
  
  try {
    const id = `mermaid-${Date.now()}`;
    const { svg } = await mermaid.render(id, code);
    
    state.currentSvg = svg;
    preview.innerHTML = svg;
    
    enableExportButtons();
    showStatus('Diagram rendered successfully', 'success');
    state.isDirty = false;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    showError(message);
    state.currentSvg = null;
    disableExportButtons();
  }
}

// Export SVG
async function exportSVG() {
  if (!state.currentSvg) return;
  
  const path = await save({
    defaultPath: `mermaid-diagram-${Date.now()}.svg`,
    filters: [{ name: 'SVG Image', extensions: ['svg'] }]
  });
  
  if (path) {
    const blob = new Blob([state.currentSvg], { type: 'image/svg+xml' });
    const buffer = await blob.arrayBuffer();
    await writeBinaryFile(path, new Uint8Array(buffer));
    showStatus(`SVG exported to ${path}`, 'success');
  }
}

// Export PNG
async function exportPNG() {
  if (!state.currentSvg) return;
  
  const svg = preview.querySelector('svg');
  if (!svg) return;
  
  const path = await save({
    defaultPath: `mermaid-diagram-${Date.now()}.png`,
    filters: [{ name: 'PNG Image', extensions: ['png'] }]
  });
  
  if (path) {
    showStatus('Converting to PNG...', 'info');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Get SVG dimensions
    const bbox = svg.getBBox();
    const scale = 2; // HiDPI
    
    canvas.width = bbox.width * scale;
    canvas.height = bbox.height * scale;
    ctx.scale(scale, scale);
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, bbox.width, bbox.height);
    
    // Convert SVG to image
    const svgBlob = new Blob([state.currentSvg!], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    
    img.onload = async () => {
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const buffer = await blob.arrayBuffer();
          await writeBinaryFile(path, new Uint8Array(buffer));
          showStatus(`PNG exported to ${path}`, 'success');
        }
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    
    img.onerror = () => {
      showError('Failed to convert SVG to PNG');
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  }
}

// Load example
function loadExample(type: string) {
  const examples: Record<string, string> = {
    flowchart: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
    
    sequence: `sequenceDiagram
    Alice->>Bob: Hello Bob!
    Bob-->>Alice: Hello Alice!
    Note right of Bob: Thinking...
    Bob->>Alice: I'm good, thanks!`,
    
    class: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal : +makeSound()
    class Duck {
      +String beakColor
      +swim()
    }
    class Fish {
      -int sizeInFeet
      -canEat()
    }`,
    
    state: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing
    Processing --> Success
    Processing --> Error
    Success --> [*]
    Error --> Idle`,
    
    er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : includes`,
    
    gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    Task 1: 2024-01-01, 30d
    Task 2: 2024-01-15, 20d
    section Phase 2
    Task 3: 2024-02-01, 25d`
  };
  
  const code = examples[type];
  if (code) {
    editor.value = code;
    state.isDirty = true;
  }
}

// Event listeners
document.querySelector('#btn-render')?.addEventListener('click', renderDiagram);
document.querySelector('#btn-export-svg')?.addEventListener('click', exportSVG);
document.querySelector('#btn-export-png')?.addEventListener('click', exportPNG);
document.querySelector('#btn-clear')?.addEventListener('click', () => {
  editor.value = '';
  preview.innerHTML = '<div class="placeholder">Click "Render" to preview</div>';
  state.currentSvg = null;
  disableExportButtons();
});

// Example dropdown
document.querySelector('#btn-load-example')?.addEventListener('click', (e) => {
  const dropdown = document.querySelector('#example-dropdown') as HTMLSelectElement;
  loadExample(dropdown.value);
});

// Editor change tracking
editor.addEventListener('input', () => {
  state.isDirty = true;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    renderDiagram();
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    if (e.shiftKey) {
      exportPNG();
    } else {
      exportSVG();
    }
  }
});

// Utility functions
function showStatus(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  statusBar.textContent = message;
  statusBar.className = `status ${type}`;
  
  if (type === 'success') {
    setTimeout(() => statusBar.textContent = 'Ready', 3000);
  }
}

function showError(message: string) {
  preview.innerHTML = `
    <div class="error">
      <h3>⚠️ Render Error</h3>
      <pre>${message}</pre>
    </div>
  `;
  showStatus('Render failed', 'error');
}

function enableExportButtons() {
  document.querySelectorAll('.export-btn').forEach(btn => {
    (btn as HTMLButtonElement).disabled = false;
  });
}

function disableExportButtons() {
  document.querySelectorAll('.export-btn').forEach(btn => {
    (btn as HTMLButtonElement).disabled = true;
  });
}

// Load default example on startup
loadExample('flowchart');
```

### Rust Backend (Tauri)

```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
async fn save_diagram(path: String, content: Vec<u8>) -> Result<(), String> {
    std::fs::write(&path, content)
        .map_err(|e| format!("Failed to save file: {}", e))
}

#[tauri::command]
fn open_file_location(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .args(["-R", &path])
        .spawn()
        .map_err(|e| e.to_string())?;
    
    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer")
        .args(["/select,", &path])
        .spawn()
        .map_err(|e| e.to_string())?;
    
    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(std::path::Path::new(&path).parent().unwrap())
        .spawn()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            save_diagram,
            open_file_location
        ])
        .setup(|app| {
            // Log startup
            println!("Mermaid Desktop Editor started");
            
            // Get window
            let window = app.get_window("main").unwrap();
            
            // Set minimum size
            window.set_min_size(Some(tauri::LogicalSize::new(800.0, 600.0)))
                .unwrap();
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## Build System Configuration

### Vite Config (Extension)

```typescript
// apps/extension/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.ts'),
        background: resolve(__dirname, 'src/background.ts'),
        popup: resolve(__dirname, 'src/popup.ts'),
        options: resolve(__dirname, 'src/options.ts')
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife'
      },
      external: ['chrome']
    },
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../../packages/shared')
    }
  }
});
```

### Vite Config (Desktop)

```typescript
// apps/desktop/vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '../../packages/shared'
    }
  }
});
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["chrome", "node"],
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../../packages/shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// apps/extension/src/__tests__/detector.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { detectMermaidBlocks } from '../detector';

describe('Mermaid Block Detection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  
  it('detects pre.mermaid blocks', () => {
    document.body.innerHTML = `
      <pre class="mermaid">graph TD\nA --> B</pre>
    `;
    const blocks = detectMermaidBlocks();
    expect(blocks).toHaveLength(1);
  });
  
  it('detects fenced code blocks', () => {
    document.body.innerHTML = `
      <pre><code class="language-mermaid">graph TD\nA --> B</code></pre>
    `;
    const blocks = detectMermaidBlocks();
    expect(blocks).toHaveLength(1);
  });
  
  it('ignores non-mermaid blocks', () => {
    document.body.innerHTML = `
      <pre><code class="language-javascript">const x = 1;</code></pre>
    `;
    const blocks = detectMermaidBlocks();
    expect(blocks).toHaveLength(0);
  });
  
  it('handles multiple blocks', () => {
    document.body.innerHTML = `
      <pre class="mermaid">graph TD\nA --> B</pre>
      <pre><code class="language-mermaid">sequenceDiagram</code></pre>
    `;
    const blocks = detectMermaidBlocks();
    expect(blocks).toHaveLength(2);
  });
});
```

### Integration Tests (Playwright)

```typescript
// apps/extension/e2e/rendering.spec.ts
import { test, expect, chromium } from '@playwright/test';
import path from 'path';

test.describe('Extension Rendering', () => {
  test('renders flowchart on button click', async () => {
    const extensionPath = path.join(__dirname, '../dist');
    
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
    
    const page = await context.newPage();
    await page.goto('https://example.com/test-page.html');
    
    // Wait for overlay button
    const button = await page.waitForSelector('.mermaid-render-button');
    
    // Click to render
    await button.click();
    
    // Verify SVG appears
    const svg = await page.waitForSelector('svg');
    expect(await svg.isVisible()).toBeTruthy();
    
    await context.close();
  });
});
```

---

## Performance Optimizations

### Lazy Loading

```typescript
// Only load Mermaid when needed
let mermaidLoaded = false;

async function ensureMermaid() {
  if (mermaidLoaded) return;
  
  await import('./vendor/mermaid.esm.min.mjs');
  mermaidLoaded = true;
}
```

### Debounced Rendering

```typescript
let renderTimeout: number | null = null;

function scheduleRender(code: string) {
  if (renderTimeout) clearTimeout(renderTimeout);
  
  renderTimeout = setTimeout(() => {
    renderDiagram(code);
  }, 500); // Wait 500ms after last edit
}
```

### SVG Caching

```typescript
const renderCache = new Map<string, string>();

async function renderWithCache(code: string) {
  const hash = await hashCode(code);
  
  if (renderCache.has(hash)) {
    return renderCache.get(hash)!;
  }
  
  const { svg } = await mermaid.render(generateId(), code);
  renderCache.set(hash, svg);
  
  return svg;
}
```

---

## Security Considerations

### Content Security Policy

The extension must respect CSP headers. By bundling Mermaid locally:

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### XSS Prevention

Sanitize diagram output:

```typescript
import DOMPurify from 'dompurify';

function insertSafeSvg(svg: string) {
  const clean = DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true }
  });
  container.innerHTML = clean;
}
```

### Sandboxing

Set Mermaid security level:

```typescript
mermaid.initialize({
  securityLevel: 'strict', // Prevents script execution
  startOnLoad: false
});
```

---

This completes the implementation documentation!