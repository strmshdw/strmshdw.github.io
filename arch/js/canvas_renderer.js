// Arashikage (Hex63) — Interactive Canvas Data-Flow Renderer & Aspect Ratio Controller
(function () {
  const LOGICAL_W = 1120;
  const LOGICAL_H = 680;

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (r <= 0) {
      ctx.rect(x, y, w, h);
      return;
    }
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawFittedText(ctx, text, x, y, maxW, baseSize, minSize, weight, family) {
    let sz = baseSize;
    ctx.font = `${weight} ${sz}px ${family}`;
    while (ctx.measureText(text).width > maxW && sz > minSize) {
      sz -= 0.5;
      ctx.font = `${weight} ${sz}px ${family}`;
    }
    let out = text;
    if (ctx.measureText(out).width > maxW) {
      while (out.length > 3 && ctx.measureText(out + '…').width > maxW) {
        out = out.slice(0, -1);
      }
      out += '…';
    }
    ctx.fillText(out, x, y);
  }

  function drawWrappedSub(ctx, text, x, y, maxW, lineHeight, maxLines) {
    const words = text.split(' ');
    let line = '';
    let lineIdx = 0;
    for (let i = 0; i < words.length; i++) {
      const testLine = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(testLine).width > maxW && line) {
        ctx.fillText(line, x, y + lineIdx * lineHeight);
        line = words[i];
        lineIdx++;
        if (lineIdx >= maxLines - 1) {
          let rem = words.slice(i).join(' ');
          while (rem.length > 3 && ctx.measureText(rem + '…').width > maxW) {
            rem = rem.slice(0, -1);
          }
          ctx.fillText(
            rem + (rem.length < words.slice(i).join(' ').length ? '…' : ''),
            x,
            y + lineIdx * lineHeight
          );
          return;
        }
      } else {
        line = testLine;
      }
    }
    if (line && lineIdx < maxLines) {
      ctx.fillText(line, x, y + lineIdx * lineHeight);
    }
  }

  function drawCornerBrackets(ctx, x, y, w, h, len, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y + len);
    ctx.lineTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.moveTo(x + w - len, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + len);
    ctx.moveTo(x, y + h - len);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + len, y + h);
    ctx.moveTo(x + w - len, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - len);
    ctx.stroke();
    ctx.restore();
  }

  function getEdgePoint(n, side, offsetRatio = 0.5) {
    if (side === 'right') return { x: n.x + n.w, y: n.y + n.h * offsetRatio };
    if (side === 'left') return { x: n.x, y: n.y + n.h * offsetRatio };
    if (side === 'bottom') return { x: n.x + n.w * offsetRatio, y: n.y + n.h };
    if (side === 'top') return { x: n.x + n.w * offsetRatio, y: n.y };
    return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
  }

  function computeEdgeAnchor(src, dst) {
    const dx = dst.x + dst.w / 2 - (src.x + src.w / 2);
    const dy = dst.y + dst.h / 2 - (src.y + src.h / 2);
    if (Math.abs(dx) > Math.abs(dy) * 0.85) {
      if (dx > 0) return { p1: getEdgePoint(src, 'right'), p2: getEdgePoint(dst, 'left'), horiz: true };
      return { p1: getEdgePoint(src, 'left'), p2: getEdgePoint(dst, 'right'), horiz: true };
    } else {
      if (dy > 0) return { p1: getEdgePoint(src, 'bottom'), p2: getEdgePoint(dst, 'top'), horiz: false };
      return { p1: getEdgePoint(src, 'top'), p2: getEdgePoint(dst, 'bottom'), horiz: false };
    }
  }

  // Enforce strict 1120:680 aspect ratio inside #canvasWrapper
  function fitDiagramAspectRatio(canvasWrapper, canvasAspectBox) {
    if (!canvasWrapper || !canvasAspectBox) return;
    const rect = canvasWrapper.getBoundingClientRect();
    const padX = 20;
    const padY = 20;
    const availW = Math.max(320, rect.width - padX);
    const availH = Math.max(220, rect.height - padY);
    const targetRatio = LOGICAL_W / LOGICAL_H;

    let boxW = availW;
    let boxH = boxW / targetRatio;
    if (boxH > availH) {
      boxH = availH;
      boxW = boxH * targetRatio;
    }
    canvasAspectBox.style.width = `${Math.floor(boxW)}px`;
    canvasAspectBox.style.height = `${Math.floor(boxH)}px`;
  }

  function getNodeAtCanvasCoords(canvasEl, clientX, clientY, nodes) {
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = LOGICAL_W / rect.width;
    const scaleY = LOGICAL_H / rect.height;
    const mx = (clientX - rect.left) * scaleX;
    const my = (clientY - rect.top) * scaleY;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (mx >= n.x && mx <= n.x + n.w && my >= n.y && my <= n.y + n.h) {
        return { node: n, mx, my, rect };
      }
    }
    return { node: null, mx, my, rect };
  }

  function renderCanvas(ctx, state) {
    const {
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
    } = state;

    const isLight = activePolarity === 'light';
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

    // 1. Theme-Specific Canvas Stage Background
    const stageStyles = {
      neo_brutalism: {
        bg: isLight ? '#F4F0EA' : '#121212',
        laneFill: isLight ? '#FFFFFF' : '#1C1C1C',
        laneBorder: isLight ? '#000000' : '#F4F0EA',
        laneRadius: 0,
        laneDash: [],
        laneShadow: isLight ? 4 : 3,
        textHead: isLight ? '#000000' : '#F4F0EA',
        textSub: isLight ? '#333333' : '#BDBDBD',
        fontHead: "'Space Grotesk', sans-serif",
        fontMono: "'IBM Plex Mono', monospace",
        nodeBg: isLight ? '#FFFFFF' : '#1E1E1E',
        nodeRadius: 0
      },
      modular_typo: {
        bg: isLight ? '#F2F0EB' : '#0F1115',
        laneFill: isLight ? '#FAF9F5' : '#161920',
        laneBorder: isLight ? '#141413' : '#475569',
        laneRadius: 0,
        laneDash: [],
        laneShadow: 0,
        textHead: isLight ? '#141413' : '#F2F0EB',
        textSub: isLight ? '#575653' : '#94A3B8',
        fontHead: "'Plus Jakarta Sans', sans-serif",
        fontMono: "'JetBrains Mono', monospace",
        nodeBg: isLight ? '#FFFFFF' : '#181B22',
        nodeRadius: 0
      },
      utilitarian: {
        bg: isLight ? '#E6E9EF' : '#0B0E11',
        laneFill: isLight ? 'rgba(242, 244, 248, 0.92)' : 'rgba(18, 23, 29, 0.9)',
        laneBorder: isLight ? '#94A3B8' : '#26303D',
        laneRadius: 0,
        laneDash: [4, 4],
        laneShadow: 0,
        textHead: isLight ? '#0F172A' : '#E2E8F0',
        textSub: isLight ? '#475569' : '#7E8C9F',
        fontHead: "'IBM Plex Mono', monospace",
        fontMono: "'IBM Plex Mono', monospace",
        nodeBg: isLight ? '#FFFFFF' : '#13181F',
        nodeRadius: 0
      },
      memphis: {
        bg: isLight ? '#FFF8E7' : '#171126',
        laneFill: isLight ? '#FFFFFF' : '#231A38',
        laneBorder: isLight ? '#1D1829' : '#FFF8E7',
        laneRadius: 14,
        laneDash: [],
        laneShadow: 4,
        textHead: isLight ? '#1D1829' : '#FFF8E7',
        textSub: isLight ? '#4A3F6B' : '#C4B5FD',
        fontHead: "'Syne', sans-serif",
        fontMono: "'Space Mono', monospace",
        nodeBg: isLight ? '#FFFFFF' : '#261C3D',
        nodeRadius: 12
      },
      pixel_art: {
        bg: isLight ? '#D8E2DC' : '#0D0B18',
        laneFill: isLight ? '#ECE4DB' : '#171429',
        laneBorder: isLight ? '#1D1B2F' : '#4A446E',
        laneRadius: 0,
        laneDash: [],
        laneShadow: 4,
        textHead: isLight ? '#1D1B2F' : '#F4F4F8',
        textSub: isLight ? '#4A446E' : '#8E88B5',
        fontHead: "'Silkscreen', monospace",
        fontMono: "'Silkscreen', monospace",
        nodeBg: isLight ? '#F8F9FA' : '#1D1934',
        nodeRadius: 0
      },
      aurora: {
        bg: isLight ? '#F3F6FC' : '#050814',
        laneFill: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(13, 20, 38, 0.72)',
        laneBorder: isLight ? 'rgba(99, 102, 241, 0.25)' : 'rgba(148, 163, 184, 0.22)',
        laneRadius: 16,
        laneDash: [],
        laneShadow: 0,
        textHead: isLight ? '#0F172A' : '#F8FAFC',
        textSub: isLight ? '#475569' : '#94A3B8',
        fontHead: "'Outfit', sans-serif",
        fontMono: "'JetBrains Mono', monospace",
        nodeBg: isLight ? '#FFFFFF' : '#0F172A',
        nodeRadius: 12
      }
    };

    const st = stageStyles[activeTheme] || stageStyles.neo_brutalism;
    ctx.fillStyle = st.bg;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // 2. Background Grid / Pattern per theme
    ctx.save();
    if (activeTheme === 'neo_brutalism') {
      ctx.fillStyle = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.10)';
      for (let x = 16; x < LOGICAL_W; x += 24) {
        for (let y = 16; y < LOGICAL_H; y += 24) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    } else if (activeTheme === 'modular_typo') {
      ctx.strokeStyle = isLight ? 'rgba(20,20,19,0.06)' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < LOGICAL_W; x += 56) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, LOGICAL_H); ctx.stroke();
      }
      for (let y = 0; y < LOGICAL_H; y += 56) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_W, y); ctx.stroke();
      }
    } else if (activeTheme === 'utilitarian') {
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.07)' : 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < LOGICAL_W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, LOGICAL_H); ctx.stroke();
      }
      for (let y = 0; y < LOGICAL_H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_W, y); ctx.stroke();
      }
    } else if (activeTheme === 'memphis') {
      ctx.fillStyle = isLight ? 'rgba(29, 24, 41, 0.14)' : 'rgba(255, 248, 231, 0.12)';
      for (let x = 20; x < LOGICAL_W; x += 32) {
        for (let y = 20; y < LOGICAL_H; y += 32) {
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (activeTheme === 'pixel_art') {
      ctx.strokeStyle = isLight ? 'rgba(29, 27, 47, 0.07)' : 'rgba(123, 223, 242, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < LOGICAL_W; x += 16) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, LOGICAL_H); ctx.stroke();
      }
      for (let y = 0; y < LOGICAL_H; y += 16) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_W, y); ctx.stroke();
      }
    } else if (activeTheme === 'aurora') {
      const g1 = ctx.createRadialGradient(220, 140, 10, 220, 140, 360);
      g1.addColorStop(0, isLight ? 'rgba(56, 189, 248, 0.16)' : 'rgba(56, 189, 248, 0.12)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      const g2 = ctx.createRadialGradient(860, 480, 10, 860, 480, 400);
      g2.addColorStop(0, isLight ? 'rgba(168, 85, 247, 0.14)' : 'rgba(168, 85, 247, 0.12)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    }
    ctx.restore();

    // 3. Draw 4 Subsystem Stage Lanes
    const lanes = [
      { x: 14, y: 12, w: 462, h: 318, label: 'STAGE I // OBSERVATION & BIPARTITE GRAPH', tag: '15 Hz Outer Tick' },
      { x: 492, y: 12, w: 614, h: 318, label: 'STAGE II // TITANS MEMORY, COCONUT & SOFT-MOE', tag: 'Persistent State + Routing' },
      { x: 14, y: 344, w: 690, h: 320, label: 'STAGE III // FSQ SKILL BOTTLENECK & 60 HZ SUBTICK CONTROL', tag: 'Closed-Loop 4x Subticks' },
      { x: 718, y: 344, w: 388, h: 320, label: 'STAGE IV // CRITIC, JEPA & SEARCH', tag: 'Training & Live MCTS' }
    ];

    lanes.forEach((l) => {
      ctx.save();
      if (st.laneShadow > 0) {
        ctx.fillStyle = isLight ? '#000000' : (activeTheme === 'memphis' ? '#FF5E8E' : '#000000');
        drawRoundedRect(ctx, l.x + st.laneShadow, l.y + st.laneShadow, l.w, l.h, st.laneRadius);
        ctx.fill();
      }
      ctx.fillStyle = st.laneFill;
      drawRoundedRect(ctx, l.x, l.y, l.w, l.h, st.laneRadius);
      ctx.fill();

      ctx.strokeStyle = st.laneBorder;
      ctx.lineWidth = activeTheme === 'neo_brutalism' || activeTheme === 'memphis' || activeTheme === 'pixel_art' ? 2 : 1;
      ctx.setLineDash(st.laneDash);
      drawRoundedRect(ctx, l.x, l.y, l.w, l.h, st.laneRadius);
      ctx.stroke();
      ctx.setLineDash([]);

      if (activeTheme === 'utilitarian') {
        drawCornerBrackets(ctx, l.x, l.y, l.w, l.h, 8, isLight ? '#0284C7' : '#FF9E00');
      }

      ctx.font = `700 ${activeTheme === 'pixel_art' ? '9px' : '11px'} ${st.fontMono}`;
      ctx.fillStyle = st.textHead;
      ctx.fillText(l.label, l.x + 14, l.y + 21);

      ctx.font = `500 ${activeTheme === 'pixel_art' ? '8px' : '10px'} ${st.fontMono}`;
      ctx.fillStyle = st.textSub;
      const tw = ctx.measureText(l.tag).width;
      ctx.fillText(l.tag, l.x + l.w - tw - 14, l.y + 21);
      ctx.restore();
    });

    // 4. Draw Directed Edges + Animated Signal Pulses
    edges.forEach((e) => {
      const src = nodeMap[e.from];
      const dst = nodeMap[e.to];
      if (!src || !dst) return;

      const inTour = isEdgeInTour(e.from, e.to);
      const isConnectedToSelected = selectedNodeId && (e.from === selectedNodeId || e.to === selectedNodeId);
      const isConnectedToHover = hoveredNodeId && (e.from === hoveredNodeId || e.to === hoveredNodeId);
      const layerVisible = activeLayerFilter === 'all' || e.type === activeLayerFilter || (e.type === 'core' && activeLayerFilter === 'live');

      let alpha = 0.45;
      if (!layerVisible || !inTour) alpha = 0.08;
      else if (isConnectedToSelected || isConnectedToHover) alpha = 0.98;

      const { p1, p2, horiz } = computeEdgeAnchor(src, dst);
      const stageCol = getStageColor(src.stage);

      ctx.save();
      ctx.beginPath();
      if (horiz) {
        const midX = (p1.x + p2.x) / 2;
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(midX, p1.y, midX, p2.y, p2.x, p2.y);
      } else {
        const midY = (p1.y + p2.y) / 2;
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(p1.x, midY, p2.x, midY, p2.x, p2.y);
      }

      ctx.strokeStyle = stageCol;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = isConnectedToSelected || isConnectedToHover ? 2.8 : 1.7;
      if (e.dashed) ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (layerVisible && inTour && (isConnectedToSelected || isConnectedToHover || activeLayerFilter !== 'all')) {
        const t = ((animTick * 0.012) + (e.from.length * 0.17)) % 1;
        let px, py;
        if (horiz) {
          const midX = (p1.x + p2.x) / 2;
          const u = 1 - t;
          px = u * u * u * p1.x + 3 * u * u * t * midX + 3 * u * t * t * midX + t * t * t * p2.x;
          py = u * u * u * p1.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p2.y;
        } else {
          const midY = (p1.y + p2.y) / 2;
          const u = 1 - t;
          px = u * u * u * p1.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p2.x;
          py = u * u * u * p1.y + 3 * u * u * t * midY + 3 * u * t * t * midY + t * t * t * p2.y;
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = stageCol;
        if (activeTheme === 'pixel_art' || activeTheme === 'neo_brutalism' || activeTheme === 'utilitarian') {
          ctx.fillRect(px - 3.5, py - 3.5, 7, 7);
        } else {
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    });

    // 5. Draw Subsystem Blocks
    nodes.forEach((n) => {
      const isSelected = n.id === selectedNodeId;
      const isHovered = n.id === hoveredNodeId;
      const inTour = isNodeInTour(n.id);
      const layerMatch =
        activeLayerFilter === 'all' ||
        n.layer === activeLayerFilter ||
        (activeLayerFilter === 'live' && n.layer === 'core') ||
        (activeLayerFilter === 'train' && n.id === 'backbone');

      const dimmed = !inTour || !layerMatch;
      const stageCol = getStageColor(n.stage);

      ctx.save();
      ctx.globalAlpha = dimmed ? 0.22 : 1.0;

      // Hard Offset Shadow for Brutalism / Memphis / Pixel Art
      if (activeTheme === 'neo_brutalism' || activeTheme === 'memphis' || activeTheme === 'pixel_art') {
        const sh = isSelected ? 5 : isHovered ? 4 : 3;
        ctx.fillStyle = isSelected ? stageCol : isLight ? '#000000' : '#000000';
        drawRoundedRect(ctx, n.x + sh, n.y + sh, n.w, n.h, st.nodeRadius);
        ctx.fill();
      } else if (isSelected || isHovered) {
        ctx.shadowColor = stageCol;
        ctx.shadowBlur = isSelected ? 18 : 10;
      }

      // Node Body Fill
      ctx.fillStyle = st.nodeBg;
      drawRoundedRect(ctx, n.x, n.y, n.w, n.h, st.nodeRadius);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Selected Tint Overlay
      if (isSelected) {
        ctx.save();
        ctx.fillStyle = stageCol;
        ctx.globalAlpha = dimmed ? 0.05 : isLight ? 0.10 : 0.14;
        drawRoundedRect(ctx, n.x, n.y, n.w, n.h, st.nodeRadius);
        ctx.fill();
        ctx.restore();
      }

      // Top Stage Color Bar
      ctx.save();
      drawRoundedRect(ctx, n.x, n.y, n.w, n.h, st.nodeRadius);
      ctx.clip();
      ctx.fillStyle = stageCol;
      ctx.fillRect(n.x, n.y, n.w, isSelected ? 7 : 5);
      ctx.restore();

      // Node Border
      ctx.strokeStyle = isSelected || isHovered ? stageCol : st.laneBorder;
      ctx.lineWidth = isSelected ? 2.6 : isHovered ? 2.0 : activeTheme === 'neo_brutalism' || activeTheme === 'memphis' ? 2.0 : 1.2;
      drawRoundedRect(ctx, n.x, n.y, n.w, n.h, st.nodeRadius);
      ctx.stroke();

      if (activeTheme === 'utilitarian' && (isSelected || isHovered)) {
        drawCornerBrackets(ctx, n.x - 2, n.y - 2, n.w + 4, n.h + 4, 6, stageCol);
      }

      // Strict Interior Clipping so text never overflows node boundaries
      ctx.save();
      drawRoundedRect(ctx, n.x + 2, n.y + 6, n.w - 4, n.h - 8, Math.max(0, st.nodeRadius - 2));
      ctx.clip();

      const padX = 11;
      const maxTextW = n.w - padX * 2;

      // 1. Badge Pill (Top-Left)
      ctx.font = `700 ${activeTheme === 'pixel_art' ? '8px' : '9.5px'} ${st.fontMono}`;
      ctx.fillStyle = stageCol;
      drawFittedText(
        ctx,
        n.badge,
        n.x + padX,
        n.y + 21,
        maxTextW,
        activeTheme === 'pixel_art' ? 8 : 9.5,
        7.5,
        '700',
        st.fontMono
      );

      // 2. Fitted Node Title
      ctx.fillStyle = st.textHead;
      const baseTitleSz = activeTheme === 'pixel_art' ? 10 : 13;
      drawFittedText(
        ctx,
        n.title,
        n.x + padX,
        n.y + 40,
        maxTextW,
        baseTitleSz,
        9.5,
        '700',
        st.fontHead
      );

      // 3. Multi-Line Wrapped Subtitle
      ctx.fillStyle = st.textSub;
      const subSz = activeTheme === 'pixel_art' ? 8 : 10.5;
      ctx.font = `500 ${subSz}px ${st.fontHead}`;
      const availSubH = n.h - 56;
      const lineH = activeTheme === 'pixel_art' ? 12 : 14;
      const maxLines = Math.max(1, Math.min(3, Math.floor(availSubH / lineH)));
      drawWrappedSub(ctx, n.sub, n.x + padX, n.y + 57, maxTextW, lineH, maxLines);

      ctx.restore();
      ctx.restore();
    });
  }

  window.ArashikageCanvasRenderer = {
    LOGICAL_W,
    LOGICAL_H,
    fitDiagramAspectRatio,
    getNodeAtCanvasCoords,
    renderCanvas
  };
})();
