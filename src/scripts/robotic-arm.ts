export interface ArmHandle {
  cleanup: () => void;
}

export function initRoboticArm(box: HTMLElement, canvas: HTMLCanvasElement): ArmHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { cleanup: () => {} };

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, dpr = 1, C = 60, R = 30, cellW = 8, cellH = 12, fontPx = 12;
  let raf = 0;
  let isVisible = true;
  let running = false;

  const COL = {
    arm: "#FF6A2B",
    joint: "#FFEDE2",
    claw: "#FF8A4C",
    box: "#F2EFE8",
    dim: "rgba(255,109,43,0.15)",
    hud: "rgba(236,234,227,0.5)",
  };

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
    const target = Math.max(7, Math.min(12, Math.round(H / 40)));
    const cw = target * 0.6, ch = target;
    C = Math.max(48, Math.min(190, Math.floor(W / cw)));
    R = Math.max(30, Math.min(96, Math.floor(H / ch)));
    cellW = W / C;
    cellH = H / R;
    fontPx = Math.min(cellH * 0.98, cellW / 0.6);
  };

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const ss = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const clampN = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

  const start = performance.now();

  const drawFrame = () => {
    const now = performance.now();
    const time = (now - start) / 1000;
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
    const line = (x0: number, y0: number, x1: number, y1: number, ch: string, c: string) => {
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        set(lerp(x0, x1, t), lerp(y0, y1, t), ch, c);
      }
    };
    const lineAuto = (x0: number, y0: number, x1: number, y1: number, c: string) => {
      const dx = x1 - x0, dy = y1 - y0;
      const m = Math.abs(dy) / (Math.abs(dx) + 1e-6);
      let ch = "=";
      if (m < 0.45) ch = "=";
      else if (m > 2.4) ch = "|";
      else ch = (dy * dx < 0) ? "/" : "\\";
      line(x0, y0, x1, y1, ch, c);
    };
    const unit = (ax: number, ay: number, bx: number, by: number) => {
      const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1;
      return { x: dx / l, y: dy / l, l };
    };
    const housing = (x0: number, y0: number, x1: number, y1: number, w: number, edgeC: string, detail: boolean) => {
      const u = unit(x0, y0, x1, y1); const nx = -u.y, ny = u.x;
      lineAuto(x0 + nx * w, y0 + ny * w, x1 + nx * w, y1 + ny * w, edgeC);
      lineAuto(x0 - nx * w, y0 - ny * w, x1 - nx * w, y1 - ny * w, edgeC);
      lineAuto(x0 + nx * w, y0 + ny * w, x0 - nx * w, y0 - ny * w, edgeC);
      lineAuto(x1 + nx * w, y1 + ny * w, x1 - nx * w, y1 - ny * w, edgeC);
      if (detail) {
        const steps = Math.max(3, Math.round(u.l));
        for (let i = 2; i < steps - 1; i += 2) { const t = i / steps; set(x0 + u.x * u.l * t, y0 + u.y * u.l * t, ".", COL.dim); }
        set(x0 + u.x * 1.6 + nx * w * 0.55, y0 + u.y * 1.6 + ny * w * 0.55, "o", edgeC);
        set(x0 + u.x * 1.6 - nx * w * 0.55, y0 + u.y * 1.6 - ny * w * 0.55, "o", edgeC);
        set(x1 - u.x * 1.6 + nx * w * 0.55, y1 - u.y * 1.6 + ny * w * 0.55, "o", edgeC);
        set(x1 - u.x * 1.6 - nx * w * 0.55, y1 - u.y * 1.6 - ny * w * 0.55, "o", edgeC);
      }
    };
    const gear = (cx: number, cy: number, r: number, ringC: string, hubC: string) => {
      const st = Math.max(12, Math.round(r * 7));
      for (let i = 0; i < st; i++) { const a = i / st * Math.PI * 2; set(cx + Math.cos(a) * r, cy + Math.sin(a) * r, "o", ringC); }
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; set(cx + Math.cos(a) * (r + 0.9), cy + Math.sin(a) * (r + 0.9), "+", ringC); }
      const ir = Math.max(1, r * 0.42); const ist = Math.max(6, Math.round(ir * 6));
      for (let i = 0; i < ist; i++) { const a = i / ist * Math.PI * 2; set(cx + Math.cos(a) * ir, cy + Math.sin(a) * ir, "o", hubC); }
      set(cx, cy, "@", hubC);
    };
    const gripper = (wx: number, wy: number, ux: number, uy: number, op: number) => {
      const nx = -uy, ny = ux;
      const pw = Math.max(1.4, R * 0.034);
      const palmExt = R * 0.05 + 1.5;
      const fl = Math.max(3, R * 0.105);
      const px = wx + ux * palmExt, py = wy + uy * palmExt;
      housing(wx - ux * 1.4, wy - uy * 1.4, px, py, pw, COL.claw, true);
      const gap = lerp(0.9, Math.max(2.4, R * 0.075), op);
      const aB = { x: px + nx * gap, y: py + ny * gap };
      const bB = { x: px - nx * gap, y: py - ny * gap };
      lineAuto(aB.x, aB.y, bB.x, bB.y, COL.claw);
      const aT = { x: aB.x + ux * fl, y: aB.y + uy * fl };
      const bT = { x: bB.x + ux * fl, y: bB.y + uy * fl };
      housing(aB.x, aB.y, aT.x, aT.y, 0.9, COL.claw, false);
      housing(bB.x, bB.y, bT.x, bT.y, 0.9, COL.claw, false);
      lineAuto(aT.x, aT.y, aT.x - nx * (gap * 0.55), aT.y - ny * (gap * 0.55), COL.claw);
      lineAuto(bT.x, bT.y, bT.x + nx * (gap * 0.55), bT.y + ny * (gap * 0.55), COL.claw);
      set(aB.x, aB.y, "O", COL.joint);
      set(bB.x, bB.y, "O", COL.joint);
      return { px, py, fl };
    };
    const crate = (cx: number, cy: number, c: string) => {
      const w = 2;
      for (let x = -w; x <= w; x++) { set(cx + x, cy - w, "=", c); set(cx + x, cy + w, "=", c); }
      for (let y = -w; y <= w; y++) { set(cx - w, cy + y, "|", c); set(cx + w, cy + y, "|", c); }
      set(cx - w, cy - w, "+", c); set(cx + w, cy - w, "+", c); set(cx - w, cy + w, "+", c); set(cx + w, cy + w, "+", c);
      for (let i = -w + 1; i <= w - 1; i++) { set(cx + i, cy + i, "\\", COL.dim); set(cx + i, cy - i, "/", COL.dim); }
    };

    for (let y = 0; y < R; y++) {
      for (let x = 0; x < C; x++) {
        if (((x * 11 + y * 17) % 23) === 0) { chars[id(x, y)] = "."; cols[id(x, y)] = COL.dim; }
      }
    }

    const S = { x: C * 0.30, y: R * 0.62 };
    const U = R * 0.34, F = R * 0.30;
    const pick = { x: C * 0.80, y: R * 0.74 };
    const drop = { x: C * 0.30, y: R * 0.34 };
    const hover = R * 0.16;
    const pickHi = { x: pick.x, y: pick.y - hover };
    const dropHi = { x: drop.x, y: drop.y - hover };
    const armW = Math.max(1.6, R * 0.044);

    const P = 6.6;
    const ph = (time % P) / P;
    const E = { x: 0, y: 0 }; let grab = 0, open = 1;
    if (ph < 0.16) { const t = ss(ph / 0.16); E.x = pickHi.x; E.y = lerp(pickHi.y, pick.y, t); open = 1; grab = 0; }
    else if (ph < 0.27) { const t = ss((ph - 0.16) / 0.11); E.x = pick.x; E.y = pick.y; open = 1 - t; grab = 0; }
    else if (ph < 0.50) { const t = ss((ph - 0.27) / 0.23); E.x = lerp(pick.x, drop.x, t); E.y = lerp(pick.y, drop.y, t) - Math.sin(t * Math.PI) * hover * 1.5; open = 0; grab = 1; }
    else if (ph < 0.61) { const t = ss((ph - 0.50) / 0.11); E.x = drop.x; E.y = drop.y; open = t; grab = 1 - t; }
    else if (ph < 0.80) { const t = ss((ph - 0.61) / 0.19); E.x = drop.x; E.y = lerp(drop.y, dropHi.y, t); open = 1; grab = 0; }
    else { const t = ss((ph - 0.80) / 0.20); E.x = lerp(dropHi.x, pickHi.x, t); E.y = lerp(dropHi.y, pickHi.y, t); open = 1; grab = 0; }
    E.y += Math.sin(time * 1.8) * 0.22;

    const dxk = E.x - S.x, dyk = E.y - S.y;
    let d = Math.hypot(dxk, dyk);
    d = clampN(d, Math.abs(U - F) + 0.6, U + F - 0.6);
    const phi = Math.atan2(dyk, dxk);
    const cosB = clampN((d * d + U * U - F * F) / (2 * U * d), -1, 1);
    const beta = Math.acos(cosB);
    let a1 = phi - beta;
    let elbow = { x: S.x + U * Math.cos(a1), y: S.y + U * Math.sin(a1) };
    if (elbow.y > S.y - 0.4) { a1 = phi + beta; elbow = { x: S.x + U * Math.cos(a1), y: S.y + U * Math.sin(a1) }; }
    const wrist = { x: E.x, y: E.y };
    const gd = unit(elbow.x, elbow.y, wrist.x, wrist.y);

    const fy = R * 0.93;
    for (let x = Math.round(pick.x) - 7; x <= Math.round(pick.x) + 7; x++) set(x, pick.y + 6, "_", COL.dim);
    housing(S.x - R * 0.11, fy, S.x + R * 0.11, fy, R * 0.028, COL.arm, false);
    set(S.x - R * 0.085, fy, "o", COL.joint); set(S.x + R * 0.085, fy, "o", COL.joint);
    housing(S.x, fy - R * 0.028, S.x, S.y, armW * 1.15, COL.arm, true);
    housing(S.x, S.y, elbow.x, elbow.y, armW, COL.arm, true);
    gear(S.x, S.y, armW + 1.3, COL.arm, COL.joint);
    housing(elbow.x, elbow.y, wrist.x, wrist.y, armW * 0.85, COL.arm, true);
    gear(elbow.x, elbow.y, armW + 0.6, COL.arm, COL.joint);
    gear(wrist.x, wrist.y, armW * 0.7 + 0.6, COL.claw, COL.joint);
    const gr = gripper(wrist.x, wrist.y, gd.x, gd.y, open);

    const boxAt = grab > 0.5
      ? { x: wrist.x + gd.x * (gr.fl * 0.6 + R * 0.05 + 1.5), y: wrist.y + gd.y * (gr.fl * 0.6 + R * 0.05 + 1.5) }
      : { x: pick.x, y: pick.y + 4 };
    crate(Math.round(boxAt.x), Math.round(boxAt.y), COL.box);

    if (Math.floor(time * 2) % 2 === 0) set(C - 2, 2, "_", COL.hud);

    ctx.clearRect(0, 0, W, H);
    ctx.font = fontPx + "px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textBaseline = "top";
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < C; x++) {
        const ch = chars[id(x, y)];
        if (ch === " " || ch === undefined) continue;
        ctx.fillStyle = cols[id(x, y)] || COL.arm;
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
    io = new IntersectionObserver(
      (entries) => { isVisible = entries[0]?.isIntersecting ?? true; },
      { threshold: 0 }
    );
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
