// ============================================================================
// LEGACY GEN 2: FACTORIZED-684 EGOCENTRIC MLP & PSM-DCP REPLAY SKILL MINING
// ============================================================================
window.ARASHIKAGE_GEN2_FACTORIZED = {
  id: 'gen2_factorized',
  shortBadge: 'LEGACY GEN 2 // FACTORIZED-684',
  dropdownLabel: 'Gen 2: Factorized-684 (MLP · PSM)',
  identityTitle: '684D Egocentric MLP, PSM-DCP Skills & 752D Critic',
  colHeaders: [
    { col: 0, x: 96,  title: 'STAGE 1 // 171D EGOCENTRIC', sub: 'R_car^T Frame · 34 Pads',   color: '#38bdf8' },
    { col: 1, x: 282, title: 'STAGE 2 // K=4 STACK (684D)', sub: '4-Step Deque · 0..2J Lag', color: '#22d3ee' },
    { col: 2, x: 468, title: 'STAGE 3 // DENSE MLP TRUNK', sub: '684->512->512->256 SiLU',   color: '#a78bfa' },
    { col: 3, x: 654, title: 'STAGE 4 // PSM-DCP & Z_t',   sub: 'SeqScout Miner · 32 Skills', color: '#f472b6' },
    { col: 4, x: 840, title: 'STAGE 5 // 31-LOGIT HEADS',  sub: '7 Heads · Padded [B,7,7]',   color: '#fbbf24' },
    { col: 5, x: 1024, title: 'STAGE 6 // 752D CRITIC',    sub: '5 Bounces · Zero-Sum PBRS', color: '#34d399' }
  ],
  nodes: [
    // --- COLUMN 0: STAGE 1 — 171D EGOCENTRIC BODY-FRAME BUILDER (x = 96) ---
    {
      id: 'dma_slice', num: '01', col: 0, x: 96, y: 125, w: 162, h: 92,
      title: 'Egocentric Frame R_b', sub: 'R_car^T World->Body Basis', tag: 'Yaw/Pitch Inv',
      color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t0'],
      role: 'Stage 1 · Egocentric Car Body-Frame Coordinate Basis Transformation',
      tensor: 'R_car = [f, r, u] ∈ SO(3), v_body = R_car^T (v_world - v_car)',
      formula: 'g_local = R_car^T [0, 0, -1]^T ∈ R^3 (Body-Local Gravity Vector)',
      how: 'Constructs the orthonormal 3×3 rotation matrix R_car from the ego car\'s forward, right, and up unit vectors and projects all relative positions, linear velocities, angular velocities, and gravity into the car\'s instantaneous local frame.',
      why: 'Replaced Gen 1\'s world-frame relational tokens after discovering that MLPs learn steering and aerial pitch adjustments 4× faster when inputs are already aligned with the car nose.',
      contrib: 'Made every observation inherently invariant to arena translation and heading angle.'
    },
    {
      id: 'dyn_nodes', num: '02', col: 0, x: 96, y: 265, w: 162, h: 92,
      title: '35D Core Kinematics', sub: '10 Self · 9 Ball · 10 Opp · 6 Goal', tag: 'Indices 0..34',
      color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t0'],
      role: 'Stage 1 · Single-Frame 35D Dynamic Combat & Goal Vector',
      tensor: 'x_dyn ∈ R^[B, 35] (Self[10] + Ball[9] + Opp[10] + Goals[6])',
      formula: 'pos_norm = Δp / 6000, vel_norm = Δv / 2300, ω_norm = ω / 5.5',
      how: 'Packs 10D Self (body vel, body ang_vel, local gravity vector, boost), 9D Ball (rel pos, rel vel, rel ang_vel), 10D Opponent (rel pos, rel vel, rel forward vector, boost), and 6D unit direction vectors to the Opponent and Own goal centers.',
      why: 'Compressed all essential 1v1 combat geometry into 35 tightly normalized scalars in [-1, 1].',
      contrib: 'Provided clean, unit-scaled kinematic inputs for the dense MLP layers.'
    },
    {
      id: 'env_nodes', num: '03', col: 0, x: 96, y: 405, w: 162, h: 92,
      title: '136D Static Pad Block', sub: '34 Pads × 4D (XYZ + Timer)', tag: 'Indices 35..170',
      color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t0', 't1'],
      role: 'Stage 1 · 34-Pad Egocentric Coordinate & Cooldown Block (136 Floats)',
      tensor: 'x_pads ∈ R^[B, 136] (34 pads × [rel_x, rel_y, rel_z, τ_avail])',
      formula: 'pad_order = ORANGE_PAD_PERMUTATION[0..33] when team == 1',
      how: 'Transforms all 34 canonical boost pad locations into the ego car\'s body frame and pairs each with its normalized availability fraction τ_avail ∈ [0, 1], permuting pad indices for Orange so pad slots remain symmetric.',
      why: 'Allowed the MLP to see every boost pad\'s body-relative direction, though repeating 136 floats across 4 history frames consumed 544 of the 684 inputs (later solved by Gen 3\'s PointNet and Hex64\'s Bipartite Graph).',
      contrib: 'Gave the policy full pitch boost awareness without requiring an entity transformer.'
    },
    {
      id: 'priv_ctx', num: '04', col: 0, x: 96, y: 545, w: 162, h: 92,
      title: '68D Omniscient State', sub: '20D Wheels · 18D Vel · 30D Bounce', tag: '752D Critic Only',
      color: '#34d399', modes: ['all', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t8'],
      role: 'Stage 1 · Asymmetric 68D Privileged Physics Context (Training Critic Only)',
      tensor: 'c_priv ∈ R^[B, 68] -> x_critic = Concat(x_684, c_priv) ∈ R^[B, 752]',
      formula: 'p_bounce(Δt_k) via e_wall = 0.60, g = -650 uu/s^2, k ∈ {1..5}',
      how: 'Appends 20D exact 4-wheel suspension compression, contact normals, and lateral slip ratios, 18D true world velocities, and 30D 5-horizon analytical ball bounce trajectories (Δt ∈ {0.1, 0.25, 0.5, 1.0, 1.5}s) exclusively for the 752D PrivilegedCritic.',
      why: 'Bridged the observability gap during training so the critic could accurately value aerial wall setups before the ball bounced.',
      contrib: 'Cut value function bootstrap error on backboard and corner reads.'
    },

    // --- COLUMN 1: STAGE 2 — K=4 TEMPORAL STACK & LATENCY RANDOMIZER (x = 282) ---
    {
      id: 'gpu_edges', num: '05', col: 1, x: 282, y: 205, w: 162, h: 96,
      title: 'K=4 Sliding Window', sub: '4 × 171D = 684D Flat Stack', tag: '267ms Window',
      color: '#22d3ee', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'edges',
      techIds: ['t1'],
      role: 'Stage 2A · 4-Step Temporal Observation Ring Buffer (684 Floats)',
      tensor: 'X_684 = Concat(s_t, s_{t-1}, s_{t-2}, s_{t-3}) ∈ R^[B, 684]',
      formula: 'T_window = 4 steps × 8 ticks/step = 32 ticks (266.7 ms @ 120Hz)',
      how: 'Maintains a 4-frame FIFO history buffer per arena (and in live CanonicalAgent), concatenating the current 171D frame with the previous 3 frames into a contiguous 684D vector. On episode reset, tiles the initial frame 4 times.',
      why: 'Without recurrent memory or attention, stacking 4 frames allowed the first linear layer to compute finite-difference ball curve (Magnus effect) and opponent acceleration.',
      contrib: 'Delivered Markovian state observability for short-horizon aerial and ground mechanics.'
    },
    {
      id: 'bipartite_enc', num: '06', col: 1, x: 282, y: 365, w: 162, h: 96,
      title: 'Latency Randomizer', sub: '0..2 Tick Packet Jitter Sim', tag: 'Sim-to-Live',
      color: '#22d3ee', modes: ['all', 'train'], stageGroup: 'edges',
      techIds: ['t1', 't9'],
      role: 'Stage 2B · Training-Time Socket & Frame Delay Domain Randomizer',
      tensor: 's_obs(t) <- s_true(t - δ_lag), δ_lag ~ Uniform({0, 1, 2} ticks)',
      formula: 'Δt_jitter ∈ {0.0 ms, 8.33 ms, 16.67 ms}',
      how: 'During training rollouts, randomly delays observations by 0, 1, or 2 physics ticks via LatencyDomainRandomizer to mimic RLBot socket IPC jitter and frame-delivery variance.',
      why: 'Policies trained on zero-lag simulator states often oscillate or miss tight challenges when deployed over live TCP/shared-memory sockets. (Hex64 later solved this deterministically via the 1-tick Rust RocketSimShadowTwin).',
      contrib: 'Hardened the Gen 2 MLP against live match packet jitter.'
    },

    // --- COLUMN 2: STAGE 3 — 4-LAYER LAYER-NORM SILU MLP TRUNK (x = 468) ---
    {
      id: 'titans_prior', num: '07', col: 2, x: 468, y: 205, w: 162, h: 96,
      title: '684->512->512 MLP', sub: 'LayerNorm + SiLU · Ortho Init', tag: ' √2 Gain',
      color: '#a78bfa', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t2'],
      role: 'Stage 3A · Wide Orthogonal-Initialized LayerNorm-SiLU Feature Extractor',
      tensor: 'h_1 = SiLU(LN(W_1 x_684)), h_2 = SiLU(LN(W_2 h_1)) ∈ R^[B, 512]',
      formula: 'W_i ~ Orthogonal(gain = √2), b_i = 0',
      how: 'Processes the 684D temporal stack through two 512-unit dense layers with LayerNorm and SiLU (Swish) activations, initialized with orthogonal matrices (gain √2).',
      why: 'Replaced Gen 1\'s 4-layer Relational Transformer after empirical ablations showed a wide 684D->512->512 MLP achieved 5× higher SPS under CUDAGraphs while learning crisp ground/aerial control.',
      contrib: 'Maximized training throughput (steps per second) on a single RTX 3090 GPU.'
    },
    {
      id: 'titans_mem', num: '08', col: 2, x: 468, y: 365, w: 162, h: 96,
      title: '512->256 Policy Neck', sub: 'Shared 256D Latent Bottleneck', tag: 'Actor Trunk',
      color: '#a78bfa', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t2', 't3'],
      role: 'Stage 3B · 256D Policy Latent Bottleneck (h_trunk)',
      tensor: 'h_trunk = SiLU(LN(W_3 h_2)) ∈ R^[B, 256]',
      formula: 'dim(h_trunk) = 256 (feeds 7 Action Heads + Aux Skill Head)',
      how: 'Compresses the 512D hidden state into a 256D policy representation h_trunk that simultaneously drives the fused 31-logit action projection and the training-only CompositionalSkillAuxiliaryHead.',
      why: 'Created a compact 256D bottleneck that fit entirely in L1/L2 cache during batched CUDA Graph execution.',
      contrib: 'Served as the universal teacher representation later distilled into Gen 3.'
    },

    // --- COLUMN 3: STAGE 4 — REPLAY SKILL MINER & AUXILIARY SUPERVISION (x = 654) ---
    {
      id: 'coconut_loop', num: '09', col: 3, x: 654, y: 150, w: 162, h: 92,
      title: 'SeqScout Replay Miner', sub: 'WRAcc MCTS · 30–60Hz Parser', tag: 'SkillshotMiner',
      color: '#f472b6', modes: ['all', 'train'], stageGroup: 'titans',
      techIds: ['t4', 't6'],
      role: 'Stage 4A · Offline Pro Replay Parser & SeqScout Pattern Discovery Engine',
      tensor: '.replay Corpus -> 27D Initiation States + Z_t Skill Labels',
      formula: 'WRAcc(s) = (n(s)/N) · (p_goal(s) - p_goal(root))',
      how: 'Parses high-MMR Rocket League replays at 30–60 Hz, discretizes player/ball interactions into symbolic events, and runs SeqScout Beam/MCTS with Weighted Relative Accuracy (WRAcc) + Jaccard diversity to mine high-scoring mechanical sequences.',
      why: 'Discovering flip resets, ceiling shots, and zap-dashes purely by random trial-and-error from kickoff takes billions of steps; mining pro replays extracted exact mechanical blueprints.',
      contrib: 'Populated both the 27D SkillshotInitiationBank for arena resets and the 32-class skill taxonomy.'
    },
    {
      id: 'soft_moe', num: '10', col: 3, x: 654, y: 295, w: 162, h: 92,
      title: 'Dual Flip-Reset Detector', sub: 'Explicit Flag + 5-Gate Physics', tag: '18..62 uu Ball',
      color: '#f472b6', modes: ['all', 'train'], stageGroup: 'titans',
      techIds: ['t4'],
      role: 'Stage 4B · Dual-Mode Heuristic & Telemetry Flip-Reset Classifier',
      tensor: 'm_reset = Flag_explicit ∨ (Airborne ∧ d_ball∈[18,62] ∧ BellyAlign)',
      formula: 'dot(-u_car, (p_ball - p_car)/d) > 0.45 ∧ Δω_surge -> FlipReset',
      how: 'Detects flip resets in replay telemetry via a dual-mode detector: checking explicit DodgeRefreshed telemetry flags when present, or falling back to a 5-gate physics heuristic (airborne z>110, car-ball center distance 18..62 uu, undercarriage normal dot>0.45, and post-contact angular velocity surge).',
      why: 'Standard replay parsers frequently drop transient 1-tick wheel-contact flags during mid-air ball touches.',
      contrib: 'Recovered thousands of authentic PopReset, MaktufReset, and StallReset trajectories from pro replays.'
    },
    {
      id: 'fsq_bottleneck', num: '11', col: 3, x: 654, y: 440, w: 162, h: 92,
      title: 'Skill Aux Head (Z_t)', sub: '8 Macro · 32 Sub · 13D Phase', tag: 'Training Only',
      color: '#f472b6', modes: ['all', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t3', 't4'],
      role: 'Stage 4C · Compositional Skill Auxiliary Head (8 Families × 32 Sub-Skills)',
      tensor: 'h_trunk[256] -> 128D -> (Logits_8, Logits_32, Phase_13D)',
      formula: 'Gain = 0.01 Orthogonal Init; omitted from TorchScript live export',
      how: 'Attaches a lightweight 256->128 MLP head to h_trunk during training to predict the active Macro Skill Family (8), Canonical Sub-Variant (32), and 13D continuous phase vector, stripped out completely at TorchScript export.',
      why: 'Guided the 256D MLP bottleneck to organize states by mechanical affordance without adding a single FLOP to live match inference.',
      contrib: 'Accelerated acquisition of aerial dribbles, flicks, and double-taps in the 684D MLP.'
    },

    // --- COLUMN 4: STAGE 5 — FUSED 31-LOGIT FACTORIZED HEADS & SUBTICK FSM (x = 840) ---
    {
      id: 'stage1_bin', num: '12', col: 4, x: 840, y: 150, w: 162, h: 92,
      title: 'Fused 31-Logit Head', sub: '256->31 Single GEMM · Zero Cat', tag: 'Custom Autograd',
      color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t5'],
      role: 'Stage 5A · Custom Autograd Fused 7-Head Linear Projection (31 Logits)',
      tensor: 'W_cat ∈ R^[31, 256] -> Logits_flat ∈ R^[B, 31] (Zero torch.cat)',
      formula: 'Heads = (Throttle:3, Steer:7, Pitch:5, Yaw:5, Roll:3, Jump:4, Boost:4)',
      how: 'Concatenates the 7 orthogonal-initialized (gain=0.01) action head weight matrices into a single [31, 256] buffer at load time and executes one fused GEMM via a custom autograd projection.',
      why: 'Launching 7 separate small linear kernels and calling torch.cat created significant CUDA launch overhead inside the 1,024-env rollout loop.',
      contrib: 'Evaluated all 31 discrete action logits across 7 factorized heads in a single matrix multiply.'
    },
    {
      id: 'stage2_flow', num: '13', col: 4, x: 840, y: 295, w: 162, h: 92,
      title: 'Padded [B,7,7] Sampler', sub: 'Physics Mask -10^8 · Gumbel', tag: '25,200 Combos',
      color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t5', 't7'],
      role: 'Stage 5B · Vectorized Padded [B, 7, 7] Log-Softmax & Physics Logit Masker',
      tensor: 'Logits_pad ∈ R^[B, 7, 7] + Mask_31 (-10^8) -> Actions ∈ Z^[B, 7]',
      formula: 'Π_{i=1}^7 dims = 3 × 7 × 5 × 5 × 3 × 4 × 4 = 25,200 combinations',
      how: 'Applies RocketSim boolean physics masks (-10^8 on illegal bins), pads the ragged 31 logits into a uniform [B, 7, 7] tensor using pre-computed scatter indices, and computes log_softmax, entropy, and categorical sampling across all 7 heads in one vectorized kernel.',
      why: 'Standard PyTorch Split + 7× Categorical() objects allocate dozens of temporary tensors and Python loops per step.',
      contrib: 'Made 7-head categorical sampling and PPO log-prob evaluation 100% static-shape and CUDAGraph-compatible.'
    },
    {
      id: 'subtick_exec', num: '14', col: 4, x: 840, y: 440, w: 162, h: 92,
      title: '8-Subtick FlipState', sub: '15Hz Repeat · Jump Edge Macro', tag: '120Hz Physics',
      color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t7'],
      role: 'Stage 5C · 8-Subtick (15 Hz) Control Mapping & C++ FlipState Edge Generator',
      tensor: 'Actions[7] -> 8 × CarControls @ 120 Hz (Bins: Steer[-1..1], etc.)',
      formula: 'Dodge(a_jump=3): sub=0 jump=0 -> sub=1..4 jump=1 -> sub=5..7 jump=0',
      how: 'Maps the 7 categorical bin indices to continuous car controls (e.g., 7-bin Steer: [-1, -0.66, -0.33, 0, 0.33, 0.66, 1]) held for 8 physics ticks, using the C++/Python FlipState machine to synthesize rising jump edges for dodges.',
      why: 'Replaced Gen 1\'s hand-tuned 120 Hz Attitude PD controller with direct neural control over Pitch/Yaw/Roll bins, though still limited to 15 Hz outer decisions.',
      contrib: 'Eliminated PD controller trajectory fighting during flip-reset stalls and air dribbles.'
    },

    // --- COLUMN 5: STAGE 6 — 752D PRIVILEGED CRITIC, PBRS & LEAGUE (x = 1024) ---
    {
      id: 'critic_heads', num: '15', col: 5, x: 1024, y: 150, w: 162, h: 92,
      title: '752D Privileged Critic', sub: '752->512->512->256 · 3 PopArt', tag: 'Asymmetric MLP',
      color: '#34d399', modes: ['all', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t8'],
      role: 'Stage 6A · Asymmetric 752D Privileged MLP Critic & 3-Horizon PopArt Heads',
      tensor: 'x_priv[752] -> MLP(512,512,256) -> 3 PopArt Heads (γ=0.95,0.98,0.995)',
      formula: 'V_raw = σ_h · V_norm + μ_h, w_New = (σ_old / σ_new) w_old',
      how: 'Feeds the 752D omniscient observation (684D ego stack + 68D wheel slip/true velocities/5-horizon ball bounces) through a 4-layer LayerNorm-SiLU MLP into 3 PopArt-normalized value heads (short γ=0.95, medium γ=0.98, long γ=0.995).',
      why: 'Decoupled actor observability (684D legal features) from critic observability (752D omniscient physics) to reduce GAE variance.',
      contrib: 'Provided stable multi-horizon value baselines across both dense touch shaping and sparse goal outcomes.'
    },
    {
      id: 'jepa_search', num: '16', col: 5, x: 1024, y: 295, w: 162, h: 92,
      title: 'Coupled Zero-Sum PBRS', sub: 'r_i\' = r_i - κ(r_i+r_opp)/2', tag: 'ProgressEngine',
      color: '#34d399', modes: ['all', 'train'], stageGroup: 'control',
      techIds: ['t6', 't9'],
      role: 'Stage 6B · Coupled Zero-Sum 1v1 Potential-Based Reward Shaping Engine',
      tensor: 'Φ(s) = w_b Φ_ball + w_c Φ_car + w_a Φ_air, ΔΦ_t = γ Φ(s\') - Φ(s)',
      formula: 'r_i^(coupled) = r_i - κ · 0.5 · (r_i + r_opp), κ ∈ [0, 1]',
      how: 'Computes bounded potential functions Φ(s) (ball-to-goal exponential potential, car-to-ball closing, aerial height/air-roll, and flip-reset contact bonuses) and applies zero-sum opponent coupling so any positional gain by the opponent penalizes the ego agent.',
      why: 'Guaranteed by Ng et al. (1999) that dense potential shaping ΔΦ_t = γΦ(s\') - Φ(s) with Φ(s_terminal)=0 never alters the optimal Nash policy.',
      contrib: 'Accelerated offensive strike velocity while punishing over-commits that leave the net open.'
    },
    {
      id: 'ppo_grpo_opt', num: '17', col: 5, x: 1024, y: 440, w: 162, h: 92,
      title: '5-Way Curriculum & PFSP', sub: 'Initiation Bank · Tri-Role League', tag: 'TrueSkill Match',
      color: '#34d399', modes: ['all', 'train'], stageGroup: 'control',
      techIds: ['t6', 't9'],
      role: 'Stage 6C · 5-Way Stratified Curriculum, Skillshot Bank & Tri-Role PFSP League',
      tensor: '30% Pro | 25% HardNeg | 20% Perturb | 15% Kickoff | 10% SkillBank',
      formula: 'P_match(i) ∝ p_win^p (1 - p_win)^q · (1 + β_u σ_i^2 / σ_0^2)',
      how: 'Samples arena initial states across 5 stratified curriculum branches (including 27D replay-mined aerial/flip-reset entry states) and matches agents via Prioritized Fictitious Self-Play (PFSP) weighted by Bayesian TrueSkill uncertainty σ_i^2.',
      why: 'Prevented forgetting of foundational kickoff/ground play while forcing high-density practice on hard-negative ring-buffer states and aerial initiation states.',
      contrib: 'Established the curriculum and league foundation that Hex64 scaled to 4,096 arenas (816 G=8 GRPO + 2,880 League + 400 Boss).'
    }
  ],
  edges: [
    // Col 0 -> Col 1
    { from: 'dma_slice', to: 'dyn_nodes', label: '35D Dynamic', modes: ['all','live','train','distill'] },
    { from: 'dma_slice', to: 'env_nodes', label: '136D Pads', modes: ['all','live','train','distill'] },
    { from: 'dma_slice', to: 'priv_ctx', label: '68D Omni', modes: ['all','train','distill'], dashed: true },
    { from: 'dyn_nodes', to: 'gpu_edges', label: 's_t [0..34]', modes: ['all','live','train','distill'] },
    { from: 'env_nodes', to: 'gpu_edges', label: 's_t [35..170]', modes: ['all','live','train','distill'] },
    { from: 'gpu_edges', to: 'bipartite_enc', label: 'Deque K=4', modes: ['all','train'], dashed: true },
    // Col 1 -> Col 2
    { from: 'gpu_edges', to: 'titans_prior', label: 'x_684 [B,684]', modes: ['all','live','train','distill'] },
    { from: 'bipartite_enc', to: 'titans_prior', label: '0..2 Tick Lag', modes: ['all','train'], dashed: true },
    { from: 'titans_prior', to: 'titans_mem', label: 'h_2 [B,512]', modes: ['all','live','train','distill'] },
    // Col 2 -> Col 3
    { from: 'coconut_loop', to: 'soft_moe', label: '30–60Hz Frames', modes: ['all','train'], dashed: true },
    { from: 'soft_moe', to: 'fsq_bottleneck', label: 'Mined Z_t Labels', modes: ['all','train'], dashed: true },
    { from: 'titans_mem', to: 'fsq_bottleneck', label: 'h_trunk [256D]', modes: ['all','train','distill'], dashed: true },
    // Col 2/3 -> Col 4
    { from: 'titans_mem', to: 'stage1_bin', label: 'h_trunk [256D]', modes: ['all','live','train','distill'] },
    { from: 'stage1_bin', to: 'stage2_flow', label: '31 Raw Logits', modes: ['all','live','train','distill'] },
    { from: 'stage2_flow', to: 'subtick_exec', label: '7 Cat Actions', modes: ['all','live','train','distill'] },
    // Col 4 -> Col 5
    { from: 'priv_ctx', to: 'critic_heads', label: 'Concat 752D', modes: ['all','train','distill'], dashed: true },
    { from: 'gpu_edges', to: 'critic_heads', label: 'x_684 Base', modes: ['all','train','distill'], dashed: true },
    { from: 'critic_heads', to: 'ppo_grpo_opt', label: '3-Horizon GAE', modes: ['all','train'] },
    { from: 'subtick_exec', to: 'jepa_search', label: 'Step State s\'', modes: ['all','train'], dashed: true },
    { from: 'jepa_search', to: 'ppo_grpo_opt', label: 'Zero-Sum r_t', modes: ['all','train'] },
    { from: 'coconut_loop', to: 'ppo_grpo_opt', label: '27D SkillBank', modes: ['all','train'], dashed: true },
    { from: 'fsq_bottleneck', to: 'ppo_grpo_opt', label: 'L_skill Aux', modes: ['all','train'], dashed: true }
  ],
  scenarios: {
    tour: {
      label: 'GEN 2 END-TO-END 66.7ms TOUR',
      steps: [
        {
          title: '171D Egocentric Car Body-Frame Projection (R_car^T)',
          focusNode: 'dma_slice', highlight: ['dma_slice', 'dyn_nodes', 'env_nodes'], techId: 't0',
          desc: 'At 15 Hz, world coordinates rotate into the ego car\'s instantaneous body frame R_car^T: packing 35D core combat kinematics (Self, Ball, Opp, Goal vectors) and 136D boost pad coordinates/timers.'
        },
        {
          title: 'K=4 Sliding Window (684D) & Latency Randomization',
          focusNode: 'gpu_edges', highlight: ['gpu_edges', 'bipartite_enc'], techId: 't1',
          desc: 'Four consecutive 171D frames [t, t-1, t-2, t-3] are stacked into a 684D flat vector (covering 267 ms of motion), injected with 0..2 ticks of random latency jitter during training.'
        },
        {
          title: 'Orthogonal 684->512->512->256 LayerNorm-SiLU MLP',
          focusNode: 'titans_prior', highlight: ['titans_prior', 'titans_mem'], techId: 't2',
          desc: 'A 4-layer dense MLP with LayerNorm and SiLU activations maps the 684D history stack into a compact 256D policy latent representation h_trunk at high CUDA Graph throughput.'
        },
        {
          title: 'Offline SeqScout Replay Miner & Compositional Skill Z_t',
          focusNode: 'coconut_loop', highlight: ['coconut_loop', 'soft_moe', 'fsq_bottleneck'], techId: 't4',
          desc: 'During training, h_trunk predicts 8 Macro Skill Families and 32 Sub-Skills (PopReset, StallReset, MustyFlick, ZapDash) mined from pro replays via SeqScout WRAcc MCTS and the Dual-Mode Flip Reset Detector.'
        },
        {
          title: 'Fused 31-Logit Projection & Padded [B,7,7] Masked Sampler',
          focusNode: 'stage1_bin', highlight: ['stage1_bin', 'stage2_flow'], techId: 't5',
          desc: 'The fused 31-logit projection maps h_trunk into 7 categorical heads in one GEMM, applies RocketSim boolean physics masks (-10^8), and samples actions from a padded [B,7,7] tensor.'
        },
        {
          title: '8-Subtick Action Repeat & C++ FlipState Edge Macro',
          focusNode: 'subtick_exec', highlight: ['stage2_flow', 'subtick_exec'], techId: 't7',
          desc: 'The 7 chosen categorical bin indices are held for 8 physics ticks (120 Hz), with the C++ FlipState machine forcing subtick 0 to jump=0 when a dodge edge is requested.'
        },
        {
          title: '752D Privileged Critic, Zero-Sum PBRS & 5-Way Curriculum',
          focusNode: 'critic_heads', highlight: ['priv_ctx', 'critic_heads', 'jepa_search', 'ppo_grpo_opt'], techId: 't8',
          desc: 'An asymmetric 752D MLP critic (with 5-horizon ball bounce lookahead) outputs 3 PopArt values trained under Coupled Zero-Sum PBRS and the 5-way Stratified Curriculum.'
        }
      ]
    },
    bounce: {
      label: 'SCENARIO 1: ASYMMETRIC 5-BOUNCE CRITIC',
      steps: [
        {
          title: 'Actor Infers Spin & Curve from 4-Frame 684D Stack',
          focusNode: 'gpu_edges', highlight: ['dyn_nodes', 'gpu_edges', 'titans_prior'], techId: 't1',
          desc: 'The 684D actor observes ball position, linear velocity, and angular velocity across [t, t-1, t-2, t-3] in body coordinates to estimate the wall bounce.'
        },
        {
          title: '752D Privileged Critic Computes 5 Analytical Bounces',
          focusNode: 'priv_ctx', highlight: ['priv_ctx', 'critic_heads'], techId: 't8',
          desc: 'For the training critic, C++/Python integrates a 5-horizon ballistic bounce trajectory (Δt ∈ {0.1, 0.25, 0.5, 1.0, 1.5}s) with wall/floor restitution e = 0.60.'
        },
        {
          title: 'Coupled Zero-Sum PBRS Rewards Early Pre-Jump',
          focusNode: 'jepa_search', highlight: ['critic_heads', 'jepa_search'], techId: 't6',
          desc: 'Because the 752D critic immediately sees the post-bounce ball location in front of the opponent net, its PopArt value surges as soon as the agent jumps for the backboard.'
        },
        {
          title: 'Limitation that Led to Gen 3 & Hex64',
          focusNode: 'titans_prior', highlight: ['env_nodes', 'titans_prior'], techId: 't2',
          desc: 'Feeding 544 static pad floats alongside 140 dynamic floats into a dense 684->512 layer diluted spatial attention — motivating Gen 3\'s PointNet+Perceiver and Hex64\'s 5,376B Bipartite Graph.'
        }
      ]
    },
    aerial: {
      label: 'SCENARIO 2: MINED FLIP-RESET INITIATION',
      steps: [
        {
          title: 'Dual-Mode Detector Extracts Pro Flip-Reset Replays',
          focusNode: 'soft_moe', highlight: ['coconut_loop', 'soft_moe'], techId: 't4',
          desc: 'SkillshotMiner scans pro replays for airborne car-ball undercarriage touches (distance 18..62 uu, belly dot > 0.45) followed by an angular velocity surge.'
        },
        {
          title: 'Seeding Arena from 27D SkillshotInitiationBank (10% Branch)',
          focusNode: 'ppo_grpo_opt', highlight: ['coconut_loop', 'ppo_grpo_opt'], techId: 't6',
          desc: 'In the 5-way Stratified Curriculum, 10% of episodes initialize cars and ball directly into mined mid-air setup states 0.5s before the flip reset.'
        },
        {
          title: 'Auxiliary Z_t Head Guides Trunk to Sub-Skill #18 (StallReset)',
          focusNode: 'fsq_bottleneck', highlight: ['titans_mem', 'fsq_bottleneck'], techId: 't3',
          desc: 'CompositionalSkillAuxiliaryHead supervises h_trunk to classify Macro Family 5 (Flip Reset) and Sub-Variant StallReset.'
        },
        {
          title: 'Factorized 31-Logit Head Fires Dodge Flick',
          focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow', 'subtick_exec'], techId: 't5',
          desc: 'Once the 4 wheels touch the ball and RocketSim unmasks has_flip, the Jump head (bin 3) and Pitch head (bin 0) fire the follow-up flick.'
        }
      ]
    },
    fake: {
      label: 'SCENARIO 3: HARD-NEGATIVE RING BUFFER',
      steps: [
        {
          title: 'Detecting High-TD-Error Defensive Breakdowns',
          focusNode: 'critic_heads', highlight: ['critic_heads', 'ppo_grpo_opt'], techId: 't8',
          desc: 'Whenever an opponent fake-challenge leads to a goal against the agent, the large negative TD error flags the preceding state in the Failure Ring Buffer.'
        },
        {
          title: '25% Hard-Negative Curriculum Replay',
          focusNode: 'ppo_grpo_opt', highlight: ['ppo_grpo_opt', 'dma_slice'], techId: 't6',
          desc: 'StratifiedCurriculum allocates 25% of arena resets to re-running recent failure states with Gaussian kinematic perturbations (20% branch).'
        },
        {
          title: 'Zero-Sum Coupling Penalizes Over-Commit',
          focusNode: 'jepa_search', highlight: ['jepa_search', 'ppo_grpo_opt'], techId: 't6',
          desc: 'Coupled Zero-Sum PBRS subtracts κ·(r_i + r_opp)/2 so diving past the ball immediately yields negative shaped reward as the opponent gains open-net potential.'
        },
        {
          title: 'Why Gen 3 Added Autoregressive Action Conditioning',
          focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow'], techId: 't5',
          desc: 'In Gen 2, independent sampling of Jump[4] and Pitch[5] occasionally caused accidental backflips during shadow defense — solved in Gen 3 by conditioning Stage-2 axes on Stage-1 Jump/Boost.'
        }
      ]
    },
    save: {
      label: 'SCENARIO 4: LIVE CANONICAL AGENT (120HZ)',
      steps: [
        {
          title: 'Live GameTickPacket -> 171D Egocentric Transform',
          focusNode: 'dma_slice', highlight: ['dma_slice', 'dyn_nodes', 'env_nodes'], techId: 't0',
          desc: 'In live RLBot matches, CanonicalAgent converts the GameTickPacket into the 171D body-frame observation and pushes it into the K=4 deque.'
        },
        {
          title: 'TorchScript / CUDAGraph Forward Pass (< 0.4 ms)',
          focusNode: 'titans_mem', highlight: ['gpu_edges', 'titans_prior', 'titans_mem', 'stage1_bin'], techId: 't2',
          desc: 'The 4-layer MLP and fused 31-logit linear head evaluate all action logits in under 0.4 ms.'
        },
        {
          title: 'Physics Boolean Masking Prevents Dead-Air Flips',
          focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow'], techId: 't7',
          desc: 'The boolean physics mask generator disables illegal Dodge and Boost bins before argmax or temperature selection.'
        },
        {
          title: '8-Subtick FlipState Holds Save Control Across 66.7ms',
          focusNode: 'subtick_exec', highlight: ['stage2_flow', 'subtick_exec'], techId: 't7',
          desc: 'The live bridge steps the FlipState machine at 120 Hz across the 8 physics ticks until the next outer policy decision.'
        }
      ]
    }
  },
  techLibrary: [
    {
      id: 't0', short: '171D Egocentric Frame',
      title: '171D Egocentric Body-Frame Coordinate Transformation (R_car^T)',
      usedIn: ['dma_slice', 'dyn_nodes', 'env_nodes'],
      placement: 'Stage 1 Observation Builder — transforms world physics into ego-car local coordinates.',
      how: 'Projects relative positions, linear/angular velocities, gravity, goal vectors (35D), and 34 boost pads (136D) into the ego car\'s orthonormal basis R_car^T = [forward, right, up]^T, applying ORANGE_PAD_PERMUTATION when team == 1.',
      why: 'World-frame coordinates require the network to learn redundant rotational symmetries across 3D car orientations; body-frame coordinates align inputs directly with car-local actuators.',
      contrib: 'Accelerated early-stage steering, aerial aiming, and shadow defense convergence.',
      science: 'Given car rotation R_car ∈ SO(3), mapping Δp_b = R_car^T(p_target - p_car) ensures equivariance under global SE(3) car rigid-body transformations.',
      origins: 'Gen 2 Egocentric Observation Manifold Specification.'
    },
    {
      id: 't1', short: 'K=4 History & Jitter',
      title: '4-Step Temporal Stack (684D) & 0..2 Tick Latency Domain Randomization',
      usedIn: ['env_nodes', 'gpu_edges', 'bipartite_enc'],
      placement: 'Stage 2 Temporal Buffer — sits between single-frame 171D extraction and the MLP.',
      how: 'Concatenates [s_t, s_{t-1}, s_{t-2}, s_{t-3}] into a 684D flat vector (267 ms window) and randomly delays observations by δ ∈ {0, 1, 2} ticks during training via LatencyDomainRandomizer.',
      why: 'Single-frame observations cannot distinguish a ball curving via Magnus spin from a straight shot, nor can they survive live socket jitter without delay randomization.',
      contrib: 'Gave the feedforward MLP short-term velocity derivative awareness and sim-to-live socket resilience.',
      science: 'Frame stacking (Mnih et al., 2015) approximates a k-th order Markov state s_t^(k) for partially observable second-order dynamical systems.',
      origins: 'DQN Frame Stacking (Mnih et al., Nature 2015) + Sim-to-Real Latency Randomization (Tan et al., RSS 2018).'
    },
    {
      id: 't2', short: '684->512->512->256 MLP',
      title: 'Orthogonal LayerNorm-SiLU Dense MLP Backbone (820K Params)',
      usedIn: ['titans_prior', 'titans_mem'],
      placement: 'Stage 3 Policy Trunk — maps 684D history to 256D policy latent.',
      how: 'Three hidden layers (684 -> 512 -> 512 -> 256) with LayerNorm, SiLU activations, and √2-gain orthogonal weight initialization.',
      why: 'Delivered maximum possible CUDA Graph steps-per-second (SPS) on a single GPU with zero attention or recurrent state overhead.',
      contrib: 'Served as the primary production policy and later the distillation teacher for Gen 3.',
      science: 'Orthogonal initialization (Saxe et al., 2014) preserves dynamical isometry (singular values σ_i = 1) across deep nonlinear layers at initialization.',
      origins: 'Saxe et al. (ICLR 2014) & Ramachandran et al. (Swish/SiLU, 2017).'
    },
    {
      id: 't3', short: 'Compositional Skill Z_t',
      title: 'Training-Only Compositional Skill Auxiliary Head (8 Macro · 32 Sub-Skills)',
      usedIn: ['titans_mem', 'fsq_bottleneck'],
      placement: 'Stage 4C Auxiliary Branch — attached to the 256D trunk during training.',
      how: 'Projects h_trunk (256->128) to predict 8 Macro Skill Families, 32 Canonical Sub-Variants, and a 13D continuous phase vector mined from pro replays.',
      why: 'Forced the dense MLP bottleneck to dedicate latent directions to advanced aerial and dash mechanics rather than collapsing to simple ground ball-chasing.',
      contrib: 'Stabilized multi-skill representation learning with zero inference overhead.',
      science: 'Auxiliary multi-task supervision constrains the nullspace of the shared trunk Jacobian ∂h_trunk/∂x.',
      origins: 'Jaderberg et al. (UNREAL, ICLR 2017).'
    },
    {
      id: 't4', short: 'SeqScout Replay Miner',
      title: 'SeqScout WRAcc MCTS Replay Miner & Dual-Mode Flip-Reset Detector',
      usedIn: ['coconut_loop', 'soft_moe', 'fsq_bottleneck'],
      placement: 'Stage 4A/B Offline Replay Pipeline — mines .replay files at 30–60 Hz.',
      how: 'Uses Weighted Relative Accuracy (WRAcc) + Jaccard diversity in Monte Carlo Tree Search over symbolic replay streams, paired with a 5-gate physics heuristic + telemetry flag detector for flip resets.',
      why: 'Random exploration in 1v1 self-play has near-zero probability of discovering a Maktuf reset or Breezi flick without replay-mined initiation states and skill labels.',
      contrib: 'Extracted thousands of verified pro mechanical trajectories and 27D arena initiation seeds.',
      science: 'Subgroup Discovery via WRAcc(S) = P(S)·(P(Goal|S) - P(Goal)) identifies statistically significant tactical action sequences.',
      origins: 'SeqScout Subgroup Discovery (Herrera et al., 2009) & WRAcc MCTS Replay Mining.'
    },
    {
      id: 't5', short: 'Fused 31-Logit Sampler',
      title: 'Fused 31-Logit Linear Projection & Vectorized Padded [B, 7, 7] Categorical Sampler',
      usedIn: ['stage1_bin', 'stage2_flow'],
      placement: 'Stage 5 Action Projection — converts 256D trunk into 7 discrete control bins.',
      how: 'Packs all 7 head weight matrices (3+7+5+5+3+4+4 = 31 rows) into a single [31, 256] GEMM via custom autograd, scatters into a padded [B, 7, 7] tensor, and evaluates masked log-softmax in one kernel.',
      why: 'Eliminated 7× separate linear layers, torch.cat allocations, and Python loop overhead during 1,024-arena rollouts.',
      contrib: 'Enabled 25,200 factorized action combinations with sub-0.1ms GPU overhead.',
      science: 'Factorized categorical policies represent a 7D control hypercube using 31 logits instead of 25,200 joint atomic logits.',
      origins: 'OpenAI Five / RLGym Factorized Action Spaces with CUDA-Graph-safe fused autograd.'
    },
    {
      id: 't6', short: 'Zero-Sum PBRS & Bank',
      title: 'Coupled Zero-Sum 1v1 PBRS & 5-Way Stratified Skillshot Curriculum',
      usedIn: ['coconut_loop', 'jepa_search', 'ppo_grpo_opt'],
      placement: 'Stage 6 Reward & Reset Engine — governs arena seeding and step rewards.',
      how: 'Combines potential-based reward shaping ΔΦ = γΦ(s\') - Φ(s) with zero-sum opponent coupling r_i\' = r_i - κ(r_i+r_opp)/2 and seeds arenas across 5 stratified distributions (30% Pro, 25% Hard-Neg, 20% Perturb, 15% Kickoff, 10% SkillBank).',
      why: 'Standard uncoupled rewards encourage mutual ball-touch farming, while kickoff-only resets starve aerial mechanics of training samples.',
      contrib: 'Aligned dense shaping with zero-sum 1v1 win probability and high-frequency aerial drill practice.',
      science: 'Policy Invariance under Reward Shaping (Ng, Harada, & Russell, ICML 1999).',
      origins: 'Ng et al. (1999) + Prioritized Level Replay (Jiang et al., ICML 2021).'
    },
    {
      id: 't7', short: 'Physics Masks & Flip FSM',
      title: 'RocketSim Boolean Logit Masking & 8-Subtick C++ FlipState Machine',
      usedIn: ['stage2_flow', 'subtick_exec'],
      placement: 'Stage 5 Control Executor — bridges 15 Hz categorical bins to 120 Hz physics.',
      how: 'Masks impossible action bins with -10^8 before softmax and runs an 8-subtick state machine (sub=0 jump=0, sub=1..4 jump=1) to synthesize rising jump edges for dodges.',
      why: 'Directly retired Gen 1\'s 120 Hz Attitude PD controller (which fought the policy during flip resets) while working around the 15 Hz outer step rate.',
      contrib: 'Gave the neural network direct categorical authority over Pitch/Yaw/Roll and reliable dodge edges.',
      science: 'Boolean action masking restricts policy support supp(π(·|s)) to the feasible physical control set A_valid(s).',
      origins: 'Huang & Ontañón (2020); later superseded in Hex64 by native K_sub=4 (60 Hz) subtick action chunks.'
    },
    {
      id: 't8', short: '752D Privileged Critic',
      title: 'Asymmetric 752D Privileged MLP Critic with 5-Horizon Ballistics & PopArt',
      usedIn: ['priv_ctx', 'critic_heads'],
      placement: 'Stage 6A Training Value Network — omniscient 752D critic.',
      how: 'Appends 68 privileged floats (20D wheel suspension/normals/slip, 18D true world velocities, 30D 5-horizon analytical ball bounces) to the 684D stack and predicts 3 PopArt value heads (γ ∈ {0.95, 0.98, 0.995}).',
      why: 'Allowed the critic to see exact wheel slip and 1.5s of future ball bounces without leaking illegal simulator internals to the deployed 684D actor.',
      contrib: 'Stabilized multi-horizon GAE advantage estimates during complex wall and aerial plays.',
      science: 'Asymmetric Actor-Critic (Pinto et al., 2017) + PopArt target normalization (van Hasselt et al., 2016).',
      origins: 'Pinto et al. (RSS 2018) & van Hasselt et al. (PopArt, 2016).'
    },
    {
      id: 't9', short: 'Tri-Role PFSP League',
      title: 'Tri-Role Bayesian TrueSkill & Prioritized Fictitious Self-Play League',
      usedIn: ['bipartite_enc', 'jepa_search', 'ppo_grpo_opt'],
      placement: 'Stage 6C Matchmaking Coordinator — governs multi-agent self-play opponents.',
      how: 'Maintains a historical checkpoint pool partitioned into Main Agents (65%), Main Exploiters (20%), and League Exploiters (15%), weighting match probabilities by win-rate targeting g(p_win) and TrueSkill variance σ_i^2.',
      why: 'Naive self-play against only the latest checkpoint cycles between rock-paper-scissors strategies and forgets how to defend older playstyles.',
      contrib: 'Guaranteed monotonic skill progression and exploit resistance.',
      science: 'AlphaStar League Training (Vinyals et al., 2019) + TrueSkill Bayesian rating (Herbrich et al., NeurIPS 2006).',
      origins: 'Vinyals et al. (Nature 2019) & Herbrich et al. (2006).'
    }
  ],
  externalResources: {
    t0: [
      { badge: 'NATURE 2015', title: 'Human-level control through deep reinforcement learning', authors: 'V. Mnih et al. (DeepMind)', url: 'https://www.nature.com/articles/nature14236', desc: 'Establishes k-frame temporal stacking for Markovian velocity/acceleration inference.' }
    ],
    t1: [
      { badge: 'RSS 2018', title: 'Sim-to-Real: Learning Agile Locomotion For Quadruped Robots', authors: 'J. Tan et al.', url: 'https://arxiv.org/abs/1804.10332', desc: 'Introduces latency domain randomization to bridge simulator-to-live communication lag.' }
    ],
    t2: [
      { badge: 'ICLR 2014', title: 'Exact solutions to the nonlinear dynamics of learning in deep linear neural networks', authors: 'A. M. Saxe, J. L. McClelland, S. Ganguli', url: 'https://arxiv.org/abs/1312.6120', desc: 'Mathematical foundation for orthogonal weight initialization in deep RL networks.' }
    ],
    t3: [
      { badge: 'ICLR 2017', title: 'Reinforcement Learning with Unsupervised Auxiliary Tasks (UNREAL)', authors: 'M. Jaderberg et al.', url: 'https://arxiv.org/abs/1611.05397', desc: 'Auxiliary representation supervision on shared RL policy trunks.' }
    ],
    t4: [
      { badge: 'JMLR 2009', title: 'Subgroup Discovery: Concepts and Applications (WRAcc)', authors: 'F. Herrera et al.', url: 'https://www.jmlr.org/papers/v10/novak09a.html', desc: 'Weighted Relative Accuracy metric used in SeqScout replay pattern mining.' }
    ],
    t5: [
      { badge: 'ARXIV 2019', title: 'Dota 2 with Large Scale Deep Reinforcement Learning (OpenAI Five)', authors: 'C. Berner et al. (OpenAI)', url: 'https://arxiv.org/abs/1912.06680', desc: 'Factorized multi-head discrete action spaces for high-frequency game control.' }
    ],
    t6: [
      { badge: 'ICML 1999', title: 'Policy Invariance Under Reward Transformations: Theory and Application to Reward Shaping', authors: 'A. Y. Ng, D. Harada, S. Russell', url: 'https://people.eecs.berkeley.edu/~pabbeel/cs287-fa09/readings/NgHaradaRussell-shaping-ICML1999.pdf', desc: 'Proves potential-based reward shaping preserves optimal Nash policies.' },
      { badge: 'ICML 2021', title: 'Prioritized Level Replay', authors: 'M. Jiang et al.', url: 'https://arxiv.org/abs/2010.03934', desc: 'Prioritizes high-TD-error failure states and curriculum seeds.' }
    ],
    t7: [
      { badge: 'FLAIRS 2022', title: 'A Closer Look at Invalid Action Masking in Policy Gradient Algorithms', authors: 'S. Huang & S. Ontañón', url: 'https://arxiv.org/abs/2006.14171', desc: 'Theoretical justification for -10^8 boolean physics logit masking.' }
    ],
    t8: [
      { badge: 'RSS 2018', title: 'Asymmetric Actor Critic for Image-Based Robot Learning', authors: 'L. Pinto et al.', url: 'https://arxiv.org/abs/1710.06542', desc: 'Privileged omniscient critic paired with a partial-observation actor.' },
      { badge: 'NEURIPS 2016', title: 'Learning values across many orders of magnitude (PopArt)', authors: 'H. van Hasselt et al.', url: 'https://arxiv.org/abs/1602.07714', desc: 'Adaptive target normalization across multi-horizon value heads.' }
    ],
    t9: [
      { badge: 'NATURE 2019', title: 'Grandmaster level in StarCraft II using multi-agent reinforcement learning', authors: 'O. Vinyals et al.', url: 'https://www.nature.com/articles/s41586-019-1724-z', desc: 'Introduces Prioritized Fictitious Self-Play (PFSP) with Main and Exploiter roles.' }
    ]
  },
  mermaidDiagram: `flowchart LR
  subgraph S1["Stage 1: 171D Egocentric Frame"]
    N1["01. Egocentric Basis R_car^T"] --> N2["02. 35D Core Kinematics"]
    N1 --> N3["03. 136D Static Pad Block (34x4)"]
    N1 -.-> N4["04. 68D Omniscient Critic Tail"]
  end
  subgraph S2["Stage 2: K=4 Temporal Stack (684D)"]
    N2 & N3 --> N5["05. K=4 Sliding Window (684D)"]
    N5 -.-> N6["06. 0..2 Tick Latency Randomizer"]
  end
  subgraph S3["Stage 3: 4-Layer Dense MLP"]
    N5 & N6 --> N7["07. 684->512->512 LayerNorm-SiLU"]
    N7 --> N8["08. 512->256 Policy Neck (h_trunk)"]
  end
  subgraph S4["Stage 4: Replay Miner & Skill Z_t"]
    N9["09. SeqScout WRAcc Replay Miner"] -.-> N10["10. Dual Flip-Reset Detector"]
    N8 & N10 -.-> N11["11. Compositional Skill Z_t (8/32)"]
  end
  subgraph S5["Stage 5: Fused 31-Logit Heads"]
    N8 --> N12["12. Fused 31-Logit Head (256->31)"]
    N12 --> N13["13. Padded [B,7,7] Masked Sampler"]
    N13 --> N14["14. 8-Subtick FlipState FSM (15Hz)"]
  end
  subgraph S6["Stage 6: 752D Critic & League"]
    N4 & N5 -.-> N15["15. 752D Privileged Critic (3 PopArt)"]
    N14 -.-> N16["16. Coupled Zero-Sum PBRS"]
    N15 & N16 & N9 --> N17["17. 5-Way Curriculum & PFSP League"]
  end`
};
