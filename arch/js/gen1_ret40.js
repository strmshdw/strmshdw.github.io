// ============================================================================
// LEGACY GEN 1: RET-40 RELATIONAL TRANSFORMER & 120HZ ATTITUDE PD CONTROLLER
// ============================================================================
window.ARASHIKAGE_GEN1_RET40 = {
  id: 'gen1_ret40',
  shortBadge: 'LEGACY GEN 1 // RET-40 + ATTITUDE PD',
  dropdownLabel: 'Gen 1: RET-40 (41×25 · 120Hz PD)',
  identityTitle: '41-Entity RET-40 Transformer & 120 Hz Attitude PD',
  colHeaders: [
    { col: 0, x: 96,  title: 'STAGE 1 // 41×25 POD TOKENS', sub: '100B POD · 1,536B SoA',    color: '#38bdf8' },
    { col: 1, x: 282, title: 'STAGE 2 // AVX2 r_ij BIAS',   sub: '41×41×8 · 53.7KB Block',   color: '#22d3ee' },
    { col: 2, x: 468, title: 'STAGE 3 // 4L RET-40 TRUNK',  sub: 'd=128 · H=4 · SwiGLU',     color: '#a78bfa' },
    { col: 3, x: 654, title: 'STAGE 4 // QUAT & EXPLOITER', sub: 'q*∈S^3 · ω* · 4 Archetypes', color: '#f472b6' },
    { col: 4, x: 840, title: 'STAGE 5 // 120HZ SLERP PD',   sub: 'Geodesic S^3 · Schmitt PD', color: '#fbbf24' },
    { col: 5, x: 1024, title: 'STAGE 6 // 32-QUANTILE CVaR', sub: 'PopArt-3 · Weight Staging', color: '#34d399' }
  ],
  nodes: [
    // --- COLUMN 0: STAGE 1 — C++17 41×25 ENTITY POD & SOA KINEMATICS (x = 96) ---
    {
      id: 'dma_slice', num: '01', col: 0, x: 96, y: 125, w: 162, h: 92,
      title: '41×25 EntityTokenPOD', sub: '100B POD · 6 Cars · Ball · Pads', tag: '4,100B Slice',
      color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t0'],
      role: 'Stage 1 · C++17 41-Entity Token Array (100B EntityTokenPOD × 41)',
      tensor: 'EntityTokenPOD[41] -> X_tokens ∈ R^[B, 41, 25] (4,100 Bytes)',
      formula: 'Slots: [0] Ego | [1..2] Mates | [3..5] Opps | [6] Ball | [7..40] 34 Pads',
      how: 'Packs all 41 arena entities into 100-byte C++ POD structs: 3D position, 3D linear velocity, 3D forward & up unit vectors, 3D angular velocity, boost/timer scalars, 6D one-hot entity type flags, and channel 24 norm_time_to_go.',
      why: 'Represented the pitch as an unordered set of 41 physical objects with zero 1D positional encodings so the policy was permutation-equivariant across cars and pads.',
      contrib: 'Pioneered the entity-token paradigm in rl-bot that later evolved into Hex64\'s 64-entity 5,376B Layout A slice.'
    },
    {
      id: 'dyn_nodes', num: '02', col: 0, x: 96, y: 265, w: 162, h: 92,
      title: '1,536B Kinematics SoA', sub: 'alignas(64) x,y,z,vx,vy,vz', tag: '64-Padded SIMD',
      color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t0', 't1'],
      role: 'Stage 1 · 64-Byte-Aligned Structure-of-Arrays (SoA) SIMD Buffer',
      tensor: 'EntityKinematicsSoA (6 × float[64] = 1,536 Bytes, alignas(64))',
      formula: 'x[64], y[64], z[64], vx[64], vy[64], vz[64] (8-wide __m256)',
      how: 'Transposes the 41 entity positions and velocities into 6 contiguous 64-element float arrays aligned to 64-byte cache lines so 8 entities can be loaded simultaneously into AVX2 256-bit YMM registers.',
      why: 'Computing 41×41 = 1,681 pairwise relative vectors in Array-of-Structs (AoS) layout causes uncoalesced gather stalls on CPU.',
      contrib: 'Allowed the C++ relational extractor to process 8 target entities per SIMD instruction.'
    },
    {
      id: 'env_nodes', num: '03', col: 0, x: 96, y: 405, w: 162, h: 92,
      title: 'Ch-24 Time-To-Go', sub: 'norm_time_to_go · Ball Spin', tag: 'Ballistic Hint',
      color: '#38bdf8', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'mem',
      techIds: ['t0'],
      role: 'Stage 1 · Channel-24 Normalized Time-To-Intercept & Ball Magnus Spin',
      tensor: 'token[i].features[24] = clamp(d_i,ball / max(v_close, 500), 0, 1)',
      formula: 'F_Magnus ∝ ω_ball × v_ball (encoded in Ball token channels 12..14)',
      how: 'Populates feature index 24 on every entity token with its estimated normalized time-to-go and encodes ball angular velocity ω_ball directly into the Ball token.',
      why: 'Gave individual entity tokens an immediate scalar intercept horizon before cross-entity attention ran.',
      contrib: 'Helped early attention layers prioritize the closest challenger to the ball.'
    },
    {
      id: 'priv_ctx', num: '04', col: 0, x: 96, y: 545, w: 162, h: 92,
      title: 'Lockless Seqlock SHM', sub: '64B Aligned · Odd/Even Seq', tag: 'Zero-Lock Telemetry',
      color: '#34d399', modes: ['all', 'live', 'train'], stageGroup: 'mem',
      techIds: ['t9'],
      role: 'Stage 1 · 64-Byte-Aligned Lockless Seqlock Shared Memory Telemetry',
      tensor: 'LocklessTelemetryBuffer (alignas(64) std::atomic<uint64_t> seq)',
      formula: 'Writer: seq.fetch_add(1, release) -> memcpy -> seq.fetch_add(1, release)',
      how: 'Streams step metrics, SPS, and arena states out of the C++ batch engine into a 64-byte-aligned Seqlock shared memory ring buffer without mutex locks.',
      why: 'OS mutexes inside a 120 Hz / 1,024-arena OpenMP hot loop cause severe thread convoying.',
      contrib: 'Established the lock-free Seqlock telemetry design that Hex64 expanded into the 256 KB Hex64TelemetrySharedMemory plane.'
    },

    // --- COLUMN 1: STAGE 2 — AVX2 PAIRWISE RELATIONAL TENSOR & HOISTED BIAS (x = 282) ---
    {
      id: 'gpu_edges', num: '05', col: 1, x: 282, y: 205, w: 162, h: 96,
      title: 'AVX2 41×41×8 r_ij', sub: '53,792B POD · rsqrt_ps NR', tag: '1,681 Pairs CPU',
      color: '#22d3ee', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'edges',
      techIds: ['t1'],
      role: 'Stage 2A · C++ AVX2 Intrinsics Pairwise Relational Tensor (53.7 KB/Arena)',
      tensor: 'RelationalTensorBlockPOD: r_ij ∈ R^[B, 41, 41, 8] (53,792 Bytes)',
      formula: 'inv_d = _mm256_rsqrt_ps(d2) · (1.5 - 0.5 · d2 · inv_d^2)',
      how: 'Executes ComputeRelationalTensorAVX2 in C++ across all 41×41 = 1,681 entity pairs, computing 8 pairwise physics features: Δp_xyz / 6000, Euclidean distance ||Δp|| / 6000 (via fast AVX2 reciprocal square root + 1 Newton-Raphson step), Δv_xyz / 2300, and closing speed.',
      why: 'Provided explicit pairwise 3D geometry to every attention head — though transferring 53,792B per arena over PCIe became a bandwidth bottleneck that Hex64 solved by computing pairwise biases on-chip on the GPU.',
      contrib: 'Gave the RET-40 transformer exact relative kinematics for all 1,681 entity pairs.'
    },
    {
      id: 'bipartite_enc', num: '06', col: 1, x: 282, y: 365, w: 162, h: 96,
      title: 'Hoisted mlp_rel Bias', sub: '8->16->4 Shared Across 4L', tag: '4× FLOP Savings',
      color: '#22d3ee', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'edges',
      techIds: ['t1', 't2'],
      role: 'Stage 2B · Trunk-Hoisted Relational Attention Bias Projector (mlp_rel)',
      tensor: 'r_ij[B,41,41,8] -> Linear(8,16)+GELU+Linear(16,4) -> B_rel[B,4,41,41]',
      formula: 'Computed ONCE per step and reused across all L = 4 Transformer layers',
      how: 'Projects the [B, 41, 41, 8] relational tensor through a 2-layer MLP (8 -> 16 -> H=4 heads) once at the start of the forward pass and broadcasts the resulting [B, 4, 41, 41] additive bias into all 4 RelationalAttentionBlocks.',
      why: 'Evaluating mlp_rel separately inside each of the 4 layers on 1,681 pairs consumed 60% of total forward-pass time; hoisting it to the trunk cut relational projection FLOPs by 4×.',
      contrib: 'Made 4-layer 41×41 relational attention viable inside a 1,024-arena CUDA Graph rollout.'
    },

    // --- COLUMN 2: STAGE 3 — 4-LAYER RELATIONAL TRANSFORMER RET-40 (x = 468) ---
    {
      id: 'titans_prior', num: '07', col: 2, x: 468, y: 205, w: 162, h: 96,
      title: '4L RET-40 Attention', sub: 'd=128 · H=4 · Key Mask -10^9', tag: 'Zero Pos-Encoding',
      color: '#a78bfa', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t2'],
      role: 'Stage 3A · 4-Layer Permutation-Equivariant Relational Attention Trunk',
      tensor: 'H^(l) = Attn(LN(H^(l-1)), B_rel, mask_41) + SwiGLU(LN(·)) ∈ R^[B,41,128]',
      formula: 'A_ij = softmax((Q_i K_j^T)/√32 + B_rel,ij + M_pad,j)',
      how: 'Runs 4 RelationalAttentionBlocks (d_model=128, H=4, d_head=32) with Pre-LayerNorm, SwiGLU FFNs (hidden=256), and zero positional encodings. Absent cars in 1v1/2v2 and depleted pads are masked with -10^9.',
      why: 'Allowed the exact same 1.22M-parameter network weights to handle 1v1, 2v2, and 3v3 matches by simply toggling the 41-element boolean entity mask.',
      contrib: 'Proved out permutation-equivariant multi-car attention + SwiGLU in rl-bot.'
    },
    {
      id: 'titans_mem', num: '08', col: 2, x: 468, y: 365, w: 162, h: 96,
      title: '256D Ego+Global Pool', sub: 'h_ego[128] || c_global[128]', tag: 'Mask-Aware Mean',
      color: '#a78bfa', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t2'],
      role: 'Stage 3B · Mask-Aware Global Context Pooling & Ego Token Concatenation',
      tensor: 'fused_context = Concat(h_0, (Σ_j m_j h_j)/max(Σ_j m_j, 1)) ∈ R^[B, 256]',
      formula: 'h_0 = H^(4)[:, 0, :] (Ego Token), c_global = MaskedMean(H^(4))',
      how: 'Extracts the processed Ego Car token h_0 ∈ R^128 (slot 0) and concatenates it with the mask-aware mean pool c_global ∈ R^128 across all active arena tokens to form the 256D fused_context.',
      why: 'Combined ego-centric readiness (h_0) with global team/pad summary statistics (c_global) for downstream control and critic heads.',
      contrib: 'Supplied a unified 256D representation to the quaternion motor heads, exploiter heads, and PopArt/CVaR critics.'
    },

    // --- COLUMN 3: STAGE 4 — CONTINUOUS QUATERNION, JUMP & EXPLOITER HEADS (x = 654) ---
    {
      id: 'coconut_loop', num: '09', col: 3, x: 654, y: 150, w: 162, h: 92,
      title: 'Target Quat & ω* Head', sub: 'q* ∈ S^3 · ω* ∈ [-5.5,5.5]^3', tag: 'SO(3) Setpoint',
      color: '#f472b6', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t3', 't4'],
      role: 'Stage 4A · Continuous 3D Attitude Quaternion & Angular Velocity Setpoint Heads',
      tensor: 'q* = u / max(||u||_2, 1e-6) ∈ S^3, ω* = 5.5 · tanh(z_ω) ∈ R^3',
      formula: 'log_std = -2.0 + 0.5 · (2.5 - (-2.0)) · (tanh(raw) + 1)',
      how: 'Rather than outputting raw pitch/yaw/roll torques directly, the actor outputs a desired 3D target attitude unit quaternion q* = (w,x,y,z) ∈ S^3 and target angular velocity ω* ∈ [-5.5, 5.5]^3 rad/s, with smooth sigmoidal bounded log_std.',
      why: 'Early RL policies struggled to stabilize mid-air pitch/roll torques directly; commanding a target 3D orientation q* let a high-rate 120 Hz PD loop handle rotational damping.',
      contrib: 'Achieved instant aerial attitude stabilization in early training, though later retired in Gen 2 because the PD loop fought flip-reset stalls.'
    },
    {
      id: 'soft_moe', num: '10', col: 3, x: 654, y: 295, w: 162, h: 92,
      title: 'Bernoulli Jump & Gates', sub: 'b_0 = -3.80 (p=0.022) · 3 Gates', tag: 'Anti-Spam Prior',
      color: '#f472b6', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'titans',
      techIds: ['t3'],
      role: 'Stage 4B · 1-Logit BernoulliJumpHead & Discrete Boost/Handbrake/Dodge Gates',
      tensor: 'logit_jump ∈ R^[B, 1] (bias = -3.80), gates ∈ R^[B, 3]',
      formula: 'p_jump(0) = σ(-3.80) ≈ 0.0219 (prevents early jump-spamming)',
      how: 'Separates jump initiation into a dedicated 1-logit BernoulliJumpHead initialized with bias b_0 = -3.80 (initial jump probability ~2.2%) alongside 3 discrete gate logits for [boost, handbrake, dodge] and surface [throttle, steer].',
      why: 'Standard 0-bias initialization causes untrained agents to jump 50% of ticks, causing uncontrolled airborne drift.',
      contrib: 'Kept early-stage agents grounded long enough to learn driving and ball striking.'
    },
    {
      id: 'fsq_bottleneck', num: '11', col: 3, x: 654, y: 440, w: 162, h: 92,
      title: '4 Exploiter Heads', sub: 'Denial · Demo · Aerial · Starve', tag: 'Archetype Heads',
      color: '#f472b6', modes: ['all', 'train'], stageGroup: 'titans',
      techIds: ['t8'],
      role: 'Stage 4C · 4 Multi-Archetype NeuralExploiterPolicyHead Branches',
      tensor: '4 × (256 -> 128 -> 12D Action) + Archetype Intrinsic Rewards',
      formula: 'Archetypes: BALL_DENIAL | DEMOLITION | AERIAL_MECHANICS | BOOST_STARVATION',
      how: 'Attaches 4 specialized exploiter policy heads to the 256D trunk, each paired with an intrinsic reward generator (e.g., supersonic closing speed to opponent car for DEMOLITION, big-pad steals in opponent half for BOOST_STARVATION).',
      why: 'Forced the main agent to defend against extreme specialist playstyles (heavy demo chasers, boost starvers, aerial freestylers). (Hex64 later internalized this via 8×2 Soft-MoE specialist experts).',
      contrib: 'Hardened the policy against degenerate local optima and extreme adversarial styles.'
    },

    // --- COLUMN 4: STAGE 5 — 120HZ GEODESIC SLERP & ATTITUDE PD CORTEX (x = 840) ---
    {
      id: 'stage1_bin', num: '12', col: 4, x: 840, y: 150, w: 162, h: 92,
      title: 'Geodesic SLERP Gen', sub: 'S^3 Great-Circle Interpolation', tag: 'Antipodal Safe',
      color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t4', 't5'],
      role: 'Stage 5A · Geodesic S^3 Spherical Linear Interpolation (SLERP) Waypoint Generator',
      tensor: 'q_ref(τ) = SLERP(q_current, q̃*, τ) ∈ S^3 across 120 Hz ticks',
      formula: 'q̃* = sign(<q*, q_curr>) · q* (shortest great-circle arc on S^3)',
      how: 'Flips the target quaternion q* if its inner product with current car attitude q_curr is negative (solving the q ≡ -q double-cover unwinding bug) and interpolates smooth intermediate reference quaternions along the S^3 geodesic.',
      why: 'Feeding a 180° step-change quaternion directly into a high-gain PD controller saturates actuators and induces high-frequency oscillation.',
      contrib: 'Generated smooth, shortest-path rotational trajectories at 120 Hz.'
    },
    {
      id: 'stage2_flow', num: '13', col: 4, x: 840, y: 295, w: 162, h: 92,
      title: '120Hz Attitude PD', sub: 'Kp=(5,5,1.8) · Kd=(0.65,0.65,0.22)', tag: 'Column-Basis Err',
      color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t5'],
      role: 'Stage 5B · Vectorized 120 Hz Nonlinear Attitude PD + Feedforward Controller',
      tensor: 'u_pyr = clip(Kp·e_rot - Kd·(ω_local - Kff·ω*), -1, 1) ∈ [-1, 1]^3',
      formula: 'e_pitch = atan2(f*·u, f*·f), e_yaw = atan2(f*·r, f*·f), e_roll = atan2(r*·u, u*·u)',
      how: 'Computes exact body-local pitch, yaw, and roll angle errors from the column basis vectors (f, r, u) of R(q) and R(q̃*), applies proportional-derivative + angular-velocity feedforward gains, and zeroes micro-oscillations inside a 0.04 rad Schmitt-trigger deadband.',
      why: 'Closed the control loop at the full 120 Hz physics rate while the heavy RET-40 transformer ran at 15–30 Hz.',
      contrib: 'Delivered damped, zero-overshoot aerial aiming, though its restorative torque resisted intentional flip-reset stalls (inspiring Gen 2/3 direct heads and Hex64 60 Hz Flow-GRPO).'
    },
    {
      id: 'subtick_exec', num: '14', col: 4, x: 840, y: 440, w: 162, h: 92,
      title: 'Dodge Override Gate', sub: 'PD Bypass During Active Dodge', tag: 'Impulse Lock',
      color: '#fbbf24', modes: ['all', 'live', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t5'],
      role: 'Stage 5C · Active Dodge & Grounded Surface Control Multiplexer',
      tensor: '[throttle, steer, pitch, yaw, roll, jump, boost, handbrake] @ 120 Hz',
      formula: 'If dodge_gate > 0: bypass Attitude PD -> emit directional dodge flick',
      how: 'Multiplexes the 120 Hz Attitude PD rotational outputs with ground [throttle, steer] and overrides PD damping whenever the discrete dodge gate fires so the car can execute directional flips.',
      why: 'Without a bypass gate, an attitude PD controller immediately tries to counter-torque a diagonal dodge.',
      contrib: 'Bridged continuous SO(3) attitude control with discrete RocketSim dodge impulses.'
    },

    // --- COLUMN 5: STAGE 6 — 32-QUANTILE CVaR CRITIC & WEIGHT STAGING (x = 1024) ---
    {
      id: 'critic_heads', num: '15', col: 5, x: 1024, y: 150, w: 162, h: 92,
      title: '3-Horizon PopArt Critic', sub: 'γ ∈ {0.95, 0.98, 0.995}', tag: 'MultiHorizonCritic',
      color: '#34d399', modes: ['all', 'train', 'distill'], stageGroup: 'control',
      techIds: ['t6'],
      role: 'Stage 6A · 3-Horizon PopArt Value Critic (Short, Medium, Long)',
      tensor: 'fused_context[256] -> v_norm ∈ R^[B, 3] (γ = 0.95, 0.98, 0.995)',
      formula: 'A_t^total = w_1 A_t^(0.95) + w_2 A_t^(0.98) + w_3 A_t^(0.995)',
      how: 'Projects the 256D fused_context into 3 PopArt-normalized scalar value heads tracking short-term mechanical touches (γ=0.95), medium-term tactical outplays (γ=0.98), and long-term goal outcomes (γ=0.995).',
      why: 'Single-horizon γ=0.995 critics drown out immediate aerial touch feedback in long-horizon goal variance.',
      contrib: 'Established the multi-horizon value decomposition that Hex64 expanded into the 4×51 Symlog HL-Gauss critic.'
    },
    {
      id: 'jepa_search', num: '16', col: 5, x: 1024, y: 295, w: 162, h: 92,
      title: '32-Quantile CVaR Head', sub: 'Softplus Δq · β(s) ∈ [0.05,0.95]', tag: 'Risk-Sensitive',
      color: '#34d399', modes: ['all', 'live', 'train'], stageGroup: 'control',
      techIds: ['t7'],
      role: 'Stage 6B · 32-Quantile Monotonic Distributional Critic & Dynamic CVaR_β',
      tensor: 'θ_k = θ_1 + Σ_{j=2}^k softplus(Δ_j) ∈ R^[B, 32], CVaR_β = E[q | τ <= β]',
      formula: 'L_QR(u) = Σ_k |τ_k - I(u < 0)| · L_κ(u), τ_k = (2k - 1)/64',
      how: 'Predicts N=32 strictly non-decreasing return quantiles via cumulative softplus deltas and integrates the lower tail up to the actor\'s dynamic risk preference β(s) ∈ [0.05, 0.95] (playing conservatively when winning or last-man back).',
      why: 'Prevented quantile crossing by construction and introduced risk-sensitive CVaR optimization to the platform (which Hex64 later paired with Best-of-16 JEPA world-model search).',
      contrib: 'Enabled score-and-clock-aware risk management.'
    },
    {
      id: 'ppo_grpo_opt', num: '17', col: 5, x: 1024, y: 440, w: 162, h: 92,
      title: 'CUDA Graph Staging', sub: 'E=1024 Static Graph · <5.56ms', tag: 'Zero-Alloc Copy',
      color: '#34d399', modes: ['all', 'train'], stageGroup: 'control',
      techIds: ['t8', 't9'],
      role: 'Stage 6C · StaticCUDAPolicyRunner (E=1024) & InPlaceWeightStagingEngine',
      tensor: 'torch.cuda.CUDAGraph (E=1024) + In-Place param.data.copy_ (< 5.56 ms)',
      formula: 'Zero pointer changes -> CUDAGraph remains valid across PPO updates',
      how: 'Captures the entire E=1024 RET-40 forward pass and quantile critic into a static CUDA Graph and updates rollout weights after each PPO epoch via in-place tensor buffer copies without invalidating captured graph memory addresses.',
      why: 'Re-capturing a CUDA Graph after every PPO gradient step takes hundreds of milliseconds and leaks GPU memory pools.',
      contrib: 'Pioneered the static-shape CUDA Graph execution discipline carried forward across all subsequent generations.'
    }
  ],
  edges: [
    // Col 0 -> Col 1
    { from: 'dma_slice', to: 'dyn_nodes', label: 'Transpose SoA', modes: ['all','live','train','distill'] },
    { from: 'dma_slice', to: 'env_nodes', label: 'Ch-24 t_go', modes: ['all','live','train','distill'] },
    { from: 'dma_slice', to: 'priv_ctx', label: 'Step Metrics', modes: ['all','live','train'], dashed: true },
    { from: 'dyn_nodes', to: 'gpu_edges', label: '6×float[64] YMM', modes: ['all','live','train','distill'] },
    { from: 'gpu_edges', to: 'bipartite_enc', label: 'r_ij [41,41,8]', modes: ['all','live','train','distill'] },
    // Col 1 -> Col 2
    { from: 'dma_slice', to: 'titans_prior', label: 'Tokens [41,25]', modes: ['all','live','train','distill'] },
    { from: 'env_nodes', to: 'titans_prior', label: 'Ball Spin/t_go', modes: ['all','live','train','distill'] },
    { from: 'bipartite_enc', to: 'titans_prior', label: 'Hoisted B_rel', modes: ['all','live','train','distill'] },
    { from: 'titans_prior', to: 'titans_mem', label: 'H^(4) [41,128]', modes: ['all','live','train','distill'] },
    // Col 2 -> Col 3
    { from: 'titans_mem', to: 'coconut_loop', label: 'Fused [256D]', modes: ['all','live','train','distill'] },
    { from: 'titans_mem', to: 'soft_moe', label: 'Fused [256D]', modes: ['all','live','train','distill'] },
    { from: 'titans_mem', to: 'fsq_bottleneck', label: 'Fused [256D]', modes: ['all','train'], dashed: true },
    // Col 3 -> Col 4
    { from: 'coconut_loop', to: 'stage1_bin', label: 'q* ∈ S^3', modes: ['all','live','train','distill'] },
    { from: 'stage1_bin', to: 'stage2_flow', label: 'q_ref(τ) @120Hz', modes: ['all','live','train','distill'] },
    { from: 'coconut_loop', to: 'stage2_flow', label: 'ω* Feedforward', modes: ['all','live','train','distill'] },
    { from: 'stage2_flow', to: 'subtick_exec', label: 'u_pyr [-1,1]^3', modes: ['all','live','train','distill'] },
    { from: 'soft_moe', to: 'subtick_exec', label: 'Jump & Gates', modes: ['all','live','train','distill'] },
    // Col 2/3/4 -> Col 5
    { from: 'titans_mem', to: 'critic_heads', label: 'Fused [256D]', modes: ['all','train','distill'] },
    { from: 'titans_mem', to: 'jepa_search', label: 'Fused + β(s)', modes: ['all','live','train'] },
    { from: 'critic_heads', to: 'ppo_grpo_opt', label: '3-Horizon GAE', modes: ['all','train'] },
    { from: 'jepa_search', to: 'ppo_grpo_opt', label: 'CVaR_β Advantage', modes: ['all','train'], dashed: true },
    { from: 'fsq_bottleneck', to: 'ppo_grpo_opt', label: '4 Exploiter Rollouts', modes: ['all','train'], dashed: true }
  ],
  scenarios: {
    tour: {
      label: 'GEN 1 END-TO-END CYCLE TOUR',
      steps: [
        {
          title: '41×25 EntityTokenPOD & 1,536B SIMD Kinematics SoA',
          focusNode: 'dma_slice', highlight: ['dma_slice', 'dyn_nodes', 'env_nodes'], techId: 't0',
          desc: 'C++ packs all 41 arena entities (1 Ego, 2 Mates, 3 Opps, 1 Ball, 34 Boost Pads) into 100-byte POD structs and transposes positions/velocities into a 64-byte-aligned Structure-of-Arrays (SoA) buffer.'
        },
        {
          title: 'AVX2 41×41×8 Pairwise Relational Tensor & Hoisted Bias',
          focusNode: 'gpu_edges', highlight: ['dyn_nodes', 'gpu_edges', 'bipartite_enc'], techId: 't1',
          desc: 'ComputeRelationalTensorAVX2 evaluates 8 pairwise kinematic features across all 1,681 entity pairs using 8-wide AVX2 intrinsics. A trunk-hoisted mlp_rel projects r_ij into 4 attention-head bias maps once per step.'
        },
        {
          title: '4-Layer Relational Transformer RET-40 (d=128, SwiGLU)',
          focusNode: 'titans_prior', highlight: ['bipartite_enc', 'titans_prior', 'titans_mem'], techId: 't2',
          desc: 'Four permutation-equivariant RelationalAttentionBlocks process the 41 tokens with zero positional encodings, concatenating the Ego token h_0 (128D) and mask-aware global mean pool c_global (128D) into a 256D vector.'
        },
        {
          title: 'Target Quaternion q* ∈ S^3, ω* & BernoulliJumpHead',
          focusNode: 'coconut_loop', highlight: ['coconut_loop', 'soft_moe'], techId: 't3',
          desc: 'The actor predicts a continuous target 3D attitude quaternion q* ∈ S^3, target angular velocity ω* ∈ [-5.5, 5.5]^3, and a 1-logit BernoulliJumpHead initialized at b_0 = -3.80 (p ≈ 0.022).'
        },
        {
          title: '4 Multi-Archetype Neural Exploiter Heads',
          focusNode: 'fsq_bottleneck', highlight: ['titans_mem', 'fsq_bottleneck'], techId: 't8',
          desc: 'During league training, 4 specialist exploiter heads (BALL_DENIAL, DEMOLITION, AERIAL_MECHANICS, BOOST_STARVATION) train on archetype-specific intrinsic rewards.'
        },
        {
          title: '120 Hz Geodesic SLERP & Nonlinear Attitude PD Cortex',
          focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow', 'subtick_exec'], techId: 't5',
          desc: 'At 120 Hz, SlerpTrajectoryGenerator interpolates shortest-arc waypoints on S^3 and VectorizedAttitudePD converts column-basis angle errors into [pitch, yaw, roll] torques with a 0.04 rad Schmitt-trigger deadband.'
        },
        {
          title: '3-Horizon PopArt, 32-Quantile CVaR_β & Weight Staging',
          focusNode: 'jepa_search', highlight: ['critic_heads', 'jepa_search', 'ppo_grpo_opt'], techId: 't7',
          desc: 'MultiHorizonPopArtCritic and the 32-quantile MonotonicQuantileCriticHead evaluate risk-sensitive CVaR_β(s) inside an E=1024 static CUDA Graph updated via <5.56 ms in-place weight staging.'
        }
      ]
    },
    bounce: {
      label: 'SCENARIO 1: AVX2 PAIRWISE INTERCEPT',
      steps: [
        {
          title: '8-Wide AVX2 Pairwise Distance & Closing Speed',
          focusNode: 'gpu_edges', highlight: ['dyn_nodes', 'gpu_edges'], techId: 't1',
          desc: 'For all 41×41 pairs, C++ computes Δp/6000, fast rsqrt_ps Euclidean distance, and relative closing velocity in 256-bit YMM registers.'
        },
        {
          title: 'Trunk-Hoisted mlp_rel Injects Spatial Bias into All 4 Layers',
          focusNode: 'bipartite_enc', highlight: ['gpu_edges', 'bipartite_enc', 'titans_prior'], techId: 't2',
          desc: 'The 8D pairwise vector projects to 4 head biases B_rel[B,4,41,41] once and guides all 4 RET-40 layers.'
        },
        {
          title: 'Why Hex64 Moved Pairwise Bias from CPU AVX2 to Fused GPU',
          focusNode: 'gpu_edges', highlight: ['dma_slice', 'gpu_edges'], techId: 't1',
          desc: 'In Gen 1, transferring 41×41×8 floats (53.7 KB/arena) from CPU to GPU cost 220 MB/step at 4,096 arenas — motivating Hex64 to transfer only the 5,376B entity slice and compute 16×64×72D biases on-chip on the GPU.'
        },
        {
          title: 'Target Quaternion Aims Car Nose at Intercept Point',
          focusNode: 'coconut_loop', highlight: ['titans_mem', 'coconut_loop', 'stage2_flow'], techId: 't3',
          desc: 'The quaternion head outputs q* aligned with the aerial intercept vector, and the 120 Hz PD loop rotates the car onto target.'
        }
      ]
    },
    aerial: {
      label: 'SCENARIO 2: 120HZ SLERP & PD AERIAL',
      steps: [
        {
          title: 'Antipodal Hemisphere Alignment (q̃* = sign(<q*,q>)·q*)',
          focusNode: 'stage1_bin', highlight: ['coconut_loop', 'stage1_bin'], techId: 't4',
          desc: 'Because q and -q represent the exact same 3D rotation in SO(3), SlerpTrajectoryGenerator checks the 4D dot product and flips q* if negative so the car never unwinds 360° the wrong way.'
        },
        {
          title: 'Column-Basis Angle Error Extraction',
          focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow'], techId: 't5',
          desc: 'VectorizedAttitudePD extracts body-local pitch, yaw, and roll errors via atan2 projections of the target forward/right/up basis vectors onto the current car axes.'
        },
        {
          title: 'Schmitt-Trigger Deadband (0.04 rad) Prevents Chatter',
          focusNode: 'stage2_flow', highlight: ['stage2_flow', 'subtick_exec'], techId: 't5',
          desc: 'Once error drops below 0.04 rad and angular velocity is damped, the Schmitt trigger zeroes torques to eliminate high-frequency limit-cycle chatter.'
        },
        {
          title: 'Why Attitude PD Was Retired in Gen 2/3 & Hex64',
          focusNode: 'subtick_exec', highlight: ['stage2_flow', 'subtick_exec'], techId: 't5',
          desc: 'During flip-reset stalls and Musty flicks, the PD controller treated intentional stall torques as attitude errors and fought the policy — leading to direct neural subtick control in later generations.'
        }
      ]
    },
    fake: {
      label: 'SCENARIO 3: 4 NEURAL EXPLOITER HEADS',
      steps: [
        {
          title: 'Shared 256D RET-40 Trunk Feeds 4 Specialist Heads',
          focusNode: 'fsq_bottleneck', highlight: ['titans_mem', 'fsq_bottleneck'], techId: 't8',
          desc: 'Four distinct 256->128->12D NeuralExploiterPolicyHeads branch off the shared RET-40 trunk.'
        },
        {
          title: 'DEMOLITION & BOOST_STARVATION Intrinsic Rewards',
          focusNode: 'fsq_bottleneck', highlight: ['fsq_bottleneck', 'ppo_grpo_opt'], techId: 't8',
          desc: 'The Demolition head receives dense closing-speed bonuses toward opponent cars at supersonic speed, while Boost Starvation is rewarded for denying 100-pads in the opponent half.'
        },
        {
          title: 'Main Policy Learns Evasion & Low-Boost Defense',
          focusNode: 'titans_prior', highlight: ['titans_prior', 'titans_mem'], techId: 't2',
          desc: 'Playing against the 4 exploiter archetypes forces the RET-40 attention layers to track incoming demo threats even when the ball is elsewhere.'
        },
        {
          title: 'Evolution into Hex64\'s Static 8×2 Soft-MoE',
          focusNode: 'fsq_bottleneck', highlight: ['fsq_bottleneck'], techId: 't8',
          desc: 'Rather than keeping 4 separate outer policy heads, Hex64 internalized specialization inside the trunk via 8 static-shape Soft-MoE experts.'
        }
      ]
    },
    save: {
      label: 'SCENARIO 4: 32-QUANTILE CVaR RISK SHIFT',
      steps: [
        {
          title: 'Monotonic 32-Quantile Return Distribution',
          focusNode: 'jepa_search', highlight: ['titans_mem', 'jepa_search'], techId: 't7',
          desc: 'MonotonicQuantileCriticHead predicts 32 strictly non-decreasing return quantiles θ_1 <= θ_2 <= ... <= θ_32 using cumulative softplus increments.'
        },
        {
          title: 'Dynamic Risk Preference β(s) ∈ [0.05, 0.95]',
          focusNode: 'coconut_loop', highlight: ['coconut_loop', 'jepa_search'], techId: 't7',
          desc: 'When defending a 1-goal lead in the final 30 seconds, the actor lowers β(s) -> 0.15 to focus on the worst 15% tail outcomes.'
        },
        {
          title: 'Vectorized Trapezoidal CVaR_β Integration',
          focusNode: 'jepa_search', highlight: ['jepa_search', 'ppo_grpo_opt'], techId: 't7',
          desc: 'Trapezoidal quantile integration evaluates the conditional expectation over τ ∈ [0, β(s)] without Python loops inside the captured CUDA Graph.'
        },
        {
          title: 'Evolution into Hex64\'s Best-of-16 JEPA + CVaR Search',
          focusNode: 'jepa_search', highlight: ['jepa_search'], techId: 't7',
          desc: 'Hex64 combined Gen 1\'s CVaR tail-risk objective with a Dual-Stream JEPA latent world model to score 16 candidate action chunks at test time.'
        }
      ]
    }
  },
  techLibrary: [
    {
      id: 't0', short: '41×25 EntityTokenPOD',
      title: '41-Entity Permutation-Equivariant Token Representation & 1,536B SoA',
      usedIn: ['dma_slice', 'dyn_nodes', 'env_nodes'],
      placement: 'Stage 1 C++ Observation Builder — 41-Entity POD & SIMD Structure-of-Arrays Boundary.',
      how: 'Encodes 1 Ego car, 2 Teammates, 3 Opponents, 1 Ball, and 34 Boost Pads as 41 × 25-float tokens (100B POD each) with 6D one-hot type flags and channel-24 norm_time_to_go, plus a 64-byte-aligned 1,536B Structure-of-Arrays buffer.',
      why: 'Allowed a single network architecture to represent 1v1, 2v2, and 3v3 arenas without changing input dimensions or relying on arbitrary car slot ordering.',
      contrib: 'Established the entity-centric representation philosophy of the platform.',
      science: 'A function f(P X) = P f(X) is permutation-equivariant over entity rows when positional encodings are omitted and entity identity is carried by type embeddings.',
      origins: 'Deep Sets (Zaheer et al., 2017) & Entity-Based RL (OpenAI Five / AlphaStar).'
    },
    {
      id: 't1', short: 'AVX2 41×41×8 r_ij',
      title: 'C++ AVX2 Intrinsics Pairwise Relational Extractor & Trunk-Hoisted mlp_rel',
      usedIn: ['dyn_nodes', 'gpu_edges', 'bipartite_enc'],
      placement: 'Stage 2 Relational Geometry — bridges C++ SoA kinematics and RET-40 attention.',
      how: 'Uses 8-wide __m256 AVX2 intrinsics (_mm256_rsqrt_ps + Newton-Raphson refinement) to compute [Δp, ||Δp||, Δv, v_close] across all 1,681 pairs (53,792B), then projects 8->16->4 once per step via trunk-hoisted mlp_rel.',
      why: 'Attention dot products Q_i K_j^T in world coordinates do not directly compute Euclidean distances ||p_i - p_j||_2; explicit pairwise r_ij biases give exact spatial geometry.',
      contrib: 'Cut relational bias compute by 4× via trunk hoisting while inspiring Hex64\'s on-chip GPU pairwise kernel.',
      science: 'One Newton-Raphson step y_{n+1} = y_n (1.5 - 0.5 x y_n^2) on _mm256_rsqrt_ps achieves ~22 bits of mantissa precision in 3 CPU cycles.',
      origins: 'C++ AVX2 Pairwise Relational Extractor + Shaw et al. (Relative Position Representations, NAACL 2018).'
    },
    {
      id: 't2', short: 'RET-40 Transformer',
      title: '4-Layer Relational Entity Transformer (RET-40, d=128, H=4, SwiGLU)',
      usedIn: ['bipartite_enc', 'titans_prior', 'titans_mem'],
      placement: 'Stage 3 Policy & Critic Backbone — 4-Layer Relational Transformer (1.22M Params).',
      how: 'Stacks 4 Pre-LayerNorm RelationalAttentionBlocks (d=128, H=4, SwiGLU FFN d_ff=256) with additive pairwise relational bias B_rel and boolean key padding masks, pooling h_0 || c_global into 256D.',
      why: 'Enabled joint relational reasoning across cars, ball, and all 34 boost pads.',
      contrib: 'Validated relational transformers + SwiGLU in RocketSim before Hex64 introduced asymmetric 16×64 Bipartite Differential Attention.',
      science: 'Relational Self-Attention A_ij = softmax(q_i^T k_j / √d + ϕ(r_ij)) conditions message passing on SE(3) pairwise invariants.',
      origins: 'Zambaldi et al. (DeepMind Relational Deep RL, ICLR 2019).'
    },
    {
      id: 't3', short: 'Quat q* & Jump Prior',
      title: 'Target Attitude Quaternion Head (q* ∈ S^3) & BernoulliJumpHead (b_0 = -3.80)',
      usedIn: ['coconut_loop', 'soft_moe'],
      placement: 'Stage 4A/B Action Heads — outputs high-level attitude setpoints and impulse gates.',
      how: 'Normalizes a 4D linear output onto the unit 3-sphere S^3 (q* = u/||u||), bounds target angular velocity ω* ∈ [-5.5, 5.5]^3, bounds log_std via smooth tanh scaling [-2.0, 2.5], and initializes the 1-logit jump head bias to -3.80.',
      why: 'Decoupled 15 Hz high-level orientation planning from 120 Hz low-level rotational stabilization while preventing early random jump-spamming.',
      contrib: 'Allowed rapid early-stage aerial orientation learning.',
      science: 'Unit quaternions S^3 ⊂ R^4 provide a singularity-free double cover of SO(3), avoiding Euler-angle gimbal lock at ±90° pitch.',
      origins: 'Continuous SO(3) Attitude Setpoint & Anti-Spam Bernoulli Jump Heads.'
    },
    {
      id: 't4', short: 'Geodesic S^3 SLERP',
      title: 'Antipodal-Safe Geodesic S^3 Spherical Linear Interpolation (SLERP)',
      usedIn: ['coconut_loop', 'stage1_bin'],
      placement: 'Stage 5A Trajectory Generator — 120 Hz Geodesic Quaternion Interpolator.',
      how: 'Enforces shortest-path hemisphere alignment q̃* = sign(<q*, q_curr>)·q* and evaluates constant-angular-velocity waypoints along the S^3 great-circle arc at 120 Hz.',
      why: 'Without antipodal sign alignment, a policy commanding q* near -q_curr forces the PD controller to spin the car 350° instead of 10°.',
      contrib: 'Guaranteed minimum-time, zero-unwinding rotational trajectories.',
      science: 'SLERP(q_0, q_1, τ) = (sin((1-τ)Ω)/sin Ω) q_0 + (sin(τΩ)/sin Ω) q_1 traces the Riemannian geodesic on S^3 with constant speed Ω = arccos(|<q_0, q_1>|).',
      origins: 'Shoemake (Animating Rotation with Quaternion Curves, SIGGRAPH 1985).'
    },
    {
      id: 't5', short: '120Hz Attitude PD',
      title: 'Vectorized 120 Hz Nonlinear Attitude PD + Feedforward & Schmitt Deadband',
      usedIn: ['stage1_bin', 'stage2_flow', 'subtick_exec'],
      placement: 'Stage 5B/C Low-Level Motor Cortex — runs at 120 Hz inside the physics loop.',
      how: 'Computes local pitch/yaw/roll errors from rotation matrix column basis vectors, applies Kp=(5.0, 5.0, 1.8), Kd=(0.65, 0.65, 0.22), Kff=(0.08, 0.08, 0.03), and zeroes chatter inside a 0.04 rad Schmitt-trigger deadband.',
      why: 'Provided 120 Hz closed-loop rotational damping when the neural policy only stepped at 15 Hz.',
      contrib: 'Stabilized aerial flight in Gen 1, while teaching the key lesson that led to Hex64: advanced flip-reset stalls require direct 60 Hz neural subtick control rather than a restorative PD loop.',
      science: 'Geometric attitude control on SO(3) (Lee et al., CDC 2010) achieves almost-global exponential stability outside the 180° antipodal cut locus.',
      origins: 'Lee, Leok, & McClamroch (Geometric Tracking Control on SO(3), IEEE CDC 2010).'
    },
    {
      id: 't6', short: '3-Horizon PopArt',
      title: 'Multi-Horizon PopArt Value Critic (γ ∈ {0.95, 0.98, 0.995})',
      usedIn: ['critic_heads'],
      placement: 'Stage 6A Value Head — Multi-Horizon Adaptive PopArt Critic.',
      how: 'Maintains running mean μ_h and standard deviation σ_h across 3 discount horizons (1s, 2.5s, 10s) and rescales linear head weights W_new = (σ_old/σ_new)W_old whenever statistics update.',
      why: 'Allowed simultaneous dense micro-touch shaping and sparse goal credit assignment without manual reward weight retuning.',
      contrib: 'Became a permanent multi-horizon pillar across all subsequent generations.',
      science: 'PopArt (Preserving Outputs Precisely, while Adaptively Rescaling Targets) prevents value network representation drift when reward magnitudes shift.',
      origins: 'van Hasselt et al. (2016) & Hessel et al. (AAAI 2019).'
    },
    {
      id: 't7', short: '32-Quantile CVaR_β',
      title: 'Monotonic 32-Quantile Distributional Critic & Dynamic CVaR_β(s)',
      usedIn: ['jepa_search'],
      placement: 'Stage 6B Risk-Sensitive Critic — 32-Quantile Distributional Value Head.',
      how: 'Parameterizes 32 quantiles via θ_k = θ_1 + Σ_{j=2}^k softplus(Δ_j) (guaranteeing θ_1 <= ... <= θ_32), trained with Huber quantile regression loss, and computes trapezoidal Conditional Value-at-Risk CVaR_β(s).',
      why: 'Standard expected-value critics ignore tail risk (e.g., a low-probability own-goal or over-commit when leading by 1 goal).',
      contrib: 'Introduced distributional RL and CVaR risk sensitivity to the platform.',
      science: 'By enforcing ∂θ_k/∂k >= 0 via softplus deltas, the inverse CDF F_Z^{-1}(τ) is strictly monotonic, eliminating non-monotonic quantile crossing.',
      origins: 'Dabney et al. (QR-DQN / IQN, ICML 2018) + Monotonic Spline Quantiles.'
    },
    {
      id: 't8', short: '4 Exploiter Heads',
      title: 'Multi-Archetype NeuralExploiterPolicyHead & Intrinsic Reward Shapers',
      usedIn: ['fsq_bottleneck', 'ppo_grpo_opt'],
      placement: 'Stage 4C Adversarial League Branch — 4 Multi-Archetype Exploiter Heads.',
      how: 'Four specialist policy heads (BALL_DENIAL, DEMOLITION, AERIAL_MECHANICS, BOOST_STARVATION) paired with dense archetype-specific intrinsic rewards.',
      why: 'Injected diverse adversarial strategies into self-play before replay mining and Soft-MoE existed.',
      contrib: 'Prevented early self-play policies from converging to fragile, passive equilibrium.',
      science: 'Intrinsic motivation R_total = R_extrinsic + λ_arch R_intrinsic(s, a) constructs diverse behavioral policies along Pareto frontiers.',
      origins: 'AlphaStar Exploiter Agents (Vinyals et al., 2019).'
    },
    {
      id: 't9', short: 'CUDA Graph & Seqlock',
      title: 'StaticCUDAPolicyRunner (E=1024), InPlaceWeightStaging & Lockless Seqlock SHM',
      usedIn: ['priv_ctx', 'ppo_grpo_opt'],
      placement: 'Stage 1 & Stage 6 Systems Infrastructure — Static CUDA Graph & Lockless Seqlock IPC.',
      how: 'Captures the E=1024 rollout step in a torch.cuda.CUDAGraph, stages updated PPO weights in-place (<5.56 ms) without changing device pointers, and exports C++ telemetry via a 64B-aligned odd/even atomic Seqlock.',
      why: 'Eliminated Python kernel launch overhead and OS mutex contention.',
      contrib: 'Laid the systems engineering foundation for Hex64\'s 4,096-arena CUDAGraph loop and 256 KB Seqlock Command Center.',
      science: 'A Seqlock increments an atomic counter before and after writing; readers retry if seq_start is odd or seq_start != seq_end, achieving zero-lock wait-free reads.',
      origins: 'Linux Kernel Seqlock + PyTorch CUDAGraphs.'
    }
  ],
  externalResources: {
    t0: [
      { badge: 'NEURIPS 2017', title: 'Deep Sets', authors: 'M. Zaheer et al.', url: 'https://arxiv.org/abs/1703.06114', desc: 'Characterizes permutation-invariant and equivariant neural networks over entity sets.' }
    ],
    t1: [
      { badge: 'NAACL 2018', title: 'Self-Attention with Relative Position Representations', authors: 'P. Shaw, J. Uszkoreit, A. Vaswani', url: 'https://arxiv.org/abs/1803.02155', desc: 'Injects pairwise relative geometry directly into attention score matrices.' }
    ],
    t2: [
      { badge: 'ICLR 2019', title: 'Deep Reinforcement Learning with Relational Inductive Biases', authors: 'V. Zambaldi et al. (DeepMind)', url: 'https://arxiv.org/abs/1806.01830', desc: 'Foundational paper for entity-centric relational transformers in game RL.' }
    ],
    t3: [
      { badge: 'ICML 2017', title: 'Proximal Policy Optimization Algorithms', authors: 'J. Schulman et al. (OpenAI)', url: 'https://arxiv.org/abs/1707.06347', desc: 'Clipped surrogate objective used across continuous quaternion and discrete gate heads.' }
    ],
    t4: [
      { badge: 'SIGGRAPH 1985', title: 'Animating Rotation with Quaternion Curves (SLERP)', authors: 'K. Shoemake', url: 'https://doi.org/10.1145/325334.325242', desc: 'Introduces Spherical Linear Interpolation along unit quaternion geodesics on S^3.' }
    ],
    t5: [
      { badge: 'IEEE CDC 2010', title: 'Geometric Tracking Control of a Quadrotor UAV on SE(3)', authors: 'T. Lee, M. Leok, N. H. McClamroch', url: 'https://arxiv.org/abs/1003.2005', desc: 'Singularity-free geometric attitude PD control directly on rotation manifolds.' }
    ],
    t6: [
      { badge: 'AAAI 2019', title: 'Multi-Task Deep Reinforcement Learning with PopArt', authors: 'M. Hessel, H. van Hasselt et al.', url: 'https://arxiv.org/abs/1809.04474', desc: 'Scale-invariant value normalization across multiple discount horizons.' }
    ],
    t7: [
      { badge: 'AAAI 2018', title: 'Distributional Reinforcement Learning with Quantile Regression (QR-DQN)', authors: 'W. Dabney et al. (DeepMind)', url: 'https://arxiv.org/abs/1710.10044', desc: 'Learns return quantiles via asymmetric Huber quantile regression loss.' },
      { badge: 'ICML 2018', title: 'Implicit Quantile Networks for Distributional Reinforcement Learning (IQN)', authors: 'W. Dabney et al.', url: 'https://arxiv.org/abs/1806.06923', desc: 'Enables risk-sensitive CVaR policy optimization over return distributions.' }
    ],
    t8: [
      { badge: 'NATURE 2019', title: 'Grandmaster level in StarCraft II using multi-agent reinforcement learning', authors: 'O. Vinyals et al.', url: 'https://www.nature.com/articles/s41586-019-1724-z', desc: 'Introduces specialized Exploiter agents to uncover weaknesses in the main agent.' }
    ],
    t9: [
      { badge: 'NVIDIA 2021', title: 'Accelerating PyTorch with CUDA Graphs', authors: 'NVIDIA / PyTorch Core Team', url: 'https://pytorch.org/blog/accelerating-pytorch-with-cuda-graphs/', desc: 'Eliminates CPU launch overhead by recording static-shape GPU execution graphs.' }
    ]
  },
  mermaidDiagram: `flowchart LR
  subgraph S1["Stage 1: 41x25 Entity POD & SoA"]
    N1["01. 41x25 EntityTokenPOD (4,100B)"] --> N2["02. 1,536B Kinematics SoA (alignas 64)"]
    N1 --> N3["03. Ch-24 Norm Time-To-Go & Spin"]
    N1 -.-> N4["04. 64B Lockless Seqlock Telemetry"]
  end
  subgraph S2["Stage 2: AVX2 Pairwise r_ij"]
    N2 --> N5["05. AVX2 41x41x8 r_ij (53.7KB)"]
    N5 --> N6["06. Trunk-Hoisted mlp_rel (8->16->4)"]
  end
  subgraph S3["Stage 3: 4L RET-40 Transformer"]
    N1 & N3 & N6 --> N7["07. 4L RET-40 Attention (d=128, SwiGLU)"]
    N7 --> N8["08. 256D Ego + Masked Global Pool"]
  end
  subgraph S4["Stage 4: Quaternion & Exploiter Heads"]
    N8 --> N9["09. Target Quat q* ∈ S^3 & ω*"]
    N8 --> N10["10. BernoulliJumpHead (b0=-3.80)"]
    N8 -.-> N11["11. 4 Neural Exploiter Archetypes"]
  end
  subgraph S5["Stage 5: 120Hz Geodesic SLERP PD"]
    N9 --> N12["12. Geodesic S^3 SLERP Generator"]
    N12 & N9 --> N13["13. 120Hz Nonlinear Attitude PD"]
    N13 & N10 --> N14["14. Dodge Override & 120Hz Controls"]
  end
  subgraph S6["Stage 6: 32-Quantile CVaR & Staging"]
    N8 --> N15["15. 3-Horizon PopArt Critic"]
    N8 --> N16["16. 32-Quantile Monotonic CVaR_β"]
    N15 & N16 & N11 --> N17["17. E=1024 CUDAGraph & Weight Staging"]
  end`
};

// ============================================================================
// MASTER MULTI-GENERATION ARCHITECTURE REGISTRY (HEX64 + GEN 3 + GEN 2 + GEN 1)
// ============================================================================
window.ARASHIKAGE_ARCHITECTURES = {
  hex64: {
    id: 'hex64',
    shortBadge: 'ARASHIKAGE // HEX64 (CURRENT)',
    dropdownLabel: 'Gen 4: Hex64 (Current · 60Hz Flow)',
    identityTitle: 'Real-Time Physics & Neural Control — 60 Hz Flow-GRPO',
    colHeaders: [
      { col: 0, x: 96,  title: 'STAGE 1 // RUST OBS',      sub: '5,376B Slice · C2v',       color: '#38bdf8' },
      { col: 1, x: 282, title: 'STAGE 2 // BIPARTITE',     sub: '16×64 Graph · DiffAttn',   color: '#22d3ee' },
      { col: 2, x: 468, title: 'STAGE 3 // TITANS MEM',    sub: '2×4×32×32 FP32 Fast W',    color: '#a78bfa' },
      { col: 3, x: 654, title: 'STAGE 4 // COCONUT & MOE', sub: 'K=4..6 Loop · 8×2 MoE',    color: '#f472b6' },
      { col: 4, x: 840, title: 'STAGE 5 // 60HZ CONTROL',  sub: 'Binary + Flow-GRPO SDE',   color: '#fbbf24' },
      { col: 5, x: 1024, title: 'STAGE 6 // CRITIC & RL',  sub: '4×51 Symlog · JEPA · G=8', color: '#34d399' }
    ],
    nodes: window.ARASHIKAGE_NODES || [],
    edges: window.ARASHIKAGE_EDGES || [],
    scenarios: window.ARASHIKAGE_SCENARIOS || {},
    techLibrary: window.ARASHIKAGE_TECH_LIBRARY || [],
    externalResources: window.ARASHIKAGE_EXTERNAL_RESOURCES || {},
    mermaidDiagram: `flowchart LR
  subgraph S1["Stage 1: Rust Observation (5,376B)"]
    N1["01. 5,376B Arena Slice (84x64B CL, C2v)"] --> N2["02. 16 Dynamic Queries"]
    N1 --> N3["03. 48 Context Keys"]
    N1 -.-> N4["04. 512B Privileged Critic Ctx"]
  end
  subgraph S2["Stage 2: Bipartite Graph"]
    N2 & N3 --> N5["05. Fused GPU Pairwise Bias (16x64x72D)"]
    N2 & N3 & N5 --> N6["06. 2L Bipartite DiffAttn"]
  end
  subgraph S3["Stage 3: FP32 Titans Memory"]
    N7["07. Orthogonal W_init & k_prev"] & N6 --> N8["08. 2x4x32x32 FP32 Fast Weights"]
  end
  subgraph S4["Stage 4: Coconut & Soft-MoE"]
    N8 --> N9["09. Coconut Loop (K=4..6)"]
    N9 <--> N10["10. Static 8x2 Soft-MoE"]
    N10 --> N11["11. 8x125=1,000 FSQ Bottleneck"]
  end
  subgraph S5["Stage 5: 60Hz Flow-GRPO Control"]
    N9 & N11 --> N12["12. Stage-1 16-Way Binary Head"]
    N12 --> N13["13. Stage-2 4-Step Flow-GRPO SDE"]
    N13 --> N14["14. K_sub=4 (60Hz) Subtick Executor"]
  end
  subgraph S6["Stage 6: Critic, JEPA & RL"]
    N4 -.-> N15["15. Dual 4x51 Symlog HL-Gauss Critic"]
    N9 --> N15
    N13 & N15 --> N16["16. Best-of-16 JEPA + CVaR Search"]
    N14 & N15 -.-> N17["17. G=8 Cloned GRPO & Flow-PPO"]
  end`
  },
  gen3_perceiver: window.ARASHIKAGE_GEN3_PERCEIVER,
  gen2_factorized: window.ARASHIKAGE_GEN2_FACTORIZED,
  gen1_ret40: window.ARASHIKAGE_GEN1_RET40
};
