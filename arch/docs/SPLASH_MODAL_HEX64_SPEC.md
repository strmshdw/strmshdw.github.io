# Arashikage · Hex64 (`StrmBot V5`) — Splash Modal & Lore Codex Specification

**Status**: Deferred / Design Specification for Future Implementation  
**Target Surface**: `arch/index.html` (`#topIdentityBar` trigger + first-visit modal overlay)

---

## 1. Purpose & Activation Requirements
- **First-Visit Auto-Trigger**: Automatically display on a visitor's first session (`localStorage.getItem('arashikage_hex64_splash_hide_v1') !== '1'`), with an opt-out checkbox (`[✓] Show on first visit / startup`), `Esc` key handling, and backdrop click dismissal.
- **Header Activation**: Always accessible by clicking the brand identity cluster or a dedicated badge button in `#topIdentityBar`.
- **Theme Adaptivity**: Must dynamically adapt to all **12 Iconic Design Styles × Light/Dark (`24` palettes)** and bundle cleanly into the standalone single-file `arashikage_model_architecture.html` export.

---

## 2. Core Identity, Etymology & Mathematical Cipher

| Dimension | Token / Symbol | Surface Meaning | Architectural & Mathematical Analog |
| :--- | :--- | :--- | :--- |
| **1. Bot Name** | **`strmshdw` $\to$ `嵐影` (*Arashikage*)** | Creator handle **`strmshdw`** (*Storm Shadow*) translated directly into Japanese kanji: **嵐 (*Arashi* = Storm)** + **影 (*Kage* = Shadow)**. | **嵐 (Storm)**: `120 Hz` RocketSim rigid-body physics across `4,096` parallel arenas, `G = 8` exact Bullet3 cloned cohorts, and `K_sub = 4` (`60 Hz`) continuous subtick flow-matching ODE control.<br>**影 (Shadow)**: `1-Tick` C++20 `RocketSimShadowTwin` reconciling live socket jitter, `512B` Privileged Shadow Critic ($p_\psi^{\text{priv}}$), and `M = 16` JEPA Shadow Futures evaluated in `< 5.5 ms`. |
| **2. Mirror Clan** | **Twin Blades / Klein $C_{2v}$** | The Arashikage clan is defined by twin mirrored disciplines (Yin/Yang, offense/defense). | Enforced in Block `#03` via **Klein 4-Group $C_{2v} = \mathbb{Z}_2^{\text{team}} \times \mathbb{Z}_2^{\text{lat}}$** (`diag(-1,-1,+1)`). Orange/Blue and Left/Right sidewalls map to the exact same canonical neural state (`< 1e-5` error). |
| **3. Version Code** | **`Hex64` (`䷿ 未濟` *Wèi Jì*)** | **I Ching Hexagram 64 (`䷿` — Fire `☲` over Water `☵`)**: the 64th and final hexagram of the *Book of Changes* (*"Before Completion / Continuous Evolution"*), and the 180° inversion of Hexagram 63 (`䷾`). | • **$2^6 = 64$ Binary Space**: A 6-line binary hexagram encodes $2^6 = 64$ states.<br>• **64 Arena Entity Tokens**: `Slots 0..63` in `Hex64EntityNodeArenaSlice` (`1` Ego Car + `5` Other Cars + `1` Ball + `8` Ballistic Arcs + `1` Match State + `34` Boost Pads + `6` Goal Posts + `4` Wheels + `4` Pitch Surfaces = **`64` Entities**).<br>• **64-Byte Cache Alignment**: `5,376B = 84 × 64B` CPU L1 cache lines (`alignas(64)`), `64×64` node embeddings, and `SCHEMA_CRC64 = 0x185109A0FD5E64D3`. |
| **4. Stage Matrix** | **`6` Lines × `3` Pathways = `18` Blocks** | 6 horizontal bars of the hexagram (`2` trigrams of `3` lines each). | **6 Pipeline Stages (`S1..S6`)** × **3 Execution Pathways (`Live 5.5ms`, `Train 4,096 Arenas`, `Distill Warm-Start`)** = **18 Subsystem Blocks** on the canvas. |
| **5. Dojo Lineage** | **`Gen 1` $\to$ `Gen 2` $\to$ `Gen 3` $\to$ `Hex64`** | Four platform generations selectable in the explorer header. | In the **`Distill`** pathway, **`Gen 3 · Perceiver` (`Step 173,650`)** acts as the **Sensei**, transferring `173,650` steps of tactical mastery into `Hex64` before `Hex64` enters `4,096`-arena `G = 8` cloned self-play. |

---

## 3. Canonical Line Geometry of Hexagram 64 (`䷿ 未濟` — Fire `☲` over Water `☵`)

Hexagrams are numbered from bottom (`Line 1`) to top (`Line 6`). For **Hexagram 64 (`䷿ 未濟`)**, Upper Trigram **Fire (`☲` *Lí*: Solid, Broken, Solid)** sits above Lower Trigram **Water (`☵` *Kǎn*: Broken, Solid, Broken)**:

