// Arashikage (Hex63) — Main Application Controller, 5-Tab Inspector/Deep-Dive & Fullscreen Drawer
(function () {
  const nodes = window.ARASHIKAGE_NODES || [];
  const edges = window.ARASHIKAGE_EDGES || [];
  const scenarios = window.ARASHIKAGE_SCENARIOS || [];
  const techLibrary = window.ARASHIKAGE_TECH_LIBRARY || [];
  const externalResourcesByTech = window.ARASHIKAGE_EXTERNAL_RESOURCES || {};
  const renderer = window.ArashikageCanvasRenderer;

  const nodeMap = {};
  nodes.forEach((n) => {
    nodeMap[n.id] = n;
  });

  const THEME_GLYPHS = {
    neo_brutalism: {
      polLight: '■', polDark: '□',
      filterAll: '◆', filterCore: '▸', filterTrain: '◈', filterLive: '⚡',
      modeBlock: '▣', modeTech: '▤',
      prev: '◀', next: '▶', play: '▶', pause: '❚❚',
      fullscreen: '⛶', exitFullscreen: '✕', share: '⇩', learn: '↗'
    },
    modular_typo: {
      polLight: '○', polDark: '●',
      filterAll: '01', filterCore: '02', filterTrain: '03', filterLive: '04',
      modeBlock: '§A', modeTech: '§B',
      prev: '←', next: '→', play: '▸', pause: '⏸',
      fullscreen: '⤢', exitFullscreen: '⤡', share: '↓', learn: '↗'
    },
    utilitarian: {
      polLight: '[L]', polDark: '[D]',
      filterAll: '[*]', filterCore: '[C]', filterTrain: '[T]', filterLive: '[R]',
      modeBlock: '[BLK]', modeTech: '[DDV]',
      prev: '<<', next: '>>', play: '[>]', pause: '[||]',
      fullscreen: '[FS]', exitFullscreen: '[X]', share: '[DL]', learn: '[↗]'
    },
    memphis: {
      polLight: '☀', polDark: '★',
      filterAll: '✦', filterCore: '▲', filterTrain: '●', filterLive: '◆',
      modeBlock: '❖', modeTech: '✦',
      prev: '◄', next: '►', play: '▶', pause: '❚❚',
      fullscreen: '⬡', exitFullscreen: '✕', share: '⬇', learn: '↗'
    },
    pixel_art: {
      polLight: '+', polDark: '*',
      filterAll: '#', filterCore: '>', filterTrain: '=', filterLive: '!',
      modeBlock: '[1]', modeTech: '[2]',
      prev: '<', next: '>', play: '>', pause: '||',
      fullscreen: '[+]', exitFullscreen: '[x]', share: 'v', learn: '^'
    },
    aurora: {
      polLight: '✧', polDark: '☾',
      filterAll: '✦', filterCore: '◈', filterTrain: '❖', filterLive: '⚡',
      modeBlock: '◈', modeTech: '✦',
      prev: '←', next: '→', play: '▸', pause: '❚❚',
      fullscreen: '⤢', exitFullscreen: '✕', share: '↓', learn: '↗'
    }
  };

  const stagePalettes = {
    dark: {
      1: '#38bdf8',
      2: '#818cf8',
      3: '#c084fc',
      4: '#fb923c',
      5: '#34d399',
      6: '#f472b6'
    },
    light: {
      1: '#0284c7',
      2: '#4f46e5',
      3: '#9333ea',
      4: '#ea580c',
      5: '#059669',
      6: '#db2777'
    }
  };

  // Application State
  let activeTheme = 'neo_brutalism';
  let activePolarity = 'dark';
  let activeLayerFilter = 'all';
  let selectedNodeId = 'titans';
  let hoveredNodeId = null;
  let rightMode = 'inspector'; // 'inspector' | 'tech'
  let activeInspectorTab = 'how'; // 'how' | 'why' | 'impact' | 'math' | 'learn'
  let activeTechId = 't3';
  let activeTechTab = 'how'; // 'how' | 'why' | 'impact' | 'science' | 'learn'

  let activeScenarioId = 'full';
  let activeTourStepIdx = 0;
  let tourPlaying = false;
  let tourTimer = null;
  let animTick = 0;

  let isFullscreenMode = false;
  let isSlidePanelOpen = false;

  function getStageColor(stage) {
    return (stagePalettes[activePolarity] || stagePalettes.dark)[stage] || '#38bdf8';
  }

  function getActiveScenario() {
    return scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  }

  function isNodeInTour(nodeId) {
    const sc = getActiveScenario();
    if (!sc || sc.id === 'full') return true;
    const step = sc.steps[activeTourStepIdx];
    return step && step.node === nodeId;
  }

  function isEdgeInTour(fromId, toId) {
    const sc = getActiveScenario();
    if (!sc || sc.id === 'full') return true;
    const step = sc.steps[activeTourStepIdx];
    if (!step) return true;
    return step.node === fromId || step.node === toId;
  }

  // Gather external resources for a node (aggregated from its associated technologies)
  function getExternalResourcesForNode(node) {
    if (!node || !Array.isArray(node.techIds)) return [];
    const seen = new Set();
    const list = [];
    node.techIds.forEach((tid) => {
      const t = techLibrary.find((x) => x.id === tid);
      const papers = externalResourcesByTech[tid] || [];
      papers.forEach((p) => {
        if (!seen.has(p.url)) {
          seen.add(p.url);
          list.push({
            ...p,
            techId: tid,
            techName: t ? t.name : tid.toUpperCase()
          });
        }
      });
    });
    return list;
  }

  function updateUrlHash() {
    const params = new URLSearchParams();
    params.set('view', rightMode);
    if (rightMode === 'tech') {
      params.set('tech', activeTechId);
      params.set('tab', activeTechTab);
    } else {
      params.set('node', selectedNodeId);
      params.set('tab', activeInspectorTab);
    }
    const newHash = '#' + params.toString();
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }

  function applyStateFromUrlHash() {
    if (!window.location.hash || window.location.hash.length <= 1) return false;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const view = params.get('view');
    const tab = params.get('tab');
    const tech = params.get('tech');
    const node = params.get('node');

    if (view === 'tech') {
      rightMode = 'tech';
      if (tech && techLibrary.some((t) => t.id === tech)) {
        activeTechId = tech;
      }
      if (tab && ['how', 'why', 'impact', 'science', 'learn'].includes(tab)) {
        activeTechTab = tab;
      }
      return true;
    } else if (view === 'inspector' || view === 'node') {
      rightMode = 'inspector';
      if (node && nodeMap[node]) {
        selectedNodeId = node;
      }
      if (tab && ['how', 'why', 'impact', 'math', 'learn'].includes(tab)) {
        activeInspectorTab = tab;
      }
      return true;
    }
    return false;
  }

  function updateThemeGlyphs() {
    const g = THEME_GLYPHS[activeTheme] || THEME_GLYPHS.neo_brutalism;
    const setGlyph = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setGlyph('icoPolLight', g.polLight);
    setGlyph('icoPolDark', g.polDark);
    setGlyph('icoFilterAll', g.filterAll);
    setGlyph('icoFilterCore', g.filterCore);
    setGlyph('icoFilterTrain', g.filterTrain);
    setGlyph('icoFilterLive', g.filterLive);
    setGlyph('icoModeBlock', g.modeBlock);
    setGlyph('icoModeTech', g.modeTech);
    setGlyph('icoTourPrev', g.prev);
    setGlyph('icoTourNext', g.next);
    setGlyph('icoTourPlay', tourPlaying ? g.pause : g.play);
    setGlyph('icoOverlayPrev', g.prev);
    setGlyph('icoOverlayNext', g.next);
    setGlyph('icoShareBtn', g.share);
    setGlyph('icoFullscreenBtn', isFullscreenMode ? g.exitFullscreen : g.fullscreen);

    const fsText = document.getElementById('txtFullscreenBtn');
    if (fsText) {
      fsText.textContent = isFullscreenMode ? 'Exit Full Screen' : 'Full Screen';
    }
  }

  function applyThemeAndPolarity(themeId, polarity) {
    activeTheme = themeId || activeTheme;
    activePolarity = polarity || activePolarity;
    document.body.setAttribute('data-theme', activeTheme);
    document.body.setAttribute('data-polarity', activePolarity);

    try {
      localStorage.setItem('arashikage_arch_theme', activeTheme);
      localStorage.setItem('arashikage_arch_polarity', activePolarity);
    } catch (_) {}

    const selTheme = document.getElementById('selTheme');
    if (selTheme && selTheme.value !== activeTheme) {
      selTheme.value = activeTheme;
    }

    document.querySelectorAll('.polarity-btn').forEach((btn) => {
      if (btn.dataset.polarity === activePolarity) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    updateThemeGlyphs();
    renderInspector();
    if (rightMode === 'tech') {
      renderTechDeepDive(activeTechId);
    }
  }

  // Fullscreen & Slide-In Side Panel Controller
  function updateFullscreenLayout() {
    const topIdentityBar = document.getElementById('topIdentityBar');
    const rightSidePanel = document.getElementById('rightSidePanel');
    const panelDismissBackdrop = document.getElementById('panelDismissBackdrop');
    const btnCloseSlidePanel = document.getElementById('btnCloseSlidePanel');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const canvasAspectBox = document.getElementById('canvasAspectBox');

    if (isFullscreenMode) {
      document.body.classList.add('diagram-fullscreen-active');
      if (topIdentityBar) topIdentityBar.classList.add('hidden');
      if (btnCloseSlidePanel) btnCloseSlidePanel.classList.remove('hidden');

      if (rightSidePanel) {
        rightSidePanel.classList.remove('w-[35%]', 'min-w-[430px]', 'max-w-[640px]', 'relative');
        rightSidePanel.classList.add(
          'fixed',
          'top-0',
          'right-0',
          'bottom-0',
          'w-[38vw]',
          'min-w-[440px]',
          'max-w-[660px]',
          'z-50',
          'shadow-2xl',
          'transition-transform',
          'duration-200'
        );
        if (isSlidePanelOpen) {
          rightSidePanel.style.transform = 'translateX(0)';
          if (panelDismissBackdrop) panelDismissBackdrop.classList.remove('hidden');
        } else {
          rightSidePanel.style.transform = 'translateX(100%)';
          if (panelDismissBackdrop) panelDismissBackdrop.classList.add('hidden');
        }
      }
    } else {
      document.body.classList.remove('diagram-fullscreen-active');
      if (topIdentityBar) topIdentityBar.classList.remove('hidden');
      if (btnCloseSlidePanel) btnCloseSlidePanel.classList.add('hidden');
      if (panelDismissBackdrop) panelDismissBackdrop.classList.add('hidden');

      if (rightSidePanel) {
        rightSidePanel.classList.remove(
          'fixed',
          'top-0',
          'right-0',
          'bottom-0',
          'w-[38vw]',
          'min-w-[440px]',
          'max-w-[660px]',
          'z-50',
          'shadow-2xl',
          'transition-transform',
          'duration-200'
        );
        rightSidePanel.classList.add('w-[35%]', 'min-w-[430px]', 'max-w-[640px]', 'relative');
        rightSidePanel.style.transform = '';
      }
    }

    updateThemeGlyphs();
    requestAnimationFrame(() => {
      renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox);
    });
  }

  function toggleFullscreenMode(forceState) {
    isFullscreenMode = typeof forceState === 'boolean' ? forceState : !isFullscreenMode;
    isSlidePanelOpen = false;
    updateFullscreenLayout();
  }

  function openSlideInPanel() {
    if (!isFullscreenMode) return;
    isSlidePanelOpen = true;
    updateFullscreenLayout();
  }

  function closeSlideInPanel() {
    if (!isFullscreenMode) return;
    isSlidePanelOpen = false;
    updateFullscreenLayout();
  }

  // Right Panel Mode Switcher ('inspector' | 'tech')
  function setRightMode(mode) {
    rightMode = mode;
    const btnBlock = document.getElementById('btnModeInspector');
    const btnTech = document.getElementById('btnModeTech');
    const viewInspector = document.getElementById('viewBlockInspector');
    const viewTech = document.getElementById('viewTechDeepDive');

    if (mode === 'inspector') {
      btnBlock.classList.add('active');
      btnTech.classList.remove('active');
      viewInspector.classList.remove('hidden');
      viewTech.classList.add('hidden');
      renderInspector();
    } else {
      btnTech.classList.add('active');
      btnBlock.classList.remove('active');
      viewTech.classList.remove('hidden');
      viewInspector.classList.add('hidden');
      renderTechDeepDive(activeTechId);
    }
    updateUrlHash();
  }

  // Render external white paper cards inside the 5. Learn More tab
  function renderLearnMoreCardsHtml(papers, contextTitle) {
    if (!papers || papers.length === 0) {
      return `<div class="text-xs t-text-secondary">No external publications indexed for ${contextTitle}.</div>`;
    }
    return `
      <div class="space-y-2.5">
        ${papers
          .map(
            (p, idx) => `
          <div class="t-card-nested p-3.5 transition-all">
            <div class="flex items-start justify-between gap-2.5 mb-1.5">
              <div>
                <div class="flex flex-wrap items-center gap-1.5 mb-1">
                  <span class="px-1.5 py-0.5 text-[9.5px] t-font-mono font-bold uppercase tracking-wider t-badge">
                    REF ${idx + 1} // ${p.venue}
                  </span>
                  ${
                    p.techName
                      ? `<span class="px-1.5 py-0.5 text-[9.5px] t-font-mono font-semibold t-text-secondary">${p.techName}</span>`
                      : ''
                  }
                </div>
                <h4 class="text-sm font-bold t-text-primary t-font-head leading-snug">${p.title}</h4>
                <div class="text-[11px] t-font-mono t-text-muted mt-0.5">${p.authors}</div>
              </div>
              <a
                href="${p.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="no-wrap-btn px-2.5 py-1.5 text-[11px] font-bold t-font-mono t-btn-primary"
              >
                <span>Open Paper</span>
                <span>↗</span>
              </a>
            </div>
            <p class="text-[12px] t-text-secondary leading-relaxed mt-1.5">${p.desc}</p>
            <div class="mt-2 pt-1.5 border-t border-current/10 flex items-center justify-between text-[10px] t-font-mono t-text-muted">
              <span class="truncate max-w-[320px]">${p.url}</span>
              <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="underline font-semibold hover:opacity-80">New Tab ↗</a>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  // Render Block Inspector (5 Tabs: 1. How | 2. Why | 3. Impact | 4. Math | 5. Learn More)
  function renderInspector() {
    const n = nodeMap[selectedNodeId] || nodes[0];
    if (!n) return;

    const stageCol = getStageColor(n.stage);
    const badgeEl = document.getElementById('rightStageBadge');
    badgeEl.textContent = n.badge;
    badgeEl.style.color = stageCol;
    badgeEl.style.borderColor = stageCol;

    document.getElementById('rightLayerBadge').textContent =
      n.layer === 'core' ? 'CORE INFERENCE' : n.layer === 'train' ? 'TRAINING ONLY' : 'LIVE RUNTIME';
    document.getElementById('rightTitle').textContent = n.title;

    // Update 5 Inspector Tabs
    document.querySelectorAll('.inspector-tab-btn').forEach((btn) => {
      if (btn.dataset.tab === activeInspectorTab) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    const tabLabelEl = document.getElementById('inspectorTabLabel');
    const tabBodyEl = document.getElementById('inspectorTabContent');
    const calloutBox = document.getElementById('inspectorSecondaryBox');
    const calloutTitle = document.getElementById('inspectorSecondaryTitle');
    const calloutBody = document.getElementById('inspectorSecondaryBody');
    const techBox = document.getElementById('inspectorUnderlyingTechBox');

    if (activeInspectorTab === 'learn') {
      tabLabelEl.textContent = '5. LEARN MORE — WHITE PAPERS & TECHNICAL REFERENCES';
      const nodePapers = getExternalResourcesForNode(n);
      tabBodyEl.innerHTML = renderLearnMoreCardsHtml(nodePapers, n.title);
      if (calloutBox) calloutBox.classList.add('hidden');
    } else {
      if (calloutBox) calloutBox.classList.remove('hidden');
      const labels = {
        how: '1. HOW IT WORKS — MECHANISM & SIGNAL PATH',
        why: '2. WHY IT IS USED — ARCHITECTURAL RATIONALE',
        impact: '3. WHAT IT CONTRIBUTES — MEASURABLE IMPACT',
        math: '4. FORMAL SPECIFICATION — TENSORS & EQUATIONS'
      };
      tabLabelEl.textContent = labels[activeInspectorTab] || labels.how;

      if (activeInspectorTab === 'math') {
        tabBodyEl.innerHTML = `<pre class="text-[11.5px] t-font-mono whitespace-pre-wrap leading-relaxed t-card-nested p-3">${n.math}</pre>`;
      } else {
        tabBodyEl.innerHTML = `<div class="text-[13px] t-text-secondary leading-relaxed">${n[activeInspectorTab]}</div>`;
      }

      calloutTitle.textContent = 'WHY IT SITS HERE IN THE DATAFLOW';
      calloutBody.textContent = `${n.role} — ${n.sub}`;
    }

    // Render Underlying Technologies Chips + Direct Deep Link to Learn More
    if (techBox) {
      const chipsContainer = document.getElementById('inspectorTechChips');
      chipsContainer.innerHTML = '';
      const g = THEME_GLYPHS[activeTheme] || THEME_GLYPHS.neo_brutalism;

      n.techIds.forEach((tid) => {
        const t = techLibrary.find((x) => x.id === tid);
        if (!t) return;
        const wrap = document.createElement('div');
        wrap.className = 'inline-flex items-center gap-1';

        const btn = document.createElement('button');
        btn.className = 'no-wrap-btn px-2.5 py-1.5 text-xs font-semibold t-font-mono t-btn transition-all';
        btn.innerHTML = `<span>${g.modeTech}</span><span>${t.name}</span>`;
        btn.addEventListener('click', () => {
          openTechDeepDive(tid, 'how');
        });

        const learnBtn = document.createElement('button');
        learnBtn.className = 'no-wrap-btn px-2 py-1.5 text-[11px] font-bold t-font-mono t-btn-primary transition-all';
        learnBtn.title = `Open ${t.name} White Papers (Learn More Tab)`;
        learnBtn.innerHTML = `<span>Learn More</span><span>${g.learn}</span>`;
        learnBtn.addEventListener('click', () => {
          openTechDeepDive(tid, 'learn');
        });

        wrap.appendChild(btn);
        wrap.appendChild(learnBtn);
        chipsContainer.appendChild(wrap);
      });
    }

    // Connected Upstream / Downstream Blocks
    const connContainer = document.getElementById('inspectorConnectedNodes');
    connContainer.innerHTML = '';
    const connectedIds = new Set();
    edges.forEach((e) => {
      if (e.from === n.id) connectedIds.add(e.to);
      if (e.to === n.id) connectedIds.add(e.from);
    });

    connectedIds.forEach((cid) => {
      const cn = nodeMap[cid];
      if (!cn) return;
      const chip = document.createElement('button');
      chip.className = 'no-wrap-btn px-2.5 py-1 text-[11px] t-font-mono t-btn transition-all';
      chip.textContent = cn.title;
      chip.addEventListener('click', () => {
        selectedNodeId = cn.id;
        renderInspector();
        updateUrlHash();
      });
      connContainer.appendChild(chip);
    });
  }

  // Render Deep Dive (5 Tabs: 1. How | 2. Why | 3. Impact | 4. Science | 5. Learn More)
  function renderTechDeepDive(techId) {
    activeTechId = techId || activeTechId;
    const t = techLibrary.find((x) => x.id === activeTechId) || techLibrary[0];
    if (!t) return;

    document.getElementById('rightStageBadge').textContent = 'DEEP DIVE';
    document.getElementById('rightLayerBadge').textContent = `${t.nodes.length} LINKED BLOCKS`;
    document.getElementById('rightTitle').textContent = t.name;

    // Populate Selector Pills
    const pillBar = document.getElementById('techSelectorPills');
    pillBar.innerHTML = '';
    techLibrary.forEach((item) => {
      const b = document.createElement('button');
      b.className = `no-wrap-btn px-2.5 py-1 text-[11px] font-semibold t-font-mono t-btn ${
        item.id === t.id ? 'active' : ''
      }`;
      b.textContent = item.name.split(' (')[0];
      b.addEventListener('click', () => {
        activeTechId = item.id;
        renderTechDeepDive(item.id);
        updateUrlHash();
      });
      pillBar.appendChild(b);
    });

    // Update 5 Deep Dive Tabs
    document.querySelectorAll('.tech-tab-btn').forEach((btn) => {
      if (btn.dataset.techtab === activeTechTab) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    const tabLabelEl = document.getElementById('techTabLabel');
    const tabContentEl = document.getElementById('techTabContent');
    const calloutBox = document.getElementById('techSecondaryBox');
    const calloutTitle = document.getElementById('techSecondaryTitle');
    const calloutBody = document.getElementById('techSecondaryBody');

    if (activeTechTab === 'learn') {
      tabLabelEl.textContent = '5. LEARN MORE — WHITE PAPERS & TECHNICAL SOURCES';
      const papers = externalResourcesByTech[t.id] || [];
      tabContentEl.innerHTML = renderLearnMoreCardsHtml(papers, t.name);
      if (calloutBox) calloutBox.classList.add('hidden');
    } else {
      if (calloutBox) calloutBox.classList.remove('hidden');
      const labels = {
        how: '1. HOW IT WORKS — MECHANISM & FORMULATION',
        why: '2. WHY IT IS USED — PROBLEM SOLVED',
        impact: '3. WHAT IT CONTRIBUTES — MEASURABLE IMPACT',
        science: '4. THE SCIENCE & DATAFLOW PLACEMENT'
      };
      tabLabelEl.textContent = labels[activeTechTab] || labels.how;

      if (activeTechTab === 'science') {
        tabContentEl.innerHTML = `
          <div class="space-y-2.5">
            <div><strong class="t-text-primary">Scientific Foundation:</strong> ${t.science}</div>
            <div><strong class="t-text-primary">Why It Sits Here in the Dataflow:</strong> ${t.placement}</div>
          </div>
        `;
      } else {
        tabContentEl.innerHTML = `<div class="text-[13px] t-text-secondary leading-relaxed">${t[activeTechTab]}</div>`;
      }

      calloutTitle.textContent = 'RESEARCH ORIGINS & EVOLUTION';
      calloutBody.textContent = t.origins;
    }

    // Linked Diagram Blocks
    const nodeLinks = document.getElementById('techDiagramNodeLinks');
    nodeLinks.innerHTML = '';
    const g = THEME_GLYPHS[activeTheme] || THEME_GLYPHS.neo_brutalism;
    t.nodes.forEach((nid) => {
      const n = nodeMap[nid];
      if (!n) return;
      const b = document.createElement('button');
      b.className = 'no-wrap-btn px-2.5 py-1.5 text-[11px] font-semibold t-font-mono t-btn transition-all';
      b.innerHTML = `<span>${g.modeBlock}</span><span>Inspect: ${n.title}</span>`;
      b.addEventListener('click', () => {
        selectedNodeId = nid;
        setRightMode('inspector');
      });
      nodeLinks.appendChild(b);
    });
  }

  function openTechDeepDive(techId, initialTab) {
    activeTechId = techId;
    if (initialTab) activeTechTab = initialTab;
    setRightMode('tech');
    openSlideInPanel();
  }

  // Guided Tour Overlay & Scrubber
  function updateTourUI() {
    const sc = getActiveScenario();
    const overlayCard = document.getElementById('tourOverlayCard');
    const stepScrubber = document.getElementById('tourStepScrubber');

    if (!sc || sc.id === 'full' || sc.steps.length === 0) {
      overlayCard.classList.add('hidden');
      stepScrubber.innerHTML = `<span class="text-xs t-font-mono t-text-muted px-2">Select a Guided Tour to walk step-by-step</span>`;
      return;
    }

    overlayCard.classList.remove('hidden');
    const step = sc.steps[activeTourStepIdx] || sc.steps[0];
    document.getElementById('tourOverlayBadge').textContent = `${sc.name} // STEP ${activeTourStepIdx + 1} OF ${sc.steps.length}`;
    document.getElementById('tourOverlayTitle').textContent = step.title;
    document.getElementById('tourOverlayText').textContent = step.text;

    stepScrubber.innerHTML = '';
    sc.steps.forEach((st, idx) => {
      const dot = document.createElement('button');
      dot.className = `no-wrap-btn px-2 py-0.5 text-[11px] t-font-mono font-bold t-btn ${
        idx === activeTourStepIdx ? 'active' : ''
      }`;
      dot.textContent = `${idx + 1}`;
      dot.title = st.title;
      dot.addEventListener('click', () => {
        setTourStep(idx);
      });
      stepScrubber.appendChild(dot);
    });
  }

  function setTourStep(idx) {
    const sc = getActiveScenario();
    if (!sc || sc.steps.length === 0) return;
    activeTourStepIdx = (idx + sc.steps.length) % sc.steps.length;
    const step = sc.steps[activeTourStepIdx];
    if (step && step.node) {
      selectedNodeId = step.node;
      if (rightMode === 'inspector') renderInspector();
    }
    updateTourUI();
  }

  function stopTourAutoPlay() {
    tourPlaying = false;
    if (tourTimer) {
      clearInterval(tourTimer);
      tourTimer = null;
    }
    const playText = document.getElementById('txtTourPlay');
    if (playText) playText.textContent = 'Auto';
    updateThemeGlyphs();
  }

  // Standalone Self-Contained Single-File HTML Export
  async function exportStandaloneHtml() {
    try {
      const [cssText, nodesJs, scenariosJs, rendererJs, appJs] = await Promise.all([
        fetch('./styles/themes.css').then((r) => r.text()),
        fetch('./js/nodes_and_edges.js').then((r) => r.text()),
        fetch('./js/scenarios_and_tech.js').then((r) => r.text()),
        fetch('./js/canvas_renderer.js').then((r) => r.text()),
        fetch('./js/app.js').then((r) => r.text())
      ]);

      const clone = document.documentElement.cloneNode(true);
      clone.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        if (link.getAttribute('href') && link.getAttribute('href').includes('themes.css')) {
          const styleEl = document.createElement('style');
          styleEl.textContent = cssText;
          link.replaceWith(styleEl);
        }
      });

      const scriptMap = {
        'nodes_and_edges.js': nodesJs,
        'scenarios_and_tech.js': scenariosJs,
        'canvas_renderer.js': rendererJs,
        'app.js': appJs
      };

      clone.querySelectorAll('script[src]').forEach((scr) => {
        const src = scr.getAttribute('src') || '';
        for (const [key, code] of Object.entries(scriptMap)) {
          if (src.includes(key)) {
            const inlineScr = document.createElement('script');
            inlineScr.textContent = code;
            scr.replaceWith(inlineScr);
            break;
          }
        }
      });

      const htmlOut = '<!DOCTYPE html>\n' + clone.outerHTML;
      const blob = new Blob([htmlOut], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arashikage_hex63_architecture_${activeTheme}_${activePolarity}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const htmlOut = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      const blob = new Blob([htmlOut], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arashikage_hex63_architecture.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // Initialization & Event Listeners
  function init() {
    const canvas = document.getElementById('archCanvas');
    const ctx = canvas.getContext('2d');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const canvasAspectBox = document.getElementById('canvasAspectBox');
    const hoverTooltip = document.getElementById('canvasHoverTooltip');

    // Load saved theme/polarity
    try {
      const savedTheme = localStorage.getItem('arashikage_arch_theme');
      const savedPol = localStorage.getItem('arashikage_arch_polarity');
      if (savedTheme) activeTheme = savedTheme;
      if (savedPol) activePolarity = savedPol;
    } catch (_) {}

    // Populate Scenario Select
    const selScenario = document.getElementById('selScenario');
    scenarios.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      selScenario.appendChild(opt);
    });

    // Compact Theme Dropdown
    const selTheme = document.getElementById('selTheme');
    if (selTheme) {
      selTheme.addEventListener('change', (e) => {
        applyThemeAndPolarity(e.target.value, activePolarity);
      });
    }

    // Polarity Buttons
    document.querySelectorAll('.polarity-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyThemeAndPolarity(activeTheme, btn.dataset.polarity);
      });
    });

    // Layer Filter Buttons
    document.querySelectorAll('.layer-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.layer-filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeLayerFilter = btn.dataset.layer;
      });
    });

    // Mode Switcher (Block Inspector | Deep Dive)
    document.getElementById('btnModeInspector').addEventListener('click', () => {
      setRightMode('inspector');
      openSlideInPanel();
    });
    document.getElementById('btnModeTech').addEventListener('click', () => {
      setRightMode('tech');
      openSlideInPanel();
    });

    // 5 Inspector Tabs (1. How | 2. Why | 3. Impact | 4. Math | 5. Learn More)
    document.querySelectorAll('.inspector-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeInspectorTab = btn.dataset.tab;
        renderInspector();
        updateUrlHash();
      });
    });

    // 5 Deep Dive Tabs (1. How | 2. Why | 3. Impact | 4. Science | 5. Learn More)
    document.querySelectorAll('.tech-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTechTab = btn.dataset.techtab;
        renderTechDeepDive(activeTechId);
        updateUrlHash();
      });
    });

    // Quick Deep-Link Button to Learn More Tab inside Block Inspector & Deep Dive
    const btnInspectorQuickLearn = document.getElementById('btnInspectorQuickLearn');
    if (btnInspectorQuickLearn) {
      btnInspectorQuickLearn.addEventListener('click', () => {
        activeInspectorTab = 'learn';
        renderInspector();
        updateUrlHash();
      });
    }
    const btnTechQuickLearn = document.getElementById('btnTechQuickLearn');
    if (btnTechQuickLearn) {
      btnTechQuickLearn.addEventListener('click', () => {
        activeTechTab = 'learn';
        renderTechDeepDive(activeTechId);
        updateUrlHash();
      });
    }

    // Guided Scenario Controls
    selScenario.addEventListener('change', (e) => {
      activeScenarioId = e.target.value;
      activeTourStepIdx = 0;
      stopTourAutoPlay();
      const sc = getActiveScenario();
      if (sc && sc.steps.length > 0) {
        setTourStep(0);
      } else {
        updateTourUI();
      }
    });

    document.getElementById('btnTourPrev').addEventListener('click', () => {
      stopTourAutoPlay();
      setTourStep(activeTourStepIdx - 1);
    });
    document.getElementById('btnTourNext').addEventListener('click', () => {
      stopTourAutoPlay();
      setTourStep(activeTourStepIdx + 1);
    });
    document.getElementById('btnOverlayPrev').addEventListener('click', () => {
      stopTourAutoPlay();
      setTourStep(activeTourStepIdx - 1);
    });
    document.getElementById('btnOverlayNext').addEventListener('click', () => {
      stopTourAutoPlay();
      setTourStep(activeTourStepIdx + 1);
    });
    document.getElementById('btnExitTour').addEventListener('click', () => {
      stopTourAutoPlay();
      activeScenarioId = 'full';
      selScenario.value = 'full';
      updateTourUI();
    });

    document.getElementById('btnTourPlay').addEventListener('click', () => {
      if (activeScenarioId === 'full') {
        activeScenarioId = 'forward_60hz';
        selScenario.value = 'forward_60hz';
        activeTourStepIdx = 0;
        setTourStep(0);
      }
      if (tourPlaying) {
        stopTourAutoPlay();
      } else {
        tourPlaying = true;
        document.getElementById('txtTourPlay').textContent = 'Pause';
        updateThemeGlyphs();
        tourTimer = setInterval(() => {
          setTourStep(activeTourStepIdx + 1);
        }, 3600);
      }
    });

    // Fullscreen Button + Slide-In Dismissal Handlers
    document.getElementById('btnToggleFullscreen').addEventListener('click', () => {
      toggleFullscreenMode();
    });
    document.getElementById('btnCloseSlidePanel').addEventListener('click', () => {
      closeSlideInPanel();
    });
    document.getElementById('panelDismissBackdrop').addEventListener('click', () => {
      closeSlideInPanel();
    });

    // Clicking outside the diagram nodes on the canvas stage in Fullscreen mode dismisses the slide-in panel
    canvasWrapper.addEventListener('click', (e) => {
      if (isFullscreenMode && isSlidePanelOpen && e.target === canvasWrapper) {
        closeSlideInPanel();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isFullscreenMode) {
        if (isSlidePanelOpen) {
          closeSlideInPanel();
        } else {
          toggleFullscreenMode(false);
        }
      }
    });

    // Share HTML Export
    document.getElementById('btnExportHtml').addEventListener('click', exportStandaloneHtml);

    // Canvas Pointer Interaction
    canvas.addEventListener('mousemove', (e) => {
      const hit = renderer.getNodeAtCanvasCoords(canvas, e.clientX, e.clientY, nodes);
      if (hit.node) {
        hoveredNodeId = hit.node.id;
        canvas.style.cursor = 'pointer';
        hoverTooltip.classList.remove('hidden');
        document.getElementById('tooltipBadge').textContent = hit.node.badge;
        document.getElementById('tooltipTitle').textContent = hit.node.title;
        document.getElementById('tooltipSub').textContent = hit.node.sub;

        const wrapRect = canvasWrapper.getBoundingClientRect();
        const tx = Math.min(wrapRect.width - 270, Math.max(12, e.clientX - wrapRect.left + 16));
        const ty = Math.min(wrapRect.height - 95, Math.max(12, e.clientY - wrapRect.top + 16));
        hoverTooltip.style.left = `${tx}px`;
        hoverTooltip.style.top = `${ty}px`;
      } else {
        hoveredNodeId = null;
        canvas.style.cursor = 'default';
        hoverTooltip.classList.add('hidden');
      }
    });

    canvas.addEventListener('mouseleave', () => {
      hoveredNodeId = null;
      hoverTooltip.classList.add('hidden');
    });

    canvas.addEventListener('click', (e) => {
      const hit = renderer.getNodeAtCanvasCoords(canvas, e.clientX, e.clientY, nodes);
      if (hit.node) {
        selectedNodeId = hit.node.id;
        setRightMode('inspector');
        openSlideInPanel();
      } else if (isFullscreenMode && isSlidePanelOpen) {
        closeSlideInPanel();
      }
    });

    // Aspect Ratio Resize Observer
    const resizeObs = new ResizeObserver(() => {
      renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox);
    });
    resizeObs.observe(canvasWrapper);
    window.addEventListener('resize', () => {
      renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox);
    });

    // Apply initial theme, URL hash state, and start animation loop
    applyThemeAndPolarity(activeTheme, activePolarity);
    const loadedFromHash = applyStateFromUrlHash();
    if (loadedFromHash) {
      setRightMode(rightMode);
    } else {
      renderInspector();
      updateUrlHash();
    }
    updateTourUI();
    renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox);

    function animate() {
      animTick++;
      renderer.renderCanvas(ctx, {
        nodes,
        edges,
        nodeMap,
        activeTheme,
        activePolarity,
        activeLayerFilter,
        selectedNodeId,
        hoveredNodeId,
        isNodeInTour,
        isEdgeInTour,
        getStageColor,
        animTick
      });
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
