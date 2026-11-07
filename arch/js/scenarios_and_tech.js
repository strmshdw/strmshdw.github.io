// ============================================================================
// ARASHIKAGE (HEX63) — SCENARIOS, 10 DEEP DIVES & 36 EXTERNAL WHITE PAPERS
// ============================================================================
window.ARASHIKAGE_SCENARIOS = {
  tour: {
    label: 'END-TO-END 66.7ms TOUR',
    steps: [
      {
        title: 'Step 1/8: C++20 5,376B Cache-Line Observation Slice',
        focusNode: 'dma_slice', highlight: ['dma_slice', 'dyn_nodes', 'env_nodes'], techId: 't0',
        desc: 'Every 66.7 ms (15 Hz), Hex63ObsMapper packs all 64 arena entities into a 64-byte-aligned 5,376B struct (84 CPU cache lines). Orange team coordinates rotate 180° around Z via M_C2v = diag(-1,-1,+1) so the model always attacks toward +Y.'
      },
      {
        title: 'Step 2/8: 16 Dynamic Queries vs. 48 Context Keys',
        focusNode: 'dyn_nodes', highlight: ['dyn_nodes', 'env_nodes', 'priv_ctx'], techId: 't1',
        desc: 'Slots 0..15 hold the 16 dynamic moving entities (6 cars, 1 ball, 8 future ball bounce samples from BallRingBuffer480, 1 match state). Slots 16..63 hold 48 context tokens (34 pads, 6 goals, 4 ego wheel raycasts, 4 OBB surfaces).'
      },
      {
        title: 'Step 3/8: Fused GPU Pairwise Physics & Bipartite DiffAttn',
        focusNode: 'bipartite_enc', highlight: ['gpu_edges', 'bipartite_enc'], techId: 't2',
        desc: 'A 0.09 ms GPU kernel computes 72 pairwise physics features (distance bands, closing speed, time-to-intercept) across all 16×64 = 1,024 pairs. Two Bipartite Differential Attention layers subtract a second noise-canceling softmax map to isolate active threats.'
      },
      {
        title: 'Step 4/8: In-Match Adaptation via FP32 Titans Memory',
        focusNode: 'titans_mem', highlight: ['titans_prior', 'titans_mem'], techId: 't3',
        desc: 'Each of the 2 layers × 4 heads maintains a 32×32 FP32 fast-weight matrix W_t updated live during the match via a Log-Cosh surprise gradient whenever opponent behavior deviates from prediction, bounded within ||W||_F <= 4.0.'
      },
      {
        title: 'Step 5/8: Coconut Latent Loop & Static 8×2 Soft-MoE',
        focusNode: 'coconut_loop', highlight: ['coconut_loop', 'soft_moe'], techId: 't4',
        desc: 'Rather than stacking 16 separate layers, the latent state loops K_t = 4 or 6 times through shared weights, projecting a 3D spatial anchor p_lat^(k) at each pass while routing tokens through 8 static-shape Soft-MoE specialist experts.'
      },
      {
        title: 'Step 6/8: 8×125 = 1,000 Discrete FSQ Skill Bottleneck',
        focusNode: 'fsq_bottleneck', highlight: ['soft_moe', 'fsq_bottleneck', 'stage1_bin'], techId: 't6',
        desc: 'The ego token projects into 24 bounded scalars rounded into 5 integer levels {-2,-1,0,1,2} across 8 triplets (1,000 discrete skill codes) with zero auxiliary VQ codebook loss, conditioning the downstream 60 Hz action decoder.'
      },
      {
        title: 'Step 7/8: Two-Stage 60Hz Subtick Flow-GRPO Action Chunking',
        focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow', 'subtick_exec'], techId: 't7',
        desc: 'Stage 1 samples a 16-way causal 4-subtick Jump/Double-Jump sequence plus Boost and Handbrake. Stage 2 integrates a 4-step Flow-GRPO velocity field in R^20 conditioned on those exact binary edges, executing 4 subticks at 60 Hz.'
      },
      {
        title: 'Step 8/8: Dual 4×51 Symlog Critic, JEPA Search & G=8 GRPO',
        focusNode: 'critic_heads', highlight: ['critic_heads', 'jepa_search', 'ppo_grpo_opt'], techId: 't8',
        desc: 'Dual 4×51 Symlog HL-Gauss heads predict return distributions across 4 horizons (1s, 2.5s, 10s, full match). Live play uses p_eval + JEPA for Best-of-16 CVaR search; training combines p_priv GAE with 816 G=8 cloned GRPO drill arenas.'
      }
    ]
  },
  bounce: {
    label: 'SCENARIO 1: CORNER DOUBLE-TAP READ',
    steps: [
      {
        title: '1/4: 4.0-Second BallRingBuffer480 Trajectory Samples',
        focusNode: 'dyn_nodes', highlight: ['dma_slice', 'dyn_nodes', 'env_nodes'], techId: 't0',
        desc: 'As the ball flies toward the curved Orange corner wall at 2,300 uu/s, C++ steps a lightweight ball-only copy forward 480 ticks (4.0s), populating Slots 7..14 with exact post-bounce positions and spin vectors.'
      },
      {
        title: '2/4: Pairwise Intercept Margin & Surface OBB Alignment',
        focusNode: 'gpu_edges', highlight: ['dyn_nodes', 'env_nodes', 'gpu_edges', 'bipartite_enc'], techId: 't1',
        desc: 'The fused GPU pairwise kernel computes time-to-closest-approach between the ego car (Slot 0) and future bounce node τ_5 (+1.6s, Slot 11), while Bipartite DiffAttn suppresses ground boost pads to focus on the backboard.'
      },
      {
        title: '3/4: K = 6 Coconut Passes & Aerial Specialist Routing',
        focusNode: 'coconut_loop', highlight: ['coconut_loop', 'soft_moe', 'fsq_bottleneck'], techId: 't4',
        desc: 'Across 6 recurrent Coconut passes, the 3D spatial focus anchor p_lat^(k) shifts from the initial wall impact to the mid-air rebound window, routing 78% of Soft-MoE slot weight to the Wall/Double-Tap specialist expert.'
      },
      {
        title: '4/4: 60Hz Air-Roll Pre-Orientation & Boost Feathering',
        focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow', 'subtick_exec'], techId: 't7',
        desc: 'Flow-GRPO outputs a smooth 4-subtick aerial roll-and-pitch trajectory that aligns the front bumper with the rebound angle 300 ms before the ball leaves the corner wall.'
      }
    ]
  },
  aerial: {
    label: 'SCENARIO 2: FAST AERIAL STALL GUARD',
    steps: [
      {
        title: '1/4: Detecting Airborne Double-Jump Availability',
        focusNode: 'dyn_nodes', highlight: ['dma_slice', 'dyn_nodes'], techId: 't0',
        desc: 'Ego Car Slot 0 reports is_on_ground = 0, has_jumped = 1, has_flipped = 0, and air_jump_timer = 0.22s—indicating the car is mid-air with its second jump available.'
      },
      {
        title: '2/4: Stage-1 16-Way Causal Jump Sequence & m_dj,k Flag',
        focusNode: 'stage1_bin', highlight: ['fsq_bottleneck', 'stage1_bin'], techId: 't7',
        desc: 'Stage-1 Binary Head samples Jump sequence [1, 0, 1, 1] (release on subtick 2, re-press on subtick 3) and sets the double-jump guard flag m_dj,3 = 1 for Subtick 3.'
      },
      {
        title: '3/4: 0.12·tanh Deadzone Clamp Prevents Accidental Backflip',
        focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow'], techId: 't7',
        desc: 'While pulling pitch back (-0.95) to climb on Subticks 1 & 2, firing Jump on Subtick 3 without zeroing pitch would cause an accidental backflip. Because m_dj,3 = 1, Stage-2 automatically clamps Subtick 3 pitch/yaw/roll via 0.12·tanh(u) inside the dodge deadzone (< 0.5).'
      },
      {
        title: '4/4: Native 60Hz Execution in RocketSim Without C++ Hijacking',
        focusNode: 'subtick_exec', highlight: ['stage2_flow', 'subtick_exec'], techId: 't7',
        desc: 'SubtickPhysicsExecutor passes all 4 subticks directly to Car::controls every 2 physics ticks (16.67 ms), executing a frame-perfect fast aerial climb.'
      }
    ]
  },
  fake: {
    label: 'SCENARIO 3: OPPONENT FAKE ADAPTATION',
    steps: [
      {
        title: '1/4: Opponent Executes a Sudden Brake-Fake Challenge',
        focusNode: 'bipartite_enc', highlight: ['dyn_nodes', 'gpu_edges', 'bipartite_enc'], techId: 't2',
        desc: 'Opponent #1 (Slot 3) approaches at supersonic speed as if to challenge, then slams handbrake+reverse. Bipartite DiffAttn highlights the sudden deceleration vector.'
      },
      {
        title: '2/4: High Surprise Residual in FP32 Titans Fast Weights',
        focusNode: 'titans_mem', highlight: ['bipartite_enc', 'titans_prior', 'titans_mem'], techId: 't3',
        desc: 'Titans compares its previous-step prediction W_{t-1}^T k_{t-1} (expecting a hard 50/50 collision) against actual state v_t (opponent braking). The large residual triggers a high Log-Cosh surprise gradient g_t.'
      },
      {
        title: '3/4: Fast-Weight Update & Frobenius Ball Retraction',
        focusNode: 'titans_mem', highlight: ['titans_mem', 'coconut_loop'], techId: 't3',
        desc: 'Fast weights W_t update in FP32 with momentum M_t and retract onto ||W_t||_F <= 4.0. Across subsequent goals in the same match, W_t retains the memory that this opponent favors fake challenges.'
      },
      {
        title: '4/4: Soft-MoE Shifts to Low-50 / Delayed Flick Specialist',
        focusNode: 'soft_moe', highlight: ['coconut_loop', 'soft_moe', 'fsq_bottleneck'], techId: 't5',
        desc: 'Conditioned on the updated Titans memory readout, Coconut and Soft-MoE route into the Ground Dribble / Delayed Flick specialist instead of panic-banging possession away.'
      }
    ]
  },
  save: {
    label: 'SCENARIO 4: GOAL-LINE BEST-OF-16 SAVE',
    steps: [
      {
        title: '1/4: High-Velocity Shot Toward Top-Right Corner',
        focusNode: 'gpu_edges', highlight: ['dyn_nodes', 'env_nodes', 'gpu_edges'], techId: 't1',
        desc: 'Ball trajectory nodes τ_1..τ_3 cross the Blue goal plane in 0.45 seconds. Ego wheel raycasts (Slots 56..59) confirm all 4 wheels are grounded on the backboard ramp.'
      },
      {
        title: '2/4: Sampling M = 16 Multimodal Save Candidates',
        focusNode: 'stage2_flow', highlight: ['stage1_bin', 'stage2_flow', 'jepa_search'], techId: 't7',
        desc: 'The ego latent state is replicated 16× along the batch dimension. Stage-1 and Stage-2 Flow-GRPO sample 16 distinct 60 Hz action chunks covering pre-jump high saves, low corner dives, and backboard clears.'
      },
      {
        title: '3/4: 1-Step Batched Rollout in Dual-Stream JEPA',
        focusNode: 'jepa_search', highlight: ['stage2_flow', 'jepa_search', 'critic_heads'], techId: 't9',
        desc: 'The JEPA action-conditioned latent world model predicts the resulting ego and ball latent states 66.7 ms ahead for all 16 candidates in parallel on GPU without calling CPU physics.'
      },
      {
        title: '4/4: Lower-Tail CVaR Selection via Observation Critic p_eval',
        focusNode: 'critic_heads', highlight: ['critic_heads', 'jepa_search', 'subtick_exec'], techId: 't8',
        desc: 'The observation-only critic p_eval evaluates the 51-bin return distribution for all 16 future states. The selector picks the action chunk maximizing expected value plus lower-tail CVaR_α on the sparse win/loss horizon, rejecting diving misses.'
      }
    ]
  }
};

