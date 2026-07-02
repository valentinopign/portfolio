export interface OrbitsHandle {
  cleanup: () => void;
}

export function initOrbits(box: HTMLElement, canvas: HTMLCanvasElement): OrbitsHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { cleanup: () => {} };

  const COL = {
    orbit: "#FF6A2B",     // Flame/Orange
    center: "#FFEDE2",    // Cream/White
    particle: "#FF8A4C",  // Bright orange
    dim: "rgba(255,109,43,0.15)", // Orange dim
  };

  let W = 0, H = 0, dpr = 1, C = 64, R = 18, cellW = 8, cellH = 12, fontPx = 12;
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
    C = Math.max(48, Math.min(120, Math.floor(W / (target * 0.6))));
    R = Math.max(16, Math.min(32, Math.floor(H / target)));
    cellW = W / C;
    cellH = H / R;
    fontPx = Math.min(cellH * 0.98, cellW / 0.6);
    if (!running) {
      drawFrame();
    }
  };

  const start = performance.now();

  function drawFrame(): boolean {
    const time = (performance.now() - start) / 1000;
    if (W < 2 || H < 2) return false;

    const N = C * R;
    const chars: string[] = new Array(N).fill(" ");
    const cols: (string | null)[] = new Array(N).fill(null);
    const id = (x: number, y: number) => y * C + x;

    const set = (x: number, y: number, ch: string, c: string) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= C || y >= R) return;
      chars[id(x, y)] = ch; cols[id(x, y)] = c;
    };

    // Background dot field
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < C; x++) {
        if (((x * 13 + y * 19) % 29) === 0) set(x, y, ".", COL.dim);
      }
    }

    const cx = Math.floor(C / 2);
    const cy = Math.floor(R / 2);

    // Draw central node representing OrbitUp / Core Book / Database
    // Center: [ORBITUP]
    const label = " ORBITUP ";
    const lHalf = Math.floor(label.length / 2);
    
    // Draw box around label
    for (let x = cx - lHalf - 1; x <= cx + lHalf + 1; x++) {
      set(x, cy - 1, "-", COL.center);
      set(x, cy + 1, "-", COL.center);
    }
    set(cx - lHalf - 1, cy, "[", COL.center);
    set(cx + lHalf + 1, cy, "]", COL.center);

    for (let i = 0; i < label.length; i++) {
      set(cx - lHalf + i, cy, label[i], COL.center);
    }

    // 3 Orbiting systems (different radii, speeds, angles of tilt)
    const orbits = [
      { rx: 11, ry: 3.5, tilt: 0.35, speed: 1.8, char: "*", color: COL.particle },
      { rx: 16, ry: 5.0, tilt: -0.5, speed: -1.3, char: "o", color: COL.orbit },
      { rx: 22, ry: 7.0, tilt: 0.15, speed: 0.9, char: "+", color: COL.particle },
    ];

    orbits.forEach((orb) => {
      // Draw ellipse traces in dim mode
      const numPoints = 80;
      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const dx = Math.cos(theta) * orb.rx;
        const dy = Math.sin(theta) * orb.ry;
        // Rotate
        const rotX = cx + dx * Math.cos(orb.tilt) - dy * Math.sin(orb.tilt);
        const rotY = cy + dx * Math.sin(orb.tilt) + dy * Math.cos(orb.tilt);
        set(rotX, rotY, ".", COL.dim);
      }

      // Draw primary orbiting particle
      const theta = time * orb.speed;
      const dx = Math.cos(theta) * orb.rx;
      const dy = Math.sin(theta) * orb.ry;
      const pX = cx + dx * Math.cos(orb.tilt) - dy * Math.sin(orb.tilt);
      const pY = cy + dx * Math.sin(orb.tilt) + dy * Math.cos(orb.tilt);
      
      // Draw tail particles (shading)
      const numTail = 4;
      for (let j = 0; j < numTail; j++) {
        const tailTheta = theta - (j * 0.15 * Math.sign(orb.speed));
        const tdx = Math.cos(tailTheta) * orb.rx;
        const tdy = Math.sin(tailTheta) * orb.ry;
        const tpX = cx + tdx * Math.cos(orb.tilt) - tdy * Math.sin(orb.tilt);
        const tpY = cy + tdx * Math.sin(orb.tilt) + tdy * Math.cos(orb.tilt);
        const tailChar = j === 0 ? orb.char : (j === 1 ? "." : "`");
        const opacity = Math.max(0.2, 1 - (j / numTail));
        set(tpX, tpY, tailChar, j === 0 ? orb.color : COL.dim);
      }
    });

    // Paint to canvas
    ctx.clearRect(0, 0, W, H);
    ctx.font = fontPx + "px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textBaseline = "top";
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < C; x++) {
        const ch = chars[id(x, y)];
        if (ch === " " || ch === undefined) continue;
        ctx.fillStyle = cols[id(x, y)] || COL.orbit;
        ctx.fillText(ch, x * cellW, y * cellH);
      }
    }
    return true;
  }

  const loop = () => {
    if (!running) return;
    if (isVisible) {
      drawFrame();
    }
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
  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(() => resize());
  }
  window.addEventListener("load", onResize, { once: true });

  running = true;
  raf = requestAnimationFrame(loop);

  return {
    cleanup() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      ro?.disconnect();
      io?.disconnect();
    },
  };
}
