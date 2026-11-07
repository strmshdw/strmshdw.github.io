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

  // Contextual Micro-Simulator State
  let selectedMemSliceIdx = 0;
  let selectedPairQueryIdx = 0;
  let selectedPairKeyIdx = 6;
  let surpriseIntensity = 0.68;

  // 6-Style × 2-Polarity Theme Engine Metadata (Polarity-Tuned for WCAG AA/AAA Contrast)
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
      notes: '2.5px ink borders · Hard offset shadows · High-contrast stage headers',
      stageColorsLight: ['#ff4d00', '#00b4d8', '#7c3aed', '#ec4899', '#eab308', '#16a34a'],
      stageColorsDark:  ['#ff5e1a', '#22d3ee', '#a78bfa', '#f472b6', '#facc15', '#4ade80']
    },
    modular_typo: {
      name: 'Modular Typography',
      notes: 'Swiss International Grid · Exposed 1.5px rules · 0px radius · Grotesque hierarchy',
      stageColorsLight: ['#e62400', '#0050d8', '#6d28d9', '#be123c', '#b45309', '#0f766e'],
      stageColorsDark:  ['#ff4522', '#3b82f6', '#a78bfa', '#fb7185', '#facc15', '#2dd4bf']
    },
    utilitarian: {
      name: 'Utilitarian',
      notes: '100% IBM Plex Mono · CAD reticle grid · Corner L-brackets · 90° PCB traces',
      stageColorsLight: ['#b45309', '#0369a1', '#6d28d9', '#be185d', '#a16207', '#047857'],
      stageColorsDark:  ['#f59e0b', '#38bdf8', '#a78bfa', '#f472b6', '#facc15', '#34d399']
    },
    memphis: {
      name: 'Memphis',
      notes: '80s Sottsass geometric pop · 2.5px borders · Stage-colored offset shadows',
      stageColorsLight: ['#db2777', '#0891b2', '#7c3aed', '#ea580c', '#eab308', '#059669'],
      stageColorsDark:  ['#f472b6', '#22d3ee', '#a78bfa', '#fb923c', '#facc15', '#34d399']
    },
    pixel_art: {
      name: 'Pixel Art',
      notes: '16-Bit command deck · Silkscreen pixel headers · Stepped borders & scanlines',
      stageColorsLight: ['#006d77', '#023e8a', '#6a1b9a', '#b5179e', '#b45309', '#15803d'],
      stageColorsDark:  ['#00e5ff', '#38bdf8', '#c084fc', '#ff2a85', '#f59e0b', '#22c55e']
    },
    aurora: {
      name: 'Aurora',
      notes: 'Borealis radial plumes · Solid pearl/velvet cards · Luminous specular rims',
      stageColorsLight: ['#0f766e', '#0284c7', '#6d28d9', '#be185d', '#b45309', '#15803d'],
      stageColorsDark:  ['#00f5d4', '#38bdf8', '#a78bfa', '#f472b6', '#facc15', '#4ade80']
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
    utilitarian: {
      prev: '<', next: '>', light: 'L', dark: 'D',
      node: 'BLK', tech: 'TEC', tourOn: 'ON', tourOff: '>>',
      export: 'IO', close: 'X', open: '↗', fs: 'FS', fsExit: 'X'
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
    aurora: {
      prev: '‹', next: '›', light: '✧', dark: '✦',
      node: '◈', tech: '✦', tourOn: '✦', tourOff: '▸',
      export: '◈', close: '✕', open: '↗', fs: '⤢', fsExit: '✕'
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

  // Render external white paper cards inside the 5. Papers tab
  function renderLearnMoreCardsHtml(resList) {
    if (!resList || resList.length === 0) {
      return '<div class="text-xs text-secondary-ink">No external references indexed.</div>';
    }
    return (
      '<div class="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">' +
      resList
        .map(
          (r) =>
            '<div class="surface-root border border-hairline rounded-xl p-3 flex flex-col justify-between gap-2">' +
            '<div class="flex flex-col gap-1">' +
            '<div class="flex flex-wrap items-center justify-between gap-1.5">' +
            '<span class="mono text-[10px] font-bold px-2 py-0.5 rounded btn-theme-accent border">' +
            r.badge +
            '</span>' +
            (r.techShort
              ? '<span class="mono text-[10px] font-semibold text-muted-ink">' + r.techShort + '</span>'
              : '') +
            '</div>' +
            '<h4 class="text-xs font-bold text-primary-ink leading-snug mt-0.5">' +
            r.title +
            '</h4>' +
            '<div class="mono text-[10.5px] text-muted-ink">' +
            r.authors +
            '</div>' +
            '<p class="text-[11.5px] text-secondary-ink leading-relaxed mt-0.5">' +
            r.desc +
            '</p>' +
            '</div>' +
            '<div class="pt-1.5 border-t border-hairline flex items-center justify-between gap-2">' +
            '<span class="mono text-[10px] text-muted-ink truncate">' +
            r.url +
            '</span>' +
            '<a href="' +
            r.url +
            '" target="_blank" rel="noopener noreferrer" class="no-wrap-btn px-2.5 py-1 rounded-lg text-[11px] font-semibold btn-theme-accent border transition">' +
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
    const inspectorNodeView = document.getElementById('inspectorNodeView');
    const inspectorTechView = document.getElementById('inspectorTechView');
    const selTechDropdown = document.getElementById('selTechDropdown');
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

    function populateScenarioDropdown() {
      const prevVal = selScenario.value || activeScenarioKey || 'none';
      selScenario.innerHTML = '';
      const noneOpt = document.createElement('option');
      noneOpt.value = 'none';
      noneOpt.textContent = 'Free Exploration (Click Any Block)';
      selScenario.appendChild(noneOpt);

      Object.entries(scenarios).forEach(([key, sc]) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = sc.label + ' (' + sc.steps.length + ' Steps)';
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
      document.getElementById('btnExportHtml').textContent = 'Share HTML';
      document.getElementById('btnExportPng').textContent = 'PNG';
      document.getElementById('btnCopyMermaid').textContent = 'Mermaid';
      btnTtPrev.textContent = getGlyph('prev') + ' Prev';
      btnTtNext.textContent = 'Next ' + getGlyph('next');
      btnTtDeepDive.textContent = getGlyph('tech') + ' Deep Dive';
      btnCloseTooltip.textContent = getGlyph('close') + ' Exit';
      btnCloseDrawer.textContent = getGlyph('close') + ' Close';
    }

    function updatePolarityButtons() {
      const cols = getActiveStageColors();
      const bgCol = cols[0];
      const inkCol = renderer.getContrastInk(bgCol, '#111111', '#ffffff');
      if (activePolarity === 'light') {
        btnPolarityLight.style.backgroundColor = bgCol;
        btnPolarityLight.style.color = inkCol;
        btnPolarityDark.style.backgroundColor = 'transparent';
        btnPolarityDark.style.color = '';
      } else {
        btnPolarityDark.style.backgroundColor = bgCol;
        btnPolarityDark.style.color = inkCol;
        btnPolarityLight.style.backgroundColor = 'transparent';
        btnPolarityLight.style.color = '';
      }
    }

    // Full Screen Mode & Slide-In Side Panel Controller
    function syncFullscreenAndDrawer() {
      if (isFullscreenMode) {
        if (topIdentityBar) topIdentityBar.classList.add('hidden');
        if (btnCloseDrawer) btnCloseDrawer.classList.remove('hidden');

        rightSidePanel.classList.remove('w-full', 'lg:w-[490px]', 'xl:w-[535px]');
        rightSidePanel.classList.add(
          'absolute',
          'top-0',
          'right-0',
          'bottom-0',
          'w-[500px]',
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
          'w-[500px]',
          'max-w-[92vw]',
          'border-l',
          'border-subtle',
          'shadow-2xl'
        );
        rightSidePanel.classList.add('w-full', 'lg:w-[490px]', 'xl:w-[535px]');
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
        inspectorNodeView.classList.remove('hidden');
        inspectorNodeView.classList.add('flex');
        inspectorTechView.classList.add('hidden');
        inspectorTechView.classList.remove('flex');
        btnViewNode.className = 'no-wrap-btn py-1 px-2.5 rounded-lg text-xs font-semibold btn-theme-accent transition cursor-pointer';
        btnViewTech.className = 'no-wrap-btn py-1 px-2.5 rounded-lg text-xs font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
        renderNodeInspector();
      } else {
        if (tabOpt) activeTTab = tabOpt;
        inspectorNodeView.classList.add('hidden');
        inspectorNodeView.classList.remove('flex');
        inspectorTechView.classList.remove('hidden');
        inspectorTechView.classList.add('flex');
        btnViewTech.className = 'no-wrap-btn py-1 px-2.5 rounded-lg text-xs font-semibold btn-theme-accent transition cursor-pointer';
        btnViewNode.className = 'no-wrap-btn py-1 px-2.5 rounded-lg text-xs font-semibold text-secondary-ink hover:text-primary-ink transition cursor-pointer';
        renderTechDeepDive();
      }
      syncThemeAlignedButtons();
      syncUrlHash();
    }

    // Render Clickable Upstream Inputs & Downstream Outputs inside Block Inspector
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
        hdr.className = 'mono text-[10px] font-bold text-muted-ink uppercase';
        hdr.textContent = title;
        col.appendChild(hdr);

        if (edgeList.length === 0) {
          const empty = document.createElement('span');
          empty.className = 'mono text-[10.5px] text-muted-ink italic';
          empty.textContent = isIncoming ? 'Source Input Boundary' : 'Terminal Output Head';
          col.appendChild(empty);
          return col;
        }

        const wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-1';
        edgeList.forEach((e) => {
          const targetNode = nodeMap[isIncoming ? e.from : e.to];
          if (!targetNode) return;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className =
            'no-wrap-btn px-2 py-0.5 rounded surface-root border border-hairline hover:border-subtle text-[10.5px] mono text-primary-ink transition cursor-pointer gap-1';
          btn.title =
            (isIncoming ? 'Upstream Input from #' : 'Downstream Output to #') +
            targetNode.num +
            ' ' +
            targetNode.title +
            (e.label ? ' (' + e.label + ')' : '');
          btn.innerHTML =
            '<span class="font-bold" style="color:' +
            targetNode.color +
            '">#' +
            targetNode.num +
            '</span><span class="truncate max-w-[105px]">' +
            targetNode.title +
            '</span>' +
            (e.label
              ? '<span class="px-1 rounded surface-panel text-[9.5px] text-secondary-ink">' + e.label + '</span>'
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
        group.className = 'inline-flex items-center rounded-lg border border-hairline surface-panel overflow-hidden';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'no-wrap-btn px-2.5 py-1 text-[11px] font-semibold text-primary-ink hover:text-theme-accent transition cursor-pointer';
        btn.textContent = getGlyph('tech') + ' ' + t.short + ' ↗';
        btn.title = 'Inspect ' + t.short + ' in Deep Dive & highlight blocks on canvas';
        btn.addEventListener('click', () => {
          setRightView('tech', tid, 'how');
        });
        group.appendChild(btn);

        if (papers.length > 0) {
          const lmBtn = document.createElement('button');
          lmBtn.type = 'button';
          lmBtn.className = 'no-wrap-btn px-1.5 py-1 text-[10px] mono font-bold surface-root text-secondary-ink hover:text-primary-ink border-l border-hairline transition cursor-pointer';
          lmBtn.title = 'View ' + papers.length + ' foundational paper(s) for ' + t.short;
          lmBtn.textContent = 'Papers (' + papers.length + ')';
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
          ? 'ntab-btn no-wrap-btn py-1 px-1 rounded-lg text-[11px] font-semibold btn-theme-accent transition cursor-pointer'
          : 'ntab-btn no-wrap-btn py-1 px-1 rounded-lg text-[11px] font-medium text-secondary-ink hover:text-primary-ink transition cursor-pointer';
      });

      const ntabHeading = document.getElementById('ntabHeading');
      const ntabBody = document.getElementById('ntabBody');
      const ntabCalloutBox = document.getElementById('ntabCalloutBox');
      const ntabSubLabel = document.getElementById('ntabSubLabel');
      const ntabSubContent = document.getElementById('ntabSubContent');

      if (activeNTab === 'learn') {
        ntabHeading.textContent = '05 // PRIMARY LITERATURE & WHITE PAPERS';
        const papers = getExternalResourcesForNode(n);
        ntabBody.innerHTML = renderLearnMoreCardsHtml(papers);
        ntabCalloutBox.classList.add('hidden');
      } else {
        ntabCalloutBox.classList.remove('hidden');

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
          ? 'ttab-btn no-wrap-btn py-1 px-1 rounded-lg text-[11px] font-semibold btn-theme-accent transition cursor-pointer'
          : 'ttab-btn no-wrap-btn py-1 px-1 rounded-lg text-[11px] font-medium text-secondary-ink hover:text-primary-ink transition cursor-pointer';
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
        b.type = 'button';
        b.className = 'no-wrap-btn mono text-[11px] px-2.5 py-1 rounded-lg surface-panel text-primary-ink border border-hairline hover:border-subtle transition cursor-pointer gap-1';
        b.innerHTML =
          '<span class="font-bold" style="color:' +
          n.color +
          '">#' +
          n.num +
          '</span><span>' +
          n.title +
          '</span>';
        b.addEventListener('click', () => {
          selectedNodeId = n.id;
          setRightView('node');
        });
        usedContainer.appendChild(b);
      });
    }

    // Stage-Level Evolution Summary across all 4 Platform Generations (Side-by-Side 4-Row Matrix)
    const STAGE_EVOLUTION_MATRIX = {
      mem: {
        title: 'STAGE 1 EVOLUTION // OBSERVATION MANIFOLD',
        gen1_ret40: '41×25 EntityTokenPOD (4,100B) + 1,536B SoA (World Z-Up)',
        gen2_factorized: '171D×4 Egocentric R_car^T Stack (684D) + 68D Critic Tail',
        gen3_perceiver: '700D (684D + 16D 4-Frame Wheel History) + 752D Critic',
        hex63: '5,376B Layout A (84×64B CL, 64 Entities, 8 BallRingBuffer480, C2v)'
      },
      edges: {
        title: 'STAGE 2 EVOLUTION // RELATIONAL & TEMPORAL ENCODING',
        gen1_ret40: 'CPU AVX2 41×41×8 r_ij (53.7KB) + Trunk-Hoisted mlp_rel',
        gen2_factorized: 'K=4 Sliding Window (267ms) + 0..2 Tick Latency Randomizer',
        gen3_perceiver: 'Zero-Copy 144D Core Unpacker + Shared 34×7D BoostPad PointNet',
        hex63: 'On-Chip GPU 16×64×72D Pairwise Kernel + 2L Bipartite DiffAttn'
      },
      titans: {
        title: 'STAGE 3–4 EVOLUTION // BACKBONE, MEMORY & SKILL LATENTS',
        gen1_ret40: '4L RET-40 (d=128) + Quat q*∈S^3 + 4 Exploiter Archetype Heads',
        gen2_factorized: '684->512->512->256 MLP + SeqScout Miner + Aux Skill Z_t (8/32)',
        gen3_perceiver: '2L Perceiver (M=4×N=37, QK-Norm) + 912->256 SwiGLU + Aux Z_t',
        hex63: '2×4×32×32 FP32 Titans Fast Weights + Coconut Loop + 8×2 Soft-MoE + 1,000 FSQ'
      },
      control: {
        title: 'STAGE 5–6 EVOLUTION // MOTOR DECODER, CRITIC & RL',
        gen1_ret40: '120Hz Geodesic SLERP Attitude PD + 3-PopArt + 32-Quantile CVaR_β',
        gen2_factorized: 'Fused 31-Logit [B,7,7] + 8-Subtick Flip FSM + 752D Critic + Zero-Sum PBRS',
        gen3_perceiver: '2-Stage Cond-31 Heads (J/B -> 5 Axes) + 752D Perceiver Critic + KL Distill',
        hex63: 'Stage-1 16-Way Binary + Stage-2 60Hz Flow-GRPO SDE + Dual 4×51 Symlog + JEPA + G=8 GRPO'
      }
    };

    function appendEvolutionComparisonStrip(wBody, stageGroup) {
      const evo = STAGE_EVOLUTION_MATRIX[stageGroup] || STAGE_EVOLUTION_MATRIX.control;
      const box = document.createElement('div');
      box.className = 'mt-1 pt-2 border-t border-hairline flex flex-col gap-1';

      const hdr = document.createElement('div');
      hdr.className = 'flex items-center justify-between gap-1';
      hdr.innerHTML =
        '<span class="kicker text-muted-ink">' +
        evo.title +
        '</span><span class="mono text-[9.5px] text-theme-accent font-bold">4-GEN MATRIX (CLICK ROW)</span>';
      box.appendChild(hdr);

      const gens = [
        { key: 'hex63', short: 'Hex63 · Current' },
        { key: 'gen3_perceiver', short: 'Gen 3 · Perceiver' },
        { key: 'gen2_factorized', short: 'Gen 2 · MLP-684' },
        { key: 'gen1_ret40', short: 'Gen 1 · RET-40' }
      ];

      const matrixList = document.createElement('div');
      matrixList.className = 'flex flex-col gap-1';
      gens.forEach((g) => {
        const isCurr = g.key === activeArchKey;
        const rowBtn = document.createElement('button');
        rowBtn.type = 'button';
        rowBtn.className =
          'w-full text-left px-2 py-1 rounded border transition cursor-pointer flex items-baseline justify-between gap-2 ' +
          (isCurr
            ? 'surface-elevated border-subtle'
            : 'surface-root border-hairline opacity-80 hover:opacity-100');
        rowBtn.innerHTML =
          '<span class="mono text-[10px] font-bold shrink-0 ' +
          (isCurr ? 'text-theme-accent' : 'text-primary-ink') +
          '">' +
          (isCurr ? '▸ ' : '  ') +
          g.short +
          '</span>' +
          '<span class="mono text-[10px] text-secondary-ink truncate flex-1 text-right" title="' +
          evo[g.key] +
          '">' +
          evo[g.key] +
          '</span>';
        rowBtn.addEventListener('click', () => {
          setArchitecture(g.key);
        });
        matrixList.appendChild(rowBtn);
      });
      box.appendChild(matrixList);

      wBody.appendChild(box);
    }

    // Render Contextual Interactive Micro-Simulator inside the Right Panel
    function renderContextualWidget(node) {
      const wTitle = document.getElementById('ctxWidgetTitle');
      const wTag = document.getElementById('ctxWidgetTag');
      const wBody = document.getElementById('ctxWidgetBody');
      wBody.innerHTML = '';

      const stageCols = getActiveStageColors();

      if (node.stageGroup === 'mem') {
        if (activeArchKey === 'hex63') {
          wTitle.textContent = 'INTERACTIVE 5,376B CACHE-LINE INSPECTOR';
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
              'py-1 px-1 rounded text-[10px] mono font-bold truncate border transition cursor-pointer ' +
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
          info.className = 'p-2 rounded-lg surface-root border border-hairline mono text-[11px] flex flex-col gap-0.5';
          info.innerHTML =
            '<div class="flex justify-between"><span class="font-bold text-primary-ink">' +
            activeSeg.name +
            '</span><span class="text-theme-accent font-bold">Bytes ' +
            activeSeg.bytes +
            ' (' +
            activeSeg.cl +
            ')</span></div>' +
            '<div class="text-secondary-ink font-sans text-[11.5px] leading-snug">' +
            activeSeg.desc +
            '</div>';
          wBody.appendChild(info);
        } else {
          wTitle.textContent =
            activeArchKey === 'gen1_ret40'
              ? 'GEN 1 // 41×25 ENTITY POD & 1,536B SOA INSPECTOR'
              : activeArchKey === 'gen2_factorized'
              ? 'GEN 2 // 684D EGOCENTRIC + 68D CRITIC INSPECTOR'
              : 'GEN 3 // 700D CANONICAL + 752D CRITIC INSPECTOR';
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
              'py-1 px-1 rounded text-[10px] mono font-bold truncate border transition cursor-pointer ' +
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
          info.className = 'p-2 rounded-lg surface-root border border-hairline mono text-[11px] flex flex-col gap-0.5';
          info.innerHTML =
            '<div class="flex justify-between"><span class="font-bold text-primary-ink">' +
            activeSeg.name +
            '</span><span class="text-theme-accent font-bold">' +
            activeSeg.bytes +
            ' (' +
            activeSeg.cl +
            ')</span></div><div class="text-secondary-ink font-sans text-[11.5px] leading-snug">' +
            activeSeg.desc +
            '</div>';
          wBody.appendChild(info);
        }
      } else if (node.stageGroup === 'edges') {
        wTitle.textContent =
          activeArchKey === 'hex63'
            ? '16×64 PAIRWISE INTERCEPT SIMULATOR'
            : activeArchKey === 'gen3_perceiver'
            ? 'GEN 3 // M=4 × N=37 PERCEIVER PAD BIAS SIMULATOR'
            : activeArchKey === 'gen2_factorized'
            ? 'GEN 2 // K=4 FINITE-DIFFERENCE & JITTER SIMULATOR'
            : 'GEN 1 // AVX2 41×41×8 PAIRWISE r_ij SIMULATOR';
        wTag.textContent =
          activeArchKey === 'hex63'
            ? '1,024 PAIRS · 72D'
            : activeArchKey === 'gen3_perceiver'
            ? '148 PAIRS · QK-NORM'
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
        sQ.className = 'surface-root text-primary-ink border border-hairline rounded px-2 py-1 text-[11px] mono';
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
        sK.className = 'surface-root text-primary-ink border border-hairline rounded px-2 py-1 text-[11px] mono';
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
        metrics.className = 'grid grid-cols-3 gap-1.5 mono text-[11px]';
        metrics.innerHTML =
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9.5px]">3D DIST</div><div class="text-primary-ink font-bold">' +
          dist +
          ' uu</div></div>' +
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9.5px]">T_INTERCEPT</div><div class="text-theme-accent font-bold">' +
          tReach +
          ' s</div></div>' +
          '<div class="p-1.5 rounded surface-root border border-hairline"><div class="text-muted-ink text-[9.5px]">' +
          (activeArchKey === 'hex63' ? 'DIFF-ATTN' : 'BIAS WEIGHT') +
          '</div><div class="text-primary-ink font-bold">' +
          attnScore +
          '</div></div>';
        wBody.appendChild(metrics);
      } else if (node.stageGroup === 'titans') {
        wTitle.textContent =
          activeArchKey === 'hex63'
            ? 'TITANS SURPRISE & 8-EXPERT SOFT-MOE ROUTER'
            : activeArchKey === 'gen1_ret40'
            ? 'GEN 1 // RET-40 & 4 EXPLOITER ARCHETYPE WEIGHTS'
            : 'GEN 2/3 // COMPOSITIONAL SKILL TAXONOMY Z_t (8 × 32)';
        wTag.textContent =
          activeArchKey === 'hex63'
            ? 'FP32 ||W||_F <= 4.0'
            : activeArchKey === 'gen1_ret40'
            ? '4 ARCHETYPES'
            : '8 FAMILIES · 32 SUB';

        const sliderRow = document.createElement('div');
        sliderRow.className = 'flex items-center justify-between gap-2 text-[11.5px]';
        sliderRow.innerHTML =
          '<span class="text-secondary-ink">' +
          (activeArchKey === 'hex63' ? 'Opponent Surprise Residual ||r_t||:' : 'Aerial / Mechanical Phase Intensity:') +
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

        const itemsList =
          activeArchKey === 'hex63'
            ? [
                { name: 'E1: Ground/50s', w: 0.14 },
                { name: 'E2: Fast Aerial', w: 0.22 },
                { name: 'E3: Wall/Double', w: Math.min(0.42, 0.12 + surpriseIntensity * 0.18) },
                { name: 'E4: Flip Reset', w: Math.min(0.38, 0.08 + surpriseIntensity * 0.15) },
                { name: 'E5: Shadow Def', w: Math.max(0.06, 0.34 - surpriseIntensity * 0.12) },
                { name: 'E6: Demo/Evade', w: Math.min(0.45, 0.10 + surpriseIntensity * 0.22) }
              ]
            : activeArchKey === 'gen1_ret40'
            ? [
                { name: 'Main RET-40 Policy', w: Math.max(0.25, 0.65 - surpriseIntensity * 0.2) },
                { name: 'Exploiter 1: Ball Denial', w: 0.18 },
                { name: 'Exploiter 2: Demolition', w: Math.min(0.45, 0.10 + surpriseIntensity * 0.22) },
                { name: 'Exploiter 3: Aerial Mech', w: Math.min(0.42, 0.12 + surpriseIntensity * 0.18) }
              ]
            : [
                { name: 'Z_1: Power Strike', w: 0.15 },
                { name: 'Z_2: Zap/Wall Dash', w: 0.18 },
                { name: 'Z_3: Musty/Breezi Flick', w: Math.min(0.38, 0.10 + surpriseIntensity * 0.16) },
                { name: 'Z_4: Air Dribble', w: 0.22 },
                { name: 'Z_5: Stall/Pop Reset', w: Math.min(0.46, 0.12 + surpriseIntensity * 0.22) },
                { name: 'Z_7: Speedflip Cancel', w: 0.24 }
              ];
        const expGrid = document.createElement('div');
        expGrid.className = 'grid grid-cols-2 gap-1 pt-0.5';
        itemsList.forEach((ex) => {
          const pct = Math.round(ex.w * 100);
          const item = document.createElement('div');
          item.className = 'p-1.5 rounded surface-root border border-hairline flex flex-col gap-0.5';
          item.innerHTML =
            '<div class="flex justify-between text-[10.5px] mono"><span class="text-secondary-ink">' +
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
      } else {
        wTitle.textContent =
          activeArchKey === 'hex63'
            ? '60HZ SUBTICK CHUNK & 4-HORIZON CRITIC'
            : activeArchKey === 'gen1_ret40'
            ? 'GEN 1 // 120HZ SLERP PD & 32-QUANTILE CVaR'
            : 'GEN 2/3 // 8-SUBTICK FLIP FSM & 3-HORIZON POPART';
        wTag.textContent =
          activeArchKey === 'hex63'
            ? 'K_sub = 4 (60Hz)'
            : activeArchKey === 'gen1_ret40'
            ? '120Hz PD LOOP'
            : '8 TICKS (15Hz)';

        const rows =
          activeArchKey === 'hex63'
            ? [
                { k: 'Subtick 1 (0–16.7ms)', v: 'm_dj=0 · Pitch -0.85' },
                { k: 'Subtick 2 (16.7–33.3ms)', v: 'm_dj=1 · Pitch +0.02 (0.12·tanh Stall)' },
                { k: 'Subtick 3 (33.3–50.0ms)', v: 'm_dj=0 · Pitch -0.98 (Cancel)' },
                { k: 'Subtick 4 (50.0–66.7ms)', v: 'm_dj=0 · Pitch -0.94 (Align)' }
              ]
            : activeArchKey === 'gen1_ret40'
            ? [
                { k: 'Ticks 1..2 (SLERP τ=0.25)', v: 'q̃* = sign(<q*,q>)q* · e_rot = 0.31 rad' },
                { k: 'Ticks 3..4 (SLERP τ=0.50)', v: 'Kp=(5,5,1.8) · Kd=(0.65,0.65,0.22)' },
                { k: 'Ticks 5..6 (SLERP τ=0.75)', v: 'Kff·ω* Feedforward · Torque Clip [-1,1]' },
                { k: 'Ticks 7..8 (SLERP τ=1.00)', v: '|e_rot| < 0.04 rad -> Schmitt Deadband 0' }
              ]
            : [
                { k: 'Subtick 0 (Tick 1 / 8.3ms)', v: 'FlipState Override: jump = 0 (Release)' },
                { k: 'Subticks 1..4 (Ticks 2..5)', v: 'FlipState Rising Edge: jump = 1 (Dodge)' },
                { k: 'Subticks 5..7 (Ticks 6..8)', v: 'FlipState Hold Release: jump = 0' }
              ];
        const tbl = document.createElement('div');
        tbl.className = 'flex flex-col gap-1 mono text-[10.5px]';
        rows.forEach((st) => {
          const r = document.createElement('div');
          r.className = 'p-1 rounded surface-root border border-hairline flex items-center justify-between gap-2';
          r.innerHTML =
            '<span class="text-primary-ink font-semibold">' +
            st.k +
            '</span><span class="text-theme-accent font-bold truncate">' +
            st.v +
            '</span>';
          tbl.appendChild(r);
        });
        wBody.appendChild(tbl);
      }

      appendEvolutionComparisonStrip(wBody, node.stageGroup || 'control');
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

    // Update Docked Walkthrough HUD Bar (Above Canvas — Never Occludes Nodes)
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
      });
    }

    function setPolarity(mode) {
      activePolarity = mode === 'dark' ? 'dark' : 'light';
      document.body.setAttribute('data-mode', activePolarity);
      try {
        localStorage.setItem('arashikage_arch_polarity', activePolarity);
      } catch (_) {}
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
      const stageCols = getActiveStageColors();
      const notesText = meta.name.toUpperCase() + ' (' + activePolarity.toUpperCase() + ') — ' + meta.notes;
      const notesEl = document.getElementById('themeStyleNotes');
      if (notesEl) {
        notesEl.textContent = notesText;
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

    // Event Listeners: Scenario & Docked Walkthrough HUD Bar
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
        btn.textContent = 'Copied!';
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
      renderNodeInspector();
      renderTechDeepDive();
      syncUrlHash();
    }

    renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);

    function loop() {
      renderer.fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas);
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
        // Automatically spotlight the subsystem blocks that implement the inspected technology!
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
