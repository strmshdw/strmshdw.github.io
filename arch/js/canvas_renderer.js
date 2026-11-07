// ============================================================================
// ARASHIKAGE (HEX63) — BESPOKE 6-THEME × 2-POLARITY CANVAS RENDERER (1120 x 680)
// ============================================================================
(function () {
  const BASE_W = 1120;
  const BASE_H = 680;

  const colHeaders = [
    { col: 0, x: 96,  title: 'STAGE 1 // C++20 OBS',     sub: '5,376B Slice · C2v',       color: '#38bdf8' },
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

  function getContrastInk(hexColor, darkInk, lightInk) {
    const lum = getRelativeLuminance(hexColor);
    return lum > 0.31 ? (darkInk || '#111111') : (lightInk || '#ffffff');
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

  function drawFittedText(c, text, x, y, maxW) {
    if (!text) return;
    c.fillText(text, x, y, maxW);
  }

  function drawWrappedSub(c, text, x, y, maxW, lineH) {
    if (!text) return;
    if (c.measureText(text).width <= maxW) {
      c.fillText(text, x, y, maxW);
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
    c.fillText(line1, x, y, maxW);
    if (line2) {
      c.fillText(line2, x, y + lineH, maxW);
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
    if (activeTheme === 'neo_brutalism') {
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
      // Decorative Memphis motifs placed safely outside wire routing lanes
      ctx.save();
      ctx.strokeStyle = isLight ? 'rgba(219, 39, 119, 0.28)' : 'rgba(244, 114, 182, 0.38)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(18 + i * 11, 666 + (i % 2 === 0 ? -4 : 4));
      }
      ctx.stroke();
      ctx.strokeStyle = isLight ? 'rgba(6, 182, 212, 0.30)' : 'rgba(250, 204, 21, 0.35)';
      ctx.beginPath(); ctx.arc(1088, 656, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
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

      if (activeTheme === 'neo_brutalism') {
        const borderCol = isLight ? '#111111' : '#f4f4f5';
        ctx.fillStyle = '#111111';
        ctx.fillRect(laneX + 4, 16, laneW, 48);
        // Keep vibrant stage header fills in both Light and Dark Brutalism
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

        ctx.font = '800 11.5px "Space Grotesk", "Inter", sans-serif';
        ctx.fillStyle = getContrastInk(ch.color, '#111111', '#ffffff');
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.title, ch.x, 31, laneW - 14);

        ctx.fillStyle = '#111111';
        ctx.fillRect(laneX + 8, 38, laneW - 16, 18);
        ctx.font = '700 11px "IBM Plex Mono", ui-monospace, monospace';
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

        ctx.font = '900 19px "Inter", "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'left';
        ctx.fillText('0' + (idx + 1), laneX + 8, 38);

        ctx.font = '800 11.5px "Inter", "Helvetica Neue", sans-serif';
        ctx.fillStyle = isLight ? '#09090b' : '#fafafa';
        drawFittedText(ctx, ch.title.replace('STAGE ' + (idx + 1) + ' // ', ''), laneX + 36, 32, laneW - 44);
        ctx.font = '600 10.5px "IBM Plex Mono", ui-monospace, monospace';
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

        ctx.font = '700 11px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'left';
        drawFittedText(ctx, '[' + ch.title + ']', laneX + 8, 34, laneW - 16);
        ctx.font = '500 10.5px "IBM Plex Mono", ui-monospace, monospace';
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

        ctx.font = '800 11px "Space Grotesk", sans-serif';
        ctx.fillStyle = getContrastInk(ch.color, '#1e1b4b', '#ffffff');
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.title, ch.x, 38, laneW - 24);
        ctx.fillStyle = isLight ? '#1e1b4b' : '#f8fafc';
        ctx.font = '700 10.5px "IBM Plex Mono", ui-monospace, monospace';
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

        ctx.font = '700 10px "Silkscreen", "IBM Plex Mono", monospace';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.title, ch.x, 35, laneW - 16);
        ctx.font = '600 10.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#231f33' : '#c7d2fe';
        drawFittedText(ctx, ch.sub, ch.x, 53, laneW - 16);

      } else {
        // Aurora
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.84)' : 'rgba(16, 23, 54, 0.68)';
        drawRoundedRect(ctx, laneX, 14, laneW, BASE_H - 28, 14);
        ctx.fill();
        ctx.strokeStyle = ch.color + (isLight ? '88' : '66');
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.fillStyle = ch.color;
        drawRoundedRect(ctx, laneX + 18, 21, laneW - 36, 3.5, 1.5);
        ctx.fill();

        ctx.font = '700 11px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = ch.color;
        ctx.textAlign = 'center';
        drawFittedText(ctx, ch.title, ch.x, 39, laneW - 16);
        ctx.font = '600 11px "Plus Jakarta Sans", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
        drawFittedText(ctx, ch.sub, ch.x, 55, laneW - 16);
      }
    });

    // ====================================================================
    // 3. DRAW DIRECTED EDGES, DATAFLOW PULSES & CONTEXTUAL TENSOR LABELS
    // ====================================================================
    const useOrthogonalTraces =
      activeTheme === 'utilitarian' ||
      activeTheme === 'modular_typo' ||
      activeTheme === 'pixel_art';

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

      // Clean bottom sweep for long-span Privileged Context -> Critic edge
      const isLongBottomSweep = e.from === 'priv_ctx' && e.to === 'critic_heads';

      ctx.save();
      ctx.beginPath();
      if (e.dashed) ctx.setLineDash([5, 4]);

      if (isLongBottomSweep) {
        const sweepY = 636;
        const turnX = x2 - 12;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + 14, sweepY);
        ctx.lineTo(turnX, sweepY);
        ctx.lineTo(turnX, y2);
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

      if (isLight) {
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
        let lx, ly;
        if (isLongBottomSweep) {
          lx = Math.round((x1 + x2) / 2);
          ly = 636;
        } else if (n1.col === n2.col) {
          const ey = n2.y + (n2.y > n1.y ? -n2.h / 2 : n2.h / 2);
          lx = n1.x;
          ly = Math.round(ey + (n2.y > n1.y ? -15 : 15));
        } else {
          lx = midX;
          ly = Math.round((y1 + y2) / 2);
        }
        edgeLabelsToRender.push({
          text: e.label,
          x: lx,
          y: ly,
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
            px = (x1 + 14) + (turnX - (x1 + 14)) * st;
            py = sweepY;
          } else {
            const st = (t - 0.65) / 0.35;
            px = turnX;
            py = sweepY + (y2 - sweepY) * st;
          }
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
        if (
          activeTheme === 'pixel_art' ||
          activeTheme === 'utilitarian' ||
          activeTheme === 'neo_brutalism' ||
          activeTheme === 'modular_typo'
        ) {
          const sz = isConnectedToFocus ? 6 : 4;
          ctx.fillRect(Math.round(px - sz / 2), Math.round(py - sz / 2), sz, sz);
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
      const inTourSpotlight = !highlightSet || highlightSet.has(n.id);

      ctx.save();
      if (!modeActive) ctx.globalAlpha = 0.22;
      else if (!inTourSpotlight) ctx.globalAlpha = 0.28;
      else ctx.globalAlpha = 1.0;

      if (activeTheme === 'neo_brutalism') {
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

        ctx.font = '700 11px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = getContrastInk(n.color, '#111111', '#ffffff');
        ctx.textAlign = 'left';
        drawFittedText(ctx, '#' + n.num + ' // ' + n.tag, rx + 8, ry + 17, innerW);

        ctx.font = '800 13.5px "Space Grotesk", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#111111' : '#fafafa';
        drawFittedText(ctx, n.title, rx + 8, ry + 47, innerW);

        ctx.font = '600 11.5px "Space Grotesk", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#3f3f46' : '#d4d4d8';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 66, innerW, 14);

      } else if (activeTheme === 'modular_typo') {
        ctx.fillStyle = isLight
          ? isSelected ? '#fff5f2' : '#ffffff'
          : isSelected ? '#281d1b' : '#18181d';
        ctx.fillRect(rx, ry, n.w, n.h);

        const topBarCol = isSelected ? '#e62400' : n.color;
        ctx.fillStyle = topBarCol;
        ctx.fillRect(rx, ry, n.w, isSelected ? 7 : 4);

        ctx.strokeStyle = isSelected ? (isLight ? '#09090b' : '#ffffff') : isLight ? '#18181b' : '#71717a';
        ctx.lineWidth = isSelected ? 2.4 : 1.3;
        ctx.strokeRect(rx, ry, n.w, n.h);

        if (isSelected) {
          ctx.strokeStyle = '#e62400';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(rx - 3, ry - 3, n.w + 6, n.h + 6);
        }

        ctx.strokeStyle = isLight ? 'rgba(9, 9, 11, 0.22)' : 'rgba(244, 244, 245, 0.20)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, ry + 26); ctx.lineTo(rx + n.w, ry + 26);
        ctx.stroke();

        if (isSelected) {
          ctx.fillStyle = '#e62400';
          ctx.fillRect(rx + 6, ry + 8, 22, 15);
          ctx.font = '800 10.5px "Inter", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(n.num, rx + 17, ry + 19);
        } else {
          ctx.font = '800 11.5px "Inter", "Helvetica Neue", sans-serif';
          ctx.fillStyle = n.color;
          ctx.textAlign = 'left';
          ctx.fillText(n.num, rx + 8, ry + 20);
        }

        ctx.font = '600 10.5px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = isLight ? '#52525b' : '#d4d4d8';
        ctx.textAlign = 'right';
        drawFittedText(ctx, n.tag.toUpperCase(), rx + n.w - 8, ry + 20, innerW - 28);

        ctx.font = '800 13.5px "Inter", "Helvetica Neue", sans-serif';
        ctx.fillStyle = isLight ? '#09090b' : '#fafafa';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 8, ry + 48, innerW);

        ctx.font = '500 11.5px "Inter", "Helvetica Neue", sans-serif';
        ctx.fillStyle = isLight ? '#3f3f46' : '#d4d4d8';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 67, innerW, 14);

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
        ctx.font = '700 10.5px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = n.color;
        ctx.textAlign = 'left';
        ctx.fillText('ID:' + n.num, rx + 8, ry + 16);
        ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
        ctx.textAlign = 'right';
        drawFittedText(ctx, n.tag, rx + n.w - 8, ry + 16, innerW - 38);

        ctx.font = '700 13px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 8, ry + 45, innerW);

        ctx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = isLight ? '#334155' : '#94a3b8';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 64, innerW, 14);

      } else if (activeTheme === 'memphis') {
        // Restore per-stage color identity in both Light & Dark Memphis
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

        ctx.font = '700 10.5px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = getContrastInk(n.color, '#1e1b4b', '#ffffff');
        ctx.textAlign = 'center';
        ctx.fillText(n.num, rx + 18, ry + 23);

        ctx.fillStyle = isLight ? '#1e1b4b' : '#e0e7ff';
        ctx.textAlign = 'right';
        drawFittedText(ctx, n.tag, rx + n.w - 10, ry + 23, innerW - 28);

        ctx.font = '800 13.5px "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? '#1e1b4b' : '#ffffff';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 10, ry + 48, n.w - 20);

        ctx.font = '600 11.5px "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? '#312e81' : '#c7d2fe';
        drawWrappedSub(ctx, n.sub, rx + 10, ry + 66, n.w - 20, 14);

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

        ctx.font = '700 10px "Silkscreen", "IBM Plex Mono", monospace';
        ctx.fillStyle = getContrastInk(n.color, '#161324', '#ffffff');
        ctx.textAlign = 'left';
        drawFittedText(ctx, '[' + n.num + '] ' + n.tag, rx + 6, ry + 16, innerW);

        ctx.font = '700 12.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#161324' : '#ffffff';
        drawFittedText(ctx, n.title, rx + 8, ry + 44, innerW);

        ctx.font = '600 11px "IBM Plex Mono", monospace';
        ctx.fillStyle = isLight ? '#352f4f' : '#c7d2fe';
        drawWrappedSub(ctx, n.sub, rx + 8, ry + 63, innerW, 14);

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

        ctx.font = '700 11px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillStyle = n.color;
        ctx.textAlign = 'left';
        ctx.fillText('#' + n.num, rx + 14, ry + 22);

        ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
        ctx.textAlign = 'right';
        drawFittedText(ctx, n.tag, rx + n.w - 10, ry + 22, innerW - 30);

        ctx.font = '700 13.5px "Plus Jakarta Sans", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
        ctx.textAlign = 'left';
        drawFittedText(ctx, n.title, rx + 14, ry + 47, n.w - 22);

        ctx.font = '500 11.5px "Plus Jakarta Sans", "Inter", sans-serif';
        ctx.fillStyle = isLight ? '#334155' : '#94a3b8';
        drawWrappedSub(ctx, n.sub, rx + 14, ry + 66, n.w - 22, 14);
      }

      // Guided Tour Focus Callout Ring & Tag (Links Canvas Block to Docked HUD Bar)
      if (isTourFocus) {
        const pulse = 2 + Math.sin(animTick * 4) * 1.5;
        ctx.save();
        ctx.strokeStyle = isLight ? '#111111' : '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(rx - pulse - 2, ry - pulse - 2, n.w + (pulse + 2) * 2, n.h + (pulse + 2) * 2);
        ctx.restore();

        if (tourStepBadgeText) {
          ctx.save();
          ctx.font = '700 9.5px "IBM Plex Mono", ui-monospace, monospace';
          const tagW = Math.ceil(ctx.measureText(tourStepBadgeText).width) + 12;
          const tagX = rx + n.w - tagW;
          const tagY = ry - 15;
          ctx.fillStyle = n.color;
          ctx.fillRect(tagX, tagY, tagW, 14);
          ctx.strokeStyle = isLight ? '#111111' : '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(tagX, tagY, tagW, 14);
          ctx.fillStyle = getContrastInk(n.color, '#111111', '#ffffff');
          ctx.textAlign = 'center';
          ctx.fillText(tourStepBadgeText, tagX + tagW / 2, tagY + 10.5);
          ctx.restore();
        }
      }

      ctx.restore();
    });

    // ====================================================================
    // 5. DRAW CONTEXTUAL TENSOR & LATENCY EDGE LABELS (ON HOVER / SELECTION)
    // ====================================================================
    if (edgeLabelsToRender.length > 0) {
      ctx.save();
      ctx.font = '700 9.5px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      const placed = [];

      edgeLabelsToRender.forEach((lbl) => {
        let ly = lbl.y;
        for (let k = 0; k < placed.length; k++) {
          if (Math.abs(placed[k].x - lbl.x) < 58 && Math.abs(placed[k].y - ly) < 16) {
            ly = placed[k].y + 16;
          }
        }
        placed.push({ x: lbl.x, y: ly });

        const tw = Math.ceil(ctx.measureText(lbl.text).width) + 10;
        const th = 15;
        const bx = Math.round(lbl.x - tw / 2);
        const by = Math.round(ly - th / 2);

        ctx.fillStyle = isLight ? '#ffffff' : '#18181b';
        ctx.fillRect(bx, by, tw, th);
        ctx.strokeStyle = lbl.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, tw, th);

        ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
        ctx.fillText(lbl.text, lbl.x, by + 11);
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
    renderCanvas
  };
})();
