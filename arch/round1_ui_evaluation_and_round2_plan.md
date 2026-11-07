# Round-1 Architecture Explorer UI Evaluation & Round-2 Remediation Plan

> [!IMPORTANT]
> **Migration & Audit Scope**:
> 1. **Repository Migration Complete**: All 14 modular & compiled Architecture Explorer filesplus [`rl_bot_architecture_spec.md`](file:///d:/code/strmshdw-io/arch/rl_bot_architecture_spec.md) and [`ux_fit_and_finish_evaluation_report.md`](file:///d:/code/strmshdw-io/arch/ux_fit_and_finish_evaluation_report.md) are migrated and pushed to [`d:\code\strmshdw-io\arch`](file:///d:/code/strmshdw-io/arch), and `d:\code\arashikage\arch` has been removed and pushed (`83e427b`).
> 2. **Live `/browser` Evaluation ([`9a0ef18d-7e89-4e2a-8f10-7f3354eb071d`](conversation://9a0ef18d-7e89-4e2a-8f10-7f3354eb071d))**: We audited [`strmshdw-io/arch/index.html`](file:///d:/code/strmshdw-io/arch/index.html), [`styles/themes.css`](file:///d:/code/strmshdw-io/arch/styles/themes.css), [`js/canvas_renderer.js`](file:///d:/code/strmshdw-io/arch/js/canvas_renderer.js), and [`js/app.js`](file:///d:/code/strmshdw-io/arch/js/app.js) across `1600×900` and `1440×900`, all **12 Theme × Polarity states**, all **4 platform generations**, and all **24 walkthrough steps** against the 5-workstream plan from [`16582afd-8f86-4953-aba2-f21f358ed528`](conversation://16582afd-8f86-4953-aba2-f21f358ed528).

---

## 1. Visual Evidence Gallery: What Worked vs. Where Round 1 Fell Short

### 1.1 Layout, Walkthrough Ribbon, Edge Labels & Sticky Inspector Regressions
````carousel
![1600x900 Default Free Exploration (Neo-Brutalism Light): Clean un-dimmed initial load & 4-Gen pill bar, but Dataflow Connections & Underlying Technologies are 100% pushed below the 900px fold](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_01_1600x900_default.png)
<!-- slide -->
![Right Panel Scrolled (+274px): Hardcoded sticky top-[45px] slides 15px UNDER the 60px top mode switcher, slicing through 'BLOCK 01' & '#01 · 5,376B Ar...'](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_02_sticky_header_collision.png)
<!-- slide -->
![Guided Tour Step 1 of 8 (1600x900): 1-line #tourTooltip ribbon crushes #ttDesc to 111px / 1322px (only 8% visible: 'Every 66.7 ms (15 ...')](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_04_tour_step1_desc_truncated.png)
<!-- slide -->
![Guided Tour Step 2 of 8 (#02 16 Dynamic Queries): Canvas 'STEP 2/8' badge collides with '[2,752B]', and '[16 Queries]' overlaps Block #02's right border](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_05_tour_step2_badge_overlap.png)
<!-- slide -->
![Block #09 (Coconut Latent Loop) Selected: Multi-column edge label '[h_ego + Pool]' lands directly on top of Block #12's title ('Stage-1 [h_ego + Pool] ad'), and '[c_base [512]]' overlaps both #09 & #12](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_06_node09_edge_label_collision.png)
<!-- slide -->
![1440x900 Viewport: Zero container overflow, but #selScenario, #selMode, #selNodeJumper, and 4-Gen Matrix rows all truncate with '...'](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_03_1440x900_default.png)
<!-- slide -->
![Deep Dive Spotlight: Highlighting usedIn blocks on canvas works well, but #selTechDropdown lacks ◀ / ▶ stepper buttons](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_18_deep_dive_spotlight.png)
<!-- slide -->
![Tab 5 (Papers): Creates a nested inner scrollbar inside the scrolling right panel and renders 14 simultaneous bright orange accent fills](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_19_papers_tab_nested_scroll.png)
````

### 1.2 12-State Theme × Polarity Inspection (`1600×900`)
````carousel
![Theme 1 — Neo-Brutalism (Dark): Vibrant stage headers restored, but white text on #ff5e1a orange buttons is 3.06:1 contrast](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_07_neo_brutal_dark.png)
<!-- slide -->
![Theme 2 — Modular Typography (Light): '§' glyph fixed, but right-panel cards remain spaced-out boxes (gap-2.5) instead of a flush Swiss hairline grid](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_08_modular_typo_light.png)
<!-- slide -->
![Theme 2 — Modular Typography (Dark): Clean canvas double-border selection frame, but #ff4522 / #3b82f6 cache-line buttons use white text (3.43:1)](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_09_modular_typo_dark.png)
<!-- slide -->
![Theme 3 — Utilitarian (Light): Canvas has CAD corner brackets, but DOM inspector cards have zero corner L-brackets and h1 truncates at 1600px](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_10_utilitarian_light.png)
<!-- slide -->
![Theme 3 — Utilitarian (Dark): Crisp oscilloscope canvas, but DOM inspector cards lack technical schematic brackets](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_11_utilitarian_dark.png)
<!-- slide -->
![Theme 4 — Memphis (Light): Bottom-left squiggle (y=666) and bottom-right circle (y=656) are clipped in half by Stage 1 & 6 swimlane shadows](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_12_memphis_light.png)
<!-- slide -->
![Theme 4 — Memphis (Dark): Per-stage colored offset shadows restored, but bottom decorative motifs still collide with swimlane bottoms](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_13_memphis_dark.png)
<!-- slide -->
![Theme 5 — Pixel Art (Light): Silkscreen at 18px root font size overflows h1 by +339px at 1600px and forces section headers to wrap onto 2 lines](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_14_pixel_art_light.png)
<!-- slide -->
![Theme 5 — Pixel Art (Dark): Authentic CRT palette, but Stage 4 #ff2a85 uses white text (3.55:1) and Silkscreen headers wrap](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_15_pixel_art_dark.png)
<!-- slide -->
![Theme 6 — Aurora (Light): Jewel-tone palette fixed yellow contrast, but removing all gradients/blur from DOM cards made the right panel look flat](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_16_aurora_light.png)
<!-- slide -->
![Theme 6 — Aurora (Dark): Canvas Borealis radial plumes look great, while DOM cards lack top-edge specular highlight rims](/C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r1_eval_17_aurora_dark.png)
````

---

## 2. Scorecard vs. the 5-Workstream Plan (`16582afd-8f86-4953-aba2-f21f358ed528`)

| Planned Workstream | Round-1 Status | What Worked | What Fell Short / Regressed in Round 1 |
| :--- | :---: | :--- | :--- |
| **WS1: Zero-Overflow Header & Visual Weighting** | **Partial (`60%`)** | • `0px` container overflow in `#topIdentityBar` & `#controlPlaneHeader` at `1600×900` & `1440×900`.<br>• 1-click **4-Generation Pill Bar** (`Hex63`..`Gen 1`).<br>• Grouped `◀ Theme ▶` stepper. | • **`html { font-size: 18px }` inflation** (`+12.5%` on all `rem` units) cramps every bar and pushes the right panel below the fold.<br>• **`<select>` internal truncation**: `#selScenario` (`"Free Exploration (Click Any B..."`), `#selMode` (`"Pathway: Full Archi..."`), and `#selNodeJumper` (`"#01 · 5,376B Ar..."`) clip text in all 12 states.<br>• **Plan omissions**: `Pathway:` filter pills and compact `Export ▾` were not built; `#themeStyleNotes` was hidden (`class="hidden"`) instead of displayed cleanly.<br>• **Accent fatigue**: Still 6 to 14 simultaneous bright accent fills on screen. |
| **WS2: Canvas-First Walkthrough HUD & Edge Labels** | **Regressed (`45%`)** | • Default load starts in un-dimmed `Free Exploration`.<br>• Docked `#tourTooltip` ribbon shrinks `#canvasAspectBox` by `0px` (`1045×638px` preserved). | • **Severe Tour Description Truncation (`#ttDesc`)**: Packing badge + scenario + title + description + 4 buttons into 1 row crushes `#ttDesc` to **`1%–11%` visible (`6px–134px` out of `1322px`)** at `1600×900` and **`0px` (`0%` visible)** at `1440×900`!<br>• **40 Canvas Edge-Label Collisions in `Hex63` (`128` across 4 gens)**: Placing `[h_ego + Pool]` at `midX` of a Col 3 $\to$ Col 5 edge draws it **directly across Block `#12`'s title in Col 4**; inter-column pills (`50–85px` wide) overflow the narrow `24px` column gap into both adjacent nodes.<br>• **`STEP k/N` Badge Collisions**: Overlaps the dashed swimlane border on top-row nodes (`#01, #09, #12, #15`) and collides with `[2,752B]` on `#02`. |
| **WS3: Right Inspector Ergonomics & Above-the-Fold Layout** | **Regressed (`50%`)** | • `◀ / #01..#17 / ▶` block jumper works.<br>• Clickable `← Upstream` / `Downstream →` chips work.<br>• `Deep Dive` highlights `usedIn` blocks on canvas & shows `Block Inspector (#01)`. | • **Sticky Header Collision (`15px` overlap on scroll)**: Top bar is `60px` tall (`sticky top-0`), while the second sticky bar is hardcoded to `sticky top-[45px]`, causing it to slide **15px under the top bar** and slice `BLOCK 01` in half when scrolling.<br>• **Below-the-Fold Burial**: Because `font-size: 18px` + the 4-Gen Matrix inflate Card 2 to `355–456px` tall, **`Dataflow Connections` and `Underlying Technologies` (`y = 912..1243px`) are 100% hidden below the `900px` fold on all 17 blocks** (and the bottom of the 4-Gen Matrix is cut off in Stages 2, 3, 4, and 6).<br>• **Widget Deduplication & Legacy Mismatch**: Stages 3 & 4 share the exact same widget, Stages 5 & 6 share the exact same widget (`4` widgets instead of `6`), and `Tab 5 (Papers)` creates a nested scrollbar. |
| **WS4: 12-State Theme Ethos & WCAG Contrast** | **Partial (`65%`)** | • Google Fonts loaded.<br>• Fixed `"02 "` chip bug (`§`).<br>• Restored `Neo-Brutalism Dark` stage headers & `Memphis Dark` per-stage shadows.<br>• Yellow/Cyan fills now use `#111111` ink. | • **`getContrastInk` Threshold Bug (`0.31` vs `0.179`)**: Using `lum > 0.31` (and hardcoded `#ffffff` on `.btn-theme-accent`) leaves mid-luminance fills (`#ff4d00` orange `3.33:1`, `#ec4899` pink `3.53:1`, `#16a34a` green `3.30:1`, `#0891b2` cyan `3.68:1`, `#ff2a85` `3.55:1`) failing WCAG AA.<br>• **Theme Ethos Gaps in DOM Cards**: `Modular Typography` uses spaced rounded-gap cards instead of a flush hairline grid; `Utilitarian` DOM cards lack corner L-brackets; `Memphis` bottom squiggle/circle (`y=666`) are clipped in half by Stage 1 & 6 swimlanes; `Pixel Art` `Silkscreen` at `18px` overflows `h1` by `+339px`; `Aurora` DOM cards lost their top-edge specular gradient rims. |

---

## 3. Round-2 Concrete Remediation Plan (In [`d:\code\strmshdw-io\arch`](file:///d:/code/strmshdw-io/arch))

### Fix 1: Restore `16px` Root Scale, Unified Sticky Header & True Above-the-Fold Inspector (`themes.css`, `index.html`, `app.js`)
1. **Reset `html { font-size: 16px; }`** (with crisp `12px–14px` body prose and `11px` mono labels) so Tailwind spacing and typography stop inflating vertical card heights by `+25%`.
2. **Merge the Two Sticky Bars into One Unified `sticky top-0 z-20` Header** at the top of `#rightSidePanel` (containing the `Block Inspector | Deep Dive` switcher + Block/Tech identity + `◀ #01..#17 ▶` / `◀ Tech ▶` jumper + `1..5` Tab Bar). This permanently eliminates the `top-[45px]` overlap bug and shadow bleed when scrolling.
3. **Elevate `Dataflow Connections` & `Underlying Technologies` Above the Fold**:
   - Place a compact **Dataflow & Tech Strip** (`← Upstream` | `Downstream →` + single-click `Underlying Tech` pills) directly below the Tab Content box so graph traversal and deep-dive links are **100% visible above the `900px` fold on every block**.
   - Make the **4-Generation Stage Evolution Matrix** a clean 2×2 grid (or tabbed/expandable strip with full wrapped text instead of truncated 1-line `...`) and remove the nested `max-h-[340px]` scrollbar on `5. Papers`.
   - Give **all 6 stages** their own distinct interactive widget (splitting Stage 3 *Titans Fast-Weight Memory* from Stage 4 *Coconut & 8×2 Soft-MoE*, and Stage 5 *60Hz Flow-GRPO Action Chunk* from Stage 6 *4-Horizon Symlog HL-Gauss Critic & G=8 GRPO*).

### Fix 2: 2-Row Docked Walkthrough HUD Bar (`index.html`, `app.js`)
1. Convert `#tourTooltip` from a single cramped flex line (`1%–11%` description visibility) into a **2-Row Docked HUD Bar** (`~64px` total height, which still fits inside the `175px` vertical aspect-ratio slack of `#canvasWrapper` with **`0px` canvas shrinkage**):
   - **Row 1**: `STEP k OF N` badge + Scenario Kicker + full **Step Title (`#ttTitle`)** on the left; `Deep Dive`, `◀ Prev`, `Next ▶`, and `× Exit` buttons on the right.
   - **Row 2**: Full, untruncated **Step Description (`#ttDesc`)** across the full width of the canvas column (`1040px+` width, supporting 1–2 readable lines).

### Fix 3: Collision-Free Canvas Edge Labels & Tour Step Badge (`canvas_renderer.js`)
1. **Smart Edge-Label Routing (`edgeLabelsToRender`)**:
   - Never place an edge label inside any node's bounding box (`[n.x - n.w/2 - 4, n.x + n.w/2 + 4] × [n.y - n.h/2 - 4, n.y + n.h/2 + 4]`).
   - For **multi-column edges** (`|n2.col - n1.col| > 1`, e.g., `#09 -> #12`, `#09 -> #15`, `#04 -> #15`) and **adjacent-column edges**, position the compact pill along the wire's vertical segment or in the clear horizontal corridor above/below intermediate blocks, with an explicit **node-box repulsion check** that nudges any label clear of all 17 nodes before drawing.
2. **In-Bounds `STEP k/N` Callout Pill**:
   - Anchor the `STEP k/N` callout badge at the top-right corner of the focused node (`ry - 9`, straddling the top border away from the center vertical arrow shaft at `n.x`), and clamp `tagY >= 68` on top-row nodes so it never collides with the stage header at `y = 12..60` or incoming vertical arrows.
3. **Eliminate `maxWidth` Font Squishing (`15%–20%`)**:
   - Shorten verbose `Gen 1..3` stage header strings and tune `Silkscreen` canvas font size (`9px` on stage headers) so every canvas header and node title renders at `100%` natural glyph aspect ratio.

### Fix 4: Zero `<select>` Truncation, `Pathway:` Filter Pills, Compact `Export ▾` & Restrained Accents (`index.html`, `app.js`)
1. Replace `<select id="selMode">` with 1-click **`Pathway:` segmented pills** (`All` | `Live 5.5ms` | `Train` | `Distill`).
2. Group `Share HTML`, `PNG`, and `Mermaid` into a compact **`Export ▾` popover menu** (next to `⛶ Full Screen`), freeing `~150px` of horizontal breathing room so `#selScenario` and `#selTheme` never truncate with `...`, and display `#themeStyleNotes` cleanly in the identity/footer bar.
3. Reserve `.btn-theme-accent` strictly for the active primary selection (`Hex63` pill, active Tab `1..5`, and `▶ Start Tour`), styling the active `Light/Dark` toggle, `Block Inspector | Deep Dive` toggle, and `5. Papers` badges with high-contrast neutral/outlined surface tokens.

### Fix 5: Exact WCAG 2.1 Luminance Threshold (`0.179`) & Authentic 6-Theme DOM Styling (`themes.css`, `canvas_renderer.js`, `app.js`)
1. Change `getContrastInk` threshold from `lum > 0.31` to **`lum > 0.179`** in both `canvas_renderer.js` and `app.js`, and compute `--accent-ink` dynamically per theme/polarity so every orange (`#ff4d00`), pink (`#ec4899` / `#ff2a85`), green (`#16a34a` / `#059669`), and cyan (`#0891b2` / `#0284c7`) surface passes **`>= 4.5:1` WCAG AA** (`5.0:1–8.5:1`).
2. Bring the Right Inspector DOM cards to 100% parity with the Canvas across all 6 themes:
   - **`Modular Typography`**: Zero-gap flush Swiss hairline grid (`gap: 0`, collapsed `1.5px` cell borders) in `#rightSidePanel`.
   - **`Utilitarian`**: CSS corner L-bracket reticles on `.surface-card` containers and concise `h1` subtitle that fits at `1440px` without truncation.
   - **`Memphis`**: Move decorative canvas motifs out of the Stage 1/6 bottom border zones (`y = 666`), and keep bold asymmetric offset shadows.
   - **`Pixel Art`**: Tune `Silkscreen` size/tracking on `h1` and `.kicker` so headers never overflow or wrap onto 2 lines.
   - **`Aurora`**: Add luminous top-edge specular gradient borders (`linear-gradient(90deg, ...)`) and subtle glass tinting to `.surface-card` in both Light and Dark modes.

---

## 4. Round-2 Live `/browser` Verification Results (`100%` Resolved)

Following implementation across [`styles/themes.css`](file:///C:/Users/strms/.gemini/antigravity/worktrees/strmshdw-io/migrate_arch_folder/arch/styles/themes.css), [`index.html`](file:///C:/Users/strms/.gemini/antigravity/worktrees/strmshdw-io/migrate_arch_folder/arch/index.html), [`js/canvas_renderer.js`](file:///C:/Users/strms/.gemini/antigravity/worktrees/strmshdw-io/migrate_arch_folder/arch/js/canvas_renderer.js), [`js/app.js`](file:///C:/Users/strms/.gemini/antigravity/worktrees/strmshdw-io/migrate_arch_folder/arch/js/app.js), and [`arashikage_model_architecture.html`](file:///C:/Users/strms/.gemini/antigravity/worktrees/strmshdw-io/migrate_arch_folder/arch/arashikage_model_architecture.html), the `/browser` subagent ([`9a0ef18d-7e89-4e2a-8f10-7f3354eb071d`](conversation://9a0ef18d-7e89-4e2a-8f10-7f3354eb071d)) re-verified all 5 workstreams across `1600×900` and `1440×900`:

| Workstream | Round-1 Score | Round-2 Score | Verified Empirical Metrics (`/browser` Audit) |
| :--- | :---: | :---: | :--- |
| **WS-1: Header & Layout Ergonomics** | `55%` | **`100%` (Pass)** | `0px` header & `h1` overflow across all 12 states (`1600×900` & `1440×900`); 1-click `#modePillBar` & `Export ▾` `[popover]` menu; 2-Row Docked Walkthrough HUD shows **`100%` of `#ttDesc`** (`descTruncated: false` across all 8 steps) with **`0px` canvas height reduction**. |
| **WS-2: Canvas Legibility & Edge Routing** | `50%` | **`100%` (Pass)** | `STEP k/N` badge sits inside the focused node's top header bar (`0` collisions); multi-column edge `coconut_loop -> critic_heads` (`[h_ego + Pool]`) routes via the top corridor (`y ≈ 80`) above `#12`; inter-column pills shift into clear horizontal corridors with dashed leader lines. |
| **WS-3: Inspector Sticky Header & Links** | `50%` | **`100%` (Pass)** | Root `font-size: 16px` restored; unified `#inspectorStickyHeader` has **`0px` sticky overlap** on scroll; `Dataflow Connections & Underlying Technologies` elevated to `y = 436..615px` (**`100%` above the `900px` fold**); nested `5. Papers` scrollbar removed. |
| **WS-4: 6 Stage Widgets & 4-Gen Matrix** | `65%` | **`100%` (Pass)** | **6 distinct stage-specific interactive widgets** (`Col 0..5`) verified live; 2×2 4-Gen Stage Evolution Matrix has **`0` ellipsis truncations** (`truncatedElsInRightPanel: []`). |
| **WS-5: 12 Theme × Polarity Matrix** | `60%` | **`100%` (Pass)** | **100% WCAG AA pass (`4.60:1–7.09:1`)** across all 12 states (`domContrastsBelow4_5: []`, `canvasStageContrastsBelow4_5: []`); flush Swiss hairline grid in `Modular Typography`, CAD L-brackets in `Utilitarian`, clean `16px` `Pixel Art` scaling, and Borealis specular rims in `Aurora`. |

### Round-2 Verification Gallery

````carousel
![Round-2 Tour Step 1/8 at 1600×900: 2-Row Docked HUD displays 100% of narrative with 0px canvas height shrinkage and in-header STEP 1/8 badge](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_01_tour_step1_1600x900.png)
<!-- slide -->
![Round-2 Tour Step 2/8 at 1440×900: STEP 2/8 inside node #02 header bar and corridor-routed edge pills with dashed leader lines](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_02_tour_step2_1440x900.png)
<!-- slide -->
![Round-2 Block #09 Selected: Top-corridor routing for [h_ego + Pool] above #12 and collision-free inter-column pills with leader lines](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_03_node09_clean_edges.png)
<!-- slide -->
![Round-2 Right Inspector: Unified #inspectorStickyHeader with 0px overlap and Dataflow Connections elevated 100% above the 900px fold](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_04_scrolled_inspector_no_overlap.png)
<!-- slide -->
![Round-2 Tab 5 (Papers): Nested inner scrollbar eliminated and restrained neutral badge styling](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_04b_papers_tab_clean.png)
<!-- slide -->
![Round-2 Deep Dive View: Unified Sticky Header with ◀ / #selTechDropdown / ▶ Stepper](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_05_deep_dive_unified_header.png)
<!-- slide -->
![Round-2 Stage 1 Interactive Widget (5,376B Cache-Line Inspector) & Untruncated 2×2 4-Gen Evolution Matrix](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_06_stage1_c2v_widget.png)
<!-- slide -->
![Round-2 Stage 6 Interactive Widget (4-Horizon Symlog Critic & JEPA Search) on Block #15](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_07_stage6_symlog_widget.png)
<!-- slide -->
![Round-2 Neo-Brutalism Light (WCAG AA >= 4.77:1)](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_08_neo_brutal_light.png)
<!-- slide -->
![Round-2 Neo-Brutalism Dark (WCAG AA >= 4.74:1)](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_09_neo_brutal_dark.png)
<!-- slide -->
![Round-2 Modular Typography Light: Flush border-collapse Swiss hairline grid](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_10_modular_typo_light.png)
<!-- slide -->
![Round-2 Utilitarian Dark: CAD L-bracket corner reticles on DOM cards and 90° PCB traces](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_11_utilitarian_dark.png)
<!-- slide -->
![Round-2 Memphis Light: Clean swimlane margins and high-contrast geometric stage pills](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_12_memphis_light.png)
<!-- slide -->
![Round-2 Pixel Art Dark: 0px h1 overflow, 16px root scaling, and distinct Cyan vs Emerald stage palettes](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_13_pixel_art_dark.png)
<!-- slide -->
![Round-2 Aurora Light: Specular top-edge gradient rims and frosted glass cards](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_14_aurora_light.png)
<!-- slide -->
![Round-2 Aurora Dark: Borealis radial plumes and luminous crystal card borders](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/r2_verify_15_aurora_dark.png)
````

---

## 5. QHD `2560×1440` Proportional Scaling & Fluid Typography Audit

### 5.1 Root Cause of the `2560×1440` Canvas vs. DOM Scale Disparity
When audited at **`2560×1440` (`1440p` QHD)** via `/browser`, two compounding layout factors explained why the Canvas diagram appeared slightly oversized while all surrounding DOM text looked tiny:
1. **Canvas Scaled Up by `1.784×` While DOM Remained Fixed at `1.00×`**:
   - Because `#rightSidePanel` was locked at `540px` (`21.1%` of `2560px`), `#canvasAspectBox` expanded to `1998×1218px` (`1.784×` scale factor), scaling Canvas Node Titles (`13.5px` logical) up to **`24.1px` on screen** and even the smallest `9.5px` Edge Pills up to **`16.9px` on screen**.
   - Meanwhile, all DOM text used static `16px` root sizing and hardcoded arbitrary pixel classes (`text-[8.5px]`..`text-[12px]`), keeping the Inspector's main `H2` title (`#inspTitle`) at **`14.0px`** (smaller than the Canvas's smallest edge label!) and body/chip text at **`8.5px–12.0px`** while leaving `38.6%` (`528px`) of `#rightSidePanel` empty at the bottom.

### 5.2 Fluid Viewport-Proportional Solution (`1440×900` $\leftrightarrow$ `2560×1440`)
1. **Proportional Right Inspector Allocation (`clamp(31rem, 33vw, 42rem)`)**:
   - At `2560×1440`, `#rightSidePanel` expands proportionally to **`845px` (`33.0%` of viewport width)**, which naturally brings `#canvasAspectBox` from `1998×1218px` (`1.784×`) to **`1692×1032px` (`1.507×` scale — ~15.5% less oversized)**.
2. **Fluid Root Typography (`font-size: clamp(0.95rem, 0.35rem + 0.62vw, 1.45rem)`) + `rem` Micro-Class Conversion + ~6% Logical Canvas Font Trim**:
   - Evaluates to `15.52px` at `1600×900`, `17.50px` at `1920×1080`, and **`21.47px` at `2560×1440`**, aligning the DOM and Canvas into the exact same **`14.2px – 20.6px`** on-screen typographic band at QHD:

| Visual Hierarchy Tier | `2560×1440` Before (DOM vs. Canvas) | `2560×1440` After (DOM vs. Canvas) | QHD Alignment & Balance |
| :--- | :---: | :---: | :--- |
| **Primary Block Heading** | `14.0px` DOM vs `24.1px` Canvas | **`20.6px` DOM (`#inspTitle` H2)** vs **`18.4px` Canvas Node Title** | Proper H2 hierarchy restored (`+35.6%` DOM, `-23.7%` Canvas) |
| **Stage / Identity Heading & Body Prose** | `12.0px` DOM vs `20.5px` Canvas | **`17.2px` DOM (`#identityMainTitle`, `#ntabBody`, `#ttTitle`)** vs **`15.8px` Canvas Stage Title** | Crisp, effortless QHD reading (`+34%–43%` DOM) |
| **Subtitles, Controls, Selects & Tabs** | `11.0px` DOM vs `19.6px` Canvas | **`15.9px–16.8px` DOM (Controls, Tabs, `#ttDesc`)** vs **`15.4px` Canvas Node Subtitle** | 1:1 visual parity between controls and diagram subtitles |
| **Badges, Kickers, Chips & 4-Gen Matrix** | `8.5px–10.0px` DOM vs `16.9px` Canvas | **`14.2px–15.3px` DOM (Badges, Chips, Matrix)** vs **`14.3px–14.8px` Canvas Tags/Pills** | `+46%–67%` boost eliminates micro-text on QHD |
| **`#rightSidePanel` Width & Vertical Fill** | `540px` W (`21.1%`) · `61.4%` H used | **`845px` W (`33.0%`) · `84.4%` H used (`1130 / 1338px`)** | Eliminates the `528px` blank bottom void while keeping `0px` scroll overflow |

### 5.3 `2560×1440` Before vs. After Gallery

````carousel
![AFTER (2560×1440 Default): Harmonized 14.2px–20.6px DOM typography, 845px (33vw) Right Inspector filling 84.4% vertical height, and 1.51× scaled Canvas (18.4px node titles)](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/qhd_v2_01_2560x1440_default.png)
<!-- slide -->
![BEFORE (2560×1440 Default): 1.78× Canvas (24.1px node titles) dwarfed the fixed 540px Right Inspector (8.5px–14px micro-text and 38.6% blank bottom whitespace)](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/qhd_before_01_2560x1440_default.png)
<!-- slide -->
![AFTER (2560×1440 Guided Tour Step 1): 17.2px Tour Title & 16.8px Narrative with 120ch measure cap and balanced 2:1 workspace split](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/qhd_v2_02_2560x1440_tour_step1.png)
<!-- slide -->
![BEFORE (2560×1440 Guided Tour Step 1): 11.5px Tour Narrative stretched 1990px wide across the bottom of the screen](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/qhd_before_02_2560x1440_tour.png)
<!-- slide -->
![AFTER (2560×1440 Deep Dive): 20.6px Tech Heading, 17.2px Mechanism Prose, and 15.9px Stepper Controls](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/qhd_v2_03_2560x1440_deep_dive.png)
<!-- slide -->
![AFTER (2560×1440 Tab 5 Papers): Full-sized 15.9px–17.2px White Paper Reference Cards](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/qhd_v2_04_2560x1440_papers_tab.png)
<!-- slide -->
![AFTER (2560×1440 Aurora Dark): Proportional QHD scaling in Dark Velvet Borealis theme](C:/Users/strms/.gemini/antigravity/brain/638af9e9-6b33-49a1-9183-38119135f361/qhd_v2_05_2560x1440_aurora_dark.png)
````


