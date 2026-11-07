// ============================================================================
// ARASHIKAGE (HEX63 + LEGACY GEN 1..3) — INTERACTIVE ARCHITECTURE EXPLORER
// ============================================================================
(function () {
  const ARCH_REGISTRY = window.ARASHIKAGE_ARCHITECTURES || {};
  let activeArchKey = 'hex63';
  let nodes = window.ARASHIKAGE_NODES || [];
  let edges = window.ARASHIKAGE_EDGES || [];
  let scenarios = window.ARASHIKAGE_SCENARIOS || {};
  let techLib = window.ARASHIKAGE_TECH_LIBRARY || [];
  let TECH_EXTERNAL_RESOURCES = window.ARASHIKAGE_EXTERNAL_RESOURCES || {};
  let activeColHeaders = (ARCH_REGISTRY.hex63 && ARCH_REGISTRY.hex63.colHeaders) || [];
  let activeMermaidDiagram = (ARCH_REGISTRY.hex63 && ARCH_REGISTRY.hex63.mermaidDiagram) || '';
  const renderer = window.ArashikageCanvasRenderer;

  let nodeMap = {};
  let techMap = {};

  function rebuildLookupMaps() {
    nodeMap = {};
    nodes.forEach((n) => {
      nodeMap[n.id] = n;
    });
    techMap = {};
    techLib.forEach((t) => {
      techMap[t.id] = t;
    });
  }
  rebuildLookupMaps();

  // Application State (Default to un-dimmed Free Exploration on initial load)
  let selectedNodeId = 'dma_slice';
  let hoveredNodeId = null;
  let activeNTab = 'how'; // 'how' | 'why' | 'contrib' | 'math' | 'learn'
  let activeTTab = 'how'; // 'how' | 'why' | 'contrib' | 'science' | 'learn'
  let activeRightView = 'node'; // 'node' | 'tech'
  let selectedTechId = 't0';
  let activeMode = 'all';
  let activeScenarioKey = 'none';
  let activeStepIdx = 0;
  let tourOverlayVisible = false;
  let animTick = 0;

  // Fullscreen & Slide-In Drawer State
  let isFullscreenMode = false;
  let isDrawerOpen = false;

  // 6-Stage Contextual Micro-Simulator State
  let selectedMemSliceIdx = 0;
  let selectedPairQueryIdx = 0;
  let selectedPairKeyIdx = 0;
  let surpriseIntensity = 0.68;
  let selectedLatentPhaseIdx = 1;
  let selectedSubtickIdx = 1;
  let selectedCriticHorizonIdx = 1;

  // 12-Style × 2-Polarity Theme Engine Metadata (WCAG AA >= 4.5:1 Verified Across All 24 States)
  const THEME_ORDER = [
    'neo_brutalism',
    'modular_typo',
    'bauhaus',
    'utilitarian',
    'blueprint',
    'braun_industrial',
    'memphis',
    'pixel_art',
    'art_deco',
    'aurora',
    'cyberpunk',
    'solarpunk'
  ];

  const MODE_LABELS = {
    all: 'All Pathways',
    live: 'Live 5.5ms',
    train: 'Train (4,096 Arenas)',
    distill: 'Distill (Warm-Start)'
  };

  function isNodeActiveInMode(node, mode) {
    return !mode || mode === 'all' || !node || !node.modes || node.modes.includes(mode);
  }

  const THEME_META = {
    neo_brutalism: {
      name: 'Neo-Brutalism',
      notes: '2.5px ink borders · Hard offset shadows',
      stageColorsLight: ['#ff4d00', '#00b4d8', '#7c3aed', '#db2777', '#eab308', '#15803d'],
      stageColorsDark:  ['#ff5e1a', '#22d3ee', '#a78bfa', '#f472b6', '#facc15', '#4ade80']
    },
    modular_typo: {
      name: 'Modular Typography',
      notes: 'Swiss Grid · Flush 1.5px rules · 0px radius',
      stageColorsLight: ['#c81e00', '#0050d8', '#6d28d9', '#be123c', '#92400e', '#0f766e'],
      stageColorsDark:  ['#ff4522', '#3b82f6', '#a78bfa', '#fb7185', '#facc15', '#2dd4bf']
    },
    bauhaus: {
      name: 'Bauhaus Constructivism',
      notes: 'Weimar 1923 · Primary geometric blocks & emblems',
      stageColorsLight: ['#d92b2b', '#1d4ed8', '#b45309', '#be123c', '#0f766e', '#4338ca'],
      stageColorsDark:  ['#ef4444', '#60a5fa', '#facc15', '#fb7185', '#2dd4bf', '#a78bfa']
    },
    utilitarian: {
      name: 'Utilitarian CAD',
      notes: '100% Plex Mono · CAD reticles · 90° traces',
      stageColorsLight: ['#92400e', '#0369a1', '#6d28d9', '#be185d', '#854d0e', '#047857'],
      stageColorsDark:  ['#f59e0b', '#38bdf8', '#a78bfa', '#f472b6', '#facc15', '#34d399']
    },
    blueprint: {
      name: 'Blueprint Cyanotype',
      notes: 'Prussian Cyanotype · Drafting grid & dimension ticks',
      stageColorsLight: ['#1d4ed8', '#0369a1', '#4338ca', '#b91c1c', '#0f766e', '#1e40af'],
      stageColorsDark:  ['#38bdf8', '#7dd3fc', '#a5b4fc', '#fbbf24', '#34d399', '#60a5fa']
    },
    braun_industrial: {
      name: 'Braun / Apollo Console',
      notes: 'Dieter Rams anodized modules · LED indicator jewels',
      stageColorsLight: ['#ea580c', '#0f766e', '#1d4ed8', '#b45309', '#be123c', '#15803d'],
      stageColorsDark:  ['#f97316', '#2dd4bf', '#60a5fa', '#facc15', '#fb7185', '#4ade80']
    },
    memphis: {
      name: 'Memphis Milano',
      notes: '80s Sottsass pop · Stage-colored shadows',
      stageColorsLight: ['#db2777', '#0e7490', '#7c3aed', '#c2410c', '#eab308', '#047857'],
      stageColorsDark:  ['#f472b6', '#22d3ee', '#a78bfa', '#fb923c', '#facc15', '#34d399']
    },
    pixel_art: {
      name: '16-Bit Pixel Art',
      notes: 'Arcade command deck · Stepped borders & scanlines',
      stageColorsLight: ['#005f6b', '#023e8a', '#6a1b9a', '#9d174d', '#92400e', '#166534'],
      stageColorsDark:  ['#00e5ff', '#38bdf8', '#c084fc', '#ff2a85', '#f59e0b', '#22c55e']
    },
    art_deco: {
      name: 'Art Deco Metropolis',
      notes: '1929 Chrysler brass pinstripes · Stepped Ziggurat inlays',
      stageColorsLight: ['#9a6f1a', '#0f766e', '#7c2d12', '#1e3a8a', '#854d0e', '#14532d'],
      stageColorsDark:  ['#eab308', '#2dd4bf', '#f59e0b', '#60a5fa', '#fde047', '#4ade80']
    },
    aurora: {
      name: 'Aurora Borealis',
      notes: 'Borealis plumes · Specular crystal rims',
      stageColorsLight: ['#0f766e', '#0369a1', '#6d28d9', '#be185d', '#92400e', '#15803d'],
      stageColorsDark:  ['#00f5d4', '#38bdf8', '#a78bfa', '#f472b6', '#facc15', '#4ade80']
    },
    cyberpunk: {
      name: 'Cyberpunk Neural Deck',
      notes: '45° Chamfered Mecha HUD · Neon laser traces',
      stageColorsLight: ['#e11d48', '#0284c7', '#7c3aed', '#d97706', '#0d9488', '#be123c'],
      stageColorsDark:  ['#f43f5e', '#00f0ff', '#a855f7', '#facc15', '#2dd4bf', '#fb7185']
    },
    solarpunk: {
      name: 'Solarpunk Botanical',
      notes: 'Organic leaf capsules · Synaptic tendrils & contours',
      stageColorsLight: ['#15803d', '#0f766e', '#b45309', '#c2410c', '#4d7c0f', '#0369a1'],
      stageColorsDark:  ['#34d399', '#2dd4bf', '#fbbf24', '#fb923c', '#a3e635', '#38bdf8']
    }
  };

  const THEME_GLYPHS = {
    neo_brutalism: {
      prev: '◀', next: '▶', light: '■', dark: '□',
      node: '▣', tech: '◈', tourOn: '■', tourOff: '▶',
      export: '▣', close: '×', open: '↗', fs: '⛶', fsExit: '×'
    },
    modular_typo: {
      prev: '←', next: '→', light: '○', dark: '●',
      node: '▪', tech: '§', tourOn: '●', tourOff: '→',
      export: '↗', close: '×', open: '↗', fs: '⤢', fsExit: '⤡'
    },
    bauhaus: {
      prev: '◀', next: '▶', light: '●', dark: '▲',
      node: '■', tech: '▲', tourOn: '■', tourOff: '▶',
      export: '▲', close: '×', open: '↗', fs: '◧', fsExit: '×'
    },
    utilitarian: {
      prev: '<', next: '>', light: 'L', dark: 'D',
      node: 'BLK', tech: 'TEC', tourOn: 'ON', tourOff: '>>',
      export: 'IO', close: 'X', open: '↗', fs: 'FS', fsExit: 'X'
    },
    blueprint: {
      prev: '◁', next: '▷', light: '☼', dark: '☾',
      node: '⊞', tech: '⌖', tourOn: '⊞', tourOff: '▷',
      export: '⌖', close: '×', open: '↗', fs: '⌙', fsExit: '×'
    },
    braun_industrial: {
      prev: '◂', next: '▸', light: '○', dark: '●',
      node: '◎', tech: '◉', tourOn: '●', tourOff: '▸',
      export: '◎', close: '×', open: '↗', fs: '⤢', fsExit: '×'
    },
    memphis: {
      prev: '◀', next: '▶', light: '★', dark: '✦',
      node: '◆', tech: '▲', tourOn: '★', tourOff: '▶',
      export: '◆', close: '✕', open: '↗', fs: '⬡', fsExit: '✕'
    },
    pixel_art: {
      prev: '<', next: '>', light: '*', dark: '-',
      node: '#', tech: '?', tourOn: '*', tourOff: '>',
      export: '^', close: 'x', open: '↗', fs: '+', fsExit: 'x'
    },
    art_deco: {
      prev: '◂', next: '▸', light: '❖', dark: '◆',
      node: '❖', tech: '◈', tourOn: '❖', tourOff: '▸',
      export: '❖', close: '✕', open: '↗', fs: '⤢', fsExit: '✕'
    },
    aurora: {
      prev: '‹', next: '›', light: '✧', dark: '✦',
      node: '◈', tech: '✦', tourOn: '✦', tourOff: '▸',
      export: '◈', close: '✕', open: '↗', fs: '⤢', fsExit: '✕'
    },
    cyberpunk: {
      prev: '«', next: '»', light: '◈', dark: '◢',
      node: '◢', tech: '❖', tourOn: '◢', tourOff: '»',
      export: '◢', close: '×', open: '↗', fs: '⛶', fsExit: '×'
    },
    solarpunk: {
      prev: '‹', next: '›', light: '❀', dark: '✧',
      node: '❀', tech: '✦', tourOn: '❀', tourOff: '▸',
      export: '❀', close: '✕', open: '↗', fs: '⤢', fsExit: '✕'
    }
  };

  let activeTheme = 'neo_brutalism';
  let activePolarity = 'light'; // 'light' | 'dark'

  function getGlyph(key) {
    const g = THEME_GLYPHS[activeTheme] || THEME_GLYPHS.neo_brutalism;
    return g[key] || '';
  }

  function getActiveStageColors() {
    const meta = THEME_META[activeTheme] || THEME_META.neo_brutalism;
    return activePolarity === 'light' ? meta.stageColorsLight : meta.stageColorsDark;
  }

  // Gather external white papers for a subsystem block
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

  // Render external white paper cards inside 5. Papers tab (Zero Nested Scrollbar & Restrained Chrome)
  function renderLearnMoreCardsHtml(resList) {
    if (!resList || resList.length === 0) {
      return '<div class="text-xs text-secondary-ink">No external references indexed.</div>';
    }
    return (
      '<div class="flex flex-col gap-2">' +
      resList
        .map(
          (r) =>
            '<div class="surface-root border border-hairline rounded-lg p-2.5 flex flex-col justify-between gap-1.5">' +
            '<div class="flex flex-col gap-0.5">' +
            '<div class="flex flex-wrap items-center justify-between gap-1">' +
            '<span class="mono text-[9.5px] font-bold px-1.5 py-0.5 rounded surface-panel text-theme-accent border border-hairline">' +
            r.badge +
            '</span>' +
            (r.techShort
              ? '<span class="mono text-[9.5px] font-semibold text-muted-ink">' + r.techShort + '</span>'
              : '') +
            '</div>' +
            '<h4 class="text-xs font-bold text-primary-ink leading-snug mt-0.5">' +
            r.title +
            '</h4>' +
            '<div class="mono text-[10px] text-muted-ink">' +
            r.authors +
            '</div>' +
            '<p class="text-[11px] text-secondary-ink leading-relaxed mt-0.5">' +
            r.desc +
            '</p>' +
            '</div>' +
            '<div class="pt-1 border-t border-hairline flex items-center justify-between gap-2">' +
            '<span class="mono text-[9.5px] text-muted-ink truncate">' +
            r.url +
            '</span>' +
            '<a href="' +
            r.url +
            '" target="_blank" rel="noopener noreferrer" class="no-wrap-btn px-2 py-0.5 rounded text-[10.5px] font-bold surface-elevated text-primary-ink border border-subtle hover:text-theme-accent transition">' +
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

  // URL Hash Deep-Linking (#arch=gen3_perceiver&view=tech&tech=t3&tab=learn)
  function syncUrlHash() {
    const params = new URLSearchParams();
    params.set('arch', activeArchKey);
    params.set('view', activeRightView);
    if (activeRightView === 'tech') {
      params.set('tech', selectedTechId);
      params.set('tab', activeTTab);
    } else {
      params.set('node', selectedNodeId);
      params.set('tab', activeNTab);
    }
    if (activeScenarioKey !== 'none' && tourOverlayVisible) {
      params.set('scenario', activeScenarioKey);
    }
    const nextHash = '#' + params.toString();
    if (window.location.hash !== nextHash) {
      history.replaceState(null, '', nextHash);
    }
  }

  function restoreStateFromUrlHash(setArchCallback, setThemeCallback, setPolCallback) {
    if (!window.location.hash || window.location.hash.length <= 1) return false;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const themeParam = params.get('theme');
    const polParam = params.get('polarity') || params.get('mode');
    const scenParam = params.get('scenario');
    if (themeParam && THEME_META[themeParam] && setThemeCallback) {
      setThemeCallback(themeParam);
    }
    if ((polParam === 'light' || polParam === 'dark') && setPolCallback) {
      setPolCallback(polParam);
    }
    const archParam = params.get('arch');
    if (archParam && ARCH_REGISTRY[archParam] && setArchCallback) {
      setArchCallback(archParam, true);
    }
    if (scenParam) {
      if (scenParam === 'none') {
        activeScenarioKey = 'none';
        tourOverlayVisible = false;
      } else if (scenarios[scenParam]) {
        activeScenarioKey = scenParam;
        tourOverlayVisible = true;
      }
    }
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
    return Boolean((archParam && ARCH_REGISTRY[archParam]) || themeParam || polParam || scenParam);
  }

  function init() {
    const canvas = document.getElementById('mainGraphCanvas');
    const ctx = canvas.getContext('2d');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const canvasAspectBox = document.getElementById('canvasAspectBox');

    const selArchGen = document.getElementById('selArchGen');
    const selScenario = document.getElementById('selScenario');
    const btnToggleTour = document.getElementById('btnToggleTour');
    const selMode = document.getElementById('selMode');
    const selTheme = document.getElementById('selTheme');
    const btnPolarityLight = document.getElementById('btnPolarityLight');
    const btnPolarityDark = document.getElementById('btnPolarityDark');
    const btnToggleFullscreen = document.getElementById('btnToggleFullscreen');
    const btnExportMenuTrigger = document.getElementById('btnExportMenuTrigger');
    const exportPopoverMenu = document.getElementById('exportPopoverMenu');

    // Docked Walkthrough HUD Bar DOM
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
    const identityBadgeText = document.getElementById('identityBadgeText');
    const identityMainTitle = document.getElementById('identityMainTitle');
    const rightSidePanel = document.getElementById('rightSidePanel');
    const panelDismissBackdrop = document.getElementById('panelDismissBackdrop');
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    const btnViewNode = document.getElementById('btnViewNode');
    const btnViewTech = document.getElementById('btnViewTech');
    const nodeStickySubheader = document.getElementById('nodeStickySubheader');
    const techStickySubheader = document.getElementById('techStickySubheader');
    const inspectorNodeView = document.getElementById('inspectorNodeView');
    const inspectorTechView = document.getElementById('inspectorTechView');
    const selTechDropdown = document.getElementById('selTechDropdown');
    const btnPrevTech = document.getElementById('btnPrevTech');
    const btnNextTech = document.getElementById('btnNextTech');
    const selNodeJumper = document.getElementById('selNodeJumper');
    const btnPrevNode = document.getElementById('btnPrevNode');
    const btnNextNode = document.getElementById('btnNextNode');

    function populateTechDropdown() {
      selTechDropdown.innerHTML = '';
      techLib.forEach((t) => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.short;
        selTechDropdown.appendChild(opt);
      });
    }

    function populateNodeJumperDropdown() {
      if (!selNodeJumper) return;
      selNodeJumper.innerHTML = '';
      nodes.forEach((n) => {
        const opt = document.createElement('option');
        opt.value = n.id;
        opt.textContent = '#' + n.num + ' · ' + n.title;
        selNodeJumper.appendChild(opt);
      });
      selNodeJumper.value = selectedNodeId;
    }

    const CONCISE_SCENARIO_LABELS = {
      tour: 'Guided Tour: 66.7ms Cycle',
      bounce: 'Scenario 1: Corner Double-Tap',
      aerial: 'Scenario 2: Fast Aerial & Reset',
      fake: 'Scenario 3: Adapting to Fake',
      save: 'Scenario 4: Goal-Line Save'
    };

    function populateScenarioDropdown() {
      const prevVal = selScenario.value || activeScenarioKey || 'none';
      selScenario.innerHTML = '';
      const noneOpt = document.createElement('option');
      noneOpt.value = 'none';
      noneOpt.textContent = 'Free Exploration (Click Block)';
      selScenario.appendChild(noneOpt);

      Object.entries(scenarios).forEach(([key, sc]) => {
        const opt = document.createElement('option');
        opt.value = key;
        const shortName = CONCISE_SCENARIO_LABELS[key] || sc.label;
        opt.textContent = shortName + ' (' + sc.steps.length + ')';
        selScenario.appendChild(opt);
      });

      if (scenarios[prevVal] || prevVal === 'none') {
        selScenario.value = prevVal;
      } else {
        selScenario.value = 'none';
        activeScenarioKey = 'none';
      }
    }

    populateTechDropdown();
    populateNodeJumperDropdown();
    populateScenarioDropdown();

    function syncArchGenPills() {
      document.querySelectorAll('.arch-gen-pill').forEach((btn) => {
        const key = btn.getAttribute('data-arch-pill');
        const isAct = key === activeArchKey;
        btn.className = isAct
          ? 'arch-gen-pill no-wrap-btn px-2 py-0.5 rounded text-[11px] font-bold btn-theme-accent transition cursor-pointer'
          : 'arch-gen-pill no-wrap-btn px-2 py-0.5 rounded text-[11px] font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      });
      if (selArchGen && selArchGen.value !== activeArchKey) {
        selArchGen.value = activeArchKey;
      }
    }

    function syncModeFilterPills() {
      document.querySelectorAll('.mode-filter-pill').forEach((btn) => {
        const key = btn.getAttribute('data-mode-pill');
        const isAct = key === activeMode;
        btn.className = isAct
          ? 'mode-filter-pill no-wrap-btn px-2 py-0.5 rounded text-[11px] font-bold surface-elevated text-primary-ink border border-subtle transition cursor-pointer'
          : 'mode-filter-pill no-wrap-btn px-2 py-0.5 rounded text-[11px] font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      });
      document.querySelectorAll('.inline-mode-pill').forEach((btn) => {
        const key = btn.getAttribute('data-inline-mode');
        const isAct = key === activeMode;
        btn.className = isAct
          ? 'inline-mode-pill no-wrap-btn px-1.5 py-0.5 rounded text-[9.5px] font-bold btn-theme-accent transition cursor-pointer'
          : 'inline-mode-pill no-wrap-btn px-1.5 py-0.5 rounded text-[9.5px] font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      });
      if (selMode && selMode.value !== activeMode) {
        selMode.value = activeMode;
      }
    }

    function setActivePathwayMode(modeKey) {
      if (!['all', 'live', 'train', 'distill'].includes(modeKey)) return;
      activeMode = modeKey;
      syncModeFilterPills();
      renderNodeInspector();
      if (activeRightView === 'tech') renderTechDeepDive();
      syncUrlHash();
    }

    function syncThemeAlignedButtons() {
      const curNode = nodeMap[selectedNodeId] || nodes[0];
      const nodeSuffix = curNode ? ' (#' + curNode.num + ')' : '';
      btnPolarityLight.textContent = getGlyph('light') + ' Light';
      btnPolarityDark.textContent = getGlyph('dark') + ' Dark';
      document.getElementById('btnPrevTheme').textContent = getGlyph('prev');
      document.getElementById('btnNextTheme').textContent = getGlyph('next');
      btnViewNode.textContent =
        getGlyph('node') + ' Block Inspector' + (activeRightView === 'tech' ? nodeSuffix : '');
      btnViewTech.textContent = getGlyph('tech') + ' Deep Dive';
      btnToggleFullscreen.textContent =
        (isFullscreenMode ? getGlyph('fsExit') + ' Exit Full Screen' : getGlyph('fs') + ' Full Screen');
      btnTtPrev.textContent = getGlyph('prev') + ' Prev';
      btnTtNext.textContent = 'Next ' + getGlyph('next');
      btnTtDeepDive.textContent = getGlyph('tech') + ' Deep Dive';
      btnCloseTooltip.textContent = getGlyph('close') + ' Exit';
      btnCloseDrawer.textContent = getGlyph('close') + ' Close';
    }

    // Restrained polarity toggle (Uses elevated neutral surface instead of loud accent fill)
    function updatePolarityButtons() {
      if (activePolarity === 'light') {
        btnPolarityLight.className =
          'no-wrap-btn px-2 py-0.5 rounded text-[11px] font-bold surface-elevated text-primary-ink border border-subtle transition cursor-pointer';
        btnPolarityDark.className =
          'no-wrap-btn px-2 py-0.5 rounded text-[11px] font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      } else {
        btnPolarityDark.className =
          'no-wrap-btn px-2 py-0.5 rounded text-[11px] font-bold surface-elevated text-primary-ink border border-subtle transition cursor-pointer';
        btnPolarityLight.className =
          'no-wrap-btn px-2 py-0.5 rounded text-[11px] font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      }
    }

    // Full Screen Mode & Slide-In Side Panel Controller
    function syncFullscreenAndDrawer() {
      if (isFullscreenMode) {
        if (topIdentityBar) topIdentityBar.classList.add('hidden');
        if (btnCloseDrawer) btnCloseDrawer.classList.remove('hidden');

        rightSidePanel.classList.remove('w-full', 'lg:w-[500px]', 'xl:w-[540px]');
        rightSidePanel.classList.add(
          'absolute',
          'top-0',
          'right-0',
          'bottom-0',
          'w-[510px]',
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
          'w-[510px]',
          'max-w-[92vw]',
          'border-l',
          'border-subtle',
          'shadow-2xl'
        );
        rightSidePanel.classList.add('w-full', 'lg:w-[500px]', 'xl:w-[540px]');
        rightSidePanel.style.transform = '';
      }

      syncThemeAlignedButtons();
      requestAnimationFrame(() => {
        renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
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
        nodeStickySubheader.classList.remove('hidden');
        nodeStickySubheader.classList.add('flex');
        techStickySubheader.classList.add('hidden');
        techStickySubheader.classList.remove('flex');

        inspectorNodeView.classList.remove('hidden');
        inspectorNodeView.classList.add('flex');
        inspectorTechView.classList.add('hidden');
        inspectorTechView.classList.remove('flex');

        btnViewNode.className =
          'no-wrap-btn py-1 px-2 rounded text-xs font-bold surface-elevated text-primary-ink border border-subtle transition cursor-pointer';
        btnViewTech.className =
          'no-wrap-btn py-1 px-2 rounded text-xs font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
        renderNodeInspector();
      } else {
        if (tabOpt) activeTTab = tabOpt;
        nodeStickySubheader.classList.add('hidden');
        nodeStickySubheader.classList.remove('flex');
        techStickySubheader.classList.remove('hidden');
        techStickySubheader.classList.add('flex');

        inspectorNodeView.classList.add('hidden');
        inspectorNodeView.classList.remove('flex');
        inspectorTechView.classList.remove('hidden');
        inspectorTechView.classList.add('flex');

        btnViewTech.className =
          'no-wrap-btn py-1 px-2 rounded text-xs font-bold surface-elevated text-primary-ink border border-subtle transition cursor-pointer';
        btnViewNode.className =
          'no-wrap-btn py-1 px-2 rounded text-xs font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
        renderTechDeepDive();
      }
      syncThemeAlignedButtons();
      syncUrlHash();
    }

    // Render Clickable Upstream Inputs & Downstream Outputs (Full Untruncated Titles)
    function renderGraphNeighbors(node) {
      const container = document.getElementById('inspGraphNeighbors');
      if (!container) return;
      container.innerHTML = '';

      const incoming = edges.filter((e) => e.to === node.id && nodeMap[e.from]);
      const outgoing = edges.filter((e) => e.from === node.id && nodeMap[e.to]);

      const makeCol = (title, edgeList, isIncoming) => {
        const col = document.createElement('div');
        col.className = 'flex flex-col gap-1';
        const hdr = document.createElement('span');
        hdr.className = 'mono text-[9.5px] font-bold text-muted-ink uppercase';
        hdr.textContent = title;
        col.appendChild(hdr);

        if (edgeList.length === 0) {
          const empty = document.createElement('span');
          empty.className = 'mono text-[10px] text-muted-ink italic';
          empty.textContent = isIncoming ? 'Source Input Boundary' : 'Terminal Output Head';
          col.appendChild(empty);
          return col;
        }

        const wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-1';
        edgeList.forEach((e) => {
          const targetNode = nodeMap[isIncoming ? e.from : e.to];
          if (!targetNode) return;
          const edgeActive = activeMode === 'all' || (e.modes && e.modes.includes(activeMode));
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className =
            'no-wrap-btn px-1.5 py-0.5 rounded surface-root border border-hairline hover:border-subtle text-[10px] mono text-primary-ink transition cursor-pointer gap-1' +
            (edgeActive ? '' : ' opacity-55');
          btn.title =
            (isIncoming ? 'Upstream Input from #' : 'Downstream Output to #') +
            targetNode.num +
            ' ' +
            targetNode.title +
            (e.label ? ' (' + e.label + ')' : '') +
            (edgeActive ? '' : ' — Bypassed in ' + activeMode.toUpperCase());
          btn.innerHTML =
            '<span class="font-bold" style="color:' +
            targetNode.color +
            '">#' +
            targetNode.num +
            '</span><span>' +
            targetNode.title +
            '</span>' +
            (e.label
              ? '<span class="px-1 rounded surface-panel text-[9px] text-secondary-ink">' + e.label + '</span>'
              : '') +
            (!edgeActive
              ? '<span class="px-1 rounded text-[8.5px] font-bold" style="background:rgba(245,158,11,0.18);color:#d97706">BYPASSED</span>'
              : '');
          btn.addEventListener('click', () => {
            selectedNodeId = targetNode.id;
            renderNodeInspector();
            syncThemeAlignedButtons();
            syncUrlHash();
          });
          wrap.appendChild(btn);
        });
        col.appendChild(wrap);
        return col;
      };

      container.appendChild(makeCol('← Upstream Inputs (' + incoming.length + ')', incoming, true));
      container.appendChild(makeCol('Downstream Outputs (' + outgoing.length + ') →', outgoing, false));
    }

    // Resolve per-block Pathway Role & Bypass Explanation for (node, activeArchKey, mode)
    function getPathwayRoleSpec(node, archKey, mode) {
      const db = window.ARASHIKAGE_PATHWAY_ROLES || {};
      const archMap = db[archKey] || {};
      const hexMap = db.hex63 || {};
      if (archMap[node.id] && archMap[node.id][mode]) {
        return archMap[node.id][mode];
      }
      if (archKey === 'hex63' && hexMap[node.id] && hexMap[node.id][mode]) {
        return hexMap[node.id][mode];
      }
      // Generation-specific synthesis for active/bypassed legacy blocks not explicitly overridden
      const isAct = (node.modes || []).includes(mode);
      if (mode === 'live') {
        return isAct
          ? {
              regime: 'ACTIVE · Live 15Hz / 120Hz Forward Inference',
              text:
                'Executes inside the deployed real-time RLBot inference loop (' +
                node.tag +
                '). Processes ' +
                node.tensor +
                ' with frozen weights and deterministic / low-temperature action selection.'
            }
          : {
              regime: 'DISABLED IN LIVE (Training / Distillation Only)',
              text:
                'WHY DISABLED IN LIVE: ' +
                node.title +
                ' relies on simulator-only privileged state or training-time optimization and is omitted from the live tournament inference path.'
            };
      }
      if (mode === 'train') {
        return isAct
          ? {
              regime: 'ACTIVE · Parallel Batch Arena Rollout & PPO',
              text:
                'Executes across parallel RocketSim training arenas (' +
                node.tensor +
                '). Participates in batched forward rollouts and receives policy/value gradients during PPO epochs.'
            }
          : {
              regime: 'BYPASSED IN TRAIN (Used in Live / Distill)',
              text:
                'WHY BYPASSED IN TRAIN: ' +
                node.title +
                ' is a dedicated migration or test-time module and is bypassed during standard RL self-play rollouts.'
            };
      }
      return isAct
        ? {
            regime: 'ACTIVE · Teacher -> Student Warm-Start Distillation',
            text:
              'Active during supervised policy & value distillation (' +
              node.tensor +
              '), aligning student representations and action heads with the teacher checkpoint before RL fine-tuning.'
          }
        : {
            regime: 'BYPASSED IN DISTILL (Used in Online RL / Live)',
            text:
              'WHY BYPASSED IN DISTILL: ' +
              node.title +
              ' operates on online RL rollout rewards or live test-time search and is bypassed during supervised teacher cloning.'
          };
    }

    function updateInspectorModeStatusBadge(node) {
      const badge = document.getElementById('inspModeStatusBadge');
      if (!badge || !node) return;
      const isLight = activePolarity === 'light';
      const modes = node.modes || [];
      const activeList = ['live', 'train', 'distill'].filter((m) => modes.includes(m));

      if (activeMode === 'all') {
        if (activeList.length === 3) {
          badge.textContent = '● 3/3 PATHWAYS';
          badge.style.color = isLight ? '#15803d' : '#4ade80';
          badge.style.borderColor = isLight ? '#16a34a' : '#22c55e';
          badge.style.backgroundColor = isLight ? 'rgba(22,163,74,0.12)' : 'rgba(34,197,94,0.16)';
        } else {
          const names = activeList.map((m) => m.toUpperCase()).join('+');
          badge.textContent = '◐ ' + names + ' ONLY';
          badge.style.color = isLight ? '#b45309' : '#fbbf24';
          badge.style.borderColor = isLight ? '#d97706' : '#f59e0b';
          badge.style.backgroundColor = isLight ? 'rgba(217,119,6,0.14)' : 'rgba(245,158,11,0.18)';
        }
      } else {
        const isAct = modes.includes(activeMode);
        const mName = activeMode.toUpperCase();
        if (isAct) {
          badge.textContent = '● ' + mName + ': ACTIVE';
          badge.style.color = isLight ? '#15803d' : '#4ade80';
          badge.style.borderColor = isLight ? '#16a34a' : '#22c55e';
          badge.style.backgroundColor = isLight ? 'rgba(22,163,74,0.14)' : 'rgba(34,197,94,0.18)';
        } else {
          badge.textContent = '⊘ ' + mName + ': BYPASSED';
          badge.style.color = isLight ? '#b45309' : '#fbbf24';
          badge.style.borderColor = isLight ? '#d97706' : '#f59e0b';
          badge.style.backgroundColor = isLight ? 'rgba(217,119,6,0.18)' : 'rgba(245,158,11,0.22)';
        }
      }
    }

    function renderNodePathwayCallout(node, sigLabel, sigValue) {
      const ntabSubLabel = document.getElementById('ntabSubLabel');
      const ntabSubContent = document.getElementById('ntabSubContent');
      if (!ntabSubLabel || !ntabSubContent || !node) return;

      const isLight = activePolarity === 'light';
      const modes = node.modes || [];
      const modeNames = {
        live: 'Live 5.5ms',
        train: 'Train (4,096 Arenas)',
        distill: 'Distill (Warm-Start)'
      };

      if (activeMode === 'all') {
        const activeCount = ['live', 'train', 'distill'].filter((m) => modes.includes(m)).length;
        ntabSubLabel.textContent =
          'ROLE ACROSS PATHWAYS (' + activeCount + '/3 ACTIVE — CLICK ROW TO INSPECT)';

        const rowsHtml = ['live', 'train', 'distill']
          .map((m) => {
            const isAct = modes.includes(m);
            const spec = getPathwayRoleSpec(node, activeArchKey, m);
            const pillBg = isAct
              ? isLight ? 'rgba(22,163,74,0.14)' : 'rgba(34,197,94,0.18)'
              : isLight ? 'rgba(217,119,6,0.16)' : 'rgba(245,158,11,0.22)';
            const pillCol = isAct
              ? isLight ? '#15803d' : '#4ade80'
              : isLight ? '#b45309' : '#fbbf24';
            const pillBorder = isAct ? '#16a34a' : '#d97706';
            const statusText = isAct ? '● ACTIVE' : '⊘ BYPASSED';
            const shortMode = m === 'live' ? 'LIVE 5.5MS' : m === 'train' ? 'TRAIN (4K)' : 'DISTILL';

            return (
              '<div data-switch-mode="' +
              m +
              '" class="px-2 py-1 rounded surface-panel border border-hairline hover:border-subtle transition cursor-pointer flex items-center justify-between gap-2" title="' +
              spec.text.replace(/"/g, '&quot;') +
              ' (Click to filter to ' +
              modeNames[m] +
              ')">' +
              '<div class="flex items-center gap-1.5 shrink-0">' +
              '<span class="mono text-[9.5px] font-bold text-primary-ink w-[4.8rem]">' +
              shortMode +
              '</span>' +
              '<span class="mono text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0" style="background:' +
              pillBg +
              ';color:' +
              pillCol +
              ';border:1px solid ' +
              pillBorder +
              '">' +
              statusText +
              '</span>' +
              '</div>' +
              '<span class="mono text-[9.5px] text-secondary-ink truncate flex-1 text-right">' +
              spec.regime +
              '</span>' +
              '<span class="mono text-[9px] text-theme-accent font-bold shrink-0">↗</span>' +
              '</div>'
            );
          })
          .join('');

        ntabSubContent.innerHTML =
          '<div class="flex flex-col gap-1">' +
          rowsHtml +
          '<div class="pt-1 border-t border-hairline flex flex-wrap items-baseline justify-between gap-1 mono text-[10px]">' +
          '<span class="font-bold text-muted-ink uppercase">' +
          sigLabel +
          ':</span>' +
          '<span class="text-primary-ink">' +
          sigValue +
          '</span>' +
          '</div>' +
          '</div>';
      } else {
        const isAct = modes.includes(activeMode);
        const spec = getPathwayRoleSpec(node, activeArchKey, activeMode);
        const mLabel = modeNames[activeMode] || activeMode.toUpperCase();
        ntabSubLabel.textContent =
          'ROLE IN ' + mLabel.toUpperCase() + (isAct ? ' · ● ACTIVE' : ' · ⊘ BYPASSED ON DIAGRAM');

        const bannerBg = isAct
          ? isLight ? 'rgba(22,163,74,0.12)' : 'rgba(34,197,94,0.16)'
          : isLight ? 'rgba(217,119,6,0.15)' : 'rgba(245,158,11,0.20)';
        const bannerCol = isAct
          ? isLight ? '#15803d' : '#4ade80'
          : isLight ? '#b45309' : '#fbbf24';
        const bannerBorder = isAct ? '#16a34a' : '#d97706';

        const otherModesHtml = ['live', 'train', 'distill']
          .map((m) => {
            const mAct = modes.includes(m);
            const isCur = m === activeMode;
            return (
              '<button type="button" data-switch-mode="' +
              m +
              '" class="no-wrap-btn mono text-[9.5px] px-1.5 py-0.5 rounded border border-hairline ' +
              (isCur ? 'surface-elevated font-bold text-primary-ink' : 'surface-panel text-secondary-ink hover:text-primary-ink') +
              ' cursor-pointer gap-1">' +
              '<span style="color:' +
              (mAct ? (isLight ? '#15803d' : '#4ade80') : isLight ? '#b45309' : '#fbbf24') +
              '">' +
              (mAct ? '●' : '⊘') +
              '</span>' +
              '<span>' +
              (m === 'live' ? 'Live' : m === 'train' ? 'Train' : 'Distill') +
              ': ' +
              (mAct ? 'Active' : 'Bypassed') +
              '</span>' +
              '</button>'
            );
          })
          .join('');

        ntabSubContent.innerHTML =
          '<div class="flex flex-col gap-1.5">' +
          '<div class="p-2 rounded border flex flex-col gap-1" style="background:' +
          bannerBg +
          ';border-color:' +
          bannerBorder +
          '">' +
          '<div class="flex flex-wrap items-center justify-between gap-1">' +
          '<span class="mono text-[10px] font-bold" style="color:' +
          bannerCol +
          '">' +
          (isAct ? '● ACTIVE IN ' + mLabel.toUpperCase() : '⊘ DISABLED / BYPASSED IN ' + mLabel.toUpperCase()) +
          '</span>' +
          '<span class="mono text-[9.5px] font-semibold text-primary-ink">' +
          spec.regime +
          '</span>' +
          '</div>' +
          '<p class="text-[11px] text-primary-ink leading-snug">' +
          spec.text +
          '</p>' +
          '</div>' +
          '<div class="flex flex-wrap items-center justify-between gap-1 pt-0.5">' +
          '<span class="mono text-[9.5px] font-bold text-muted-ink uppercase">Block Status Across Tasks:</span>' +
          '<div class="flex flex-wrap items-center gap-1">' +
          otherModesHtml +
          '</div>' +
          '</div>' +
          '<div class="pt-1 border-t border-hairline flex flex-wrap items-baseline justify-between gap-1 mono text-[10px]">' +
          '<span class="font-bold text-muted-ink uppercase">' +
          sigLabel +
          ':</span>' +
          '<span class="text-primary-ink">' +
          sigValue +
          '</span>' +
          '</div>' +
          '</div>';
      }

      ntabSubContent.querySelectorAll('[data-switch-mode]').forEach((el) => {
        el.addEventListener('click', () => {
          const targetMode = el.getAttribute('data-switch-mode');
          if (targetMode) setActivePathwayMode(targetMode);
        });
      });
    }

    // Render Block Inspector View (5 Tabs: 1. How | 2. Why | 3. Impact | 4. Math | 5. Papers)
    function renderNodeInspector() {
      const n = nodeMap[selectedNodeId] || nodes[0];
      if (!n) return;

      if (selNodeJumper && selNodeJumper.value !== n.id) {
        selNodeJumper.value = n.id;
      }

      const inspBadge = document.getElementById('inspBadge');
      inspBadge.textContent = 'BLOCK ' + n.num + ' · ' + n.tag;
      inspBadge.style.color = n.color;
      inspBadge.style.borderColor = n.color;
      inspBadge.style.backgroundColor = n.color + '18';

      updateInspectorModeStatusBadge(n);

      document.getElementById('inspShapePill').textContent = n.sub;
      document.getElementById('inspTitle').textContent = n.title;

      // Render Upstream & Downstream Dataflow Neighbors
      renderGraphNeighbors(n);

      // Render Linked Technology Chips (Clean Single-Click Deep Dive Pills + Subtle Papers Link)
      const chipsContainer = document.getElementById('inspTechChips');
      chipsContainer.innerHTML = '';
      (n.techIds || []).forEach((tid) => {
        const t = techMap[tid];
        if (!t) return;
        const papers = TECH_EXTERNAL_RESOURCES[tid] || [];
        const group = document.createElement('div');
        group.className = 'inline-flex items-center rounded border border-hairline surface-panel overflow-hidden';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'no-wrap-btn px-2 py-0.5 text-[10.5px] font-semibold text-primary-ink hover:text-theme-accent transition cursor-pointer';
        btn.textContent = getGlyph('tech') + ' ' + t.short + ' ↗';
        btn.title = 'Inspect ' + t.short + ' in Deep Dive & highlight blocks on canvas';
        btn.addEventListener('click', () => {
          setRightView('tech', tid, 'how');
        });
        group.appendChild(btn);

        if (papers.length > 0) {
          const lmBtn = document.createElement('button');
          lmBtn.type = 'button';
          lmBtn.className = 'no-wrap-btn px-1.5 py-0.5 text-[9.5px] mono font-bold surface-root text-secondary-ink hover:text-primary-ink border-l border-hairline transition cursor-pointer';
          lmBtn.title = 'View ' + papers.length + ' foundational paper(s) for ' + t.short;
          lmBtn.textContent = 'Ref (' + papers.length + ')';
          lmBtn.addEventListener('click', () => {
            setRightView('tech', tid, 'learn');
          });
          group.appendChild(lmBtn);
        }

        chipsContainer.appendChild(group);
      });

      // Update 1-2-3-4-5 Tabs
      document.querySelectorAll('.ntab-btn').forEach((btn) => {
        const isAct = btn.getAttribute('data-ntab') === activeNTab;
        btn.className = isAct
          ? 'ntab-btn no-wrap-btn py-1 px-1 rounded text-[11px] font-semibold btn-theme-accent transition cursor-pointer'
          : 'ntab-btn no-wrap-btn py-1 px-1 rounded text-[11px] font-medium text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      });

      const ntabHeading = document.getElementById('ntabHeading');
      const ntabBody = document.getElementById('ntabBody');
      const ntabCalloutBox = document.getElementById('ntabCalloutBox');

      if (activeNTab === 'learn') {
        ntabHeading.textContent = '05 // PRIMARY LITERATURE & WHITE PAPERS';
        const papers = getExternalResourcesForNode(n);
        ntabBody.innerHTML = renderLearnMoreCardsHtml(papers);
        ntabCalloutBox.classList.add('hidden');
      } else {
        ntabCalloutBox.classList.remove('hidden');

        let sigLabel = 'DATAFLOW PLACEMENT & TENSOR';
        let sigValue = (n.role || '') + ' — ' + n.tensor;

        if (activeNTab === 'how') {
          ntabHeading.textContent = '01 // HOW IT WORKS (MECHANISM)';
          ntabBody.textContent = n.how;
          sigLabel = 'DATAFLOW PLACEMENT & TENSOR';
          sigValue = (n.role || '') + ' — ' + n.tensor;
        } else if (activeNTab === 'why') {
          ntabHeading.textContent = '02 // WHY IT IS USED (ENGINEERING RATIONALE)';
          ntabBody.textContent = n.why;
          sigLabel = 'MATHEMATICAL IDENTITY & INVARIANT';
          sigValue = n.formula;
        } else if (activeNTab === 'contrib') {
          ntabHeading.textContent = '03 // WHAT IT CONTRIBUTES TO SYSTEM GOAL';
          ntabBody.textContent = n.contrib;
          sigLabel = 'DATAFLOW PLACEMENT';
          sigValue = n.role || n.sub;
        } else {
          ntabHeading.textContent = '04 // MATHEMATICAL FORMULATION & TENSOR ABI';
          ntabBody.textContent = n.formula;
          sigLabel = 'IN / OUT TENSOR SIGNATURE';
          sigValue = n.tensor;
        }

        renderNodePathwayCallout(n, sigLabel, sigValue);
      }

      renderContextualWidget(n);
    }

    // Render Deep Dive View (5 Tabs: 1. How | 2. Why | 3. Impact | 4. Math | 5. Papers)
    function renderTechDeepDive() {
      const t = techMap[selectedTechId] || techLib[0];
      if (!t) return;
      selTechDropdown.value = t.id;
      document.getElementById('techTitle').textContent = t.title;

      // Update 1-2-3-4-5 Tabs in Deep Dive
      document.querySelectorAll('.ttab-btn').forEach((btn) => {
        const isAct = btn.getAttribute('data-ttab') === activeTTab;
        btn.className = isAct
          ? 'ttab-btn no-wrap-btn py-1 px-1 rounded text-[11px] font-semibold btn-theme-accent transition cursor-pointer'
          : 'ttab-btn no-wrap-btn py-1 px-1 rounded text-[11px] font-medium text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      });

      const ttabHeading = document.getElementById('ttabHeading');
      const ttabBody = document.getElementById('ttabBody');
      const ttabCalloutBox = document.getElementById('ttabCalloutBox');
      const ttabSubLabel = document.getElementById('ttabSubLabel');
      const ttabSubContent = document.getElementById('ttabSubContent');

      if (activeTTab === 'learn') {
        ttabHeading.textContent = '05 // FOUNDATIONAL WHITE PAPERS & SOURCES';
        const resList = TECH_EXTERNAL_RESOURCES[t.id] || [];
        ttabBody.innerHTML = renderLearnMoreCardsHtml(resList);
        ttabCalloutBox.classList.add('hidden');
      } else {
        ttabCalloutBox.classList.remove('hidden');

        let sigLabel = 'WHY IT SITS HERE IN THE DATAFLOW';
        let sigValue = t.placement;

        if (activeTTab === 'how') {
          ttabHeading.textContent = '01 // HOW IT WORKS (MECHANISM)';
          ttabBody.textContent = t.how;
          sigLabel = 'WHY IT SITS HERE IN THE DATAFLOW';
          sigValue = t.placement;
        } else if (activeTTab === 'why') {
          ttabHeading.textContent = '02 // WHY IT IS USED (PROBLEM SOLVED)';
          ttabBody.textContent = t.why;
          sigLabel = 'RESEARCH ORIGINS & EVOLUTION';
          sigValue = t.origins;
        } else if (activeTTab === 'contrib') {
          ttabHeading.textContent = '03 // WHAT IT CONTRIBUTES TO SYSTEM GOAL';
          ttabBody.textContent = t.contrib;
          sigLabel = 'WHY IT SITS HERE IN THE DATAFLOW';
          sigValue = t.placement;
        } else {
          ttabHeading.textContent = '04 // UNDERLYING SCIENCE & MATHEMATICAL MECHANISM';
          ttabBody.textContent = t.science;
          sigLabel = 'RESEARCH ORIGINS & EVOLUTION';
          sigValue = t.origins;
        }

        const usedNodes = (t.usedIn || []).map((nid) => nodeMap[nid]).filter(Boolean);
        if (activeMode === 'all' || usedNodes.length === 0) {
          ttabSubLabel.textContent = sigLabel;
          ttabSubContent.textContent = sigValue;
        } else {
          const mLabel = MODE_LABELS[activeMode] || activeMode.toUpperCase();
          ttabSubLabel.textContent = 'PATHWAY ROLE (' + mLabel.toUpperCase() + ') & ' + sigLabel;
          const rowsHtml = usedNodes
            .map((un) => {
              const isAct = isNodeActiveInMode(un, activeMode);
              const spec = getPathwayRoleSpec(un, activeArchKey, activeMode);
              const badgeCol = isAct ? '#10b981' : '#f59e0b';
              return (
                '<div class="p-1.5 rounded border surface-root flex flex-col gap-0.5" style="border-color:' +
                (isAct ? 'rgba(16,185,129,0.32)' : 'rgba(245,158,11,0.40)') +
                '">' +
                '<div class="flex flex-wrap items-center justify-between gap-1">' +
                '<span class="mono text-[10px] font-bold" style="color:' +
                badgeCol +
                '">' +
                (isAct ? '● #' + un.num + ' ' + un.title + ' (ACTIVE)' : '⊘ #' + un.num + ' ' + un.title + ' (BYPASSED)') +
                '</span>' +
                '<span class="mono text-[9.5px] font-semibold text-primary-ink">' +
                spec.regime +
                '</span>' +
                '</div>' +
                '<p class="text-[10.5px] text-secondary-ink leading-snug">' +
                spec.text +
                '</p>' +
                '</div>'
              );
            })
            .join('');
          ttabSubContent.innerHTML =
            '<div class="flex flex-col gap-1.5">' +
            rowsHtml +
            '<div class="pt-1 border-t border-hairline mono text-[10px] text-secondary-ink">' +
            '<span class="font-bold text-muted-ink">' +
            sigLabel +
            ': </span>' +
            sigValue +
            '</div>' +
            '</div>';
        }
      }

      const usedContainer = document.getElementById('techUsedInNodes');
      usedContainer.innerHTML = '';
      (t.usedIn || []).forEach((nid) => {
        const n = nodeMap[nid];
        if (!n) return;
        const isAct = isNodeActiveInMode(n, activeMode);
        const b = document.createElement('button');
        b.type = 'button';
        b.className =
          'no-wrap-btn mono text-[10.5px] px-2 py-0.5 rounded surface-panel text-primary-ink border border-hairline hover:border-subtle transition cursor-pointer gap-1' +
          (!isAct ? ' opacity-70' : '');
        b.innerHTML =
          '<span class="font-bold" style="color:' +
          n.color +
          '">#' +
          n.num +
          '</span><span>' +
          n.title +
          '</span>' +
          (!isAct && activeMode !== 'all'
            ? '<span class="text-[9px] font-bold text-amber-500">[BYP]</span>'
            : '');
        b.addEventListener('click', () => {
          selectedNodeId = n.id;
          setRightView('node');
        });
        usedContainer.appendChild(b);
      });
    }

    // 6-Stage Evolution Matrix across all 4 Platform Generations (2x2 Untruncated Grid)
    const STAGE_EVOLUTION_BY_COL = [
      {
        title: 'STAGE 1 EVOLUTION // OBSERVATION MANIFOLD',
        hex63: '5,376B Layout A (84×64B CL, 64 Entities, 8 BallRingBuffer480, C2v)',
        gen3_perceiver: '700D (684D + 16D 4-Frame Wheel History) + 752D Critic',
        gen2_factorized: '171D×4 Egocentric R_car^T Stack (684D) + 68D Critic Tail',
        gen1_ret40: '41×25 EntityTokenPOD (4,100B) + 1,536B SoA (World Z-Up)'
      },
      {
        title: 'STAGE 2 EVOLUTION // RELATIONAL & TEMPORAL ENCODING',
        hex63: 'On-Chip GPU 16×64×72D Pairwise Kernel + 2L Bipartite DiffAttn',
        gen3_perceiver: 'Zero-Copy 144D Core Unpacker + Shared 34×7D BoostPad PointNet',
        gen2_factorized: 'K=4 Sliding Window (267ms) + 0..2 Tick Latency Randomizer',
        gen1_ret40: 'CPU AVX2 41×41×8 r_ij (53.7KB) + Trunk-Hoisted mlp_rel'
      },
      {
        title: 'STAGE 3 EVOLUTION // TEMPORAL MEMORY & SEQUENCE TRUNK',
        hex63: '2×4×32×32 FP32 Titans Fast Weights (Log-Cosh Surprise, ||W||_F<=4)',
        gen3_perceiver: '2L ST-Perceiver Cross-Attn (M=4×N=37 Latents, QK-RMSNorm)',
        gen2_factorized: '3-Block Residual MLP Trunk (684->512->512->256, SiLU)',
        gen1_ret40: '4-Layer Relational Entity Transformer RET-40 (d=128, H=4)'
      },
      {
        title: 'STAGE 4 EVOLUTION // LATENT REASONING & SKILL ROUTING',
        hex63: 'Coconut K=4..6 Loop + Static 8×2 Soft-MoE + 8×125=1,000 FSQ',
        gen3_perceiver: '912D->256D SwiGLU Fusion + Aux Skill Head Z_t (8×32)',
        gen2_factorized: 'PSM-DCP Replay SeqScout Miner + Aux Skill Z_t (8×32)',
        gen1_ret40: 'Quaternion Target q*∈S^3 + ω* + 4 Exploiter Archetype Heads'
      },
      {
        title: 'STAGE 5 EVOLUTION // MOTOR DECODER & ACTUATION LOOP',
        hex63: 'Stage-1 16-Way Binary + Stage-2 60Hz Flow-GRPO SDE (K_sub=4)',
        gen3_perceiver: '2-Stage Autoregressive Cond-31 (Jump/Boost -> 5 Axes @ 15Hz)',
        gen2_factorized: 'Fused 31-Logit [B,7,7] Categorical + C++ 8-Subtick Flip FSM',
        gen1_ret40: '120Hz Geodesic SLERP Attitude PD + Schmitt Deadband'
      },
      {
        title: 'STAGE 6 EVOLUTION // CRITIC, WORLD MODEL & RL LEARNER',
        hex63: 'Dual 4×51 Symlog HL-Gauss + JEPA Best-of-16 + G=8 Cloned GRPO',
        gen3_perceiver: '752D Asymmetric Perceiver Critic + 3-Horizon PopArt + KL Distill',
        gen2_factorized: '752D Privileged Critic + 5-Bounce Ballistics + Zero-Sum PBRS',
        gen1_ret40: '3-Horizon PopArt + 32-Quantile CVaR_β Risk-Averse PPO'
      }
    ];

    function appendEvolutionComparisonStrip(wBody, colIdx) {
      const evo = STAGE_EVOLUTION_BY_COL[colIdx] || STAGE_EVOLUTION_BY_COL[0];
      const box = document.createElement('div');
      box.className = 'mt-1 pt-1.5 border-t border-hairline flex flex-col gap-1';

      const hdr = document.createElement('div');
      hdr.className = 'flex items-center justify-between gap-1';
      hdr.innerHTML =
        '<span class="kicker text-muted-ink">' +
        evo.title +
        '</span><span class="mono text-[9px] text-theme-accent font-bold">CLICK TO COMPARE GEN</span>';
      box.appendChild(hdr);

      const gens = [
        { key: 'hex63', short: 'Hex63 · Current' },
        { key: 'gen3_perceiver', short: 'Gen 3 · Perceiver' },
        { key: 'gen2_factorized', short: 'Gen 2 · MLP-684' },
        { key: 'gen1_ret40', short: 'Gen 1 · RET-40' }
      ];

      const matrixGrid = document.createElement('div');
      matrixGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-1';
      gens.forEach((g) => {
        const isCurr = g.key === activeArchKey;
        const cardBtn = document.createElement('button');
        cardBtn.type = 'button';
        cardBtn.className =
          'w-full text-left p-1.5 rounded border transition cursor-pointer flex flex-col gap-0.5 ' +
          (isCurr
            ? 'surface-elevated border-subtle'
            : 'surface-root border-hairline opacity-85 hover:opacity-100');
        cardBtn.innerHTML =
          '<div class="flex items-center justify-between gap-1">' +
          '<span class="mono text-[9.5px] font-bold ' +
          (isCurr ? 'text-theme-accent' : 'text-primary-ink') +
          '">' +
          (isCurr ? '▸ ' : '') +
          g.short +
          '</span>' +
          (isCurr ? '<span class="mono text-[8.5px] px-1 rounded surface-panel text-secondary-ink">ACTIVE</span>' : '') +
          '</div>' +
          '<div class="mono text-[9.5px] text-secondary-ink leading-tight">' +
          evo[g.key] +
          '</div>';
        cardBtn.addEventListener('click', () => {
          setArchitecture(g.key);
        });
        matrixGrid.appendChild(cardBtn);
      });
      box.appendChild(matrixGrid);
      wBody.appendChild(box);
    }

    // Render 6 Distinct Stage-Specific Interactive Micro-Simulators (Stages 1..6)
    function renderContextualWidget(node) {
      const wTitle = document.getElementById('ctxWidgetTitle');
      const wTag = document.getElementById('ctxWidgetTag');
      const wBody = document.getElementById('ctxWidgetBody');
      wBody.innerHTML = '';

      const stageCols = getActiveStageColors();
      const colIdx = typeof node.col === 'number' ? node.col : 0;

      if (colIdx === 0) {
        // STAGE 1: OBSERVATION MEMORY / CACHE-LINE INSPECTOR
        if (activeArchKey === 'hex63') {
          wTitle.textContent = 'STAGE 1 // 5,376B CACHE-LINE INSPECTOR';
          wTag.textContent = '84 × 64B CL';
          const segments = [
            { name: 'Cars [0..5]', bytes: '0..1535', cl: '24 CL', color: stageCols[0], desc: '6 Cars × 64 floats (256B each): Pos, Vel, Rot6D, Local Vel, Dodge/Flip Timers, 4-Wheel Shocks' },
            { name: 'Ball [6]', bytes: '1536..1663', cl: '2 CL', color: stageCols[1], desc: '1 Ball × 32 floats (128B): Position, Linear/Angular Velocity, Last Hit Car, Magnus Force' },
            { name: 'Traj [7..14]', bytes: '1664..2687', cl: '16 CL', color: stageCols[2], desc: '8 BallRingBuffer480 Samples × 32 floats (1,024B): 4.0s Future Bounce & Spin Curve' },
            { name: 'Match [15]', bytes: '2688..2751', cl: '1 CL', color: stageCols[3], desc: '1 Match Node × 16 floats (64B): κ_Δt Action Duration, Score Diff, Clock, Gravity' },
            { name: 'Pads [16..49]', bytes: '2752..3839', cl: '17 CL', color: stageCols[4], desc: '34 Boost Pads × 8 floats (1,088B): Canonical X/Y/Z, IsBigPad, Active Flag, Respawn Timer' },
            { name: 'Goals/Wheels', bytes: '3840..4735', cl: '14 CL', color: stageCols[5], desc: '6 Goals + 4 Zero-Lag Ego Wheel Raycasts + 4 Nearest Wall Surface OBBs (896B)' },
            { name: 'PrivCtx [128]', bytes: '4864..5375', cl: '8 CL', color: stageCols[0], desc: '128 Privileged Floats (512B): Exact Opponent Boost/Flip Secrets (Training Critic Only)' }
          ];
          const barRow = document.createElement('div');
          barRow.className = 'grid grid-cols-7 gap-1';
          segments.forEach((seg, idx) => {
            const isSel = selectedMemSliceIdx === idx;
            const b = document.createElement('button');
            b.type = 'button';
            b.className =
              'py-1 px-1 rounded text-[9.5px] mono font-bold truncate border transition cursor-pointer ' +
              (isSel ? 'border-subtle ring-1 ring-current' : 'border-hairline opacity-80 hover:opacity-100');
            b.style.backgroundColor = seg.color;
            b.style.color = renderer.getContrastInk(seg.color, '#111111', '#ffffff');
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
          info.className = 'p-1.5 rounded surface-root border border-hairline mono text-[10.5px] flex flex-col gap-0.5';
          info.innerHTML =
            '<div class="flex justify-between"><span class="font-bold text-primary-ink">' +
            activeSeg.name +
            '</span><span class="text-theme-accent font-bold">Bytes ' +
            activeSeg.bytes +
            ' (' +
            activeSeg.cl +
            ')</span></div>' +
            '<div class="text-secondary-ink font-sans text-[11px] leading-snug">' +
            activeSeg.desc +
            '</div>';
          wBody.appendChild(info);
        } else {
          wTitle.textContent =
            activeArchKey === 'gen1_ret40'
              ? 'STAGE 1 // 41×25 ENTITY POD & SOA INSPECTOR'
              : activeArchKey === 'gen2_factorized'
              ? 'STAGE 1 // 684D EGOCENTRIC + 68D CRITIC INSPECTOR'
              : 'STAGE 1 // 700D CANONICAL + 752D CRITIC INSPECTOR';
          wTag.textContent = activeArchKey === 'gen1_ret40' ? '41 TOKENS + 53.7KB' : 'K=4 STACK · R_car^T';
          const legacySegs =
            activeArchKey === 'gen1_ret40'
              ? [
                  { name: 'Ego+Mates [0..2]', cl: '3×100B', color: stageCols[0], bytes: 'Slots 0..2', desc: '1 Ego + 2 Teammates (25 floats each): World Pos, Vel, Fwd/Up, AngVel, Boost, Type One-Hot, t_go' },
                  { name: 'Opponents [3..5]', cl: '3×100B', color: stageCols[1], bytes: 'Slots 3..5', desc: '3 Opponents (25 floats each): Masked with -10^9 in 1v1/2v2; zero 1D positional encoding' },
                  { name: 'Ball Token [6]', cl: '1×100B', color: stageCols[2], bytes: 'Slot 6', desc: '1 Ball Token: World Pos/Vel, Magnus Spin ω_ball, and normalized intercept horizon' },
                  { name: 'Pads [7..40]', cl: '34×100B', color: stageCols[3], bytes: 'Slots 7..40', desc: '34 Boost Pads: World XYZ, Active Flag, Cooldown Timer, and Channel-24 norm_time_to_go' },
                  { name: 'AVX2 r_ij', cl: '53.7KB', color: stageCols[4], bytes: '41×41×8', desc: 'RelationalTensorBlockPOD: 1,681 pairs × 8 floats computed on CPU via 8-wide AVX2 rsqrt_ps' }
                ]
              : [
                  { name: 'Self+Goals [16D]', cl: '4×16D', color: stageCols[0], bytes: '64 Floats', desc: 'K=4 × (10D Self body vel/ang_vel/local gravity/boost + 6D Opp/Own Goal unit vectors)' },
                  { name: 'Ball Stack [9D]', cl: '4×9D', color: stageCols[1], bytes: '36 Floats', desc: 'K=4 × 9D Ball relative position, linear velocity, and angular velocity in R_car^T frame' },
                  { name: 'Opp Stack [10D]', cl: '4×10D', color: stageCols[2], bytes: '40 Floats', desc: 'K=4 × 10D Opponent relative pos, vel, forward heading, and boost fraction' },
                  { name: '34 Pads [136D]', cl: '4×136D', color: stageCols[3], bytes: '544 Floats', desc: 'K=4 × 34 Pads × 4D (body-frame XYZ + availability τ_j) with ORANGE_PAD_PERMUTATION' },
                  { name: activeArchKey === 'gen3_perceiver' ? 'Wheels+Omni' : '68D Critic Tail', cl: activeArchKey === 'gen3_perceiver' ? '16D+68D' : '68D Priv', color: stageCols[5], bytes: activeArchKey === 'gen3_perceiver' ? 'Floats 684..752' : 'Critic 684..752', desc: (activeArchKey === 'gen3_perceiver' ? '16D 4-Frame Actor Wheel History + ' : '') + '68D Critic Tail: 20D Wheel Slip, 18D World Vel, 30D 5-Bounce Ballistics' }
                ];
          const barRow = document.createElement('div');
          barRow.className = 'grid grid-cols-5 gap-1';
          const idx = selectedMemSliceIdx % legacySegs.length;
          legacySegs.forEach((seg, i) => {
            const isSel = idx === i;
            const b = document.createElement('button');
            b.type = 'button';
            b.className =
              'py-1 px-1 rounded text-[9.5px] mono font-bold truncate border transition cursor-pointer ' +
              (isSel ? 'border-subtle ring-1 ring-current' : 'border-hairline opacity-80 hover:opacity-100');
            b.style.backgroundColor = seg.color;
            b.style.color = renderer.getContrastInk(seg.color, '#111111', '#ffffff');
            b.textContent = seg.cl;
            b.addEventListener('click', () => {
              selectedMemSliceIdx = i;
              renderContextualWidget(node);
            });
            barRow.appendChild(b);
          });
          wBody.appendChild(barRow);
          const activeSeg = legacySegs[idx];
          const info = document.createElement('div');
          info.className = 'p-1.5 rounded surface-root border border-hairline mono text-[10.5px] flex flex-col gap-0.5';
          info.innerHTML =
            '<div class="flex justify-between"><span class="font-bold text-primary-ink">' +
            activeSeg.name +
            '</span><span class="text-theme-accent font-bold">' +
            activeSeg.bytes +
            ' (' +
            activeSeg.cl +
            ')</span></div><div class="text-secondary-ink font-sans text-[11px] leading-snug">' +
            activeSeg.desc +
            '</div>';
          wBody.appendChild(info);
        }
      } else if (colIdx === 1) {
        // STAGE 2: PAIRWISE RELATIONAL / TEMPORAL ENCODING SIMULATOR
        wTitle.textContent =
          activeArchKey === 'hex63'
            ? 'STAGE 2 // 16×64 PAIRWISE INTERCEPT SIMULATOR'
            : activeArchKey === 'gen3_perceiver'
            ? 'STAGE 2 // 144D CORE & 34×7D POINTNET SIMULATOR'
            : activeArchKey === 'gen2_factorized'
            ? 'STAGE 2 // K=4 FINITE-DIFFERENCE & JITTER SIMULATOR'
            : 'STAGE 2 // AVX2 41×41×8 PAIRWISE r_ij SIMULATOR';
        wTag.textContent =
          activeArchKey === 'hex63'
            ? '1,024 PAIRS · 72D'
            : activeArchKey === 'gen3_perceiver'
            ? '34 PADS · 64D MAX'
            : activeArchKey === 'gen2_factorized'
            ? '267ms WINDOW'
            : '1,681 PAIRS · AVX2';

        const queries = [
          { label: 'Q0: Ego Car (Blue #0)', v: 1850, pos: [-420, -1200, 17] },
          { label: 'Q1: Teammate / Tactical Query', v: 1410, pos: [1100, -2400, 17] },
          { label: 'Q2: Opponent #1 (Challenger)', v: 2150, pos: [-180, 640, 190] },
          { label: 'Q3: Live Ball Entity', v: 2400, pos: [0, 120, 420] }
        ];
        const keys = [
          { label: 'K0: Current Ball', pos: [0, 120, 420] },
          { label: 'K1: Wall Bounce (+1.0s)', pos: [-1650, 3100, 680] },
          { label: 'K2: Mid-Left 100% Boost Pad', pos: [-3072, 0, 73] },
          { label: 'K3: Back-Right Corner 100% Pad', pos: [3072, -4096, 73] }
        ];

        const selRow = document.createElement('div');
        selRow.className = 'grid grid-cols-2 gap-1.5';
        const sQ = document.createElement('select');
        sQ.className = 'surface-root text-primary-ink border border-hairline rounded px-2 py-0.5 text-[10.5px] mono';
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
        sK.className = 'surface-root text-primary-ink border border-hairline rounded px-2 py-0.5 text-[10.5px] mono';
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
        const attnScore = Math.max(0.08, Math.min(0.94, 1.35 - Number(tReach) * 0.45)).toFixed(2);

        const metrics = document.createElement('div');
        metrics.className = 'grid grid-cols-3 gap-1.5 mono text-[10.5px]';
        metrics.innerHTML =
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9px]">3D DIST</div><div class="text-primary-ink font-bold">' +
          dist +
          ' uu</div></div>' +
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9px]">T_INTERCEPT</div><div class="text-theme-accent font-bold">' +
          tReach +
          ' s</div></div>' +
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9px]">' +
          (activeArchKey === 'hex63' ? 'DIFF-ATTN' : 'BIAS WEIGHT') +
          '</div><div class="text-primary-ink font-bold">' +
          attnScore +
          '</div></div>';
        wBody.appendChild(metrics);
      } else if (colIdx === 2) {
        // STAGE 3: TEMPORAL MEMORY / TRUNK SIMULATOR (Distinct from Stage 4!)
        wTitle.textContent =
          activeArchKey === 'hex63'
            ? 'STAGE 3 // FP32 TITANS FAST-WEIGHT MEMORY GATE'
            : activeArchKey === 'gen3_perceiver'
            ? 'STAGE 3 // 2L ST-PERCEIVER LATENT BOTTLENECK'
            : activeArchKey === 'gen2_factorized'
            ? 'STAGE 3 // 3-BLOCK RESIDUAL MLP TRUNK (SiLU)'
            : 'STAGE 3 // 4-LAYER RET-40 RELATIONAL TRUNK';
        wTag.textContent =
          activeArchKey === 'hex63'
            ? '2×4×32×32 · ||W||_F<=4'
            : activeArchKey === 'gen3_perceiver'
            ? 'M=4 × N=37 · QK-NORM'
            : activeArchKey === 'gen2_factorized'
            ? '684->512->256'
            : '4L × H=4 · d=128';

        const sliderRow = document.createElement('div');
        sliderRow.className = 'flex items-center justify-between gap-2 text-[11px]';
        sliderRow.innerHTML =
          '<span class="text-secondary-ink">' +
          (activeArchKey === 'hex63'
            ? 'Opponent Surprise Residual ||W_prev^T k - v_t||:'
            : 'Input Kinematic Perturbation Magnitude:') +
          '</span><span class="mono font-bold text-theme-accent">' +
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

        const frobNorm = Math.min(4.0, 1.45 + surpriseIntensity * 1.85).toFixed(2);
        const gateVal = Math.tanh(surpriseIntensity * 0.92).toFixed(2);
        const momDecay = (0.90 - Math.min(0.25, surpriseIntensity * 0.14)).toFixed(2);

        const readoutGrid = document.createElement('div');
        readoutGrid.className = 'grid grid-cols-3 gap-1.5 mono text-[10.5px]';
        if (activeArchKey === 'hex63') {
          readoutGrid.innerHTML =
            '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9px]">LOG-COSH GATE</div><div class="text-primary-ink font-bold">g_t = ' +
            gateVal +
            '</div></div>' +
            '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9px]">FROBENIUS NORM</div><div class="text-theme-accent font-bold">' +
            frobNorm +
            ' / 4.00</div></div>' +
            '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9px]">MOMENTUM β_t</div><div class="text-primary-ink font-bold">' +
            momDecay +
            ' (FP32)</div></div>';
        } else {
          readoutGrid.innerHTML =
            '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9px]">ATTN ENTROPY</div><div class="text-primary-ink font-bold">' +
            (1.85 - surpriseIntensity * 0.45).toFixed(2) +
            ' nats</div></div>' +
            '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9px]">TRUNK NORM</div><div class="text-theme-accent font-bold">' +
            frobNorm +
            ' RMS</div></div>' +
            '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9px]">LATENCY</div><div class="text-primary-ink font-bold">' +
            (activeArchKey === 'gen2_factorized' ? '0.18 ms' : '0.42 ms') +
            '</div></div>';
        }
        wBody.appendChild(readoutGrid);
      } else if (colIdx === 3) {
        // STAGE 4: COCONUT RECURRENCE, 8x2 SOFT-MOE & 1,000 FSQ ROUTER (Distinct from Stage 3!)
        wTitle.textContent =
          activeArchKey === 'hex63'
            ? 'STAGE 4 // COCONUT LOOP, 8×2 SOFT-MOE & FSQ'
            : activeArchKey === 'gen1_ret40'
            ? 'STAGE 4 // QUATERNION S^3 & 4 EXPLOITER HEADS'
            : 'STAGE 4 // SKILL TAXONOMY Z_t (8 × 32) & FUSION';
        wTag.textContent =
          activeArchKey === 'hex63'
            ? 'K=4..6 · 1,000 FSQ'
            : activeArchKey === 'gen1_ret40'
            ? 'q*∈S^3 · 4 HEADS'
            : '8 FAMILIES · 32 SUB';

        const phases = [
          { label: 'Kickoff Speedflip', kPass: 4, fsq: '#142 [-2,0,+1]', exp: ['E1 Ground: 38%', 'E2 Aerial: 44%', 'E6 Demo: 18%'] },
          { label: 'Wall Double-Tap', kPass: 6, fsq: '#618 [+2,+1,-1]', exp: ['E3 Wall/Dbl: 52%', 'E2 Aerial: 31%', 'E4 Reset: 17%'] },
          { label: 'Flip-Reset Stall', kPass: 6, fsq: '#884 [+2,+2,0]', exp: ['E4 FlipReset: 61%', 'E2 Aerial: 27%', 'E3 Wall: 12%'] },
          { label: 'Goal-Line Shadow', kPass: 6, fsq: '#309 [-1,-2,+2]', exp: ['E5 ShadowDef: 58%', 'E1 Ground: 26%', 'E6 Evade: 16%'] }
        ];
        const pRow = document.createElement('div');
        pRow.className = 'grid grid-cols-4 gap-1';
        phases.forEach((ph, idx) => {
          const isSel = selectedLatentPhaseIdx === idx;
          const b = document.createElement('button');
          b.type = 'button';
          b.className =
            'py-1 px-1 rounded text-[9.5px] mono font-bold truncate border transition cursor-pointer ' +
            (isSel ? 'surface-elevated border-subtle text-theme-accent' : 'surface-root border-hairline text-secondary-ink hover:text-primary-ink');
          b.textContent = ph.label.split(' ')[1] || ph.label;
          b.title = ph.label;
          b.addEventListener('click', () => {
            selectedLatentPhaseIdx = idx;
            renderContextualWidget(node);
          });
          pRow.appendChild(b);
        });
        wBody.appendChild(pRow);

        const curP = phases[selectedLatentPhaseIdx] || phases[0];
        const info = document.createElement('div');
        info.className = 'p-1.5 rounded surface-root border border-hairline mono text-[10px] flex flex-col gap-1';
        info.innerHTML =
          '<div class="flex items-center justify-between"><span class="font-bold text-primary-ink">' +
          curP.label +
          '</span><span class="text-theme-accent font-bold">' +
          (activeArchKey === 'hex63' ? 'Coconut K=' + curP.kPass + ' · FSQ ' + curP.fsq : 'Skill Family Z_t Active') +
          '</span></div>' +
          '<div class="grid grid-cols-3 gap-1">' +
          curP.exp
            .map(
              (eStr) =>
                '<div class="px-1.5 py-0.5 rounded surface-panel border border-hairline text-[9.5px] text-secondary-ink truncate">' +
                eStr +
                '</div>'
            )
            .join('') +
          '</div>';
        wBody.appendChild(info);
      } else if (colIdx === 4) {
        // STAGE 5: 60HZ SUBTICK ACTION CHUNK & MOTOR DECODER (Distinct from Stage 6!)
        wTitle.textContent =
          activeArchKey === 'hex63'
            ? 'STAGE 5 // 60HZ SUBTICK ACTION CHUNK (K_sub=4)'
            : activeArchKey === 'gen1_ret40'
            ? 'STAGE 5 // 120HZ GEODESIC SLERP ATTITUDE PD'
            : 'STAGE 5 // 15HZ CATEGORICAL HEADS & FLIP FSM';
        wTag.textContent =
          activeArchKey === 'hex63'
            ? '4 × 16.7ms (60Hz)'
            : activeArchKey === 'gen1_ret40'
            ? '120Hz PD TORQUE'
            : '8 TICKS (66.7ms)';

        const subticks =
          activeArchKey === 'hex63'
            ? [
                { lbl: 'Sub 1 (0–17ms)', bin: 'J=0 · m_dj=0 · B=1', cont: 'Pitch -0.85 · Yaw +0.18 · Roll -0.92 (Pre-Flip Align)' },
                { lbl: 'Sub 2 (17–33ms)', bin: 'J=1 · m_dj=1 · B=1', cont: 'Pitch +0.02 · Yaw -0.04 · Roll +0.08 (0.12·tanh Stall Clamp)' },
                { lbl: 'Sub 3 (33–50ms)', bin: 'J=0 · m_dj=0 · B=1', cont: 'Pitch -0.98 · Yaw 0.00 · Roll +0.95 (60Hz Speedflip Cancel)' },
                { lbl: 'Sub 4 (50–67ms)', bin: 'J=0 · m_dj=0 · B=1', cont: 'Pitch -0.94 · Yaw +0.05 · Roll +0.40 (Recovery Follow-Through)' }
              ]
            : activeArchKey === 'gen1_ret40'
            ? [
                { lbl: 'Ticks 1..2 (τ=.25)', bin: 'SLERP q̃*(0.25)', cont: 'e_rot = 0.31 rad -> Kp=(5,5,1.8) Torque Full' },
                { lbl: 'Ticks 3..4 (τ=.50)', bin: 'SLERP q̃*(0.50)', cont: 'e_rot = 0.18 rad -> Kd=(0.65,0.65,0.22) Damping' },
                { lbl: 'Ticks 5..6 (τ=.75)', bin: 'SLERP q̃*(0.75)', cont: 'e_rot = 0.08 rad -> Kff·ω* Feedforward Active' },
                { lbl: 'Ticks 7..8 (τ=1.0)', bin: 'SLERP q̃*(1.00)', cont: '|e_rot| = 0.03 < 0.04 rad -> Schmitt Deadband 0' }
              ]
            : [
                { lbl: 'Tick 1 (8.3ms)', bin: 'FlipState: Release', cont: 'C++ Override forces jump=0 for 1 tick before dodge' },
                { lbl: 'Ticks 2..4 (25ms)', bin: 'FlipState: Dodge', cont: 'C++ Override forces jump=1 + locks pitch/yaw/roll' },
                { lbl: 'Ticks 5..6 (17ms)', bin: 'FlipState: Hold', cont: '5-bin categorical axis (-1, -0.5, 0, +0.5, +1) held' },
                { lbl: 'Ticks 7..8 (17ms)', bin: 'FlipState: Done', cont: 'Macro step completes at 66.7ms boundary' }
              ];

        const stRow = document.createElement('div');
        stRow.className = 'grid grid-cols-4 gap-1';
        subticks.forEach((st, idx) => {
          const isSel = selectedSubtickIdx === idx;
          const b = document.createElement('button');
          b.type = 'button';
          b.className =
            'py-1 px-1 rounded text-[9.5px] mono font-bold truncate border transition cursor-pointer ' +
            (isSel ? 'surface-elevated border-subtle text-theme-accent' : 'surface-root border-hairline text-secondary-ink hover:text-primary-ink');
          b.textContent = st.lbl.split(' ')[0] + ' ' + (st.lbl.split(' ')[1] || '');
          b.title = st.lbl;
          b.addEventListener('click', () => {
            selectedSubtickIdx = idx;
            renderContextualWidget(node);
          });
          stRow.appendChild(b);
        });
        wBody.appendChild(stRow);

        const curSt = subticks[selectedSubtickIdx] || subticks[0];
        const stInfo = document.createElement('div');
        stInfo.className = 'p-1.5 rounded surface-root border border-hairline mono text-[10px] flex flex-col gap-0.5';
        stInfo.innerHTML =
          '<div class="flex justify-between"><span class="font-bold text-primary-ink">' +
          curSt.lbl +
          '</span><span class="text-theme-accent font-bold">' +
          curSt.bin +
          '</span></div>' +
          '<div class="text-secondary-ink text-[10.5px]">' +
          curSt.cont +
          '</div>';
        wBody.appendChild(stInfo);
      } else {
        // STAGE 6: 4-HORIZON SYMLOG HL-GAUSS CRITIC, JEPA SEARCH & G=8 GRPO (Distinct from Stage 5!)
        wTitle.textContent =
          activeArchKey === 'hex63'
            ? 'STAGE 6 // 4-HORIZON SYMLOG CRITIC & JEPA SEARCH'
            : activeArchKey === 'gen1_ret40'
            ? 'STAGE 6 // 3-POPART & 32-QUANTILE CVaR CRITIC'
            : 'STAGE 6 // 752D ASYMMETRIC CRITIC & 3-POPART';
        wTag.textContent =
          activeArchKey === 'hex63'
            ? '4×51 BINS · M=16 CVaR'
            : activeArchKey === 'gen1_ret40'
            ? '32 QUANTILES · τ_q'
            : '752D PRIV · POPART';

        const horizons = [
          { lbl: 'γ₁=0.95 (1.3s)', role: 'Micro Touch & Challenge Horizon', priv: '+1.84 symlog', evalVal: '+1.72 symlog · CVaR₀.₂₅ = +1.15' },
          { lbl: 'γ₂=0.98 (3.3s)', role: 'Tactical Outplay & Boost Horizon', priv: '+2.45 symlog', evalVal: '+2.31 symlog · Best-of-16 #04' },
          { lbl: 'γ₃=0.995 (13s)', role: 'Possession & Rotation Horizon', priv: '+3.12 symlog', evalVal: '+2.98 symlog · σ_HL = 0.30' },
          { lbl: 'γ_sp=0.9995', role: 'Sparse Goal & Match Win Probability', priv: 'P(Goal) = +0.64', evalVal: 'G=8 GRPO Advantage A_i = +1.42σ' }
        ];

        const hRow = document.createElement('div');
        hRow.className = 'grid grid-cols-4 gap-1';
        horizons.forEach((hz, idx) => {
          const isSel = selectedCriticHorizonIdx === idx;
          const b = document.createElement('button');
          b.type = 'button';
          b.className =
            'py-1 px-1 rounded text-[9.5px] mono font-bold truncate border transition cursor-pointer ' +
            (isSel ? 'surface-elevated border-subtle text-theme-accent' : 'surface-root border-hairline text-secondary-ink hover:text-primary-ink');
          b.textContent = hz.lbl.split(' ')[0];
          b.title = hz.lbl;
          b.addEventListener('click', () => {
            selectedCriticHorizonIdx = idx;
            renderContextualWidget(node);
          });
          hRow.appendChild(b);
        });
        wBody.appendChild(hRow);

        const curHz = horizons[selectedCriticHorizonIdx] || horizons[0];
        const hzInfo = document.createElement('div');
        hzInfo.className = 'p-1.5 rounded surface-root border border-hairline mono text-[10px] flex flex-col gap-0.5';
        hzInfo.innerHTML =
          '<div class="flex justify-between"><span class="font-bold text-primary-ink">' +
          curHz.lbl +
          ' — ' +
          curHz.role +
          '</span><span class="text-theme-accent font-bold">p_priv: ' +
          curHz.priv +
          '</span></div>' +
          '<div class="text-secondary-ink text-[10.5px]">p_eval / Search: ' +
          curHz.evalVal +
          '</div>';
        wBody.appendChild(hzInfo);
      }

      appendEvolutionComparisonStrip(wBody, colIdx);
    }

    // Switch Active Platform Generation (Hex63 vs Gen 3 vs Gen 2 vs Gen 1)
    function setArchitecture(archKey, skipHashSync) {
      const archDef = ARCH_REGISTRY[archKey];
      if (!archDef) return;
      activeArchKey = archKey;
      nodes = archDef.nodes || [];
      edges = archDef.edges || [];
      scenarios = archDef.scenarios || {};
      techLib = archDef.techLibrary || [];
      TECH_EXTERNAL_RESOURCES = archDef.externalResources || {};
      activeColHeaders = archDef.colHeaders || [];
      activeMermaidDiagram = archDef.mermaidDiagram || '';

      rebuildLookupMaps();
      syncArchGenPills();

      if (identityBadgeText) {
        identityBadgeText.textContent = archDef.shortBadge;
      }
      if (identityMainTitle) {
        identityMainTitle.textContent = archDef.identityTitle;
      }

      populateTechDropdown();
      populateNodeJumperDropdown();
      populateScenarioDropdown();

      if (!nodeMap[selectedNodeId] && nodes[0]) {
        selectedNodeId = nodes[0].id;
      }
      if (!techMap[selectedTechId] && techLib[0]) {
        selectedTechId = techLib[0].id;
      }
      activeStepIdx = 0;

      renderer.applyStagePaletteToNodes(nodes, getActiveStageColors(), activeColHeaders);

      updateTourTooltip();
      renderNodeInspector();
      if (activeRightView === 'tech') renderTechDeepDive();
      syncThemeAlignedButtons();
      if (!skipHashSync) syncUrlHash();
    }

    let lastTtLeft = -9999;
    let lastTtTop = -9999;
    let lastTtArrowPos = -9999;
    let lastTtSide = '';

    function rectOverlapArea(aL, aT, aR, aB, bL, bT, bR, bB) {
      const ox = Math.max(0, Math.min(aR, bR) - Math.max(aL, bL));
      const oy = Math.max(0, Math.min(aB, bB) - Math.max(aT, bT));
      return ox * oy;
    }

    // Position the Floating Walkthrough Tooltip beside/below/above focusNode with Highlight-Aware Collision Avoidance
    function positionAnchoredTourTooltip(forceUpdate) {
      if (
        !tourTooltip ||
        tourTooltip.classList.contains('hidden') ||
        activeScenarioKey === 'none' ||
        !tourOverlayVisible ||
        !scenarios[activeScenarioKey]
      ) {
        return;
      }

      const scen = scenarios[activeScenarioKey];
      const steps = scen.steps || [];
      const step = steps[activeStepIdx] || steps[0];
      if (!step) return;

      const focusNode = (step.focusNode && nodeMap[step.focusNode]) ? nodeMap[step.focusNode] : nodes[0];
      if (!focusNode) return;

      const stageContainer = document.getElementById('canvasStageContainer') || tourTooltip.offsetParent || canvasWrapper;
      const stageRect = stageContainer.getBoundingClientRect();
      const cRect = canvas.getBoundingClientRect();
      if (cRect.width < 40 || stageRect.width < 40) return;

      const scaleX = cRect.width / 1120;
      const scaleY = cRect.height / 680;
      const offsetX = cRect.left - stageRect.left;
      const offsetY = cRect.top - stageRect.top;

      const nodeLeft = offsetX + (focusNode.x - focusNode.w * 0.5) * scaleX;
      const nodeRight = offsetX + (focusNode.x + focusNode.w * 0.5) * scaleX;
      const nodeTop = offsetY + (focusNode.y - focusNode.h * 0.5) * scaleY;
      const nodeBottom = offsetY + (focusNode.y + focusNode.h * 0.5) * scaleY;
      const nodeCenterX = (nodeLeft + nodeRight) * 0.5;
      const nodeCenterY = (nodeTop + nodeBottom) * 0.5;

      const ttRect = tourTooltip.getBoundingClientRect();
      const ttW = ttRect.width || 352;
      const ttH = ttRect.height || 180;
      const gap = 14;
      const pad = 10;

      // Build bounding rects for highlighted neighbor nodes in step.highlight (excluding focusNode)
      const highlightNeighborRects = [];
      (step.highlight || []).forEach((hid) => {
        if (hid === focusNode.id) return;
        const hn = nodeMap[hid];
        if (!hn) return;
        highlightNeighborRects.push({
          l: offsetX + (hn.x - hn.w * 0.5) * scaleX,
          r: offsetX + (hn.x + hn.w * 0.5) * scaleX,
          t: offsetY + (hn.y - hn.h * 0.5) * scaleY,
          b: offsetY + (hn.y + hn.h * 0.5) * scaleY
        });
      });

      const preferRight = focusNode.col <= 2;
      const rawCandidates = [
        {
          left: nodeRight + gap,
          top: nodeCenterY - ttH * 0.5,
          arrowSide: 'left',
          bonus: preferRight ? -150 : 0
        },
        {
          left: nodeLeft - gap - ttW,
          top: nodeCenterY - ttH * 0.5,
          arrowSide: 'right',
          bonus: !preferRight ? -150 : 0
        },
        {
          left: nodeCenterX - ttW * 0.5,
          top: nodeBottom + gap,
          arrowSide: 'top',
          bonus: -40
        },
        {
          left: nodeCenterX - ttW * 0.5,
          top: nodeTop - gap - ttH,
          arrowSide: 'bottom',
          bonus: -30
        },
        {
          left: nodeRight + gap,
          top: nodeBottom - ttH * 0.25,
          arrowSide: 'left',
          bonus: preferRight ? -60 : 0
        },
        {
          left: nodeLeft - gap - ttW,
          top: nodeBottom - ttH * 0.25,
          arrowSide: 'right',
          bonus: !preferRight ? -60 : 0
        }
      ];

      let bestCand = null;
      let bestScore = Infinity;

      rawCandidates.forEach((rc) => {
        const cL = Math.max(pad, Math.min(stageRect.width - ttW - pad, rc.left));
        const cT = Math.max(pad, Math.min(stageRect.height - ttH - pad, rc.top));
        const cR = cL + ttW;
        const cB = cT + ttH;

        const focusOvl = rectOverlapArea(cL - 4, cT - 4, cR + 4, cB + 4, nodeLeft, nodeTop, nodeRight, nodeBottom);
        let neighborOvl = 0;
        for (let i = 0; i < highlightNeighborRects.length; i++) {
          const hr = highlightNeighborRects[i];
          neighborOvl += rectOverlapArea(cL, cT, cR, cB, hr.l, hr.t, hr.r, hr.b);
        }

        const clampShift = Math.hypot(cL - rc.left, cT - rc.top);
        const score = focusOvl * 10000 + neighborOvl * 120 + clampShift * 4 + rc.bonus;

        if (score < bestScore) {
          bestScore = score;
          bestCand = { left: cL, top: cT, arrowSide: rc.arrowSide };
        }
      });

      const targetLeft = bestCand.left;
      const targetTop = bestCand.top;
      const arrowSide = bestCand.arrowSide;
      const arrowPos =
        arrowSide === 'left' || arrowSide === 'right'
          ? Math.max(16, Math.min(ttH - 22, nodeCenterY - targetTop - 6))
          : Math.max(18, Math.min(ttW - 24, nodeCenterX - targetLeft - 6));

      if (
        forceUpdate ||
        Math.abs(targetLeft - lastTtLeft) > 0.5 ||
        Math.abs(targetTop - lastTtTop) > 0.5 ||
        Math.abs(arrowPos - lastTtArrowPos) > 0.5 ||
        arrowSide !== lastTtSide
      ) {
        lastTtLeft = targetLeft;
        lastTtTop = targetTop;
        lastTtArrowPos = arrowPos;
        lastTtSide = arrowSide;

        tourTooltip.style.left = Math.round(targetLeft) + 'px';
        tourTooltip.style.top = Math.round(targetTop) + 'px';

        const arrowEl = document.getElementById('tourTooltipArrow');
        if (arrowEl) {
          arrowEl.setAttribute('data-side', arrowSide);
          if (arrowSide === 'left' || arrowSide === 'right') {
            arrowEl.style.top = Math.round(arrowPos) + 'px';
            arrowEl.style.bottom = 'auto';
            arrowEl.style.left = arrowSide === 'left' ? '-7px' : 'auto';
            arrowEl.style.right = arrowSide === 'right' ? '-7px' : 'auto';
          } else {
            arrowEl.style.left = Math.round(arrowPos) + 'px';
            arrowEl.style.right = 'auto';
            arrowEl.style.top = arrowSide === 'top' ? '-7px' : 'auto';
            arrowEl.style.bottom = arrowSide === 'bottom' ? '-7px' : 'auto';
          }
        }

        const anchorBadge = document.getElementById('ttAnchorBadge');
        if (anchorBadge) {
          const dirPrefix = arrowSide === 'left' ? '◀ ' : arrowSide === 'top' ? '▲ ' : '';
          const dirSuffix = arrowSide === 'right' ? ' ▶' : arrowSide === 'bottom' ? ' ▼' : '';
          anchorBadge.textContent = dirPrefix + '#' + focusNode.num + ' ' + focusNode.title + dirSuffix;
          anchorBadge.style.color = focusNode.color;
          anchorBadge.style.borderColor = focusNode.color;
          anchorBadge.style.backgroundColor = focusNode.color + '18';
        }
      }
    }

    // Update Node-Anchored Floating Walkthrough Tooltip & Step Progress Dots
    function updateTourTooltip() {
      if (activeScenarioKey === 'none' || !tourOverlayVisible || !scenarios[activeScenarioKey]) {
        tourTooltip.classList.add('hidden');
        btnToggleTour.textContent = getGlyph('tourOff') + ' Start Tour';
        btnToggleTour.className =
          'no-wrap-btn px-2.5 py-1 rounded-lg text-[11px] font-bold btn-theme-accent border transition cursor-pointer';
        requestAnimationFrame(() => {
          renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
        });
        return;
      }

      tourTooltip.classList.remove('hidden');
      btnToggleTour.textContent = getGlyph('tourOn') + ' Exit Tour';
      btnToggleTour.className =
        'no-wrap-btn px-2.5 py-1 rounded-lg text-[11px] font-semibold surface-panel text-primary-ink border border-subtle transition cursor-pointer';

      const scen = scenarios[activeScenarioKey];
      const steps = scen.steps;
      if (activeStepIdx >= steps.length) activeStepIdx = 0;
      if (activeStepIdx < 0) activeStepIdx = steps.length - 1;

      const step = steps[activeStepIdx];
      ttStepBadge.textContent = 'STEP ' + (activeStepIdx + 1) + ' OF ' + steps.length;
      ttScenarioLabel.textContent = scen.label;
      ttTitle.textContent = step.title;
      ttDesc.textContent = step.desc;

      // Render interactive 1-click Step Progress Jumper Dots
      const dotsEl = document.getElementById('ttStepDots');
      if (dotsEl) {
        dotsEl.innerHTML = steps
          .map((st, sIdx) => {
            const isAct = sIdx === activeStepIdx;
            const fn = st.focusNode && nodeMap[st.focusNode] ? nodeMap[st.focusNode] : null;
            return (
              '<button type="button" data-tour-step="' +
              sIdx +
              '" title="Step ' +
              (sIdx + 1) +
              ': ' +
              (fn ? '#' + fn.num + ' ' + fn.title : st.title) +
              '" class="mono text-[9.5px] font-bold w-4 h-4 rounded flex items-center justify-center border transition cursor-pointer ' +
              (isAct
                ? 'btn-theme-accent'
                : 'surface-panel text-secondary-ink border-hairline hover:text-primary-ink') +
              '">' +
              (sIdx + 1) +
              '</button>'
            );
          })
          .join('');
        dotsEl.querySelectorAll('[data-tour-step]').forEach((b) => {
          b.addEventListener('click', () => {
            activeStepIdx = parseInt(b.getAttribute('data-tour-step'), 10) || 0;
            updateTourTooltip();
            syncUrlHash();
          });
        });
      }

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

      requestAnimationFrame(() => {
        renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
        positionAnchoredTourTooltip(true);
      });
    }

    function setPolarity(mode) {
      activePolarity = mode === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-mode', activePolarity);
      document.body.setAttribute('data-mode', activePolarity);
      try {
        localStorage.setItem('arashikage_arch_polarity', activePolarity);
      } catch (_) {}
      setTheme(activeTheme);
    }

    function setTheme(themeKey) {
      if (!THEME_META[themeKey]) return;
      activeTheme = themeKey;
      document.documentElement.setAttribute('data-mode', activePolarity);
      document.body.setAttribute('data-theme', themeKey);
      document.body.setAttribute('data-mode', activePolarity);

      try {
        localStorage.setItem('arashikage_arch_theme', activeTheme);
      } catch (_) {}

      if (selTheme && selTheme.value !== activeTheme) {
        selTheme.value = activeTheme;
      }

      const meta = THEME_META[themeKey];
      const stageCols = getActiveStageColors();
      const notesText = meta.name.toUpperCase() + ' (' + activePolarity.toUpperCase() + ') — ' + meta.notes;
      const notesEl = document.getElementById('themeStyleNotes');
      if (notesEl) {
        notesEl.textContent = meta.notes;
        notesEl.title = notesText;
      }
      if (selTheme) {
        selTheme.title = notesText;
      }
      const brandDot = document.getElementById('brandDot');
      if (brandDot) {
        brandDot.style.backgroundColor = stageCols[0];
      }

      renderer.applyStagePaletteToNodes(nodes, stageCols, activeColHeaders);

      syncThemeAlignedButtons();
      updatePolarityButtons();
      updateTourTooltip();
      renderNodeInspector();
      if (activeRightView === 'tech') renderTechDeepDive();
    }

    // Event Listeners: Segmented 4-Generation Pill Bar & Select
    document.querySelectorAll('.arch-gen-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-arch-pill');
        if (key) setArchitecture(key);
      });
    });
    if (selArchGen) {
      selArchGen.addEventListener('change', (e) => {
        setArchitecture(e.target.value);
      });
    }

    // Event Listeners: 1-Click Pathway Filter Pills, Inline Callout Switcher & Select
    document.querySelectorAll('.mode-filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = btn.getAttribute('data-mode-pill');
        if (m) setActivePathwayMode(m);
      });
    });
    document.querySelectorAll('.inline-mode-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = btn.getAttribute('data-inline-mode');
        if (m) setActivePathwayMode(m);
      });
    });
    if (selMode) {
      selMode.addEventListener('change', (e) => {
        setActivePathwayMode(e.target.value);
      });
    }

    // Event Listeners: Sequential Block Navigation in Block Inspector
    if (selNodeJumper) {
      selNodeJumper.addEventListener('change', (e) => {
        if (nodeMap[e.target.value]) {
          selectedNodeId = e.target.value;
          renderNodeInspector();
          syncThemeAlignedButtons();
          syncUrlHash();
        }
      });
    }
    if (btnPrevNode) {
      btnPrevNode.addEventListener('click', () => {
        const curIdx = nodes.findIndex((n) => n.id === selectedNodeId);
        const nextIdx = (curIdx - 1 + nodes.length) % nodes.length;
        selectedNodeId = nodes[nextIdx].id;
        renderNodeInspector();
        syncThemeAlignedButtons();
        syncUrlHash();
      });
    }
    if (btnNextNode) {
      btnNextNode.addEventListener('click', () => {
        const curIdx = nodes.findIndex((n) => n.id === selectedNodeId);
        const nextIdx = (curIdx + 1) % nodes.length;
        selectedNodeId = nodes[nextIdx].id;
        renderNodeInspector();
        syncThemeAlignedButtons();
        syncUrlHash();
      });
    }

    // Event Listeners: Sequential Technology Navigation in Deep Dive
    if (btnPrevTech) {
      btnPrevTech.addEventListener('click', () => {
        const curIdx = techLib.findIndex((t) => t.id === selectedTechId);
        const nextIdx = (curIdx - 1 + techLib.length) % techLib.length;
        selectedTechId = techLib[nextIdx].id;
        renderTechDeepDive();
        syncUrlHash();
      });
    }
    if (btnNextTech) {
      btnNextTech.addEventListener('click', () => {
        const curIdx = techLib.findIndex((t) => t.id === selectedTechId);
        const nextIdx = (curIdx + 1) % techLib.length;
        selectedTechId = techLib[nextIdx].id;
        renderTechDeepDive();
        syncUrlHash();
      });
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

    // Event Listeners: Scenario & 2-Row Docked Walkthrough HUD Bar
    selScenario.addEventListener('change', (e) => {
      activeScenarioKey = e.target.value;
      activeStepIdx = 0;
      tourOverlayVisible = activeScenarioKey !== 'none';
      updateTourTooltip();
      syncUrlHash();
    });

    btnToggleTour.addEventListener('click', () => {
      if (activeScenarioKey === 'none' || !tourOverlayVisible) {
        activeScenarioKey = activeScenarioKey === 'none' ? 'tour' : activeScenarioKey;
        selScenario.value = activeScenarioKey;
        activeStepIdx = 0;
        tourOverlayVisible = true;
      } else {
        activeScenarioKey = 'none';
        selScenario.value = 'none';
        tourOverlayVisible = false;
      }
      updateTourTooltip();
      syncUrlHash();
    });

    btnCloseTooltip.addEventListener('click', () => {
      activeScenarioKey = 'none';
      selScenario.value = 'none';
      tourOverlayVisible = false;
      updateTourTooltip();
      syncUrlHash();
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

    // Event Listeners: Right Panel Mode & Tabs
    btnViewNode.addEventListener('click', () => {
      setRightView('node');
      openSlideInDrawer();
    });
    btnViewTech.addEventListener('click', () => {
      setRightView('tech', selectedTechId);
      openSlideInDrawer();
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

    // Tether Export Popover Menu below trigger button (+ fallback for browsers without HTMLElement.prototype.popover)
    function positionExportPopover() {
      if (!btnExportMenuTrigger || !exportPopoverMenu) return;
      const r = btnExportMenuTrigger.getBoundingClientRect();
      exportPopoverMenu.style.position = 'fixed';
      exportPopoverMenu.style.top = Math.round(r.bottom + 6) + 'px';
      exportPopoverMenu.style.left = Math.max(8, Math.round(r.right - 180)) + 'px';
    }
    if (exportPopoverMenu) {
      exportPopoverMenu.addEventListener('beforetoggle', positionExportPopover);
    }
    if (btnExportMenuTrigger && exportPopoverMenu && !('popover' in HTMLElement.prototype)) {
      btnExportMenuTrigger.addEventListener('click', () => {
        positionExportPopover();
        exportPopoverMenu.classList.toggle(':popover-open');
      });
    }

    // Canvas Hit-Testing & Click
    canvas.addEventListener('mousemove', (e) => {
      const hit = renderer.getNodeAtCanvasCoords(canvas, e.clientX, e.clientY, nodes);
      hoveredNodeId = hit ? hit.id : null;
      canvas.style.cursor = hit ? 'pointer' : 'default';
    });

    canvas.addEventListener('mouseleave', () => {
      hoveredNodeId = null;
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
      }).observe(canvasWrapper);
    }
    window.addEventListener('resize', () => {
      renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
    });

    // Standalone Single-File HTML Export, PNG Export & Mermaid Copy
    document.getElementById('btnExportHtml').addEventListener('click', async () => {
      if (exportPopoverMenu && typeof exportPopoverMenu.hidePopover === 'function') {
        try { exportPopoverMenu.hidePopover(); } catch (_) {}
      }
      try {
        const [cssText, nodesJs, scenariosJs, gen3Js, gen2Js, gen1Js, rendererJs, appJs] = await Promise.all([
          fetch('./styles/themes.css').then((r) => r.text()),
          fetch('./js/nodes_and_edges.js').then((r) => r.text()),
          fetch('./js/scenarios_and_tech.js').then((r) => r.text()),
          fetch('./js/gen3_perceiver.js').then((r) => r.text()),
          fetch('./js/gen2_factorized.js').then((r) => r.text()),
          fetch('./js/gen1_ret40.js').then((r) => r.text()),
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
          'gen3_perceiver.js': gen3Js,
          'gen2_factorized.js': gen2Js,
          'gen1_ret40.js': gen1Js,
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
        a.download = 'arashikage_' + activeArchKey + '_architecture_explorer.html';
        a.click();
        URL.revokeObjectURL(url);
      } catch (_) {
        const htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'arashikage_' + activeArchKey + '_architecture_explorer.html';
        a.click();
        URL.revokeObjectURL(url);
      }
    });

    document.getElementById('btnExportPng').addEventListener('click', () => {
      if (exportPopoverMenu && typeof exportPopoverMenu.hidePopover === 'function') {
        try { exportPopoverMenu.hidePopover(); } catch (_) {}
      }
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arashikage_' + activeArchKey + '_dataflow.png';
      a.click();
    });

    document.getElementById('btnCopyMermaid').addEventListener('click', () => {
      const mmd = activeMermaidDiagram || '';
      navigator.clipboard.writeText(mmd).then(() => {
        const btn = document.getElementById('btnCopyMermaid');
        btn.textContent = 'Copied Mermaid!';
        setTimeout(() => {
          btn.textContent = 'Copy Mermaid Spec';
        }, 1600);
      });
    });

    // Keyboard shortcuts: 1..9,0,-,= for 12 themes, [/] to cycle theme, L/D for Light/Dark, ArrowLeft/Right/Escape for Tour & Fullscreen
    const THEME_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (isFullscreenMode) {
          if (isDrawerOpen) {
            closeSlideInDrawer();
          } else {
            toggleFullscreenMode(false);
          }
          return;
        }
        if (tourOverlayVisible && activeScenarioKey !== 'none') {
          tourOverlayVisible = false;
          activeScenarioKey = 'none';
          if (selScenario) selScenario.value = 'none';
          updateTourTooltip();
          syncUrlHash();
          return;
        }
      }
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;

      if (tourOverlayVisible && activeScenarioKey !== 'none' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        activeStepIdx += e.key === 'ArrowRight' ? 1 : -1;
        updateTourTooltip();
        syncUrlHash();
        return;
      }

      const keyIdx = THEME_KEYS.indexOf(e.key);
      if (keyIdx >= 0 && keyIdx < THEME_ORDER.length) {
        setTheme(THEME_ORDER[keyIdx]);
      } else if (e.key === '[') {
        const cur = THEME_ORDER.indexOf(activeTheme);
        setTheme(THEME_ORDER[(cur - 1 + THEME_ORDER.length) % THEME_ORDER.length]);
      } else if (e.key === ']') {
        const cur = THEME_ORDER.indexOf(activeTheme);
        setTheme(THEME_ORDER[(cur + 1) % THEME_ORDER.length]);
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
    syncModeFilterPills();
    const restoredFromHash = restoreStateFromUrlHash(setArchitecture, setTheme, setPolarity);
    if (restoredFromHash) {
      if (selScenario) selScenario.value = activeScenarioKey;
      updateTourTooltip();
      setRightView(activeRightView);
    } else {
      setArchitecture('hex63', true);
      selScenario.value = 'none';
      activeScenarioKey = 'none';
      tourOverlayVisible = false;
      updateTourTooltip();
      setRightView('node');
      renderTechDeepDive();
      syncUrlHash();
    }

    renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);

    function loop() {
      renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
      if (tourOverlayVisible && activeScenarioKey !== 'none') {
        positionAnchoredTourTooltip(false);
      }
      animTick += 0.016;

      let highlightSet = null;
      let tourFocusNodeId = null;
      let tourStepBadgeText = null;

      if (tourOverlayVisible && activeScenarioKey !== 'none' && scenarios[activeScenarioKey]) {
        const steps = scenarios[activeScenarioKey].steps;
        const step = steps[activeStepIdx];
        if (step) {
          if (step.highlight) highlightSet = new Set(step.highlight);
          tourFocusNodeId = step.focusNode || null;
          tourStepBadgeText = 'STEP ' + (activeStepIdx + 1) + '/' + steps.length;
        }
      } else if (activeRightView === 'tech' && techMap[selectedTechId]) {
        const usedIn = techMap[selectedTechId].usedIn || [];
        if (usedIn.length > 0) {
          highlightSet = new Set(usedIn);
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
        tourFocusNodeId,
        tourStepBadgeText,
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