window.ARASHIKAGE_TECH_LIBRARY = [
  {
    id: 't0', short: '5,376B Layout A & C2v',
    title: '64-Byte Cache-Line Aligned Schema & Klein 4-Group (C2v) Equivariance',
    usedIn: ['dma_slice', 'dyn_nodes', 'env_nodes', 'priv_ctx'],
    how: 'All 64 arena entities are written directly by C++20 into a flat 5,376-byte structure (84 × 64-byte CPU cache lines) verified by SCHEMA_CRC64 = 0x185109A0FD5E64D3. When building observations for an Orange-team car (team == 1), arena-frame positions and velocities are multiplied by M_C2v = diag(-1, -1, +1) (a 180° rotation around the Z axis), while body-local vectors (vel_local, ang_vel_local) remain unchanged.',
    why: 'First, Python object serialization across 4,096 parallel arenas would bottleneck CPU-to-GPU PCIe bandwidth. Second, Rocket League pitches are symmetric between Blue (-Y) and Orange (+Y), and left (-X) vs. right (+X). Without coordinate normalization, the model must learn every mechanic twice.',
    contrib: 'Shrinks CPU observation building to 0.25 ms for 4,096 arenas, doubles sample efficiency via exact spatial symmetry, and guarantees 0-ULP observation parity between training and live matches.',
    science: 'Rocket League uses a Left-Handed Z-Up coordinate system (+X right sidewall, +Y Orange goal, +Z up). Naive Y-negation flips handedness (det = -1), corrupting cross products and angular velocities. Rotating 180° around Z via M_C2v = diag(-1,-1,+1) ∈ SO(3) has determinant +1, preserving Left-Handed chirality. Combined with lateral X-reflection M_lat (which flips roll, yaw, and steer signs), this forms the Klein 4-group C_2v = {I, M_C2v, M_lat, M_C2v M_lat}.',
    origins: 'Grounded in Geometric Deep Learning and group-equivariant networks (Cohen & Welling, 2016; Bronstein et al., 2021) paired with High-Performance Computing (HPC) cache-line alignment practices.',
    placement: 'Executed at the C++20 boundary (Stage 1) before bytes cross PCIe so every downstream GPU kernel, attention head, and critic operates exclusively in canonical coordinates.'
  },
  {
    id: 't1', short: '16×64 Bipartite Graph',
    title: '16×64 Asymmetric Bipartite Entity Graph & GPU Pairwise Physics Bias',
    usedIn: ['dyn_nodes', 'env_nodes', 'gpu_edges', 'bipartite_enc'],
    how: 'Splits the 64 arena tokens into 16 Dynamic Query tokens (6 cars, 1 ball, 8 future ball trajectory samples, 1 match state) and 48 Static/Context Key-Value tokens (34 boost pads, 6 goals, 4 ego wheel contacts, 4 wall OBBs). A fused GPU kernel computes a [B, 16, 64, 72] pairwise kinematic tensor in 0.09 ms and projects it into per-head attention biases.',
    why: 'Full 64×64 self-attention computes 4,096 pairs—wasting 75% of compute having static boost pads attend to other static boost pads. Meanwhile, computing 1,024×72 pairwise features on CPU would balloon PCIe traffic from 5.3 KB to 194 KB per arena.',
    contrib: 'Reduces attention complexity by 4× (1,024 active pairs), keeps host-to-GPU DMA minimal, and injects exact physical intercept margins directly into attention logits.',
    science: 'For each pair (i ∈ {0..15}, j ∈ {0..63}), the GPU kernel computes relative displacement Δp_ij, relative velocity Δv_ij, log-spaced Fourier distance features [sin(ω_m d_ij), cos(ω_m d_ij)], time-to-closest-approach τ_ca = clamp(-(Δp·Δv)/||Δv||^2, 0, 5), and estimated time-to-reach.',
    origins: 'Synthesizes Set Transformers / Perceiver cross-attention (Lee et al., 2019; Jaegle et al., 2021) with relational geometric biases from AlphaFold 2 Evoformer (Jumper et al., 2021).',
    placement: 'Sits at the entry of Stage 2 on GPU immediately after unpacking the 5,376B slice, turning raw coordinates into relational intercept features before backbone layers.'
  },
  {
    id: 't2', short: 'Differential Attention',
    title: 'Differential Attention (Noise-Canceling Dual-Softmax Operators)',
    usedIn: ['gpu_edges', 'bipartite_enc', 'coconut_loop'],
    how: 'Splits each attention head’s queries and keys into two half-dimension groups (Q_1, Q_2 and K_1, K_2), computes two separate softmax attention distributions over the 64 context tokens, and subtracts the second map scaled by a learnable scalar λ: DiffAttn = (softmax(S_1) - λ·softmax(S_2)) V.',
    why: 'Standard softmax must sum to 1.0 and assigns positive weight to every token, leaking background noise from 30+ irrelevant boost pads and parked cars into the ego representation.',
    contrib: 'Produces sparse, high-contrast attention focused strictly on the ball, the active challenger, and the 1–2 relevant boost pads or wall surfaces.',
    science: 'Let S_1 = Q_1 K_1^T / √d + B_1 and S_2 = Q_2 K_2^T / √d + B_2, with λ = exp(λ_q1 · λ_k1) - exp(λ_q2 · λ_k2) + λ_init. Subtracting the two normalized distributions cancels common-mode softmax noise, analogous to differential amplifiers in electrical engineering and balanced photodetectors in optics.',
    origins: 'Introduced in the Differential Transformer architecture (Ye et al., Microsoft Research, ICLR 2025) to eliminate attention sinks and context dilution.',
    placement: 'Powers both the Stage 2 Bipartite Graph Encoder and the Stage 4 Coconut recurrent blocks where 64 heterogeneous arena entities compete for focus.'
  },
  {
    id: 't3', short: 'FP32 Titans Memory',
    title: '2×4×32×32 FP32 Titans Neural Memory (Test-Time Fast-Weight Adaptation)',
    usedIn: ['titans_prior', 'titans_mem'],
    how: 'Maintains a per-car fast-weight matrix W_t ∈ R^[32×32] and momentum state M_t ∈ R^[32×32] in strict 32-bit floating point across 2 layers × 4 heads. At every 15 Hz step during live play, W_t updates via a causal Log-Cosh surprise gradient measuring the prediction error on the previous step, followed by Frobenius norm retraction ||W||_F <= 4.0.',
    why: 'Standard neural networks freeze their weights after training and cannot remember habits exhibited by an opponent 90 seconds ago (such as fake challenges or boost-starve rotations).',
    contrib: 'Gives the agent persistent 5-minute in-match memory that adapts to opponent playstyles in real time without recurrent state explosion.',
    science: 'Using the cached key k_{t-1} from step t-1 and current value v_t, the surprise gradient is g_t = tanh((W_{t-1}^T k_{t-1} - v_t) / τ_s) ⊗ k_{t-1}. Momentum updates via M_t = η_t M_{t-1} - θ_t g_t and W_t = Proj_{||·||_F <= 4}((1 - α_t) W_{t-1} + M_t). Goal resets clear M_t = 0 while preserving W_t across the match.',
    origins: 'Evolved from Fast Weights (Hinton & Plaut, 1987; Schlag et al., 2021), Test-Time Training / TTT-Linear (Sun et al., 2024), and Google Research’s Titans: Learning to Memorize at Test Time (Behrouz et al., 2025).',
    placement: 'Placed in Stage 3 between spatial encoding (Stage 2) and tactical Coconut planning (Stage 4) so multi-step reasoning is conditioned on opponent history.'
  },
  {
    id: 't4', short: 'Coconut Latent Loop',
    title: 'Coconut Continuous Latent Reasoning Loop & 3D Spatial Focus Anchors',
    usedIn: ['coconut_loop'],
    how: 'Loops the [B, 16, 384] entity representation through weight-tied Bipartite DiffAttn + Soft-MoE blocks for K_t ∈ {4, 6} recurrent passes within a single environment step. At each pass k, an auxiliary projection head predicts a 3D spatial anchor p_lat^(k) = (x, y, z) supervised during training to track future ball/car intercept waypoints.',
    why: 'Stacking 16 distinct transformer layers would quadruple parameter memory and thrash GPU L2 cache. Weight-tied recurrence dynamically scales thinking depth with tactical complexity and latency budget.',
    contrib: 'Enables multi-bounce trajectory planning (wall double-taps, corner reads) in Tier 0 (K=6) while gracefully dropping to K=4 in Tier 2/3 if frame time tightens.',
    science: 'At pass k ∈ {1..K_t}, H^(k) = Block_shared(H^(k-1) + e_pass(k) + e_mode(u_t) + e_dt(κ_Δt)), accompanied by spatial anchor loss L_anchor = Σ_k ||p_lat^(k) - p_target^(k)||_2^2 that grounds each recurrent pass in physical 3D pitch coordinates.',
    origins: 'Draws from Universal Transformers (Dehghani et al., 2019), PonderNet (Banino et al., 2021), and Coconut: Training Large Language Models to Reason in a Continuous Latent Space (Hao et al., Meta FAIR, 2024).',
    placement: 'Forms the core of Stage 4, iteratively refining the spatial + memory state before compressing into the discrete skill bottleneck.'
  },
  {
    id: 't5', short: 'Static 8×2 Soft-MoE',
    title: 'Static-Shape 8×2 Soft Mixture-of-Experts with Loss-Free Bias Balancing',
    usedIn: ['soft_moe'],
    how: 'Combines 1 always-active Shared Expert (d_ff = 512) with 8 routed Specialist Experts (d_ff = 192, P = 2 slots each = 16 total slots). Tokens are mapped into expert slots via a softmax dispatch matrix Φ_disp and merged back via Φ_comb using static-shape einsum operations. Load balancing is maintained by an auxiliary-loss-free bias b_e^bal updated outside the gradient graph.',
    why: 'Discrete Top-K MoE requires dynamic token sorting and variable-length buffers that break PyTorch CUDAGraph capture and introduce latency jitter. Furthermore, auxiliary load-balancing losses distort RL policy gradients.',
    contrib: 'Allows dedicated sub-networks to specialize in distinct mechanics (kickoffs, air dribbles, flip resets, shadow defense) while executing inside a single static CUDAGraph.',
    science: 'Slot logits S_{n,e,s} = (X_n · W_r)/τ + b_e^bal define dispatch weights Φ_disp = softmax_n(S) and combine weights Φ_comb = softmax_{e,s}(S). Expert inputs X_tilde = einsum("bnpd,bnep->bepd", X, Φ_disp) pass through BatchedSwiGLU and recombine via Y = FFN_shared(X) + einsum("bepd,bnep->bnpd", Z, Φ_comb).',
    origins: 'Combines Soft-MoE (Puigcerver et al., Google Brain, ICLR 2024) with Shared Expert Isolation and Loss-Free Bias Balancing from DeepSeekMoE (Dai et al., 2024).',
    placement: 'Serves as the feedforward sub-layer inside every Stage 4 Coconut pass, injecting specialized mechanical knowledge at each step of latent reasoning.'
  },
  {
    id: 't6', short: '8×125 FSQ Bottleneck',
    title: 'Finite Scalar Quantization (8×125 = 1,000 Discrete Skill Bottleneck)',
    usedIn: ['fsq_bottleneck'],
    how: 'Projects the ego latent state h_ego ∈ R^384 into a 24D vector z_raw, bounds each coordinate via 2·tanh(z_raw), and rounds to the nearest integer in {-2, -1, 0, +1, +2} using a Straight-Through Estimator (STE). Grouped into 8 cyclic 3D triplets, each triplet forms 5^3 = 125 discrete codes (8 × 125 = 1,000 total skill codes).',
    why: 'Traditional VQ-VAE vector quantizers suffer from codebook collapse (where 90% of codes die during RL updates) and require delicate commitment losses.',
    contrib: 'Provides a zero-hyperparameter, 100%-utilization discrete skill interface between the recurrent backbone and the 60 Hz action decoder, while making active bot intentions human-readable in telemetry.',
    science: 'In forward evaluation, z_q = round(2·tanh(z_raw)) ∈ {-2,-1,0,1,2}^24; in backward pass, ∂L/∂z_raw = ∂L/∂z_q · 2 sech^2(z_raw). Because bounding onto a fixed integer hypercube requires no learned codebook vectors, codebook collapse is mathematically impossible.',
    origins: 'Introduced in Finite Scalar Quantization: VQ-VAE Made Simple (Mentzer et al., Google Research, ICLR 2024).',
    placement: 'Positioned at the exit of Stage 4, distilling Coconut’s multi-pass continuous thought into a discrete tactical command for the Stage 5 action head.'
  },
  {
    id: 't7', short: '60Hz Flow-GRPO Chunking',
    title: 'Two-Stage Autoregressive Binary + 4-Step Flow-GRPO 60Hz Action Chunking',
    usedIn: ['stage1_bin', 'stage2_flow', 'subtick_exec', 'ppo_grpo_opt'],
    how: 'Each 15 Hz outer step predicts a K_sub = 4 subtick action chunk executed at 60 Hz (every 16.67 ms). Stage 1 samples a 16-way categorical distribution over all causal 4-subtick Jump sequences (J_1..J_4) plus Boost and Handbrake. Conditioned on the sampled binary sequence u_bin, Stage 2 integrates a 4-step Euler-Maruyama velocity field in R^20 (4 subticks × 5 continuous axes) with a 0.12·tanh deadzone stall clamp whenever double-jump m_dj,k = 1.',
    why: 'Holding controls constant for 66.7 ms (15 Hz) makes 33 ms speedflip pitch cancels physically impossible. Moreover, unimodal Gaussian policies average left/right aerial evasion paths into zero (flying straight into obstacles).',
    contrib: 'Delivers 60 Hz frame-perfect mechanical execution (speedflips, stalls, half-flips) and sharp multimodal continuous trajectories with exact tractable log-probabilities for PPO and GRPO.',
    science: 'The 4-step stochastic flow transition from τ_m to τ_{m+1} (Δτ = 0.25) is a tractable Gaussian N(x_{m+1}; x_m + v_θ(x_m, τ_m, c_act)Δτ, σ_m^2 Δτ I), allowing exact computation of log π_θ(x_{m+1}|x_m) during RL updates.',
    origins: 'Synthesizes Action Chunking (Zhao et al., RSS 2023), Flow Matching for Generative Modeling (Lipman et al., ICLR 2023), π_0 Flow-Matching VLA (Black et al., Physical Intelligence, 2024), and Flow-GRPO (2025).',
    placement: 'Forms Stage 5 at the policy output, translating 15 Hz tactical representations into 60 Hz physical motor commands.'
  },
  {
    id: 't8', short: '4×51 Symlog HL-Gauss',
    title: 'Dual-Head 4×51 Symlog HL-Gauss Distributional Critic & Multi-Horizon PBRS',
    usedIn: ['priv_ctx', 'critic_heads', 'jepa_search', 'ppo_grpo_opt'],
    how: 'Predicts return distributions across 4 discount horizons—3 dense PBRS horizons γ_dense ∈ {0.95 (1s), 0.98 (2.5s), 0.995 (10s)} and 1 sparse match-outcome horizon γ_sparse = 0.9995—using 51 categorical bins spaced uniformly in symlog space z ∈ [-10, +10]. Trains two parallel heads: Privileged p_priv (using the 512B privileged context for GAE) and Observation-Only p_eval (for live Best-of-M search).',
    why: 'Scalar MSE value regression suffers from gradient explosion when sparse ±10 goal rewards collide with dense micro-rewards, and single-horizon discounting forces a false trade-off between immediate ball touches and long-term positioning.',
    contrib: 'Stabilizes critic training across orders of magnitude and enables risk-averse CVaR action selection during live play.',
    science: 'Returns G are compressed via symlog(x) = sign(x) ln(1 + |x|) onto 51 support atoms z_j = -10 + 0.4j and converted into soft Gaussian histogram targets using the Gauss error function erf((b_j - y)/(√2 σ_HL)) with σ_HL = 0.30. Dense PBRS shaping ΔΦ_{t,h} = m_dense γ_h^{Δm_t/8} Φ(s_{t+1}) - Φ(s_t) telescopes exactly at outer step boundaries.',
    origins: 'Combines Potential-Based Reward Shaping (Ng et al., 1999), Symlog transformations from DreamerV3 (Hafner et al., 2023), and HL-Gauss classification critics (Imani & White, 2018; Farebrother et al., ICML 2024).',
    placement: 'Situated in Stage 6, consuming ego + pooled entity states (plus c_priv in training) to supervise PPO/GRPO and score live JEPA rollouts.'
  },
  {
    id: 't9', short: 'ShadowTwin & JEPA Search',
    title: '120Hz C++20 RocketSimShadowTwin & Best-of-M JEPA Latent Search',
    usedIn: ['dma_slice', 'subtick_exec', 'jepa_search'],
    how: 'In live RLBot matches, a local C++20 RocketSim instance steps forward 1 tick at 120 Hz alongside the game client, reconciling sensor packets via a 2-stage residual corrector and calling the exact same Hex63ObsMapper::BuildArenaSlice function used in training. When Tier 0/1 compute headroom is available, the policy samples M = 16 candidate action chunks, rolls them forward 1 step in the Dual-Stream JEPA latent predictor, and picks the chunk maximizing CVaR value under p_eval.',
    why: 'Live socket packets omit internal suspension states, wheel raycast normals, and 4.0s future ball bounce trajectories. Recomputing observations via ad-hoc Python math causes fatal Sim-to-Live policy degradation.',
    contrib: 'Eliminates the Sim-to-Live observation gap by construction and filters out high-risk mechanical blunders before sending controls to the socket.',
    science: 'Dual-Stream JEPA predicts next-step ego and ball embeddings (z_hat_ego, z_hat_ball) = f_pred(h_ego, h_ball, u_chunk) supervised against a stop-gradient EMA target encoder (τ_ema = 0.996). Candidate chunks u^(m) are ranked by J(u^(m)) = w_eval^T v_eval + λ_cvar CVaR_α(v_sparse), governed by a 4-tier latency state machine keeping P99 <= 5.50 ms.',
    origins: 'Unifies Digital Twin state estimation with Joint-Embedding Predictive Architectures / I-JEPA (LeCun, 2022; Assran et al., 2023) and test-time compute scaling.',
    placement: 'Wraps the outer live runtime loop (Stage 1 input & Stage 6 output), bridging the 120 Hz RLBot socket with the GPU neural engine.'
  }
];

