# Previous Platform (`rl-bot`) Authoritative Architecture & Evolution Specification

> [!IMPORTANT]
> **Epistemic Grounding**: Every subsystem, tensor dimension, C++ POD struct, neural layer, action head, and training mechanism below was extracted directly from the primary source tree of [`rl-bot`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram) across `src/`, `trainer_v3/`, `trainer_v5/`, `bot_bridge/`, `shared/`, and `docs/specs/`.

---

## 1. Platform Evolution Inside `rl-bot` (Three Generations Before `Arashikage Hex63`)

Our investigation of the [`rl-bot`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram) codebase reveals **three distinct architectural generations** that coexist in the repository (with automatic checkpoint detection in [`bot_bridge/main.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/bot_bridge/main.py#L56-L168) and teacher-student distillation in [`trainer_v5/distill/v4_to_v5_distiller.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/distill/v4_to_v5_distiller.py)):

```mermaid
flowchart LR
  subgraph G1["Gen 1: Apex V3 (RET-40 + PD Motor)"]
    A1["41×25 Entity Tokens\n+ 41×41×8 AVX2 r_ij"] --> A2["4-Layer SwiGLU\nRET-40 Transformer\n(d=128, H=4)"]
    A2 --> A3["Continuous Attitude Intent\nq* in S^3, omega* in R^3\n+ Bernoulli Jump"]
    A3 --> A4["120Hz Nonlinear\nAttitude PD Controller\n+ SLERP Trajectory"]
  end

  subgraph G2["Gen 2: V4.2 Factorized Egocentric + PSM-DCP"]
    B1["171D Egocentric Frame\n× K=4 Sliding Window\n= 684D / 700D Flat Obs"] --> B2["4-Layer Residual\nLayerNorm-SiLU MLP\n(684 -> 512 -> 512 -> 256)"]
    B2 --> B3["7 Factorized Discrete Heads\n(31 Logits / 25,200 Combos)\n+ Physics Logit Masking"]
    B2 --> B4["20D Skill-Intent Aux Head\n(8 Families / 32 Variants)\nfrom SeqScout Replay Miner"]
  end

  subgraph G3["Gen 3: V5 Spatio-Temporal Perceiver (ST-Perceiver)"]
    C1["In-Place 700D Unpacker\nSelf(62) + Ball(40) + Opp(42)\n+ 34×7 Pad Entities"] --> C2["Shared Pad PointNet\n+ 2x Pre-RMSNorm QK-Norm\nPerceiver (M=4 × N=37)"]
    C2 --> C3["2-Stage Autoregressive Heads\nStage 1: Jump/Boost -> 64D\nStage 2: Conditioned Dir"]
    C3 --> C4["8-Subtick C++/Py\nFlipState Jump-Edge\nActuation (120Hz)"]
  end

  G1 -->|Replaced PD bottleneck\nwith direct discrete tokens| G2
  G2 -->|Teacher->Student KL Distill\n(57% Nexto WR warm-start)| G3
```