| Visual Row (Top $\to$ Bottom) | I Ching Line | Bar Polarity | Trigram | Mapped Architecture Stage & Structural Isomorphism |
| :--- | :--- | :--- | :--- | :--- |
| **Row 0 (Top)** | **Line 6 (`上九`)** | **Solid Yang (`━━━`)** | `☲` Fire (*Lí*) | **Stage 6 (Unified Apex)**: Dual `4×51` Symlog HL-Gauss Critic ($\gamma \in \{0.95, 0.98, 0.995, 0.9995\}$), Best-of-16 JEPA CVaR Filter & `G=8` Cloned GRPO. |
| **Row 1** | **Line 5 (`六五`)** | **Broken Yin (`━ ━`)** | `☲` Fire (*Lí*) | **Stage 5 (Dual-Head Actuation)**: `[Left]` Stage-1 `16-Way` Binary Classifier (`jump, boost, handbrake`) $\parallel$ `[Right]` Stage-2 `4×5` Continuous Flow-Matching ODE (`60 Hz`). |
| **Row 2** | **Line 4 (`九四`)** | **Solid Yang (`━━━`)** | `☲` Fire (*Lí*) | **Stage 4 (Unified Latent Foresight)**: `Coconut` Recurrent Thought Loops + `8×125 = 1,000` Discrete `FSQ` Skill Codebook + `M = 16` `JEPA` World Model Rollouts. |
| **Row 3** | **Line 3 (`六三`)** | **Broken Yin (`━ ━`)** | `☵` Water (*Kǎn*) | **Stage 3 (Dual Plasticity & Routing)**: `[Left]` `2×4×32×32` `FP32 Titans` Fast-Weight Memory ($R_{\max}=4.0$) $\parallel$ `[Right]` Static `8×2` `Soft-MoE` Expert Routing. |
| **Row 4** | **Line 2 (`九二`)** | **Solid Yang (`━━━`)** | `☵` Water (*Kǎn*) | **Stage 2 (Unified 64-Token Manifold)**: `16×48` Bipartite Entity Graph + `72D` Pairwise Geometry + Denoising Differential Attention across all `64` Arena Entities. |
| **Row 5 (Bottom)** | **Line 1 (`初六`)** | **Broken Yin (`━ ━`)** | `☵` Water (*Kǎn*) | **Stage 1 (Dual Sim-to-Live Foundation)**: `[Left]` `4,096`-Arena C++20 `BatchArenaEngine` $\parallel$ `[Right]` `1-Tick` Live C++20 `RocketSimShadowTwin` (united by `Hex64ObsMapper::BuildArenaSlice`). |

---

## 4. Catalog of the 12 Explored Design Concepts (`01..12`)

