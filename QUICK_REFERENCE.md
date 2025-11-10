# Mermaid Visualizer - Quick Reference Card

## 🎯 One-Page Quick Reference

### Opening the Tool
```
Double-click: index_1.html
Browser: Opens automatically
Internet: Required (for Mermaid CDN)
```

---

## 🖱️ Main Toolbar Buttons

| Button | Action | Keyboard |
|--------|--------|----------|
| ⚡ Render Diagram | Generate diagram | `Ctrl + Enter` |
| 🗑️ Clear Editor | Reset workspace | - |
| 📄 Export SVG | Save as vector | - |
| 🖼️ Export PNG | Save as image | - |
| 📚 Load Example | Load templates | - |
| ⚙️ Layout Settings | Open settings panel | - |

---

## 🔍 Zoom Controls (Bottom-Right)

```
┌─────────┐
│    +    │  Zoom In      (Ctrl +)
│   100%  │  Current Zoom
│    −    │  Zoom Out     (Ctrl -)
│    ⟲    │  Reset Zoom   (Ctrl 0)
│    ✋    │  Pan Mode     (click to toggle)
└─────────┘
```

**Mouse Zoom**: `Ctrl + Scroll Wheel`

---

## ⚙️ Layout Settings Panel

### 📐 Direction (Auto-rewrites code)
- ⬇️ **TB** - Top to Bottom
- ➡️ **LR** - Left to Right (for hierarchies)
- ⬆️ **BT** - Bottom to Top
- ⬅️ **RL** - Right to Left

### 🎨 Themes
`default` `dark` `forest` `neutral` `base`

### ↪️ Edge Curves
- **Basis** - Smooth curves (default)
- **Linear** - Straight lines (technical)
- **Cardinal** - Alternative smooth

### ↔️ Spacing
- **Node Spacing**: 20-150px (horizontal gaps)
- **Rank Spacing**: 20-150px (vertical gaps)

### 🔧 Layout Engine
- **dagre** - Default (fast, stable)
- **ELK** - Experimental (advanced layouts)

### 💾 Presets (Built-in)
- **Default** - General purpose (50/50px)
- **Compact** - Dense layout (30/40px)
- **Spacious** - Roomy layout (80/90px)
- **Technical** - Clean lines (60/60px)
- **Presentation** - Visually appealing (70/80px)

**Custom Presets**: Save Current | Load | Delete

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Render diagram |
| `Ctrl + +` or `=` | Zoom in |
| `Ctrl + -` | Zoom out |
| `Ctrl + 0` | Reset zoom & pan |
| `Ctrl + Scroll` | Smooth zoom |
| `Tab` | Insert 4 spaces (editor) |

---

## 📏 Dimension Warning (Auto-appears)

```
⚠️ Large diagram detected. Diagram: 3000×800px | Viewport: 1200×600px.
Use zoom controls to navigate. [×]
```

**Triggers when**: Diagram > 1.2x viewport size
**Actions**: Auto-shows zoom controls, suggests navigation

---

## 🚀 Common Workflows

### Quick Diagram (30 seconds)
```
1. Paste code
2. Ctrl+Enter (render)
3. Export SVG
```

### Explore Large Graph (2 minutes)
```
1. Render diagram → warning appears
2. Zoom out to 50%
3. Click ✋ (pan mode)
4. Drag to explore
5. Zoom in on details
6. Ctrl+0 to reset
```

### Apply Preset (10 seconds)
```
1. ⚙️ Layout Settings
2. Select preset dropdown
3. Choose preset
4. ✅ Apply & Re-render
```

### Change Direction (5 seconds)
```
1. ⚙️ Layout Settings
2. Click direction button (LR/TB/BT/RL)
3. Code auto-updates
4. Close panel
5. Ctrl+Enter (re-render)
```

### Save Custom Preset (1 minute)
```
1. Configure all settings
2. 💾 Save Current
3. Enter name
4. Preset saved to browser
```

---

## 🎯 ColdVox Graph Quick Guide

**Your graph**: 30 nodes, 7 subgraphs, ~3000px wide

### Recommended Settings
```yaml
Direction: LR (or try TB for vertical)
Theme: Neutral or Default
Curve: Basis
Node Spacing: 45px
Rank Spacing: 65px
Engine: dagre
```

### Viewing Workflow
```
1. Load test-coldvox-knowledge-graph.mmd
2. Render → warning appears
3. Zoom out to 40%
4. Pan mode ON
5. Explore each subgraph
6. Zoom in to 150% for labels
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Zoom controls missing | Re-render diagram |
| Pan doesn't work | Click ✋ (should turn blue) |
| Warning always shows | Normal for large diagrams, use zoom |
| Preset won't save | Check localStorage enabled |
| Direction button does nothing | Only works with flowcharts |
| Export is zoomed | Correct - export uses full resolution |

---

## 📊 Default Values

```
Zoom: 100%
Theme: default
Curve: basis
Node Spacing: 50px
Rank Spacing: 50px
Engine: dagre
Pan Mode: OFF
```

---

## 🔥 Pro Tips

1. **Use Ctrl+Enter** - Never click render button
2. **Enable pan once** - Leave it on while exploring
3. **Save presets early** - Don't reconfigure every time
4. **Ctrl+0 resets** - Use liberally to recenter
5. **TB for tall, LR for wide** - Choose based on content
6. **Zoom before export** - No, export is always full-res
7. **Linear for technical** - Straight lines = professional
8. **Basis for organic** - Curves = approachable

---

## 📁 File Reference

```
index_1.html                        - Main app (open this)
FEATURES_SUMMARY.md                 - Complete feature list
LAYOUT_CONTROLS_GUIDE.md            - Basic layout features
ADVANCED_FEATURES_GUIDE.md          - Deep dive (800 lines)
QUICK_REFERENCE.md                  - This file
test-coldvox-knowledge-graph.mmd    - Example complex graph
test-coldvox-render.html            - Standalone test page
```

---

## 🎓 Learning Path

1. **5 min**: Read this quick reference
2. **10 min**: Try each feature once (use testing checklist)
3. **15 min**: Read FEATURES_SUMMARY.md
4. **30 min**: Test with ColdVox graph
5. **1 hour**: Read ADVANCED_FEATURES_GUIDE.md (optional, comprehensive)

**After 30 minutes you'll be productive with the tool!**

---

## ✅ Feature Status

| Feature | Status |
|---------|--------|
| Zoom/Pan | ✅ Fully working |
| Presets | ✅ Fully working |
| Dimension Detection | ✅ Fully working |
| Direction Toggle | ✅ Fully working |
| Themes | ✅ Fully working |
| Spacing | ✅ Fully working |
| dagre Engine | ✅ Fully working |
| ELK Engine | ⚠️ Placeholder (requires elk.js) |

---

## 🎉 You're Ready!

**Open**: `index_1.html`
**Try**: Load example → Zoom → Pan → Apply preset
**Test**: Render ColdVox graph
**Master**: Use keyboard shortcuts

**Total Time to Productivity**: 30 minutes

---

*Print this page for quick desk reference!*