window.ARASHIKAGE_EXTERNAL_RESOURCES = {
  t0: [
    {
      badge: 'FOUNDATIONAL MONOGRAPH // ARXIV 2021',
      title: 'Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges',
      authors: 'M. M. Bronstein, J. Bruna, T. Cohen, P. Veličković (2021)',
      desc: 'Formalizes group-equivariant neural architectures over symmetry groups such as the Klein 4-group C_2v = {I, M_C2v, M_lat, M_C2v M_lat}, explaining why canonicalizing symmetries at the input manifold doubles sample efficiency and preserves geometric invariants.',
      url: 'https://arxiv.org/abs/2104.13478'
    },
    {
      badge: 'WHITE PAPER // ICML 2016',
      title: 'Group Equivariant Convolutional Networks (G-CNNs)',
      authors: 'T. S. Cohen, M. Welling — University of Amsterdam (ICML 2016)',
      desc: 'Introduces discrete group representations for reflections and rotations, providing the mathematical foundation for Arashikage’s chirality-preserving SO(3) team rotation M_C2v = diag(-1, -1, +1) and lateral reflection pseudovector parity laws.',
      url: 'https://arxiv.org/abs/1602.07576'
    },
    {
      badge: 'SYSTEMS & HPC REFERENCE // RED HAT',
      title: 'What Every Programmer Should Know About Memory (Cache Lines & DMA)',
      authors: 'Ulrich Drepper — Red Hat (2007)',
      desc: 'Detailed hardware treatise on 64-byte CPU cache lines, false-sharing prevention, SIMD alignment (alignas(64)), and zero-copy DMA transfers that govern the 5,376B (84 cache line) Hex63EntityNodeArenaSlice layout.',
      url: 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf'
    },
    {
      badge: 'WHITE PAPER // CVPR 2019',
      title: 'On the Continuity of Rotation Representations in Neural Networks',
      authors: 'Y. Zhou, C. Barnes, J. Lu, J. Yang, H. Li (CVPR 2019)',
      desc: 'Proves that Euler angles and quaternions exhibit topological discontinuities during gradient descent, motivating the continuous 6D Gram-Schmidt rotation basis (forward f_hat, up u_hat) stored in CarNode slots.',
      url: 'https://arxiv.org/abs/1812.07035'
    }
  ],
  t1: [
    {
      badge: 'WHITE PAPER // ICML 2021',
      title: 'Perceiver: General Perception with Iterative Attention',
      authors: 'A. Jaegle et al. — DeepMind (ICML 2021)',
      desc: 'Introduces asymmetric cross-attention where a compact set of dynamic latent queries (M = 16) attends over a larger context byte/entity array (N = 64), reducing quadratic O(N^2) self-attention complexity to O(M·N).',
      url: 'https://arxiv.org/abs/2103.03206'
    },
    {
      badge: 'WHITE PAPER // NATURE 2021',
      title: 'Highly Accurate Protein Structure Prediction with AlphaFold (Evoformer Pair Bias)',
      authors: 'J. Jumper et al. — DeepMind (Nature 2021)',
      desc: 'Pioneered injecting projected pairwise geometric distance and orientation tensors directly into attention logits as additive relational bias B_rel—the exact pattern used by our fused 16×64×72D GPU pairwise physics kernel.',
      url: 'https://www.nature.com/articles/s41586-021-03819-2'
    },
    {
      badge: 'WHITE PAPER // ICML 2019',
      title: 'Set Transformer: Permutation-Invariant Attention Networks',
      authors: 'J. Lee, Y. Lee, J. Kim, A. R. Kosiorek, S. Choi, Y. W. Teh (ICML 2019)',
      desc: 'Establishes permutation-equivariant entity set encoding with induced attention blocks, enabling a single network to handle 1v1, 2v2, and 3v3 car counts seamlessly via key-padding masks.',
      url: 'https://arxiv.org/abs/1810.00825'
    },
    {
      badge: 'WHITE PAPER // NEURIPS 2020',
      title: 'Fourier Features Let Networks Learn High Frequency Functions in Low Dimensions',
      authors: 'M. Tancik et al. — UC Berkeley / Google Research (NeurIPS 2020)',
      desc: 'Explains why raw Euclidean coordinates suffer from spectral bias in MLPs and how multi-scale sinusoidal Fourier bands [sin(ω_m d), cos(ω_m d)] resolve millimeter-scale wheel/ball contact alongside full-field clearances.',
      url: 'https://arxiv.org/abs/2006.10739'
    }
  ],
  t2: [
    {
      badge: 'WHITE PAPER // ICLR 2025',
      title: 'Differential Transformer (Noise-Canceling Dual-Softmax Attention)',
      authors: 'T. Ye, L. Dong, Y. Xia, Y. Sun, Y. Zhu, G. Huang, F. Wei — Microsoft Research (ICLR 2025)',
      desc: 'Primary architectural paper for Stage 2 & Stage 4 attention: splits queries and keys into two groups and subtracts a λ-scaled second softmax map to cancel common-mode attention noise over irrelevant context tokens.',
      url: 'https://arxiv.org/abs/2410.05258'
    },
    {
      badge: 'WHITE PAPER // ICLR 2024',
      title: 'Efficient Streaming Language Models with Attention Sinks',
      authors: 'G. Xiao, Y. Tian, B. Chen, S. Han, M. Lewis — MIT / Meta AI (ICLR 2024)',
      desc: 'Analyzes why standard softmax operators dump excess probability mass onto uninformative background tokens ("attention sinks")—the exact failure mode over 34 static boost pads that Differential Attention eliminates.',
      url: 'https://arxiv.org/abs/2309.17453'
    },
    {
      badge: 'TECHNICAL REPORT // ARXIV 2020',
      title: 'GLU Variants Improve Transformer (SwiGLU Feedforward Networks)',
      authors: 'Noam Shazeer — Google Brain (2020)',
      desc: 'Introduces bilinear Swish-Gated Linear Units (SwiGLU) used across the Bipartite Entity Encoder and Soft-MoE experts to improve gradient flow and multiplicative feature interactions.',
      url: 'https://arxiv.org/abs/2002.05202'
    }
  ],
  t3: [
    {
      badge: 'WHITE PAPER // GOOGLE RESEARCH 2025',
      title: 'Titans: Learning to Memorize at Test Time',
      authors: 'A. Behrouz, P. Zhong, V. Mirrokni — Google Research (2025)',
      desc: 'Primary paper for Stage 3: introduces test-time neural memory modules that update fast weights via a surprise-driven gradient with momentum M_t and adaptive forgetting α_t during live inference.',
      url: 'https://arxiv.org/abs/2501.00663'
    },
    {
      badge: 'WHITE PAPER // ICML 2024',
      title: 'Learning to (Learn at Test Time): RNNs with Expressive Hidden States (TTT)',
      authors: 'Y. Sun, X. Li, K. Dalal et al. — Stanford / UC Berkeley / Meta (ICML 2024)',
      desc: 'Formulates sequence hidden states as a machine learning model W_t updated by self-supervised reconstruction steps at test time, providing the theoretical basis for in-match opponent adaptation.',
      url: 'https://arxiv.org/abs/2407.04620'
    },
    {
      badge: 'WHITE PAPER // ICML 2021',
      title: 'Linear Transformers Are Secretly Fast Weight Programmers',
      authors: 'I. Schlag, K. Irie, J. Schmidhuber — IDSIA (ICML 2021)',
      desc: 'Demonstrates that outer-product memory updates require error-correcting Delta rules (W^T k - v) and norm control rather than unbounded Hebbian accumulation to prevent memory capacity saturation.',
      url: 'https://arxiv.org/abs/2102.11174'
    },
    {
      badge: 'FOUNDATIONAL PAPER // COGNITIVE SCIENCE 1987',
      title: 'Using Fast Weights to Deblur Old Memories',
      authors: 'G. E. Hinton, D. C. Plaut (1987)',
      desc: 'Classic foundational work introducing a two-timescale synapse architecture: slow weights trained across lifetimes (PPO/GRPO) paired with fast weights adapting rapidly to the current episode context.',
      url: 'https://www.cs.toronto.edu/~hinton/absps/fastweights87.pdf'
    }
  ],
  t4: [
    {
      badge: 'WHITE PAPER // META FAIR 2024',
      title: 'Training Large Language Models to Reason in a Continuous Latent Space (Coconut)',
      authors: 'S. Hao, S. Sukhbaatar, D. Su, X. Li, Z. Hu, J. Weston, Y. Tian — Meta FAIR (2024)',
      desc: 'Primary paper for Stage 4: replaces discrete step-by-step token generation with recurrent passes in continuous latent space, enabling breadth-first multi-trajectory reasoning before committing to an action.',
      url: 'https://arxiv.org/abs/2412.06769'
    },
    {
      badge: 'WHITE PAPER // ICLR 2019',
      title: 'Universal Transformers (Weight-Tied Depth Recurrence)',
      authors: 'M. Dehghani, S. Gouws, O. Vinyals, J. Uszkoreit, Ł. Kaiser — Google Brain (ICLR 2019)',
      desc: 'Introduces weight-tied transformer blocks iterated across recurrent depth steps k = 1..K with step embeddings e_pass(k), achieving high effective depth while keeping parameter footprints small enough for GPU L2 cache.',
      url: 'https://arxiv.org/abs/1807.03819'
    },
    {
      badge: 'WHITE PAPER // DEEPMIND 2021',
      title: 'PonderNet: Learning to Ponder (Adaptive Compute Depth)',
      authors: 'A. Banino, J. Balaguer, C. Blundell — DeepMind (2021)',
      desc: 'Formalizes variable-depth recurrent unrolling where the number of recurrent passes K_t adapts to problem difficulty and real-time latency constraints (Tier 0 K=6 vs. Tier 2 K=4).',
      url: 'https://arxiv.org/abs/2107.05407'
    }
  ],
  t5: [
    {
      badge: 'WHITE PAPER // ICLR 2024',
      title: 'From Sparse to Soft Mixtures of Experts (Soft-MoE)',
      authors: 'J. Puigcerver, C. Riquelme, B. Mustafa, N. Houlsby — Google DeepMind (ICLR 2024)',
      desc: 'Primary paper for Stage 4 MoE: replaces discrete Top-K token dropping/sorting with differentiable dispatch (Φ_disp) and combine (Φ_comb) slot weighted averages, making execution 100% static-shape and CUDAGraph-safe.',
      url: 'https://arxiv.org/abs/2308.00951'
    },
    {
      badge: 'WHITE PAPER // DEEPSEEK-AI 2024',
      title: 'Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts',
      authors: 'L. Wang et al. — DeepSeek-AI (2024)',
      desc: 'Introduces the gradient-free routing bias b_e^bal updated via sign-error feedback outside the optimizer so expert utilization stays balanced without polluting RL policy gradients with auxiliary penalties.',
      url: 'https://arxiv.org/abs/2408.15664'
    },
    {
      badge: 'WHITE PAPER // ACL 2024',
      title: 'DeepSeekMoE: Towards Ultimate Expert Specialization (Shared Expert Isolation)',
      authors: 'D. Dai et al. — DeepSeek-AI (ACL 2024)',
      desc: 'Demonstrates that pairing 1 always-active Shared Expert (capturing universal physics/kinematics) with fine-grained routed Specialist Experts prevents redundant knowledge duplication across experts.',
      url: 'https://arxiv.org/abs/2401.06066'
    }
  ],
  t6: [
    {
      badge: 'WHITE PAPER // ICLR 2024',
      title: 'Finite Scalar Quantization: VQ-VAE Made Simple (FSQ)',
      authors: 'F. Mentzer, D. Minnen, E. Agustsson, M. Tschannen — Google Research (ICLR 2024)',
      desc: 'Primary paper for Stage 4 skill bottleneck: replaces learned VQ-VAE codebooks and commitment losses with coordinate-wise tanh bounding and Straight-Through Estimator rounding onto a fixed integer grid.',
      url: 'https://arxiv.org/abs/2309.15505'
    },
    {
      badge: 'FOUNDATIONAL PAPER // NEURIPS 2017',
      title: 'Neural Discrete Representation Learning (VQ-VAE)',
      authors: 'A. van den Oord, O. Vinyals, K. Kavukcuoglu — DeepMind (NeurIPS 2017)',
      desc: 'Establishes discrete latent bottlenecks for compressing high-dimensional continuous representations into structured, interpretable discrete skill/intention codes.',
      url: 'https://arxiv.org/abs/1711.00937'
    },
    {
      badge: 'TECHNICAL PAPER // ARXIV 2013',
      title: 'Estimating or Propagating Gradients Through Stochastic Neurons (STE)',
      authors: 'Y. Bengio, N. Léonard, A. Courville — Université de Montréal (2013)',
      desc: 'Formalizes the Straight-Through Estimator z_q = z_b + stop_grad(round(z_b) - z_b) that enables end-to-end backpropagation through discrete integer rounding operations.',
      url: 'https://arxiv.org/abs/1308.3432'
    }
  ],
  t7: [
    {
      badge: 'WHITE PAPER // ARXIV 2025',
      title: 'Flow-GRPO: Training Flow Matching Models via Online Reinforcement Learning',
      authors: 'J. Liu et al. (2025)',
      desc: 'Primary paper for Stage 5 continuous control: converts deterministic Flow Matching ODEs into an equivalent Stochastic Differential Equation (SDE) whose Euler-Maruyama steps yield exact Gaussian log-probabilities for GRPO/PPO.',
      url: 'https://arxiv.org/abs/2505.05470'
    },
    {
      badge: 'WHITE PAPER // ICLR 2023',
      title: 'Flow Matching for Generative Modeling',
      authors: 'Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, M. Le — Meta AI (ICLR 2023)',
      desc: 'Introduces conditional Optimal Transport straight-line probability paths between Gaussian noise x_0 and target actions x_1, enabling accurate trajectory generation in just 4 Euler integration steps.',
      url: 'https://arxiv.org/abs/2210.02747'
    },
    {
      badge: 'WHITE PAPER // PHYSICAL INTELLIGENCE 2024',
      title: 'π_0: A Vision-Language-Action Flow Model for General Robot Control',
      authors: 'K. Black et al. — Physical Intelligence (2024)',
      desc: 'Demonstrates how coupling a transformer backbone with a conditional Flow-Matching action-chunk decoder unlocks high-frequency (50–60 Hz) dexterous motor control without mode-averaging.',
      url: 'https://arxiv.org/abs/2410.24164'
    },
    {
      badge: 'WHITE PAPER // RSS 2023',
      title: 'Learning Fine-Grained Bimanual Manipulation (Action Chunking / ACT)',
      authors: 'T. Z. Zhao, V. Kumar, S. Levine, C. Finn — Stanford / UC Berkeley (RSS 2023)',
      desc: 'Shows why predicting multi-subtick action chunks (K_sub = 4) eliminates compounding control jitter and allows coherent multi-frame maneuvers like speedflip pitch cancels.',
      url: 'https://arxiv.org/abs/2304.13705'
    },
    {
      badge: 'WHITE PAPER // DEEPSEEK-AI 2024',
      title: 'DeepSeekMath: Group Relative Policy Optimization (GRPO)',
      authors: 'Z. Shao et al. — DeepSeek-AI (2024)',
      desc: 'Introduces critic-free Group Relative Policy Optimization A_i = (R_i - μ_G) / σ_G across G = 8 parallel rollouts initialized from identical starting seeds (used in our 816 mechanics drill arenas).',
      url: 'https://arxiv.org/abs/2402.03300'
    }
  ],
  t8: [
    {
      badge: 'WHITE PAPER // ICML 2024',
      title: 'Stop Regressing: Training Value Functions via Classification for Scalable Deep RL',
      authors: 'J. Farebrother et al. — Google DeepMind / UC Berkeley (ICML 2024)',
      desc: 'Primary paper for Stage 6 Critic: proves that replacing scalar MSE value regression with categorical cross-entropy over Histogram Loss with Gaussian smoothing (HL-Gauss) prevents value gradient explosion.',
      url: 'https://arxiv.org/abs/2403.03950'
    },
    {
      badge: 'WHITE PAPER // NATURE / ARXIV 2023',
      title: 'Mastering Diverse Domains through World Models (DreamerV3 Symlog)',
      authors: 'D. Hafner, J. Pasukonis, J. Ba, T. Lillicrap (2023)',
      desc: 'Introduces the bijective symlog(x) = sign(x)·ln(1+|x|) and symexp(z) transformations that compress multi-scale rewards symmetrically around zero onto a fixed [-10, +10] support grid.',
      url: 'https://arxiv.org/abs/2301.04104'
    },
    {
      badge: 'FOUNDATIONAL PAPER // ICML 1999',
      title: 'Policy Invariance Under Reward Transformations: Theory and Application to Reward Shaping',
      authors: 'A. Y. Ng, D. Harada, S. Russell — UC Berkeley (ICML 1999)',
      desc: 'Proves that Potential-Based Reward Shaping F(s, s\') = γ·Φ(s\') - Φ(s) telescopes over trajectories and guarantees 100% optimal policy invariance while accelerating credit assignment.',
      url: 'https://people.eecs.berkeley.edu/~pabbeel/cs287-fa09/readings/NgHaradaRussell-shaping-ICML1999.pdf'
    },
    {
      badge: 'WHITE PAPER // ICML 2018',
      title: 'Improving Generalization in Regression with Histogram Losses (HL-Gauss)',
      authors: 'E. Imani, M. White — University of Alberta (ICML 2018)',
      desc: 'Derives the exact closed-form Gaussian CDF bin target probabilities p_j = 0.5·[erf((b_j - y)/(√2 σ)) - erf((b_{j-1} - y)/(√2 σ))] used in our 51-bin Symlog HL-Gauss value heads.',
      url: 'https://arxiv.org/abs/1806.04613'
    }
  ],
  t9: [
    {
      badge: 'POSITION MONOGRAPH // OPENREVIEW 2022',
      title: 'A Path Towards Autonomous Machine Intelligence (JEPA & World Models)',
      authors: 'Yann LeCun — Meta AI / Courant Institute NYU (2022)',
      desc: 'Foundational blueprint for Joint-Embedding Predictive Architectures (JEPA) that predict future representations in latent space rather than raw state/pixel space, enabling fast test-time planning.',
      url: 'https://openreview.net/forum?id=BZ5a1r-kVsf'
    },
    {
      badge: 'WHITE PAPER // CVPR 2023',
      title: 'Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture (I-JEPA)',
      authors: 'M. Assran et al. — Meta AI (CVPR 2023)',
      desc: 'Establishes the stop-gradient Exponential Moving Average (EMA) target encoder (τ_ema = 0.996) that prevents representation collapse in our Dual-Stream Ego/Ball JEPA predictor.',
      url: 'https://arxiv.org/abs/2301.08243'
    },
    {
      badge: 'FOUNDATIONAL PAPER // JOURNAL OF RISK 2000',
      title: 'Optimization of Conditional Value-at-Risk (CVaR)',
      authors: 'R. T. Rockafellar, S. Uryasev (Journal of Risk, 2000)',
      desc: 'Defines Conditional Value-at-Risk (CVaR_α) over the lower α-quantile of a return distribution, used by our Best-of-16 live search to filter out catastrophic defensive dives.',
      url: 'https://sites.math.washington.edu/~rtr/papers/rtr179-CVaR1.pdf'
    },
    {
      badge: 'SYSTEMS REPOSITORY // C++20 BULLET3',
      title: 'RocketSim: High-Performance C++ Physics Engine for Rocket League',
      authors: 'ZealanL (Open-Source C++20 / Bullet3 Physics Engine)',
      desc: 'Underlying 120 Hz rigid-body vehicle and arena collision engine powering both our 4,096-arena OpenMP BatchArenaEngine and the 1-tick live RocketSimShadowTwin.',
      url: 'https://github.com/ZealanL/RocketSim'
    }
  ]
};

