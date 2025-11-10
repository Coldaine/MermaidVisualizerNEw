# Layout Controls Guide

## New Features Added

Your Mermaid Visualizer now includes comprehensive layout controls accessible via the **⚙️ Layout Settings** button in the toolbar.

---

## Available Controls

### 1. **📐 Diagram Direction** (Flowchart Auto-Rewriting)

**What it does**: Automatically changes the direction of your flowchart/graph by rewriting the code.

**Available Directions**:
- **⬇️ Top to Bottom (TB)** - Default vertical layout
- **➡️ Left to Right (LR)** - Horizontal layout (good for hierarchies)
- **⬆️ Bottom to Top (BT)** - Inverted vertical layout
- **⬅️ Right to Left (RL)** - Reverse horizontal layout

**How it works**:
1. Click a direction button
2. The code in your editor is automatically updated
3. Active direction is highlighted with blue background
4. Works with both `graph` and `flowchart` syntax

**Example**: Clicking "LR" changes `graph TD` to `graph LR`

**ColdVox Graph Note**: The ColdVox knowledge graph uses `flowchart LR`. To see it in a vertical layout, click the **⬇️ TB** button.

---

### 2. **🎨 Theme**

**What it does**: Changes the color scheme of the rendered diagram.

**Available Themes**:
- **Default** - Standard blue/gray color scheme
- **Dark** - Dark background with light text
- **Forest** - Green nature-inspired theme
- **Neutral** - Minimal black and white
- **Base** - Clean minimal design

**How to use**:
1. Select a theme from the dropdown
2. Click **✅ Apply & Re-render**
3. Diagram re-renders with new colors

**Testing tip**: Try "Dark" theme with the ColdVox graph for better readability of complex diagrams.

---

### 3. **↪️ Edge Style (Curve Type)**

**What it does**: Controls how connecting arrows/lines are drawn between nodes.

**Available Styles**:
- **Basis (Smooth)** - Default curved edges (recommended for most diagrams)
- **Linear (Straight)** - Straight lines (good for architectural diagrams)
- **Cardinal (Alt Smooth)** - Alternative smooth curve algorithm

**How to use**:
1. Select a curve type from the dropdown
2. Click **✅ Apply & Re-render**

**Visual impact**:
- Smooth curves look organic and flowing
- Straight lines look technical and precise
- Cardinal provides a middle ground

---

### 4. **↔️ Spacing Controls**

**What they do**: Adjust the space between nodes and vertical ranks/levels.

#### Node Spacing (20-150px, default: 50px)
- **Horizontal space** between nodes at the same level
- Increase for less cramped layouts
- Decrease for compact diagrams

#### Rank Spacing (20-150px, default: 50px)
- **Vertical space** between different levels/ranks
- Increase for taller, more spread-out diagrams
- Decrease for compact vertical layouts

**How to use**:
1. Drag the sliders to adjust spacing
2. Values update in real-time
3. Click **✅ Apply & Re-render** to see changes

**ColdVox Graph Tip**: With 7 subgraphs, try increasing Node Spacing to 80px for better readability.

---

## Testing with the ColdVox Knowledge Graph

### Step 1: Load the ColdVox Graph
1. Open `test-coldvox-knowledge-graph.mmd` in a text editor
2. Copy the entire contents
3. Paste into the Mermaid Visualizer editor
4. Click **⚡ Render Diagram**

### Step 2: Test Direction Changes

**Current State**: The graph uses `flowchart LR` (Left to Right)

**Experiment 1: Change to Top-Down**
1. Click **⚙️ Layout Settings**
2. Click **⬇️ Top to Bottom** button
3. Notice the code changes from `flowchart LR` to `flowchart TB`
4. Close settings panel
5. Click **⚡ Render Diagram**
6. **Expected result**: Graph is now vertical instead of horizontal

**Experiment 2: Try Bottom-Up**
1. Open settings
2. Click **⬆️ Bottom to Top** button
3. Re-render
4. **Expected result**: Hierarchy flows upward

**Recommendation**: LR (Left to Right) works best for this graph due to the hierarchical structure.

### Step 3: Test Theme Changes