### Concept `01`: The I Ching Hex64 Orbital Codex (*Sacred Geometry & 64-Entity Ring*)
- **Centerpiece**: Central 6-bar Hexagram 64 (`䷿` Fire `☲` over Water `☵`) enclosed by a **64-Tick Orbital Ring** (`Slot 0` Ego Car at the 12 o'clock zenith + `63` color-coded relational world peers = `64` tokens).
- **Interaction**: Hovering/clicking any of the 6 bars highlights its Stage color (`S1..S6`) and projects chords to the governed entity slots.

### Concept `02`: Storm & Shadow — Twin-Blade $C_{2v}$ Duality (`嵐 × 影`)
- **Centerpiece**: Split-screen diptych where the **central negative-space channel of the 3 Broken Yin bars (`L1, L3, L5`)** forms the literal **Klein 4-Group $C_{2v}$ Mirror Axis** (`diag(-1,-1,+1)`).
- **Left Wing (`嵐 ARASHI — Storm`)**: `4,096` parallel RocketSim arenas, `G=8` cloned cohorts, and `60 Hz` subtick kinetics.
- **Right Wing (`影 KAGE — Shadow`)**: `1-Tick` C++20 `RocketSimShadowTwin`, `512B` Privileged Critic, and `M = 16` JEPA shadow rollouts.

### Concept `03`: 66.7 Milliseconds — The Time-Dilation Chronograph
- **Centerpiece**: Precision Braun / F1 motorsport chronograph dial contrasting a **`250 ms` Human Pro Reaction Window** against the **`5.1 ms` Hex64 CUDAGraph Execution Arc**, with the 6-bar Hexagram 64 acting as a vertical microsecond subtick power-reserve gauge.

### Concept `04`: The Four Scrolls of the Dojo (*Sensei-to-Student Lineage*)
- **Centerpiece**: Four vertical heraldic scrolls illustrating the **Progressive 4-Generation Completion of Hexagram 64 (`䷿`)**:
  - `Gen 1 · RET-40`: `2/6` bars (`160D` MLP + `32`-quantile QR-PPO)
  - `Gen 2 · MLP-684`: `3/6` bars (Lower Trigram `☵` — `24`-token entity stack + PopArt)
  - `Gen 3 · ST-Perceiver (Step 173,650 Sensei)`: `5/6` bars (`256D` Perceiver bottleneck + GRU + Skill Head)
  - `Gen 4 · Arashikage Hex64`: `6/6` bars complete (`64`-token bipartite manifold + `Titans` + `Coconut` + `1,000 FSQ` + `16 JEPA` + `Flow-GRPO`)

### Concept `05`: The 64-Fold Arena Mandala (*Spatial-to-Neural Pitch Blueprint*)
- **Centerpiece**: Isometric Rocket League stadium floor (`[-4096, +4096]`) with the 6 bars of Hexagram 64 projected as laser field-lines; the 3 Broken Yin bars part around the center circle where `Slot 0` (Ego Car) sits, surrounded by the `63` world entities (`5` cars, `1` ball, `8` trajectory anchors, `1` match node, `34` boost pads, `6` goal posts, `4` wheels, `4` pitch surfaces = `64`).

### Concept `06`: The Master Trilogy Codex (*Octagonal Shield & 3-Pillar Launchpad*)
- **Centerpiece**: 9-segment interactive Hexagram 64 crest inside an octagonal shield paired with a 3-column decoder grid (**Pillar I: `嵐影` Name Cipher**, **Pillar II: `Hex64` Numerology**, **Pillar III: `4-Gen` Lineage**) and 1-click tour/explorer launch buttons.

### Concept `07`: Hanko Vermilion Seal & Ukiyo-e Manifesto (`嵐影之印`)
- **Centerpiece**: Traditional carved cinnabar *Hanko* (`判子`) personal stamp of Hexagram 64 (`䷿`) with vertical Japanese *Tategaki* typography (`嵐影 · 六十四`) and golden *Kintsugi* byte-boundary seams linking the creator's 30-year personal avatar to `SCHEMA_CRC64 = 0x185109A0FD5E64D3`.

### Concept `08`: NVLink Silicon Wafer Floorplan (`HEX-64 ASIC`)
- **Centerpiece**: Sub-nanometer GPU die map where the **3 Solid Yang bars (`S2, S4, S6`)** are full-width `512-bit` SIMD crossbars, the **3 Broken Yin bars (`S1, S3, S5`)** are dual-bank SRAM arrays separated by a physical zero-leakage dielectric air-gap (`4,864B` Public Actor vs. `512B` Privileged Critic), and the perimeter is a **64-Pin L1 Cache Pad Ring (`84 × 64B = 5,376B`)**.

### Concept `09`: Bauhaus / Zurich `6×3` Signal Equalizer Console
- **Centerpiece**: Josef Müller-Brockmann / Dieter Rams studio mastering console where the **6 bars of Hexagram 64 are horizontal linear faders** intersected by **3 pathway columns (`Live 5.5ms`, `Train 4,096`, `Distill`)**, visually demonstrating why `6 Stages × 3 Pathways = 18 Blocks`.

### Concept `10`: Bagua × Hex64 Octagonal Astrolabe (*The Octuple Harmonic Compass*)
- **Centerpiece**: Bronze & cyan *Luo Pan* compass rose with Hexagram 64 at the core, surrounded by the **8-Vertex Bagua Octagon** ($8 \times 8 = 64$ Hexagrams $\leftrightarrow$ `8` Physics Ticks, `8` Ballistic Anchors, `8` Soft-MoE Experts, `8` FSQ 3D Triplets, `G=8` Clones, `8×8 = 64` Entities) and interactive $C_{2v}$ rotation controls.

### Concept `11`: Katana Tsuba-64 Sword-Guard & Differential Quench (`鍔 · TSUBA-64`)
- **Centerpiece**: Pierced iron *Sukashi-Tsuba* hand-guard where the central gaps of the 3 Broken Yin bars form the katana *Nakago-Ana* blade tang aperture and twin utility slots, illustrating $2^6 = 64$-fold Damascus steel and *Yaki-ire* differential quenching (`☲` Fire & `☵` Water).

### Concept `12`: Holographic 6-Strata Isometric Prism (`2D Avatar Seal ↔ 3D Stack`)
- **Centerpiece**: Interactive CAD projection that morphs between the **2D Front Orthographic Elevation** (the flat 6-bar Hexagram 64 avatar seal) and an **Exploded 3D Isometric 6-Layer Glass Stack** where solid bars become unified slabs and broken bars become dual-stream slabs pierced by 3 vertical optical data-vias (`Live`, `Train`, `Distill`).

---

## 5. Reference Copy / Platform Hype Blurb
> *"Every 66.7 milliseconds—nearly 50× faster than a human blink—Arashikage Hex64 reads all 64 arena entities across 84 CPU cache lines, adapts its own FP32 Titans fast weights in-flight to counter your habits, simulates 16 parallel future timelines inside a latent world model, and commits 4 continuous 60 Hz subtick control impulses."*
