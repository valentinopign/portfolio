export interface LoopHandle {
  cleanup: () => void;
}

export function initAsciiLoop(box: HTMLElement, canvas: HTMLCanvasElement): LoopHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { cleanup: () => {} };

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const NODES = ["SIGNAL", "CONTEXT", "BUILD", "TEST", "DEPLOY"];
  const COL = {
    ring: "rgba(255,109,43,0.32)",
    node: "#FF6A2B",
    label: "rgba(236,234,227,0.6)",
    pulse: "#FFEDE2",
    glow: "#FF8A4C",
    dim: "rgba(255,109,43,0.12)",
  };

  let W = 0, H = 0, dpr = 1, C = 80, R = 24, cellW = 8, cellH = 12, fontPx = 12;
  let raf = 0, isVisible = true, running = false;

  const resize = () => {
    const r = box.getBoundingClientRect();
    W = r.width; H = r.height;
    if (W < 2 || H < 2) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.max(8, Math.min(13, Math.round(H / 18)));
    C = Math.max(48, Math.min(220, Math.floor(W / (target * 0.6))));
    R = Math.max(18, Math.min(70, Math.floor(H / target)));
    cellW = W / C;
    cellH = H / R;
    fontPx = Math.min(cellH * 0.98, cellW / 0.6);
  };

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const start = performance.now();

  const drawFrame = () => {
    const time = (performance.now() - start) / 1000;
    if (W < 2 || H < 2) return;

    const N = C * R;
    const chars: string[] = new Array(N).fill(" ");
    const cols: (string | null)[] = new Array(N).fill(null);
    const id = (x: number, y: number) => y * C + x;
    const set = (x: number, y: number, ch: string, c: string) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= C || y >= R) return;
      chars[id(x, y)] = ch; cols[id(x, y)] = c;
    };

    // faint background dot field (matches the arm panel)
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < C; x++) {
        if (((x * 11 + y * 17) % 23) === 0) set(x, y, ".", COL.dim);
      }
    }

    const cx = C / 2, cy = R / 2;
    const rx = C * 0.34, ry = R * 0.34;
    const n = NODES.length;
    const nodeAng = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
    const nodePos = (i: number) => ({ x: cx + Math.cos(nodeAng(i)) * rx, y: cy + Math.sin(nodeAng(i)) * ry });

    // draw the ring as a dotted ellipse
    const ringSteps = Math.max(60, Math.round((rx + ry) * 4));
    for (let i = 0; i < ringSteps; i++) {
      const a = (i / ringSteps) * Math.PI * 2;
      set(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, i % 2 ? "." : "·", COL.ring);
    }

    // travelling pulse position (loops every 5s) + trailing glow
    const period = 5;
    const head = (time % period) / period; // 0..1 around the ring
    const trail = 26;
    for (let k = 0; k < trail; k++) {
      const t = head - k / ringSteps;
      const a = t * Math.PI * 2;
      const px = cx + Math.cos(a) * rx;
      const py = cy + Math.sin(a) * ry;
      if (k === 0) set(px, py, "#", COL.pulse);
      else if (k < 6) set(px, py, "o", COL.glow);
      else set(px, py, "·", COL.ring);
    }

    // draw nodes + labels
    NODES.forEach((label, i) => {
      const p = nodePos(i);
      // node marker bracket
      set(p.x - 1, p.y, "[", COL.node);
      set(p.x + 1, p.y, "]", COL.node);
      set(p.x, p.y, (i === Math.floor(head * n) % n) ? "@" : "O", COL.node);
      // label, placed outward from center
      const outX = p.x + Math.sign(p.x - cx) * 2 + (Math.abs(p.x - cx) < 2 ? 0 : 2);
      const startX = p.x - cx >= 0 ? p.x + 3 : p.x - 3 - label.length;
      for (let c = 0; c < label.length; c++) {
        set(startX + c, p.y, label[c], COL.label);
      }
      void outX;
    });

    // center readout
    const pct = String(Math.round(head * 100)).padStart(3, " ");
    const center = `LOOP ${pct}%`;
    for (let c = 0; c < center.length; c++) {
      set(Math.round(cx - center.length / 2) + c, Math.round(cy), center[c], COL.glow);
    }
    void lerp;

    // paint
    ctx.clearRect(0, 0, W, H);
    ctx.font = fontPx + "px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textBaseline = "top";
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < C; x++) {
        const ch = chars[id(x, y)];
        if (ch === " " || ch === undefined) continue;
        ctx.fillStyle = cols[id(x, y)] || COL.node;
        ctx.fillText(ch, x * cellW, y * cellH);
      }
    }
  };

  const loop = () => {
    if (!running) return;
    if (isVisible) drawFrame();
    raf = requestAnimationFrame(loop);
  };

  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  let ro: ResizeObserver | undefined;
  if (window.ResizeObserver) { ro = new ResizeObserver(() => resize()); ro.observe(box); }

  let io: IntersectionObserver | undefined;
  if (window.IntersectionObserver) {
    io = new IntersectionObserver((e) => { isVisible = e[0]?.isIntersecting ?? true; }, { threshold: 0 });
    io.observe(box);
  }

  resize();
  if (prefersReduced) {
    drawFrame();
  } else {
    running = true;
    raf = requestAnimationFrame(loop);
  }

  return {
    cleanup() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      io?.disconnect();
    },
  };
}