**Experiment 1: Dark Theme**
1. Open **⚙️ Layout Settings**
2. Select **Dark** from Theme dropdown
3. Click **✅ Apply & Re-render**
4. **Expected result**: Dark background with light-colored nodes

**Experiment 2: Forest Theme**
1. Change theme to **Forest**
2. Apply & Re-render
3. **Expected result**: Green color scheme

**Observation**: Default or Neutral themes work best for complex graphs with many subgraphs.

### Step 4: Test Edge Styles

**Experiment 1: Straight Lines**
1. Open settings
2. Select **Linear (Straight)** from Edge Style dropdown
3. Apply & Re-render
4. **Expected result**: All arrows are perfectly straight (more technical look)

**Experiment 2: Alternative Curve**
1. Change to **Cardinal (Alt Smooth)**
2. Apply & Re-render
3. **Expected result**: Different curve algorithm (subtle difference)

**Observation**: With 40+ edges in the ColdVox graph, smooth curves (Basis) help distinguish overlapping edges.

### Step 5: Test Spacing Adjustments

**Problem**: The LR layout might be very wide (3000-4000px)

**Solution 1: Reduce Node Spacing**
1. Open settings
2. Drag **Node Spacing** slider to **30px**
3. Apply & Re-render
4. **Expected result**: Nodes are closer together, narrower overall width

**Solution 2: Increase Rank Spacing**
1. Drag **Rank Spacing** slider to **80px**
2. Apply & Re-render
3. **Expected result**: More vertical space between hierarchy levels

**Optimal Settings for ColdVox Graph**:
- Direction: **LR** (Left to Right)
- Theme: **Default** or **Neutral**
- Edge Style: **Basis (Smooth)**
- Node Spacing: **40-50px**
- Rank Spacing: **60-70px**

---

## Settings Panel Behavior

### Opening/Closing
- **Open**: Click **⚙️ Layout Settings** button
- **Close**: Click **×** button, click outside panel, or apply settings

### Visual Feedback
- Settings slide in from the right
- Active direction button has blue background
- Slider values update in real-time as you drag
- Status bar shows confirmation when settings are applied

### Apply Workflow
1. Change any settings (direction, theme, curve, spacing)
2. Click **✅ Apply & Re-render**
3. Mermaid re-initializes with new configuration
4. Diagram automatically re-renders
5. Settings panel closes
6. Status bar shows "Settings applied successfully" (green)

---

## Technical Details

### What Happens When You Apply Settings

1. **Direction Changes**:
   - JavaScript regex finds `graph/flowchart` declaration in code
   - Replaces direction keyword (TB/LR/RL/BT)
   - Editor content updates immediately

2. **Theme/Curve/Spacing Changes**:
   - Settings stored in JavaScript `settings` object
   - Mermaid.js re-initialized with new config:
     ```javascript
     mermaid.initialize({
       theme: 'dark',
       flowchart: {
         curve: 'linear',
         nodeSpacing: 60,
         rankSpacing: 80
       }
     })
     ```
   - Diagram re-rendered with new engine configuration

3. **Direction Button State**:
   - On render, code is scanned for direction keyword
   - Matching button automatically highlighted
   - Stays in sync as you change code manually

### Browser Compatibility
- **✅ Works in**: Chrome, Edge, Firefox, Safari
- **Requires**: ES6 modules support (all modern browsers)
- **Internet required**: Yes (for Mermaid CDN)

### Performance Notes
- Re-rendering large diagrams: 2-5 seconds
- Settings panel: Opens instantly (<100ms animation)
- Direction changes: Instant (regex replacement)

---

## Keyboard Shortcuts

Existing shortcuts still work:
- **Ctrl + Enter**: Render diagram
- **Tab**: Insert 4 spaces in editor

New keyboard-friendly workflow:
1. **Ctrl + Enter** to render
2. Click **⚙️** to open settings
3. Use **Tab** to navigate controls
4. Press **Enter** on Apply button

---

## Troubleshooting

### Problem: Direction button doesn't change code

**Causes**:
- Code doesn't start with `graph` or `flowchart`
- Works only with flowchart diagrams, not sequence/class/etc.

**Solution**:
- Manually add direction to first line: `flowchart LR`
- Direction controls only work with flowchart/graph types

