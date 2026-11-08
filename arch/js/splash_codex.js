// ============================================================================
// ARASHIKAGE · HEX64 — 12-CONCEPT INTERACTIVE I CHING SPLASH MODAL & CODEX
// Hexagram 64 (䷿ 未濟 Wèi Jì — Fire ☲ over Water ☵: The 64th & Final Hexagram)
// Top-to-Bottom Line Order: Solid (L6), Broken (L5), Solid (L4), Broken (L3), Solid (L2), Broken (L1)
// ============================================================================

(function () {
  const STORAGE_KEY_HIDE_SPLASH = 'arashikage_hex64_splash_hide_v1';
  const STORAGE_KEY_ACTIVE_CONCEPT = 'arashikage_hex64_splash_concept_v1';

  // The 6 Bars of I Ching Hexagram 64 (䷿ 未濟 Wèi Jì — Fire ☲ over Water ☵)
  // Top-to-Bottom: Row 0..5 -> Line 6..1 -> Stage 6..1
  // Upper Trigram: Fire  ☲ (Lí:  Yang-Yin-Yang = Solid, Broken, Solid) -> Radiant Action, Foresight & Mastery
  // Lower Trigram: Water ☵ (Kǎn: Yin-Yang-Yin = Broken, Solid, Broken) -> Deep C++20 Physics, 64-Token Manifold & Memory
  // 2^6 = 64 Total Hexagrams (Hexagram 64 = The Final Form) <-> 64 Arena Entity Tokens (Slots 0..63) & 64B Cache Lines
  const ICHING_BAR_SPECS = [
    {
      row: 0,
      lineNum: 6,
      stageIdx: 5,
      stageCode: 'STAGE 6 · LINE 6 (上九)',
      polarity: 'yang',
      glyph: '⚊ SOLID YANG (APEX)',
      trigram: '☲ FIRE (LÍ · RADIANT APEX)',
      title: 'Crowning Multi-Horizon Critic, JEPA CVaR & G=8 GRPO',
      splitLeft: 'Dual 4×51 Symlog HL-Gauss (γ=0.95..0.9995)',
      splitRight: 'Best-of-16 JEPA Search + 4,096-Arena League',
      detail:
        'Top solid Yang bar (Line 6 of Hexagram 64 ䷿): crowns the architecture by unifying 4-horizon value estimation, test-time CVaR safety filtering, and G=8 cloned cohort optimization.'
    },
    {
      row: 1,
      lineNum: 5,
      stageIdx: 4,
      stageCode: 'STAGE 5 · LINE 5 (六五)',
      polarity: 'yin',
      glyph: '⚋ BROKEN YIN (DUAL-ACTUATION)',
      trigram: '☲ FIRE (LÍ · RADIANT ACTION)',
      title: 'Dual-Stage K_sub=4 (60 Hz) Subtick Action Heads',
      splitLeft: 'Stage-1: 16-Way Autoregressive Binary Head',
      splitRight: 'Stage-2: 4×5 Continuous Flow-Matching ODE',
      detail:
        'Fifth line (Broken Yin ⚋ at the center of Upper Trigram Fire ☲): splits 60 Hz subtick motor control into discrete binary impulses (jump/boost/handbrake, left) and continuous aerodynamic ODE flow (throttle/steer/pitch/yaw/roll, right).'
    },
    {
      row: 2,
      lineNum: 4,
      stageIdx: 3,
      stageCode: 'STAGE 4 · LINE 4 (九四)',
      polarity: 'yang',
      glyph: '⚊ SOLID YANG (FORESIGHT)',
      trigram: '☲ FIRE (LÍ · RADIANT FORESIGHT)',
      title: 'Unified Latent Foresight: 1,000 FSQ Skills & M=16 JEPA',
      splitLeft: '8×125 = 1,000 Discrete FSQ Skill Codebook',
      splitRight: 'M=16 Parallel Latent JEPA World Rollouts',
      detail:
        'Fourth line (Solid Yang ⚊ base of Upper Trigram Fire ☲): fuses discrete symbolic skill syntax (1,000 FSQ codes) with 16 parallel imagined future trajectories inside a single 5.5 ms CUDAGraph.'
    },
    {
      row: 3,
      lineNum: 3,
      stageIdx: 2,
      stageCode: 'STAGE 3 · LINE 3 (六三)',
      polarity: 'yin',
      glyph: '⚋ BROKEN YIN (MEMORY || MOE)',
      trigram: '☵ WATER (KǍN · FLUID MEMORY)',
      title: 'FP32 Titans Fast-Weight Memory || 8×2 Soft-MoE Routing',
      splitLeft: '2×4×32×32 FP32 Titans (||W||_F <= 4.0) + Coconut',
      splitRight: '8 Specialist Experts × 2 Slots Static Einsum',
      detail:
        'Third line (Broken Yin ⚋ crest of Lower Trigram Water ☵): pairs test-time synaptic plasticity (FP32 Titans fast weights adapting to opponent habits, left) with 8-expert Soft-MoE spatial routing (right).'
    },
    {
      row: 4,
      lineNum: 2,
      stageIdx: 1,
      stageCode: 'STAGE 2 · LINE 2 (九二)',
      polarity: 'yang',
      glyph: '⚊ SOLID YANG (64-TOKEN GRAPH)',
      trigram: '☵ WATER (KǍN · DEEP MANIFOLD)',
      title: 'Unified 64-Token Manifold & 16×48 Bipartite DiffAttn',
      splitLeft: '16 Dynamic Physics Tokens × 64 Context Nodes',
      splitRight: 'On-Chip 72D Pairwise Kinematic Geometry',
      detail:
        'Second line (Solid Yang ⚊ core of Lower Trigram Water ☵): binds all 64 arena entities (1 Ego + 63 Peers) into a unified 64×64 relational representation via Denoising Differential Attention.'
    },
    {
      row: 5,
      lineNum: 1,
      stageIdx: 0,
      stageCode: 'STAGE 1 · LINE 1 (初六)',
      polarity: 'yin',
      glyph: '⚋ BROKEN YIN (SIM || SHADOW TWIN)',
      trigram: '☵ WATER (KǍN · FOUNDATION)',
      title: '4,096-Arena Batch Sim || 1-Tick Live C++20 Shadow Twin',
      splitLeft: 'Sim: 4,096 RocketSim Arenas (G=8 Clones)',
      splitRight: 'Live: 1-Tick C++20 RocketSimShadowTwin',
      detail:
        'Foundation line (Broken Yin ⚋ base of Hexagram 64 ䷿): bridges parallel training (left) and live 120 Hz socket execution (right) through the exact same C++20 Hex64ObsMapper::BuildArenaSlice (5,376B = 84×64B) kernel.'
    }
  ];

  // The 12 Splash Modal Concepts (01..12) — All featuring Hexagram 64 (䷿ 未濟: Fire ☲ over Water ☵)
  const SPLASH_CONCEPTS = [
    {
      id: 'c01',
      num: '01',
      short: 'Hexagram 64 Codex',
      title: 'THE I CHING HEX64 CODEX (䷿ 未濟) // FIRE ☲ OVER WATER ☵',
      archetype: 'Sacred Geometry & 64-Entity Orbital Ring',
      tagline: 'Hexagram 64 (The Final Form) · 2⁶ = 64 Arena Entities · 64-Byte Cache Lines',
      hype:
        'For 30 years, the I Ching hexagram has been the creator’s personal avatar—and the clan crest of Arashikage (Storm Shadow). Crowned in its final form as Hexagram 64 (䷿ 未濟 Wèi Jì — Fire ☲ over Water ☵), that 6-bar binary glyph becomes literal silicon: 6 neural stages (2⁶ = 64 states) attending to all 64 arena entities across 84 CPU cache lines, simulating 16 future timelines in 5.1 milliseconds so the strike is solved before the ball leaves the wall.',
      metaphorTitle: 'HIDDEN CIPHER // WHY HEXAGRAM 64 (䷿) = THE FINAL FORM & 64-TOKEN MANIFOLD',
      metaphorBody:
        'In the I Ching, Hexagram 64 (䷿ 未濟 Wèi Jì: Fire ☲ above, Water ☵ below; top-to-bottom Solid, Broken, Solid, Broken, Solid, Broken) is the 64th and final hexagram—representing continuous evolution and unbounded mastery beyond static completion. Around the 6-bar seal orbit the exact 64 tokens of our architecture: Slot 0 (Ego Car at the 12 o’clock zenith) + 63 relational world peers (5 cars, 1 ball, 8 ballistic arc anchors, 1 match node, 34 boost pads, 6 goal posts, 4 wheels, 4 pitch surfaces = 64).'
    },
    {
      id: 'c02',
      num: '02',
      short: 'Storm × Shadow',
      title: 'STORM & SHADOW // THE TWIN-BLADE C2v DUALITY (嵐 × 影)',
      archetype: 'Split-Diptych Across the Klein 4-Group Mirror Axis',
      tagline: 'strmshdw → 嵐 (Arashi: Storm) + 影 (Kage: Shadow) · Hexagram 63 ↔ 64 Inversion',
      hype:
        'Born directly from the handle strmshdw (Storm Shadow), Arashikage fights with two mirrored blades. The Storm (嵐) is raw 120 Hz rigid-body kinetics forged across 4,096 parallel arenas and 60 Hz subtick impulses. The Shadow (影) is the 1-Tick C++20 RocketSimShadowTwin and 16-rollout JEPA world model—running in the dark to reconstruct hidden spin, torque, and 16 branching futures before committing a single frame in the light.',
      metaphorTitle: 'HIDDEN CIPHER // KLEIN C2v SYMMETRY & THE HEXAGRAM 63 ↔ 64 MIRROR',
      metaphorBody:
        'In the I Ching, inverting Hexagram 63 by 180° transforms it directly into Hexagram 64 (䷿: Solid, Broken, Solid, Broken, Solid, Broken)—and the central negative-space channel of its 3 Broken Yin bars (Lines 1, 3, 5) forms the literal Klein 4-Group C2v Mirror Axis (diag(-1,-1,+1) in SO(3) for Team Orange/Blue + X-reflection for Left/Right sidewalls). A left-wall air dribble and a right-wall air dribble map to the exact same canonical 64-token neural state (< 1e-5 error).'
    },
    {
      id: 'c03',
      num: '03',
      short: '66.7ms Chronograph',
      title: '66.7 MILLISECONDS // THE TIME-DILATION CHRONOGRAPH',
      archetype: 'Precision Motorsport & Aerospace Telemetry Instrument',
      tagline: '250 ms Human Reaction vs. 5.1 ms Hex64 CUDAGraph Execution',
      hype:
        'It takes 250 milliseconds for a human Grand Champion’s optic nerve and motor cortex to react to a backboard read. In 5.1 milliseconds—nearly 50× faster than a human blink—Arashikage Hex64 ingests all 64 arena entities, adapts its own FP32 Titans fast weights to counter your habits, evaluates 16 future bounces across 4 discount horizons, and locks in 4 continuous 60 Hz subtick impulses.',
      metaphorTitle: 'HIDDEN CIPHER // THE 6-BAR HEXAGRAM 64 SUBTICK TACHOMETER',
      metaphorBody:
        'Inside the chronograph dial, the 6 bars of Hexagram 64 (䷿) function as a sequential 6-stage microsecond power-reserve gauge rising from Water ☵ (S1 C++20 Shadow Twin 0.35 ms → S2 64-Token Bipartite Graph 1.10 ms → S3 FP32 Titans + Soft-MoE 1.85 ms) into Fire ☲ (S4 Coconut + 1,000 FSQ + 16 JEPA 3.40 ms → S5/S6 60 Hz Flow-Matching ODE & CVaR Filter 5.10 ms <= 5.50 ms SLA).'
    },
    {
      id: 'c04',
      num: '04',
      short: 'Four Dojo Scrolls',
      title: 'THE FOUR SCROLLS OF THE DOJO // SENSEI TO HEX64 LINEAGE',
      archetype: '4-Generation Evolutionary Scroll & Progressive Hexagram 64 Seal',
      tagline: 'Gen 1 RET-40 → Gen 2 Factorized → Gen 3 Perceiver Sensei → Gen 4 Hex64',
      hype:
        'Grand Champion intuition is never initialized from random noise. Every Arashikage Hex64 agent begins its life at the feet of its Gen 3 Perceiver Sensei—absorbing 173,650 steps of battle-tested aerial and positioning mastery during Warm-Start Distillation—before entering 4,096 parallel arenas with G=8 cloned cohorts to discover 60 Hz subtick mechanics no teacher ever knew.',
      metaphorTitle: 'HIDDEN CIPHER // COMPLETING HEXAGRAM 64 (䷿) ACROSS 4 GENERATIONS',
      metaphorBody:
        'Each generation in the header switcher forged additional lines of Hexagram 64 (䷿): Gen 1 (RET-40) laid the first 2 bars (160D MLP + 32-quantile QR-PPO); Gen 2 (Factorized-684) completed the 3-bar Lower Trigram ☵ (24-entity tokens + PopArt); Gen 3 (Perceiver Step 173,650) added the 4th & 5th bars (latent cross-attention + skill head) and now serves as the Distill Sensei; Gen 4 (Hex64) crowns Line 6 (2⁶ = 64 tokens) in full equilibrium.'
    },
    {
      id: 'c05',
      num: '05',
      short: '64-Fold Pitch Mandala',
      title: 'THE 64-FOLD ARENA MANDALA // SPATIAL-TO-NEURAL BLUEPRINT',
      archetype: 'Isometric Stadium Constellation & 6-Bar Field Projection',
      tagline: '1 Ego + 5 Cars + 1 Ball + 8 Arcs + 1 Match + 34 Pads + 6 Posts + 4 Wheels + 4 Walls = 64',
      hype:
        'To a conventional RL bot, the stadium is a flat array of anonymous floats. To Arashikage Hex64, the pitch is a living 64-node geometric constellation where every boost pad respawn timer, suspension wheel contact, goal-post corner, and 4-second parabolic ball bounce is a first-class citizen in a 64×64 relational graph.',
      metaphorTitle: 'HIDDEN CIPHER // COUNT THE STADIUM AROUND YOU: 64 ENTITIES = HEX64',
      metaphorBody:
        'Project the 6 bars of Hexagram 64 (䷿) across the [-4096, +4096] stadium floor: the 3 Broken Yin bars (Lines 1, 3, 5) part cleanly around the center axis where Slot 0 (Ego Car) sits, while the 63 surrounding world & proprioceptive entities populate concentric spatial orbits (16 dynamic physics entities + 48 static/field context nodes = 64 total tokens in the 16×48 Bipartite Graph).'
    },
    {
      id: 'c06',
      num: '06',
      short: 'Master Trilogy Codex',
      title: 'THE ARASHIKAGE · HEX64 MASTER CODEX // UNIFIED TRILOGY',
      archetype: 'Interactive 9-Segment Hexagram 64 Crest + 3-Pillar Decoder & Launchpad',
      tagline: 'Name: 嵐影 (Storm Shadow) · Version: Hex64 (䷿ 64th Hexagram & 64 Tokens) · Lineage: 4 Gens',
      hype:
        'Every 66.7 milliseconds, Arashikage Hex64 bridges two worlds: the 6-bar I Ching symmetry of Hexagram 64 (䷿ Fire ☲ over Water ☵) and a sub-5.5 ms C++20/CUDA neural-symbolic engine. Click any of the 9 segments of the Hexagram 64 crest to inspect how the 3 Broken Yin bars (S1, S3, S5) form dual-stream forks while the 3 Solid Yang bars (S2, S4, S6) form unified synthesis trunks.',
      metaphorTitle: 'HIDDEN CIPHER // 3 BROKEN YIN DUAL-STREAMS × 3 SOLID YANG SYNTHESIS TRUNKS',
      metaphorBody:
        'Why does Hexagram 64 (䷿) alternate Broken (⚋) and Solid (⚊) bars from bottom to top? In Hex64, the odd lines (S1 Sim || Live ShadowTwin, S3 Titans Memory || Soft-MoE, S5 Binary || Continuous Flow Action Heads) are bifurcated dual-stream stages (⚋), while the even lines (S2 Unified 64-Token Bipartite Graph, S4 Unified FSQ+JEPA Foresight, S6 Multi-Horizon Critic & League Apex) are unified synthesis stages (⚊)!'
    },
    {
      id: 'c07',
      num: '07',
      short: 'Hanko Vermilion Seal',
      title: '嵐影之印 // THE CARVED HANKO SEAL & UKIYO-E MANIFESTO',
      archetype: 'Japanese Cinnabar Hanko Stamp (判子) & Kintsugi Editorial Grid',
      tagline: '30-Year Personal Inkan Seal (䷿) ≡ SCHEMA_CRC64 (0x185109A0FD5E64D3)',
      hype:
        'In Japan, a master craftsman’s Jitsuin (registered cinnabar Hanko seal) is their unforgeable signature of authenticity. Here, the creator’s 30-year I Ching emblem (Hexagram 64 ䷿) is carved in vermilion cinnabar and fused with SCHEMA_CRC64 = 0x185109A0FD5E64D3—stamping C++20, PyTorch CUDA, and TypeScript with a single immutable 64-bit cryptographic contract.',
      metaphorTitle: 'HIDDEN CIPHER // KINTSUGI BYTE SEAMS & THE UNFORGEABLE 64-BIT ABI STAMP',
      metaphorBody:
        'Click [印 Toggle Kintsugi Stamp] below the artwork to trigger a physical Hanko impression: gold Kintsugi veins illuminate the exact byte boundaries of the 5,376B (84 × 64B) arena slice—showing how bytes 0..4863 (Public 64-Entity Manifold) and bytes 4864..5375 (512B Privileged Critic) are sealed together without a single magic-slice leak.'
    },
    {
      id: 'c08',
      num: '08',
      short: 'Silicon Wafer ASIC',
      title: 'HEX-64 DIE FLOORPLAN // 6-BAR METAL-1 BUS & L1 CACHE RING',
      archetype: 'Sub-Nanometer GPU Photolithography & Cleanroom EDA Wafer Map',
      tagline: '84 × 64B = 5,376B L1 Cache Slice · Physical Yin-Gap Memory Air-Gap',
      hype:
        'Viewed under an electron microscope, the 6 bars of Hexagram 64 (䷿) form the exact Metal-1 interconnect topology of a custom real-time RL processor: 3 full-width 512-bit SIMD crossbars (S2, S4, S6) interleaved with 3 split dual-bank SRAM arrays (S1, S3, S5), surrounded by a 64-pad L1 cache ring clocked at 120 Hz physics / 60 Hz subtick / 15 Hz policy.',
      metaphorTitle: 'HIDDEN CIPHER // THE YIN GAP AS ZERO-LEAKAGE HARDWARE AIR-GAP',
      metaphorBody:
        'In competitive RLBot deployment, privileged training state (opponent boost, hidden flip torque, 512B critic context) must never leak into live inference. In the Hex-64 Silicon floorplan, the center dielectric trench cutting through the 3 Broken Yin bars (Lines 1, 3, 5) is the physical hardware air-gap isolating live inference streams from simulator-only training state.'
    },
    {
      id: 'c09',
      num: '09',
      short: 'Bauhaus 6×3 Console',
      title: 'ZURICH 6×3 SIGNAL CONSOLE // TENSOR MASTERING EQUALIZER',
      archetype: 'Josef Müller-Brockmann Swiss Grid meets Braun TG-1000 Studio Desk',
      tagline: '6 Hexagram 64 Fader Rows × 3 Pathway Columns (Live · Train · Distill) = 18 Blocks',
      hype:
        'Precision engineering is harmonic proportion made visible. Structured on a strict Swiss constructivist grid, the 6 bars of Hexagram 64 (䷿) become 6 tactile studio mastering faders spanning the 3 execution pathways (Live 5.5ms, Train 4,096 Arenas, Distill Warm-Start)—proving visually why 6 Stages × 3 Pathways = the 18 Subsystem Blocks on the canvas.',
      metaphorTitle: 'HIDDEN CIPHER // MULTI-HORIZON FREQUENCY RESPONSE (120Hz → γ=0.9995)',
      metaphorBody:
        'Click any of the 6 I Ching fader rows to solo its frequency band: from the 120 Hz C++20 physics carrier wave (Line 1 / Stage 1) and 60 Hz subtick ODE modulation (Line 5 / Stage 5) to the 4 Symlog HL-Gauss discount horizons γ ∈ {0.95 (1.3s), 0.98 (3.3s), 0.995 (13s), 0.9995 (Match)} at the top Yang bar (Line 6 / Stage 6).'
    },
    {
      id: 'c10',
      num: '10',
      short: 'Bagua C2v Astrolabe',
      title: 'BAGUA × HEX64 ASTROLABE // THE OCTUPLE HARMONIC COMPASS',
      archetype: 'Ancient Bronze Luo Pan (羅盤) Geomantic Compass & SO(3) Group Engine',
      tagline: '8 Trigrams × 8 = 64 Hexagrams · 8 MoE Experts · 8 FSQ Triplets · G=8 Clones',
      hype:
        'In the I Ching, 8 fundamental Trigrams (2³ = 8) combine in pairs (8 × 8 = 64) to culminate in Hexagram 64 (䷿ 未濟). In Arashikage Hex64, 8 is the fundamental architectural harmonic: 8 physics ticks per policy step, 8 ballistic trajectory anchors, 8 Soft-MoE experts, 8 cyclic 3D FSQ skill triplets (8×5³ = 1,000 codes), G=8 Bullet3 clones, and 8×8 = 64 arena entity tokens.',
      metaphorTitle: 'HIDDEN CIPHER // INVARIANT HEX64 CORE UNDER C2v ROTATION & REFLECTION',
      metaphorBody:
        'Use the interactive [↻ Rotate 180° Team C2v] button below the astrolabe: watch the outer 64-entity ring and 8-trigram bezel rotate 180° across the pitch while the central 6-bar Hexagram 64 core locks canonical team symmetry (det(M_C2v) = +1).'
    },
    {
      id: 'c11',
      num: '11',
      short: 'Katana Tsuba-64',
      title: '鍔 TSUBA-64 // FORGED DAMASCUS GUARD & DIFFERENTIAL QUENCH',
      archetype: 'Edo-Period Sukashi-Tsuba Iron Hand-Guard & Yaki-ire Hamon Metallurgy',
      tagline: '64-Fold Damascus Steel (2⁶ = 64) · Fire ☲ (Upper) & Water ☵ (Lower) Temper',
      hype:
        'A master swordsmith folds Tamahagane steel 6 times (2⁶ = 64 layers) and creates an unbreakable blade with a razor edge through Yaki-ire—uniting glowing Forge Fire (☲ Upper Trigram of Hexagram 64) and Deep Quench Water (☵ Lower Trigram of Hexagram 64). Arashikage Hex64 is forged the exact same way: 64 entity tokens tempered across 4,096 arenas into a sub-5.5 ms competitive edge.',
      metaphorTitle: 'HIDDEN CIPHER // THE YIN GAPS AS KATANA TANG (NAKAGO-ANA) & TWIN SLOTS',
      metaphorBody:
        'Every traditional Japanese Tsuba hand-guard is pierced at its center by the Nakago-Ana (where the katana blade tang locks through) flanked by twin Kogai/Kozuka utility slots. In Tsuba-64, the central gaps of the 3 Broken Yin bars (Lines 1, 3, 5) form the exact blade tang channel, while the 3 Solid Yang bars (Lines 2, 4, 6) form the structural cross-guards.'
    },
    {
      id: 'c12',
      num: '12',
      short: '3D 6-Strata Prism',
      title: 'HEX-64 HOLOGRAPHIC STRATA // 2D AVATAR ↔ 3D ISOMETRIC STACK',
      archetype: 'Exploded Isometric CAD Prism & Optical Data-Via Projection',
      tagline: '2D Front Elevation = Hexagram 64 Avatar (䷿) · 3D Isometric = 6-Layer Stack',
      hype:
        'What looks like a flat 2D 6-bar I Ching symbol (Hexagram 64 ䷿) from the front elevation is revealed in 3D isometric space to be the exact orthographic projection of a 6-layer neural-symbolic compute stack—where the 3 Solid Yang bars (S2, S4, S6) extrude into unified monolithic slabs and the 3 Broken Yin bars (S1, S3, S5) extrude into bifurcated dual-stream slabs pierced by 3 vertical optical data-vias (Live, Train, Distill).',
      metaphorTitle: 'HIDDEN CIPHER // TOGGLE 2D AVATAR ELEVATION ↔ 3D EXPLODED STRATA',
      metaphorBody:
        'Click [◰ Toggle 2D Seal ↔ 3D Strata] below the hologram to morph between the flat 30-year Hexagram 64 emblem and the 3D 6-plane isometric CAD assembly, or click any of the 6 glass strata planes to inspect its tensor contract.'
    }
  ];

  // Shared 3-Pillar Deep Lore Data (always accessible in every concept)
  const LORE_PILLARS = [
    {
      badge: 'PILLAR I // THE NAME CIPHER',
      title: 'Why "Arashikage" (嵐影)?',
      subtitle: 'strmshdw → Storm (嵐 Arashi) + Shadow (影 Kage)',
      bullets: [
        'Creator Handle Cipher: Direct Japanese translation of strmshdw (Storm Shadow) into 嵐 (Arashi: Mountain + Wind = Storm) and 影 (Kage: Light + Three Rays = Shadow).',
        '嵐 The Kinetic Storm: 120 Hz rigid-body physics across 4,096 parallel RocketSim arenas, G=8 exact Bullet3 cloned cohorts, and K_sub=4 (60 Hz) continuous subtick control impulses.',
        '影 The Latent Shadow: 1-Tick C++20 RocketSimShadowTwin reconciling live socket jitter + 512B Privileged Shadow Critic + M=16 JEPA Shadow Futures evaluated in < 5.5 ms.',
        'Twin-Blade C2v Symmetry: Enforces Klein 4-Group equivariance (diag(-1,-1,+1)) so Blue/Orange and Left/Right sidewalls share 100% identical neural weights.'
      ]
    },
    {
      badge: 'PILLAR II // THE VERSION CIPHER',
      title: 'Why "Hex64" (䷿ 未濟 · 六十四)?',
      subtitle: 'Hexagram 64 (Final Form) · 2⁶ = 64 Arena Entities · 64B Cache ABI',
      bullets: [
        'Hexagram 64 (䷿ 未濟 Wèi Jì — Fire ☲ over Water ☵): The 64th and final hexagram of the I Ching (top-to-bottom Solid, Broken, Solid, Broken, Solid, Broken), symbolizing continuous evolution and unbounded mastery.',
        '64 Arena Entity Tokens: Slots 0..63 in the 5,376B slice = 1 Ego Car + 5 Other Cars + 1 Ball + 8 Trajectory Anchors + 1 Match Node + 34 Boost Pads + 6 Goal Posts + 4 Wheels + 4 Surfaces = 64!',
        '64-Byte Hardware Alignment: 5,376B = 84 × 64-byte CPU L1 cache lines (alignas(64)), 64×64 entity token matrix, and SCHEMA_CRC64 = 0x185109A0FD5E64D3.',
        '6 Stages × 3 Pathways = 18 Blocks: 6 horizontal I Ching bars (Stages 1..6) × 3 trigram lines (Live, Train, Distill) = 18 subsystem blocks.'
      ]
    },
    {
      badge: 'PILLAR III // THE DOJO LINEAGE',
      title: '4 Generations: Sensei to Student',
      subtitle: 'Gen 1 RET-40 → Gen 2 MLP-684 → Gen 3 Perceiver → Gen 4 Hex64',
      bullets: [
        'Gen 1 · RET-40: 160D flat frame + 20-step ring buffer + 32-quantile QR-PPO & 120 Hz geodesic PD.',
        'Gen 2 · Factorized-684: 24-entity scene tokens + 752D privileged critic + PopArt normalization + fused 122-logit head.',
        'Gen 3 · ST-Perceiver (The Sensei · Step 173,650): 256D Perceiver latent bottleneck + GRU memory + Compositional Skill Head.',
        'Gen 4 · Arashikage Hex64: Warm-started from Gen 3 Sensei in Distill mode, then unleashed into 4,096-arena G=8 Flow-GRPO + FP32 Titans + Coconut + 1,000 FSQ + 16-rollout JEPA.'
      ]
    }
  ];

  function createHeaderIChingEmblemSvg() {
    // Crisp 6-bar Hexagram 64 (䷿ 未濟: Fire ☲ over Water ☵) icon for the Top Identity Header
    // Top-to-bottom: Solid (L6), Broken (L5), Solid (L4) [Fire ☲] / Broken (L3), Solid (L2), Broken (L1) [Water ☵]
    return (
      '<svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" aria-hidden="true">' +
      '<rect x="2" y="2" width="20" height="2.4" rx="0.6" fill="#f97316" />' +
      '<rect x="2" y="5.8" width="8.2" height="2.4" rx="0.6" fill="#f97316" />' +
      '<rect x="13.8" y="5.8" width="8.2" height="2.4" rx="0.6" fill="#f97316" />' +
      '<rect x="2" y="9.6" width="20" height="2.4" rx="0.6" fill="#f97316" />' +
      '<rect x="2" y="13.4" width="8.2" height="2.4" rx="0.6" fill="currentColor" />' +
      '<rect x="13.8" y="13.4" width="8.2" height="2.4" rx="0.6" fill="currentColor" />' +
      '<rect x="2" y="17.2" width="20" height="2.4" rx="0.6" fill="currentColor" />' +
      '<rect x="2" y="21" width="8.2" height="2.4" rx="0.6" fill="currentColor" />' +
      '<rect x="13.8" y="21" width="8.2" height="2.4" rx="0.6" fill="currentColor" />' +
      '</svg>'
    );
  }

  // Helper to render the canonical 6-bar Hexagram 64 (䷿) SVG group (clickable/hoverable bars)
  function renderCanonicalIChingBarsSvg(opts) {
    const cx = opts.cx || 180;
    const cy = opts.cy || 150;
    const width = opts.width || 156;
    const barH = opts.barH || 15;
    const gapY = opts.gapY || 11;
    const gapX = opts.gapX || 24;
    const activeBarIdx = typeof opts.activeBarIdx === 'number' ? opts.activeBarIdx : 0;
    const stageCols = opts.stageCols || ['#0284c7', '#2563eb', '#7c3aed', '#d97706', '#059669', '#dc2626'];
    const styleMode = opts.styleMode || 'standard'; // 'vermilion', 'silicon', 'fader', 'tsuba', 'strata3d'
    const strata3d = Boolean(opts.strata3d);

    const totalH = 6 * barH + 5 * gapY;
    const startY = cy - totalH * 0.5;
    const leftX = cx - width * 0.5;
    const segW = (width - gapX) * 0.5;

    let svg = '';
    ICHING_BAR_SPECS.forEach((spec, rIdx) => {
      const y = startY + rIdx * (barH + gapY);
      const isSel = rIdx === activeBarIdx;
      const stCol = stageCols[spec.stageIdx] || '#0284c7';
      // Hexagram 64 (䷿): Upper Trigram (rIdx 0..2) = Fire ☲ (#f97316), Lower Trigram (rIdx 3..5) = Water ☵ (#0ea5e9)
      const fireWaterCol = rIdx < 3 ? '#f97316' : '#0ea5e9';
      const fillCol =
        styleMode === 'vermilion'
          ? isSel ? '#fbbf24' : '#dc2626'
          : styleMode === 'silicon'
          ? rIdx < 3 ? '#f59e0b' : '#00e5ff'
          : styleMode === 'tsuba'
          ? isSel ? '#38bdf8' : '#e2e8f0'
          : isSel
          ? stCol
          : fireWaterCol;

      const strokeCol = isSel ? '#ffffff' : stCol;
      const strokeW = isSel ? 2.2 : 1.1;
      const opacity = isSel ? 1.0 : 0.86;

      if (strata3d) {
        // 3D Isometric Extruded Slab for Concept 12
        const isoY = cy - 78 + rIdx * 31;
        const skewX = -22;
        const slabW = width * 0.88;
        const slabH = 14;
        const sx = cx - slabW * 0.5 + 10;
        if (spec.polarity === 'yang') {
          const pts =
            sx + ',' + isoY + ' ' +
            (sx + slabW) + ',' + isoY + ' ' +
            (sx + slabW + skewX) + ',' + (isoY + slabH) + ' ' +
            (sx + skewX) + ',' + (isoY + slabH);
          svg +=
            '<g data-iching-bar="' + rIdx + '" class="cursor-pointer">' +
            '<polygon points="' + pts + '" fill="' + fillCol + '" fill-opacity="' + (isSel ? '0.92' : '0.68') + '" stroke="' + strokeCol + '" stroke-width="' + strokeW + '" />' +
            '<text x="' + (sx + slabW + 8) + '" y="' + (isoY + 10) + '" fill="' + stCol + '" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">S' + (spec.stageIdx + 1) + '</text>' +
            '</g>';
        } else {
          const sW = (slabW - 20) * 0.5;
          const ptsL =
            sx + ',' + isoY + ' ' +
            (sx + sW) + ',' + isoY + ' ' +
            (sx + sW + skewX) + ',' + (isoY + slabH) + ' ' +
            (sx + skewX) + ',' + (isoY + slabH);
          const rx = sx + sW + 20;
          const ptsR =
            rx + ',' + isoY + ' ' +
            (rx + sW) + ',' + isoY + ' ' +
            (rx + sW + skewX) + ',' + (isoY + slabH) + ' ' +
            (rx + skewX) + ',' + (isoY + slabH);
          svg +=
            '<g data-iching-bar="' + rIdx + '" class="cursor-pointer">' +
            '<polygon points="' + ptsL + '" fill="' + fillCol + '" fill-opacity="' + (isSel ? '0.92' : '0.68') + '" stroke="' + strokeCol + '" stroke-width="' + strokeW + '" />' +
            '<polygon points="' + ptsR + '" fill="' + fillCol + '" fill-opacity="' + (isSel ? '0.92' : '0.68') + '" stroke="' + strokeCol + '" stroke-width="' + strokeW + '" />' +
            '<text x="' + (sx + slabW + 8) + '" y="' + (isoY + 10) + '" fill="' + stCol + '" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">S' + (spec.stageIdx + 1) + '</text>' +
            '</g>';
        }
        return;
      }

      svg += '<g data-iching-bar="' + rIdx + '" class="cursor-pointer">';
      if (spec.polarity === 'yang') {
        svg +=
          '<rect x="' + leftX + '" y="' + y + '" width="' + width + '" height="' + barH + '" rx="3" fill="' + fillCol + '" fill-opacity="' + opacity + '" stroke="' + strokeCol + '" stroke-width="' + strokeW + '" />';
      } else {
        svg +=
          '<rect x="' + leftX + '" y="' + y + '" width="' + segW + '" height="' + barH + '" rx="3" fill="' + fillCol + '" fill-opacity="' + opacity + '" stroke="' + strokeCol + '" stroke-width="' + strokeW + '" />' +
          '<rect x="' + (leftX + segW + gapX) + '" y="' + y + '" width="' + segW + '" height="' + barH + '" rx="3" fill="' + fillCol + '" fill-opacity="' + opacity + '" stroke="' + strokeCol + '" stroke-width="' + strokeW + '" />';
      }

      if (styleMode === 'fader') {
        const knobX = leftX + width * (0.32 + ((5 - rIdx) * 0.11));
        svg +=
          '<rect x="' + knobX + '" y="' + (y - 3) + '" width="8" height="' + (barH + 6) + '" rx="1.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />';
      }

      svg +=
        '<text x="' + (leftX + width + 10) + '" y="' + (y + barH * 0.74) + '" fill="' + (isSel ? stCol : '#94a3b8') + '" font-family="IBM Plex Mono, monospace" font-size="10" font-weight="700">' +
        'S' + (spec.stageIdx + 1) + (spec.polarity === 'yang' ? ' ⚊' : ' ⚋') +
        '</text>';
      svg += '</g>';
    });
    return svg;
  }

  // Render Concept-Specific Interactive SVG Artwork (356 x 286 viewBox)
  function renderConceptArtworkSvg(conceptIdx, state, stageCols, isLight) {
    const fg = isLight ? '#0f172a' : '#f8fafc';
    const muted = isLight ? '#64748b' : '#94a3b8';
    const panelBg = isLight ? '#f1f5f9' : '#0b1120';
    const gridStroke = isLight ? 'rgba(15,23,42,0.12)' : 'rgba(148,163,184,0.16)';
    const barIdx = state.activeBarIdx;

    // Shared 64-Tick Orbital Ring generator (Slot 0 Ego Zenith + 63 Relational Peers = 64)
    const build64OrbitalRing = (cx, cy, rOuter, rInner, rotDeg) => {
      let ticks = '';
      const rotRad = ((rotDeg || 0) * Math.PI) / 180;
      for (let i = 0; i < 64; i++) {
        const ang = -Math.PI * 0.5 + rotRad + (i * 2 * Math.PI) / 64;
        const isEgo = i === 0;
        const r1 = isEgo ? rInner - 5 : rInner;
        const r2 = isEgo ? rOuter + 6 : i % 8 === 0 ? rOuter + 3 : rOuter;
        const x1 = (cx + Math.cos(ang) * r1).toFixed(1);
        const y1 = (cy + Math.sin(ang) * r1).toFixed(1);
        const x2 = (cx + Math.cos(ang) * r2).toFixed(1);
        const y2 = (cy + Math.sin(ang) * r2).toFixed(1);
        const col = isEgo
          ? '#eab308'
          : i <= 5
          ? '#38bdf8'
          : i === 6
          ? '#f97316'
          : i <= 14
          ? '#a855f7'
          : i <= 49
          ? '#10b981'
          : '#ec4899';
        ticks +=
          '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (isEgo ? '3' : i % 8 === 0 ? '1.8' : '1.15') + '" />';
      }
      return ticks;
    };

    let inner = '';
    const cNum = conceptIdx + 1;

    if (cNum === 1) {
      // 01: The I Ching Hex64 Orbital Codex (Hexagram 64 ䷿ 未濟: Fire ☲ over Water ☵ + 64-Tick Ring)
      inner =
        '<circle cx="172" cy="145" r="124" fill="none" stroke="' + gridStroke + '" stroke-width="1" stroke-dasharray="3 3" />' +
        '<circle cx="172" cy="145" r="108" fill="none" stroke="' + gridStroke + '" stroke-width="1.2" />' +
        build64OrbitalRing(172, 145, 120, 108, 0) +
        '<text x="172" y="15" text-anchor="middle" fill="#eab308" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">▼ HEXAGRAM 64 (䷿ 未濟) · 64 ARENA ENTITY TOKENS</text>' +
        '<line x1="65" y1="145" x2="279" y2="145" stroke="' + muted + '" stroke-width="1" stroke-dasharray="4 3" />' +
        '<text x="48" y="96" text-anchor="end" fill="#f97316" font-family="IBM Plex Mono, monospace" font-size="10" font-weight="700">☲ FIRE</text>' +
        '<text x="48" y="108" text-anchor="end" fill="' + muted + '" font-family="IBM Plex Mono, monospace" font-size="8.5">S4..S6 APEX</text>' +
        '<text x="48" y="192" text-anchor="end" fill="#0ea5e9" font-family="IBM Plex Mono, monospace" font-size="10" font-weight="700">☵ WATER</text>' +
        '<text x="48" y="204" text-anchor="end" fill="' + muted + '" font-family="IBM Plex Mono, monospace" font-size="8.5">S1..S3 BASE</text>' +
        renderCanonicalIChingBarsSvg({ cx: 168, cy: 145, width: 132, barH: 13, gapY: 9, gapX: 22, activeBarIdx: barIdx, stageCols: stageCols });
    } else if (cNum === 2) {
      // 02: Storm & Shadow Twin-Blade Duality (C2v Mirror Axis through Yin Center Gap of Hexagram 64)
      const mir = state.c2vMirrored ? -1 : 1;
      inner =
        '<rect x="14" y="22" width="154" height="246" rx="8" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.35)" stroke-width="1" />' +
        '<rect x="176" y="22" width="170" height="246" rx="8" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.35)" stroke-width="1" />' +
        '<text x="90" y="42" text-anchor="middle" fill="#f97316" font-family="Space Grotesk, sans-serif" font-size="13" font-weight="800">' + (mir === 1 ? '嵐 ARASHI // STORM' : '影 KAGE // SHADOW') + '</text>' +
        '<text x="90" y="55" text-anchor="middle" fill="' + muted + '" font-family="IBM Plex Mono, monospace" font-size="8.5">' + (mir === 1 ? '4,096 Arenas · 60Hz ODE' : '1-Tick Twin · 16 JEPA') + '</text>' +
        '<text x="256" y="42" text-anchor="middle" fill="#0ea5e9" font-family="Space Grotesk, sans-serif" font-size="13" font-weight="800">' + (mir === 1 ? '影 KAGE // SHADOW' : '嵐 ARASHI // STORM') + '</text>' +
        '<text x="256" y="55" text-anchor="middle" fill="' + muted + '" font-family="IBM Plex Mono, monospace" font-size="8.5">' + (mir === 1 ? '1-Tick Twin · 16 JEPA' : '4,096 Arenas · 60Hz ODE') + '</text>' +
        renderCanonicalIChingBarsSvg({ cx: 172, cy: 152, width: 152, barH: 14, gapY: 10, gapX: 28, activeBarIdx: barIdx, stageCols: stageCols }) +
        '<line x1="172" y1="16" x2="172" y2="274" stroke="#eab308" stroke-width="2" stroke-dasharray="5 3" />' +
        '<rect x="108" y="262" width="128" height="18" rx="4" fill="#eab308" />' +
        '<text x="172" y="274" text-anchor="middle" fill="#0f172a" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="700">C2v MIRROR AXIS (det=+1)</text>';
    } else if (cNum === 3) {
      // 03: 66.7ms Time-Dilation Chronograph (Hexagram 64 Tachometer)
      inner =
        '<circle cx="172" cy="145" r="122" fill="none" stroke="' + muted + '" stroke-width="1.5" />' +
        '<path d="M 172 23 A 122 122 0 1 1 52 170" fill="none" stroke="rgba(239,68,68,0.35)" stroke-width="7" />' +
        '<path d="M 172 23 A 122 122 0 0 1 258 58" fill="none" stroke="#10b981" stroke-width="8" />' +
        '<text x="172" y="14" text-anchor="middle" fill="#10b981" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">⚡ HEX64: 5.1ms CUDAGRAPH vs 250ms HUMAN REACTION</text>' +
        '<circle cx="172" cy="145" r="100" fill="none" stroke="' + gridStroke + '" stroke-width="1" stroke-dasharray="2 4" />' +
        renderCanonicalIChingBarsSvg({ cx: 168, cy: 146, width: 124, barH: 12.5, gapY: 8.5, gapX: 20, activeBarIdx: barIdx, stageCols: stageCols }) +
        '<text x="172" y="255" text-anchor="middle" fill="' + fg + '" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">15Hz POLICY (66.7ms) · 60Hz SUBTICK · 120Hz SIM</text>';
    } else if (cNum === 4) {
      // 04: Four Scrolls of the Dojo (Progressive 2 -> 3 -> 5 -> 6 Bar Hexagram 64 ䷿ Evolution)
      const gens = [
        { code: 'GEN 1', name: 'RET-40', bars: 2, tok: '160D MLP', col: '#64748b' },
        { code: 'GEN 2', name: 'MLP-684', bars: 3, tok: '24-Token', col: '#0284c7' },
        { code: 'GEN 3', name: 'SENSEI', bars: 5, tok: 'Perceiver', col: '#a855f7' },
        { code: 'GEN 4', name: 'HEX64', bars: 6, tok: '64-Token', col: '#f97316' }
      ];
      gens.forEach((g, idx) => {
        const x = 16 + idx * 84;
        const isHex = idx === 3;
        inner +=
          '<rect x="' + x + '" y="24" width="76" height="238" rx="6" fill="' + (isHex ? 'rgba(249,115,22,0.12)' : 'rgba(148,163,184,0.07)') + '" stroke="' + g.col + '" stroke-width="' + (isHex ? '2' : '1.2') + '" />' +
          '<text x="' + (x + 38) + '" y="44" text-anchor="middle" fill="' + g.col + '" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">' + g.code + '</text>' +
          '<text x="' + (x + 38) + '" y="58" text-anchor="middle" fill="' + fg + '" font-family="Space Grotesk, sans-serif" font-size="11" font-weight="800">' + g.name + '</text>';
        // Hexagram 64 (䷿) top-to-bottom: b=0 Solid, b=1 Broken, b=2 Solid, b=3 Broken, b=4 Solid, b=5 Broken
        for (let b = 0; b < 6; b++) {
          const by = 78 + b * 22;
          const activeInGen = (5 - b) < g.bars;
          const isYin = ICHING_BAR_SPECS[b].polarity === 'yin';
          const bCol = activeInGen ? g.col : gridStroke;
          if (!isYin) {
            inner += '<rect x="' + (x + 12) + '" y="' + by + '" width="52" height="11" rx="2" fill="' + bCol + '" data-iching-bar="' + b + '" class="cursor-pointer" />';
          } else {
            inner +=
              '<rect x="' + (x + 12) + '" y="' + by + '" width="22" height="11" rx="2" fill="' + bCol + '" data-iching-bar="' + b + '" class="cursor-pointer" />' +
              '<rect x="' + (x + 42) + '" y="' + by + '" width="22" height="11" rx="2" fill="' + bCol + '" data-iching-bar="' + b + '" class="cursor-pointer" />';
          }
        }
        inner +=
          '<text x="' + (x + 38) + '" y="226" text-anchor="middle" fill="' + muted + '" font-family="IBM Plex Mono, monospace" font-size="8.5" font-weight="700">' + g.bars + '/6 BARS</text>' +
          '<text x="' + (x + 38) + '" y="242" text-anchor="middle" fill="' + fg + '" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="700">' + g.tok + '</text>';
      });
    } else if (cNum === 5) {
      // 05: 64-Fold Pitch Mandala (Isometric Stadium + 6 Hexagram 64 Field Lines + 64 Entities)
      inner =
        '<polygon points="62,30 282,30 332,256 12,256" fill="rgba(16,185,129,0.07)" stroke="#10b981" stroke-width="1.5" />' +
        '<ellipse cx="172" cy="144" rx="44" ry="26" fill="none" stroke="#eab308" stroke-width="1.4" stroke-dasharray="4 2" />' +
        '<circle cx="172" cy="144" r="6" fill="#eab308" />' +
        '<text x="172" y="19" text-anchor="middle" fill="#10b981" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">64-ENTITY STADIUM MANIFOLD (1 EGO + 63 PEERS = 64)</text>' +
        renderCanonicalIChingBarsSvg({ cx: 168, cy: 144, width: 150, barH: 13, gapY: 11, gapX: 34, activeBarIdx: barIdx, stageCols: stageCols }) +
        '<text x="172" y="276" text-anchor="middle" fill="' + fg + '" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="700">6 CARS · 1 BALL · 8 ARCS · 1 MATCH · 34 PADS · 6 POSTS · 4 WHEELS · 4 WALLS</text>';
    } else if (cNum === 6) {
      // 06: The Master Codex (Unified Trilogy: Octagonal Shield + 64-Tick Bezel + Hexagram 64 Seal)
      inner =
        '<polygon points="122,18 222,18 292,88 292,198 222,268 122,268 52,198 52,88" fill="rgba(2,132,199,0.07)" stroke="#0284c7" stroke-width="1.8" />' +
        build64OrbitalRing(172, 143, 114, 103, 0) +
        '<text x="172" y="42" text-anchor="middle" fill="#eab308" font-family="Space Grotesk, sans-serif" font-size="11" font-weight="800">嵐影 ARASHIKAGE · HEX64 (䷿)</text>' +
        renderCanonicalIChingBarsSvg({ cx: 168, cy: 146, width: 128, barH: 13, gapY: 9, gapX: 22, activeBarIdx: barIdx, stageCols: stageCols }) +
        '<text x="172" y="256" text-anchor="middle" fill="' + muted + '" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="700">2⁶ = 64 ENTITIES · 6 STAGES × 3 PATHWAYS</text>';
    } else if (cNum === 7) {
      // 07: Hanko Vermilion Seal & Ukiyo-e Woodblock Manifesto (嵐影之印 · Hexagram 64 ䷿)
      const stamped = state.hankoStamped;
      inner =
        '<rect x="52" y="20" width="236" height="244" rx="18" fill="rgba(220,38,38,0.10)" stroke="#dc2626" stroke-width="' + (stamped ? '5' : '3') + '" />' +
        '<rect x="60" y="28" width="220" height="228" rx="12" fill="none" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="6 3" />' +
        '<text x="30" y="85" text-anchor="middle" fill="#dc2626" font-family="Space Grotesk, sans-serif" font-size="22" font-weight="900">嵐</text>' +
        '<text x="30" y="115" text-anchor="middle" fill="#dc2626" font-family="Space Grotesk, sans-serif" font-size="22" font-weight="900">影</text>' +
        '<text x="30" y="155" text-anchor="middle" fill="' + fg + '" font-family="Space Grotesk, sans-serif" font-size="18" font-weight="800">六</text>' +
        '<text x="30" y="180" text-anchor="middle" fill="' + fg + '" font-family="Space Grotesk, sans-serif" font-size="18" font-weight="800">十</text>' +
        '<text x="30" y="205" text-anchor="middle" fill="' + fg + '" font-family="Space Grotesk, sans-serif" font-size="18" font-weight="800">四</text>' +
        renderCanonicalIChingBarsSvg({ cx: 166, cy: 138, width: 144, barH: 15, gapY: 10, gapX: 24, activeBarIdx: barIdx, stageCols: stageCols, styleMode: 'vermilion' }) +
        (stamped
          ? '<path d="M 65 142 L 155 136 L 205 148 L 270 139" fill="none" stroke="#fbbf24" stroke-width="2" />'
          : '') +
        '<text x="170" y="250" text-anchor="middle" fill="#dc2626" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">印 HEXAGRAM 64 (䷿) · CRC64 0x185109A0FD5E64D3</text>';
    } else if (cNum === 8) {
      // 08: NVLink Silicon Wafer Die-Shot (HEX-64 ASIC: 84x64B L1 Pad Ring + Yin Memory Air-Gap)
      inner =
        '<rect x="36" y="18" width="272" height="250" rx="6" fill="#070b14" stroke="#00e5ff" stroke-width="1.5" />' +
        build64OrbitalRing(172, 143, 118, 108, 0) +
        '<rect x="161" y="42" width="14" height="198" fill="rgba(234,179,8,0.16)" stroke="#eab308" stroke-width="1" stroke-dasharray="3 2" />' +
        renderCanonicalIChingBarsSvg({ cx: 168, cy: 142, width: 144, barH: 14, gapY: 10, gapX: 24, activeBarIdx: barIdx, stageCols: stageCols, styleMode: 'silicon' }) +
        '<text x="172" y="34" text-anchor="middle" fill="#00e5ff" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="700">DIE: HEX64-ASIC // 4,864B ACTOR | 512B CRITIC AIR-GAP</text>' +
        '<text x="172" y="260" text-anchor="middle" fill="#eab308" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="700">64-PIN L1 CACHE RING (84 × 64B = 5,376B SLICE)</text>';
    } else if (cNum === 9) {
      // 09: Bauhaus / Zurich 6×3 Signal Equalizer Console
      inner =
        '<rect x="28" y="20" width="292" height="246" fill="none" stroke="' + fg + '" stroke-width="2" />' +
        '<line x1="125" y1="20" x2="125" y2="244" stroke="' + gridStroke + '" stroke-width="1.5" stroke-dasharray="3 3" />' +
        '<line x1="222" y1="20" x2="222" y2="244" stroke="' + gridStroke + '" stroke-width="1.5" stroke-dasharray="3 3" />' +
        '<text x="76" y="36" text-anchor="middle" fill="#0ea5e9" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">COL 1: LIVE</text>' +
        '<text x="173" y="36" text-anchor="middle" fill="#10b981" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">COL 2: TRAIN</text>' +
        '<text x="270" y="36" text-anchor="middle" fill="#a855f7" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">COL 3: DISTILL</text>' +
        renderCanonicalIChingBarsSvg({ cx: 168, cy: 142, width: 220, barH: 14, gapY: 11, gapX: 28, activeBarIdx: barIdx, stageCols: stageCols, styleMode: 'fader' }) +
        '<text x="174" y="258" text-anchor="middle" fill="' + fg + '" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">6 HEXAGRAM 64 ROWS × 3 PATHWAYS = 18 BLOCKS</text>';
    } else if (cNum === 10) {
      // 10: Bagua Octagonal Astrolabe & C2v Mirror Compass (8 Trigrams x 8 = 64)
      const rot = state.astrolabeRot || 0;
      const trigrams = ['☲ FIRE', '☶', '☳', '☴', '☵ WATER', '☷', '兑', '☰'];
      let baguaLabels = '';
      for (let k = 0; k < 8; k++) {
        const a = -Math.PI * 0.5 + ((rot * Math.PI) / 180) + (k * Math.PI) / 4;
        const tx = (172 + Math.cos(a) * 116).toFixed(1);
        const ty = (145 + Math.sin(a) * 116 + 3).toFixed(1);
        baguaLabels +=
          '<text x="' + tx + '" y="' + ty + '" text-anchor="middle" fill="' + (k === 0 ? '#f97316' : k === 4 ? '#0ea5e9' : muted) + '" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="700">' + trigrams[k] + '</text>';
      }
      inner =
        '<polygon points="130,38 214,38 274,98 274,192 214,252 130,252 70,192 70,98" fill="none" stroke="#eab308" stroke-width="1.6" />' +
        build64OrbitalRing(172, 145, 102, 92, rot) +
        baguaLabels +
        renderCanonicalIChingBarsSvg({ cx: 168, cy: 145, width: 112, barH: 12, gapY: 8, gapX: 18, activeBarIdx: barIdx, stageCols: stageCols }) +
        '<text x="172" y="278" text-anchor="middle" fill="#eab308" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="700">8 TRIGRAMS × 8 = 64 · 8 MoE · 8 FSQ · G=8 CLONES</text>';
    } else if (cNum === 11) {
      // 11: Katana Tsuba Sword-Guard (Sukashi-Tsuba + Yaki-ire Differential Quench Wave)
      inner =
        '<circle cx="172" cy="144" r="120" fill="#0f172a" stroke="#94a3b8" stroke-width="4" />' +
        '<circle cx="172" cy="144" r="112" fill="none" stroke="#eab308" stroke-width="1" stroke-dasharray="6 3" />' +
        '<polygon points="166,46 178,46 175,242 169,242" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" stroke-width="1.5" />' +
        '<path d="M 60 144 Q 95 128 130 144 T 200 144 T 284 144" fill="none" stroke="#38bdf8" stroke-width="2.2" />' +
        renderCanonicalIChingBarsSvg({ cx: 168, cy: 144, width: 136, barH: 13.5, gapY: 9.5, gapX: 24, activeBarIdx: barIdx, stageCols: stageCols, styleMode: 'tsuba' }) +
        '<text x="172" y="18" text-anchor="middle" fill="#38bdf8" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">鍔 TSUBA-64 // 2⁶ = 64 DAMASCUS FOLDS · YAKI-IRE QUENCH</text>';
    } else {
      // 12: Holographic 6-Strata Isometric Prism (2D Hexagram 64 Seal <-> 3D Exploded 6-Layer Stack)
      const is3d = state.strata3dMode !== false;
      inner =
        '<rect x="24" y="18" width="304" height="252" rx="8" fill="rgba(2,132,199,0.06)" stroke="' + gridStroke + '" stroke-width="1.2" />' +
        (is3d
          ? '<line x1="112" y1="32" x2="112" y2="254" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3 3" />' +
            '<line x1="172" y1="32" x2="172" y2="254" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3 3" />' +
            '<line x1="232" y1="32" x2="232" y2="254" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="3 3" />'
          : '') +
        renderCanonicalIChingBarsSvg({
          cx: 168,
          cy: 144,
          width: 152,
          barH: 14,
          gapY: 10,
          gapX: 24,
          activeBarIdx: barIdx,
          stageCols: stageCols,
          strata3d: is3d
        }) +
        '<text x="172" y="34" text-anchor="middle" fill="#0ea5e9" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="700">' +
        (is3d ? '3D ISOMETRIC 6-STRATA STACK (3 OPTICAL VIAS)' : '2D ORTHOGRAPHIC ELEVATION (HEXAGRAM 64 ䷿ SEAL)') +
        '</text>';
    }

    return (
      '<svg viewBox="0 0 356 286" class="w-full h-auto select-none" role="img" aria-label="Arashikage Hex64 I Ching Interactive Emblem">' +
      '<rect x="2" y="2" width="352" height="282" rx="10" fill="' + panelBg + '" fill-opacity="0.55" stroke="' + gridStroke + '" stroke-width="1" />' +
      inner +
      '</svg>'
    );
  }

  function initSplashCodex(api) {
    // Inject Header Trigger & Modal DOM if not present
    const topIdentityBar = document.getElementById('topIdentityBar');
    const brandDot = document.getElementById('brandDot');
    if (brandDot) {
      const emblemWrap = document.createElement('span');
      emblemWrap.id = 'brandIChingEmblem';
      emblemWrap.className = 'inline-flex items-center justify-center text-theme-accent';
      emblemWrap.innerHTML = createHeaderIChingEmblemSvg();
      brandDot.replaceWith(emblemWrap);
    }

    // Make the entire left identity title cluster clickable to launch the Splash Codex + add explicit button
    if (topIdentityBar) {
      const leftCluster = topIdentityBar.firstElementChild;
      if (leftCluster) {
        leftCluster.classList.add('cursor-pointer', 'group');
        leftCluster.title = 'Click to open Arashikage · Hex64 (䷿ 未濟) I Ching Lore & Architecture Splash Codex';
        const codexBtn = document.createElement('button');
        codexBtn.type = 'button';
        codexBtn.id = 'btnOpenSplashCodex';
        codexBtn.className =
          'no-wrap-btn ml-1.5 px-2 py-0.5 rounded-md text-[10.5px] mono font-bold btn-theme-accent border transition cursor-pointer shrink-0 gap-1';
        codexBtn.title = 'Open Arashikage · Hex64 Lore, I Ching Hexagram 64 (䷿) Symbolism & 12 Splash Concepts';
        codexBtn.innerHTML = '<span>䷿</span><span>Lore &amp; Hex64 Codex</span>';
        leftCluster.appendChild(codexBtn);

        leftCluster.addEventListener('click', (e) => {
          e.stopPropagation();
          openSplashModal();
        });
      }
    }

    // Create Modal Overlay in document.body
    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'splashCodexModal';
    modalBackdrop.setAttribute('role', 'dialog');
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('aria-label', 'Arashikage Hex64 I Ching Lore & Architecture Splash Modal');
    modalBackdrop.className =
      'fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-6 bg-black/75 backdrop-blur-md transition-opacity hidden';

    modalBackdrop.innerHTML =
      '<div id="splashCodexCard" class="surface-elevated border-2 border-subtle rounded-2xl shadow-2xl w-full max-w-[1380px] max-h-[93vh] flex flex-col overflow-hidden">' +
      '  <!-- Top Bar: Brand Identity + 12-Concept Live Switcher + Close -->' +
      '  <div class="shrink-0 px-4 py-2.5 border-b border-hairline surface-root flex flex-wrap items-center justify-between gap-2">' +
      '    <div class="flex items-center gap-2">' +
      '      <span class="px-2 py-0.5 rounded text-[10.5px] mono font-bold btn-theme-accent">嵐影 ARASHIKAGE · HEX64 (䷿ 未濟)</span>' +
      '      <span class="mono text-[11px] font-bold text-secondary-ink hidden sm:inline">I CHING HEXAGRAM 64 (FIRE ☲ OVER WATER ☵) — LIVE 12-CONCEPT GALLERY</span>' +
      '    </div>' +
      '    <div class="flex items-center gap-1.5">' +
      '      <button type="button" id="btnSplashPrevConcept" class="no-wrap-btn px-2 py-0.5 rounded surface-panel border border-hairline hover:border-subtle mono text-[10.5px] font-bold text-primary-ink cursor-pointer" title="Previous Concept (Shift+Left)">◀ Prev</button>' +
      '      <span id="splashConceptCounter" class="mono text-[10.5px] font-bold text-theme-accent px-1.5">CONCEPT 01 / 12</span>' +
      '      <button type="button" id="btnSplashNextConcept" class="no-wrap-btn px-2 py-0.5 rounded surface-panel border border-hairline hover:border-subtle mono text-[10.5px] font-bold text-primary-ink cursor-pointer" title="Next Concept (Shift+Right)">Next ▶</button>' +
      '      <button type="button" id="btnSplashCloseTop" class="no-wrap-btn ml-2 px-2.5 py-0.5 rounded surface-panel border border-subtle mono text-[11px] font-bold text-primary-ink hover:text-theme-accent cursor-pointer" title="Close Splash Modal (Esc)">✕ Close</button>' +
      '    </div>' +
      '  </div>' +
      '  <!-- 12-Concept Pill Ribbon -->' +
      '  <div id="splashConceptRibbon" class="shrink-0 px-3 py-1.5 border-b border-hairline surface-panel grid grid-cols-3 sm:grid-cols-6 xl:grid-cols-12 gap-1"></div>' +
      '  <!-- Main Body: Left Interactive I Ching Artwork + Right Lore, Hype & 3-Pillar Cipher -->' +
      '  <div class="flex-1 min-h-0 overflow-y-auto p-4 lg:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">' +
      '    <!-- Left Column (5 cols): Interactive I Ching Hexagram 64 Emblem & Bar Inspector -->' +
      '    <div class="lg:col-span-5 flex flex-col gap-2.5 surface-card border border-hairline rounded-xl p-3">' +
      '      <div class="flex items-center justify-between gap-2">' +
      '        <span id="splashArchetypeBadge" class="mono text-[10px] font-bold text-theme-accent uppercase tracking-wider"></span>' +
      '        <span class="mono text-[9.5px] text-secondary-ink">Click any of the 6 Hex64 bars (S1..S6)</span>' +
      '      </div>' +
      '      <div id="splashArtworkStage" class="w-full"></div>' +
      '      <div id="splashConceptInteractiveControls" class="flex flex-wrap items-center justify-between gap-1.5"></div>' +
      '      <!-- Selected I Ching Bar -> Stage Telemetry Readout -->' +
      '      <div id="splashBarReadout" class="p-2.5 rounded-lg surface-root border border-subtle flex flex-col gap-1"></div>' +
      '    </div>' +
      '    <!-- Right Column (7 cols): Hype Blurb, Concept Hidden Metaphor & 3-Pillar Cipher Grid -->' +
      '    <div class="lg:col-span-7 flex flex-col gap-3">' +
      '      <div class="surface-card border border-hairline rounded-xl p-3.5 flex flex-col gap-1.5">' +
      '        <div class="flex flex-wrap items-center justify-between gap-2">' +
      '          <span id="splashTagline" class="mono text-[10.5px] font-bold text-theme-accent"></span>' +
      '          <span class="mono text-[10px] font-bold px-2 py-0.5 rounded surface-root border border-hairline text-primary-ink">䷿ 2⁶ = 64 TOKENS · 84×64B CACHE · <=5.5ms LIVE</span>' +
      '        </div>' +
      '        <h2 id="splashConceptTitle" class="text-lg lg:text-xl font-extrabold text-primary-ink tracking-tight"></h2>' +
      '        <p id="splashHypeBlurb" class="text-xs lg:text-[13px] text-primary-ink leading-relaxed font-medium"></p>' +
      '        <div class="mt-1 p-2.5 rounded-lg surface-root border border-hairline flex flex-col gap-0.5">' +
      '          <span id="splashMetaphorTitle" class="mono text-[10px] font-bold text-theme-accent uppercase"></span>' +
      '          <p id="splashMetaphorBody" class="text-[11.5px] text-secondary-ink leading-snug"></p>' +
      '        </div>' +
      '      </div>' +
      '      <!-- 3-Pillar Name / Version / Lineage Cards -->' +
      '      <div id="splashThreePillarsGrid" class="grid grid-cols-1 md:grid-cols-3 gap-2.5"></div>' +
      '    </div>' +
      '  </div>' +
      '  <!-- Footer Bar: Startup Toggle + Quick Launch Actions -->' +
      '  <div class="shrink-0 px-4 py-2.5 border-t border-hairline surface-root flex flex-wrap items-center justify-between gap-2">' +
      '    <label class="inline-flex items-center gap-2 text-xs font-semibold text-secondary-ink cursor-pointer select-none">' +
      '      <input type="checkbox" id="chkShowSplashOnStartup" class="rounded cursor-pointer" checked />' +
      '      <span>Show I Ching Hex64 Splash Codex on first visit / startup (always accessible from Title header)</span>' +
      '    </label>' +
      '    <div class="flex flex-wrap items-center gap-2">' +
      '      <button type="button" id="btnSplashLaunchTour" class="no-wrap-btn px-3 py-1 rounded-lg text-xs font-bold surface-panel text-primary-ink border border-subtle hover:border-current transition cursor-pointer">▶ Start 8-Step Guided Tour</button>' +
      '      <button type="button" id="btnSplashEnterExplorer" class="no-wrap-btn px-3.5 py-1 rounded-lg text-xs font-bold btn-theme-accent border transition cursor-pointer">⚡ Enter Hex64 Architecture Explorer</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(modalBackdrop);

    let activeConceptIdx = 0;
    try {
      const savedIdx = parseInt(localStorage.getItem(STORAGE_KEY_ACTIVE_CONCEPT) || '0', 10);
      if (!isNaN(savedIdx) && savedIdx >= 0 && savedIdx < SPLASH_CONCEPTS.length) {
        activeConceptIdx = savedIdx;
      }
    } catch (_) {}

    const state = {
      activeBarIdx: 0,
      c2vMirrored: false,
      hankoStamped: true,
      astrolabeRot: 0,
      strata3dMode: true
    };

    const chkStartup = document.getElementById('chkShowSplashOnStartup');
    try {
      chkStartup.checked = localStorage.getItem(STORAGE_KEY_HIDE_SPLASH) !== '1';
    } catch (_) {}
    chkStartup.addEventListener('change', () => {
      try {
        if (chkStartup.checked) {
          localStorage.removeItem(STORAGE_KEY_HIDE_SPLASH);
        } else {
          localStorage.setItem(STORAGE_KEY_HIDE_SPLASH, '1');
        }
      } catch (_) {}
    });

    function renderThreePillars() {
      const grid = document.getElementById('splashThreePillarsGrid');
      if (!grid) return;
      grid.innerHTML = LORE_PILLARS.map((p) => {
        const itemsHtml = p.bullets
          .map(
            (b) =>
              '<li class="text-[11px] text-secondary-ink leading-snug flex items-start gap-1.5">' +
              '<span class="text-theme-accent font-bold shrink-0">▪</span>' +
              '<span>' + b + '</span>' +
              '</li>'
          )
          .join('');
        return (
          '<div class="surface-card border border-hairline rounded-xl p-3 flex flex-col gap-1.5">' +
          '<span class="mono text-[9.5px] font-bold text-theme-accent uppercase">' + p.badge + '</span>' +
          '<h3 class="text-xs font-extrabold text-primary-ink">' + p.title + '</h3>' +
          '<div class="mono text-[10px] font-semibold text-secondary-ink pb-1 border-b border-hairline">' + p.subtitle + '</div>' +
          '<ul class="flex flex-col gap-1">' + itemsHtml + '</ul>' +
          '</div>'
        );
      }).join('');
    }

    function renderSplashConcept() {
      const c = SPLASH_CONCEPTS[activeConceptIdx] || SPLASH_CONCEPTS[0];
      const stageCols = api && api.getActiveStageColors ? api.getActiveStageColors() : ['#0284c7', '#2563eb', '#7c3aed', '#d97706', '#059669', '#dc2626'];
      const isLight = (document.body.getAttribute('data-mode') || 'light') === 'light';

      document.getElementById('splashConceptCounter').textContent =
        'CONCEPT ' + c.num + ' / 12';
      document.getElementById('splashArchetypeBadge').textContent =
        '#' + c.num + ' · ' + c.archetype;
      document.getElementById('splashTagline').textContent = c.tagline;
      document.getElementById('splashConceptTitle').textContent = c.title;
      document.getElementById('splashHypeBlurb').textContent = c.hype;
      document.getElementById('splashMetaphorTitle').textContent = c.metaphorTitle;
      document.getElementById('splashMetaphorBody').textContent = c.metaphorBody;

      // Render 12-Concept Ribbon
      const ribbon = document.getElementById('splashConceptRibbon');
      ribbon.innerHTML = SPLASH_CONCEPTS.map((sc, idx) => {
        const isAct = idx === activeConceptIdx;
        return (
          '<button type="button" data-splash-concept="' +
          idx +
          '" class="no-wrap-btn px-1.5 py-1 rounded text-[10px] mono font-bold border transition cursor-pointer truncate ' +
          (isAct
            ? 'btn-theme-accent'
            : 'surface-root text-secondary-ink border-hairline hover:text-primary-ink hover:border-subtle') +
          '" title="' +
          sc.num +
          ' · ' +
          sc.title +
          '">' +
          sc.num +
          ' · ' +
          sc.short +
          '</button>'
        );
      }).join('');

      ribbon.querySelectorAll('[data-splash-concept]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeConceptIdx = parseInt(btn.getAttribute('data-splash-concept'), 10) || 0;
          try {
            localStorage.setItem(STORAGE_KEY_ACTIVE_CONCEPT, String(activeConceptIdx));
          } catch (_) {}
          renderSplashConcept();
        });
      });

      // Render Interactive SVG Centerpiece
      const artStage = document.getElementById('splashArtworkStage');
      artStage.innerHTML = renderConceptArtworkSvg(activeConceptIdx, state, stageCols, isLight);

      artStage.querySelectorAll('[data-iching-bar]').forEach((el) => {
        el.addEventListener('click', () => {
          state.activeBarIdx = parseInt(el.getAttribute('data-iching-bar'), 10) || 0;
          renderSplashConcept();
        });
        el.addEventListener('mouseenter', () => {
          state.activeBarIdx = parseInt(el.getAttribute('data-iching-bar'), 10) || 0;
          renderBarReadout(stageCols);
        });
      });

      // Concept-specific interactive controls + 6-bar quick pills
      const ctrlWrap = document.getElementById('splashConceptInteractiveControls');
      const barButtonsHtml = ICHING_BAR_SPECS.map((bs, bIdx) => {
        const isSel = bIdx === state.activeBarIdx;
        return (
          '<button type="button" data-select-bar="' +
          bIdx +
          '" class="no-wrap-btn px-1.5 py-0.5 rounded mono text-[9.5px] font-bold border cursor-pointer ' +
          (isSel ? 'btn-theme-accent' : 'surface-root text-secondary-ink border-hairline hover:text-primary-ink') +
          '">' +
          'L' +
          bs.lineNum +
          ' (S' +
          (bs.stageIdx + 1) +
          (bs.polarity === 'yang' ? ' ⚊' : ' ⚋') +
          ')</button>'
        );
      }).join('');

      let extraBtnHtml = '';
      if (activeConceptIdx === 1) {
        extraBtnHtml =
          '<button type="button" id="btnConceptActionC2v" class="no-wrap-btn px-2 py-0.5 rounded mono text-[9.5px] font-bold surface-elevated border border-subtle text-theme-accent cursor-pointer">⇄ Flip C2v Mirror Axis</button>';
      } else if (activeConceptIdx === 6) {
        extraBtnHtml =
          '<button type="button" id="btnConceptActionHanko" class="no-wrap-btn px-2 py-0.5 rounded mono text-[9.5px] font-bold surface-elevated border border-subtle text-theme-accent cursor-pointer">印 Toggle Kintsugi Stamp</button>';
      } else if (activeConceptIdx === 9) {
        extraBtnHtml =
          '<button type="button" id="btnConceptActionAstrolabe" class="no-wrap-btn px-2 py-0.5 rounded mono text-[9.5px] font-bold surface-elevated border border-subtle text-theme-accent cursor-pointer">↻ Rotate 180° Team C2v</button>';
      } else if (activeConceptIdx === 11) {
        extraBtnHtml =
          '<button type="button" id="btnConceptActionStrata" class="no-wrap-btn px-2 py-0.5 rounded mono text-[9.5px] font-bold surface-elevated border border-subtle text-theme-accent cursor-pointer">◰ Toggle 2D Seal ↔ 3D Strata</button>';
      }

      ctrlWrap.innerHTML =
        '<div class="flex flex-wrap items-center gap-1">' + barButtonsHtml + '</div>' + extraBtnHtml;

      ctrlWrap.querySelectorAll('[data-select-bar]').forEach((b) => {
        b.addEventListener('click', () => {
          state.activeBarIdx = parseInt(b.getAttribute('data-select-bar'), 10) || 0;
          renderSplashConcept();
        });
      });

      const btnC2v = document.getElementById('btnConceptActionC2v');
      if (btnC2v) {
        btnC2v.addEventListener('click', () => {
          state.c2vMirrored = !state.c2vMirrored;
          renderSplashConcept();
        });
      }
      const btnHanko = document.getElementById('btnConceptActionHanko');
      if (btnHanko) {
        btnHanko.addEventListener('click', () => {
          state.hankoStamped = !state.hankoStamped;
          renderSplashConcept();
        });
      }
      const btnAstro = document.getElementById('btnConceptActionAstrolabe');
      if (btnAstro) {
        btnAstro.addEventListener('click', () => {
          state.astrolabeRot = (state.astrolabeRot + 180) % 360;
          renderSplashConcept();
        });
      }
      const btnStrata = document.getElementById('btnConceptActionStrata');
      if (btnStrata) {
        btnStrata.addEventListener('click', () => {
          state.strata3dMode = !state.strata3dMode;
          renderSplashConcept();
        });
      }

      renderBarReadout(stageCols);
      renderThreePillars();
    }

    function renderBarReadout(stageCols) {
      const box = document.getElementById('splashBarReadout');
      if (!box) return;
      const spec = ICHING_BAR_SPECS[state.activeBarIdx] || ICHING_BAR_SPECS[0];
      const stCol = stageCols[spec.stageIdx] || '#0284c7';
      box.innerHTML =
        '<div class="flex flex-wrap items-center justify-between gap-1">' +
        '  <span class="mono text-[10px] font-bold" style="color:' + stCol + '">' + spec.stageCode + ' · ' + spec.glyph + '</span>' +
        '  <span class="mono text-[9.5px] font-bold text-secondary-ink">' + spec.trigram + '</span>' +
        '</div>' +
        '<div class="text-xs font-bold text-primary-ink">' + spec.title + '</div>' +
        '<div class="grid grid-cols-2 gap-1.5 pt-0.5">' +
        '  <div class="px-2 py-1 rounded surface-panel border border-hairline mono text-[9.5px] text-primary-ink truncate" title="' + spec.splitLeft + '">▪ ' + spec.splitLeft + '</div>' +
        '  <div class="px-2 py-1 rounded surface-panel border border-hairline mono text-[9.5px] text-primary-ink truncate" title="' + spec.splitRight + '">▪ ' + spec.splitRight + '</div>' +
        '</div>' +
        '<p class="text-[11px] text-secondary-ink leading-snug">' + spec.detail + '</p>';
    }

    function openSplashModal(conceptIdxOpt) {
      if (typeof conceptIdxOpt === 'number' && conceptIdxOpt >= 0 && conceptIdxOpt < SPLASH_CONCEPTS.length) {
        activeConceptIdx = conceptIdxOpt;
      }
      modalBackdrop.classList.remove('hidden');
      renderSplashConcept();
    }

    function closeSplashModal() {
      modalBackdrop.classList.add('hidden');
    }

    document.getElementById('btnSplashPrevConcept').addEventListener('click', () => {
      activeConceptIdx = (activeConceptIdx - 1 + SPLASH_CONCEPTS.length) % SPLASH_CONCEPTS.length;
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE_CONCEPT, String(activeConceptIdx));
      } catch (_) {}
      renderSplashConcept();
    });

    document.getElementById('btnSplashNextConcept').addEventListener('click', () => {
      activeConceptIdx = (activeConceptIdx + 1) % SPLASH_CONCEPTS.length;
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE_CONCEPT, String(activeConceptIdx));
      } catch (_) {}
      renderSplashConcept();
    });

    document.getElementById('btnSplashCloseTop').addEventListener('click', closeSplashModal);
    document.getElementById('btnSplashEnterExplorer').addEventListener('click', closeSplashModal);
    document.getElementById('btnSplashLaunchTour').addEventListener('click', () => {
      closeSplashModal();
      if (api && api.startGuidedTour) {
        api.startGuidedTour();
      }
    });

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeSplashModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (modalBackdrop.classList.contains('hidden')) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeSplashModal();
      } else if (e.shiftKey && e.key === 'ArrowRight') {
        e.preventDefault();
        activeConceptIdx = (activeConceptIdx + 1) % SPLASH_CONCEPTS.length;
        renderSplashConcept();
      } else if (e.shiftKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        activeConceptIdx = (activeConceptIdx - 1 + SPLASH_CONCEPTS.length) % SPLASH_CONCEPTS.length;
        renderSplashConcept();
      }
    });

    // Auto-show on first visit (unless user explicitly unchecked startup toggle)
    let hideOnStartup = false;
    try {
      hideOnStartup = localStorage.getItem(STORAGE_KEY_HIDE_SPLASH) === '1';
    } catch (_) {}

    if (!hideOnStartup || window.location.hash.includes('splash=')) {
      openSplashModal();
    }

    return {
      openSplashModal,
      closeSplashModal,
      refreshTheme: () => {
        if (!modalBackdrop.classList.contains('hidden')) {
          renderSplashConcept();
        }
      }
    };
  }

  window.ArashikageSplashCodex = {
    initSplashCodex,
    SPLASH_CONCEPTS
  };
})();