// ============================================================================
// PATHWAY EXECUTION CONTEXTS & PER-BLOCK ROLE / BYPASS SPECIFICATIONS
// Explains each block's exact role, runtime expectations, or why it is disabled
// across All, Live 5.5ms, Train (4,096 Arenas), and Distill (Teacher Warm-Start)
// ============================================================================
window.ARASHIKAGE_PATHWAY_ROLES = {
  meta: {
    all: {
      name: 'All Pathways (Full Architecture)',
      short: 'All',
      regime: 'Full 17-Block Graph (Live + Train + Distill)',
      summary: 'Shows all subsystem blocks across live tournament inference, 4,096-arena RL training, and teacher-to-student warm-start distillation.'
    },
    live: {
      name: 'Live 5.5ms Tournament Inference',
      short: 'Live 5.5ms',
      regime: 'B=1 Arena · 15Hz / 60Hz Subtick · ≤5.50ms P99 SLA',
      summary: 'Hard real-time forward inference via RLBot v5 sockets and the 1-tick C++20 RocketSimShadowTwin. Blocks that rely on omniscient simulator state (#04) or gradient/cloner updates (#17) are disabled.'
    },
    train: {
      name: '4,096-Arena Hybrid RL Training',
      short: 'Train',
      regime: 'B=4,096 Arenas (816 G=8 GRPO + 2,880 PPO + 400 Boss)',
      summary: 'Parallel OpenMP rollout & learning loop combining critic-free G=8 cloned mechanics drills, 4-horizon Symlog GAE Flow-PPO self-play, and omniscient 512B critic supervision.'
    },
    distill: {
      name: 'Teacher Warm-Start Distillation',
      short: 'Distill',
      regime: 'Frozen Teacher (checkpoint_step_173650.pt) + .v5traj BC',
      summary: 'Supervised warm-start phase that transfers mechanical mastery and value calibration from frozen legacy teachers and .v5traj replay banks before online RL updates begin.'
    }
  },
  hex63: {
    dma_slice: {
      live: {
        regime: 'B=1 · RocketSimShadowTwin · c_priv Zero-Masked',
        text: 'Constructed every 66.7 ms (15 Hz) from live RLBot v5 socket packets corrected by the 1-tick C++20 RocketSimShadowTwin. Uses the exact same V5ObsMapper::BuildArenaSlice C++ code as training, except bytes 4864..5375 (privileged_critic_ctx) are hardware zero-filled (m_priv=0) for tournament legality.'
      },
      train: {
        regime: 'B=4,096 Arenas · 0.25ms OpenMP CPU -> Pinned DMA',
        text: 'Assembled in parallel across all 4,096 RocketSim arenas in 0.25 ms total CPU time and streamed to the GPU in a single 22 MB pinned-memory DMA transfer, with bytes 4864..5375 populated with full omniscient physics and curriculum drill metadata.'
      },
      distill: {
        regime: 'Paired Student (5,376B) + Teacher (700D) Views',
        text: 'Generated from .v5traj expert trajectory records and warm-start rollout arenas alongside the legacy 700D teacher vector so the Hex63 student observes the exact same physical pitch state as the frozen teacher.'
      }
    },
    dyn_nodes: {
      live: {
        regime: 'B=1 · 16 Active Queries · 4.0s BallRingBuffer480',
        text: 'Unpacks the 6 cars, 1 ball, 8 future ball bounce samples (stepped 480 ticks forward in the local ShadowTwin), and 1 match node (with live κ_Δt latency indicator) into 16×384 query tokens.'
      },
      train: {
        regime: 'B=4,096 · 1v1/2v2/3v3 Dynamic Slot Masking',
        text: 'Projects the 16 dynamic moving entities across all 4,096 arenas (1,440 1v1 + 864 2v2 + 576 3v3 + 816 drills + 400 boss), masking parked cars in 1v1/2v2 via car_validity_mask.'
      },
      distill: {
        regime: 'Supervised Entity Query Alignment',
        text: 'Encodes the 16 moving entities from teacher demonstration states so the student learns to extract velocity and bounce features from entity tokens rather than Gen 3\'s flat K=4 history stack.'
      }
    },
    env_nodes: {
      live: {
        regime: 'B=1 · 1-Tick ShadowTwin Wheel Raycasts',
        text: 'Supplies 34 boost pad timers, 6 goal posts, 4 nearest wall OBBs, and 4 ego wheel suspension raycasts reconstructed by the local C++20 ShadowTwin—giving zero-lag flip-reset detection even over UDP/TCP sockets.'
      },
      train: {
        regime: 'B=4,096 · Direct Bullet3 Raycast & Pad State',
        text: 'Reads exact 4-wheel contact normals, suspension travel, and pad cooldowns directly from the 4,096 parallel Bullet3 arena instances at every 15 Hz outer step.'
      },
      distill: {
        regime: 'Static & Semi-Static Arena Context Keys',
        text: 'Provides the 48 environment context keys during behavioral cloning and teacher distillation so attention heads anchor to boost pads, goalposts, and curved corner walls.'
      }
    },
    priv_ctx: {
      live: {
        regime: 'DISABLED IN LIVE (Bytes 4864..5375 Zero-Filled)',
        text: 'WHY DISABLED IN LIVE 5.5ms: In live RLBot tournament matches, hidden opponent states (exact fractional boost reserves, internal dodge timers, and curriculum drill seeds) cannot be observed legally. Bytes 4864..5375 are strictly zeroed (m_priv = 0), and live search relies on the observation-only critic head p_eval (#15) instead.'
      },
      train: {
        regime: 'B=4,096 · 128 Omniscient Floats -> p_priv Only',
        text: 'Active exclusively for the Privileged Critic head (p_priv in #15). Exposes exact hidden opponent physics, true subtick touch impulses, and curriculum scenario parameters so GAE advantage estimates have minimal variance.'
      },
      distill: {
        regime: 'Omniscient Critic Target Calibration',
        text: 'Feeds ground-truth simulator physics into the student\'s privileged critic head (p_priv) while distilling value distributions and PopArt moments from the teacher critic.'
      }
    },
    gpu_edges: {
      live: {
        regime: 'B=1 · 0.09ms Fused CUDA Kernel (1,024 Pairs)',
        text: 'Computes the 16×64×72D pairwise kinematics, closing speeds, time-to-closest-approach, and 32 Fourier distance bands on-chip in 0.09 ms, keeping CPU-to-GPU socket bandwidth tiny.'
      },
      train: {
        regime: 'B=4,096 · 4.19M Pairs/Step Fused in VRAM',
        text: 'Evaluates 4,096 × 1,024 = 4.19 million entity pairs per step entirely inside GPU registers/shared memory, avoiding 775 MB/step of PCIe traffic and backpropagating gradients into the per-head bias projections.'
      },
      distill: {
        regime: 'Geometric Attention Prior Warm-Start',
        text: 'Supplies exact physical intercept margins and Fourier distance features from step 0 of distillation so Bipartite DiffAttn heads immediately lock onto the ball and nearest challenger.'
      }
    },
    bipartite_enc: {
      live: {
        regime: 'B=1 · 0.36ms · Static CUDA Graph (FP16/BF16)',
        text: 'Runs 2 layers of 16×64 Bipartite Differential Attention inside the captured live CUDA Graph, subtracting the λ-weighted noise-canceling softmax map to isolate active threats in 0.36 ms.'
      },
      train: {
        regime: 'B=4,096 · Learnable Differential Noise Gain λ',
        text: 'Trains the query/key/value projections and per-head differential noise cancellation scalars λ across mixed 1v1, 2v2, and 3v3 arenas with variable car validity masks.'
      },
      distill: {
        regime: 'Representation Alignment from Teacher Trunk',
        text: 'Trained via cosine/MSE feature alignment and end-to-end action distillation to compress 64 arena tokens into clean 16×384 latent representations.'
      }
    },
    titans_prior: {
      live: {
        regime: 'B=1 · Kickoff M_t Reset · W_t Persists Full Match',
        text: 'Initializes fast weights W_0 = W_init at the start of a live match. On goals and kickoff resets, clears momentum M_t = 0 so stale pre-goal gradients do not carry over, while keeping adapted opponent weights W_t intact.'
      },
      train: {
        regime: 'B=4,096 · Meta-Learned Orthogonal Prior W_init',
        text: 'Updates the shared orthogonal meta-prior W_init via outer-loop backpropagation through time (BPTT) across thousands of diverse league opponents and boss bots.'
      },
      distill: {
        regime: 'Anchored at Orthogonal Prior W_init',
        text: 'Initializes fast-weight matrices at the orthogonal identity-scaled prior W_init and caches causal keys k_prev across sequential .v5traj demonstration steps.'
      }
    },
    titans_mem: {
      live: {
        regime: 'B=1 · Test-Time Learning (Slow Weights Frozen)',
        text: 'CRITICAL LIVE ROLE: While all slow network weights θ are frozen in live play, Titans updates its 2×4×32×32 FP32 fast weights W_t in-place every 66.7 ms (0.12 ms GPU) via Log-Cosh surprise gradients—adapting live to an opponent\'s fakes, demo habits, or boost starving.'
      },
      train: {
        regime: 'B=4,096 · Differentiable Fast-Weight Rollouts',
        text: 'Executes the inner-loop FP32 fast-weight update rule across 4,096 parallel arenas while outer-loop PPO/GRPO gradients train the key/value/query projections and surprise gate temperature.'
      },
      distill: {
        regime: 'Sequential Trajectory Memory Warm-Up',
        text: 'Unrolls the fast-weight memory update over multi-second replay sequences while enforcing the per-head Frobenius ball retraction (||W||_F <= 4.0) to guarantee numerical stability.'
      }
    },
    coconut_loop: {
      live: {
        regime: 'AdaptiveComputeGovernor: K_t ∈ {6, 4, 2} Passes',
        text: 'Dynamically governed by the 4-Tier AdaptiveComputeGovernor to guarantee the ≤5.50 ms P99 SLA: executes K_t = 6 recurrent passes at Tier 0 (<3.8 ms), steps down to K_t = 4 at Tier 1/2, or K_t = 2 under severe host GPU load.'
      },
      train: {
        regime: 'K_t=6 (816 Drills & 400 Boss) | K_t=4 (2,880 League)',
        text: 'Runs K_t = 6 recurrent passes on Block A (816 G=8 mechanics drills) and Block C (400 Boss arenas) for deep mechanical planning, and K_t = 4 on Block B (2,880 League arenas), supervised at each pass k by the 3D spatial anchor loss L_coconut.'
      },
      distill: {
        regime: 'K_t=4 Recurrent Unroll + 3D Spatial Anchor Loss',
        text: 'Loops K_t = 4 passes through the shared block while supervising the auxiliary 3D spatial focus head p_lat^(k) against ground-truth future ball/car positions.'
      }
    },
    soft_moe: {
      live: {
        regime: 'B=1 · Static Einsum Dispatch · Frozen Bias b_e^bal',
        text: 'Routes tokens across the 1 Shared + 8 Specialist experts (16 slots) via static-shape einsum matrices inside a single CUDA Graph with routing bias b_e^bal frozen.'
      },
      train: {
        regime: 'B=4,096 · DeepSeek Loss-Free Load Balancing Updates',
        text: 'Trains all 8 specialist experts in parallel while updating the loss-free load-balancing bias b_e^bal outside gradient descent after each rollout batch to prevent expert collapse without auxiliary loss interference.'
      },
      distill: {
        regime: 'Specialist Skill Partitioning Warm-Start',
        text: 'Routes diverse replay mechanics (ground dribbles, air dribbles, flip resets, shadow saves) into distinct specialist expert slots during teacher distillation.'
      }
    },
    fsq_bottleneck: {
      live: {
        regime: 'B=1 · Deterministic Discrete Rounding (1,000 Codes)',
        text: 'Quantizes the ego token into an exact discrete skill code in {-2,-1,0,1,2}^24 (8×125 = 1,000 codes) to condition the 60 Hz action decoder and stream live interpretable skill telemetry to the Command Center.'
      },
      train: {
        regime: 'B=4,096 · Straight-Through Estimator (STE) Gradients',
        text: 'Uses the Straight-Through Estimator z_q = z_b + stop_grad(round(z_b) - z_b) so PPO and GRPO policy gradients flow cleanly across the discrete 1,000-code bottleneck with zero VQ codebook loss.'
      },
      distill: {
        regime: 'Discrete Skill Codebook Seeding',
        text: 'Aligns the 8 cyclic 3D FSQ triplets with teacher skill embeddings and .v5traj mechanical labels so all 1,000 discrete codes receive balanced initial coverage.'
      }
    },
    stage1_bin: {
      live: {
        regime: 'B=1 · Mode / Low-Temp Sampling + M=16 Fan-Out',
        text: 'Evaluates the 16-way causal 4-subtick Jump/Double-Jump categorical distribution plus Boost and Handbrake. At Tier 0/1, samples M=16 or 8 high-probability binary sequences for JEPA search (#16) and sets exact double-jump flags m_dj,k.'
      },
      train: {
        regime: 'B=4,096 · Stochastic Categorical Exploration',
        text: 'Samples causal 4-subtick binary sequences stochastically across 4,096 arenas and evaluates exact discrete log-probabilities log π_θ(u_bin | s) for the combined discrete + continuous PPO/GRPO ratio.'
      },
      distill: {
        regime: 'Cross-Entropy & KL Supervision on Teacher Buttons',
        text: 'Trained via exact categorical cross-entropy / KL divergence against the teacher\'s jump, double-jump, boost, and handbrake decisions across 4 subticks.'
      }
    },
    stage2_flow: {
      live: {
        regime: 'B=1 · Low-Noise ODE Midpoint Integration (σ_τ → 0)',
        text: 'Integrates the 4-step velocity field v_θ in R^20 with minimal/zero diffusion noise for razor-sharp 60 Hz motor execution, applying the 0.12·tanh deadzone clamp on any subtick where m_dj,k = 1 to guarantee clean vertical stalls.'
      },
      train: {
        regime: 'B=4,096 · Stochastic Flow-GRPO SDE (σ_τ > 0)',
        text: 'Injects calibrated Wiener exploration noise σ_τ dW_τ across the 4 Euler integration steps so every step forms a tractable Gaussian transition with exact log-likelihood ratios for Flow-PPO and G=8 GRPO updates.'
      },
      distill: {
        regime: 'Conditional Flow Matching (CFM) Velocity Loss',
        text: 'Trained directly via simulation-free Conditional Flow Matching regression ||v_θ(x_τ, τ, c) - (u_expert - x_0)||^2 to reconstruct expert and teacher 60 Hz continuous control trajectories.'
      }
    },
    subtick_exec: {
      live: {
        regime: 'Live RLBot v5 120Hz Socket Loop (2 Ticks/Subtick)',
        text: 'Streams the 4 subtick controls across 8 live 120 Hz frames (holding each subtick for 2 ticks = 16.67 ms) directly to RLBot v5 sockets while stepping the local RocketSimShadowTwin in lockstep.'
      },
      train: {
        regime: 'B=4,096 · OpenMP C++20 Subtick Stepping & 192B Acc',
        text: 'Executes all 4 subticks (8 Bullet3 physics ticks) inside C++20 across 4,096 arenas with zero FlipState hijacking and records subtick touch masks, ball impulses, and demos into the 192B SubtickEventAccumulator.'
      },
      distill: {
        regime: 'Online DAgger Rollout Verification',
        text: 'Executes student 4-subtick action chunks in RocketSim during online teacher-student DAgger rollouts so the student learns to recover from its own 60 Hz state visitation distribution.'
      }
    },
    critic_heads: {
      live: {
        regime: 'ACTIVE (p_eval Head Only — p_priv Masked)',
        text: 'Evaluates ONLY the Observation-Only Critic head (p_eval) across the 4 Symlog horizons (since #04 c_priv is zeroed in live matches). Supplies 4-horizon expected values and lower-tail CVaR_α scores to #16 JEPA Search.'
      },
      train: {
        regime: 'ACTIVE (Dual p_priv + p_eval Heads · 4×51 Symlog)',
        text: 'Evaluates BOTH heads: p_priv (using #04 512B omniscient context) computes low-variance 4-horizon GAE advantages for #17, while p_eval is trained via HL-Gauss cross-entropy + KL distillation from p_priv.'
      },
      distill: {
        regime: '51-Bin Symlog HL-Gauss Value Pre-Calibration',
        text: 'Trains both 4×51 Symlog HL-Gauss heads on teacher value targets and empirical trajectory returns so the critic is pre-calibrated before online PPO/GRPO updates start (preventing early value-spike policy destruction).'
      }
    },
    jepa_search: {
      live: {
        regime: 'ACTIVE: Best-of-16 (Tier 0) / Best-of-8 (Tier 1) Search',
        text: 'PRIMARY LIVE ROLE: Fans out M = 16 (Tier 0) or M = 8 (Tier 1) candidate 4-subtick action chunks, rolls them 1 step forward in the Dual-Stream JEPA latent world model (0.80 ms), and picks the action maximizing p_eval + CVaR_α safety.'
      },
      train: {
        regime: 'ACTIVE (World-Model Loss L_jepa Only · M=1 Rollout)',
        text: 'During 4,096-arena training rollouts, M=16 test-time search is bypassed (M=1) so the actor explores stochastically at full throughput; instead, this block trains the Dual-Stream JEPA predictor against the stop-gradient EMA target encoder (τ=0.996).'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Dimmed on Diagram)',
        text: 'WHY DISABLED IN DISTILL: Warm-start distillation trains the actor and critic directly against the frozen teacher policy and .v5traj banks (#17). Running 16-candidate test-time JEPA search is unnecessary during supervised teacher cloning.'
      }
    },
    ppo_grpo_opt: {
      live: {
        regime: 'DISABLED IN LIVE (Forward Inference Only)',
        text: 'WHY DISABLED IN LIVE 5.5ms: Live RLBot matches run strictly in torch.inference_mode() within the 5.5 ms latency ceiling (#14 + #16). No G=8 arena cloning, PBRS reward scoring, or PPO/GRPO gradient updates run during a live game; mid-match adaptation is performed by #08 FP32 Titans fast weights.'
      },
      train: {
        regime: 'ACTIVE: 816 G=8 Cloned GRPO + 2,880 Flow-PPO Arenas',
        text: 'PRIMARY TRAINING ENGINE: Orchestrates 102 groups × G=8 = 816 bit-exact cloned mechanics drill arenas (critic-free intra-group normalized returns A^GRPO) alongside 2,880 full-match PFSP League arenas (4-horizon GAE Flow-PPO) and 400 Boss arenas.'
      },
      distill: {
        regime: 'ACTIVE: Teacher KL / Flow-Matching Warm-Start Loop',
        text: 'PRIMARY DISTILLATION ENGINE: Loads frozen teacher checkpoint_step_173650.pt and .v5traj banks, optimizing Conditional Flow Matching + discrete KL losses before gradually annealing the teacher tether into pure RL.'
      }
    }
  },
  // Specific overrides for Legacy Gen 3, Gen 2, and Gen 1 blocks where modes/roles differ
  gen3_perceiver: {
    priv_ctx: {
      live: {
        regime: 'DISABLED IN LIVE (700D Actor Input Only)',
        text: 'WHY DISABLED IN LIVE: The 68D privileged tail (exact 4-wheel slip ratios, world velocities, and 5 analytical future ball bounces) is training-only. The deployed live TorchScript capsule takes only the 700D canonical observation.'
      },
      train: {
        regime: 'ACTIVE: Appends 68D Tail -> 752D Omniscient Critic',
        text: 'Concatenates the 68D privileged physics & 5-bounce lookahead vector onto the 684D stack to form the 752D input for the N=43 ST-Perceiver Critic (#15).'
      },
      distill: {
        regime: 'ACTIVE: 752D Critic Warm-Start Input',
        text: 'Provides the 752D privileged observation during Gen 2 -> Gen 3 distillation so the ST-Perceiver Critic matches the Gen 2 teacher\'s PopArt value predictions.'
      }
    },
    fsq_bottleneck: {
      live: {
        regime: 'DISABLED IN LIVE (Stripped at TorchScript Export)',
        text: 'WHY DISABLED IN LIVE: In Gen 3, Compositional Skill Head Z_t (#11) is an auxiliary training-only head attached as a side-branch to h_trunk. Unlike Hex63\'s in-graph FSQ bottleneck, it is stripped out during TorchScript export for zero live latency cost.'
      },
      train: {
        regime: 'ACTIVE: 8 Macro · 32 Sub-Skill Auxiliary Loss',
        text: 'Supervises the 256D SwiGLU trunk against replay-mined skill labels (L_skill = CE_macro + CE_sub + MSE_phase) so h_trunk linearly separates 32 mechanical sub-skills.'
      },
      distill: {
        regime: 'ACTIVE: Auxiliary Skill Representation Retention',
        text: 'Maintains skill classification supervision on h_trunk while distilling action logits from the Gen 2 teacher.'
      }
    },
    critic_heads: {
      live: {
        regime: 'DISABLED IN LIVE (Actor-Only Live Execution)',
        text: 'WHY DISABLED IN LIVE: Gen 3 did not yet have Hex63\'s Dual-Head p_eval + JEPA test-time search (#16). The 752D ST-Perceiver Critic is used exclusively for GAE advantage estimation during training and distillation.'
      },
      train: {
        regime: 'ACTIVE: M=4 × N=43 Perceiver Critic + 3-Horizon PopArt',
        text: 'Processes N=43 tokens (including 5 spatial future ball bounce tokens) to predict 3 PopArt-normalized horizon values (γ = 0.990, 0.995, 0.998) for PPO GAE.'
      },
      distill: {
        regime: 'ACTIVE: PopArt (μ, σ) Moment Transfer & Value Fit',
        text: 'Copies running PopArt normalization moments (μ, σ) from the Gen 2 teacher and regresses the ST-Perceiver Critic heads onto teacher value targets.'
      }
    },
    jepa_search: {
      live: {
        regime: 'DISABLED IN LIVE (Offline/Online Warm-Start Bridge)',
        text: 'WHY DISABLED IN LIVE: Block #16 in Gen 3 is the Gen 2 -> Gen 3 KL & PopArt Distillation Bridge, which only runs during architecture migration before live deployment.'
      },
      train: {
        regime: 'BYPASSED IN PURE PPO TRAIN (Used in Distill Phase)',
        text: 'WHY BYPASSED IN TRAIN: Once the Gen 3 student has been warm-started from the Gen 2 teacher during the Distill phase, pure PPO self-play (#17) takes over.'
      },
      distill: {
        regime: 'PRIMARY DISTILLATION BRIDGE (Exact 7-Head Analytic KL)',
        text: 'Minimizes exact analytic categorical KL divergence across all 7 action heads between the frozen Gen 2 MLP teacher (on 684D) and the Gen 3 ST-Perceiver student (on 700D).'
      }
    },
    ppo_grpo_opt: {
      live: {
        regime: 'DISABLED IN LIVE (Forward Inference Only)',
        text: 'WHY DISABLED IN LIVE: Coupled Zero-Sum PBRS rewards, 5-way curriculum resets, and PFSP League matchmaking operate exclusively inside the training rollout loop.'
      },
      train: {
        regime: 'ACTIVE: Coupled Zero-Sum PBRS + 5-Way Curriculum + PFSP',
        text: 'Drives full-match and SkillshotInitiationBank PPO training across the Tri-Role PFSP League (65% Main, 20% Main Exploiter, 15% League Exploiter).'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Replaced by KL Distiller #16)',
        text: 'WHY BYPASSED IN DISTILL: During initial Gen 2 -> Gen 3 warm-start distillation, updates are driven by exact teacher KL divergence (#16) before switching to online PBRS PPO (#17).'
      }
    }
  },
  gen2_factorized: {
    priv_ctx: {
      live: {
        regime: 'DISABLED IN LIVE (684D Actor Stack Only)',
        text: 'WHY DISABLED IN LIVE: The 68D omniscient state (20D wheel slip/compression, 18D true world velocities, 30D 5-bounce lookahead) is not available in live RLBot packets and feeds only the 752D Training Critic (#15).'
      },
      train: {
        regime: 'ACTIVE: 68D Omniscient Tail -> 752D Privileged Critic',
        text: 'Appends 68 ground-truth simulator floats to the 684D actor stack so the 752D Privileged Critic (#15) can accurately value aerial wall setups and flip resets.'
      },
      distill: {
        regime: 'ACTIVE: Teacher Critic Target Export',
        text: 'Used when evaluating the frozen Gen 2 Privileged Critic to supervise downstream student critics.'
      }
    },
    bipartite_enc: {
      live: {
        regime: 'DISABLED IN LIVE (Real Socket Latency Present)',
        text: 'WHY DISABLED IN LIVE: Block #06 in Gen 2 is the LatencyDomainRandomizer, which injects artificial 0..2 tick delays during training. In live play, no artificial delay is added because real socket jitter is already present.'
      },
      train: {
        regime: 'ACTIVE: 0..2 Tick (0–16.7ms) Domain Randomization',
        text: 'Randomly delays observations by 0, 1, or 2 physics ticks during training rollouts to immunize the 684D MLP against live RLBot socket jitter.'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Zero-Lag Teacher Alignment)',
        text: 'WHY BYPASSED IN DISTILL: Teacher-to-student distillation aligns states at exact matching timestamps (δ_lag = 0) so action KL targets remain uncorrupted.'
      }
    },
    coconut_loop: {
      live: {
        regime: 'DISABLED IN LIVE (Offline Pro Replay Miner)',
        text: 'WHY DISABLED IN LIVE: Block #09 in Gen 2 is the SeqScout Replay Miner (WRAcc MCTS parser), which runs offline over .replay files to populate the training curriculum and skill labels.'
      },
      train: {
        regime: 'ACTIVE: Populates 27D SkillBank & Z_t Supervision',
        text: 'Extracts high-WRAcc mechanical initiation states and 32-class skill labels from pro replays to seed training arenas (#17) and supervise the Skill Aux Head (#11).'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Offline Pre-Computed Bank)',
        text: 'WHY BYPASSED IN DISTILL: Replay mining is completed prior to distillation; distilled policies consume the pre-mined trajectories and skill labels.'
      }
    },
    soft_moe: {
      live: {
        regime: 'DISABLED IN LIVE (Replay & Training Flip-Reset Detector)',
        text: 'WHY DISABLED IN LIVE: Block #10 in Gen 2 is the Dual-Mode Heuristic Flip-Reset Detector used to label replay segments and trigger training PBRS bonuses. Live inference does not run heuristic reward detectors.'
      },
      train: {
        regime: 'ACTIVE: 5-Gate Physics + Flag Flip-Reset Detector',
        text: 'Detects mid-air 4-wheel ball contacts across training arenas and replay streams to award flip-reset potential bonuses and label Z_t skill phases.'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Training/Mining Detector)',
        text: 'WHY BYPASSED IN DISTILL: Used during replay mining and online RL reward calculation rather than supervised logit distillation.'
      }
    },
    fsq_bottleneck: {
      live: {
        regime: 'DISABLED IN LIVE (Omitted from TorchScript Capsule)',
        text: 'WHY DISABLED IN LIVE: The Compositional Skill Auxiliary Head Z_t (#11) is a training-only side head on the 256D neck and is stripped from the deployed TorchScript actor.'
      },
      train: {
        regime: 'ACTIVE: 8 Macro × 32 Sub-Skill Auxiliary Supervision',
        text: 'Forces the 256D policy neck (#08) to encode distinct mechanical families and phase progression during PPO training.'
      },
      distill: {
        regime: 'ACTIVE: Auxiliary Skill Knowledge Transfer',
        text: 'Provides structured skill logits alongside the 31 action logits when distilling Gen 2 into Gen 3.'
      }
    },
    critic_heads: {
      live: {
        regime: 'DISABLED IN LIVE (Actor-Only Live Deployment)',
        text: 'WHY DISABLED IN LIVE: The 752D Privileged MLP Critic (#15) requires omniscient simulator features (#04) and is omitted from the live RLBot inference loop.'
      },
      train: {
        regime: 'ACTIVE: 752->512->512->256 MLP + 3 PopArt Heads',
        text: 'Computes 3-horizon PopArt-normalized value baselines (γ = 0.95, 0.98, 0.995) from the 752D omniscient state to drive PPO GAE.'
      },
      distill: {
        regime: 'ACTIVE: PopArt Value Teacher for Gen 3',
        text: 'Exports calibrated running PopArt moments (μ, σ) and value targets to warm-start the Gen 3 ST-Perceiver Critic.'
      }
    },
    jepa_search: {
      live: {
        regime: 'DISABLED IN LIVE (Training Reward Shaping Engine)',
        text: 'WHY DISABLED IN LIVE: Block #16 in Gen 2 is the Coupled Zero-Sum PBRS reward engine, which computes training rewards after physics steps and is not part of live action inference.'
      },
      train: {
        regime: 'ACTIVE: Coupled Zero-Sum 1v1 PBRS Reward Shaping',
        text: 'Computes potential-based shaping ΔΦ_t = γΦ(s\') - Φ(s) with zero-sum opponent coupling across all training arenas.'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Supervised KL Objective)',
        text: 'WHY BYPASSED IN DISTILL: Distillation optimizes supervised policy KL divergence rather than environmental PBRS rewards.'
      }
    },
    ppo_grpo_opt: {
      live: {
        regime: 'DISABLED IN LIVE (Training Curriculum & League)',
        text: 'WHY DISABLED IN LIVE: Block #17 in Gen 2 is the 5-Way Stratified Curriculum & Tri-Role PFSP League scheduler used only during training.'
      },
      train: {
        regime: 'ACTIVE: 5-Way Curriculum + SkillshotBank + PFSP League',
        text: 'Seeds training arenas across 5 curriculum branches (30% Pro, 25% HardNeg, 20% Perturb, 15% Kickoff, 10% SkillBank) and schedules TrueSkill PFSP opponents.'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Used in RL Phase)',
        text: 'WHY BYPASSED IN DISTILL: Full PFSP league matchmaking resumes after the student completes teacher warm-start distillation.'
      }
    }
  },
  gen1_ret40: {
    priv_ctx: {
      live: {
        regime: 'ACTIVE: Lockless Seqlock Live Diagnostics',
        text: 'Streams live step latency and PD controller error metrics into the 64-byte-aligned Lockless Seqlock shared memory buffer with zero mutex stalls.'
      },
      train: {
        regime: 'ACTIVE: 1,024-Arena OpenMP Seqlock Telemetry',
        text: 'Publishes rollout SPS, reward components, and quantile value summaries from the C++17 batch engine to the external training monitor.'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Offline Tensor Dataset Loop)',
        text: 'WHY BYPASSED IN DISTILL: Offline behavioral cloning / distillation runs over pre-allocated GPU tensor batches without stepping the C++ Seqlock IPC bridge.'
      }
    },
    fsq_bottleneck: {
      live: {
        regime: 'DISABLED IN LIVE (Main Policy Head Deployed Only)',
        text: 'WHY DISABLED IN LIVE: Block #11 in Gen 1 consists of the 4 Adversarial Exploiter Heads (Ball Denial, Demolition, Aerial, Boost Starve) used as sparring partners in training. Live matches deploy the Main Policy head (#09/#10).'
      },
      train: {
        regime: 'ACTIVE: 4 Archetype Exploiter Heads + Intrinsic Rewards',
        text: 'Trains 4 specialist adversarial heads driven by archetype-specific intrinsic rewards (demo closing speed, opponent-half big-pad steals) to harden the main agent.'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Main Policy Distilled Only)',
        text: 'WHY BYPASSED IN DISTILL: Distillation transfers only the primary competitive policy rather than the auxiliary adversarial sparring heads.'
      }
    },
    critic_heads: {
      live: {
        regime: 'DISABLED IN LIVE (Training Value Baseline Only)',
        text: 'WHY DISABLED IN LIVE: The 3-Horizon PopArt Critic (#15) computes GAE baselines during PPO training; live risk modulation uses the 32-Quantile CVaR Head (#16) instead.'
      },
      train: {
        regime: 'ACTIVE: 3-Horizon PopArt Value Critic (γ=0.95,0.98,0.995)',
        text: 'Predicts short, medium, and long-horizon PopArt-normalized scalar values from the 256D fused context to compute multi-horizon GAE advantages.'
      },
      distill: {
        regime: 'ACTIVE: Value Baseline Warm-Start',
        text: 'Calibrates the 3 PopArt value heads on demonstration return targets prior to PPO fine-tuning.'
      }
    },
    jepa_search: {
      live: {
        regime: 'ACTIVE: Dynamic Risk-Sensitive β(s) Quantile Readout',
        text: 'Evaluates the 32 monotonic return quantiles and integrates the lower α-tail up to the score/clock-dependent risk preference β(s) ∈ [0.05, 0.95].'
      },
      train: {
        regime: 'ACTIVE: 32-Quantile Huber Pinball Loss Training',
        text: 'Trains the N=32 non-crossing softplus quantile deltas via quantile regression Huber loss and supplies risk-averse CVaR_β advantages to PPO.'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Trained Online via QR Loss)',
        text: 'WHY BYPASSED IN DISTILL: Distributional return quantiles depend on the online policy\'s stochastic outcome distribution and are trained during RL rollouts.'
      }
    },
    ppo_grpo_opt: {
      live: {
        regime: 'DISABLED IN LIVE (Training Rollout Weight Stager)',
        text: 'WHY DISABLED IN LIVE: Block #17 in Gen 1 is the E=1024 StaticCUDAPolicyRunner & In-Place Weight Staging Engine that copies updated PPO weights after gradient epochs. Live play loads frozen weights once at match start.'
      },
      train: {
        regime: 'ACTIVE: E=1024 CUDA Graph & <5.56ms Weight Staging',
        text: 'Executes 1,024-arena rollouts inside a static CUDA Graph and copies updated parameters in-place after each PPO epoch without invalidating graph pointers.'
      },
      distill: {
        regime: 'BYPASSED IN DISTILL (Standard Batched Optimizer)',
        text: 'WHY BYPASSED IN DISTILL: Supervised distillation updates weights directly on mini-batches without requiring the 1,024-arena rollout weight-staging bridge.'
      }
    }
  }
};
