// ============================================================================
// ARASHIKAGE (HEX64) — BESPOKE 6-THEME × 2-POLARITY CANVAS RENDERER (1120 x 680)
// ============================================================================
(function () {
  const BASE_W = 1120;
  const BASE_H = 680;

  const colHeaders = [
    { col: 0, x: 96,  title: 'STAGE 1 // RUST OBS',      sub: '5,376B Slice · C2v',       color: '#38bdf8' },
    { col: 1, x: 282, title: 'STAGE 2 // BIPARTITE',     sub: '16×64 Graph · DiffAttn',   color: '#22d3ee' },
    { col: 2, x: 468, title: 'STAGE 3 // TITANS MEM',    sub: '2×4×32×32 FP32 Fast W',    color: '#a78bfa' },
    { col: 3, x: 654, title: 'STAGE 4 // COCONUT & MOE', sub: 'K=4..6 Loop · 8×2 MoE',    color: '#f472b6' },
    { col: 4, x: 840, title: 'STAGE 5 // 60HZ CONTROL',  sub: 'Binary + Flow-GRPO SDE',   color: '#fbbf24' },
    { col: 5, x: 1024, title: 'STAGE 6 // CRITIC & RL',  sub: '4×51 Symlog · JEPA · G=8', color: '#34d399' }
  ];

  // Compute sRGB relative luminance (WCAG 2.1) and return high-contrast ink color
  function getRelativeLuminance(hexColor) {
    if (!hexColor || typeof hexColor !== 'string') return 0.5;
    let hex = hexColor.replace('#', '').trim();
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length < 6) return 0.5;
    const r8 = parseInt(hex.slice(0, 2), 16) / 255;
    const g8 = parseInt(hex.slice(2, 4), 16) / 255;
    const b8 = parseInt(hex.slice(4, 6), 16) / 255;
    const toLin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLin(r8) + 0.7152 * toLin(g8) + 0.0722 * toLin(b8);
  }

  // Exact WCAG 2.1 4.5:1 crossover against #ffffff (L = 0.179)
  function getContrastInk(hexColor, darkInk, lightInk) {
    const lum = getRelativeLuminance(hexColor);
    return lum > 0.179 ? (darkInk || '#111111') : (lightInk || '#ffffff');
  }

  function drawRoundedRect(c, x, y, w, h, r) {
    if (r <= 0) {
      c.beginPath();
      c.rect(x, y, w, h);
      c.closePath();
      return;
    }
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  function drawCornerBrackets(c, x, y, w, h, len, color) {
    c.strokeStyle = color;
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(x, y + len); c.lineTo(x, y); c.lineTo(x + len, y);
    c.moveTo(x + w - len, y); c.lineTo(x + w, y); c.lineTo(x + w, y + len);
    c.moveTo(x, y + h - len); c.lineTo(x, y + h); c.lineTo(x + len, y + h);
    c.moveTo(x + w - len, y + h); c.lineTo(x + w, y + h); c.lineTo(x + w, y + h - len);
    c.stroke();
  }

  // Chamfered 45° clipped-corner octagon for Cyberpunk Neural Deck
  function drawChamferedRect(c, x, y, w, h, cut) {
    c.beginPath();
    c.moveTo(x + 2, y);
    c.lineTo(x + w - cut, y);
    c.lineTo(x + w, y + cut);
    c.lineTo(x + w, y + h - 2);
    c.lineTo(x + cut, y + h);
    c.lineTo(x, y + h - cut);
    c.lineTo(x, y + 2);
    c.closePath();
  }

  // Asymmetric botanical leaf capsule (rBig on TL/BR, rSmall on TR/BL) for Solarpunk
  function drawLeafRect(c, x, y, w, h, rBig, rSmall) {
    c.beginPath();
    c.moveTo(x + rBig, y);
    c.lineTo(x + w - rSmall, y);
    c.quadraticCurveTo(x + w, y, x + w, y + rSmall);
    c.lineTo(x + w, y + h - rBig);
    c.quadraticCurveTo(x + w, y + h, x + w - rBig, y + h);
    c.lineTo(x + rSmall, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - rSmall);
    c.lineTo(x, y + rBig);
    c.quadraticCurveTo(x, y, x + rBig, y);
    c.closePath();
  }

  // Architectural dimension extension ticks (|---|) for Blueprint Cyanotype
  function drawDimensionTicks(c, x, y, w, h, ext, color) {
    c.strokeStyle = color;
    c.lineWidth = 1.1;
    c.beginPath();
    // Top-left overshoot
    c.moveTo(x - ext, y); c.lineTo(x + ext, y);
    c.moveTo(x, y - ext); c.lineTo(x, y + ext);
    // Top-right overshoot
    c.moveTo(x + w - ext, y); c.lineTo(x + w + ext, y);
    c.moveTo(x + w, y - ext); c.lineTo(x + w, y + ext);
    // Bottom-left overshoot
    c.moveTo(x - ext, y + h); c.lineTo(x + ext, y + h);
    c.moveTo(x, y + h - ext); c.lineTo(x, y + h + ext);
    // Bottom-right overshoot
    c.moveTo(x + w - ext, y + h); c.lineTo(x + w + ext, y + h);
    c.moveTo(x + w, y + h - ext); c.lineTo(x + w, y + h + ext);
    c.stroke();
  }

  // Stepped Art Deco Ziggurat corner inlays + double pinstripe
  function drawDecoFrame(c, x, y, w, h, color) {
    c.strokeStyle = color;
    c.lineWidth = 1.1;
    c.strokeRect(x + 3, y + 3, w - 6, h - 6);
    const s = 6;
    c.fillStyle = color;
    c.fillRect(x, y, s, 2); c.fillRect(x, y, 2, s);
    c.fillRect(x + w - s, y, s, 2); c.fillRect(x + w - 2, y, 2, s);
    c.fillRect(x, y + h - 2, s, 2); c.fillRect(x, y + h - s, 2, s);
    c.fillRect(x + w - s, y + h - 2, s, 2); c.fillRect(x + w - 2, y + h - s, 2, s);
  }

  // Proportional font-size step-down when text exceeds maxW (zero horizontal glyph squishing)
  function drawFittedText(c, text, x, y, maxW) {
    if (!text) return;
    if (!maxW) {
      c.fillText(text, x, y);
      return;
    }
    const measured = c.measureText(text).width;
    if (measured <= maxW) {
      c.fillText(text, x, y);
      return;
    }
    const origFont = c.font;
    const match = origFont.match(/(\d+(?:\.\d+)?)px/);
    if (match) {
      const origPx = parseFloat(match[1]);
      const scaledPx = Math.max(8, Math.floor(origPx * (maxW / measured) * 2) / 2);
      c.font = origFont.replace(match[0], scaledPx + 'px');
      c.fillText(text, x, y);
      c.font = origFont;
    } else {
      c.fillText(text, x, y);
    }
  }

  function drawWrappedSub(c, text, x, y, maxW, lineH) {
    if (!text) return;
    if (c.measureText(text).width <= maxW) {
      c.fillText(text, x, y);
      return;
    }
    const parts = text.split(' ');
    let line1 = '';
    let line2 = '';
    for (let i = 0; i < parts.length; i++) {
      const test = line1 ? (line1 + ' ' + parts[i]) : parts[i];
      if (c.measureText(test).width <= maxW || !line1) {
        line1 = test;
      } else {
        line2 = parts.slice(i).join(' ');
        break;
      }
    }
    drawFittedText(c, line1, x, y, maxW);
    if (line2) {
      drawFittedText(c, line2, x, y + lineH, maxW);
    }
  }

  // Enforce strict 1120:680 aspect ratio on #canvasAspectBox inside #canvasWrapper
  function fitDiagramAspectRatio(canvasWrapper, canvasAspectBox, canvas) {
    if (!canvasWrapper || !canvasAspectBox || !canvas) return false;
    const rect = canvasWrapper.getBoundingClientRect();
    const padX = 12;
    const padY = 12;
    const availW = Math.max(360, rect.width - padX);
    const availH = Math.max(240, rect.height - padY);
    const targetRatio = BASE_W / BASE_H;

    let boxW = availW;
    let boxH = boxW / targetRatio;
    if (boxH > availH) {
      boxH = availH;
      boxW = boxH * targetRatio;
    }

    const cssW = Math.floor(boxW);
    const cssH = Math.floor(boxH);
    canvasAspectBox.style.width = cssW + 'px';
    canvasAspectBox.style.height = cssH + 'px';

    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.max(600, Math.round(cssW * dpr));
    const targetH = Math.max(360, Math.round(cssH * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      return true;
    }
    return false;
  }

  function applyStagePaletteToNodes(nodes, stageColors, customHeaders) {
    if (Array.isArray(customHeaders) && customHeaders.length === colHeaders.length) {
      customHeaders.forEach((srcH, idx) => {
        colHeaders[idx].title = srcH.title;
        colHeaders[idx].sub = srcH.sub;
      });
    }
    colHeaders.forEach((ch, idx) => {
      ch.color = stageColors[idx % stageColors.length];
    });
    nodes.forEach((n) => {
      n.color = stageColors[n.col % stageColors.length];
    });
  }

  function getNodeAtCanvasCoords(canvas, clientX, clientY, nodes) {
    const rect = canvas.getBoundingClientRect();
    const cx = (clientX - rect.left) * (BASE_W / rect.width);
    const cy = (clientY - rect.top) * (BASE_H / rect.height);
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (
        cx >= n.x - n.w / 2 &&
        cx <= n.x + n.w / 2 &&
        cy >= n.y - n.h / 2 &&
        cy <= n.y + n.h / 2
      ) {
        return n;
      }
    }
    return null;
  }

  function getStageHeaderAtCanvasCoords(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const cx = (clientX - rect.left) * (BASE_W / rect.width);
    const cy = (clientY - rect.top) * (BASE_H / rect.height);
    if (cy < 10 || cy > 65) return null;
    for (let i = 0; i < colHeaders.length; i++) {
      const ch = colHeaders[i];
      const laneW = 172;
      if (cx >= ch.x - laneW / 2 && cx <= ch.x + laneW / 2) {
        return i;
      }
    }
    return null;
  }

  // Test if a pill centered at (cx, cy) of size (tw, th) intersects any node box or swimlane header
  function overlapsNodeOrHeader(cx, cy, tw, th, nodes) {
    if (cy - th / 2 < 65 || cy + th / 2 > 654) return true;
    const hw = tw / 2 + 3;
    const hh = th / 2 + 3;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (
        Math.abs(cx - n.x) < hw + n.w / 2 &&
        Math.abs(cy - n.y) < hh + n.h / 2
      ) {
        return true;
      }
    }
    return false;
  }

  function overlapsPlacedPill(cx, cy, tw, th, placed) {
    const hw = tw / 2 + 3;
    const hh = th / 2 + 2;
    for (let i = 0; i < placed.length; i++) {
      const p = placed[i];
      if (
        Math.abs(cx - p.x) < hw + p.w / 2 &&
        Math.abs(cy - p.y) < hh + p.h / 2
      ) {
        return true;
      }
    }
    return false;
  }

  // Deterministic collision-free edge label placement solver
  function resolveEdgeLabelPosition(lbl, tw, th, nodes, placed) {
    const candidates = [];
    // 1. Primary wire anchor
    candidates.push({ x: lbl.x, y: lbl.y });

    // 2. Vertical corridor scan at lbl.x (above/below overlapping node rows)
    const scanOffsets = [-18, 18, -32, 32, -46, 46, -62, 62, -78, 78, -94, 94];
    for (let i = 0; i < scanOffsets.length; i++) {
      candidates.push({ x: lbl.x, y: lbl.y + scanOffsets[i] });
    }

    // 3. Open inter-node gaps in source or target column (guaranteed 162px wide clear lane)
    if (lbl.n1 && lbl.n2) {
      const n1Top = Math.round(lbl.n1.y - lbl.n1.h / 2 - 12);
      const n1Bot = Math.round(lbl.n1.y + lbl.n1.h / 2 + 12);
      const n2Top = Math.round(lbl.n2.y - lbl.n2.h / 2 - 12);
      const n2Bot = Math.round(lbl.n2.y + lbl.n2.h / 2 + 12);

      candidates.push({ x: lbl.n2.x, y: n2Top });
      candidates.push({ x: lbl.n2.x, y: n2Bot });
      candidates.push({ x: lbl.n1.x, y: n1Bot });
      candidates.push({ x: lbl.n1.x, y: n1Top });

      // Shifted left/right inside source/target column gaps
      candidates.push({ x: lbl.n2.x - 24, y: n2Top });
      candidates.push({ x: lbl.n2.x + 24, y: n2Top });
      candidates.push({ x: lbl.n2.x - 24, y: n2Bot });
      candidates.push({ x: lbl.n2.x + 24, y: n2Bot });
      candidates.push({ x: lbl.n1.x - 24, y: n1Bot });
      candidates.push({ x: lbl.n1.x + 24, y: n1Bot });
      candidates.push({ x: lbl.n1.x - 24, y: n1Top });
      candidates.push({ x: lbl.n1.x + 24, y: n1Top });
    }

    // 4. Global clear horizontal corridors at lbl.x
    const corridors = [78, 195, 223, 285, 335, 368, 475, 505, 615, 636];
    for (let i = 0; i < corridors.length; i++) {
      candidates.push({ x: lbl.x, y: corridors[i] });
    }

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (
        !overlapsNodeOrHeader(c.x, c.y, tw, th, nodes) &&
        !overlapsPlacedPill(c.x, c.y, tw, th, placed)
      ) {
        return c;
      }
    }

    // Fallback: scan y in steps of 14 along lbl.x or n2.x
    for (let y = 76; y <= 640; y += 14) {
      if (
        !overlapsNodeOrHeader(lbl.x, y, tw, th, nodes) &&
        !overlapsPlacedPill(lbl.x, y, tw, th, placed)
      ) {
        return { x: lbl.x, y };
      }
      if (
        lbl.n2 &&
        !overlapsNodeOrHeader(lbl.n2.x, y, tw, th, nodes) &&
        !overlapsPlacedPill(lbl.n2.x, y, tw, th, placed)
      ) {
        return { x: lbl.n2.x, y };
      }
    }

    return { x: lbl.x, y: lbl.y };
  }

  function renderCanvas(ctx, canvas, state) {
    const {
      nodes,
      edges,
      nodeMap,
      activeTheme,
      activePolarity,
      activeMode,
      selectedNodeId,
      hoveredNodeId,
      hoveredStageCol,
      highlightSet,
      tourFocusNodeId,
      tourStepBadgeText,
      animTick
    } = state;

    const scaleX = canvas.width / BASE_W;
    const scaleY = canvas.height / BASE_H;
    ctx.save();
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    ctx.clearRect(0, 0, BASE_W, BASE_H);

    const isLight = activePolarity === 'light';

    // ====================================================================
    // 1. THEME + POLARITY SPECIFIC BACKGROUND FIELD
    // ====================================================================
    if (activeTheme === 'arashikage_monolith') {
      // Arashikage Monolith (嵐影 · 銀座碑文): Stratum 0 Mounting Ground + Stratum 1 Scroll Canvas + Stepped Ziggurat Frame + Kentō Marks
      ctx.fillStyle = isLight ? '#ebe5d9' : '#0a0908';
      ctx.fillRect(0, 0, BASE_W, BASE_H);

      ctx.fillStyle = isLight ? '#f4efe6' : '#171412';
      ctx.fillRect(6, 6, BASE_W - 12, BASE_H - 12);

      // Subtle 1px horizontal incised ledger rules (--am-rule)
      ctx.strokeStyle = isLight ? 'rgba(28, 25, 23, 0.055)' : 'rgba(216, 208, 197, 0.042)';
      ctx.lineWidth = 1;
      for (let gy = 68; gy < BASE_H - 8; gy += 36) {
        ctx.beginPath(); ctx.moveTo(8, gy); ctx.lineTo(BASE_W - 8, gy); ctx.stroke();
      }

      // Low-opacity Sumi-e typographic watermark (嵐影 · ䷿)
      ctx.save();
      ctx.font = '900 104px "Noto Serif JP", serif';
      ctx.fillStyle = isLight ? 'rgba(28, 25, 23, 0.028)' : 'rgba(244, 239, 230, 0.026)';
      ctx.textAlign = 'right';
      ctx.fillText('嵐影 · ䷿', BASE_W - 26, BASE_H - 28);
      ctx.restore();

      // Stepped Art Deco Ziggurat Outer Frame (1px outer rule + 4px ground moat + 1.5px primary monolith outline)
      ctx.strokeStyle = isLight ? '#cfc7b8' : '#36302a';
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 2, BASE_W - 4, BASE_H - 4);
      ctx.strokeStyle = isLight ? '#1c1917' : '#d8d0c5';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(6, 6, BASE_W - 12, BASE_H - 12);

      // Woodblock Kentō (見当) corner registration notches in Shu-iro Vermilion
      const kentoCol = isLight ? '#b81d13' : '#d4261d';
      drawCornerBrackets(ctx, 6, 6, BASE_W - 12, BASE_H - 12, 12, kentoCol);
    } else if (activeTheme === 'neo_brutalism') {
      ctx.fillStyle = isLight ? '#f3efe6' : '#111113';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.fillStyle = isLight ? 'rgba(17, 17, 17, 0.16)' : 'rgba(250, 250, 250, 0.12)';
      for (let gx = 20; gx < BASE_W; gx += 24) {
        for (let gy = 20; gy < BASE_H; gy += 24) {
          ctx.fillRect(gx, gy, 2, 2);
        }
      }
    } else if (activeTheme === 'modular_typo') {
      ctx.fillStyle = isLight ? '#f7f6f2' : '#0c0c0e';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.strokeStyle = isLight ? 'rgba(24, 24, 27, 0.08)' : 'rgba(250, 250, 250, 0.07)';
      ctx.lineWidth = 1;
      for (let gy = 68; gy < BASE_H; gy += 20) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(BASE_W, gy); ctx.stroke();
      }
    } else if (activeTheme === 'utilitarian') {
      ctx.fillStyle = isLight ? '#e2e7ec' : '#0a0c0e';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.20)' : 'rgba(148, 163, 184, 0.16)';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < BASE_W; gx += 56) {
        for (let gy = 40; gy < BASE_H; gy += 56) {
          ctx.beginPath();
          ctx.moveTo(gx - 3, gy); ctx.lineTo(gx + 3, gy);
          ctx.moveTo(gx, gy - 3); ctx.lineTo(gx, gy + 3);
          ctx.stroke();
        }
      }
    } else if (activeTheme === 'memphis') {
      ctx.fillStyle = isLight ? '#fff7d6' : '#14112b';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.fillStyle = isLight ? 'rgba(30, 27, 75, 0.12)' : 'rgba(56, 189, 248, 0.14)';
      for (let gx = 24; gx < BASE_W; gx += 32) {
        for (let gy = 24; gy < BASE_H; gy += 32) {
          ctx.beginPath(); ctx.arc(gx, gy, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (activeTheme === 'pixel_art') {
      ctx.fillStyle = isLight ? '#d8d4c4' : '#0c061a';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.fillStyle = isLight ? 'rgba(35, 31, 51, 0.035)' : 'rgba(0, 255, 204, 0.03)';
      for (let gy = 0; gy < BASE_H; gy += 4) {
        ctx.fillRect(0, gy, BASE_W, 2);
      }
      ctx.fillStyle = isLight ? 'rgba(35, 31, 51, 0.16)' : 'rgba(129, 140, 248, 0.16)';
      for (let gx = 32; gx < BASE_W; gx += 64) {
        for (let gy = 32; gy < BASE_H; gy += 64) {
          ctx.fillRect(gx, gy, 3, 3);
        }
      }
    } else if (activeTheme === 'bauhaus') {
      // Bauhaus Constructivism: Weimar Vellum / Dessau Charcoal + Diagonal Cross-Axes & Geometric Watermarks
      ctx.fillStyle = isLight ? '#f4efe4' : '#141416';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.strokeStyle = isLight ? 'rgba(22, 22, 22, 0.07)' : 'rgba(245, 242, 235, 0.06)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= BASE_W; gx += 186) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, BASE_H); ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(190, 560, 88, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(920, 120); ctx.lineTo(1030, 290); ctx.lineTo(810, 290); ctx.closePath();
      ctx.stroke();
    } else if (activeTheme === 'blueprint') {
      // Architectural Blueprint & White-Line Cyanotype: Double-Frequency Engineering Millimeter Grid
      ctx.fillStyle = isLight ? '#eef3f9' : '#071932';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.strokeStyle = isLight ? 'rgba(30, 64, 175, 0.08)' : 'rgba(56, 189, 248, 0.09)';
      ctx.lineWidth = 0.8;
      for (let gx = 16; gx < BASE_W; gx += 16) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, BASE_H); ctx.stroke();
      }
      for (let gy = 16; gy < BASE_H; gy += 16) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(BASE_W, gy); ctx.stroke();
      }
      ctx.strokeStyle = isLight ? 'rgba(30, 64, 175, 0.19)' : 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 1.1;
      for (let gx = 80; gx < BASE_W; gx += 80) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, BASE_H); ctx.stroke();
      }
      for (let gy = 80; gy < BASE_H; gy += 80) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(BASE_W, gy); ctx.stroke();
      }
      ctx.strokeStyle = isLight ? 'rgba(15, 41, 74, 0.45)' : 'rgba(186, 230, 253, 0.40)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, 4, BASE_W - 8, BASE_H - 8);
    } else if (activeTheme === 'braun_industrial') {
      // Dieter Rams Snow-White & Apollo DSKY Console: Anodized Instrument Chassis
      ctx.fillStyle = isLight ? '#e6e4de' : '#171715';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.fillStyle = isLight ? 'rgba(28, 25, 23, 0.10)' : 'rgba(245, 243, 237, 0.08)';
      for (let gx = 28; gx < BASE_W; gx += 28) {
        for (let gy = 28; gy < BASE_H; gy += 28) {
          ctx.beginPath(); ctx.arc(gx, gy, 1.1, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (activeTheme === 'art_deco') {
      // 1929 Art Deco Metropolis: Alabaster & Brass / Obsidian & Champagne Gold Lattice
      ctx.fillStyle = isLight ? '#f5f0e6' : '#0c0b09';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.strokeStyle = isLight ? 'rgba(154, 111, 26, 0.12)' : 'rgba(234, 179, 8, 0.11)';
      ctx.lineWidth = 1;
      for (let gx = 56; gx < BASE_W; gx += 112) {
        for (let gy = 56; gy < BASE_H; gy += 112) {
          ctx.beginPath();
          ctx.moveTo(gx, gy - 14);
          ctx.lineTo(gx + 14, gy);
          ctx.lineTo(gx, gy + 14);
          ctx.lineTo(gx - 14, gy);
          ctx.closePath();
          ctx.stroke();
        }
      }
    } else if (activeTheme === 'cyberpunk') {
      // Cyberpunk Neural Deck: Tactical HUD Grid + Scanlines
      ctx.fillStyle = isLight ? '#eaf0f6' : '#06080e';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.11)' : 'rgba(0, 240, 255, 0.09)';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < BASE_W; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, BASE_H); ctx.stroke();
      }
      for (let gy = 40; gy < BASE_H; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(BASE_W, gy); ctx.stroke();
      }
      ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.018)' : 'rgba(0, 240, 255, 0.022)';
      for (let gy = 0; gy < BASE_H; gy += 4) {
        ctx.fillRect(0, gy, BASE_W, 1.5);
      }
    } else if (activeTheme === 'solarpunk') {
      // Solarpunk Botanical: Sunlit Herbarium / Bioluminescent Canopy & Contour Rings
      ctx.fillStyle = isLight ? '#eef3e8' : '#08130d';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      const sg = ctx.createRadialGradient(560, 120, 20, 560, 280, 520);
      sg.addColorStop(0, isLight ? 'rgba(234, 179, 8, 0.14)' : 'rgba(52, 211, 153, 0.14)');
      sg.addColorStop(1, 'rgba(52, 211, 153, 0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.strokeStyle = isLight ? 'rgba(21, 128, 61, 0.10)' : 'rgba(52, 211, 153, 0.09)';
      ctx.lineWidth = 1;
      for (let r = 90; r <= 450; r += 90) {
        ctx.beginPath(); ctx.arc(180, 560, r, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(960, 140, r * 0.85, 0, Math.PI * 2); ctx.stroke();
      }
    } else {
      // Aurora (Light Pearl vs Dark Cosmic Velvet)
      ctx.fillStyle = isLight ? '#edf6ff' : '#050714';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      const g1 = ctx.createRadialGradient(220 + Math.sin(animTick) * 40, 160, 10, 220, 160, 390);
      g1.addColorStop(0, isLight ? 'rgba(15, 118, 110, 0.14)' : 'rgba(0, 245, 212, 0.18)');
      g1.addColorStop(1, 'rgba(0, 245, 212, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, BASE_W, BASE_H);

      const g2 = ctx.createRadialGradient(860 - Math.cos(animTick) * 40, 480, 10, 860, 480, 420);
      g2.addColorStop(0, isLight ? 'rgba(190, 24, 93, 0.12)' : 'rgba(241, 91, 181, 0.16)');
      g2.addColorStop(0.5, isLight ? 'rgba(109, 40, 217, 0.09)' : 'rgba(155, 93, 229, 0.10)');
      g2.addColorStop(1, 'rgba(155, 93, 229, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, BASE_W, BASE_H);
    }

    // ====================================================================
    // 2. COLUMN SWIMLANES & HEADERS (WCAG AA/AAA CONTRAST VERIFIED)
    // ====================================================================
    colHeaders.forEach((ch, idx) => {
      const laneW = 172;
      const laneX = ch.x - laneW / 2;

      if (activeTheme === 'arashikage_monolith') {
        // Arashikage Monolith Column: Stratum 2 Carved Plaque (--am-plaque) + Kanji Seal Prefix Cartouche (礎 双 戒 録 印 鎖)
        const stageKanji = ['礎', '双', '戒', '録', '印', '鎖'][idx % 6];
        const ruleCol = isLight ? '#cfc7b8' : '#36302a';
        const outlineCol = isLight ? '#1c1917' : '#d8d0c5';

        ctx.fillStyle = isLight ? 'rgba(252, 250, 246, 0.88)' : 'rgba(13, 11, 10, 0.86)';
        ctx.fillRect(laneX, 12, laneW, BASE_H - 24);
        ctx.strokeStyle = ruleCol;
        ctx.lineWidth = 1;
        ctx.strokeRect(laneX, 12, laneW, BASE_H - 24);

        // Header monolith box
        ctx.fillStyle = isLight ? '#e6dfd3' : '#211d1a';
        ctx.fillRect(laneX, 12, laneW, 50);
        ctx.fillStyle = ch.color;
        ctx.fillRect(laneX, 12, laneW, 2.5);
        ctx.strokeStyle = outlineCol;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(laneX, 12, laneW, 50);
        ctx.strokeStyle = ruleCol;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(laneX, 41); ctx.lineTo(laneX + laneW, 41); ctx.stroke();

        // Carved Kanji Seal Prefix Cartouche (Voice 4: Noto Serif JP)
        const isStage5Seal = idx === 4;
        ctx.fillStyle = isStage5Seal ? '#b81d13' : isLight ? '#ebe5d9' : '#0d0b0a';
        ctx.fillRect(laneX + 6, 17, 20, 20);
        ctx.strokeStyle = isStage5Seal ? 'rgba(251, 249, 245, 0.45)' : ch.color;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(laneX + 6, 17, 20, 20);
        ctx.font = '900 11px "Noto Serif JP", serif';
        ctx.fillStyle = isStage5Seal ? '#fbf9f5' : ch.color;
        ctx.textAlign = 'center';
        ctx.fillText(stageKanji, laneX + 16, 31);

        // Voice 1: Josefin Sans Geometric Display Header
        ctx.font = '700 9.6px "Josefin Sans", "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? '#090807' : '#fbf9f5';
        ctx.textAlign = 'left';
        drawFittedText(ctx, ch.title, laneX + 31, 31, laneW - 37);

        // Voice 3: JetBrains Mono Tabular Subtitle
        ctx.font = '600 9.3px "JetBrains Mono", "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#362f28' : '#c9c0b1';
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.sub, ch.x, 55, laneW - 14);

      } else if (activeTheme === 'neo_brutalism') {
        const borderCol = isLight ? '#111111' : '#f4f4f5';
        ctx.fillStyle = '#111111';
        ctx.fillRect(laneX + 4, 16, laneW, 48);
        ctx.fillStyle = ch.color;
        ctx.fillRect(laneX, 12, laneW, 48);
        ctx.strokeStyle = borderCol;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(laneX, 12, laneW, 48);

        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = isLight ? 'rgba(17,17,17,0.35)' : 'rgba(244,244,245,0.32)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(laneX, 66, laneW, BASE_H - 80);
        ctx.restore();

        ctx.font = '800 10.5px "Space Grotesk", "Inter", sans-serif';
        ctx.fillStyle = getContrastInk(ch.color, '#111111', '#ffffff');
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.title, ch.x, 31, laneW - 14);

        ctx.fillStyle = '#111111';
        ctx.fillRect(laneX + 8, 38, laneW - 16, 18);
        ctx.font = '700 9.8px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = '#ffffff';
        drawFittedText(ctx, ch.sub, ch.x, 51, laneW - 22);

      } else if (activeTheme === 'modular_typo') {
        const ruleCol = isLight ? '#18181b' : '#71717a';
        ctx.strokeStyle = ruleCol;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(laneX, 10, laneW, BASE_H - 20);
        ctx.fillStyle = ch.color;
        ctx.fillRect(laneX, 10, laneW, 6);

        ctx.beginPath();
        ctx.moveTo(laneX, 64);
        ctx.lineTo(laneX + laneW, 64);
        ctx.stroke();

        ctx.font = '900 17px "Inter", "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'left';
        ctx.fillText('0' + (idx + 1), laneX + 8, 38);

        ctx.font = '800 10.5px "Inter", "Helvetica Neue", sans-serif';
        ctx.fillStyle = isLight ? '#09090b' : '#fafafa';
        drawFittedText(ctx, ch.title.replace('STAGE ' + (idx + 1) + ' // ', ''), laneX + 36, 32, laneW - 44);
        ctx.font = '600 9.6px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = isLight ? '#3f3f46' : '#d4d4d8';
        drawFittedText(ctx, ch.sub, laneX + 36, 49, laneW - 44);

      } else if (activeTheme === 'utilitarian') {
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(23, 27, 32, 0.72)';
        ctx.fillRect(laneX, 14, laneW, BASE_H - 28);
        ctx.strokeStyle = isLight ? '#64748b' : '#334155';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(laneX, 14, laneW, BASE_H - 28);
        drawCornerBrackets(ctx, laneX, 14, laneW, BASE_H - 28, 8, ch.color);

        ctx.fillStyle = isLight ? '#f1f5f9' : '#111417';
        ctx.fillRect(laneX + 1, 15, laneW - 2, 46);
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(laneX, 61); ctx.lineTo(laneX + laneW, 61); ctx.stroke();

        ctx.font = '700 10px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'left';
        drawFittedText(ctx, '[' + ch.title + ']', laneX + 8, 34, laneW - 16);
        ctx.font = '500 9.5px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
        drawFittedText(ctx, ch.sub, laneX + 8, 52, laneW - 16);

      } else if (activeTheme === 'memphis') {
        const lightLanes = ['#fce7f3', '#e0f2fe', '#ede9fe', '#ffedd5', '#fef9c3', '#d1fae5'];
        const darkLanes  = ['#291738', '#152840', '#231b45', '#331d19', '#2e2914', '#122e2a'];
        const borderCol  = isLight ? '#1e1b4b' : ch.color;

        ctx.fillStyle = isLight ? '#1e1b4b' : ch.color;
        drawRoundedRect(ctx, laneX + 4, 18, laneW, BASE_H - 32, 14);
        ctx.fill();

        ctx.fillStyle = isLight ? lightLanes[idx % 6] : darkLanes[idx % 6];
        drawRoundedRect(ctx, laneX, 14, laneW, BASE_H - 32, 14);
        ctx.fill();
        ctx.strokeStyle = borderCol;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = ch.color;
        drawRoundedRect(ctx, laneX + 8, 21, laneW - 16, 25, 11);
        ctx.fill();
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '800 10px "Space Grotesk", sans-serif';
        ctx.fillStyle = getContrastInk(ch.color, '#1e1b4b', '#ffffff');
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.title, ch.x, 38, laneW - 24);
        ctx.fillStyle = isLight ? '#1e1b4b' : '#f8fafc';
        ctx.font = '700 9.6px "IBM Plex Mono", ui-monospace, monospace';
        drawFittedText(ctx, ch.sub, ch.x, 60, laneW - 18);

      } else if (activeTheme === 'pixel_art') {
        ctx.fillStyle = isLight ? '#e8e4d5' : '#140b29';
        ctx.fillRect(laneX, 14, laneW, BASE_H - 28);
        ctx.strokeStyle = isLight ? '#231f33' : '#5b4699';
        ctx.lineWidth = 2;
        ctx.strokeRect(laneX, 14, laneW, BASE_H - 28);
        ctx.strokeStyle = ch.color;
        ctx.strokeRect(laneX + 4, 18, laneW - 8, 44);

        ctx.fillStyle = ch.color;
        ctx.fillRect(laneX + 2, 16, 4, 4);
        ctx.fillRect(laneX + laneW - 6, 16, 4, 4);
        ctx.fillRect(laneX + 2, BASE_H - 20, 4, 4);
        ctx.fillRect(laneX + laneW - 6, BASE_H - 20, 4, 4);

        ctx.font = '700 8.8px "Silkscreen", "IBM Plex Mono", monospace';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.title, ch.x, 35, laneW - 16);
        ctx.font = '600 9.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#231f33' : '#c7d2fe';
        drawFittedText(ctx, ch.sub, ch.x, 53, laneW - 16);

      } else if (activeTheme === 'bauhaus') {
        // Bauhaus Constructivism: Heavy 2px ink column frame, primary geometric block + shape emblem
        const inkCol = isLight ? '#161616' : '#f5f2eb';
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(36, 36, 41, 0.72)';
        ctx.fillRect(laneX, 12, laneW, BASE_H - 24);
        ctx.fillStyle = ch.color;
        ctx.fillRect(laneX, 12, laneW, 30);
        ctx.strokeStyle = inkCol;
        ctx.lineWidth = 2;
        ctx.strokeRect(laneX, 12, laneW, BASE_H - 24);
        ctx.beginPath(); ctx.moveTo(laneX, 42); ctx.lineTo(laneX + laneW, 42); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(laneX, 62); ctx.lineTo(laneX + laneW, 62); ctx.stroke();

        // Geometric Constructivist Emblem (Circle / Triangle / Square rotating by column)
        ctx.fillStyle = getContrastInk(ch.color, '#161616', '#ffffff');
        if (idx % 3 === 0) {
          ctx.beginPath(); ctx.arc(laneX + 14, 27, 5, 0, Math.PI * 2); ctx.fill();
        } else if (idx % 3 === 1) {
          ctx.beginPath(); ctx.moveTo(laneX + 14, 21); ctx.lineTo(laneX + 20, 32); ctx.lineTo(laneX + 8, 32); ctx.closePath(); ctx.fill();
        } else {
          ctx.fillRect(laneX + 9, 22, 10, 10);
        }

        ctx.font = '800 10px "Space Grotesk", "Inter", sans-serif';
        ctx.textAlign = 'left';
        drawFittedText(ctx, ch.title, laneX + 25, 31, laneW - 31);
        ctx.font = '700 9.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = inkCol;
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.sub, ch.x, 56, laneW - 14);

      } else if (activeTheme === 'blueprint') {
        // Architectural Blueprint: Drafting title-block header with 45° diagonal hatching & dimension ticks
        const lineCol = isLight ? '#1e40af' : '#38bdf8';
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.72)' : 'rgba(16, 44, 84, 0.68)';
        ctx.fillRect(laneX, 14, laneW, BASE_H - 28);
        ctx.strokeStyle = lineCol;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(laneX, 14, laneW, BASE_H - 28);
        drawDimensionTicks(ctx, laneX, 14, laneW, 48, 5, ch.color);

        ctx.save();
        ctx.beginPath(); ctx.rect(laneX, 14, laneW, 24); ctx.clip();
        ctx.strokeStyle = ch.color + (isLight ? '28' : '33');
        ctx.lineWidth = 1;
        for (let hx = laneX - 24; hx < laneX + laneW + 24; hx += 7) {
          ctx.beginPath(); ctx.moveTo(hx, 38); ctx.lineTo(hx + 24, 14); ctx.stroke();
        }
        ctx.restore();

        ctx.beginPath(); ctx.moveTo(laneX, 38); ctx.lineTo(laneX + laneW, 38); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(laneX, 61); ctx.lineTo(laneX + laneW, 61); ctx.stroke();

        ctx.font = '700 9.8px "IBM Plex Mono", monospace';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.title, ch.x, 30, laneW - 14);
        ctx.font = '600 9.4px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#0a1f3d' : '#e0f2fe';
        drawFittedText(ctx, ch.sub, ch.x, 53, laneW - 14);

      } else if (activeTheme === 'braun_industrial') {
        // Dieter Rams / NASA Apollo: Recessed anodized hardware bay + perforated speaker-grille + LED jewel
        ctx.fillStyle = isLight ? '#f5f4f0' : '#22221f';
        drawRoundedRect(ctx, laneX, 14, laneW, BASE_H - 28, 8);
        ctx.fill();
        ctx.strokeStyle = isLight ? '#a8a29e' : '#44403c';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = isLight ? '#e7e5df' : '#191917';
        drawRoundedRect(ctx, laneX + 5, 19, laneW - 10, 42, 5);
        ctx.fill();

        // LED Indicator Jewel
        ctx.fillStyle = ch.color;
        ctx.beginPath(); ctx.arc(laneX + 15, 32, 4.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(laneX + 13.8, 30.8, 1.3, 0, Math.PI * 2); ctx.fill();

        ctx.font = '800 9.8px "Inter", "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isLight ? '#1c1917' : '#f5f3ed';
        ctx.textAlign = 'left';
        drawFittedText(ctx, ch.title, laneX + 24, 35, laneW - 34);
        ctx.font = '600 9.4px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#44403c' : '#d6d3cb';
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.sub, ch.x, 54, laneW - 20);

      } else if (activeTheme === 'art_deco') {
        // Art Deco Metropolis: Double-pinstripe brass column with stepped Ziggurat corners & diamond medallion
        const goldCol = isLight ? '#9a6f1a' : '#eab308';
        ctx.fillStyle = isLight ? 'rgba(255, 253, 248, 0.86)' : 'rgba(29, 26, 21, 0.84)';
        ctx.fillRect(laneX, 14, laneW, BASE_H - 28);
        ctx.strokeStyle = goldCol;
        ctx.lineWidth = 1.6;
        ctx.strokeRect(laneX, 14, laneW, BASE_H - 28);
        drawDecoFrame(ctx, laneX, 14, laneW, BASE_H - 28, ch.color);

        ctx.beginPath(); ctx.moveTo(laneX + 4, 60); ctx.lineTo(laneX + laneW - 4, 60); ctx.stroke();

        ctx.font = '800 10px "Space Grotesk", sans-serif';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'center';
        drawFittedText(ctx, '❖ ' + ch.title, ch.x, 34, laneW - 18);
        ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isLight ? '#3b332b' : '#e5dcc5';
        drawFittedText(ctx, ch.sub, ch.x, 52, laneW - 18);

      } else if (activeTheme === 'cyberpunk') {
        // Cyberpunk Neural Deck: Chamfered 45° tactical lane + neon left rail
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.84)' : 'rgba(17, 23, 38, 0.82)';
        drawChamferedRect(ctx, laneX, 14, laneW, BASE_H - 28, 12);
        ctx.fill();
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.fillStyle = ch.color;
        ctx.fillRect(laneX, 16, 4, 44);
        ctx.beginPath(); ctx.moveTo(laneX, 60); ctx.lineTo(laneX + laneW, 60); ctx.stroke();

        ctx.font = '800 10px "Space Grotesk", "IBM Plex Mono", sans-serif';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'left';
        drawFittedText(ctx, '// ' + ch.title, laneX + 10, 34, laneW - 18);
        ctx.font = '600 9.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#1e293b' : '#cbd5e1';
        drawFittedText(ctx, ch.sub, laneX + 10, 52, laneW - 18);

      } else if (activeTheme === 'solarpunk') {
        // Solarpunk Botanical: Asymmetric Leaf Capsule [16, 4, 16, 4] + Sunlit Crest
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(21, 43, 31, 0.80)';
        drawLeafRect(ctx, laneX, 14, laneW, BASE_H - 28, 18, 4);
        ctx.fill();
        ctx.strokeStyle = ch.color + (isLight ? 'aa' : '88');
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = ch.color;
        drawLeafRect(ctx, laneX + 12, 20, laneW - 24, 22, 10, 3);
        ctx.fill();

        ctx.font = '800 9.8px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = getContrastInk(ch.color, '#112217', '#ffffff');
        ctx.textAlign = 'center';
        drawFittedText(ctx, '❀ ' + ch.title, ch.x, 35, laneW - 30);
        ctx.font = '600 9.6px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isLight ? '#284231' : '#bbf7d0';
        drawFittedText(ctx, ch.sub, ch.x, 56, laneW - 18);

      } else {
        // Aurora
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(16, 23, 54, 0.72)';
        drawRoundedRect(ctx, laneX, 14, laneW, BASE_H - 28, 14);
        ctx.fill();
        ctx.strokeStyle = ch.color + (isLight ? '88' : '66');
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.fillStyle = ch.color;
        drawRoundedRect(ctx, laneX + 18, 21, laneW - 36, 3.5, 1.5);
        ctx.fill();

        ctx.font = '700 10px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.title, ch.x, 39, laneW - 16);
        ctx.font = '600 9.8px "Plus Jakarta Sans", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
        drawFittedText(ctx, ch.sub, ch.x, 55, laneW - 16);
      }

      // Interactive Hover Highlight Rim when hovering a Stage Column Header
      if (hoveredStageCol === idx) {
        ctx.save();
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 2.4;
        ctx.strokeRect(laneX - 1, 11, laneW + 2, 52);
        if (activeTheme === 'arashikage_monolith') {
          ctx.fillStyle = isLight ? '#1c1917' : '#f4efe6';
          ctx.fillRect(laneX + laneW - 44, 12, 43, 13);
          ctx.font = '700 8px "JetBrains Mono", "IBM Plex Mono", monospace';
          ctx.fillStyle = isLight ? '#fbf9f5' : '#12100e';
        } else {
          ctx.fillStyle = ch.color;
          ctx.fillRect(laneX + laneW - 44, 12, 43, 13);
          ctx.font = '700 8px "IBM Plex Mono", monospace';
          ctx.fillStyle = getContrastInk(ch.color, '#111111', '#ffffff');
        }
        ctx.textAlign = 'center';
        ctx.fillText('STAGE ↗', laneX + laneW - 22.5, 21.5);
        ctx.restore();
      }
    });

    // ====================================================================
    // 3. DRAW DIRECTED EDGES, DATAFLOW PULSES & CONTEXTUAL TENSOR LABELS
    // ====================================================================
    const useOrthogonalTraces =
      activeTheme === 'arashikage_monolith' ||
      activeTheme === 'utilitarian' ||
      activeTheme === 'modular_typo' ||
      activeTheme === 'pixel_art' ||
      activeTheme === 'blueprint' ||
      activeTheme === 'braun_industrial' ||
      activeTheme === 'bauhaus';

    const focusEdgeNodeId = hoveredNodeId || selectedNodeId;
    const edgeLabelsToRender = [];

    edges.forEach((e, idx) => {
      const n1 = nodeMap[e.from];
      const n2 = nodeMap[e.to];
      if (!n1 || !n2) return;

      const modeActive = e.modes.includes(activeMode);
      const tourActive = !highlightSet || (highlightSet.has(e.from) && highlightSet.has(e.to));
      const isConnectedToFocus = e.from === focusEdgeNodeId || e.to === focusEdgeNodeId;

      let alpha = isLight ? 0.48 : 0.46;
      if (!modeActive) alpha = 0.08;
      else if (highlightSet && !tourActive) alpha = 0.14;
      else if (isConnectedToFocus || (highlightSet && tourActive)) alpha = 0.96;

      const x1 = n1.x + n1.w / 2;
      const y1 = n1.y;
      const x2 = n2.x - n2.w / 2;
      const y2 = n2.y;
      const midX = Math.round((x1 + x2) / 2);

      // Clean corridor sweeps for multi-column edges so they never cut through intermediate blocks
      const isLongBottomSweep = e.from === 'priv_ctx' && e.to === 'critic_heads';
      const isLongTopSweep = Math.abs(n2.col - n1.col) > 1 && !isLongBottomSweep && y1 <= 185 && y2 <= 185;

      ctx.save();
      ctx.beginPath();
      if (e.dashed) ctx.setLineDash([5, 4]);

      if (isLongBottomSweep) {
        const sweepY = 636;
        const turnX = x2 - 12;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + 12, sweepY);
        ctx.lineTo(turnX, sweepY);
        ctx.lineTo(turnX, y2);
        ctx.lineTo(x2, y2);
      } else if (isLongTopSweep) {
        const sweepY = 82;
        const turnX1 = x1 + 10;
        const turnX2 = x2 - 10;
        ctx.moveTo(x1, y1);
        ctx.lineTo(turnX1, sweepY);
        ctx.lineTo(turnX2, sweepY);
        ctx.lineTo(x2, y2);
      } else if (n1.col === n2.col) {
        const sx = n1.x;
        const sy = n1.y + (n2.y > n1.y ? n1.h / 2 : -n1.h / 2);
        const ey = n2.y + (n2.y > n1.y ? -n2.h / 2 : n2.h / 2);
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, ey);
      } else if (useOrthogonalTraces) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(midX, y1);
        ctx.lineTo(midX, y2);
        ctx.lineTo(x2, y2);
      } else {
        const cx1 = x1 + (x2 - x1) * 0.48;
        const cx2 = x1 + (x2 - x1) * 0.52;
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(cx1, y1, cx2, y2, x2, y2);
      }

      if (activeTheme === 'arashikage_monolith') {
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'square';
        ctx.strokeStyle = isConnectedToFocus
          ? n1.color
          : isLight
          ? 'rgba(54, 47, 40, ' + alpha + ')'
          : 'rgba(201, 192, 177, ' + alpha + ')';
        ctx.lineWidth = isConnectedToFocus || (highlightSet && tourActive) ? 2.4 : 1.5;
      } else if (isLight) {
        ctx.strokeStyle = isConnectedToFocus ? n1.color : 'rgba(24, 24, 27, ' + alpha + ')';
        ctx.lineWidth = isConnectedToFocus || (highlightSet && tourActive) ? 2.6 : 1.7;
      } else {
        ctx.strokeStyle = isConnectedToFocus ? n1.color : 'rgba(212, 212, 216, ' + alpha + ')';
        ctx.lineWidth = isConnectedToFocus || (highlightSet && tourActive) ? 2.5 : 1.6;
      }
      ctx.stroke();
      ctx.restore();

      // Queue edge label if connected to focused/hovered node (and mode-active)
      if (modeActive && e.label && isConnectedToFocus) {
        let wx, wy;
        if (isLongBottomSweep) {
          wx = Math.round((x1 + x2) / 2);
          wy = 636;
        } else if (isLongTopSweep) {
          wx = Math.round((x1 + x2) / 2);
          wy = 82;
        } else if (n1.col === n2.col) {
          const ey = n2.y + (n2.y > n1.y ? -n2.h / 2 : n2.h / 2);
          wx = n1.x;
          wy = Math.round(ey + (n2.y > n1.y ? -15 : 15));
        } else {
          wx = midX;
          wy = Math.round((y1 + y2) / 2);
        }
        edgeLabelsToRender.push({
          text: e.label,
          x: wx,
          y: wy,
          wireX: wx,
          wireY: wy,
          n1,
          n2,
          color: n1.color
        });
      }

      if (modeActive && (!highlightSet || tourActive)) {
        const t = (animTick + idx * 0.17) % 1.0;
        let px, py;
        if (isLongBottomSweep) {
          const sweepY = 636;
          const turnX = x2 - 12;
          if (t < 0.65) {
            const st = t / 0.65;
            px = (x1 + 12) + (turnX - (x1 + 12)) * st;
            py = sweepY;
          } else {
            const st = (t - 0.65) / 0.35;
            px = turnX;
            py = sweepY + (y2 - sweepY) * st;
          }
        } else if (isLongTopSweep) {
          const sweepY = 82;
          const turnX1 = x1 + 10;
          const turnX2 = x2 - 10;
          px = turnX1 + (turnX2 - turnX1) * t;
          py = sweepY;
        } else if (n1.col === n2.col) {
          const sx = n1.x;
          const sy = n1.y + (n2.y > n1.y ? n1.h / 2 : -n1.h / 2);
          const ey = n2.y + (n2.y > n1.y ? -n2.h / 2 : n2.h / 2);
          px = sx;
          py = sy + (ey - sy) * t;
        } else if (useOrthogonalTraces) {
          if (t < 0.35) {
            const st = t / 0.35;
            px = x1 + (midX - x1) * st;
            py = y1;
          } else if (t < 0.65) {
            const st = (t - 0.35) / 0.30;
            px = midX;
            py = y1 + (y2 - y1) * st;
          } else {
            const st = (t - 0.65) / 0.35;
            px = midX + (x2 - midX) * st;
            py = y2;
          }
        } else {
          const cx1 = x1 + (x2 - x1) * 0.48;
          const cx2 = x1 + (x2 - x1) * 0.52;
          const mt = 1 - t;
          px = mt * mt * mt * x1 + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * x2;
          py = mt * mt * mt * y1 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y2;
        }

        ctx.fillStyle = n1.color;
        if (activeTheme === 'arashikage_monolith') {
          const sz = isConnectedToFocus ? 6 : 4.5;
          const kx = Math.round(px - sz / 2);
          const ky = Math.round(py - sz / 2);
          ctx.fillRect(kx, ky, sz, sz);
          if (isConnectedToFocus) {
            ctx.strokeStyle = isLight ? '#1c1917' : '#fbf9f5';
            ctx.lineWidth = 1;
            ctx.strokeRect(kx - 0.5, ky - 0.5, sz + 1, sz + 1);
          }
        } else if (
          activeTheme === 'pixel_art' ||
          activeTheme === 'utilitarian' ||
          activeTheme === 'neo_brutalism' ||
          activeTheme === 'modular_typo' ||
          activeTheme === 'bauhaus' ||
          activeTheme === 'blueprint'
        ) {
          const sz = isConnectedToFocus ? 6 : 4;
          ctx.fillRect(Math.round(px - sz / 2), Math.round(py - sz / 2), sz, sz);
        } else if (activeTheme === 'art_deco' || activeTheme === 'cyberpunk') {
          // Diamond data packet (◆)
          const r = isConnectedToFocus ? 4.5 : 3.2;
          ctx.beginPath();
          ctx.moveTo(px, py - r);
          ctx.lineTo(px + r, py);
          ctx.lineTo(px, py + r);
          ctx.lineTo(px - r, py);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, isConnectedToFocus ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // ====================================================================
    // 4. DRAW 17 SUBSYSTEM BLOCKS (LUMINANCE-VERIFIED CONTRAST & ZERO OVERFLOW)
    // ====================================================================
    nodes.forEach((n) => {
      const rx = n.x - n.w / 2;
      const ry = n.y - n.h / 2;
      const innerW = n.w - 16;
      const isSelected = n.id === selectedNodeId;
      const isHovered = n.id === hoveredNodeId;
      const isTourFocus = n.id === tourFocusNodeId;
      const modeActive = n.modes.includes(activeMode);
      const showTourBadgeInHeader = Boolean((isTourFocus && tourStepBadgeText) || !modeActive);
      const inTourSpotlight = !highlightSet || highlightSet.has(n.id);

      ctx.save();
      if (!modeActive) ctx.globalAlpha = isSelected ? 0.78 : 0.38;
      else if (!inTourSpotlight) ctx.globalAlpha = 0.28;
      else ctx.globalAlpha = 1.0;

      if (activeTheme === 'arashikage_monolith') {
        // Arashikage Monolith Node (90/10 Pigment Law):
        // - Unselected (90%): Incised 1px Stratum 2 mineral plaque (--am-plaque) + 3px left stage spine + unified --am-ink-strong title
        // - Selected (10%): Stepped Ziggurat frame + Inverted Monolith Header (.am-slab-primary) + Square Carved Shu-iro Hanko Stamp (#b81d13)
        const ruleCol = isLight ? '#cfc7b8' : '#36302a';
        const outlineCol = isLight ? '#1c1917' : '#d8d0c5';

        if (isSelected) {
          // Stepped Ziggurat outer Kentō frame around selected monolith
          ctx.fillStyle = isLight ? '#ebe5d9' : '#0a0908';
          ctx.fillRect(rx - 3, ry - 3, n.w + 6, n.h + 6);
          ctx.strokeStyle = isLight ? '#b81d13' : '#d4261d';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(rx - 4, ry - 4, n.w + 8, n.h + 8);
        }

        ctx.fillStyle = isLight
          ? isSelected ? '#fcfaf6' : isHovered ? '#f4efe6' : '#fcfaf6'
          : isSelected ? '#171412' : isHovered ? '#211d1a' : '#0d0b0a';
        ctx.fillRect(rx, ry, n.w, n.h);

        if (isSelected) {
          // Inverted Monolith Header Slab (.am-slab-primary)
          ctx.fillStyle = isLight ? '#1c1917' : '#f4efe6';
          ctx.fillRect(rx, ry, n.w, 25);

          // 1:1 Square Carved Shu-iro Vermilion Hanko Stamp (#b81d13, 25x25px) on left of header
          ctx.fillStyle = '#b81d13';
          ctx.fillRect(rx, ry, 25, 25);
          ctx.strokeStyle = 'rgba(251, 249, 245, 0.45)';
          ctx.lineWidth = 1;
          ctx.strokeRect(rx + 2.5, ry + 2.5, 20, 20);

          // Left vertical Shu-iro Vermilion spine below header
          ctx.fillStyle = '#b81d13';
          ctx.fillRect(rx, ry + 25, 3.5, n.h - 25);

          ctx.strokeStyle = outlineCol;
          ctx.lineWidth = 1.8;
          ctx.strokeRect(rx, ry, n.w, n.h);
          ctx.beginPath(); ctx.moveTo(rx, ry + 25); ctx.lineTo(rx + n.w, ry + 25); ctx.stroke();

          ctx.font = '700 9.6px "JetBrains Mono", "IBM Plex Mono", monospace';
          ctx.fillStyle = '#fbf9f5';
          ctx.textAlign = 'center';
          ctx.fillText(n.num, rx + 12.5, ry + 16.5);

          if (!showTourBadgeInHeader) {
            ctx.font = '700 9.1px "JetBrains Mono", "IBM Plex Mono", monospace';
            ctx.fillStyle = isLight ? '#fbf9f5' : '#12100e';
            ctx.textAlign = 'right';
            drawFittedText(ctx, n.tag.toUpperCase(), rx + n.w - 7, ry + 16.5, innerW - 28);
          }
        } else {
          // Subtle header band + 3px left stage mineral chisel spine
          ctx.fillStyle = isLight ? '#f4efe6' : '#151210';
          ctx.fillRect(rx, ry, n.w, 24);
          ctx.fillStyle = n.color;
          ctx.fillRect(rx, ry, 3, n.h);

          ctx.strokeStyle = isHovered ? outlineCol : ruleCol;
          ctx.lineWidth = isHovered ? 1.5 : 1.1;
          ctx.strokeRect(rx, ry, n.w, n.h);
          ctx.strokeStyle = ruleCol;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(rx, ry + 24); ctx.lineTo(rx + n.w, ry + 24); ctx.stroke();

          ctx.font = '700 9.5px "JetBrains Mono", "IBM Plex Mono", monospace';
          ctx.fillStyle = n.color;
          ctx.textAlign = 'left';
          ctx.fillText('#' + n.num, rx + 8, ry + 16);

          if (!showTourBadgeInHeader) {
            ctx.font = '600 9.1px "JetBrains Mono", "IBM Plex Mono", monospace';
            ctx.fillStyle = isLight ? '#615548' : '#9e9384';
            ctx.textAlign = 'right';
            drawFittedText(ctx, n.tag.toUpperCase(), rx + n.w - 7, ry + 16, innerW - 30);
          }
        }

        // Voice 1: Josefin Sans Geometric Display Title in Unified --am-ink-strong (Anti-Rainbow Law)
        ctx.font = '700 12px "Josefin Sans", "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? '#090807' : '#fbf9f5';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 9, ry + 46, innerW - 2);

        // Voice 2: IBM Plex Sans Editorial Subtitle in --am-ink-secondary
        ctx.font = '500 10px "IBM Plex Sans", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#362f28' : '#c9c0b1';
        drawWrappedSub(ctx, n.sub, rx + 9, ry + 65, innerW - 2, 13.5);

      } else if (activeTheme === 'neo_brutalism') {
        const shOff = isSelected ? 6 : 4;
        ctx.fillStyle = isLight ? '#111111' : n.color;
        ctx.fillRect(rx + shOff, ry + shOff, n.w, n.h);

        ctx.fillStyle = isLight
          ? isSelected ? '#fffbeb' : '#ffffff'
          : isSelected ? '#2c2820' : '#202026';
        ctx.fillRect(rx, ry, n.w, n.h);

        ctx.fillStyle = n.color;
        ctx.fillRect(rx, ry, n.w, 25);

        const borderCol = isLight ? '#111111' : '#f4f4f5';
        ctx.strokeStyle = isSelected ? (isLight ? '#ff4d00' : '#ffffff') : borderCol;
        ctx.lineWidth = isSelected ? 3.2 : 2.2;
        ctx.strokeRect(rx, ry, n.w, n.h);
        ctx.strokeStyle = borderCol;
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(rx, ry + 25); ctx.lineTo(rx + n.w, ry + 25); ctx.stroke();

        ctx.font = '700 9.8px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = getContrastInk(n.color, '#111111', '#ffffff');
        ctx.textAlign = 'left';
        drawFittedText(
          ctx,
          showTourBadgeInHeader ? '#' + n.num : '#' + n.num + ' // ' + n.tag,
          rx + 8,
          ry + 17,
          showTourBadgeInHeader ? 42 : innerW
        );

        ctx.font = '800 12.2px "Space Grotesk", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#111111' : '#fafafa';
        drawFittedText(ctx, n.title, rx + 8, ry + 47, innerW);

        ctx.font = '600 10.2px "Space Grotesk", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#3f3f46' : '#d4d4d8';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 66, innerW, 13.5);

      } else if (activeTheme === 'modular_typo') {
        ctx.fillStyle = isLight
          ? isSelected ? '#fff5f2' : '#ffffff'
          : isSelected ? '#281d1b' : '#18181d';
        ctx.fillRect(rx, ry, n.w, n.h);

        const topBarCol = isSelected ? '#c81e00' : n.color;
        ctx.fillStyle = topBarCol;
        ctx.fillRect(rx, ry, n.w, isSelected ? 7 : 4);

        ctx.strokeStyle = isSelected ? (isLight ? '#09090b' : '#ffffff') : isLight ? '#18181b' : '#71717a';
        ctx.lineWidth = isSelected ? 2.4 : 1.3;
        ctx.strokeRect(rx, ry, n.w, n.h);

        if (isSelected) {
          ctx.strokeStyle = '#c81e00';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(rx - 3, ry - 3, n.w + 6, n.h + 6);
        }

        ctx.strokeStyle = isLight ? 'rgba(9, 9, 11, 0.22)' : 'rgba(244, 244, 245, 0.20)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, ry + 26); ctx.lineTo(rx + n.w, ry + 26);
        ctx.stroke();

        if (isSelected) {
          ctx.fillStyle = '#c81e00';
          ctx.fillRect(rx + 6, ry + 8, 22, 15);
          ctx.font = '800 9.6px "Inter", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(n.num, rx + 17, ry + 19);
        } else {
          ctx.font = '800 10.2px "Inter", "Helvetica Neue", sans-serif';
          ctx.fillStyle = n.color;
          ctx.textAlign = 'left';
          ctx.fillText(n.num, rx + 8, ry + 20);
        }

        if (!showTourBadgeInHeader) {
          ctx.font = '600 9.6px "IBM Plex Mono", ui-monospace, monospace';
          ctx.fillStyle = isLight ? '#52525b' : '#d4d4d8';
          ctx.textAlign = 'right';
          drawFittedText(ctx, n.tag.toUpperCase(), rx + n.w - 8, ry + 20, innerW - 28);
        }

        ctx.font = '800 12.2px "Inter", "Helvetica Neue", sans-serif';
        ctx.fillStyle = isLight ? '#09090b' : '#fafafa';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 8, ry + 48, innerW);

        ctx.font = '500 10.2px "Inter", "Helvetica Neue", sans-serif';
        ctx.fillStyle = isLight ? '#3f3f46' : '#d4d4d8';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 67, innerW, 13.5);

      } else if (activeTheme === 'utilitarian') {
        ctx.fillStyle = isLight
          ? isSelected ? '#fffbeb' : isHovered ? '#f1f5f9' : '#ffffff'
          : isSelected ? '#1e2630' : isHovered ? '#1a2026' : '#14181d';
        ctx.fillRect(rx, ry, n.w, n.h);

        ctx.strokeStyle = isSelected ? n.color : isLight ? '#64748b' : '#334155';
        ctx.lineWidth = isSelected ? 2.2 : 1.2;
        ctx.strokeRect(rx, ry, n.w, n.h);

        drawCornerBrackets(ctx, rx, ry, n.w, n.h, 6, isSelected ? (isLight ? '#0f172a' : '#ffffff') : n.color);

        ctx.fillStyle = isLight ? '#e2e8f0' : '#0d1013';
        ctx.fillRect(rx + 1, ry + 1, n.w - 2, 22);
        ctx.font = '700 9.5px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = n.color;
        ctx.textAlign = 'left';
        ctx.fillText('ID:' + n.num, rx + 8, ry + 16);
        if (!showTourBadgeInHeader) {
          ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
          ctx.textAlign = 'right';
          drawFittedText(ctx, n.tag, rx + n.w - 8, ry + 16, innerW - 38);
        }

        ctx.font = '700 11.8px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 8, ry + 45, innerW);

        ctx.font = '500 9.8px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = isLight ? '#334155' : '#94a3b8';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 64, innerW, 13.5);

      } else if (activeTheme === 'memphis') {
        ctx.fillStyle = isSelected ? (isLight ? '#db2777' : '#facc15') : n.color;
        drawRoundedRect(ctx, rx + 5, ry + 5, n.w, n.h, 13);
        ctx.fill();

        ctx.fillStyle = isLight
          ? isSelected ? '#fef08a' : '#ffffff'
          : isSelected ? '#3b2466' : '#251e47';
        drawRoundedRect(ctx, rx, ry, n.w, n.h, 13);
        ctx.fill();

        ctx.strokeStyle = isLight ? '#1e1b4b' : (isSelected ? '#facc15' : n.color);
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(rx + 18, ry + 19, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '700 9.6px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = getContrastInk(n.color, '#1e1b4b', '#ffffff');
        ctx.textAlign = 'center';
        ctx.fillText(n.num, rx + 18, ry + 23);

        if (!showTourBadgeInHeader) {
          ctx.fillStyle = isLight ? '#1e1b4b' : '#e0e7ff';
          ctx.textAlign = 'right';
          drawFittedText(ctx, n.tag, rx + n.w - 10, ry + 23, innerW - 28);
        }

        ctx.font = '800 12.2px "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? '#1e1b4b' : '#ffffff';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 10, ry + 48, n.w - 20);

        ctx.font = '600 10.2px "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? '#312e81' : '#c7d2fe';
        drawWrappedSub(ctx, n.sub, rx + 10, ry + 66, n.w - 20, 13.5);

      } else if (activeTheme === 'pixel_art') {
        ctx.fillStyle = isLight ? '#231f33' : '#05020a';
        ctx.fillRect(rx + 5, ry + 5, n.w, n.h);

        ctx.fillStyle = isLight
          ? isSelected ? '#fffbeb' : '#f4f1e6'
          : isSelected ? '#2e1d59' : '#1e123b';
        ctx.fillRect(rx, ry, n.w, n.h);

        ctx.strokeStyle = isSelected
          ? isLight ? '#d90429' : '#ffe600'
          : isLight ? '#231f33' : n.color;
        ctx.lineWidth = isSelected ? 2.5 : 2;
        ctx.strokeRect(rx, ry, n.w, n.h);

        ctx.fillStyle = n.color;
        ctx.fillRect(rx + 2, ry + 2, n.w - 4, 21);

        ctx.font = '700 9px "Silkscreen", "IBM Plex Mono", monospace';
        ctx.fillStyle = getContrastInk(n.color, '#161324', '#ffffff');
        ctx.textAlign = 'left';
        drawFittedText(
          ctx,
          showTourBadgeInHeader ? '[' + n.num + ']' : '[' + n.num + '] ' + n.tag,
          rx + 6,
          ry + 16,
          showTourBadgeInHeader ? 42 : innerW
        );

        ctx.font = '700 11.4px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#161324' : '#ffffff';
        drawFittedText(ctx, n.title, rx + 8, ry + 44, innerW);

        ctx.font = '600 9.8px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#352f4f' : '#c7d2fe';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 63, innerW, 13.5);

      } else if (activeTheme === 'bauhaus') {
        // Bauhaus Constructivism Node: Primary geometric offset block + shape emblem in header
        const inkCol = isLight ? '#161616' : '#f5f2eb';
        const shOff = isSelected ? 6 : 4;
        ctx.fillStyle = isSelected ? '#d92b2b' : n.color;
        ctx.fillRect(rx + shOff, ry + shOff, n.w, n.h);

        ctx.fillStyle = isLight
          ? isSelected ? '#fff9eb' : '#ffffff'
          : isSelected ? '#2e2b24' : '#222227';
        ctx.fillRect(rx, ry, n.w, n.h);

        // Constructivist left color block in header
        ctx.fillStyle = n.color;
        ctx.fillRect(rx, ry, 34, 24);
        ctx.strokeStyle = inkCol;
        ctx.lineWidth = isSelected ? 2.6 : 2;
        ctx.strokeRect(rx, ry, n.w, n.h);
        ctx.beginPath(); ctx.moveTo(rx, ry + 24); ctx.lineTo(rx + n.w, ry + 24); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx + 34, ry); ctx.lineTo(rx + 34, ry + 24); ctx.stroke();

        ctx.font = '800 9.8px "Space Grotesk", "Inter", sans-serif';
        ctx.fillStyle = getContrastInk(n.color, '#161616', '#ffffff');
        ctx.textAlign = 'center';
        ctx.fillText(n.num, rx + 17, ry + 16);

        if (!showTourBadgeInHeader) {
          ctx.font = '700 9.4px "IBM Plex Mono", monospace';
          ctx.fillStyle = inkCol;
          ctx.textAlign = 'left';
          drawFittedText(ctx, n.tag.toUpperCase(), rx + 40, ry + 16, innerW - 34);
        }

        ctx.font = '800 12.2px "Space Grotesk", "Inter", sans-serif';
        ctx.fillStyle = inkCol;
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 8, ry + 46, innerW);

        ctx.font = '600 10.1px "Space Grotesk", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#3f3b37' : '#d6d3cd';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 65, innerW, 13.5);

      } else if (activeTheme === 'blueprint') {
        // Architectural Blueprint Node: Dimension overshoot ticks (|---|) & 45° diagonal hatched header
        ctx.fillStyle = isLight
          ? isSelected ? '#eff6ff' : '#ffffff'
          : isSelected ? '#173d73' : '#102c54';
        ctx.fillRect(rx, ry, n.w, n.h);

        ctx.save();
        ctx.beginPath(); ctx.rect(rx, ry, n.w, 22); ctx.clip();
        ctx.strokeStyle = n.color + (isLight ? '30' : '38');
        ctx.lineWidth = 1;
        for (let hx = rx - 22; hx < rx + n.w + 22; hx += 6) {
          ctx.beginPath(); ctx.moveTo(hx, ry + 22); ctx.lineTo(hx + 22, ry); ctx.stroke();
        }
        ctx.restore();

        const strokeCol = isSelected ? (isLight ? '#dc2626' : '#fbbf24') : (isLight ? '#1e40af' : '#38bdf8');
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = isSelected ? 2.2 : 1.4;
        ctx.strokeRect(rx, ry, n.w, n.h);
        ctx.beginPath(); ctx.moveTo(rx, ry + 22); ctx.lineTo(rx + n.w, ry + 22); ctx.stroke();

        drawDimensionTicks(ctx, rx, ry, n.w, n.h, 4.5, isSelected ? strokeCol : n.color);

        ctx.font = '700 9.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = n.color;
        ctx.textAlign = 'left';
        ctx.fillText('DWG-' + n.num, rx + 7, ry + 15);
        if (!showTourBadgeInHeader) {
          ctx.fillStyle = isLight ? '#1e3a5f' : '#bae6fd';
          ctx.textAlign = 'right';
          drawFittedText(ctx, n.tag, rx + n.w - 7, ry + 15, innerW - 44);
        }

        ctx.font = '700 11.8px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#0a1f3d' : '#f0f7ff';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 8, ry + 45, innerW);

        ctx.font = '500 9.8px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#1e3a5f' : '#bae6fd';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 64, innerW, 13.5);

      } else if (activeTheme === 'braun_industrial') {
        // Dieter Rams / Apollo DSKY Hardware Module: Recessed bezel + glowing LED indicator jewel
        ctx.fillStyle = isLight
          ? isSelected ? '#fff7ed' : '#faf9f5'
          : isSelected ? '#36342d' : '#292925';
        drawRoundedRect(ctx, rx, ry, n.w, n.h, 8);
        ctx.fill();

        ctx.strokeStyle = isSelected ? (isLight ? '#ea580c' : '#f97316') : (isLight ? '#a8a29e' : '#57534e');
        ctx.lineWidth = isSelected ? 2.4 : 1.5;
        ctx.stroke();

        // Inner recessed instrument bezel
        ctx.strokeStyle = isLight ? 'rgba(28, 25, 23, 0.14)' : 'rgba(255, 255, 255, 0.10)';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, rx + 3, ry + 3, n.w - 6, n.h - 6, 5);
        ctx.stroke();

        // Circular LED Jewel Indicator
        ctx.fillStyle = n.color;
        ctx.beginPath(); ctx.arc(rx + 14, ry + 16, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(rx + 12.6, ry + 14.6, 1.4, 0, Math.PI * 2); ctx.fill();

        ctx.font = '700 9.6px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#1c1917' : '#f5f3ed';
        ctx.textAlign = 'left';
        ctx.fillText('CH ' + n.num, rx + 23, ry + 19);

        if (!showTourBadgeInHeader) {
          ctx.fillStyle = isLight ? '#57534e' : '#d6d3cb';
          ctx.textAlign = 'right';
          drawFittedText(ctx, n.tag, rx + n.w - 9, ry + 19, innerW - 44);
        }

        ctx.font = '700 12px "Inter", "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isLight ? '#1c1917' : '#f5f3ed';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 10, ry + 46, n.w - 20);

        ctx.font = '500 10px "Inter", "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isLight ? '#3f3b37' : '#d6d3cb';
        drawWrappedSub(ctx, n.sub, rx + 10, ry + 65, n.w - 20, 13.5);

      } else if (activeTheme === 'art_deco') {
        // Art Deco Metropolis Node: Stepped Ziggurat corner inlays + double brass pinstripe + diamond crest
        ctx.fillStyle = isLight
          ? isSelected ? '#fef9e7' : '#ffffff'
          : isSelected ? '#2b2418' : '#1d1a15';
        ctx.fillRect(rx, ry, n.w, n.h);

        const brassCol = isSelected ? (isLight ? '#b45309' : '#facc15') : n.color;
        ctx.strokeStyle = brassCol;
        ctx.lineWidth = isSelected ? 2.4 : 1.6;
        ctx.strokeRect(rx, ry, n.w, n.h);
        drawDecoFrame(ctx, rx, ry, n.w, n.h, brassCol);

        ctx.beginPath(); ctx.moveTo(rx + 4, ry + 24); ctx.lineTo(rx + n.w - 4, ry + 24); ctx.stroke();

        ctx.font = '800 9.6px "Space Grotesk", sans-serif';
        ctx.fillStyle = n.color;
        ctx.textAlign = 'left';
        ctx.fillText('❖ ' + n.num, rx + 8, ry + 17);

        if (!showTourBadgeInHeader) {
          ctx.fillStyle = isLight ? '#3b332b' : '#e5dcc5';
          ctx.textAlign = 'right';
          drawFittedText(ctx, n.tag.toUpperCase(), rx + n.w - 8, ry + 17, innerW - 36);
        }

        ctx.font = '800 12px "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? '#171412' : '#f7f3e8';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 9, ry + 46, innerW - 2);

        ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isLight ? '#3b332b' : '#e5dcc5';
        drawWrappedSub(ctx, n.sub, rx + 9, ry + 65, innerW - 2, 13.5);

      } else if (activeTheme === 'cyberpunk') {
        // Cyberpunk Neural Deck Node: Chamfered 45° clipped corners + neon left bar + HUD telemetry tag
        if (isSelected && !isLight) {
          ctx.shadowColor = n.color;
          ctx.shadowBlur = 14;
        }
        ctx.fillStyle = isLight
          ? isSelected ? '#fff0f5' : '#ffffff'
          : isSelected ? '#1a243b' : '#111726';
        drawChamferedRect(ctx, rx, ry, n.w, n.h, 11);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = isSelected ? (isLight ? '#e11d48' : '#facc15') : n.color;
        ctx.lineWidth = isSelected ? 2.4 : 1.5;
        ctx.stroke();

        // Neon left vertical bar
        ctx.fillStyle = n.color;
        ctx.fillRect(rx + 1, ry + 2, 4.5, n.h - 13);

        ctx.font = '700 9.6px "IBM Plex Mono", monospace';
        ctx.fillStyle = n.color;
        ctx.textAlign = 'left';
        ctx.fillText('SYS//' + n.num, rx + 10, ry + 18);

        if (!showTourBadgeInHeader) {
          ctx.fillStyle = isLight ? '#1e293b' : '#cbd5e1';
          ctx.textAlign = 'right';
          drawFittedText(ctx, n.tag, rx + n.w - 12, ry + 18, innerW - 44);
        }

        ctx.font = '800 12px "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? '#090d16' : '#f8fafc';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 10, ry + 45, n.w - 18);

        ctx.font = '500 10px "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? '#334155' : '#94a3b8';
        drawWrappedSub(ctx, n.sub, rx + 10, ry + 64, n.w - 18, 13.5);

      } else if (activeTheme === 'solarpunk') {
        // Solarpunk Botanical Node: Asymmetric Leaf Capsule [16, 4, 16, 4] + Seed Pill Badge
        ctx.fillStyle = isLight
          ? isSelected ? '#f0fdf4' : '#ffffff'
          : isSelected ? '#1d3b2a' : '#152b1f';
        drawLeafRect(ctx, rx, ry, n.w, n.h, 16, 4);
        ctx.fill();

        ctx.strokeStyle = isSelected ? n.color : n.color + (isLight ? 'aa' : '88');
        ctx.lineWidth = isSelected ? 2.4 : 1.5;
        ctx.stroke();

        ctx.fillStyle = n.color;
        drawLeafRect(ctx, rx + 7, ry + 7, 26, 16, 8, 2);
        ctx.fill();

        ctx.font = '700 9.4px "IBM Plex Mono", monospace';
        ctx.fillStyle = getContrastInk(n.color, '#112217', '#ffffff');
        ctx.textAlign = 'center';
        ctx.fillText(n.num, rx + 20, ry + 19);

        if (!showTourBadgeInHeader) {
          ctx.fillStyle = isLight ? '#284231' : '#bbf7d0';
          ctx.textAlign = 'right';
          drawFittedText(ctx, n.tag, rx + n.w - 9, ry + 19, innerW - 34);
        }

        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isLight ? '#112217' : '#ecfdf5';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 10, ry + 46, n.w - 20);

        ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isLight ? '#284231' : '#bbf7d0';
        drawWrappedSub(ctx, n.sub, rx + 10, ry + 65, n.w - 20, 13.5);

      } else {
        // Aurora (Light Pearl vs Dark Velvet)
        if (isSelected || (highlightSet && highlightSet.has(n.id))) {
          ctx.shadowColor = n.color;
          ctx.shadowBlur = isSelected ? 18 : 10;
        }
        ctx.fillStyle = isLight
          ? isSelected ? '#f0f9ff' : '#ffffff'
          : isSelected ? '#19234d' : isHovered ? '#141d40' : '#0e1530';
        drawRoundedRect(ctx, rx, ry, n.w, n.h, 13);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = isSelected ? 2.4 : 1.4;
        ctx.strokeStyle = isSelected ? n.color : n.color + (isLight ? '99' : '77');
        ctx.stroke();

        ctx.fillStyle = n.color;
        drawRoundedRect(ctx, rx + 5, ry + 10, 4, n.h - 20, 2);
        ctx.fill();

        ctx.font = '700 9.8px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = n.color;
        ctx.textAlign = 'left';
        ctx.fillText('#' + n.num, rx + 14, ry + 22);

        if (!showTourBadgeInHeader) {
          ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
          ctx.textAlign = 'right';
          drawFittedText(ctx, n.tag, rx + n.w - 10, ry + 22, innerW - 30);
        }

        ctx.font = '700 12.2px "Plus Jakarta Sans", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 14, ry + 47, n.w - 22);

        ctx.font = '500 10.2px "Plus Jakarta Sans", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#334155' : '#94a3b8';
        drawWrappedSub(ctx, n.sub, rx + 14, ry + 66, n.w - 22, 13.5);
      }

      // Guided Tour Focus Callout Ring (Silhouette-Matched) & In-Bounds Header Badge
      if (isTourFocus) {
        const pulse = 2 + Math.sin(animTick * 4) * 1.5;
        const fx = rx - pulse - 2;
        const fy = ry - pulse - 2;
        const fw = n.w + (pulse + 2) * 2;
        const fh = n.h + (pulse + 2) * 2;
        ctx.save();
        ctx.strokeStyle = isLight ? '#111111' : '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 3]);
        if (activeTheme === 'cyberpunk') {
          drawChamferedRect(ctx, fx, fy, fw, fh, 13);
          ctx.stroke();
        } else if (activeTheme === 'solarpunk') {
          drawLeafRect(ctx, fx, fy, fw, fh, 18, 5);
          ctx.stroke();
        } else if (activeTheme === 'memphis' || activeTheme === 'aurora') {
          drawRoundedRect(ctx, fx, fy, fw, fh, 15);
          ctx.stroke();
        } else if (activeTheme === 'braun_industrial') {
          drawRoundedRect(ctx, fx, fy, fw, fh, 10);
          ctx.stroke();
        } else {
          ctx.strokeRect(fx, fy, fw, fh);
        }
        ctx.restore();

        if (tourStepBadgeText) {
          ctx.save();
          const isAm = activeTheme === 'arashikage_monolith';
          ctx.font = isAm
            ? '700 8.5px "JetBrains Mono", "IBM Plex Mono", monospace'
            : '700 9.5px "IBM Plex Mono", ui-monospace, monospace';
          const tagW = Math.ceil(ctx.measureText(tourStepBadgeText).width) + 12;
          const tagX = rx + n.w - tagW - 4;
          const tagY = ry + 5;
          ctx.fillStyle = isAm ? '#b81d13' : isLight ? '#111111' : '#ffffff';
          ctx.fillRect(tagX, tagY, tagW, 15);
          ctx.strokeStyle = isAm ? 'rgba(251, 249, 245, 0.5)' : n.color;
          ctx.lineWidth = isAm ? 1 : 1.5;
          ctx.strokeRect(tagX, tagY, tagW, 15);
          ctx.fillStyle = isAm ? '#fbf9f5' : isLight ? '#ffffff' : '#111111';
          ctx.textAlign = 'center';
          ctx.fillText(tourStepBadgeText, tagX + tagW / 2, tagY + 11);
          ctx.restore();
        }
      } else if (!modeActive && activeMode !== 'all') {
        // Explicit In-Header BYPASSED Badge when node is inactive in the selected Pathway Filter
        ctx.save();
        ctx.globalAlpha = 0.96;
        const isAm = activeTheme === 'arashikage_monolith';
        const bypassLabel = (isAm ? '戒 · ' : '') + 'BYPASSED (' + activeMode.toUpperCase() + ')';
        ctx.font = isAm
          ? '700 8px "JetBrains Mono", "IBM Plex Mono", monospace'
          : '700 8.5px "IBM Plex Mono", ui-monospace, monospace';
        const tagW = Math.ceil(ctx.measureText(bypassLabel).width) + 10;
        const tagX = rx + n.w - tagW - 4;
        const tagY = ry + 5;
        ctx.fillStyle = isAm ? (isLight ? '#ebe5d9' : '#0a0908') : isLight ? '#78350f' : '#451a03';
        ctx.fillRect(tagX, tagY, tagW, 15);
        ctx.strokeStyle = isAm ? (isLight ? '#b48a3e' : '#7a5c22') : '#f59e0b';
        ctx.lineWidth = isAm ? 1.1 : 1.4;
        ctx.strokeRect(tagX, tagY, tagW, 15);
        ctx.fillStyle = isAm ? (isLight ? '#8c5604' : '#deb052') : '#fef3c7';
        ctx.textAlign = 'center';
        ctx.fillText(bypassLabel, tagX + tagW / 2, tagY + 11);
        ctx.restore();
      }

      ctx.restore();
    });

    // ====================================================================
    // 5. DRAW COLLISION-FREE CONTEXTUAL TENSOR & LATENCY EDGE LABELS
    // ====================================================================
    if (edgeLabelsToRender.length > 0) {
      ctx.save();
      const isAm = activeTheme === 'arashikage_monolith';
      ctx.font = isAm
        ? '700 9.5px "JetBrains Mono", "IBM Plex Mono", monospace'
        : '700 9.5px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      const placed = [];

      edgeLabelsToRender.forEach((lbl) => {
        const tw = Math.ceil(ctx.measureText(lbl.text).width) + (isAm ? 13 : 10);
        const th = 15;
        const pos = resolveEdgeLabelPosition(lbl, tw, th, nodes, placed);
        placed.push({ x: pos.x, y: pos.y, w: tw, h: th });

        const bx = Math.round(pos.x - tw / 2);
        const by = Math.round(pos.y - th / 2);

        // If shifted away from wire midpoint, draw a crisp leader line & anchor mark
        const dist = Math.hypot(pos.x - lbl.wireX, pos.y - lbl.wireY);
        if (dist > 8) {
          ctx.save();
          ctx.strokeStyle = lbl.color;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(lbl.wireX, lbl.wireY);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          ctx.fillStyle = lbl.color;
          if (isAm) {
            ctx.fillRect(Math.round(lbl.wireX - 2.5), Math.round(lbl.wireY - 2.5), 5, 5);
          } else {
            ctx.beginPath();
            ctx.arc(lbl.wireX, lbl.wireY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Theme-matched Edge Tensor Label Pill
        const pillFill =
          isAm
            ? isLight ? '#fcfaf6' : '#0d0b0a'
            : activeTheme === 'blueprint'
            ? isLight ? '#f0f7ff' : '#0b2242'
            : activeTheme === 'cyberpunk'
              ? isLight ? '#ffffff' : '#0b0f19'
              : activeTheme === 'solarpunk'
                ? isLight ? '#ffffff' : '#0e1f16'
                : isLight ? '#ffffff' : '#18181b';

        if (activeTheme === 'neo_brutalism' || activeTheme === 'bauhaus') {
          ctx.fillStyle = isLight ? '#111111' : lbl.color;
          ctx.fillRect(bx + 2, by + 2, tw, th);
        }

        ctx.fillStyle = pillFill;
        ctx.strokeStyle = isAm ? (isLight ? '#1c1917' : '#d8d0c5') : lbl.color;
        ctx.lineWidth = isAm ? 1.2 : 1.5;

        if (activeTheme === 'cyberpunk') {
          drawChamferedRect(ctx, bx, by, tw, th, 4);
          ctx.fill();
          ctx.stroke();
        } else if (activeTheme === 'solarpunk') {
          drawLeafRect(ctx, bx, by, tw, th, 6, 2);
          ctx.fill();
          ctx.stroke();
        } else if (
          activeTheme === 'memphis' ||
          activeTheme === 'aurora' ||
          activeTheme === 'braun_industrial'
        ) {
          drawRoundedRect(ctx, bx, by, tw, th, 6);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(bx, by, tw, th);
          if (isAm) {
            ctx.fillStyle = lbl.color;
            ctx.fillRect(bx, by, 2.5, th);
          }
          ctx.strokeRect(bx, by, tw, th);
        }

        ctx.fillStyle = isAm ? (isLight ? '#090807' : '#fbf9f5') : isLight ? '#0f172a' : '#f8fafc';
        ctx.fillText(lbl.text, isAm ? pos.x + 1 : pos.x, by + 11);
      });
      ctx.restore();
    }

    ctx.restore();
  }

  window.ArashikageCanvasRenderer = {
    BASE_W,
    BASE_H,
    colHeaders,
    getRelativeLuminance,
    getContrastInk,
    fitDiagramAspectRatio,
    applyStagePaletteToNodes,
    getNodeAtCanvasCoords,
    getStageHeaderAtCanvasCoords,
    renderCanvas
  };
})();