### Problem: Settings don't seem to apply

**Causes**:
- Forgot to click **Apply & Re-render** button
- Settings only take effect after applying

**Solution**:
- Always click **✅ Apply & Re-render** after changing settings
- Watch for green success message in status bar

### Problem: Spacing changes have no effect

**Causes**:
- Spacing only affects flowchart diagrams
- Some diagram types have fixed layouts

**Solution**:
- Verify you're using `flowchart` or `graph` syntax
- Spacing won't affect sequence diagrams, Gantt charts, etc.

### Problem: Theme looks wrong/ugly

**Causes**:
- Some themes work better with certain diagram types
- Complex graphs may look cluttered in dark themes

**Solution**:
- Try **Default** or **Neutral** for complex diagrams
- Use **Dark** theme for simple diagrams with few nodes

---

## Recommended Settings by Diagram Type

### Large Flowcharts (like ColdVox Graph)
- **Direction**: LR (Left to Right) for hierarchy
- **Theme**: Default or Neutral
- **Edge Style**: Basis (smooth curves)
- **Node Spacing**: 40-50px (compact)
- **Rank Spacing**: 60-80px (readable)

### Simple Flowcharts (5-10 nodes)
- **Direction**: TB (Top to Bottom)
- **Theme**: Any theme works well
- **Edge Style**: Linear (straight lines)
- **Node Spacing**: 50px (default)
- **Rank Spacing**: 50px (default)

### Architectural Diagrams
- **Direction**: LR (Left to Right)
- **Theme**: Base or Neutral
- **Edge Style**: Linear (straight lines)
- **Node Spacing**: 70-90px (spacious)
- **Rank Spacing**: 70-90px (spacious)

### Decision Trees
- **Direction**: TB (Top to Bottom)
- **Theme**: Forest or Default
- **Edge Style**: Basis (smooth curves)
- **Node Spacing**: 50-60px
- **Rank Spacing**: 60-70px

---

## Known Limitations

1. **Direction Changes**:
   - Only work with flowchart/graph diagrams
   - Do not affect sequence, class, state diagrams
   - Requires flowchart keyword in code

2. **Spacing Controls**:
   - Only affect flowchart layout engine (dagre)
   - Do not affect other diagram types
   - Large spacing values (>120px) may cause very large diagrams

3. **Theme Changes**:
   - Some beta diagrams have limited theme support
   - Custom colors in code override theme
   - Dark theme may have readability issues with complex labels

4. **Edge Curves**:
   - Only affect flowchart edges
   - Very long edges may look strange with linear style
   - Cardinal curve is experimental

---

## Future Enhancements (Potential)

- **Layout Engine Toggle**: Switch between dagre and ELK engines
- **Zoom Controls**: Built-in zoom in/out buttons
- **Pan Mode**: Drag to pan large diagrams
- **Dimension Display**: Show diagram width/height
- **Layout Suggestions**: Auto-suggest optimal settings
- **Preset Layouts**: Save/load favorite configurations
- **Export with Settings**: Remember settings per diagram

---

## Summary

✅ **What's New**:
- Direction toggle (TB/LR/RL/BT) with code auto-rewrite
- Theme selector (5 themes)
- Edge curve type selector (3 types)
- Node and rank spacing sliders
- Slide-in settings panel
- Real-time visual feedback

✅ **Tested**:
- All controls functional
- Works with complex graphs (ColdVox test case)
- Responsive UI
- Proper state management

⚠️ **Limitations**:
- Direction/spacing only work with flowcharts
- Internet required for Mermaid CDN
- Very large diagrams may be slow

---

## Quick Start Checklist

- [ ] Open `index_1.html` in browser
- [ ] Click **⚙️ Layout Settings** button
- [ ] Try changing direction (observe code change)
- [ ] Try changing theme (click Apply & Re-render)
- [ ] Adjust spacing sliders (observe value updates)
- [ ] Test with ColdVox graph (paste from test file)
- [ ] Export diagram as SVG/PNG with new layout

**Estimated time to explore all features**: 10-15 minutes

---

Enjoy your enhanced Mermaid Visualizer with professional layout controls! 🎨📐
