export interface ConveyorHandle {
  cleanup: () => void;
}

export function initConveyor(box: HTMLElement, canvas: HTMLCanvasElement): ConveyorHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { cleanup: () => {} };

  const prefersReduced = false; // Always animate as requested

  const COL = {
    belt: "#FF6A2B",     // Flame/Orange
    roller: "#FFEDE2",   // Joint cream/White
    box: "#F2EFE8",      // Box gray/white
    detail: "#FF8A4C",   // Claw orange
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

  const start = performance.now() - 2500;

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
        if (((x * 11 + y * 17) % 23) === 0) set(x, y, ".", COL.dim);
      }
    }

    // Conveyor geometry config
    const yBeltTop = Math.round(R * 0.55);
    const yBeltBottom = yBeltTop + 4;

    // Speeds
    const speed = 10; // chars per second
    const shift = Math.floor(time * speed);

    // 1. Draw Top Track of the Belt (goes all the way from 0 to C - 1)
    for (let x = 0; x < C; x++) {
      set(x, yBeltTop - 1, "_", COL.belt);
      set(x, yBeltTop + 1, "-", COL.belt);
      
      const isDivider = (x - shift) % 4 === 0;
      set(x, yBeltTop, isDivider ? "/" : " ", COL.detail);
    }

    // 2. Draw Bottom Track of the Belt (goes all the way from 0 to C - 1)
    for (let x = 0; x < C; x++) {
      set(x, yBeltBottom, "_", COL.belt);
    }

    // 3. Draw Rotating Rollers / Gears (all small rollers across the entire screen width)
    const yRoller = yBeltTop + 2;

    // Connectors between rollers: = = =
    for (let x = 0; x < C; x++) {
      set(x, yRoller, "=", COL.dim);
    }

    const spacing = 8;
    for (let rx = 3; rx < C; rx += spacing) {
      set(rx, yRoller, "o", COL.roller);
      set(rx - 1, yRoller, "(", COL.dim);
      set(rx + 1, yRoller, ")", COL.dim);
    }

    // 4. Draw Moving Parcel Box
    const boxW = 14;
    const boxH = 5;

    // Travel bounds (completely offscreen left to completely offscreen right)
    const travelStart = -boxW;
    const travelEnd = C;
    const travelDistance = travelEnd - travelStart;

    // Speeds and timing
    const boxSpeed = 8; // columns per second
    const travelTime = travelDistance / boxSpeed; // time to cross the screen
    const waitTime = 3.0; // 3 seconds pause offscreen
    const cycleTime = travelTime + waitTime;

    const tCycle = time % cycleTime;
    const isBoxVisible = tCycle < travelTime;
    const xBox = travelStart + tCycle * boxSpeed;
    const yBox = yBeltTop + 2 - boxH; // sits on the conveyor belt track

    const drawBox = (bx: number, by: number) => {
      const bxR = Math.round(bx);
      const byR = Math.round(by);

      // Make the box opaque by filling its 3D silhouette with spaces
      // Top face
      for (let x = bxR + 2; x <= bxR + boxW; x++) set(x, byR - 2, " ", COL.box);
      for (let x = bxR + 1; x <= bxR + boxW; x++) set(x, byR - 1, " ", COL.box);
      // Front and side faces
      for (let h = 0; h < boxH - 1; h++) {
        for (let x = bxR; x <= bxR + boxW; x++) {
          set(x, byR + h, " ", COL.box);
        }
      }
      // Bottom edge of front face
      for (let x = bxR; x < bxR + boxW; x++) {
        set(x, byR + boxH - 1, " ", COL.box);
      }

      // Top isometric/3D slant face
      for (let w = 1; w < boxW - 1; w++) {
        set(bxR + w + 2, byR - 2, "-", COL.box);
        set(bxR + w + 1, byR - 1, "-", COL.box);
      }
      set(bxR + 2, byR - 2, "+", COL.box);
      set(bxR + boxW, byR - 2, "+", COL.box);
      set(bxR + 1, byR - 1, "/", COL.box);
      set(bxR + boxW - 1, byR - 1, "/", COL.box);
      set(bxR + boxW, byR - 1, "|", COL.box);

      // Front face horizontal borders
      for (let w = 1; w < boxW - 1; w++) {
        set(bxR + w, byR, "-", COL.box);
        set(bxR + w, byR + boxH - 1, "-", COL.box);
      }
      set(bxR, byR, "+", COL.box);
      set(bxR + boxW - 1, byR, "+", COL.box);
      
      // Vertical borders
      for (let h = 1; h < boxH - 1; h++) {
        set(bxR, byR + h, "|", COL.box);
        set(bxR + boxW - 1, byR + h, "|", COL.box);
        set(bxR + boxW, byR + h - 1, "|", COL.box); // side face depth
      }
      set(bxR + boxW, byR + boxH - 2, "+", COL.box);

      // Central tape details
      const tapeX = bxR + Math.floor(boxW / 2) - 1;
      set(tapeX, byR + 1, "[", COL.detail);
      set(tapeX + 1, byR + 1, "=", COL.detail);
      set(tapeX + 2, byR + 1, "]", COL.detail);
      set(tapeX, byR + 2, "\\", COL.detail);
      set(tapeX + 1, byR + 2, "v", COL.detail);
      set(tapeX + 2, byR + 2, "/", COL.detail);

      // Warning/industrial diagonal stripes at the bottom of the box front
      for (let w = 1; w < boxW - 1; w++) {
        if (w % 2 === 0) {
          set(bxR + w, byR + boxH - 2, "/", COL.detail);
        }
      }
    };

    if (isBoxVisible) {
      drawBox(xBox, yBox);
    }

    // Paint to canvas
    ctx.clearRect(0, 0, W, H);
    ctx.font = fontPx + "px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textBaseline = "top";
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < C; x++) {
        const ch = chars[id(x, y)];
        if (ch === " " || ch === undefined) continue;
        ctx.fillStyle = cols[id(x, y)] || COL.belt;
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
