# Arashikage (`Hex63`) — Interactive Model Architecture Explorer

This directory contains the static web distributable for the **Arashikage (`Hex63`)** End-to-End Model Architecture Explorer, ready for **GitHub Pages** hosting and standalone offline sharing.

## Directory Layout

- [`index.html`](./index.html) — Primary GitHub Pages entry point loading modular CSS and JS assets.
- [`styles/themes.css`](./styles/themes.css) — 6 design systems (`Neo-Brutalism`, `Modular Typography`, `Utilitarian`, `Memphis`, `Pixel Art`, `Aurora`) × `Light` and `Dark` polarities, unified `.theme-callout` containers, and `.no-wrap-btn` button rules.
- [`js/nodes_and_edges.js`](./js/nodes_and_edges.js) — 17 subsystem block definitions (`window.ARASHIKAGE_NODES`) and 24 directed data-flow edges (`window.ARASHIKAGE_EDGES`).
- [`js/scenarios_and_tech.js`](./js/scenarios_and_tech.js) — 5 interactive guided walkthrough scenarios (`window.ARASHIKAGE_SCENARIOS`), 10 Deep Dive technologies (`window.ARASHIKAGE_TECH_LIBRARY`), and 36 curated external white paper references (`window.ARASHIKAGE_EXTERNAL_RESOURCES`).
- [`js/canvas_renderer.js`](./js/canvas_renderer.js) — Aspect-ratio-locked (`1120 : 680`) HTML5 Canvas renderer (`window.ArashikageCanvasRenderer`).
- [`js/app.js`](./js/app.js) — Interactive UI controller:
  - Dedicated top identity banner (`#topIdentityBar`) above a single-line compact control header (`#controlPlaneHeader`).
  - Compact theme selector dropdown (`#selTheme`) + `Light` / `Dark` polarity buttons.
  - **Full Screen Mode** (`#btnToggleFullscreen`) with an aspect-ratio-enforced diagram stage and a slide-in right-hand drawer (`#rightSidePanel`) that opens when clicking any block or `Deep Dive` and dismisses when clicking outside (`#panelDismissBackdrop`, empty canvas area, or pressing `Escape`).
  - **5-Tab Block Inspector** (`1. How | 2. Why | 3. Impact | 4. Math | 5. Learn More`) and **5-Tab Deep Dive** (`1. How | 2. Why | 3. Impact | 4. Science | 5. Learn More`) with URL hash deep-linking (`#view=tech&tech=t3&tab=learn`).
- [`arashikage_model_architecture.html`](./arashikage_model_architecture.html) — Compiled standalone single-file HTML bundle (generated deterministically via `python arch/build_static_dist.py`).
- [`build_static_dist.py`](./build_static_dist.py) — Static bundler that compiles `index.html`, `styles/themes.css`, and `js/*.js` into `arashikage_model_architecture.html`.

## Compiling the Standalone Bundle

Whenever any modular file in `arch/styles/` or `arch/js/` or `arch/index.html` is updated, run:

```bash
python arch/build_static_dist.py
```
