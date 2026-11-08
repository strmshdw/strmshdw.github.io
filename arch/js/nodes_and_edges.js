// ============================================================================
// ARASHIKAGE (HEX63) — 17 ARCHITECTURAL BLOCKS & 24 TENSOR EDGES (1120 x 680)
// ============================================================================
window.ARASHIKAGE_NODES = [
  // --- COLUMN 0: STAGE 1 — C++20 OBSERVATION MANIFOLD (x = 96) ---
  {
    id: 'dma_slice', num: '01', col: 0, x: 96, y: 125, w: 162, h: 92,
    title: '5,376B Arena Slice', sub: '84×64B Cache Lines · C2v', tag: 'Layout A DMA',
    color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
    techIds: ['t0', 't9'],
    role: 'Stage 1 · C++20 Host-to-GPU Zero-Copy DMA Boundary (15 Hz / 0.25 ms CPU)',
    tensor: 'Hex63EntityNodeArenaSlice [B, 5376B] (84 × 64B cache lines)',
    formula: 'M_C2v = diag(-1, -1, +1) ∈ SO(3), det(M_C2v) = +1',
    how: 'Packs all 64 arena entities, bitmasks, and training context into a 64-byte-aligned 5,376B C++20 struct (84 CPU cache lines). When playing on Orange (team == 1), applies a 180° Z-rotation M_C2v = diag(-1, -1, +1) to arena coordinates while keeping car-local vectors untouched.',
    why: 'Eliminates Python dictionary marshalling overhead, guarantees single-DMA host-to-GPU transfers for 4,096 parallel arenas, and ensures the neural network only has to learn one canonical offensive direction (+Y).',
    contrib: 'Reduces observation construction to 0.25 ms across 4,096 arenas on CPU and guarantees bit-exact parity between training (BatchArenaEngine) and live play (RocketSimShadowTwin).'
  },
  {
    id: 'dyn_nodes', num: '02', col: 0, x: 96, y: 265, w: 162, h: 92,
    title: '16 Dynamic Queries', sub: '6 Cars · Ball · 8 Traj · Match', tag: 'Slots 0..15',
    color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
    techIds: ['t0', 't1'],
    role: 'Stage 1 · Active Moving Entity Query Set (Slots 0..15 · 2,752 Bytes)',
    tensor: 'Q_dyn ∈ R^[B, 16, 384] (from 2,752B slots 0..15)',
    formula: 'tau_k ∈ {4, 8, 12, 16, 24, 32, 40, 48} ticks @ 120Hz',
    how: 'Projects the 16 rapidly moving entities into 384D query tokens: 6 Cars (64 floats each: kinematics, airborne timers, dodge/flip locks, wheel shocks), 1 Ball (32 floats), 8 BallRingBuffer480 trajectory nodes (4.0s spin/curve/post-bounce preview), and 1 Match Context node (κ_Δt, score, clock).',
    why: 'Separates the 16 dynamic moving entities that need to query the pitch from the 48 static/semi-static environment features.',
    contrib: 'Gives the policy immediate access to 4.0 seconds of ball bounce geometry and exact car resource timers without expending network capacity on Newtonian curve integration.'
  },
  {
    id: 'env_nodes', num: '03', col: 0, x: 96, y: 405, w: 162, h: 92,
    title: '48 Context Keys', sub: '34 Pads · 6 Goals · 4 Wheels', tag: 'Slots 16..63',
    color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
    techIds: ['t0', 't1'],
    role: 'Stage 1 · Arena Geometry, Pad & Wheel Contact Context Set (Slots 16..63 · 1,984 Bytes)',
    tensor: 'K_env ∈ R^[B, 48, 384] (from 1,984B slots 16..63)',
    formula: 'wheel_contact_count = Σ_{w=0}^3 m_contact,w ∈ [0, 4]',
    how: 'Encodes 34 Boost Pads (respawn timers & spatial availability), 6 Goal Posts/Crossbars, 4 Ego Wheel Raycasts (suspension travel, surface normal, zero-lag flip-reset detector), and 4 Nearest Arena Surface OBBs.',
    why: 'Explicit wheel raycast and wall surface tokens expose exact curved corner geometry and immediate 4-wheel ball contact for flip resets.',
    contrib: 'Enables reliable flip-reset detection on the ball in 1 physics tick (zero packet lag) and spatial orientation along curved corner walls.'
  },
  {
    id: 'priv_ctx', num: '04', col: 0, x: 96, y: 545, w: 162, h: 92,
    title: 'Privileged Context', sub: '512B Offset 4864 · Sim Only', tag: '128 Floats',
    color: '#34d399', modes: ['all', 'train', 'distill'], stageGroup: 'mem',
    techIds: ['t0', 't8'],
    role: 'Stage 1 · Asymmetric Training Critic Context (Bytes 4864..5375 · Actor-Masked)',
    tensor: 'c_priv ∈ R^[B, 128] (Bytes 4864..5375, actor-masked)',
    formula: 'm_priv = 1 (Training Critic) | 0 (Actor & Live Runtime)',
    how: 'Occupies bytes 4864..5375 of Layout A. Stores ground-truth internal physics states of all opponents (exact boost decimals, hidden dodge timers, exact airborne frames) and hidden drill curriculum parameters.',
    why: 'In live play, opponent internal states are partially hidden. Providing exact ground truth exclusively to the training critic stabilizes value estimation without leaking illegal information to the actor.',
    contrib: 'Reduces value variance during multi-agent PPO updates while keeping the deployed live policy 100% compliant with tournament rules.'
  },

  // --- COLUMN 1: STAGE 2 — RELATIONAL BIPARTITE GRAPH (x = 282) ---
  {
    id: 'gpu_edges', num: '05', col: 1, x: 282, y: 205, w: 162, h: 96,
    title: 'Fused Pairwise Bias', sub: '16×64 × 72D · 0.09ms GPU', tag: 'Relational Bias',
    color: '#22d3ee', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'edges',
    techIds: ['t1', 't2'],
    role: 'Stage 2 · On-Chip GPU Relational Kinematics & Fourier Bias Kernel (0.09 ms)',
    tensor: 'E_pair ∈ R^[B, 16, 64, 72] -> B_rel ∈ R^[B, 6, 16, 64]',
    formula: 't_go = clamp(d_ij / max(||v_rel||, 100), 0, 5) s',
    how: 'A fused GPU kernel computes 72 pairwise physics features between the 16 dynamic queries and all 64 arena entities directly in VRAM: 32 multi-scale Fourier distance bands, relative closing speed, time-to-closest-approach, 3D bearing cosines, and time-to-reach.',
    why: 'Pre-computing 1,024×72 floats on CPU would add 189 KB per arena (775 MB/step). Fusing it on GPU in 0.09 ms keeps PCIe transfers at 5,376B and provides exact geometric biases to attention.',
    contrib: 'Gives attention heads direct physical intercept margins ("who reaches the ball first and by how many milliseconds") in Layer 1.'
  },
  {
    id: 'bipartite_enc', num: '06', col: 1, x: 282, y: 365, w: 162, h: 96,
    title: 'Bipartite DiffAttn', sub: '2-Layer 16×64 · SwiGLU', tag: '1,024 Pairs',
    color: '#22d3ee', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'edges',
    techIds: ['t1', 't2'],
    role: 'Stage 2 · 2-Layer Asymmetric Bipartite Differential Attention Encoder (0.36 ms)',
    tensor: 'H_0 ∈ R^[B, 16, 384] (6 heads × d_h = 64)',
    formula: 'DiffAttn = (softmax(S_1 + B_1) - λ·softmax(S_2 + B_2)) V',
    how: 'Two-layer Bipartite Entity Graph Encoder where only the 16 dynamic tokens act as queries attending over all 64 tokens. Each head computes two softmax maps and subtracts the second scaled by learnable λ to cancel background attention noise.',
    why: 'Cuts attention matrix size by 4× (1,024 vs 4,096 pairs) while Differential Attention suppresses irrelevant boost pads and distant cars.',
    contrib: 'Produces sharp, permutation-equivariant entity representations across 1v1, 2v2, and 3v3 with zero dead-slot noise.'
  },

  // --- COLUMN 2: STAGE 3 — FP32 TITANS CONTINUAL MEMORY (x = 468) ---
  {
    id: 'titans_prior', num: '07', col: 2, x: 468, y: 205, w: 162, h: 96,
    title: 'Titans Meta-Prior', sub: 'Orthogonal W_init · k_prev', tag: 'Kickoff Reset',
    color: '#a78bfa', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
    techIds: ['t3'],
    role: 'Stage 3 · Orthogonal Fast-Weight Meta-Prior & Causal Key State Cache',
    tensor: 'W_init ∈ R^[2, 4, 32, 32], k_prev ∈ R^[B, 2, 4, 32]',
    formula: 'W_0 = W_init, M_0 = 0 (Match Start), W_t persists across goals',
    how: 'Initializes the 2×4×32×32 fast-weight matrices from a learned orthogonal meta-prior at match start and caches the normalized query key k_prev across consecutive 15 Hz steps. Goal resets clear momentum M_t but preserve adapted fast weights W_t.',
    why: 'Allows the agent to start every match with a well-conditioned baseline opponent model and retain learned opponent habits across goals within the same match.',
    contrib: 'Prevents cold-start memory drift on kickoffs and preserves opponent playstyle adaptations throughout a 5-minute game.'
  },
  {
    id: 'titans_mem', num: '08', col: 2, x: 468, y: 365, w: 162, h: 96,
    title: 'FP32 Titans Memory', sub: '2×4×32×32 Fast Weights', tag: '||W||_F <= 4.0',
    color: '#a78bfa', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
    techIds: ['t3'],
    role: 'Stage 3 · Test-Time Surprise-Driven Fast-Weight Memory Module (0.12 ms)',
    tensor: 'W_t, M_t ∈ R^[B, 2, 4, 32, 32] (strict torch.float32)',
    formula: 'g_t = tanh(W_prev^T k_prev - v_t) ⊗ k_prev, ||W||_F <= 4.0',
    how: 'At every step during inference, compares what the fast weights W_prev predicted on the previous step against the current observation v_t. Updates W_t in-place using a smooth Log-Cosh surprise gradient with momentum M_t and retracts each head onto a Frobenius ball of radius 4.0.',
    why: 'Fixed network weights cannot adapt mid-match to an opponent who fakes challenges or steals boost. Updating a 32×32 matrix per head in FP32 gives test-time learning in 0.12 ms.',
    contrib: 'Enables rapid in-match adaptation to opponent aggression, boost-starve habits, and demo tendencies without representation drift.'
  },

  // --- COLUMN 3: STAGE 4 — COCONUT RECURRENCE, SOFT-MOE & FSQ (x = 654) ---
  {
    id: 'coconut_loop', num: '09', col: 3, x: 654, y: 150, w: 162, h: 92,
    title: 'Coconut Latent Loop', sub: 'K ∈ {4, 6} Passes · 3D Focus', tag: 'Shared Weights',
    color: '#f472b6', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
    techIds: ['t4', 't2'],
    role: 'Stage 4 · Weight-Tied Continuous Latent Reasoning Trunk (K = 4..6 Passes)',
    tensor: 'H^(k) ∈ R^[B, 16, 384], p_lat^(k) ∈ R^[B, 3]',
    formula: 'H^(k) = Block_shared(H^(k-1) + e_pass(k)), k = 1..K_t',
    how: 'Loops the 16×384 latent state through weight-tied Bipartite DiffAttn + Soft-MoE blocks for K_t = 4 or 6 recurrent passes before emitting an action. At each pass k, an auxiliary head predicts a 3D spatial focus anchor p_lat^(k) along the upcoming trajectory.',
    why: 'Instead of stacking 16 separate layers (quadrupling VRAM), looping shared weights lets compute scale dynamically with tactical complexity and 5.5 ms latency tiers.',
    contrib: 'Provides multi-step lookahead for wall double-taps and shadow defense while keeping active parameters compact enough for L2 cache.'
  },
  {
    id: 'soft_moe', num: '10', col: 3, x: 654, y: 295, w: 162, h: 92,
    title: 'Static 8×2 Soft-MoE', sub: '1 Shared + 8 Spec · Einsum', tag: 'CUDAGraph Safe',
    color: '#f472b6', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
    techIds: ['t5'],
    role: 'Stage 4 · Static-Shape Differentiable Specialist Expert Router (16 Slots)',
    tensor: 'Phi_disp ∈ R^[B, 16, 8, 2], Y_moe ∈ R^[B, 16, 384]',
    formula: 'S_n,e,s = (X_n · W_r) / τ + b_e^bal (Loss-Free Bias)',
    how: 'Combines 1 always-active Shared Expert (d_ff=512) with 8 Specialist Experts (d_ff=192, P=2 slots each = 16 slots). Tokens are blended into expert slots and back via static-shape einsum matrices, balanced by a loss-free bias b_e^bal updated outside gradient descent.',
    why: 'Standard Top-K MoE requires dynamic token sorting and variable-size buffers that break PyTorch CUDAGraphs. Soft-MoE is 100% static-shape.',
    contrib: 'Partitions mechanics cleanly across specialists (ground dribble, aerial, flip reset, defense) without reward interference or CUDAGraph breaks.'
  },
  {
    id: 'fsq_bottleneck', num: '11', col: 3, x: 654, y: 440, w: 162, h: 92,
    title: '8×125 FSQ Bottleneck', sub: '1,000 Discrete Skill Codes', tag: 'Zero Codebook Loss',
    color: '#f472b6', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
    techIds: ['t6'],
    role: 'Stage 4 · Discrete Tactical & Mechanical Skill Bottleneck (8 × 5^3 = 1,000 Codes)',
    tensor: 'z_q ∈ {-2,-1,0,1,2}^24 (8 groups × 5^3 = 1,000 codes)',
    formula: 'z_q = z_b + stop_grad(round(2·tanh(z_b)) - z_b)',
    how: 'Projects the ego token into 24 scalars grouped into 8 cyclic 3D triplets, bounding each coordinate into 5 integer levels {-2,-1,0,1,2} via Straight-Through Estimator (STE) rounding (8 × 125 = 1,000 discrete skill codes).',
    why: 'Eliminates VQ-VAE codebook collapse and commitment losses while compressing tactical intent into a clean discrete code for the action decoder and telemetry UI.',
    contrib: 'Gives the action head an unambiguous tactical conditioning signal and lets operators inspect exact active skill modes in real time.'
  },

  // --- COLUMN 4: STAGE 5 — 60HZ SUBTICK FLOW-GRPO DECODER (x = 840) ---
  {
    id: 'stage1_bin', num: '12', col: 4, x: 840, y: 150, w: 162, h: 92,
    title: 'Stage-1 Binary Head', sub: '16-Way Jump/Dodge · Boost', tag: 'Exact Log-Prob',
    color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
    techIds: ['t7'],
    role: 'Stage 5A · Causal 4-Subtick Discrete Button & Double-Jump Guard Head',
    tensor: 'u_bin ∈ {0,1}^[B, 4, 3], m_dj ∈ {0,1}^[B, 4]',
    formula: 'log π(u_bin) = log P(seq_J) + Σ_k [log P(B_k) + log P(H_k)]',
    how: 'Evaluates a 16-way categorical head over all causal 4-subtick Jump/Double-Jump patterns (J_1..J_4) alongside subtick Bernoulli heads for Boost and Handbrake. Computes exact double-jump edge flags m_dj,k indicating which 60 Hz subtick triggers a dodge or stall.',
    why: 'Sampling binaries before continuous axes lets the continuous flow head condition directly on whether a jump or dodge impulse occurs on subtick k.',
    contrib: 'Prevents mismatched actions (e.g., pitching for a speedflip on a subtick where jump failed to fire) and yields exact discrete log-probabilities.'
  },
  {
    id: 'stage2_flow', num: '13', col: 4, x: 840, y: 295, w: 162, h: 92,
    title: 'Stage-2 Flow-GRPO', sub: '4-Step SDE in R^20 · Clamp', tag: '0.12·tanh Stall',
    color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
    techIds: ['t7'],
    role: 'Stage 5B · 4-Step Conditional Flow-GRPO Continuous Motor Decoder (60 Hz)',
    tensor: 'x_1 ∈ R^[B, 20] -> u_cont ∈ [-1, 1]^[B, 4, 5]',
    formula: 'dx = v_θ(x_τ, τ, c_act) dτ + σ_τ dW_τ (4 Euler steps)',
    how: 'Integrates a 2-layer Residual MLP velocity field v_θ over 4 Euler steps (Δτ = 0.25) in R^20 (4 subticks × 5 axes), conditioned on the sampled binary sequence u_bin. On double-jump subticks (m_dj,k=1), applies a smooth 0.12·tanh deadzone clamp for vertical stalls.',
    why: 'Unimodal Gaussian policies average symmetric left/right aerial adjustments into zero (flying straight into the goalpost). Flow matching preserves sharp multimodal trajectories.',
    contrib: 'Executes frame-accurate 60 Hz speedflip cancels, half-flips, and vertical flip-reset stalls with exact step-wise Gaussian transitions for PPO/GRPO.'
  },
  {
    id: 'subtick_exec', num: '14', col: 4, x: 840, y: 440, w: 162, h: 92,
    title: '60Hz Subtick Executor', sub: 'K_sub=4 (2 Ticks) · 192B Acc', tag: 'Zero Hijack',
    color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
    techIds: ['t7', 't9'],
    role: 'Stage 5C · C++20 60 Hz Subtick Physics Executor & Event Accumulator',
    tensor: 'SubtickActionChunk[4] -> 192B SubtickEventAccumulator',
    formula: '8 physics ticks (15Hz) = 4 subticks × 2 ticks (60Hz)',
    how: 'Applies the 4-subtick action chunk across 8 RocketSim physics ticks (2 ticks = 16.67 ms per subtick) with zero C++ FlipState overrides. Records exact ball-touch impulses, subtick touch masks, and demo events into the 192B SubtickEventAccumulator.',
    why: 'Standard 15 Hz action repeat locks controls for 66.7 ms, making 33 ms speedflip pitch cancels physically impossible without hardcoded C++ macros.',
    contrib: 'Gives the neural policy native 60 Hz mechanical resolution while running the heavy backbone only at 15–30 Hz.'
  },

  // --- COLUMN 5: STAGE 6 — CRITIC, JEPA SEARCH & RL/TEACHER (x = 1024) ---
  {
    id: 'critic_heads', num: '15', col: 5, x: 1024, y: 150, w: 162, h: 92,
    title: 'Dual 4×51 HL-Gauss', sub: 'p_priv & p_eval · 4 Horizons', tag: 'Symlog [-10,10]',
    color: '#34d399', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
    techIds: ['t8'],
    role: 'Stage 6 · Dual-Head 4-Horizon Distributional Value Critic (204 Symlog Bins)',
    tensor: 'Logits ∈ R^[B, 4, 51] (204 bins × 2 heads: p_priv, p_eval)',
    formula: 'γ_dense ∈ {0.95, 0.98, 0.995}, γ_sparse = 0.9995',
    how: 'Outputs 51 categorical histogram bins spaced uniformly in symlog space z ∈ [-10, +10] across 4 discount horizons (1s micro, 2.5s tactical, 10s possession, and full-match win probability). Evaluates both a Privileged Critic p_priv (for GAE) and an Observation-Only Critic p_eval (for live search).',
    why: 'Classification with Gaussian label smoothing (σ_HL = 0.30) prevents value gradient spikes when sparse goals combine with high-frequency touch rewards.',
    contrib: 'Provides calibrated multi-horizon value distributions for both training advantage estimation and live Best-of-M candidate ranking.'
  },
  {
    id: 'jepa_search', num: '16', col: 5, x: 1024, y: 295, w: 162, h: 92,
    title: 'JEPA & CVaR Search', sub: 'Best-of-16 Rollout · 5.5ms', tag: 'Test-Time Compute',
    color: '#34d399', modes: ['all', 'live', 'train'], stageGroup: 'control',
    techIds: ['t9', 't8'],
    role: 'Stage 6 · Dual-Stream JEPA World Model & Best-of-16 CVaR Tactical Search',
    tensor: 'M ∈ {16, 8, 1} candidates -> argmax J_CVaR(u^(m))',
    formula: 'J(u^(m)) = w_eval^T v_eval + λ_cvar · CVaR_α(v_sparse)',
    how: 'In live play at Tier 0/1, fans out the ego latent state into M = 16 or 8 candidate action chunks from the Stage-1/Stage-2 decoder, rolls them forward 1 step in the Dual-Stream JEPA latent predictor, and selects the trajectory maximizing risk-adjusted value under p_eval.',
    why: 'Single-sample policy decoding can occasionally pick a high-variance 50/50 challenge when last-man back. Latent search filters out downside tail risks in 0.8 ms.',
    contrib: 'Delivers test-time tactical verification on high-leverage saves and goal-line challenges within the 5.5 ms hard real-time budget.'
  },
  {
    id: 'ppo_grpo_opt', num: '17', col: 5, x: 1024, y: 440, w: 162, h: 92,
    title: 'G=8 GRPO & Flow-PPO', sub: '816 Drill + 2,880 Match', tag: '0 ULP Clone',
    color: '#34d399', modes: ['all', 'train', 'distill'], stageGroup: 'control',
    techIds: ['t7', 't8'],
    role: 'Stage 6 · Lockstep G=8 Cloned GRPO Mechanics & Multi-Horizon Flow-PPO Learner',
    tensor: '4,096 Arenas: 816 GRPO (G=8) + 2,880 PPO + 400 Boss',
    formula: 'A_i^GRPO = (R_i - μ_G) / (σ_G + 1e-5) across G=8 clones',
    how: 'Partitions 4,096 RocketSim arenas into 816 G=8 lockstep-cloned GRPO mechanics drills (critic-free intra-group normalized returns), 2,880 full-match PFSP self-play arenas (4-horizon GAE + Flow-PPO), and 400 Boss evaluation arenas, warm-started from the frozen Teacher policy.',
    why: 'Fine-grained aerial mechanics learn fastest via critic-free G=8 cohort comparisons from identical physics seeds, while team positioning requires full-match self-play.',
    contrib: 'Unifies subtick mechanical precision (flip resets, double taps) and full-match tactical positioning in a single end-to-end training loop.'
  }
];

