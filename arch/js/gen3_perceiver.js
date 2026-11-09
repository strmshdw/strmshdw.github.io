// ============================================================================
// LEGACY GEN 3: ST-PERCEIVER & 2-STAGE AUTOREGRESSIVE HEADS (700D / 752D)
// ============================================================================
window.ARASHIKAGE_GEN3_PERCEIVER = {
  id: 'gen3_perceiver',
  shortBadge: 'LEGACY GEN 3 // ST-PERCEIVER',
  dropdownLabel: 'Gen 3: ST-Perceiver (700D · Cond-31)',
  identityTitle: '700D ST-Perceiver & 2-Stage Autoregressive Control',
  colHeaders: [
    { col: 0, x: 96,  title: 'STAGE 1 // 700D CANONICAL', sub: 'K=4 Stack · Wheel 16D',    color: '#38bdf8' },
    { col: 1, x: 282, title: 'STAGE 2 // ENTITY UNPACK',  sub: '144D Core · 34×7D PointNet', color: '#22d3ee' },
    { col: 2, x: 468, title: 'STAGE 3 // ST-PERCEIVER',   sub: 'M=4 × N=37 · QK-RMSNorm',  color: '#a78bfa' },
    { col: 3, x: 654, title: 'STAGE 4 // SWIGLU TRUNK',   sub: '912D->256D · Skill Z_t',   color: '#f472b6' },
    { col: 4, x: 840, title: 'STAGE 5 // COND-31 HEADS',  sub: '2-Stage Jump/Boost->Axes', color: '#fbbf24' },
    { col: 5, x: 1024, title: 'STAGE 6 // 752D CRITIC',   sub: 'M=4×N=43 · Distill · PPO', color: '#34d399' }
  ],
  nodes: [
    // --- COLUMN 0: STAGE 1 — C++17 SIM & 700D CANONICAL OBS (x = 96) ---
    {
      id: 'dma_slice', num: '01', col: 0, x: 96, y: 125, w: 162, h: 92,
      title: 'C++17 Batch Engine', sub: 'OpenMP Arenas · Z-Up Mirror', tag: 'NativeBatchEngine',
      color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t0', 't9'],
      role: 'Stage 1 · C++17 OpenMP RocketSim Batch Engine & Team Mirroring (15 Hz)',
      tensor: 'CanonicalObs700D [B, 700] + ActionMasks [B, 31]',
      formula: 'pos_c = (-x, -y, z), pad_idx = ORANGE_PAD_PERM[i] (team == 1)',
      how: 'Steps parallel RocketSim arenas in C++17 with OpenMP thread pools. For Orange team agents, mirrors world X/Y coordinates (-x, -y, z) and permutes the 34 boost pads via ORANGE_PAD_PERMUTATION so the policy always attacks toward +Y.',
      why: 'Replaced Python-loop gym wrappers with contiguous C++ float buffers, though it still assembled flat feature vectors rather than Hex64\'s 64-byte-aligned 5,376B entity arena slice.',
      contrib: 'Delivered high-throughput 1v1 training rollouts and canonical team symmetry across all 34 boost pads.'
    },
    {
      id: 'dyn_nodes', num: '02', col: 0, x: 96, y: 265, w: 162, h: 92,
      title: '171D×4 History Stack', sub: '684D Egocentric R_car^T', tag: 'K=4 Sliding Win',
      color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t0', 't1'],
      role: 'Stage 1 · 4-Frame Egocentric Body-Frame Observation Stack (684 Floats)',
      tensor: 'X_ego ∈ R^[B, 4, 171] -> [B, 684] (frames t, t-1, t-2, t-3)',
      formula: 'v_rel^body = R_car^T (v_entity - v_car), g_local = R_car^T [0,0,-1]^T',
      how: 'Projects all velocities, relative ball/opponent positions, angular velocities, and 34×4 boost pad coordinates into the ego car\'s local body frame R_car^T and stacks the last K=4 steps (684 floats) using a deque buffer with 0..2 tick latency randomization.',
      why: 'Before Hex64 introduced FP32 Titans fast weights and BallRingBuffer480, stacking K=4 frames was the primary way for the actor to infer ball acceleration and opponent boost consumption.',
      contrib: 'Provided finite-difference velocity derivatives and immediate body-local steering/pitch alignment.'
    },
    {
      id: 'env_nodes', num: '03', col: 0, x: 96, y: 405, w: 162, h: 92,
      title: '16D Wheel History', sub: '4 Wheels × K=4 Compression', tag: 'Bytes 684..700',
      color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t0', 't8'],
      role: 'Stage 1 · 4-Frame Ego Wheel Suspension Contact Extension (16 Floats)',
      tensor: 'w_hist ∈ R^[B, 4, 4] -> [B, 16] (appended at [:, 684:700])',
      formula: 'x_700 = Concat(x_684, w_hist[t..t-3]) ∈ R^[B, 700]',
      how: 'Appends 16 floats of 4-wheel suspension contact/compression history across the K=4 temporal window onto the 684D egocentric vector to form the 700D canonical observation.',
      why: 'Gen 2 (684D) suffered from blind spots during wavedashes and flip resets because wheel contact was only visible to the privileged critic; Gen 3 exposed 4-frame wheel history to the actor.',
      contrib: 'Enabled the ST-Perceiver actor to detect 4-wheel ball touches for flip resets and time wavedash landings.'
    },
    {
      id: 'priv_ctx', num: '04', col: 0, x: 96, y: 545, w: 162, h: 92,
      title: '68D Privileged Tail', sub: '5 Ballistic Bounces + Slip', tag: '752D Critic Input',
      color: '#34d399', modes: ['all', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t8', 't9'],
      role: 'Stage 1 · Asymmetric Omniscient Critic Physics Tail (68 Floats -> 752D)',
      tensor: 'c_priv ∈ R^[B, 68] -> x_critic ∈ R^[B, 752]',
      formula: 'Δt_bounce ∈ {0.1, 0.25, 0.5, 1.0, 1.5} s (e_restitution = 0.6)',
      how: 'Appends 68 privileged floats for the training critic: 20D exact 4-wheel suspension compression, contact normals, and lateral slip ratios, 18D true world-frame velocities, and 30D 5-horizon analytical ball bounce predictions.',
      why: 'Gave the training critic analytical wall/floor bounce lookahead before Hex64 moved 480-tick Rust ball trajectory integration directly into the shared actor-critic observation.',
      contrib: 'Stabilized value targets during wall reads and high aerials without requiring recurrent critic states.'
    },

    // --- COLUMN 1: STAGE 2 — ZERO-COPY UNPACK & POINTNET (x = 282) ---
    {
      id: 'gpu_edges', num: '05', col: 1, x: 282, y: 205, w: 162, h: 96,
      title: '144D Core Unpacker', sub: 'Self(62) · Ball(40) · Opp(42)', tag: 'SwiGLU Core Enc',
      color: '#22d3ee', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'edges',
      techIds: ['t1', 't2'],
      role: 'Stage 2A · Zero-Copy Temporal Core Unpacker & SwiGLU Tokenizer',
      tensor: 'x_core ∈ R^[B, 144] -> T_core ∈ R^[B, 3, 192]',
      formula: 'a_ball = v_ball^(t) - v_ball^(t-1), Δb_opp = b_opp^(t) - b_opp^(t-3)',
      how: 'Slices the 4×171 history tensor without memory copies into 62D Self (4×10 kinematics + 6D goals + 16D wheels), 40D Ball (4×9 kinematics + 3D finite-diff acceleration + 1D speed), and 42D Opponent (4×10 kinematics + boost burn delta + closing speed), projecting into 3×192 tokens via SwiGLU.',
      why: 'Gen 2\'s flat 684->512 linear layer mixed 544 boost-pad floats with 140 core physics floats; explicit unpacking isolated the 3 primary dynamic actors.',
      contrib: 'Eliminated boost-pad gradient dilution on ball/car kinematics while preserving TorchScript trace compatibility.'
    },
    {
      id: 'bipartite_enc', num: '06', col: 1, x: 282, y: 365, w: 162, h: 96,
      title: 'BoostPad PointNet', sub: '34 Pads × 7D -> 192D Shared', tag: 'Permutation Inv',
      color: '#22d3ee', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'edges',
      techIds: ['t1', 't2'],
      role: 'Stage 2B · Weight-Shared 34-Entity Boost Pad PointNet Encoder',
      tensor: 'P_pads ∈ R^[B, 34, 7] -> T_pads ∈ R^[B, 34, 192]',
      formula: 'p_j = [x_j, y_j, z_j, τ_j^(t), τ_j^(t) - τ_j^(t-3), I_big, d_j] ∈ R^7',
      how: 'Constructs a 7D feature vector for each of the 34 boost pads (current body-frame XYZ, availability fraction τ_j, 4-frame respawn timer delta Δτ_j, big-pad indicator, and normalized Euclidean distance d_j) and applies a shared PointNet MLP (7 -> 64 -> 192 with LayerNorm + SiLU).',
      why: 'Replaced 544D of redundant 4-frame static boost pad coordinates with a compact, weight-shared geometric encoder over all 34 pads.',
      contrib: 'Cut first-layer parameter count and allowed the network to reason over pad respawn rates and spatial proximity.'
    },

    // --- COLUMN 2: STAGE 3 — PERCEIVER CROSS-ATTENTION (x = 468) ---
    {
      id: 'titans_prior', num: '07', col: 2, x: 468, y: 205, w: 162, h: 96,
      title: 'Spatial & Pad Bias', sub: '-w_dist·d_j - w_cd·(1-τ_j)', tag: 'Per-Head Bias',
      color: '#a78bfa', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t2', 't3'],
      role: 'Stage 3A · Learned Per-Head Spatial Distance & Cooldown Attention Bias',
      tensor: 'B_pad ∈ R^[B, 4, 1, 34] -> B_full ∈ R^[B, 4, 1, 37]',
      formula: 'B_h,j = -|w_dist,h|·d_j - |w_cd,h|·(1 - τ_j) + w_big,h·I_big,j',
      how: 'Computes an explicit physics-informed additive attention bias across all 4 attention heads for the 34 boost pad keys: penalizing distant pads (-|w_dist|·d_j) and inactive pads on cooldown (-|w_cd|·(1-τ_j)) while boosting 100-boost canisters (+w_big·I_big).',
      why: 'Pure dot-product attention struggles to filter out 30+ irrelevant or depleted boost pads across the pitch without an explicit spatial distance decay prior.',
      contrib: 'Ensured attention heads immediately lock onto active, nearby 100-boost pads during rotations.'
    },
    {
      id: 'titans_mem', num: '08', col: 2, x: 468, y: 365, w: 162, h: 96,
      title: '2L ST-Perceiver', sub: 'M=4 Queries × N=37 Keys', tag: 'Pre-RMS + QK-Norm',
      color: '#a78bfa', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t2', 't3'],
      role: 'Stage 3B · 2-Layer Pre-RMSNorm + QK-Norm Perceiver Cross-Attention Backbone',
      tensor: 'Q ∈ R^[B, 4, 192] × K,V ∈ R^[B, 37, 192] -> Q_out ∈ R^[B, 4, 192]',
      formula: 'Attn(Q,K,V) = softmax((RMSNorm(Q)·RMSNorm(K)^T)/√48 + B_full) V',
      how: 'Stacks 2 Perceiver Cross-Attention blocks (d=192, H=4, d_k=48) where M=4 latent queries (3 Core tokens [Self, Ball, Opp] + 1 learned Tactical Query token) attend over all N=37 entity tokens (3 Core + 34 Pads) with per-head QK-RMSNorm and SwiGLU FFNs.',
      why: 'Reduced O(N^2) all-to-all self-attention (37×37 = 1,369 pairs) to O(M·N) cross-attention (4×37 = 148 pairs), laying the conceptual groundwork for Hex64\'s 16×64 Bipartite DiffAttn.',
      contrib: 'Achieved sub-millisecond entity attention while preventing logit explosion during long PPO runs via QK-RMSNorm.'
    },

    // --- COLUMN 3: STAGE 4 — SWIGLU FUSION & SKILL AUXILIARY HEAD (x = 654) ---
    {
      id: 'coconut_loop', num: '09', col: 3, x: 654, y: 150, w: 162, h: 92,
      title: '912D->256D Fusion', sub: '4×192 Queries + 144D Core', tag: 'Skip Connection',
      color: '#f472b6', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t3', 't4'],
      role: 'Stage 4A · Perceiver Query Flatten & Direct Core Skip Concatenation',
      tensor: 'Concat(Flatten(Q_out)[768], x_core[144]) -> R^[B, 912] -> R^[B, 256]',
      formula: 'h_0 = SiLU(RMSNorm(Linear_912->256([Q_out || x_core])))',
      how: 'Flattens the 4×192 Perceiver output queries (768D) and concatenates them with the raw 144D temporal core vector (Self, Ball, Opp kinematics) to form a 912D representation before projecting down to the 256D trunk.',
      why: 'Guaranteed that high-precision egocentric angles and angular velocities in x_core were never smoothed out by attention softmax averaging.',
      contrib: 'Preserved sharp local control gradients while injecting global boost-pad and tactical context.'
    },
    {
      id: 'soft_moe', num: '10', col: 3, x: 654, y: 295, w: 162, h: 92,
      title: 'Residual SwiGLU Trunk', sub: '256D -> 384D -> 256D Block', tag: 'Pre-RMSNorm',
      color: '#f472b6', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t4'],
      role: 'Stage 4B · Pre-RMSNorm Residual SwiGLU Feature Trunk (256D)',
      tensor: 'h_trunk = h_0 + SwiGLU(RMSNorm(h_0)) ∈ R^[B, 256]',
      formula: 'SwiGLU(x) = (SiLU(x W_gate) ⊙ (x W_up)) W_down',
      how: 'Processes the 256D fused vector through a Pre-RMSNorm residual SwiGLU block (hidden dim 384D) to produce the primary actor latent representation h_trunk.',
      why: 'Replaced standard LayerNorm+SiLU MLPs with gated linear units (SwiGLU) for multiplicative feature interaction between car orientation and ball velocity.',
      contrib: 'Provided a clean 256D latent representation for both Stage-1 binary action heads and training skill supervision.'
    },
    {
      id: 'fsq_bottleneck', num: '11', col: 3, x: 654, y: 440, w: 162, h: 92,
      title: 'Compositional Skill Z_t', sub: '8 Families · 32 Sub-Skills', tag: 'Training Aux Head',
      color: '#f472b6', modes: ['all', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t6'],
      role: 'Stage 4C · Training-Only Compositional Skill Auxiliary Head (Z_t)',
      tensor: 'z_macro[8], z_sub[32], z_phase[13] <- MLP(h_trunk)',
      formula: 'L_skill = CE(z_macro, y_fam) + CE(z_sub, y_sub) + MSE(z_phase, y_ph)',
      how: 'During training, predicts the structured skill taxonomy Z_t mined from pro replays: 8 Macro Skill Families (Strike, Dash, Carry/Flick, Air Dribble, Flip Reset, Backboard, Cancel), 32 Sub-Variants (Musty, Breezi, StallReset, ZapDash), and 13D continuous phase vectors.',
      why: 'Prevented latent representation collapse into generic ball-chasing by forcing h_trunk to linearly separate 32 distinct mechanical sub-skills. (Hex64 later upgraded this into an active in-graph 1,000-code FSQ bottleneck).',
      contrib: 'Shaped the 256D trunk to encode mechanical phase progression without adding any runtime cost during live inference.'
    },

    // --- COLUMN 4: STAGE 5 — TWO-STAGE AUTOREGRESSIVE HEADS & FLIP FSM (x = 840) ---
    {
      id: 'stage1_bin', num: '12', col: 4, x: 840, y: 150, w: 162, h: 92,
      title: 'Stage-1 Impulse Heads', sub: 'Jump/Dodge[4] · Boost/Brk[4]', tag: 'Physics Masked',
      color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t5', 't7'],
      role: 'Stage 5A · Stage-1 Discrete Impulse & Propulsion Categorical Heads',
      tensor: 'logits_J ∈ R^[B, 4], logits_B ∈ R^[B, 4] (masked by -10^8)',
      formula: 'a_jump ~ Cat(softmax(logits_J + M_J)), a_boost ~ Cat(softmax(logits_B + M_B))',
      how: 'Evaluates the two primary impulse heads first from h_trunk: Jump/Dodge (4-way: None, Jump, Hold, Dodge/DoubleJump) and Boost/Handbrake (4-way: None, Boost, Drift, Boost+Drift), applying RocketSim boolean physics masks (-10^8 on illegal actions like boosting with 0 fuel).',
      why: 'In Gen 2, all 7 categorical heads were sampled independently in parallel, so Steer/Pitch/Yaw did not know whether Jump or Boost had actually fired on that stochastic sample.',
      contrib: 'Established causal ordering: impulse decisions (Jump/Dodge & Boost/Drift) are resolved before rotational/directional axes.'
    },
    {
      id: 'stage2_flow', num: '13', col: 4, x: 840, y: 295, w: 162, h: 92,
      title: 'Stage-2 Cond-23 Heads', sub: 'Embed(J,B)->RMSNorm->5 Heads', tag: 'Autoregressive',
      color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t5', 't7'],
      role: 'Stage 5B · Autoregressive Action-Conditioned Directional Heads (23 Logits)',
      tensor: 'h_dir = RMSNorm(h_trunk + W_cond[e_J || e_B]) -> 5 Heads (23 logits)',
      formula: 'log π(a|s) = Σ_{h∈{J,B}} log P(a_h|h_trunk) + Σ_{d∈Dir} log P(a_d|h_dir)',
      how: 'Embeds the sampled (a_jump, a_boost) via 32D lookup tables (or soft probability expectation during deterministic TorchScript export), projects [e_J || e_B] (64D -> 256D) into h_dir = RMSNorm(h_trunk + Δ_cond), and evaluates Throttle[3], Steer[7], Pitch[5], Yaw[5], and Roll[3].',
      why: 'When Stage-1 decides to fire a Dodge (a_jump=3), h_dir immediately shifts the Pitch/Yaw/Roll logits to point in the exact dodge flick direction rather than an airborne air-roll.',
      contrib: 'Eliminated incompatible multi-head action samples while preserving exact autoregressive joint log-probabilities for PPO.'
    },
    {
      id: 'subtick_exec', num: '14', col: 4, x: 840, y: 440, w: 162, h: 92,
      title: '8-Subtick Flip FSM', sub: '15Hz Repeat · C++ Jump Edge', tag: 'Subtick 0..7 Macro',
      color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t7'],
      role: 'Stage 5C · 8-Tick (120 Hz) Action Repeat & C++/Python FlipState Edge Macro',
      tensor: 'a_cat[7] -> 8 × CarControls @ 120 Hz (66.7 ms outer step)',
      formula: 'sub=0: jump=0 (release) | sub=1..4: jump=1 (edge) | sub=5..7: jump=0',
      how: 'Translates the 7 discrete categorical indices into RocketSim controls held across 8 physics ticks (15 Hz). When a Dodge/Double-Jump is requested while jump was held, a hardcoded C++/Python FlipState machine forces subtick 0 to jump=0 so subtick 1 triggers a fresh rising edge.',
      why: 'Because the Gen 2/3 policy only emitted 1 action tuple every 8 ticks (15 Hz), it could not release and re-press jump mid-step on its own. (Hex64 eliminated this macro via native K_sub=4 60 Hz action chunking).',
      contrib: 'Allowed 15 Hz categorical policies to reliably execute double-jumps and dodges in RocketSim and live RLBot matches.'
    },

    // --- COLUMN 5: STAGE 6 — 752D CRITIC, DISTILLATION & PPO LEAGUE (x = 1024) ---
    {
      id: 'critic_heads', num: '15', col: 5, x: 1024, y: 150, w: 162, h: 92,
      title: 'ST-Perceiver Critic', sub: 'M=4 × N=43 (5 Bounce Tokens)', tag: '3-Horizon PopArt',
      color: '#34d399', modes: ['all', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t8'],
      role: 'Stage 6A · 752D Omniscient ST-Perceiver Critic & 3-Horizon PopArt Heads',
      tensor: 'N=43 Tokens (3 Core+34 Pads+5 Bounce+1 Omni) -> v_norm ∈ R^[B, 3]',
      formula: 'γ ∈ {0.990, 0.995, 0.998}, w_h = (0.20, 0.50, 0.30)',
      how: 'Unpacks the 752D privileged critic state into N=43 entity tokens — adding 5 explicit 7D Future Ball Bounce tokens (Δt ∈ {0.1..1.5}s) and 1 38D Omniscient Physics token — runs 2 Perceiver Cross-Attention layers (M=4×N=43), and outputs 3 PopArt-normalized scalar values.',
      why: 'Representing the 5 analytical future ball bounces as spatial tokens allowed the critic\'s attention heads to directly compare car trajectories against future bounce coordinates.',
      contrib: 'Delivered low-variance multi-horizon GAE advantages across tactical (10s), possession (20s), and strategic (40s) horizons.'
    },
    {
      id: 'jepa_search', num: '16', col: 5, x: 1024, y: 295, w: 162, h: 92,
      title: 'Gen2->Gen3 Distiller', sub: 'Exact 7-Head Categorical KL', tag: 'PopArt Transfer',
      color: '#34d399', modes: ['all', 'distill'], stageGroup: 'control',
      techIds: ['t9'],
      role: 'Stage 6B · Offline-to-Online Policy KL & PopArt Moment Distillation Bridge',
      tensor: 'L_KL = Σ_{h=1}^7 KL(π_Gen2^(h)(·|s_684) || π_Gen3^(h)(·|s_700))',
      formula: '(μ_Gen3, σ_Gen3) <- (μ_Gen2, σ_Gen2) (PopArt statistics copy)',
      how: 'Warm-starts the randomly initialized ST-Perceiver Actor and Critic from the mature Gen 2 (Factorized-684) checkpoint by minimizing exact analytic categorical KL divergence across all 7 action heads while copying PopArt running mean/variance statistics.',
      why: 'Training a Perceiver transformer from scratch in RL wastes millions of steps re-learning basic driving and aerial stability that the Gen 2 MLP already mastered.',
      contrib: 'Transferred 100% of Gen 2\'s mechanical competence into the Gen 3 ST-Perceiver architecture in minutes before PPO fine-tuning.'
    },
    {
      id: 'ppo_grpo_opt', num: '17', col: 5, x: 1024, y: 440, w: 162, h: 92,
      title: 'Zero-Sum PBRS & PFSP', sub: '5-Way Curriculum · TrueSkill', tag: 'Tri-Role League',
      color: '#34d399', modes: ['all', 'train'], stageGroup: 'control',
      techIds: ['t6', 't8'],
      role: 'Stage 6C · Coupled Zero-Sum PBRS, 5-Way Stratified Curriculum & PFSP League',
      tensor: 'r_i^\' = r_i - κ(r_i + r_opp)/2, P_match(i) ∝ g(p_win) · Var(μ_i)',
      formula: 'p_curr = [30% Pro, 25%HardNeg, 20%Perturb, 15%Kickoff, 10%SkillBank]',
      how: 'Trains with Coupled Zero-Sum 1v1 PBRS rewards, resetting arenas from a 5-way Stratified Curriculum (including mined 27D SkillshotInitiationBank aerial/reset entry states) against a Tri-Role PFSP League (65% Main, 20% Main Exploiter, 15% League Exploiter).',
      why: 'Standard kickoff-only training rarely visits flip-reset or ceiling-shot states; seeding directly into mined replay initiation states forced high-frequency mechanical practice.',
      contrib: 'Drove continuous TrueSkill improvement and prevented rock-paper-scissors policy cycling.'
    }
  ],
  edges: [
    // Col 0 -> Col 1
    { from: 'dma_slice', to: 'dyn_nodes', label: '684D Ego', modes: ['all','live','train','distill'] },
    { from: 'dma_slice', to: 'env_nodes', label: '16D Wheels', modes: ['all','live','train','distill'] },
    { from: 'dma_slice', to: 'priv_ctx', label: '68D Omni', modes: ['all','train','distill'], dashed: true },
    { from: 'dyn_nodes', to: 'gpu_edges', label: 'Core [144D]', modes: ['all','live','train','distill'] },
    { from: 'env_nodes', to: 'gpu_edges', label: 'Wheels [16D]', modes: ['all','live','train','distill'] },
    { from: 'dyn_nodes', to: 'bipartite_enc', label: 'Pads [34×7D]', modes: ['all','live','train','distill'] },
    // Col 1 -> Col 2
    { from: 'bipartite_enc', to: 'titans_prior', label: 'd_j, τ_j, I_big', modes: ['all','live','train','distill'] },
    { from: 'gpu_edges', to: 'titans_mem', label: '3 Core Queries', modes: ['all','live','train','distill'] },
    { from: 'bipartite_enc', to: 'titans_mem', label: '34 Pad Keys', modes: ['all','live','train','distill'] },
    { from: 'titans_prior', to: 'titans_mem', label: 'Bias [4,1,37]', modes: ['all','live','train','distill'] },
    // Col 2 -> Col 3
    { from: 'titans_mem', to: 'coconut_loop', label: 'Q_out [768D]', modes: ['all','live','train','distill'] },
    { from: 'gpu_edges', to: 'coconut_loop', label: 'Skip x_core[144]', modes: ['all','live','train','distill'], dashed: true },
    { from: 'coconut_loop', to: 'soft_moe', label: 'h_0 [256D]', modes: ['all','live','train','distill'] },
    { from: 'soft_moe', to: 'fsq_bottleneck', label: 'h_trunk [256D]', modes: ['all','train','distill'], dashed: true },
    // Col 3 -> Col 4
    { from: 'soft_moe', to: 'stage1_bin', label: 'h_trunk [256D]', modes: ['all','live','train','distill'] },
    { from: 'stage1_bin', to: 'stage2_flow', label: '(a_jump, a_boost)', modes: ['all','live','train','distill'] },
    { from: 'soft_moe', to: 'stage2_flow', label: 'Residual Base', modes: ['all','live','train','distill'], dashed: true },
    { from: 'stage2_flow', to: 'subtick_exec', label: '7 Cat Indices', modes: ['all','live','train','distill'] },
    // Col 3/4 -> Col 5
    { from: 'priv_ctx', to: 'critic_heads', label: '752D (N=43)', modes: ['all','train','distill'], dashed: true },
    { from: 'soft_moe', to: 'jepa_search', label: 'Student Logits', modes: ['all','distill'], dashed: true },
    { from: 'critic_heads', to: 'jepa_search', label: 'PopArt Moments', modes: ['all','distill'], dashed: true },
    { from: 'critic_heads', to: 'ppo_grpo_opt', label: '3-Horizon GAE', modes: ['all','train'] },
    { from: 'subtick_exec', to: 'ppo_grpo_opt', label: 'Rollout Step', modes: ['all','train'], dashed: true },
    { from: 'fsq_bottleneck', to: 'ppo_grpo_opt', label: 'L_skill Aux', modes: ['all','train'], dashed: true }
  ],
  scenarios: {
    tour: {
      label: 'GEN 3 END-TO-END 66.7ms TOUR',
      steps: [
        {
          title: '700D Egocentric K=4 Stack + 16D Wheel History',
          focusNode: 'dyn_nodes', highlight: ['dma_slice', 'dyn_nodes', 'env_nodes'], techId: 't0',
          desc: 'Every 66.7 ms (15 Hz), the agent rotates world coordinates into the ego car\'s local body frame R_car^T, stacks the last K=4 frames (684D), and appends 16D of 4-wheel suspension contact history to form a 700D vector.'
        },
        {
          title: 'Zero-Copy Entity Unpacking & Shared BoostPad PointNet',
          focusNode: 'bipartite_enc', highlight: ['gpu_edges', 'bipartite_enc'], techId: 't1',
          desc: 'Rather than feeding 700 floats into a monolithic MLP, the zero-copy 700D entity unpacker splits out a 144D temporal core (Self, Ball w/ finite-diff accel, Opp w/ boost burn delta) and encodes all 34 boost pads via a weight-shared 7D->192D PointNet.'
        },
        {
          title: 'Physics-Biased Perceiver Cross-Attention (M=4 × N=37)',
          focusNode: 'titans_mem', highlight: ['titans_prior', 'titans_mem'], techId: 't2',
          desc: 'Four latent queries [Self, Ball, Opp, TacticalQuery] attend over all 37 entity tokens using Pre-RMSNorm and per-head QK-Norm, guided by learned per-head spatial distance (-w_dist·d_j) and pad cooldown (-w_cd·(1-τ_j)) biases.'
        },
        {
          title: '912D Skip-Concatenation & Residual SwiGLU Trunk',
          focusNode: 'soft_moe', highlight: ['coconut_loop', 'soft_moe'], techId: 't4',
          desc: 'The 4×192 Perceiver queries (768D) concatenate with the raw 144D core kinematics (912D total) and project into a 256D Pre-RMSNorm Residual SwiGLU trunk so local steering and pitch angles remain unattenuated.'
        },
        {
          title: 'Compositional Skill Auxiliary Supervision (Z_t)',
          focusNode: 'fsq_bottleneck', highlight: ['soft_moe', 'fsq_bottleneck'], techId: 't6',
          desc: 'During training, an auxiliary head on h_trunk predicts 8 Macro Skill Families, 32 Sub-Skills (Musty, StallReset, ZapDash), and 13D continuous phase vectors mined from replays to prevent representation collapse.'
        },
        {
          title: 'Two-Stage Autoregressive Conditioned Action Heads (31 Logits)',
          focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow', 'subtick_exec'], techId: 't5',
          desc: 'Stage 1 samples Jump/Dodge[4] and Boost/Brake[4] with boolean physics masks. Stage 2 embeds those discrete choices into h_dir = RMSNorm(h_trunk + Δ_cond) before evaluating Throttle[3], Steer[7], Pitch[5], Yaw[5], and Roll[3].'
        },
        {
          title: '752D ST-Perceiver Critic & Gen2->Gen3 KL Distillation',
          focusNode: 'critic_heads', highlight: ['priv_ctx', 'critic_heads', 'jepa_search', 'ppo_grpo_opt'], techId: 't8',
          desc: 'The asymmetric 752D critic converts 5 analytical ball bounces into spatial tokens (M=4×N=43) for 3-horizon PopArt GAE, warm-started from the Gen 2 MLP via exact 7-head categorical KL distillation.'
        }
      ]
    },
    bounce: {
      label: 'SCENARIO 1: CRITIC 5-BOUNCE TOKEN READ',
      steps: [
        {
          title: 'Finite-Difference Ball Acceleration in Actor (40D)',
          focusNode: 'gpu_edges', highlight: ['dyn_nodes', 'gpu_edges'], techId: 't1',
          desc: 'The actor infers ball curve from the 4-frame egocentric stack (t..t-3) plus explicit finite-difference acceleration a_ball = v_t - v_{t-1} inside the 144D core unpacker.'
        },
        {
          title: 'Critic 5-Horizon Analytical Ballistic Tokens (752D)',
          focusNode: 'priv_ctx', highlight: ['priv_ctx', 'critic_heads'], techId: 't8',
          desc: 'Unlike the actor, the 752D ST-Perceiver Critic receives 5 analytical bounce predictions (Δt ∈ {0.1, 0.25, 0.5, 1.0, 1.5}s with e=0.6 restitution) unpacked as 5 spatial 7D tokens in its N=43 Perceiver key set.'
        },
        {
          title: 'Why Hex64 Moved BallRingBuffer480 into Shared Stage 1',
          focusNode: 'titans_mem', highlight: ['titans_mem', 'critic_heads'], techId: 't2',
          desc: 'Because only the Gen 3 critic saw explicit bounce tokens while the actor relied on 4-frame history, actor wall reads lagged behind critic value estimates — motivating Hex64\'s shared 8-node BallRingBuffer480 in Stage 1.'
        },
        {
          title: 'Conditioned Aerial Alignment & Boost Commitment',
          focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow'], techId: 't5',
          desc: 'Once Stage 1 commits to Boost (a_boost=1), the conditioning bridge shifts h_dir so Stage 2 pitches and air-rolls toward the intercept window.'
        }
      ]
    },
    aerial: {
      label: 'SCENARIO 2: AUTOREGRESSIVE DODGE FLICK',
      steps: [
        {
          title: '16D Wheel Contact History Detects Flip Reset',
          focusNode: 'env_nodes', highlight: ['env_nodes', 'gpu_edges'], techId: 't0',
          desc: 'Bytes 684..700 expose 4 frames of 4-wheel suspension contact to the actor, signaling that all 4 wheels touched the ball and restored the airborne dodge flag.'
        },
        {
          title: 'Stage-1 Samples Dodge Action (a_jump = 3)',
          focusNode: 'stage1_bin', highlight: ['soft_moe', 'stage1_bin'], techId: 't5',
          desc: 'With has_flip == True in the RocketSim boolean mask, Stage 1 evaluates Jump/Dodge[4] and samples a_jump = 3 (Dodge/DoubleJump).'
        },
        {
          title: 'Conditioning Bridge Shifts Directional Latent h_dir',
          focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow'], techId: 't5',
          desc: 'The 32D embedding for a_jump=3 projects into h_dir = RMSNorm(h_trunk + Δ_cond), flipping Pitch[5] and Yaw[5] from smooth aerial tracking to a crisp diagonal dodge flick.'
        },
        {
          title: '8-Subtick FlipState FSM Fires Rising Jump Edge',
          focusNode: 'subtick_exec', highlight: ['stage2_flow', 'subtick_exec'], techId: 't7',
          desc: 'Because the outer step runs at 15 Hz (8 ticks), the C++ FlipState macro forces subtick 0 to jump=0 and subticks 1..4 to jump=1 so RocketSim registers a fresh dodge impulse.'
        }
      ]
    },
    fake: {
      label: 'SCENARIO 3: OPPONENT BOOST BURN TRACKING',
      steps: [
        {
          title: '4-Frame Opponent Boost Delta (Δb_opp)',
          focusNode: 'gpu_edges', highlight: ['dyn_nodes', 'gpu_edges'], techId: 't1',
          desc: 'Inside the 42D Opponent core unpacker, Gen 3 computes Δb_opp = b_opp(t) - b_opp(t-3) over the 267 ms sliding window to detect whether the opponent is actively burning boost into a challenge.'
        },
        {
          title: 'Perceiver Tactical Query Cross-Attends to Opponent & Pads',
          focusNode: 'titans_mem', highlight: ['titans_prior', 'titans_mem'], techId: 't2',
          desc: 'Query 3 (TacticalQuery) cross-attends simultaneously to the Opponent token and the 34 Boost Pad tokens to see if the opponent is faking a challenge to grab a mid-field 100-pad.'
        },
        {
          title: 'Why Hex64 Added FP32 Titans Fast-Weight Memory',
          focusNode: 'coconut_loop', highlight: ['titans_mem', 'coconut_loop'], techId: 't3',
          desc: 'Gen 3\'s K=4 window only remembered 267 ms of history; if an opponent faked challenges every 30 seconds, weights could not adapt in-match — motivating Hex64\'s 2×4×32×32 FP32 Titans fast weights.'
        },
        {
          title: 'Stage-1 Handbrake Power-Slide Hook',
          focusNode: 'stage1_bin', highlight: ['stage1_bin', 'stage2_flow'], techId: 't5',
          desc: 'Stage 1 selects Drift (a_boost=2), conditioning Stage 2 to snap Steer[7] into a tight hook turn.'
        }
      ]
    },
    save: {
      label: 'SCENARIO 4: GEN 2 -> GEN 3 KL WARM-START',
      steps: [
        {
          title: 'Teacher Forward Pass on 684D Slice',
          focusNode: 'jepa_search', highlight: ['dyn_nodes', 'jepa_search'], techId: 't9',
          desc: 'During distillation, the frozen Gen 2 FactorizedActor evaluates the first 684 floats of the 700D observation to produce teacher probability distributions across all 7 categorical heads.'
        },
        {
          title: 'Student Forward Pass with Teacher Action Conditioning',
          focusNode: 'stage2_flow', highlight: ['titans_mem', 'stage1_bin', 'stage2_flow', 'jepa_search'], techId: 't9',
          desc: 'The Gen 3 ST-Perceiver evaluates the full 700D observation, conditioning its Stage-2 directional heads on the teacher\'s Stage-1 action so all 7 heads align cleanly.'
        },
        {
          title: 'Exact Analytic 7-Head Categorical KL Loss',
          focusNode: 'jepa_search', highlight: ['stage2_flow', 'jepa_search'], techId: 't9',
          desc: 'Gen2ToGen3Distiller minimizes the exact analytic sum of per-head KL divergences without Monte Carlo sampling noise.'
        },
        {
          title: 'PopArt Moment Transfer & Online PPO Handover',
          focusNode: 'critic_heads', highlight: ['critic_heads', 'jepa_search', 'ppo_grpo_opt'], techId: 't8',
          desc: 'Running mean and variance buffers (μ, σ) from Gen 2\'s PopArt heads are copied directly into the ST-Perceiver Critic so online PPO resumes with zero value-scale shock.'
        }
      ]
    }
  },
  techLibrary: [
    {
      id: 't0', short: '700D Canonical Obs',
      title: '700D Egocentric K=4 History + 16D Wheel Contact Observation',
      usedIn: ['dma_slice', 'dyn_nodes', 'env_nodes'],
      placement: 'Stage 1 Input Boundary — bridges C++17 NativeBatchEngine and the zero-copy entity unpacker.',
      how: 'Rotates world coordinates into the ego car\'s local body frame R_car^T, stacks K=4 frames of 171D features (684D), and appends 16D of 4-wheel suspension contact history (4 wheels × 4 frames) at indices [684:700].',
      why: 'Gen 2 (684D) hid wheel contact inside the privileged critic, leaving the actor blind to exact flip-reset 4-wheel ball touches and wavedash ground contacts.',
      contrib: 'Preserved backward compatibility with 684D teacher checkpoints (via [:684] slicing) while unlocking flip-reset awareness in the actor.',
      science: 'For any world vector v_w, the egocentric transformation v_b = R_car^T (v_w - p_car) ∈ R^3 is SE(2)-invariant to pitch orientation and Yaw, reducing sample complexity for local steering control.',
      origins: 'Evolved from Gen 2\'s 684D stack; later superseded in Arashikage (Hex64) by the 64-byte-aligned 5,376B Layout A entity slice with 64 explicit arena tokens.'
    },
    {
      id: 't1', short: 'Unpack & PointNet',
      title: 'Zero-Copy 144D Core Unpacker & Shared 34×7D BoostPad PointNet',
      usedIn: ['dyn_nodes', 'gpu_edges', 'bipartite_enc'],
      placement: 'Stage 2 Tokenization — sits between the flat 700D buffer and the Perceiver Cross-Attention blocks.',
      how: 'Unpacks [B, 700] without tensor copies into Self (62D), Ball (40D w/ finite-diff accel), and Opponent (42D w/ 4-frame boost delta), while reshaping the 34 boost pads into [B, 34, 7] and encoding them with a weight-shared PointNet (7->64->192).',
      why: 'In Gen 2, 544 of the 684 input floats were static boost pad coordinates repeated across 4 frames, consuming >75% of first-layer MLP weights.',
      contrib: 'Replaced 544 redundant pad inputs with a weight-shared 7D geometric encoder and isolated finite-difference ball/opponent temporal derivatives.',
      science: 'PointNet (Qi et al., 2017) applies a shared point-wise MLP h(p_j) followed by symmetric attention aggregation, guaranteeing equivariance to boost pad ordering.',
      origins: 'PointNet (Qi et al., CVPR 2017); customized in the Gen 3 ST-Perceiver Actor.'
    },
    {
      id: 't2', short: 'ST-Perceiver M=4×N=37',
      title: 'Spatial-Temporal Perceiver Cross-Attention (M=4 Queries × N=37 Keys)',
      usedIn: ['gpu_edges', 'bipartite_enc', 'titans_prior', 'titans_mem'],
      placement: 'Stage 3 Entity Backbone — compresses 37 arena entities into 4 latent queries.',
      how: 'Runs 2 layers of multi-head cross-attention (d=192, H=4) where M=4 queries (Self, Ball, Opp, plus 1 learned Tactical Query) attend over N=37 keys/values (3 Core + 34 Boost Pads).',
      why: 'Full self-attention over 37 tokens computes 1,369 pairs per layer; Perceiver cross-attention with M=4 queries computes only 148 pairs (a 9.2× reduction).',
      contrib: 'Introduced sub-millisecond entity attention to the platform while staying fast enough for 120 Hz/15 Hz RLBot inference.',
      science: 'Perceiver (Jaegle et al., 2021) projects a large byte/entity array X ∈ R^(N×D) into a compact latent bottleneck Q ∈ R^(M×D) via asymmetric cross-attention O(M·N).',
      origins: 'Perceiver IO (Jaegle et al., ICML 2021); evolved into Hex64\'s 16×64 Bipartite Differential Attention.'
    },
    {
      id: 't3', short: 'QK-Norm & Pad Bias',
      title: 'Per-Head QK-RMSNorm & Physics-Informed Distance/Cooldown Bias',
      usedIn: ['titans_prior', 'titans_mem', 'coconut_loop'],
      placement: 'Stage 3 Attention Stabilizer — inside every PerceiverCrossAttentionBlock.',
      how: 'Applies learned RMSNorm to Q and K per head before dot-product scaling and adds B_h,j = -|w_dist,h|·d_j - |w_cd,h|·(1-τ_j) + w_big,h·I_big,j to the 34 boost pad columns.',
      why: 'Unbounded QK dot products drift upward over millions of PPO steps, causing attention entropy collapse; meanwhile, un-biased softmax wastes attention mass on depleted pads across the field.',
      contrib: 'Eliminated attention logit explosion in long PPO runs and gave each head tunable spatial horizon preferences.',
      science: 'QK-Norm (Dehghani et al., 2023) bounds pre-softmax logits by enforcing ||q_i||_2 ≈ √d_k and ||k_j||_2 ≈ √d_k prior to inner product evaluation.',
      origins: 'Scaling Vision Transformers / Dehghani et al. (2023); upgraded in Hex64 to 72D Fused GPU Pairwise Fourier + Intercept biases.'
    },
    {
      id: 't4', short: '912D Skip & SwiGLU',
      title: '912D Core Skip-Concatenation & Pre-RMSNorm Residual SwiGLU Trunk',
      usedIn: ['coconut_loop', 'soft_moe'],
      placement: 'Stage 4 Feature Fusion — merges global Perceiver queries with local core kinematics.',
      how: 'Concatenates the flattened 4×192 Perceiver queries (768D) with the raw 144D core vector (912D total), projects to 256D, and applies a Pre-RMSNorm Residual SwiGLU block (256->384->256).',
      why: 'Passing ego angular velocity solely through cross-attention softmax introduces slight smoothing that degrades frame-accurate aerial pitch/roll control.',
      contrib: 'Combined global boost-pad awareness with zero-lag body-frame control responsiveness.',
      science: 'SwiGLU(x) = (SiLU(x W_g) ⊙ x W_u) W_d computes multiplicative second-order interactions between feature channels with superior gradient flow over ReLU/GELU.',
      origins: 'GLU Variants Improve Transformer (Shazeer, 2020).'
    },
    {
      id: 't5', short: '2-Stage Cond-31 Heads',
      title: 'Two-Stage Autoregressive Action-Conditioned Categorical Heads (31 Logits)',
      usedIn: ['stage1_bin', 'stage2_flow'],
      placement: 'Stage 5 Action Decoder — converts the 256D trunk into 7 coordinated discrete controls.',
      how: 'Stage 1 evaluates Jump/Dodge[4] and Boost/Brake[4] from h_trunk. An Action Conditioning Bridge embeds (a_jump, a_boost) into 64D and shifts the trunk via h_dir = RMSNorm(h_trunk + Linear(64->256)) before Stage 2 evaluates Throttle[3], Steer[7], Pitch[5], Yaw[5], and Roll[3].',
      why: 'Independent factorized heads P(a|s) = Π_i P(a_i|s) cannot coordinate multimodal joint actions (e.g., pitching forward for a speedflip only on the exact sample where Dodge fires).',
      contrib: 'Restored autoregressive joint action coordination between binary impulses and rotational axes with only a 64->256 linear bridge.',
      science: 'Autoregressive factorization P(a_J, a_B, a_dir | s) = P(a_J, a_B | h) · Π_{d} P(a_d | h, a_J, a_B) captures cross-head covariance while keeping categorical sampling O(1).',
      origins: 'Vinyals et al. (AlphaStar Autoregressive Action Heads, 2019); precursor to Hex64\'s Stage-1 16-Way Binary + Stage-2 Flow-GRPO SDE.'
    },
    {
      id: 't6', short: 'Skill Aux Head (Z_t)',
      title: 'Compositional Skill Auxiliary Head (8 Macro Families · 32 Sub-Skills)',
      usedIn: ['fsq_bottleneck', 'ppo_grpo_opt'],
      placement: 'Stage 4C Training Auxiliary Branch — attached to h_trunk during training only.',
      how: 'Predicts replay-mined skill labels Z_t: 8 Macro Families, 32 Sub-Skills (PopReset, MaktufReset, StallReset, ZapDash, MustyFlick, BreeziFlick, Speedflip), and a 13D continuous phase/mechanics vector.',
      why: 'Pure reward-driven PPO tends to collapse intermediate hidden representations into homogeneous value predictors, forgetting rare mechanical sub-skills.',
      contrib: 'Forced the 256D trunk to maintain linearly separable representations for 32 advanced Rocket League mechanics.',
      science: 'Multi-task auxiliary representation learning (Jaderberg et al., UNREAL, 2017) regularizes the shared trunk manifold without altering inference latency.',
      origins: 'Mined via the SeqScout WRAcc MCTS replay miner; evolved in Hex64 into the active 8×125=1,000 FSQ bottleneck.'
    },
    {
      id: 't7', short: 'Masks & FlipState FSM',
      title: 'RocketSim Boolean Physics Logit Masking & 8-Subtick FlipState FSM',
      usedIn: ['stage1_bin', 'stage2_flow', 'subtick_exec'],
      placement: 'Stage 5 Execution Boundary — enforces physics validity and 120 Hz jump edges.',
      how: 'Applies -10^8 logit masks when grounded (disabling Pitch/Roll and mapping Yaw->Steer), when boost==0, or when !has_flip. During the 8-subtick (15 Hz) step, a C++/Python FlipState machine forces subtick 0 to jump=0 so subticks 1..4 trigger a rising jump edge.',
      why: 'A 15 Hz policy holds one action for 8 physics ticks (66.7 ms) and therefore cannot release and re-press the jump button within a single policy step without an external edge macro.',
      contrib: 'Pruned invalid exploration states and made 15 Hz double-jumps reliable — while revealing the 15 Hz control bottleneck that Hex64 solved with K_sub=4 (60 Hz) subtick action chunking.',
      science: 'Invalid action masking (Huang & Ontañón, 2020) sets logits of impossible actions to -∞, ensuring policy gradient updates are strictly zero on physically no-op controls.',
      origins: 'Huang & Ontañón (2020) + RocketSim Car::controls state machine.'
    },
    {
      id: 't8', short: '752D Perceiver Critic',
      title: 'Asymmetric 752D ST-Perceiver Critic with 5 Ballistic Bounce Tokens & PopArt',
      usedIn: ['env_nodes', 'priv_ctx', 'critic_heads', 'ppo_grpo_opt'],
      placement: 'Stage 6 Value Estimator — training-only omniscient critic.',
      how: 'Unpacks the 752D state into N=43 tokens (3 Core + 34 Pads + 5 7D Analytical Future Ball Bounce tokens at Δt ∈ {0.1..1.5}s + 1 38D Omniscient Wheel/World-Vel token), runs 2 Perceiver layers (M=4×N=43), and predicts 3 PopArt-normalized horizon values.',
      why: 'Giving the critic explicit spatial tokens for the next 1.5 seconds of wall/floor ball bounces eliminated value estimation lag during backboard reads.',
      contrib: 'Reduced GAE variance across γ ∈ {0.990, 0.995, 0.998} while keeping the deployed actor lightweight.',
      science: 'Asymmetric Actor-Critic (Pinto et al., 2017) + PopArt (van Hasselt et al., 2016) preserve output precision across changing reward scales via W_new = (σ_old/σ_new) W_old.',
      origins: 'Pinto et al. (2017) & van Hasselt et al. (2016); upgraded in Hex64 to Dual-Head 4×51 Symlog HL-Gauss distributional critics.'
    },
    {
      id: 't9', short: 'KL & PopArt Distiller',
      title: 'Exact 7-Head Categorical KL & PopArt Moment Distillation (Gen 2 -> Gen 3)',
      usedIn: ['dma_slice', 'priv_ctx', 'jepa_search'],
      placement: 'Stage 6B Warm-Start Bridge — transfers Gen 2 MLP mastery into Gen 3 ST-Perceiver.',
      how: 'Minimizes the exact analytic sum of per-head categorical KL divergences between the frozen Gen 2 teacher (on 684D) and the Gen 3 student (on 700D, teacher-forcing Stage-1 actions into Stage-2) while copying PopArt (μ, σ) buffers.',
      why: 'Allows major neural architecture upgrades (from flat MLP to relational Perceiver) without losing thousands of GPU-hours of learned mechanical skill.',
      contrib: 'Enabled zero-regression architectural migration from Gen 2 to Gen 3.',
      science: 'Policy Distillation (Rusu et al., 2016) over factorized autoregressive heads decomposes exactly into Σ_h Σ_c P_T(c|s) log(P_T(c|s)/P_S(c|s)).',
      origins: 'Rusu et al. (Policy Distillation, ICLR 2016); implemented in the Gen 2 -> Gen 3 Offline-to-Online Distiller.'
    }
  ],
  externalResources: {
    t0: [
      { badge: 'CVPR 2017', title: 'PointNet: Deep Learning on Point Sets for 3D Classification and Segmentation', authors: 'C. R. Qi et al.', url: 'https://arxiv.org/abs/1612.00593', desc: 'Foundational permutation-equivariant point-set architecture used for the 34 boost pads.' }
    ],
    t1: [
      { badge: 'CVPR 2017', title: 'PointNet: Deep Learning on Point Sets', authors: 'C. R. Qi et al.', url: 'https://arxiv.org/abs/1612.00593', desc: 'Shared-weight entity encoder applied across all 34 boost pad tokens.' }
    ],
    t2: [
      { badge: 'ICML 2021', title: 'Perceiver: General Perception with Iterative Attention', authors: 'A. Jaegle et al. (DeepMind)', url: 'https://arxiv.org/abs/2103.03206', desc: 'Introduces asymmetric cross-attention from M latent queries to N byte/entity inputs.' },
      { badge: 'ICLR 2022', title: 'Perceiver IO: A General Architecture for Structured Inputs & Outputs', authors: 'A. Jaegle et al.', url: 'https://arxiv.org/abs/2107.14795', desc: 'Structured query decoding across heterogeneous entity sets.' }
    ],
    t3: [
      { badge: 'ICML 2023', title: 'Scaling Vision Transformers to 22 Billion Parameters (QK-Norm)', authors: 'M. Dehghani et al. (Google Brain)', url: 'https://arxiv.org/abs/2302.05442', desc: 'Introduces per-head Query-Key Normalization to prevent attention logit growth.' }
    ],
    t4: [
      { badge: 'ARXIV 2020', title: 'GLU Variants Improve Transformer (SwiGLU)', authors: 'N. Shazeer', url: 'https://arxiv.org/abs/2002.05202', desc: 'Introduces Swish-Gated Linear Units used in the Gen 3 core encoder and trunk.' }
    ],
    t5: [
      { badge: 'NATURE 2019', title: 'Grandmaster level in StarCraft II using multi-agent reinforcement learning', authors: 'O. Vinyals et al. (DeepMind)', url: 'https://www.nature.com/articles/s41586-019-1724-z', desc: 'Pioneered autoregressive conditioned action heads in complex multi-head games.' }
    ],
    t6: [
      { badge: 'ICLR 2017', title: 'Reinforcement Learning with Unsupervised Auxiliary Tasks (UNREAL)', authors: 'M. Jaderberg et al.', url: 'https://arxiv.org/abs/1611.05397', desc: 'Demonstrates how auxiliary predictive heads shape shared RL trunk representations.' }
    ],
    t7: [
      { badge: 'FLAIRS 2022', title: 'A Closer Look at Invalid Action Masking in Policy Gradient Algorithms', authors: 'S. Huang & S. Ontañón', url: 'https://arxiv.org/abs/2006.14171', desc: 'Proves that logit masking produces valid policy gradients when actions are physically illegal.' }
    ],
    t8: [
      { badge: 'RSS 2018', title: 'Asymmetric Actor Critic for Image-Based Robot Learning', authors: 'L. Pinto et al.', url: 'https://arxiv.org/abs/1710.06542', desc: 'Trains an omniscient privileged critic alongside a partial-observation actor.' },
      { badge: 'AAAI 2019', title: 'Multi-Task Deep Reinforcement Learning with PopArt', authors: 'M. Hessel, H. van Hasselt et al.', url: 'https://arxiv.org/abs/1809.04474', desc: 'Preserves Outputs Precisely while Adaptively Rescaling Targets across multi-horizon critics.' }
    ],
    t9: [
      { badge: 'ICLR 2016', title: 'Policy Distillation', authors: 'A. A. Rusu et al. (DeepMind)', url: 'https://arxiv.org/abs/1511.06295', desc: 'Transfers knowledge between distinct neural RL architectures via KL divergence.' }
    ]
  },
  mermaidDiagram: `flowchart LR
  subgraph S1["Stage 1: 700D Canonical Obs (15Hz)"]
    N1["01. C++17 Batch Engine"] --> N2["02. 171Dx4 Egocentric Stack (684D)"]
    N1 --> N3["03. 16D 4-Frame Wheel History"]
    N1 -.-> N4["04. 68D Privileged Bounce/Slip Tail"]
  end
  subgraph S2["Stage 2: Entity Unpack & PointNet"]
    N2 & N3 --> N5["05. 144D Core Unpacker (SwiGLU)"]
    N2 --> N6["06. 34x7D Shared BoostPad PointNet"]
  end
  subgraph S3["Stage 3: ST-Perceiver (M=4 x N=37)"]
    N6 --> N7["07. Per-Head Distance/Cooldown Bias"]
    N5 & N6 & N7 --> N8["08. 2L Perceiver Cross-Attention (QK-Norm)"]
  end
  subgraph S4["Stage 4: SwiGLU Trunk & Skill Aux"]
    N8 & N5 --> N9["09. 912D->256D Skip Fusion"]
    N9 --> N10["10. Residual SwiGLU Trunk (256D)"]
    N10 -.-> N11["11. Compositional Skill Z_t (8/32)"]
  end
  subgraph S5["Stage 5: 2-Stage Cond-31 Heads"]
    N10 --> N12["12. Stage-1 Jump[4] & Boost[4]"]
    N12 & N10 --> N13["13. Stage-2 Cond-23 Directional Heads"]
    N13 --> N14["14. 8-Subtick FlipState FSM (15Hz)"]
  end
  subgraph S6["Stage 6: 752D Critic & Distill"]
    N4 -.-> N15["15. 752D ST-Perceiver Critic (N=43)"]
    N10 & N15 -.-> N16["16. Gen2->Gen3 KL & PopArt Distiller"]
    N14 & N15 --> N17["17. Zero-Sum PBRS & PFSP League"]
  end`
};