| Generation | Codebase Modules | Observation Manifold | Backbone Architecture | Action Parameterization & Subtick Control | Critic & Value Estimation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gen 1 (`Apex V3 / RET-40`)** | [`trainer_v3/policy/transformer.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/transformer.py), [`src/relational_extractor.cpp`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/src/relational_extractor.cpp), [`trainer_v3/motor/attitude.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/motor/attitude.py) | `41 × 25` Entity Tokens (`100B` `EntityTokenPOD`) + `41 × 41 × 8` pairwise relational tensor $\mathbf{r}_{ij}$ (`53,792B` via AVX2 SIMD) | `RelationalTransformerRET40`: 4-layer, 4-head SwiGLU Transformer ($d_{\text{model}}=128$) with hoisted spatial bias $\mathbf{B}_{ij} = \text{MLP}_{\text{rel}}(\mathbf{r}_{ij})$ (`1.22M` params) | Continuous target quaternion $\mathbf{q}^* \in S^3$, target $\boldsymbol{\omega}^* \in [-5.5, 5.5]^3$, surface `[throttle, steer]`, `1`-logit Bernoulli jump, `[boost, handbrake, dodge]` gates $\to$ **120 Hz `NonlinearAttitudePD` + Geodesic SLERP** | [`MultiHorizonPopArtCritic`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/ml/critic.py#L355-L655): `256D` `[ego, c_global]` $\to$ `3` PopArt heads ($\gamma \in \{0.95, 0.98, 0.995\}$) + `32`-quantile `MonotonicQuantileCriticHead` ($\text{CVaR}_\beta$) |
| **Gen 2 (`V4.2 Factorized + PSM-DCP`)** | [`trainer_v3/policy/canonical_obs.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/canonical_obs.py), [`trainer_v3/policy/factorized_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/factorized_actor.py), [`trainer_v3/ml/privileged_critic.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/ml/privileged_critic.py) | `171D` Egocentric body-frame vector ($R_w^b$) stacked over $K=4$ frames = `684D` (+ `16D` wheel compression history = `700D`) | [`FactorizedActor`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/factorized_actor.py#L418-L690): `684/700 -> 512 -> 512 -> 256` LayerNorm + SiLU MLP (`~640K` params) + `CompositionalSkillAuxiliaryHead` (`8` families, `32` sub-variants, `13D` cont) | **7 Factorized Categorical Heads (`31` logits, `25,200` combinations)** with dynamic RocketSim physics logit masking ($-10^8$) + **8-subtick C++/Python `FlipState` jump-edge macro** | [`PrivilegedCritic`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/ml/privileged_critic.py#L391-L502): Asymmetric `752D` omniscient state (`684D` ego + `20D` wheel suspension/slip + `18D` world vel + `30D` 5-horizon bounce ballistics) $\to$ `512 -> 512 -> 256` MLP $\to$ `3` PopArt heads |
| **Gen 3 (`V5 ST-Perceiver`)** | [`trainer_v5/policy/st_perceiver_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py), [`trainer_v5/policy/st_perceiver_critic.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_critic.py), [`trainer_v5/distill/v4_to_v5_distiller.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/distill/v4_to_v5_distiller.py) | In-place unpacked `700D` tensor $\to$ `Self(62D)`, `Ball(40D)`, `Opp(42D)` temporal streams + `34 × 7D` Boost Pad entities | [`STPerceiverActor`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L267-L550): Shared Pad PointNet (`7->64->192`) + Fused Core SwiGLU (`144->3×192`) + **2x Pre-RMSNorm QK-Norm Perceiver Cross-Attention (`M=4 × N=37`)** with distance/cooldown pad bias + Residual SwiGLU Trunk (`912->256`) | **2-Stage Autoregressive Factorized Heads (`31` logits)**: Stage 1 samples `[Jump(4), Boost(4)]`, embeds them (`64D -> 256D`) into $\mathbf{h}_{\text{dir}}$, and Stage 2 conditions `[Throttle(3), Steer(7), Pitch(5), Yaw(5), Roll(3)]` | [`STPerceiverCritic`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_critic.py#L32-L230): Unpacks `752D` into `N=43` tokens (`3` Core + `34` Pads + `5` Ballistic tokens + `1` Omniscient token) $\to$ 2x Perceiver (`M=4 × N=43`) $\to$ `3` PopArt heads |

---

## 2. Head-to-Head Architectural Comparison: `rl-bot` vs. `Arashikage (Hex63)`

This table captures the exact engineering contrast between the previous [`rl-bot`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram) platform and the new clean-room [**Arashikage (`Hex63`)**](file:///C:/Users/strms/.gemini/antigravity/worktrees/arashikage/arashikage_architecture_diagram) platform:

| Subsystem Dimension | Previous Platform (`rl-bot` — V4.2 Factorized / V5 ST-Perceiver) | Current Platform (`Arashikage / Hex63`) | Why the Platform Evolved |
| :--- | :--- | :--- | :--- |
| **1. Schema & Cross-Language ABI** | Hand-maintained C++ structs in [`src/native_batch_engine.h`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/src/native_batch_engine.h) (`64B` `PerArenaSlotPOD`, `128B` `CarKinematicsPOD`, `100B` `EntityTokenPOD`) + Python `ctypes` structs | Declarative **17-struct Polyglot Schema SSoT** (`SCHEMA_CRC64 = 0x185109A0FD5E64D3`) generating C++20, Python `NamedSliceView`s, and TypeScript (`5,376B` Layout A `V5EntityNodeArenaSlice`) | Eliminated manual slice index drift (`obs[:, 35:171]`) and C++/Python struct layout mismatches via compile-time CRC64 verification. |
| **2. Coordinate Frame & Observation Manifold** | **Egocentric Vehicle Body Frame ($R_w^b$)**: `171D` frame stacked over $K=4$ steps (`684D` + `16D` wheel history = `700D`), unpacked into `3` core streams + `34` pads (`N=37` tokens, 1v1-fixed) | **Team-Normalized Canonical Arena Frame ($M_{\text{C2v}} \in SO(3)$)**: Heterogeneous **64-Node Entity Manifold (`5,376B` Layout A)** (`6` Cars, `1` Ball, `8` Ballistic Trajectory nodes, `1` Match node, `34` Boost Pads, `6` Goal posts, `4` Wheel nodes, `4` Surface rays + `128D` privileged ctx) | Egocentric $R_w^b$ rotates the entire world every tick when the car pitches/rolls in the air, coupling ego rotation noise into world perception and locking the slot count to 1v1. `Hex63` decouples arena-frame global geometry from body-local kinematics across `1v1`, `2v2`, and `3v3`. |
| **3. Relational & Attention Backbone** | **V4.2**: `684 -> 512 -> 512 -> 256` LayerNorm-SiLU MLP<br>**V5**: 2-layer Pre-RMSNorm + QK-Norm **Perceiver Cross-Attention (`M=4 × N=37`)** with scalar distance/cooldown pad bias | **16-Query × 48-Context Bipartite Entity Graph + 6-Layer Differential Attention (`DiffAttn`)** with $\text{SE}(3)$ pairwise kinematic bias + **Static-Shape `8×2` Soft-MoE (`16` slots)** | Upgraded from 2-layer `M=4` Perceiver to a 6-layer noise-canceling Differential Transformer over all 16 dynamic + 48 field entities with Soft-MoE specialist capacity. |
| **4. Temporal Memory & Opponent Modeling** | **Markov Sliding Window ($K=4$ frames = `0.267s`)**: Zero recurrent or fast-weight state across episode steps | **`2 × 4 × 32 × 32` `FP32 Titans` Neural Fast-Weight Memory** with surprise-driven gradient updates, momentum $\mathbf{M}_t$, and Frobenius ball retraction ($R_{\max}=4.0$) | A 4-frame (`267ms`) window cannot remember opponent boost pickups out of view or multi-second fake/conditioning patterns; `Titans` maintains full-match fast-weight associative memory. |
| **5. Latent Planning & Skill Bottleneck** | **Training-Only Auxiliary Head (`CompositionalSkillAuxiliaryHead`)**: Predicts `8` families + `32` sub-variants during training (`L_aux`), bypassed at inference | **In-Loop `Coconut` Continuous Latent Thought ($K_c \le 3$) + `8 × 125 = 1,000` `FSQ` Discrete Skill Bottleneck + `JEPA` Latent Forward Predictor** | Moved skill representation and multi-step lookahead *inside* the active inference loop via iterative `Coconut` latent reasoning and topological `FSQ` codes. |
| **6. Action Space & Subtick Control (`15 Hz` $\to$ `60/120 Hz`)** | **15 Hz Single-Step Factorized Categorical (`31` logits / `7` heads)** held for `8` ticks (`120 Hz`), relying on a hardcoded **C++/Python `FlipState` jump-edge macro** (`subtick 0` release, `subticks 1..4` hold, neutral pitch `-1.0f` override) | **`K_sub = 4` (`60 Hz`) Native Subtick Action Chunking** (`4 × 5` continuous Beta/Tanh-Normal via **Flow-GRPO ODE** + `4 × 3` exact $2^3=8$ Joint Binary Categoricals) with **Zero C++ `FlipState` Control Hijack** | Eradicated hardcoded C++ `FlipState` macro overrides and 15 Hz action-hold quantization; the policy directly controls every `60 Hz` (`2`-tick) subtick edge for frame-perfect speedflips, stalls, and wave-dashes. |
| **7. Value Critic & Return Scaling** | **Asymmetric `752D` `PrivilegedCritic` / `STPerceiverCritic`**: `3` scalar MSE heads with **PopArt linear weight surgery** ($\gamma \in \{0.95, 0.98, 0.995\}$) + `32`-quantile `MonotonicQuantileCriticHead` | **Dual-Head (`p_priv`, `p_eval`) `4 × 51` `Symlog HL-Gauss` Distributional Critic** over `[-10, +10]` ($\gamma_{\text{dense}} \in \{0.95, 0.98, 0.995\}$ + $\gamma_{\text{sparse}} = 0.9995$) | Replaced non-stationary PopArt weight surgery and single privileged head with scale-invariant `Symlog HL-Gauss` cross-entropy across 4 horizons, plus a deployable `p_eval` head for live MCTS/best-of-$N$ search. |
| **8. Curriculum, Replay Mining & League** | **Boxcars `SeqScout` Replay Miner** (`32` sub-variants) $\to$ Weighted BC $\to$ `V4ToV5Distiller` $\to$ **5-Way `StratifiedCurriculum`** + Tri-Role TrueSkill PFSP League | **4,096-Arena Hybrid Partition** (`816` $G=8$ Cloned `GRPO` drills + `2,880` PPO League + `400` External Boss arenas) + `1,024B` `.v5seed` Bank + **TrueSkill 2 + Elo-anchor PFSP** | Added exact Bullet3 $G=8$ cohort cloning for critic-free `Flow-GRPO` advantage estimation on high-variance mechanics alongside full-match PPO and live Boss Bot evaluation. |
| **9. Live Runtime & Telemetry Plane** | [`CanonicalStrmBotAgent`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/bot_bridge/runtime/canonical_agent.py) (`< 150μs–2ms` CPU TorchScript/ONNX) + `64B` Vyukov MPMC ring (`NativeTelemetryRing`) $\to$ SQLite WAL + FastHTML/HTMX Radar | **120 Hz C++20 `RocketSimShadowTwin` + 2-Stage Residual Corrector + 4-Tier `AdaptiveComputeGovernor` (`≤ 5.5ms` SLA)** + `256KB` Seqlock SHM (`0x35574253`) $\to$ React 19 + Three.js WebGL2 Command Center | Added a live 1-tick C++ `RocketSimShadowTwin` in the deployment capsule so the live agent has exact wheel/contact/ballistic parity (`INV-SIM-LIVE-OBS-IDENTITY`) with training. |

---

## 3. Complete 6-Stage / 17-Node Subsystem Dataset for the `rl-bot` Architecture Explorer

To render the `rl-bot` interactive architecture diagram with 100% functional and structural parity with [`arashikage/arch`](file:///C:/Users/strms/.gemini/antigravity/worktrees/arashikage/arashikage_architecture_diagram/arch/index.html), the `rl-bot` system is mapped onto the exact same **6-stage, 17-node, 24-edge, 10-technology, 5-scenario** topology:

### Stage 0: C++ Simulation & Egocentric Manifold (`120 Hz` Physics $\to$ `15 Hz` Frame)
1. **`n0` — `NativeArenaBatchEngine` (`120 Hz` OpenMP RocketSim)**
   - **Source**: [`src/native_batch_engine.h`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/src/native_batch_engine.h), [`src/native_batch_engine.cpp`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/src/native_batch_engine.cpp)
   - **Dimensions / Spec**: `E = 4,096` arenas (`180k+` Env SPS), `8` subticks per `15 Hz` macro step, `64B` `PerArenaSlotPOD` (layout v12), `128B` `CarKinematicsPOD`
   - **Formula**:
     $$\mathbf{s}_{t+1} = \mathcal{F}_{\text{RocketSim}}^{(8)}\!\left(\mathbf{s}_t, \mathbf{u}_t, \text{FlipState}_t\right), \quad \Delta t_{\text{sub}} = \frac{1}{120}\text{ s}$$
2. **`n1` — Egocentric Body-Frame Extractor (`171D` Single Frame)**
   - **Source**: [`trainer_v3/policy/canonical_obs.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/canonical_obs.py#L81-L199)
   - **Dimensions / Spec**: `171` floats (`10D` Self + `9D` Ball + `10D` Opp + `6D` Goal dirs + `136D` = `34 × 4` Canonical Boost Pads with `ORANGE_PAD_PERMUTATION`)
   - **Formula**:
     $$\mathbf{v}_{\text{local}} = \mathbf{R}_{\text{car}}^\top (\mathbf{v}_{\text{world}} - \mathbf{v}_{\text{car}}), \quad \mathbf{g}_{\text{local}} = -\mathbf{R}_{\text{car}}[2, :], \quad \mathbf{o}_t \in \mathbb{R}^{171}$$
3. **`n2` — $K=4$ Sliding Window & Wheel History (`684D` / `700D`)**
   - **Source**: [`trainer_v3/policy/canonical_obs.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/canonical_obs.py#L201-L273)
   - **Dimensions / Spec**: `4 × 171D = 684D` (`[t, t-1, t-2, t-3]`) + `16D` (`4 × 4`) wheel compression history = `700D`, plus `LatencyDomainRandomizer` (`0–2` ticks)
   - **Formula**:
     $$\mathbf{x}_t^{\text{actor}} = \operatorname{concat}\!\left(\mathbf{o}_t, \mathbf{o}_{t-1}, \mathbf{o}_{t-2}, \mathbf{o}_{t-3}, \mathbf{w}_{t:t-3}\right) \in \mathbb{R}^{700}$$
4. **`n3` — Omniscient Privileged State & 5-Horizon Ballistics (`752D`)**
   - **Source**: [`trainer_v3/ml/privileged_critic.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/ml/privileged_critic.py#L46-L280)
   - **Dimensions / Spec**: `684D` ego obs + `20D` wheel suspension/normals/slip + `18D` world velocities + `30D` 5-horizon ballistic bounce lookahead ($\Delta t \in \{0.1, 0.25, 0.5, 1.0, 1.5\}\text{ s}$, restitution $e=0.6$)
   - **Formula**:
     $$\hat{\mathbf{p}}_{\text{ball}}(\Delta t) = \mathbf{p}_0 + \mathbf{v}_0 \Delta t + \tfrac{1}{2}\mathbf{g}\Delta t^2 \xrightarrow{\text{bounce } e=0.6} \mathbf{x}_t^{\text{priv}} \in \mathbb{R}^{752}$$

### Stage 1: Spatio-Temporal Unpacking & Entity Tokenization
5. **`n4` — Zero-Copy 700D Spatio-Temporal Unpacker**
   - **Source**: [`trainer_v5/policy/st_perceiver_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L107-L165)
   - **Dimensions / Spec**: Unpacks `[B, 700]` in-place into `x_self` (`62D`), `x_ball` (`40D` w/ finite-diff accel $\Delta\mathbf{v}_b$), `x_opp` (`42D` w/ 4-frame boost burn $\Delta b_{\text{opp}}$), and `pad_entities` (`34 × 7D`)
   - **Formula**:
     $$\mathbf{x}_{700} \mapsto \left(\mathbf{x}_{\text{self}} \in \mathbb{R}^{62},\; \mathbf{x}_{\text{ball}} \in \mathbb{R}^{40},\; \mathbf{x}_{\text{opp}} \in \mathbb{R}^{42},\; \mathbf{E}_{\text{pads}} \in \mathbb{R}^{34 \times 7}\right)$$
6. **`n5` — Fused Temporal Core SwiGLU Encoder (`144D` $\to$ `3 × 192D`)**
   - **Source**: [`trainer_v5/policy/st_perceiver_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L302-L398)
   - **Dimensions / Spec**: Concatenates `[x_self(62), x_ball(40), x_opp(42)] = 144D` $\to$ `SwiGLUFFN(144, 96, 576)` $\to$ `3` core tokens `[Self, Ball, Opp]` + learned `type_embed_core` `(1, 3, 192)`
   - **Formula**:
     $$\mathbf{T}_{\text{core}} = \operatorname{reshape}\!\left(\mathbf{W}_{\text{down}}\!\left(\operatorname{SiLU}(\mathbf{W}_g \mathbf{x}_{\text{core}}) \odot \mathbf{W}_u \mathbf{x}_{\text{core}}\right),\; [B, 3, 192]\right) + \mathbf{E}_{\text{type}}^{\text{core}}$$
7. **`n6` — Shared Boost Pad PointNet (`34 × 7D` $\to$ `34 × 192D`)**
   - **Source**: [`trainer_v5/policy/st_perceiver_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L85-L105)
   - **Dimensions / Spec**: Weight-shared 2-layer PointNet (`7 -> 64 -> 192`) over `[rel_x, rel_y, rel_z, tau, delta_tau, is_big_pad, dist_norm]` + `type_embed_pad`
   - **Formula**:
     $$\mathbf{T}_{\text{pads}, i} = \mathbf{W}_2 \operatorname{SiLU}(\mathbf{W}_1 \mathbf{e}_{\text{pad}, i} + \mathbf{b}_1) + \mathbf{b}_2 + \mathbf{e}_{\text{type}}^{\text{pad}}, \quad i \in \{0..33\}$$

### Stage 2: Latent Perceiver Cross-Attention & Residual Trunk
8. **`n7` — 2-Layer Pre-RMSNorm + QK-Norm Perceiver (`M=4 × N=37`)**
   - **Source**: [`trainer_v5/policy/st_perceiver_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L168-L265)
   - **Dimensions / Spec**: `M=4` queries (`[Self, Ball, Opp, TacticalQuery]`) cross-attending over `N=37` keys/values (`[3 Core + 34 Pads]`, $d=192, H=4, d_h=48$) with QK-Norm and learned spatial/cooldown pad bias
   - **Formula**:
     $$\mathbf{A}_{h, m, j} = \frac{\operatorname{RMSNorm}(\mathbf{q}_{h,m})\operatorname{RMSNorm}(\mathbf{k}_{h,j})^\top}{\sqrt{d_h}} + \underbrace{\left(-w_{\text{dist}, h} d_j - w_{\text{cd}, h}(1 - \tau_j) + w_{\text{big}, h}\mathbb{I}_{\text{big}, j}\right)}_{\text{Boost Pad Spatial & Cooldown Bias } (j \ge 3)}$$
9. **`n8` — Policy Fusion & Residual SwiGLU Trunk (`912D` $\to$ `256D`)**
   - **Source**: [`trainer_v5/policy/st_perceiver_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L319-L421) & [`trainer_v3/policy/factorized_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/factorized_actor.py#L438-L448)
   - **Dimensions / Spec**: Fuses flattened Perceiver queries (`4 × 192 = 768D`) + skip-connection `x_core` (`144D`) = `912D` $\to$ `Linear(912, 256)` $\to$ Pre-RMSNorm Residual SwiGLU Trunk $\mathbf{h}_{\text{trunk}} \in \mathbb{R}^{B \times 256}$ (or V4.2 `684 -> 512 -> 512 -> 256` LayerNorm-SiLU MLP)
   - **Formula**:
     $$\mathbf{z}_0 = \operatorname{SiLU}(\operatorname{RMSNorm}(\mathbf{W}_{\text{fuse}}[\mathbf{Q}_{\text{flat}}; \mathbf{x}_{\text{core}}])), \quad \mathbf{h}_{\text{trunk}} = \operatorname{RMSNorm}\!\left(\mathbf{z}_0 + \operatorname{SwiGLU}(\operatorname{RMSNorm}(\mathbf{z}_0))\right)$$
10. **`n9` — Compositional Skill Auxiliary Head ($\mathcal{Z}_t$, `53` Outputs)**
    - **Source**: [`trainer_v3/policy/factorized_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/factorized_actor.py#L287-L353)
    - **Dimensions / Spec**: Training-only auxiliary head predicting `8` Macro Skill Families $f_t \in \{0..7\}$, `32` Sub-Variants $s_t \in \{0..31\}$, and `13D` continuous phase/mechanics vector $[\phi_t(1), \mathbf{d}_t(8), \mathbf{b}_t(4)]$
    - **Formula**:
      $$\mathcal{L}_{\text{aux}} = \lambda_{\text{fam}}\operatorname{CE}(\hat{\mathbf{f}}_t, f_t) + \mathbb{I}(f_t > 0)\!\left[\lambda_{\text{sub}}\operatorname{CE}(\hat{\mathbf{s}}_t, s_t) + \lambda_{\text{cont}}\operatorname{Huber}(\hat{\mathbf{c}}_t, \mathbf{c}_t)\right]$$

### Stage 3: Physics Logit Masking & 2-Stage Autoregressive Action Heads (`31` Logits)
11. **`n10` — Dynamic RocketSim Physics Action Masker (`31` Booleans)**
    - **Source**: [`trainer_v3/policy/factorized_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/factorized_actor.py#L95-L132), [`trainer_v3/policy/canonical_obs.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/canonical_obs.py#L392-L426)
    - **Dimensions / Spec**: Masks invalid action tokens to `-1e8`: Boost tokens `{1, 3}` when `boost <= 1e-4`; First Jump `{1}` when airborne outside `0.20s` hold window; Double Jump & Flip Dodge `{2, 3}` when grounded or `air_time >= 1.25s` without flip reset
    - **Formula**:
      $$\tilde{\ell}_{h, k} = \begin{cases} \ell_{h, k} & \text{if } M_{h, k}(\mathbf{s}_t) = \text{True} \\ -10^8 & \text{if } M_{h, k}(\mathbf{s}_t) = \text{False} \end{cases}$$
12. **`n11` — Stage 1 Impulse / Regime Heads (`Jump[4]`, `Boost/Brake[4]`)**
    - **Source**: [`trainer_v5/policy/st_perceiver_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L328-L331)
    - **Dimensions / Spec**: Evaluates and samples discrete `Jump` (`[None, 1st Jump, Dbl Jump, Flip Dodge]`) and `Boost/Brake` (`[Coast, Boost, Handbrake, Boost+Brake]`) from $\mathbf{h}_{\text{trunk}}$
    - **Formula**:
      $$a_{\text{jump}} \sim \operatorname{Cat}\!\left(\operatorname{softmax}(\tilde{\boldsymbol{\ell}}_{\text{jump}})\right), \quad a_{\text{boost}} \sim \operatorname{Cat}\!\left(\operatorname{softmax}(\tilde{\boldsymbol{\ell}}_{\text{boost}})\right)$$
13. **`n12` — Autoregressive Action Conditioning Bridge (`64D` $\to$ `256D`)**
    - **Source**: [`trainer_v5/policy/st_perceiver_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L333-L336), [`L423-L450`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L423-L450)
    - **Dimensions / Spec**: Embeds Stage 1 `(a_jump, a_boost)` decisions into `64D` embeddings (`soft` probability-weighted expectation during TorchScript trace or `hard` token lookup during rollout/PPO) and shifts $\mathbf{h}_{\text{trunk}} \to \mathbf{h}_{\text{dir}} \in \mathbb{R}^{B \times 256}$
    - **Formula**:
      $$\mathbf{h}_{\text{dir}} = \operatorname{RMSNorm}\!\left(\mathbf{h}_{\text{trunk}} + \mathbf{W}_{\text{cond}}\operatorname{SiLU}\!\left(\mathbf{E}_{\text{jump}}[a_{\text{jump}}] + \mathbf{E}_{\text{boost}}[a_{\text{boost}}]\right)\right)$$
14. **`n13` — Stage 2 Conditioned Directional Heads (`23` Logits / `7×7` Fused Kernel)**
    - **Source**: [`trainer_v5/policy/st_perceiver_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_actor.py#L338-L344), [`trainer_v3/policy/factorized_actor.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/policy/factorized_actor.py#L195-L249)
    - **Dimensions / Spec**: Projects conditioned $\mathbf{h}_{\text{dir}}$ into `Throttle(3)`, `Steer(7)`, `Pitch(5)`, `Yaw(5)`, `Roll(3)` (`23` directional logits + `8` Stage 1 logits = `31` total logits across `25,200` combinations), evaluated via zero-sync padded `(B, 7, 7)` log-softmax
    - **Formula**:
      $$\log \pi_\theta(\mathbf{a}_t \mid \mathbf{s}_t) = \sum_{h \in \{\text{jump}, \text{boost}\}} \log \pi_h(a_{t,h} \mid \mathbf{h}_{\text{trunk}}) + \sum_{d \in \{\text{th, st, pi, ya, ro}\}} \log \pi_d(a_{t,d} \mid \mathbf{h}_{\text{dir}})$$

### Stage 4: Subtick Actuation & Live RLBot v5 Bridge (`15 Hz` $\to$ `120 Hz`)
15. **`n14` — 8-Subtick `FlipState` Jump-Edge Macro & RLBot v5 FlatBuffers Bridge**
    - **Source**: [`src/native_batch_engine.cpp`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/src/native_batch_engine.cpp#L999-L1101), [`bot_bridge/runtime/canonical_agent.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/bot_bridge/runtime/canonical_agent.py#L559-L622)
    - **Dimensions / Spec**: Holds `15 Hz` action across `8` subticks (`120 Hz`); when airborne `jump_token in {2, 3}`, triggers 8-subtick jump-edge state machine (`sub=0: jump=0`, `sub=1..4: jump=1`, `sub=5..7: jump=0`) and C++ neutral-stick pitch override (`-1.0f` on `sub=1..2`), emitting `< 150μs` FlatBuffers `ControllerState`
    - **Formula**:
      $$\text{jump}_{\text{sub}}(k) = \begin{cases} 0 & k = 0 \text{ (falling-edge reset)} \\ 1 & k \in \{1, 2, 3, 4\} \text{ (dodge/double-jump fire)} \\ 0 & k \in \{5, 6, 7\} \end{cases}$$

### Stage 5: Asymmetric Critic, Replay Skill Mining & League Training
16. **`n15` — Asymmetric Privileged Critic & Multi-Horizon PopArt (`752D` $\to$ `3` Horizons)**
    - **Source**: [`trainer_v5/policy/st_perceiver_critic.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/policy/st_perceiver_critic.py#L32-L230), [`trainer_v3/ml/privileged_critic.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/ml/privileged_critic.py#L349-L502), [`trainer_v3/ml/critic.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/ml/critic.py#L174-L299)
    - **Dimensions / Spec**: `STPerceiverCritic` (`M=4 × N=43` tokens: `3` Core + `34` Pads + `5` Ballistic tokens + `1` Omniscient token) $\to$ `3` PopArt value heads ($\gamma \in \{0.95, 0.98, 0.995\}$ / $\{0.990, 0.995, 0.998\}$) with exact affine weight/Adam surgery + `32`-quantile `MonotonicQuantileCriticHead`
    - **Formula**:
      $$\mathbf{W}_{\text{new}} = \frac{\sigma_{\text{old}}}{\sigma_{\text{new}}}\mathbf{W}_{\text{old}}, \quad \mathbf{b}_{\text{new}} = \frac{\sigma_{\text{old}}\mathbf{b}_{\text{old}} + \mu_{\text{old}} - \mu_{\text{new}}}{\sigma_{\text{new}}}, \quad A_t^{\text{comb}} = \sum_{m=1}^3 w_m \frac{A_{t,m} - \mu_{A_m}}{\sigma_{A_m}}$$
17. **`n16` — `SeqScout` Replay Skill Miner, V4$\to$V5 Distiller & Tri-Role PFSP League**
    - **Source**: [`trainer_v3/replay/skillshot_miner.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/replay/skillshot_miner.py), [`trainer_v5/distill/v4_to_v5_distiller.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v5/distill/v4_to_v5_distiller.py), [`trainer_v3/rewards/progress_engine.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/rewards/progress_engine.py), [`trainer_v3/curriculum/stratified_curriculum.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/curriculum/stratified_curriculum.py), [`trainer_v3/training/league.py`](file:///C:/Users/strms/.gemini/antigravity/worktrees/rl-bot/arashikage_architecture_diagram/trainer_v3/training/league.py)
    - **Dimensions / Spec**: Rust Boxcars `30–60 Hz` replay mining (`359.8` replays/s, `8` families, `32` sub-variants) $\to$ Teacher-Student KL Distillation $\to$ Coupled Zero-Sum 1v1 PBRS ($\Phi_{\text{blue}} + \Phi_{\text{orange}} \equiv 0$) $\to$ 5-Way Stratified Curriculum (`40%` Kickoff, `20%` Striker, `20%` Save, `10%` Aerial, `10%` Wall) + Tri-Role Bayesian TrueSkill PFSP League
    - **Formula**:
      $$\Phi_{\text{blue}}(s) = 0.50\frac{y_b}{5120} + 0.40\tanh\!\left(\frac{v_{y,b}}{1800}\right) + 0.22\left(e^{-d_{\text{blue}}/2500} - e^{-d_{\text{opp}}/2500}\right) + 0.10\left(\sqrt{b_{\text{blue}}} - \sqrt{b_{\text{opp}}}\right) + 0.14\Delta_{\text{shadow}}$$

---

## 4. Underlying Technology Library (`T0..T9`) for `rl-bot` Deep Dive

1. **`T0` — Egocentric $SO(3)$ Body-Frame Kinematics & $C_{2v}$ Pad Involution (`canonical_obs.py`)**
   - Rotating world vectors by $\mathbf{R}_{\text{car}}^\top$, projecting local gravity $-\mathbf{R}_{\text{car}}[2,:]$, and applying bijective 34-pad `ORANGE_PAD_PERMUTATION` involutions.
2. **`T1` — Shared PointNet & Spatio-Temporal Entity Unpacking (`SharedBoostPadPointNet`)**
   - Weight-shared permutation-equivariant PointNet (`Qi et al., 2017`) over `34 × 7D` boost pads paired with `144D` fused temporal core SwiGLU streams.
3. **`T2` — Pre-RMSNorm + QK-Norm Perceiver Cross-Attention (`PerceiverCrossAttentionBlock`)**
   - Jaegle et al. (`Perceiver IO`) asymmetric cross-attention (`M=4 × N=37`) stabilized by Dehghani et al. (`QK-Norm`) and learned spatial/cooldown attention biases.
4. **`T3` — SwiGLU Feed-Forward Networks & Fused Head Kernels (`SwiGLUFFN` & `_FusedHeadLinearFn`)**
   - Shazeer (`2020`) multiplicative SiLU gating paired with custom zero-`torch.cat` autograd linear projection and `7×7` padded GPU categorical sampling.
5. **`T4` — Two-Stage Autoregressive Action Conditioning & Physics Logit Masking (`STPerceiverActor`)**
   - Vinyals et al. (`AlphaStar`) / OpenAI (`Dota 2`) autoregressive factorized action heads conditioned on impulse regime (`Jump`, `Boost`) with exact RocketSim boolean logit masking ($-10^8$).
6. **`T5` — 8-Subtick Jump-Edge Flip State Machine & Legacy Geodesic Attitude PD (`FlipState` / `NonlinearAttitudePD`)**
   - Contrasts Gen 1's `120 Hz` $SO(3)$ quaternion PD controller (`attitude.py`) with Gen 2/3's discrete token decoding + 8-subtick C++/Python `FlipState` falling/rising jump-edge state machine.
7. **`T6` — Asymmetric Privileged Critic & 5-Horizon Bounce Ballistics (`PrivilegedCritic` / `STPerceiverCritic`)**
   - Pinto et al. (`Asymmetric Actor-Critic`) evaluating `752D` omniscient state (`20D` tire suspension/slip + `18D` world velocities + `30D` 5-horizon bounce ballistics) over `N=43` Perceiver tokens.
8. **`T7` — Multi-Horizon PopArt Weight Surgery & Monotonic Quantile CVaR (`PopArtLayer` / `MonotonicQuantileCriticHead`)**
   - Hessel et al. (`PopArt`) exact affine weight/Adam rescaling across $\gamma \in \{0.95, 0.98, 0.995\}$ paired with Dabney et al. (`QR-DQN`) softplus-monotonic 32-quantile CVaR tail risk.
9. **`T8` — Native-Rate Replay Skillshot Mining (`SeqScout`) & Compositional Skill Supervision ($\mathcal{Z}_t$)**
   - Rust `Boxcars` `30–60 Hz` replay parsing (`359.8` replays/s), dual-mode flip reset detection (`8` families, `32` sub-variants), WRAcc MCTS `SeqScout` subgroup discovery, and `V4ToV5Distiller` teacher-student KL distillation.
10. **`T9` — Coupled Zero-Sum PBRS, 5-Way Stratified Curriculum & Tri-Role TrueSkill PFSP League**
    - Ng et al. (`1999`) telescoping zero-sum potential $\Phi_{\text{blue}} + \Phi_{\text{orange}} \equiv 0$, `SkillshotInitiationBank` entry/apex seeding (`phi=0.0 / 0.5`), and AlphaStar Tri-Role (`Main`, `Main Exploiter`, `League Exploiter`) Bayesian TrueSkill PFSP matchmaking.
