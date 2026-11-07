// ============================================================================
// ARASHIKAGE (HEX63) — INTERACTIVE CONTROLLER, 5-TAB INSPECTOR/DEEP-DIVE & FULLSCREEN DRAWER
// ============================================================================
(function () {
  const nodes = window.ARASHIKAGE_NODES || [];
  const edges = window.ARASHIKAGE_EDGES || [];
  const scenarios = window.ARASHIKAGE_SCENARIOS || {};
  const techLib = window.ARASHIKAGE_TECH_LIBRARY || [];
  const TECH_EXTERNAL_RESOURCES = window.ARASHIKAGE_EXTERNAL_RESOURCES || {};
  const renderer = window.ArashikageCanvasRenderer;

  const nodeMap = {};
  nodes.forEach((n) => {
    nodeMap[n.id] = n;
  });
  const techMap = {};
  techLib.forEach((t) => {
    techMap[t.id] = t;
  });

  // Application State
  let selectedNodeId = 'dma_slice';
  let hoveredNodeId = null;
  let activeNTab = 'how'; // 'how' | 'why' | 'contrib' | 'math' | 'learn'
  let activeTTab = 'how'; // 'how' | 'why' | 'contrib' | 'science' | 'learn'
  let activeRightView = 'node'; // 'node' | 'tech'
  let selectedTechId = 't0';
  let activeMode = 'all';
  let activeScenarioKey = 'tour';
  let activeStepIdx = 0;
  let tourOverlayVisible = true;
  let animTick = 0;

  // Fullscreen & Slide-In Drawer State
  let isFullscreenMode = false;
  let isDrawerOpen = false;

  // Contextual Micro-Simulator State
  let selectedMemSliceIdx = 0;
  let selectedPairQueryIdx = 0;
  let selectedPairKeyIdx = 6;
  let surpriseIntensity = 0.68;

  // 6-Style × 2-Polarity Theme Engine Metadata
  const THEME_ORDER = [
    'neo_brutalism',
    'modular_typo',
    'utilitarian',
    'memphis',
    'pixel_art',
    'aurora'
  ];

  const THEME_META = {
    neo_brutalism: {
      name: 'Neo-Brutalism',
      notes: '2.5px ink borders · Hard offset block shadows · High-contrast color headers · Zero blur',
      stageColors: ['#ff4d00', '#00b4d8', '#7c3aed', '#ec4899', '#eab308', '#16a34a']
    },
    modular_typo: {
      name: 'Modular Typography',
      notes: 'Swiss International Grid · Exposed 1.5px structural rules · 0px radius · Grotesque hierarchy',
      stageColors: ['#ff2a00', '#0055ff', '#7c3aed', '#d90429', '#ca8a04', '#0d9488']
    },
    utilitarian: {
      name: 'Utilitarian',
      notes: '100% Monospace · CAD crosshair grid · Corner L-brackets · 90° PCB traces · Zero ornament',
      stageColors: ['#f59e0b', '#0284c7', '#8b5cf6', '#ec4899', '#eab308', '#10b981']
    },
    memphis: {
      name: 'Memphis',
      notes: '80s Sottsass geometric pop · 2.5px borders · Cyan/Pink offset shadows · Studio confetti',
      stageColors: ['#ec4899', '#06b6d4', '#8b5cf6', '#f97316', '#eab308', '#10b981']
    },
    pixel_art: {
      name: 'Pixel Art',
      notes: '16-Bit command deck · Stepped pixel borders & rivets · Scanlines · Manhattan pixel buses',
      stageColors: ['#00c49a', '#0096c7', '#9d4edd', '#ff2a85', '#d97706', '#16a34a']
    },
    aurora: {
      name: 'Aurora',
      notes: 'Borealis radial plumes · Solid velvet/pearl cards (no frost blur) · Luminous rims',
      stageColors: ['#00bfa5', '#0091ea', '#8b5cf6', '#ec4899', '#eab308', '#10b981']
    }
  };

  const THEME_GLYPHS = {
    neo_brutalism: {
      prev: '■◀', next: '▶■', light: '■', dark: '□',
      node: '▣', tech: '◈', tourOn: '■', tourOff: '□',
      export: '▣', close: '×', open: '↗', fs: '⛶', fsExit: '×'
    },
    modular_typo: {
      prev: '←', next: '→', light: '○', dark: '●',
      node: '01', tech: '02', tourOn: '●', tourOff: '○',
      export: '↗', close: '×', open: '↗', fs: '⤢', fsExit: '⤡'
    },
    utilitarian: {
      prev: '[<]', next: '[>]', light: '[L]', dark: '[D]',
      node: '[BLK]', tech: '[DDV]', tourOn: '[ON]', tourOff: '[--]',
      export: '[IO]', close: '[X]', open: '[>]', fs: '[FS]', fsExit: '[X]'
    },
    memphis: {
      prev: '◀', next: '▶', light: '★', dark: '✦',
      node: '◆', tech: '▲', tourOn: '★', tourOff: '☆',
      export: '◆', close: '✕', open: '↗', fs: '⬡', fsExit: '✕'
    },
    pixel_art: {
      prev: '<<', next: '>>', light: '[*]', dark: '[-]',
      node: '[#]', tech: '[?]', tourOn: '[*]', tourOff: '[ ]',
      export: '[v]', close: '[x]', open: '[>]', fs: '[+]', fsExit: '[x]'
    },
    aurora: {
      prev: '‹', next: '›', light: '✧', dark: '✦',
      node: '◈', tech: '✦', tourOn: '✦', tourOff: '✧',
      export: '◈', close: '✕', open: '↗', fs: '⤢', fsExit: '✕'
    }
  };

  let activeTheme = 'neo_brutalism';
  let activePolarity = 'light'; // 'light' | 'dark'

  function getGlyph(key) {
    const g = THEME_GLYPHS[activeTheme] || THEME_GLYPHS.neo_brutalism;
    return g[key] || '';
  }

  // Gather external white papers for a subsystem block (aggregated from its associated technologies)
  function getExternalResourcesForNode(node) {
    if (!node || !Array.isArray(node.techIds)) return [];
    const seen = new Set();
    const list = [];
    node.techIds.forEach((tid) => {
      const t = techMap[tid];
      const papers = TECH_EXTERNAL_RESOURCES[tid] || [];
      papers.forEach((p) => {
        if (!seen.has(p.url)) {
          seen.add(p.url);
          list.push({
            ...p,
            techShort: t ? t.short : tid.toUpperCase()
          });
        }
      });
    });
    return list;
  }

  // Render external white paper cards inside the 5. Learn More tab
  function renderLearnMoreCardsHtml(resList) {
    if (!resList || resList.length === 0) {
      return '<div class="text-xs text-secondary-ink">No external references indexed.</div>';
    }
    return (
      '<div class="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">' +
      resList
        .map(
          (r) =>
            '<div class="surface-root border border-hairline rounded-xl p-3.5 flex flex-col justify-between gap-2.5">' +
            '<div class="flex flex-col gap-1">' +
            '<div class="flex flex-wrap items-center justify-between gap-1.5">' +
            '<span class="mono text-[10.5px] font-bold px-2 py-0.5 rounded btn-theme-accent border">' +
            r.badge +
            '</span>' +
            (r.techShort
              ? '<span class="mono text-[10.5px] font-semibold text-muted-ink">' + r.techShort + '</span>'
              : '') +
            '</div>' +
            '<h4 class="text-xs font-bold text-primary-ink leading-snug mt-0.5">' +
            r.title +
            '</h4>' +
            '<div class="mono text-[11px] text-muted-ink">' +
            r.authors +
            '</div>' +
            '<p class="text-xs text-secondary-ink leading-relaxed mt-0.5">' +
            r.desc +
            '</p>' +
            '</div>' +
            '<div class="pt-2 border-t border-hairline flex items-center justify-between gap-2">' +
            '<span class="mono text-[10.5px] text-muted-ink truncate">' +
            r.url +
            '</span>' +
            '<a href="' +
            r.url +
            '" target="_blank" rel="noopener noreferrer" class="no-wrap-btn px-3 py-1 rounded-lg text-xs font-semibold btn-theme-accent border transition">' +
            '<span>Open Paper ' +
            getGlyph('open') +
            '</span>' +
            '</a>' +
            '</div>' +
            '</div>'
        )
        .join('') +
      '</div>'
    );
  }

  // URL Hash Deep-Linking (#view=tech&tech=t3&tab=learn or #view=node&node=dma_slice&tab=learn)
  function syncUrlHash() {
    const params = new URLSearchParams();
    params.set('view', activeRightView);
    if (activeRightView === 'tech') {
      params.set('tech', selectedTechId);
      params.set('tab', activeTTab);
    } else {
      params.set('node', selectedNodeId);
      params.set('tab', activeNTab);
    }
    const nextHash = '#' + params.toString();
    if (window.location.hash !== nextHash) {
      history.replaceState(null, '', nextHash);
    }
  }

  function restoreStateFromUrlHash() {
    if (!window.location.hash || window.location.hash.length <= 1) return false;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const view = params.get('view');
    const tab = params.get('tab');
    const tech = params.get('tech');
    const node = params.get('node');

    if (view === 'tech') {
      activeRightView = 'tech';
      if (tech && techMap[tech]) selectedTechId = tech;
      if (tab && ['how', 'why', 'contrib', 'science', 'learn'].includes(tab)) {
        activeTTab = tab;
      }
      return true;
    } else if (view === 'node' || view === 'inspector') {
      activeRightView = 'node';
      if (node && nodeMap[node]) selectedNodeId = node;
      if (tab && ['how', 'why', 'contrib', 'math', 'learn'].includes(tab)) {
        activeNTab = tab;
      }
      return true;
    }
    return false;
  }

  function init() {
    const canvas = document.getElementById('mainGraphCanvas');
    const ctx = canvas.getContext('2d');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const canvasAspectBox = document.getElementById('canvasAspectBox');

    const selScenario = document.getElementById('selScenario');
    const btnToggleTour = document.getElementById('btnToggleTour');
    const selMode = document.getElementById('selMode');
    const selTheme = document.getElementById('selTheme');
    const btnPolarityLight = document.getElementById('btnPolarityLight');
    const btnPolarityDark = document.getElementById('btnPolarityDark');
    const btnToggleFullscreen = document.getElementById('btnToggleFullscreen');

    // Tooltip Overlay DOM
    const tourTooltip = document.getElementById('tourTooltip');
    const ttStepBadge = document.getElementById('ttStepBadge');
    const ttScenarioLabel = document.getElementById('ttScenarioLabel');
    const btnCloseTooltip = document.getElementById('btnCloseTooltip');
    const ttTitle = document.getElementById('ttTitle');
    const ttDesc = document.getElementById('ttDesc');
    const btnTtDeepDive = document.getElementById('btnTtDeepDive');
    const btnTtPrev = document.getElementById('btnTtPrev');
    const btnTtNext = document.getElementById('btnTtNext');

    // Right Panel DOM
    const topIdentityBar = document.getElementById('topIdentityBar');
    const rightSidePanel = document.getElementById('rightSidePanel');
    const panelDismissBackdrop = document.getElementById('panelDismissBackdrop');
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    const btnViewNode = document.getElementById('btnViewNode');
    const btnViewTech = document.getElementById('btnViewTech');
    const inspectorNodeView = document.getElementById('inspectorNodeView');
    const inspectorTechView = document.getElementById('inspectorTechView');
    const btnBackToNode = document.getElementById('btnBackToNode');
    const selTechDropdown = document.getElementById('selTechDropdown');

    // Populate Tech Dropdown
    selTechDropdown.innerHTML = '';
    techLib.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.short;
      selTechDropdown.appendChild(opt);
    });

    function syncThemeAlignedButtons() {
      btnPolarityLight.textContent = getGlyph('light') + ' Light';
      btnPolarityDark.textContent = getGlyph('dark') + ' Dark';
      document.getElementById('btnPrevTheme').textContent = getGlyph('prev') + ' Prev';
      document.getElementById('btnNextTheme').textContent = 'Next ' + getGlyph('next');
      btnViewNode.textContent = getGlyph('node') + ' Block Inspector';
      btnViewTech.textContent = getGlyph('tech') + ' Deep Dive';
      btnToggleFullscreen.textContent =
        (isFullscreenMode ? getGlyph('fsExit') + ' Exit Full Screen' : getGlyph('fs') + ' Full Screen');
      document.getElementById('btnExportHtml').textContent = getGlyph('export') + ' Share HTML';
      document.getElementById('btnExportPng').textContent = getGlyph('export') + ' PNG';
      document.getElementById('btnCopyMermaid').textContent = getGlyph('export') + ' Mermaid';
      btnTtPrev.textContent = getGlyph('prev') + ' Prev';
      btnTtNext.textContent = 'Next ' + getGlyph('next');
      btnTtDeepDive.textContent = getGlyph('tech') + ' Deep Dive';
      btnCloseTooltip.textContent = getGlyph('close') + ' Close';
      btnCloseDrawer.textContent = getGlyph('close') + ' Close';
      btnBackToNode.textContent = getGlyph('prev') + ' Back to Block Inspector';
      document.getElementById('btnNodeQuickLearnMore').textContent = 'Learn More ' + getGlyph('open');
      document.getElementById('btnTechQuickLearnMore').textContent = 'Learn More ' + getGlyph('open');
    }

    function updatePolarityButtons() {
      const meta = THEME_META[activeTheme] || THEME_META.neo_brutalism;
      if (activePolarity === 'light') {
        btnPolarityLight.style.backgroundColor = meta.stageColors[0];
        btnPolarityLight.style.color = '#ffffff';
        btnPolarityDark.style.backgroundColor = 'transparent';
        btnPolarityDark.style.color = '';
      } else {
        btnPolarityDark.style.backgroundColor = meta.stageColors[0];
        btnPolarityDark.style.color = '#ffffff';
        btnPolarityLight.style.backgroundColor = 'transparent';
        btnPolarityLight.style.color = '';
      }
    }

    // Full Screen Mode & Slide-In Side Panel Controller
    function syncFullscreenAndDrawer() {
      if (isFullscreenMode) {
        if (topIdentityBar) topIdentityBar.classList.add('hidden');
        if (btnCloseDrawer) btnCloseDrawer.classList.remove('hidden');

        rightSidePanel.classList.remove('w-full', 'lg:w-[485px]', 'xl:w-[525px]');
        rightSidePanel.classList.add(
          'absolute',
          'top-0',
          'right-0',
          'bottom-0',
          'w-[495px]',
          'max-w-[92vw]',
          'border-l',
          'border-subtle',
          'shadow-2xl'
        );

        if (isDrawerOpen) {
          rightSidePanel.style.transform = 'translateX(0)';
          panelDismissBackdrop.classList.remove('hidden');
        } else {
          rightSidePanel.style.transform = 'translateX(100%)';
          panelDismissBackdrop.classList.add('hidden');
        }
      } else {
        if (topIdentityBar) topIdentityBar.classList.remove('hidden');
        if (btnCloseDrawer) btnCloseDrawer.classList.add('hidden');
        panelDismissBackdrop.classList.add('hidden');

        rightSidePanel.classList.remove(
          'absolute',
          'top-0',
          'right-0',
          'bottom-0',
          'w-[495px]',
          'max-w-[92vw]',
          'border-l',
          'border-subtle',
          'shadow-2xl'
        );
        rightSidePanel.classList.add('w-full', 'lg:w-[485px]', 'xl:w-[525px]');
        rightSidePanel.style.transform = '';
      }

      syncThemeAlignedButtons();
      requestAnimationFrame(() => {
        renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
        if (tourOverlayVisible) updateTourTooltip();
      });
    }

    function toggleFullscreenMode(forceVal) {
      isFullscreenMode = typeof forceVal === 'boolean' ? forceVal : !isFullscreenMode;
      isDrawerOpen = false;
      syncFullscreenAndDrawer();
    }

    function openSlideInDrawer() {
      if (!isFullscreenMode) return;
      isDrawerOpen = true;
      syncFullscreenAndDrawer();
    }

    function closeSlideInDrawer() {
      if (!isFullscreenMode) return;
      isDrawerOpen = false;
      syncFullscreenAndDrawer();
    }

    // Switch Right Panel between Block Inspector ('node') and Deep Dive ('tech')
    function setRightView(view, techIdOpt, tabOpt) {
      activeRightView = view;
      if (techIdOpt && techMap[techIdOpt]) {
        selectedTechId = techIdOpt;
      }
      if (view === 'node') {
        if (tabOpt) activeNTab = tabOpt;
        inspectorNodeView.classList.remove('hidden');
        inspectorNodeView.classList.add('flex');
        inspectorTechView.classList.add('hidden');
        inspectorTechView.classList.remove('flex');
        btnViewNode.className = 'no-wrap-btn py-1.5 px-3 rounded-lg text-xs font-semibold btn-theme-accent transition cursor-pointer';
        btnViewTech.className = 'no-wrap-btn py-1.5 px-3 rounded-lg text-xs font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
        renderNodeInspector();
      } else {
        if (tabOpt) activeTTab = tabOpt;
        inspectorNodeView.classList.add('hidden');
        inspectorNodeView.classList.remove('flex');
        inspectorTechView.classList.remove('hidden');
        inspectorTechView.classList.add('flex');
        btnViewTech.className = 'no-wrap-btn py-1.5 px-3 rounded-lg text-xs font-semibold btn-theme-accent transition cursor-pointer';
        btnViewNode.className = 'no-wrap-btn py-1.5 px-3 rounded-lg text-xs font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
        renderTechDeepDive();
      }
      syncUrlHash();
    }

    // Render Block Inspector View (5 Tabs: 1. How | 2. Why | 3. Impact | 4. Math | 5. Learn More)
    function renderNodeInspector() {
      const n = nodeMap[selectedNodeId] || nodes[0];
      if (!n) return;

      const inspBadge = document.getElementById('inspBadge');
      inspBadge.textContent = 'BLOCK ' + n.num + ' · ' + n.tag;
      inspBadge.style.color = n.color;
      inspBadge.style.borderColor = n.color;
      inspBadge.style.backgroundColor = n.color + '1a';

      document.getElementById('inspShapePill').textContent = n.sub;
      document.getElementById('inspTitle').textContent = n.title;

      // Render Linked Technology Chips (Each chip opens Deep Dive, plus a direct Learn More ↗ button)
      const chipsContainer = document.getElementById('inspTechChips');
      chipsContainer.innerHTML = '';
      (n.techIds || []).forEach((tid) => {
        const t = techMap[tid];
        if (!t) return;
        const group = document.createElement('div');
        group.className = 'inline-flex items-center gap-1';

        const btn = document.createElement('button');
        btn.className = 'no-wrap-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold surface-panel text-primary-ink border border-hairline hover:border-subtle transition cursor-pointer';
        btn.textContent = getGlyph('tech') + ' ' + t.short;
        btn.addEventListener('click', () => {
          setRightView('tech', tid, 'how');
        });

        const lmBtn = document.createElement('button');
        lmBtn.className = 'no-wrap-btn px-2 py-1.5 rounded-lg text-[11px] mono font-bold btn-theme-accent border transition cursor-pointer';
        lmBtn.title = 'Open ' + t.short + ' White Papers (5. Learn More Tab)';
        lmBtn.textContent = 'Learn More ' + getGlyph('open');
        lmBtn.addEventListener('click', () => {
          setRightView('tech', tid, 'learn');
        });

        group.appendChild(btn);
        group.appendChild(lmBtn);
        chipsContainer.appendChild(group);
      });

      // Update 1-2-3-4-5 Tabs
      document.querySelectorAll('.ntab-btn').forEach((btn) => {
        const isAct = btn.getAttribute('data-ntab') === activeNTab;
        btn.className = isAct
          ? 'ntab-btn no-wrap-btn py-1.5 px-1.5 rounded-lg text-[11.5px] font-semibold btn-theme-accent transition cursor-pointer'
          : 'ntab-btn no-wrap-btn py-1.5 px-1.5 rounded-lg text-[11.5px] font-medium text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      });

      const ntabHeading = document.getElementById('ntabHeading');
      const ntabBody = document.getElementById('ntabBody');
      const ntabCalloutBox = document.getElementById('ntabCalloutBox');
      const ntabSubLabel = document.getElementById('ntabSubLabel');
      const ntabSubContent = document.getElementById('ntabSubContent');
      const btnNodeQuickLearnMore = document.getElementById('btnNodeQuickLearnMore');

      if (activeNTab === 'learn') {
        ntabHeading.textContent = '05 // LEARN MORE (PRIMARY LITERATURE & WHITE PAPERS)';
        const papers = getExternalResourcesForNode(n);
        ntabBody.innerHTML = renderLearnMoreCardsHtml(papers);
        ntabCalloutBox.classList.add('hidden');
        btnNodeQuickLearnMore.classList.add('hidden');
      } else {
        ntabCalloutBox.classList.remove('hidden');
        btnNodeQuickLearnMore.classList.remove('hidden');

        if (activeNTab === 'how') {
          ntabHeading.textContent = '01 // HOW IT WORKS (MECHANISM)';
          ntabBody.textContent = n.how;
          ntabSubLabel.textContent = 'WHY IT SITS HERE IN THE DATAFLOW';
          ntabSubContent.textContent = (n.role || '') + ' — ' + n.tensor;
        } else if (activeNTab === 'why') {
          ntabHeading.textContent = '02 // WHY IT IS USED (ENGINEERING RATIONALE)';
          ntabBody.textContent = n.why;
          ntabSubLabel.textContent = 'MATHEMATICAL IDENTITY & INVARIANT';
          ntabSubContent.textContent = n.formula;
        } else if (activeNTab === 'contrib') {
          ntabHeading.textContent = '03 // WHAT IT CONTRIBUTES TO SYSTEM GOAL';
          ntabBody.textContent = n.contrib;
          ntabSubLabel.textContent = 'WHY IT SITS HERE IN THE DATAFLOW';
          ntabSubContent.textContent = n.role || n.sub;
        } else {
          ntabHeading.textContent = '04 // MATHEMATICAL FORMULATION & TENSOR ABI';
          ntabBody.textContent = n.formula;
          ntabSubLabel.textContent = 'IN / OUT TENSOR SIGNATURE';
          ntabSubContent.textContent = n.tensor;
        }
      }

      renderContextualWidget(n);
    }

    // Render Deep Dive View (5 Tabs: 1. How | 2. Why | 3. Impact | 4. Science | 5. Learn More)
    function renderTechDeepDive() {
      const t = techMap[selectedTechId] || techLib[0];
      if (!t) return;
      selTechDropdown.value = t.id;
      document.getElementById('techTitle').textContent = t.title;

      // Update 1-2-3-4-5 Tabs in Deep Dive
      document.querySelectorAll('.ttab-btn').forEach((btn) => {
        const isAct = btn.getAttribute('data-ttab') === activeTTab;
        btn.className = isAct
          ? 'ttab-btn no-wrap-btn py-1.5 px-1.5 rounded-lg text-[11.5px] font-semibold btn-theme-accent transition cursor-pointer'
          : 'ttab-btn no-wrap-btn py-1.5 px-1.5 rounded-lg text-[11.5px] font-medium text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      });

      const ttabHeading = document.getElementById('ttabHeading');
      const ttabBody = document.getElementById('ttabBody');
      const ttabCalloutBox = document.getElementById('ttabCalloutBox');
      const ttabSubLabel = document.getElementById('ttabSubLabel');
      const ttabSubContent = document.getElementById('ttabSubContent');
      const btnTechQuickLearnMore = document.getElementById('btnTechQuickLearnMore');

      if (activeTTab === 'learn') {
        ttabHeading.textContent = '05 // LEARN MORE (FOUNDATIONAL WHITE PAPERS & SOURCES)';
        const resList = TECH_EXTERNAL_RESOURCES[t.id] || [];
        ttabBody.innerHTML = renderLearnMoreCardsHtml(resList);
        ttabCalloutBox.classList.add('hidden');
        btnTechQuickLearnMore.classList.add('hidden');
      } else {
        ttabCalloutBox.classList.remove('hidden');
        btnTechQuickLearnMore.classList.remove('hidden');

        if (activeTTab === 'how') {
          ttabHeading.textContent = '01 // HOW IT WORKS (MECHANISM)';
          ttabBody.textContent = t.how;
          ttabSubLabel.textContent = 'WHY IT SITS HERE IN THE DATAFLOW';
          ttabSubContent.textContent = t.placement;
        } else if (activeTTab === 'why') {
          ttabHeading.textContent = '02 // WHY IT IS USED (PROBLEM SOLVED)';
          ttabBody.textContent = t.why;
          ttabSubLabel.textContent = 'RESEARCH ORIGINS & EVOLUTION';
          ttabSubContent.textContent = t.origins;
        } else if (activeTTab === 'contrib') {
          ttabHeading.textContent = '03 // WHAT IT CONTRIBUTES TO SYSTEM GOAL';
          ttabBody.textContent = t.contrib;
          ttabSubLabel.textContent = 'WHY IT SITS HERE IN THE DATAFLOW';
          ttabSubContent.textContent = t.placement;
        } else {
          ttabHeading.textContent = '04 // UNDERLYING SCIENCE & MATHEMATICAL MECHANISM';
          ttabBody.textContent = t.science;
          ttabSubLabel.textContent = 'RESEARCH ORIGINS & EVOLUTION';
          ttabSubContent.textContent = t.origins;
        }
      }

      const usedContainer = document.getElementById('techUsedInNodes');
      usedContainer.innerHTML = '';
      (t.usedIn || []).forEach((nid) => {
        const n = nodeMap[nid];
        if (!n) return;
        const b = document.createElement('button');
        b.className = 'no-wrap-btn mono text-xs px-3 py-1 rounded-lg surface-panel text-primary-ink border border-hairline hover:border-subtle transition cursor-pointer';
        b.textContent = getGlyph('node') + ' ' + n.num + ' · ' + n.title;
        b.addEventListener('click', () => {
          selectedNodeId = n.id;
          setRightView('node');
        });
        usedContainer.appendChild(b);
      });
    }

    // Render Contextual Interactive Micro-Simulator inside the Right Panel
    function renderContextualWidget(node) {
      const wTitle = document.getElementById('ctxWidgetTitle');
      const wTag = document.getElementById('ctxWidgetTag');
      const wBody = document.getElementById('ctxWidgetBody');
      wBody.innerHTML = '';

      if (node.stageGroup === 'mem') {
        wTitle.textContent = 'INTERACTIVE 5,376B CACHE-LINE INSPECTOR';
        wTag.textContent = '84 × 64B CL';
        const segments = [
          { name: 'Cars [0..5]', bytes: '0..1535', cl: '24 CL', color: '#38bdf8', desc: '6 Cars × 64 floats (256B each): Pos, Vel, Rot6D, Local Vel, Dodge/Flip Timers, 4-Wheel Shocks' },
          { name: 'Ball [6]', bytes: '1536..1663', cl: '2 CL', color: '#22d3ee', desc: '1 Ball × 32 floats (128B): Position, Linear/Angular Velocity, Last Hit Car, Magnus Force' },
          { name: 'Traj [7..14]', bytes: '1664..2687', cl: '16 CL', color: '#818cf8', desc: '8 BallRingBuffer480 Samples × 32 floats (1,024B): 4.0s Future Bounce & Spin Curve' },
          { name: 'Match [15]', bytes: '2688..2751', cl: '1 CL', color: '#a78bfa', desc: '1 Match Node × 16 floats (64B): κ_Δt Action Duration, Score Diff, Clock, Gravity' },
          { name: 'Pads [16..49]', bytes: '2752..3839', cl: '17 CL', color: '#f472b6', desc: '34 Boost Pads × 8 floats (1,088B): Canonical X/Y/Z, IsBigPad, Active Flag, Respawn Timer' },
          { name: 'Goals/Wheels/OBB', bytes: '3840..4735', cl: '14 CL', color: '#fbbf24', desc: '6 Goals + 4 Zero-Lag Ego Wheel Raycasts + 4 Nearest Wall Surface OBBs (896B)' },
          { name: 'PrivCtx [128]', bytes: '4864..5375', cl: '8 CL', color: '#34d399', desc: '128 Privileged Floats (512B): Exact Opponent Boost/Flip Secrets (Training Critic Only)' }
        ];
        const barRow = document.createElement('div');
        barRow.className = 'grid grid-cols-7 gap-1';
        segments.forEach((seg, idx) => {
          const b = document.createElement('button');
          b.className =
            'py-1.5 px-1 rounded text-[10px] mono font-bold truncate border transition cursor-pointer ' +
            (selectedMemSliceIdx === idx
              ? 'border-white text-slate-950'
              : 'border-transparent text-slate-950 opacity-75 hover:opacity-100');
          b.style.backgroundColor = seg.color;
          b.textContent = seg.cl;
          b.title = seg.name;
          b.addEventListener('click', () => {
            selectedMemSliceIdx = idx;
            renderContextualWidget(node);
          });
          barRow.appendChild(b);
        });
        wBody.appendChild(barRow);

        const activeSeg = segments[selectedMemSliceIdx] || segments[0];
        const info = document.createElement('div');
        info.className = 'p-2.5 rounded-lg surface-root border border-hairline mono text-xs flex flex-col gap-1';
        info.innerHTML =
          '<div class="flex justify-between"><span class="font-bold text-primary-ink">' +
          activeSeg.name +
          '</span><span class="text-theme-accent font-bold">Bytes ' +
          activeSeg.bytes +
          ' (' +
          activeSeg.cl +
          ')</span></div>' +
          '<div class="text-secondary-ink font-sans text-xs">' +
          activeSeg.desc +
          '</div>';
        wBody.appendChild(info);

      } else if (node.stageGroup === 'edges') {
        wTitle.textContent = '16×64 PAIRWISE INTERCEPT SIMULATOR';
        wTag.textContent = '1,024 PAIRS · 72D';
        const queries = [
          { label: 'Q0: Ego Car (Blue #0)', v: 1850, pos: [-420, -1200, 17] },
          { label: 'Q1: Teammate #1', v: 1410, pos: [1100, -2400, 17] },
          { label: 'Q3: Opponent #1 (Chal)', v: 2150, pos: [-180, 640, 190] },
          { label: 'Q6: Live Ball', v: 2400, pos: [0, 120, 420] }
        ];
        const keys = [
          { label: 'K6: Current Ball', pos: [0, 120, 420] },
          { label: 'K10: Ball Bounce +1.3s (τ_4)', pos: [-1650, 3100, 680] },
          { label: 'K22: Mid-Left 100% Boost Pad', pos: [-3072, 0, 73] },
          { label: 'K57: Ego Wheel #1 Raycast', pos: [-420, -1180, 17] }
        ];

        const selRow = document.createElement('div');
        selRow.className = 'grid grid-cols-2 gap-1.5';
        const sQ = document.createElement('select');
        sQ.className = 'surface-root text-primary-ink border border-hairline rounded px-2 py-1 text-xs mono';
        queries.forEach((q, i) => {
          const o = document.createElement('option');
          o.value = i;
          o.textContent = q.label;
          if (i === selectedPairQueryIdx) o.selected = true;
          sQ.appendChild(o);
        });
        sQ.addEventListener('change', (e) => {
          selectedPairQueryIdx = Number(e.target.value);
          renderContextualWidget(node);
        });

        const sK = document.createElement('select');
        sK.className = 'surface-root text-primary-ink border border-hairline rounded px-2 py-1 text-xs mono';
        keys.forEach((k, i) => {
          const o = document.createElement('option');
          o.value = i;
          o.textContent = k.label;
          if (i === selectedPairKeyIdx % keys.length) o.selected = true;
          sK.appendChild(o);
        });
        sK.addEventListener('change', (e) => {
          selectedPairKeyIdx = Number(e.target.value);
          renderContextualWidget(node);
        });

        selRow.appendChild(sQ);
        selRow.appendChild(sK);
        wBody.appendChild(selRow);

        const qObj = queries[selectedPairQueryIdx] || queries[0];
        const kObj = keys[selectedPairKeyIdx % keys.length] || keys[0];
        const dx = kObj.pos[0] - qObj.pos[0];
        const dy = kObj.pos[1] - qObj.pos[1];
        const dz = kObj.pos[2] - qObj.pos[2];
        const dist = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz));
        const tReach = (dist / Math.max(qObj.v, 500)).toFixed(2);
        const diffWeight = Math.max(0.08, Math.min(0.94, 1.35 - Number(tReach) * 0.45)).toFixed(2);

        const metrics = document.createElement('div');
        metrics.className = 'grid grid-cols-3 gap-1.5 mono text-xs';
        metrics.innerHTML =
          '<div class="p-2 rounded surface-root border border-hairline"><div class="text-muted-ink text-[10px]">3D DIST</div><div class="text-primary-ink font-bold">' +
          dist +
          ' uu</div></div>' +
          '<div class="p-2 rounded surface-root border border-hairline"><div class="text-muted-ink text-[10px]">T_INTERCEPT</div><div class="text-theme-accent font-bold">' +
          tReach +
          ' s</div></div>' +
          '<div class="p-2 rounded surface-root border border-hairline"><div class="text-muted-ink text-[10px]">DIFF-ATTN</div><div class="text-primary-ink font-bold">' +
          diffWeight +
          '</div></div>';
        wBody.appendChild(metrics);

      } else if (node.stageGroup === 'titans') {
        wTitle.textContent = 'TITANS SURPRISE & 8-EXPERT SOFT-MOE ROUTER';
        wTag.textContent = 'FP32 ||W||_F <= 4.0';

        const sliderRow = document.createElement('div');
        sliderRow.className = 'flex items-center justify-between gap-2';
        sliderRow.innerHTML =
          '<span class="text-secondary-ink">Opponent Surprise Residual ||r_t||:</span><span class="mono font-bold text-theme-accent">' +
          surpriseIntensity.toFixed(2) +
          '</span>';
        wBody.appendChild(sliderRow);

        const rng = document.createElement('input');
        rng.type = 'range';
        rng.min = '0.05';
        rng.max = '1.50';
        rng.step = '0.05';
        rng.value = String(surpriseIntensity);
        rng.className = 'w-full cursor-pointer';
        rng.addEventListener('input', (e) => {
          surpriseIntensity = Number(e.target.value);
          renderContextualWidget(node);
        });
        wBody.appendChild(rng);

        const frobNorm = Math.min(4.0, 2.15 + surpriseIntensity * 1.15).toFixed(2);
        const experts = [
          { name: 'E1: Ground/50s', w: 0.14 },
          { name: 'E2: Fast Aerial', w: 0.22 },
          { name: 'E3: Wall/Double', w: Math.min(0.42, 0.12 + surpriseIntensity * 0.18) },
          { name: 'E4: Flip Reset', w: Math.min(0.38, 0.08 + surpriseIntensity * 0.15) },
          { name: 'E5: Shadow Def', w: Math.max(0.06, 0.34 - surpriseIntensity * 0.12) },
          { name: 'E6: Demo/Evade', w: Math.min(0.45, 0.10 + surpriseIntensity * 0.22) }
        ];
        const expGrid = document.createElement('div');
        expGrid.className = 'grid grid-cols-2 gap-1.5 pt-1';
        experts.forEach((ex) => {
          const pct = Math.round(ex.w * 100);
          const item = document.createElement('div');
          item.className = 'p-1.5 rounded surface-root border border-hairline flex flex-col gap-1';
          item.innerHTML =
            '<div class="flex justify-between text-[11px] mono"><span class="text-secondary-ink">' +
            ex.name +
            '</span><span class="text-theme-accent font-bold">' +
            pct +
            '%</span></div>' +
            '<div class="w-full h-1.5 surface-panel rounded overflow-hidden"><div class="h-full btn-theme-accent" style="width:' +
            pct +
            '%"></div></div>';
          expGrid.appendChild(item);
        });
        wBody.appendChild(expGrid);

        const foot = document.createElement('div');
        foot.className = 'mono text-[11px] text-secondary-ink flex justify-between pt-1';
        foot.innerHTML =
          '<span>Fast-Weight Norm: ||W_t||_F = ' +
          frobNorm +
          ' / 4.00</span><span class="text-theme-accent font-bold">FSQ Code #418</span>';
        wBody.appendChild(foot);

      } else {
        wTitle.textContent = '60HZ SUBTICK CHUNK & 4-HORIZON CRITIC';
        wTag.textContent = 'K_sub = 4 (16.7ms)';
        const subticks = [
          { k: 'Subtick 1 (0–16.7ms)', dj: '0', pitch: '-0.85' },
          { k: 'Subtick 2 (16.7–33.3ms)', dj: '1 (Stall Clamp)', pitch: '+0.02 (0.12·tanh)' },
          { k: 'Subtick 3 (33.3–50.0ms)', dj: '0', pitch: '-0.98 (Cancel)' },
          { k: 'Subtick 4 (50.0–66.7ms)', dj: '0', pitch: '-0.94 (Align)' }
        ];
        const tbl = document.createElement('div');
        tbl.className = 'flex flex-col gap-1 mono text-[11px]';
        subticks.forEach((st) => {
          const r = document.createElement('div');
          r.className = 'p-1.5 rounded surface-root border border-hairline flex items-center justify-between';
          r.innerHTML =
            '<span class="text-primary-ink font-semibold">' +
            st.k +
            '</span>' +
            '<span class="text-theme-accent font-bold">m_dj=' +
            st.dj.charAt(0) +
            ' · Pitch ' +
            st.pitch +
            '</span>';
          tbl.appendChild(r);
        });
        wBody.appendChild(tbl);

        const hRow = document.createElement('div');
        hRow.className = 'grid grid-cols-4 gap-1 pt-1 mono text-[10px] text-center';
        hRow.innerHTML =
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink">γ=0.95 (1s)</div><div class="text-primary-ink font-bold">+1.42</div></div>' +
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink">γ=0.98 (2.5s)</div><div class="text-primary-ink font-bold">+2.18</div></div>' +
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink">γ=0.995 (10s)</div><div class="text-primary-ink font-bold">+3.05</div></div>' +
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink">Sparse Win</div><div class="text-theme-accent font-bold">64.2%</div></div>';
        wBody.appendChild(hRow);
      }
    }

    // Update Floating Walkthrough Tooltip Overlay on Canvas
    function updateTourTooltip() {
      if (activeScenarioKey === 'none' || !tourOverlayVisible || !scenarios[activeScenarioKey]) {
        tourTooltip.classList.add('hidden');
        btnToggleTour.textContent = getGlyph('tourOff') + ' Show Tour';
        btnToggleTour.className = 'no-wrap-btn px-2 py-1 rounded-lg text-[11.5px] font-medium surface-panel text-secondary-ink border border-hairline hover:text-primary-ink transition cursor-pointer';
        return;
      }

      tourTooltip.classList.remove('hidden');
      btnToggleTour.textContent = getGlyph('tourOn') + ' Tour Active';
      btnToggleTour.className = 'no-wrap-btn px-2 py-1 rounded-lg text-[11.5px] font-semibold btn-theme-accent border transition cursor-pointer';

      const scen = scenarios[activeScenarioKey];
      const steps = scen.steps;
      if (activeStepIdx >= steps.length) activeStepIdx = 0;
      if (activeStepIdx < 0) activeStepIdx = steps.length - 1;

      const step = steps[activeStepIdx];
      ttStepBadge.textContent = 'STEP ' + (activeStepIdx + 1) + ' OF ' + steps.length;
      ttScenarioLabel.textContent = scen.label;
      ttTitle.textContent = step.title;
      ttDesc.textContent = step.desc;

      // Sync focused node & right-hand inspector automatically
      if (step.focusNode && nodeMap[step.focusNode]) {
        selectedNodeId = step.focusNode;
        if (activeRightView === 'node') {
          renderNodeInspector();
        } else if (step.techId) {
          selectedTechId = step.techId;
          renderTechDeepDive();
        }
      }

      // Position tooltip smartly near the focused node inside #canvasAspectBox
      const fn = nodeMap[step.focusNode] || nodes[0];
      const boxRect = canvasAspectBox.getBoundingClientRect();
      const scaleX = boxRect.width / renderer.BASE_W;
      const scaleY = boxRect.height / renderer.BASE_H;

      const nodeScreenX = fn.x * scaleX;
      const nodeScreenY = fn.y * scaleY;
      const tooltipW = tourTooltip.offsetWidth || 380;
      const tooltipH = tourTooltip.offsetHeight || 220;

      let leftPx = nodeScreenX + fn.w * 0.55 * scaleX + 16;
      if (fn.col >= 3) {
        leftPx = nodeScreenX - fn.w * 0.55 * scaleX - tooltipW - 16;
      }
      leftPx = Math.max(16, Math.min(boxRect.width - tooltipW - 16, leftPx));

      let topPx = nodeScreenY - Math.round(tooltipH * 0.35);
      topPx = Math.max(16, Math.min(boxRect.height - tooltipH - 16, topPx));

      tourTooltip.style.left = Math.round(leftPx) + 'px';
      tourTooltip.style.top = Math.round(topPx) + 'px';
      tourTooltip.style.bottom = 'auto';
    }

    function setPolarity(mode) {
      activePolarity = mode === 'dark' ? 'dark' : 'light';
      document.body.setAttribute('data-mode', activePolarity);
      try {
        localStorage.setItem('arashikage_arch_polarity', activePolarity);
      } catch (_) {}
      updatePolarityButtons();
      setTheme(activeTheme);
    }

    function setTheme(themeKey) {
      if (!THEME_META[themeKey]) return;
      activeTheme = themeKey;
      document.body.setAttribute('data-theme', themeKey);
      document.body.setAttribute('data-mode', activePolarity);

      try {
        localStorage.setItem('arashikage_arch_theme', activeTheme);
      } catch (_) {}

      if (selTheme && selTheme.value !== activeTheme) {
        selTheme.value = activeTheme;
      }

      const meta = THEME_META[themeKey];
      const notesEl = document.getElementById('themeStyleNotes');
      if (notesEl) {
        notesEl.textContent = meta.name.toUpperCase() + ' (' + activePolarity.toUpperCase() + ') — ' + meta.notes;
      }
      const brandDot = document.getElementById('brandDot');
      if (brandDot) {
        brandDot.style.backgroundColor = meta.stageColors[0];
      }

      renderer.applyStagePaletteToNodes(nodes, meta.stageColors);

      syncThemeAlignedButtons();
      updatePolarityButtons();
      updateTourTooltip();
      renderNodeInspector();
      if (activeRightView === 'tech') renderTechDeepDive();
    }

    // Event Listeners: Theme & Polarity
    selTheme.addEventListener('change', (e) => {
      setTheme(e.target.value);
    });
    btnPolarityLight.addEventListener('click', () => setPolarity('light'));
    btnPolarityDark.addEventListener('click', () => setPolarity('dark'));

    document.getElementById('btnPrevTheme').addEventListener('click', () => {
      const idx = THEME_ORDER.indexOf(activeTheme);
      setTheme(THEME_ORDER[(idx - 1 + THEME_ORDER.length) % THEME_ORDER.length]);
    });
    document.getElementById('btnNextTheme').addEventListener('click', () => {
      const idx = THEME_ORDER.indexOf(activeTheme);
      setTheme(THEME_ORDER[(idx + 1) % THEME_ORDER.length]);
    });

    // Event Listeners: Scenario & Tour Tooltip
    selScenario.addEventListener('change', (e) => {
      activeScenarioKey = e.target.value;
      activeStepIdx = 0;
      tourOverlayVisible = activeScenarioKey !== 'none';
      updateTourTooltip();
    });

    btnToggleTour.addEventListener('click', () => {
      if (activeScenarioKey === 'none') {
        activeScenarioKey = 'tour';
        selScenario.value = 'tour';
        activeStepIdx = 0;
        tourOverlayVisible = true;
      } else {
        tourOverlayVisible = !tourOverlayVisible;
      }
      updateTourTooltip();
    });

    btnCloseTooltip.addEventListener('click', () => {
      tourOverlayVisible = false;
      updateTourTooltip();
    });

    btnTtPrev.addEventListener('click', () => {
      activeStepIdx--;
      updateTourTooltip();
    });

    btnTtNext.addEventListener('click', () => {
      activeStepIdx++;
      updateTourTooltip();
    });

    btnTtDeepDive.addEventListener('click', () => {
      const scen = scenarios[activeScenarioKey];
      const step = scen ? scen.steps[activeStepIdx] : null;
      const tid = step && step.techId ? step.techId : nodeMap[selectedNodeId].techIds[0] || 't0';
      setRightView('tech', tid, 'how');
      openSlideInDrawer();
    });

    selMode.addEventListener('change', (e) => {
      activeMode = e.target.value;
    });

    // Event Listeners: Right Panel Mode & Tabs
    btnViewNode.addEventListener('click', () => {
      setRightView('node');
      openSlideInDrawer();
    });
    btnViewTech.addEventListener('click', () => {
      setRightView('tech', selectedTechId);
      openSlideInDrawer();
    });
    btnBackToNode.addEventListener('click', () => {
      setRightView('node');
    });
    selTechDropdown.addEventListener('change', (e) => {
      selectedTechId = e.target.value;
      renderTechDeepDive();
      syncUrlHash();
    });

    document.querySelectorAll('.ntab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeNTab = btn.getAttribute('data-ntab');
        renderNodeInspector();
        syncUrlHash();
      });
    });

    document.querySelectorAll('.ttab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTTab = btn.getAttribute('data-ttab');
        renderTechDeepDive();
        syncUrlHash();
      });
    });

    document.getElementById('btnNodeQuickLearnMore').addEventListener('click', () => {
      activeNTab = 'learn';
      renderNodeInspector();
      syncUrlHash();
    });

    document.getElementById('btnTechQuickLearnMore').addEventListener('click', () => {
      activeTTab = 'learn';
      renderTechDeepDive();
      syncUrlHash();
    });

    // Event Listeners: Full Screen & Slide-Over Dismissal
    btnToggleFullscreen.addEventListener('click', () => {
      toggleFullscreenMode();
    });
    btnCloseDrawer.addEventListener('click', () => {
      closeSlideInDrawer();
    });
    panelDismissBackdrop.addEventListener('click', () => {
      closeSlideInDrawer();
    });

    canvasWrapper.addEventListener('click', (e) => {
      if (isFullscreenMode && isDrawerOpen && e.target === canvasWrapper) {
        closeSlideInDrawer();
      }
    });

    // Canvas Hit-Testing & Click
    canvas.addEventListener('mousemove', (e) => {
      const hit = renderer.getNodeAtCanvasCoords(canvas, e.clientX, e.clientY, nodes);
      hoveredNodeId = hit ? hit.id : null;
      canvas.style.cursor = hit ? 'pointer' : 'default';
    });

    canvas.addEventListener('click', (e) => {
      const hit = renderer.getNodeAtCanvasCoords(canvas, e.clientX, e.clientY, nodes);
      if (hit) {
        selectedNodeId = hit.id;
        setRightView('node');
        openSlideInDrawer();
      } else if (isFullscreenMode && isDrawerOpen) {
        closeSlideInDrawer();
      }
    });

    // Resize Observer for 1120:680 Aspect Ratio Box
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => {
        renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
        if (tourOverlayVisible) updateTourTooltip();
      }).observe(canvasWrapper);
    }
    window.addEventListener('resize', () => {
      renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
      if (tourOverlayVisible) updateTourTooltip();
    });

    // Standalone Single-File HTML Export, PNG Export & Mermaid Copy
    document.getElementById('btnExportHtml').addEventListener('click', async () => {
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
          if ((link.getAttribute('href') || '').includes('themes.css')) {
            const st = document.createElement('style');
            st.textContent = cssText;
            link.replaceWith(st);
          }
        });
        const map = {
          'nodes_and_edges.js': nodesJs,
          'scenarios_and_tech.js': scenariosJs,
          'canvas_renderer.js': rendererJs,
          'app.js': appJs
        };
        clone.querySelectorAll('script[src]').forEach((scr) => {
          const src = scr.getAttribute('src') || '';
          for (const [k, v] of Object.entries(map)) {
            if (src.includes(k)) {
              const s = document.createElement('script');
              s.textContent = v;
              scr.replaceWith(s);
              break;
            }
          }
        });
        const htmlContent = '<!DOCTYPE html>\n' + clone.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'arashikage_hex63_architecture_explorer.html';
        a.click();
        URL.revokeObjectURL(url);
      } catch (_) {
        const htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'arashikage_hex63_architecture_explorer.html';
        a.click();
        URL.revokeObjectURL(url);
      }
    });

    document.getElementById('btnExportPng').addEventListener('click', () => {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arashikage_hex63_dataflow.png';
      a.click();
    });

    document.getElementById('btnCopyMermaid').addEventListener('click', () => {
      const mmd = `flowchart LR
  subgraph S1["Stage 1: C++20 Observation (5,376B)"]
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
  end`;
      navigator.clipboard.writeText(mmd).then(() => {
        const btn = document.getElementById('btnCopyMermaid');
        btn.textContent = getGlyph('export') + ' Copied';
        setTimeout(() => {
          syncThemeAlignedButtons();
        }, 1600);
      });
    });

    // Keyboard shortcuts 1..6 for theme comparison, L / D for Light / Dark, Escape for drawer/fullscreen
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isFullscreenMode) {
        if (isDrawerOpen) {
          closeSlideInDrawer();
        } else {
          toggleFullscreenMode(false);
        }
        return;
      }
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      const numIdx = parseInt(e.key, 10) - 1;
      if (numIdx >= 0 && numIdx < THEME_ORDER.length) {
        setTheme(THEME_ORDER[numIdx]);
      } else if (e.key === 'l' || e.key === 'L') {
        setPolarity('light');
      } else if (e.key === 'd' || e.key === 'D') {
        setPolarity('dark');
      }
    });

    // Restore saved theme/polarity & URL hash state
    try {
      const savedTheme = localStorage.getItem('arashikage_arch_theme');
      const savedPol = localStorage.getItem('arashikage_arch_polarity');
      if (savedTheme && THEME_META[savedTheme]) activeTheme = savedTheme;
      if (savedPol === 'dark' || savedPol === 'light') activePolarity = savedPol;
    } catch (_) {}

    setTheme(activeTheme);
    setPolarity(activePolarity);
    const restoredFromHash = restoreStateFromUrlHash();
    if (restoredFromHash) {
      setRightView(activeRightView);
    } else {
      renderNodeInspector();
      renderTechDeepDive();
      syncUrlHash();
    }

    renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
    setTimeout(updateTourTooltip, 60);

    function loop() {
      renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
      animTick += 0.016;

      let highlightSet = null;
      if (tourOverlayVisible && activeScenarioKey !== 'none' && scenarios[activeScenarioKey]) {
        const step = scenarios[activeScenarioKey].steps[activeStepIdx];
        if (step && step.highlight) {
          highlightSet = new Set(step.highlight);
        }
      }

      renderer.renderCanvas(ctx, canvas, {
        nodes,
        edges,
        nodeMap,
        activeTheme,
        activePolarity,
        activeMode,
        selectedNodeId,
        hoveredNodeId,
        highlightSet,
        animTick
      });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