window.ARASHIKAGE_EDGES = [
  // Col 0 -> Col 1
  { from: 'dma_slice', to: 'dyn_nodes', label: '2,752B', modes: ['all','live','train','distill'] },
  { from: 'dma_slice', to: 'env_nodes', label: '1,984B', modes: ['all','live','train','distill'] },
  { from: 'dma_slice', to: 'priv_ctx', label: '512B @4864', modes: ['all','train','distill'], dashed: true },
  { from: 'dyn_nodes', to: 'gpu_edges', label: '16 Queries', modes: ['all','live','train','distill'] },
  { from: 'env_nodes', to: 'gpu_edges', label: '48 Keys', modes: ['all','live','train','distill'] },
  { from: 'dyn_nodes', to: 'bipartite_enc', label: 'Q [16,384]', modes: ['all','live','train','distill'] },
  { from: 'env_nodes', to: 'bipartite_enc', label: 'K,V [64,384]', modes: ['all','live','train','distill'] },
  { from: 'gpu_edges', to: 'bipartite_enc', label: 'Bias [6,16,64]', modes: ['all','live','train','distill'] },
  // Col 1 -> Col 2
  { from: 'bipartite_enc', to: 'titans_mem', label: 'H_0 [16,384]', modes: ['all','live','train','distill'] },
  { from: 'titans_prior', to: 'titans_mem', label: 'W_init, k_prev', modes: ['all','live','train','distill'] },
  // Col 2 -> Col 3
  { from: 'titans_mem', to: 'coconut_loop', label: 'Mem Context', modes: ['all','live','train','distill'] },
  { from: 'coconut_loop', to: 'soft_moe', label: 'Pass k=1..K', modes: ['all','live','train','distill'] },
  { from: 'soft_moe', to: 'coconut_loop', label: 'Recurrent H^(k)', modes: ['all','live','train','distill'], dashed: true },
  { from: 'soft_moe', to: 'fsq_bottleneck', label: 'h_ego [384]', modes: ['all','live','train','distill'] },
  // Col 3 -> Col 4
  { from: 'fsq_bottleneck', to: 'stage1_bin', label: 'e_skill [128]', modes: ['all','live','train','distill'] },
  { from: 'coconut_loop', to: 'stage1_bin', label: 'c_base [512]', modes: ['all','live','train','distill'] },
  { from: 'stage1_bin', to: 'stage2_flow', label: 'u_bin + m_dj', modes: ['all','live','train','distill'] },
  { from: 'stage2_flow', to: 'subtick_exec', label: 'u_chunk [4,8]', modes: ['all','live','train','distill'] },
  // Col 3/4 -> Col 5
  { from: 'priv_ctx', to: 'critic_heads', label: 'c_priv [128]', modes: ['all','train','distill'], dashed: true },
  { from: 'coconut_loop', to: 'critic_heads', label: 'h_ego + Pool', modes: ['all','live','train','distill'] },
  { from: 'stage2_flow', to: 'jepa_search', label: 'M=16 Chunks', modes: ['all','live','train'] },
  { from: 'critic_heads', to: 'jepa_search', label: 'p_eval CVaR', modes: ['all','live','train'] },
  { from: 'critic_heads', to: 'ppo_grpo_opt', label: 'p_priv GAE', modes: ['all','train','distill'], dashed: true },
  { from: 'subtick_exec', to: 'ppo_grpo_opt', label: '192B Events', modes: ['all','train','distill'], dashed: true }
];
