# Arashikage Multi-Generation Architecture Explorer — UX, Visual Weighting & 12-State Theme Ethos Audit

> [!IMPORTANT]
> **Discovery & Methodology**: This evaluation synthesizes a complete static code and CSS/Canvas audit across [`arch/index.html`](file:///C:/Users/strms/.gemini/antigravity/worktrees/arashikage/arashikage_architecture_diagram/arch/index.html), [`arch/css/themes.css`](file:///C:/Users/strms/.gemini/antigravity/worktrees/arashikage/arashikage_architecture_diagram/arch/css/themes.css), [`arch/js/themes.js`](file:///C:/Users/strms/.gemini/antigravity/worktrees/arashikage/arashikage_architecture_diagram/arch/js/themes.js), [`arch/js/canvas_renderer.js`](file:///C:/Users/strms/.gemini/antigravity/worktrees/arashikage/arashikage_architecture_diagram/arch/js/canvas_renderer.js), and [`arch/js/app.js`](file:///C:/Users/strms/.gemini/antigravity/worktrees/arashikage/arashikage_architecture_diagram/arch/js/app.js) with a **live Chrome DevTools `/browser` audit** ([`0bad6d77-6e48-4774-adfe-a0bc62509b6f`](conversation://0bad6d77-6e48-4774-adfe-a0bc62509b6f)) across `1600×900` and `1440×900` viewports and all **12 Theme × Polarity states** (6 design themes × Light/Dark).

---

## 1. Live `/browser` Visual Inspection Carousels

### 1.1 Layout, Tour Occlusion & Right-Panel Fold (`1600×900` vs `1440×900`)
````carousel
![1600x900 Initial Load: Tour Tooltip occludes 17.8% of canvas & dims 14/17 nodes](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_01_1600x900_default_tour.png)
<!-- slide -->
![1440x900 Viewport: Header overflows (+45px, cutting PNG button in half) & Tour Tooltip covers 24.8% of canvas](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_02_1440x900_overflow.png)
<!-- slide -->
![Right Panel Scrolled (+262px): Cache-Line Explorer readout & Stage Evolution are buried below the 900px fold while Block Title & Tabs scroll off-screen](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_03_right_panel_scrolled.png)
<!-- slide -->
![Tour Closed: Closing the Tour restores full canvas legibility, but fails to reset the Scenario dropdown in the header](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_04_tour_closed_free_canvas.png)
<!-- slide -->
![Deep Dive View: Redundant 'Back to Block Inspector' button directly under 'Block Inspector', and canvas does not highlight blocks that use the active technology](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_05_deep_dive_view.png)
<!-- slide -->
![Generation Switch (Legacy Gen 3: ST-Perceiver): Identical 6x17 node geometry makes cross-generation comparison subtle without a side-by-side matrix](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_06_gen3_perceiver.png)
````

### 1.2 All 6 Themes × Light & Dark Polarities (`1600×900`)
````carousel
![Theme 1: Neo-Brutalism (Light) — Strong poster grid, but white-on-yellow/cyan canvas headers fail contrast](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_07_neo_brutal_light.jpg)
<!-- slide -->
![Theme 1: Neo-Brutalism (Dark) — Stage header bands turn dark grey (#1f1f24) instead of high-voltage fills; inter-stage edges fade out](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_08_neo_brutal_dark.png)
<!-- slide -->
![Theme 2: Modular Typography (Light) — Tech chips prefix every item with '02 ' due to THEME_GLYPHS.modular_typo.tech = '02'](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_09_modular_typo_light.png)
<!-- slide -->
![Theme 2: Modular Typography (Dark) — Inter-stage orthogonal connectors (#ffffff2b) are nearly invisible on #0a0a0c](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_10_modular_typo_dark.png)
<!-- slide -->
![Theme 3: Utilitarian (Light) — Header overflows by +54px even at 1600px width; STAGE 1/5/6 headers have 1.7:1–2.3:1 contrast](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_11_utilitarian_light.png)
<!-- slide -->
![Theme 3: Utilitarian (Dark) — Authentic oscilloscope CAD feel, though header still overflows horizontally (+54px)](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_12_utilitarian_dark.png)
<!-- slide -->
![Theme 4: Memphis (Light) — Playful geometry, but bottom-left squiggle collides with the bottom feedback wire](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_13_memphis_light.png)
<!-- slide -->
![Theme 4: Memphis (Dark) — All 17 nodes hardcode cyan shadows & pink borders, erasing the 6-stage color identity](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_14_memphis_dark.png)
<!-- slide -->
![Theme 5: Pixel Art (Light) — Header overflows by +64px at 1600px width; Courier New typewriter font & rainbow rounded pills break 16-bit ethos](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_15_pixel_art_light.png)
<!-- slide -->
![Theme 5: Pixel Art (Dark) — Authentic CRT phosphor palette, but Stage 1 (#00c49a) & Stage 6 (#16a34a) green hues collide](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_16_pixel_art_dark.png)
<!-- slide -->
![Theme 6: Aurora (Light) — Yellow STAGE 5 header & #12..#14 badges (#eab308 on #ffffff = 1.75:1) are nearly invisible](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/audit_17_aurora_light.jpg)
````

---

## 2. Executive Summary: What Works vs. What Doesn't

### 2.1 Strengths (What Works Really Well)
1. **Rich Multi-Generation Architectural Dataset**:
   - All 4 architectural generations (`Arashikage Hex63`, `Legacy Gen 3: ST-Perceiver + Cond-31`, `Legacy Gen 2: Factorized-684 + PSM-DCP`, `Legacy Gen 1: RET-40 + Attitude PD`) are deeply populated across **68 subsystem blocks**, **92 dataflow edges**, **40 technology deep-dives**, and **20 interactive scenarios**, with zero internal naming leaks (`"StrmBot"` / `"v5"` completely purged).
2. **Synchronized 6-Stage Structural Grid**:
   - Keeping the 6 functional stages (`Observation` $\to$ `Spatial/Relational` $\to$ `Temporal Memory` $\to$ `Latent & MoE` $\to$ `60Hz Control` $\to$ `Critic & Search`) aligned across all 4 generations lets users click a block (e.g. `#06 Temporal Memory`) and switch generations while preserving selection and tab context.
3. **Interactive Stage Explorer (`#stageInteractiveWidget`)**:
   - The 6 stage-specific interactive widgets (5,376B Cache-Line bar, Bipartite Degree calculator, Titans Surprise gate slider, Coconut/Soft-MoE compute calculator, 60Hz Subtick chunk timeline, and 4-Horizon Symlog HL-Gauss bins) turn passive documentation into tactile intuition.
4. **Full-Screen Drawer & Deep-Linkable URL Hash State**:
   - Full-screen mode (`F` / `⛶ Full Screen`) cleanly slides the right inspector over the diagram, and URL hashes (`#gen=...&node=...&tab=...&theme=...&polarity=...`) enable reproducible sharing.

---

### 2.2 Weaknesses & Friction Points (Measured via `/browser`)

#### A. Header & Control Plane Overflow + Visual Weighting ("Accent Fatigue")
| Metric / Element | `1600×900` Measured | `1440×900` Measured | Root Cause & UX Impact |
| :--- | :--- | :--- | :--- |
| **`#controlPlaneHeader` Width (`Neo-Brutalism`)** | `1596px / 1596px` (0px slack) | **`1481px / 1436px` (`+45px` overflow)** | Packing **13 interactive controls** into one ungrouped flex row clips `▣ PNG` and `▣ Mermaid` off the right edge on 1440p/laptop screens. |
| **`#controlPlaneHeader` Width (`Utilitarian` / `Pixel Art`)** | **`1652px / 1598px` (`+54px`)** & **`1660px / 1596px` (`+64px`)** | **`1549px / 1438px` (`+111px`)** & **`1558px / 1436px` (`+122px`)** | Wide monospace fonts (`Consolas` / `Courier New`) and multi-character ASCII glyphs (`[IO]`, `[>>]`, `[+]`) overflow **even at `1600×900`**, spawning a horizontal scrollbar under the header. |
| **`#topIdentityBar` Title & Style Notes (`1600×900`)** | Title: `842px / 683px` (`...`)<br>Notes: `671px / 577px` (`...`) | Title: `842px / 523px` (`...`)<br>Notes: `671px / 577px` (`...`) | Both the main platform title and the right-hand theme ethos note truncate simultaneously on initial load. |
| **4 `<select>` Dropdowns (`1600×900`)** | All 4 truncate with `...` | All 4 truncate with `...` | `#selArchGen` (`"Platform: Arashikage (Hex6..."`), `#selScenario` (`"END-TO-END 66.7ms ..."`), `#selMode` (`"Pathway: Full Arc..."`), and `#selTheme` (`"Theme: 1. Neo-..."`) all truncate because `max-w-[...]` caps squeeze them alongside 9 buttons. |
| **Simultaneous `.btn-theme-accent` Elements** | **6 to 8 bright accent fills at once** | **6 to 8 bright accent fills at once** | `#selArchGen`, `#btnToggleTour`, `#btnPolarityLight`, `#btnExportHtml`, `#btnViewNode`, `1. How` tab, and every `Learn More ↗` chip button wear the primary accent color simultaneously, flattening visual hierarchy. |
| **Ambiguous Header `Prev` / `Next` Buttons** | `#btnPrevTheme` (`■◀ Prev`) / `#btnNextTheme` (`Next ▶■`) | Same | Uses the exact same `Prev`/`Next` label as `#btnTtPrev`/`#btnTtNext` in the Tour Tooltip; users cannot tell if header `Prev`/`Next` steps the Tour, Generation, or Theme. |

#### B. Interaction Model, Discoverability & Right-Panel Fold
1. **Default-Open Tour Overlay (`#tourTooltip`) Obscures & Dims the Diagram on Load**:
   - Because `tourOverlayVisible` defaults to `true` on Scenario 0, **14 of the 17 blocks (`Stages 2–6`) are dimmed to ~22% opacity** on initial page load, and the **`395×302px` `#tourTooltip` card** sits directly over Stages 2–4 (covering **17.8%** of the canvas at `1600×900` and **24.8%** of the `888×542px` canvas at `1440×900`).
   - Worse, `#tourTooltip` has no visual tether to the active block, duplicates the `1. How` summary already shown in `Block Inspector` 500px to the right, and clicking `× Close` on `#tourTooltip` (`app.js:813`) hides the card without resetting `#selScenario` (`value="0"` remains selected in the header while the canvas reverts to un-dimmed free exploration).
2. **Right-Panel Vertical Overflow (`scrollHeight: 1072px` vs `clientHeight: 810px` = `+262px` at `900px` height)**:
   - On `900px`-tall viewports, the **Interactive Stage Explorer** (`y: 810..1144px`) is split across the bottom viewport fold: the 7 clickable cache-line buttons (`24 CL .. 8 CL`) sit just above the bottom edge (`y: 860..894px`), while the **detail readout box (`y: 905..988px`) is 100% hidden below the fold**. Clicking `2 CL`..`8 CL` appears to do nothing unless the user scrolls down!
   - The **Stage Evolution Across Generations** strip (`y: 1006..1125px`) is **100% buried below the fold**.
   - When the user scrolls `#rightSidePanel` down by `262px`, the **Block Header (`5,376B Arena Slice`) and the 5-Tab Bar (`1. How .. 5. Learn More`) scroll completely off-screen** because they are inside the scrolling container instead of a sticky header.
3. **Quadruple `"Learn More"` Redundancy & Missing Graph Navigation**:
   - In `Block Inspector`, users see: (1) Tab `5. Learn More`, (2) `#btnNodeQuickLearnMore` (`Learn More ↗` 34px below Tab 5, which simply clicks Tab 5), and (3) bright `.btn-theme-accent` `Learn More ↗` buttons next to every tech chip in `Underlying Technologies` (visually overpowering the subtle tech chips themselves).
   - In `Deep Dive`, users see `[■◀ Back to Block Inspector]` immediately below `[▣ Block Inspector]`, Tab 4 changes name from `4. Math` to `4. Science`, and the canvas does **not** highlight the blocks (`usedIn`) that utilize the inspected technology.
   - `Block Inspector` has **no sequential block navigation** (`◀ Prev Block` / `Next Block ▶` or `#01..#17` quick-jump dropdown) and **no clickable Upstream Inputs / Downstream Outputs chips** to traverse the dataflow graph directly from the inspector.
4. **Subtle Generation Switching**:
   - Because all 4 generations use the exact same 6×17 box coordinates and stage colors, switching `#selArchGen` looks like a minor text swap on the canvas unless the user reads the subtitle banner, and the single-card `STAGE EVOLUTION` box only shows 1 generation's text at a time rather than a side-by-side 4-generation evolution comparison (`Gen 1` $\to$ `Gen 2` $\to$ `Gen 3` $\to$ `Hex63`).

---

## 3. 12-State Theme × Polarity Audit (Ethos, Context Bounds & Readability)

### 3.1 Systemic Cross-Theme Rendering Defects
1. **Zero Webfonts Loaded in `arch/index.html`**:
   - `themes.js` references `Arial Black`, `Helvetica Neue`, `Consolas`, `Trebuchet MS`, `Courier New`, and `Segoe UI` without loading Google Fonts (`Space Grotesk`, `IBM Plex Mono`, `Inter`, `Press Start 2P` / `Silkscreen`, `Outfit` / `Plus Jakarta Sans`).
2. **Canvas White-on-Bright WCAG Contrast Failures (`1.65:1` to `2.28:1` — Fail)**:
   - `canvas_renderer.js` (`drawNode` lines 250–292 and `drawStageContainer` lines 166–198) hardcodes `#ffffff` text inside filled node headers and stage banners regardless of background luminance. When the stage color is bright yellow (`#eab308` / `#f59e0b`), cyan (`#06b6d4` / `#22d3ee`), pink (`#f472b6`), or neon mint (`#10b981` / `#00ffcc`), white text drops to **1.65:1–2.28:1 contrast**.
3. **Polarity Toggle Button Contrast Bug (`app.js:186–205`)**:
   - `updatePolarityButtons()` hardcodes `activeBtn.style.color = '#ffffff'` on `meta.stageColors[0]`, producing low contrast whenever `stageColors[0]` is bright mint (`Pixel Art`, `Aurora`) or amber (`Utilitarian`).
4. **Hardcoded Rainbow Cache-Line Explorer Pills (`app.js:343–351`)**:
   - `#ctxWidgetBody` renders hardcoded Tailwind rainbow hexes (`#ff3366`, `#06b6d4`, `#f59e0b`, `#8b5cf6`, `#10b981`, `#ec4899`) with rounded corners across all 6 themes, clashing with `Modular Typography`, `Utilitarian`, and `Pixel Art`.
5. **92 Edge Labels (`e.label`) Are Never Rendered on Canvas**:
   - Every architecture defines rich tensor/latency labels on its edges (`"6x64"`, `"512B"`, `"SURPRISE"`, `"4x8"`), yet `drawEdge()` in `canvas_renderer.js` never renders `e.label`.

### 3.2 Per-Theme Audit Matrix (`6 Themes × 2 Polarities`)

| Theme | Spirit & Intention | Current Audit Findings (Light & Dark) | Proposed Theme-Specific Fixes |
| :--- | :--- | :--- | :--- |
| **1. Neo-Brutalism**<br>(`neo_brutal`) | Swiss/Brutalist poster grid, stark `#000000` ink borders (`2.5px`), zero blur, hard `4px 4px 0px` offset shadows, high-voltage flat fills (`Space Grotesk` + `IBM Plex Mono`). | • **Light**: Strongest theme overall, but white text on Stage 3 yellow (`#eab308`) and Stage 2 cyan (`#06b6d4`) fails contrast (`2.1:1`).<br>• **Dark**: Stage header bands lose their vibrant fills and turn muted dark grey (`#1f1f24`); DOM cards render with `1px` borders instead of `2.5px` due to Tailwind `.border` specificity; inter-stage orthogonal wires (`#fbbf2447`) are too faint. | • Enforce luminance-aware `#111111` ink text on bright fills in both Light & Dark.<br>• Restore high-contrast stage header bands/strips in Dark mode.<br>• Fix CSS border width (`2.5px solid`) on `.theme-card` and `.inspector-subbox` so sub-containers have crisp Brutalist bounds. |
| **2. Modular Typography**<br>(`modular_typo`) | Josef Müller-Brockmann Swiss International Typographic Style — Exposed Hairline Rule Grid, asymmetric modular compartments, pure typographic hierarchy (`Inter` + `IBM Plex Mono`). | • **Bug**: `THEME_GLYPHS.modular_typo.tech = "02"` prefixes **every single technology chip** with `"02 "` (`02 5,376B Layout A & C2v`, `02 ShadowTwin...`)!<br>• **Dark**: Inter-stage wires (`#ffffff2b`) are almost invisible (`1.3:1`), and selected Stage 1 nodes (`#ff2a00` top bar) look identical to unselected Stage 1 nodes.<br>• **Light/Dark**: Sub-boxes in the inspector lack full-bleed hairline grid dividers. | • Fix `THEME_GLYPHS.modular_typo.tech` to `"№"` or `"§"`.<br>• Increase inter-stage wire alpha and add an explicit outer selection frame + Swiss index badge on selected nodes.<br>• Style inspector sections as true flush-border Swiss grid cells (`border-collapse` hairline rules). |
| **3. Utilitarian**<br>(`utilitarian`) | High-density industrial CAD / Tektronix oscilloscope schematic — exposed 20px reticle grid, corner L-brackets, zero ornamental chrome (`IBM Plex Mono`). | • **Light**: Stage header text (`[STAGE 1]` `#f59e0b` amber, `[STAGE 5]` `#eab308` yellow, `[STAGE 6]` `#10b981` green on `#edf1f5`) has **1.7:1–2.3:1 contrast** (barely readable).<br>• **Both**: Wide ASCII glyphs (`[IO]`, `[>>]`) + `Consolas` cause `+54px` header overflow even at `1600×900`. | • Darken Light-mode stage accent hues (`#b45309`, `#0369a1`, `#a16207`, `#4d7c0f`, `#be123c`, `#047857`) for `> 7:1` daylight CAD readability.<br>• Compact CAD glyphs and add technical L-bracket corner ticks to DOM inspector sub-boxes. |
| **4. Memphis**<br>(`memphis`) | 1980s Ettore Sottsass Milan Post-Modern — bold terrazzo dots, playful geometric badges, asymmetric offset shadows, vibrant pop-art energy (`Space Grotesk` / `Outfit`). | • **Both**: Bottom-left background squiggle (`y=642`) collides directly with the `priv_ctx -> critic_heads` bottom feedback wire (`sweepY=636`).<br>• **Dark**: All 17 nodes hardcode `#06b6d4` cyan shadow and `#f472b6` pink border (`canvas_renderer.js:244`), erasing the 6-stage color coding.<br>• **Light**: White text on yellow `#eab308` (`2.1:1`) and pink `#f472b6` (`2.6:1`) fails contrast. | • Reposition background Memphis motifs into clear margin zones outside wire routing lanes.<br>• Restore per-stage color borders/shadows in Memphis Dark.<br>• Use `#111111` ink text on yellow, cyan, mint, and pink node headers. |
| **5. Pixel Art**<br>(`pixel_art`) | 16-Bit Japanese Arcade / CRT Command Deck — crisp stepped pixel borders, CRT scanlines, high-contrast phosphor sprites (`Press Start 2P` / `Silkscreen` headers + `IBM Plex Mono` body). | • **Both**: Uses serifed typewriter `Courier New` everywhere; Stage 1 (`#00c49a`) and Stage 6 (`#16a34a`) share nearly identical green hues; `#ctxWidgetBody` uses smooth rounded pills.<br>• **Light**: Yellow `STAGE 5` text (`#ca8a04` on `#e6e8f0`) has `1.9:1` contrast; `+64px` header overflow at `1600×900`.<br>• **Dark**: White text on bright `#00c49a` (`2.28:1`) and `#d97706` (`3.1:1`). | • Load `Silkscreen` / `Press Start 2P` for headers/badges paired with `IBM Plex Mono` for dense technical prose.<br>• Differentiate Stage 1 ( Electric Cyan `#00e5ff` / `#0284c7`) from Stage 6 (Emerald `#22c55e` / `#15803d`).<br>• Enforce `border-radius: 0px` and stepped pixel shadows across all inner widgets. |
| **6. Aurora**<br>(`aurora`) | Ethereal Borealis Glassmorphism — deep midnight /alabaster frosted crystal surfaces, luminous gradient top-edges, refined hairline specular borders (`Plus Jakarta Sans` + `IBM Plex Mono`). | • **Light**: `STAGE 5` header and node IDs `#12..#14` draw bright yellow `#eab308` text on `#ffffff` (**1.75:1 contrast** — practically invisible!).<br>• **Both**: Stage 1 (`#00bfa5`) and Stage 6 (`#10b981`) collide in teal/green hue; `✧ Light` button turns bright mint green while UI accents are sky blue. | • Provide dedicated high-contrast Light-mode text/badge tokens for Aurora (`#b45309` amber, `#0284c7` sky, `#0f766e` teal, `#6d28d9` violet, `#be185d` rose, `#047857` emerald).<br>• Separate Stage 1 (Teal/Cyan) and Stage 6 (Gold/Emerald) hues and unify Aurora accent styling. |

---

## 4. Proposed Fit-and-Finish & UX Upgrade Plan (5 Workstreams)

### Workstream 1: Decluttered, Zero-Overflow Header & Balanced Visual Weighting
1. **Eliminate Horizontal Overflow at `1440px` and `1600px`**:
   - Reorganize `#topIdentityBar` and `#controlPlaneHeader` into **3 clearly bounded functional clusters** with zero horizontal overflow down to `1366px`:
     - **Cluster 1 — Platform & Generation Switcher**:Segmented **4-Generation Pill Bar** (`Hex63` | `Gen 3: Perceiver` | `Gen 2: Factorized` | `Gen 1: RET-40`) directly in the identity/control bar so switching bot generations is a **1-click primary action** with immediate visual state rather than a truncated `<select>`.
     - **Cluster 2 — Guided Walkthrough & Pathway Filter**: `Walkthrough:` dropdown + inline `◀` / `1/5` / `▶` step controls (only shown when a walkthrough is active) + `Pathway:` filter pills (`All` | `15Hz Policy` | `60Hz Control` | `Training`).
     - **Cluster 3 — Theme, Polarity & Export Utilities**: Compact `Theme` dropdown (with `◀`/`▶` adjacent to the dropdown and explicitly titled `Prev/Next Theme`), `Light/Dark` toggle, `⛶ Full Screen`, and a compact **`Export ▾` menu** (or compact icon buttons) grouping `Share HTML`, `PNG`, and `Mermaid`.
2. **Strict Visual Weight Hierarchy (End "Accent Fatigue")**:
   - Reserve `.btn-theme-accent` **exclusively** for the active primary state (active Generation pill & active Walkthrough state).
   - Style secondary utilities (`Export`, `Light/Dark`, `Full Screen`) as neutral `.btn-theme` controls.

### Workstream 2: Canvas-First Walkthrough Bar & Edge-Label Discoverability
1. **Default to Clean, Un-Dimmed Free Exploration on Initial Load**:
   - Start in **Free Exploration** (`activeScenarioIdx = -1`) so all 17 subsystem blocks across all 6 stages render at **100% crisp contrast** on load without a floating card covering Stages 2–4.
   - Include a prominent **"▶ Start 66.7ms Guided Tour"** pill in the Walkthrough bar so users can launch guided tours with one click, and ensure closing a tour resets the Walkthrough selector cleanly to `Free Exploration`.
2. **Replace the Occluding Floating `#tourTooltip` with a Docked Bottom/Top Canvas HUD Bar**:
   - Instead of a `395×302px` modal floating over the middle of the diagram, dock a compact **Guided Walkthrough HUD Banner** along the bottom of the canvas frame (or top canvas ribbon) with a **visual callout pulse + stage badge** on the focused canvas block, step progress (`Step 1 of 5`), concise takeaway, and `◀ Prev Step` / `Next Step ▶` / `× Exit Tour`. Zero diagram nodes are ever covered!
3. **Render Contextual Tensor & Latency Edge Labels on Canvas**:
   - Render the 92 `e.label` badges (`"6x64"`, `"512B"`, `"SURPRISE"`, `"4x8"`) as crisp pill badges along edges connected to the **currently selected or hovered node** (and active tour step), keeping the resting diagram clean while making tensor shapes immediately discoverable on hover/click.

### Workstream 3: Right Inspector Ergonomics, Graph Traversal & 4-Gen Evolution Matrix
1. **Sticky Inspector Header + Above-the-Fold Layout**:
   - Make the **Inspector Mode Switcher, Block/Tech Title, and 5-Tab Bar (`1. How` .. `5. Reference`) sticky** at the top of `#rightSidePanel` so they never scroll off-screen.
   - Move the **Interactive Stage Explorer** into a dedicated, full-height section (or collapsible top card with auto-visible readout) so clicking `24 CL .. 8 CL` always updates a readout that is 100% visible without scrolling.
2. **Direct Graph Navigation Inside Block Inspector**:
   - Add **`◀ Prev` / `#01..#17 Block Jumper` / `Next ▶`** in the Block Inspector header.
   - Add a compact **Dataflow Connections (`← Upstream Inputs` | `Downstream Outputs →`)** strip of clickable node pills inside `Block Inspector` so users can walk forward and backward along edges directly from the right panel.
3. **De-Duplicate `"Learn More"` & Upgrade `Deep Dive` Canvas Highlighting**:
   - Remove the redundant `#btnNodeQuickLearnMore` button and the loud orange `Learn More ↗` buttons next to every tech chip; instead, make each **Technology Chip** a clean, single-click pill (`🔬 5,376B Layout A & C2v →`) that opens its Deep Dive, with a subtle `Ref` icon if going straight to external papers.
   - Remove the redundant `[■◀ Back to Block Inspector]` bar (Instead, style the top `[← Block Inspector (#01)]` toggle to clearly show which block you will return to).
   - When viewing a **Technology Deep Dive**, **automatically highlight all blocks in `usedIn` on the canvas** (dimming unrelated blocks) so the user immediately sees where that technology lives in the architecture!
4. **Side-by-Side 4-Generation Stage Evolution Matrix**:
   - Upgrade `#stageEvolutionBox` from a single text line to a **4-Row Interactive Generation Comparison Matrix** (`Gen 1: RET-40` $\to$ `Gen 2: Factorized` $\to$ `Gen 3: Perceiver` $\to$ `Hex63`) with the active generation highlighted and each row clickable to switch generations in place.

### Workstream 4: 12-State Theme Ethos & WCAG AA/AAA Contrast Pass
1. **Load Authentic Google Fonts (`Space Grotesk`, `IBM Plex Mono`, `Inter`, `Silkscreen`, `Plus Jakarta Sans`)** in `arch/index.html` with graceful offline fallbacks.
2. **Automatic YIQ/Relative-Luminance Contrast Helper in `canvas_renderer.js` & `app.js`**:
   - Compute exact relative luminance for every node header fill, stage pill fill, and polarity button background so bright yellows (`#eab308`), cyans (`#06b6d4`), pinks (`#f472b6`), and mints (`#00c49a`) **always use dark `#0f172a` / `#111111` ink** (`> 8:1` contrast) while dark fills use `#ffffff`.
   - Provide dedicated Light-mode vs. Dark-mode stage text color tokens so `Utilitarian Light`, `Pixel Art Light`, and `Aurora Light` stage headers achieve `>= 7:1` contrast on light backgrounds.
3. **Fix All Theme-Specific Bugs & Context Bounds**:
   - Fix `THEME_GLYPHS.modular_typo.tech` (`"02"` $\to$ `"§"`), restore `Neo-Brutalism Dark` stage header fills and `2.5px` card borders, restore per-stage colors in `Memphis Dark` and move the colliding bottom-left squiggle, separate Stage 1 vs Stage 6 hues in `Pixel Art` and `Aurora`, and theme `#ctxWidgetBody` cache-line pills using each theme's `stageColors` and border radius.

### Workstream 5: Rebuild Static Bundle & Live `/browser` Re-Verification
1. Run `python arch/build_static_dist.py` to compile [`arch/arashikage_model_architecture.html`](file:///C:/Users/strms/.gemini/antigravity/worktrees/arashikage/arashikage_architecture_diagram/arch/arashikage_model_architecture.html).
2. Re-verify all 12 Theme × Polarity states and both `1600×900` / `1440×900` viewports via `/browser` to confirm `0px` horizontal overflow, `>= 4.5:1` contrast across all canvas/DOM labels, and smooth interaction flows.

---

## 5. Post-Implementation `/browser` Verification Gallery (`Commit 8c3fb95`)

> [!TIP]
> **100% Verified Across All 6 Themes & Viewports (`1600×900` & `1440×900`)**:
> - **Header Zero-Overflow**: `scrollWidth === clientWidth` (**`0px` overflow**) across all 6 themes (`Neo-Brutalism`, `Modular Typography`, `Utilitarian`, `Memphis`, `Pixel Art`, `Aurora`) at both `1600×900` and `1440×900`.
> - **Right Panel Above-the-Fold**: The sticky block header + sequential block jumper (`◀ #01..#17 ▶`), 5-tab bar, Interactive Stage Explorer readout, and 4-Row Generation Comparison Matrix fit above the `900px` fold.
> - **Non-Occluding Docked Tour HUD & Deep-Dive Spotlight**: Guided walkthroughs dock cleanly above the canvas with an animated `STEP k/N` callout badge on the focused block, and selecting any technology in `Deep Dive` automatically spotlights its `usedIn` blocks on the diagram.

````carousel
![Verified 1600x900 Default Free Exploration (Neo-Brutalism Light): Un-dimmed 17-block canvas, 4-Gen pill bar, non-overlapping edge labels ([2,752B], [1,984B], [512B @4864]), and above-the-fold 4-Gen Evolution Matrix](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_377.png)
<!-- slide -->
![Verified Docked Walkthrough HUD Bar: Zero diagram occlusion + animated STEP 1/8 callout tag on Block #01](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_256.jpg)
<!-- slide -->
![Verified Deep Dive Canvas Spotlight: Inspecting '5,376B Layout A & C2v' automatically spotlights Blocks #01..#04 on the canvas](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_268.jpg)
<!-- slide -->
![Verified Graph Traversal via Dataflow Connections: Clicking Downstream Output #02 selects '16 Dynamic Queries' and renders its connected tensor edge pills](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_280.png)
<!-- slide -->
![Verified Theme 1 — Neo-Brutalism (Dark): Vibrant stage header bands restored with luminance-verified dark ink on yellow/cyan/green fills](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_289.png)
<!-- slide -->
![Verified Theme 2 — Modular Typography (Light): '§' section glyph on tech chips, double Swiss selection frame, and 0px header overflow](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_298.png)
<!-- slide -->
![Verified Theme 3 — Utilitarian (Light): High-contrast daylight CAD stage headers (>6.5:1 contrast) and 0px header overflow](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_307.png)
<!-- slide -->
![Verified Theme 4 — Memphis (Dark): Per-stage colored offset shadows & borders restored, squiggle moved clear of bottom sweep wire](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_316.png)
<!-- slide -->
![Verified Theme 5 — Pixel Art (Dark & Light): Silkscreen 16-bit headers + IBM Plex Mono body, distinct Stage 1 Cyan vs Stage 6 Emerald, and luminance-aware node headers](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_340.png)
<!-- slide -->
![Verified Theme 6 — Aurora (Light): High-contrast jewel-tone STAGE 5 & #12..#14 badges (>6.5:1 contrast on white pearl cards)](/C:/Users/strms/.gemini/antigravity/brain/16582afd-8f86-4953-aba2-f21f358ed528/verified_step_358.jpg)
````
