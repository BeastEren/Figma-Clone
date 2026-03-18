# 🎨 Figma Clone — Browser-Based Design Editor

A lightweight, Figma-inspired design editor that runs entirely in the browser. No frameworks, no backend — just vanilla HTML, CSS (SCSS), and JavaScript.

---

## ✨ Features

### 🧰 Tools
| Tool | Description |
|------|-------------|
| **Move** | Select, drag, and reposition elements on the canvas |
| **Rectangle** | Draw rectangle shapes by clicking and dragging |
| **Text** | Add and edit text elements on the canvas |
| **Frame / Pen / Comment** | UI placeholders for future tool expansion |

### 🖱️ Canvas Interactions
- **Draw elements** — click and drag on the canvas with an active tool
- **Shift + drag** — constrain rectangle drawing to a perfect square
- **Marquee selection** — drag on empty canvas to select multiple elements at once
- **Drag to move** — reposition selected elements freely within canvas bounds
- **Multi-select drag** — move multiple selected elements simultaneously

### 🔲 Element Manipulation
- **Resize** — 4-corner resize handles (NW, NE, SW, SE) with a minimum size constraint of 30×30px
- **Rotate** — dedicated rotate handle for free rotation
- **Delete** — remove selected elements via `Delete` or `Backspace`
- **Arrow keys** — nudge elements by 5px increments in any direction

### 🎨 Properties Panel (Right Sidebar)
- Edit background color of selected elements
- Edit text content of text elements inline
- Layer ordering controls (move layer up / down)

### 📋 Layers Panel (Left Sidebar)
- Displays all canvas elements as a stacked layer list
- Click a layer to select the corresponding element
- Reorder layers to control element z-index

### 💾 Persistence
- Canvas state is **automatically saved to `localStorage`** on every action
- State is **restored on page reload** — no work lost on refresh

### 📤 Export
- **Export as HTML** — generates a static `.html` file with all elements as absolutely-positioned `<div>`s
- **Export as JSON** — exports the full element state as a `.json` file

---

## 📁 Project Structure

```
├── index.html          # App shell and UI layout
├── styles.scss         # Source styles (SCSS)
├── styles.css          # Compiled CSS
├── script.js           # All app logic (state, rendering, events)
└── assets/
    ├── icons/
    │   ├── favicon.svg
    │   └── download.png
    ├── tools/          # Tool icon assets
    └── fonts/          # Inter font files (woff)
```

---

## 🚀 Getting Started

Since this is a pure vanilla project, no install or build step is needed.

```bash
# Clone the repo
git clone https://github.com/<your-username>/<repo-name>.git

# Open in browser
open index.html
# or just double-click index.html
```

> **Note:** If you edit `styles.scss`, compile it to `styles.css` using a SCSS compiler:
> ```bash
> sass styles.scss styles.css
> ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected element(s) |
| `Arrow Keys` | Nudge selected element by 5px |
| `Shift + Drag` | Draw a perfect square |
| `Escape` | Cancel active drawing |

---

## 🛠️ Tech Stack

- **HTML5** — structure and canvas container
- **SCSS / CSS3** — styling and layout
- **Vanilla JavaScript (ES6+)** — all state management, rendering, and event handling
- **Remix Icons** — UI icons via CDN

---

## 🔮 Planned / In Progress

- [ ] Pen / vector path tool
- [ ] Frame (artboard) support
- [ ] Image upload to canvas
- [ ] Component / asset panel
- [ ] Undo / Redo (`Ctrl+Z`)
- [ ] Copy / Paste elements

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

[MIT](LICENSE)