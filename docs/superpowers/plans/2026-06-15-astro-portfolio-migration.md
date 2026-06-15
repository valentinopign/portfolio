# Portfolio Migration to Astro + Tailwind — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the single-page `Portfolio.dc.html` (a Claude Design export) to a clean Astro + Tailwind CSS v4 project, preserving the exact neo-industrial visual design, fixing the non-standard `style-hover` attributes with real CSS hover, keeping & improving the ASCII robotic-arm canvas animation, and adding a second ASCII canvas animation ("AGENTIC LOOP").

**Architecture:** Static Astro site (`output: 'static'`), zero client JS except the two self-contained `<canvas>` animations. Each visual section of the original page becomes one focused `.astro` component, composed in `src/pages/index.astro` under a shared `Base.astro` layout. The two canvas animations live as framework-agnostic TypeScript modules (`src/scripts/*.ts`) that export an `init(canvas, box)` function and are wired up from each component's client `<script>`. Both animations pause when offscreen and respect `prefers-reduced-motion`.

**Tech Stack:** Astro 5, Tailwind CSS v4 (via `@tailwindcss/vite`), TypeScript, vanilla Canvas 2D. Fonts: Archivo (variable wght/wdth) + IBM Plex Mono via Google Fonts. No React, no UI libraries.

**Source of truth:** The original design lives at `Portfolio.dc.html` in the repo root. Colors: ink `#141210`, flame `#FF4D00`, bone `#ECEAE3`. When in doubt about exact spacing/typography, read the original element's inline `style` and reproduce its values verbatim as Tailwind arbitrary values (e.g. `text-[clamp(52px,9vw,148px)]`).

**Conventions for every component task:**
- Reproduce inline styles as Tailwind arbitrary-value utilities (`clamp(...)`, `[font-variation-settings:...]`) so the design stays 1:1.
- Wherever the original used the broken `style-hover="..."` attribute, implement it as a real Tailwind `hover:` / `group-hover:` utility with a `transition`.
- After building each component, wire it into `src/pages/index.astro`, then verify with `npx astro check` (no errors) and a visual check in `npm run dev`.
- Commit after each task.

---

## File Structure

Created by this plan (all paths relative to repo root):

```
package.json                      # deps + scripts
astro.config.mjs                  # Astro + Tailwind vite plugin
tsconfig.json                     # strict TS
.gitignore
src/
  styles/global.css               # Tailwind import, @theme tokens, keyframes, component classes
  layouts/Base.astro              # <html> shell, <head>, fonts, slot
  pages/index.astro               # composes all sections in order
  components/
    StatusBar.astro               # top orange status bar
    Hero.astro                    # identity + RoboticArm panel + readout strip
    RoboticArm.astro              # canvas + client script -> robotic-arm.ts
    Marquee.astro                 # scrolling divider
    About.astro                   # 01 SOBRE_MÍ + info grid
    Process.astro                 # 02 CÓMO_CONSTRUYO pipeline rows
    AgenticLoop.astro             # NEW canvas band + client script -> ascii-loop.ts
    Stack.astro                   # 03 STACK_TÉCNICO table
    Projects.astro                # 04 PROYECTOS featured card
    Contact.astro                 # 05 CONTACTO links + giant wordmark footer
  scripts/
    robotic-arm.ts                # ported + improved arm animation (init/cleanup)
    ascii-loop.ts                 # NEW agentic-loop animation (init/cleanup)
```

The original `support.js`, `<x-dc>`, `<helmet>`, `<script type="text/x-dc">`, and the Cloudflare email-protection script are **Claude Design runtime artifacts** and are NOT carried over. The email obfuscation disappears — use a plain `mailto:`.

---

## Task 1: Scaffold the Astro + Tailwind project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "portfolio-vp",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "^5.6.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@tailwindcss/vite": "^4.1.0",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
*.log
```

- [ ] **Step 5: Create `src/styles/global.css`**

This defines the design tokens (colors, fonts), the two keyframe animations from the original (`vpblink`, `vpmarquee`), and a small set of DRY component classes for the most-repeated typographic treatments. Everything else is done with Tailwind utilities in the components.

```css
@import "tailwindcss";

@theme {
  --color-ink: #141210;
  --color-flame: #FF4D00;
  --color-bone: #ECEAE3;
  --font-display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
}

@layer base {
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--color-ink);
    color: var(--color-bone);
    font-family: var(--font-mono);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  ::selection { background: var(--color-flame); color: var(--color-ink); }
}

@keyframes vpblink { 0%, 48% { opacity: 1; } 49%, 100% { opacity: 0; } }
@keyframes vpmarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

@layer components {
  /* repeated "NN ───── LABEL" section marker rule */
  .marker-line { flex: 1; height: 2px; min-width: 40px; }
  /* spec / info cells used in About + Projects */
  .label-eyebrow {
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.55;
  }
}
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: completes without errors; `node_modules/` and `package-lock.json` created.

- [ ] **Step 7: Verify the toolchain boots**

Run: `npm run build`
Expected: build fails or warns only about a missing `src/pages/index.astro` (no pages yet) — OR succeeds with an empty site. Either is acceptable; the point is that Astro + the Tailwind vite plugin load with no config errors. If it errors on the Tailwind plugin or config, fix before proceeding.

- [ ] **Step 8: Commit**

```bash
git init
git add package.json astro.config.mjs tsconfig.json .gitignore src/styles/global.css package-lock.json
git commit -m "chore: scaffold Astro + Tailwind v4 project"
```

---

## Task 2: Base layout + placeholder index

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/layouts/Base.astro`**

Ports the original `<head>`: charset, viewport, the two Google Font links (preconnect + the exact Archivo variable + IBM Plex Mono stylesheet URL from the original line 13), and imports `global.css`.

```astro
---
interface Props {
  title?: string;
  description?: string;
}
const {
  title = "Valentín Pignatelli — AI Product Developer",
  description = "AI Product Developer — de cero a producción. Construyo productos completos con IA: backend, frontend, deployment y comercialización.",
} = Astro.props;
import "../styles/global.css";
---
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <main class="w-full overflow-hidden">
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 2: Create a temporary `src/pages/index.astro`**

```astro
---
import Base from "../layouts/Base.astro";
---
<Base>
  <section class="bg-flame text-ink p-16">
    <h1 class="font-display font-black text-[clamp(52px,9vw,148px)] leading-[0.84] tracking-[-0.03em] uppercase [font-variation-settings:'wght'_900,'wdth'_125]">
      VALENTÍN<br />PIGNATELLI
    </h1>
  </section>
</Base>
```

- [ ] **Step 3: Verify the dev server renders the placeholder**

Run: `npm run dev`
Expected: server starts on `http://localhost:4321`. Open it: an orange section with the condensed-black "VALENTÍN PIGNATELLI" headline in the Archivo variable font. Confirm the font loads (heavy, ultra-wide) and the flame/ink colors are correct. Stop the server (Ctrl+C).

- [ ] **Step 4: Verify types/build**

Run: `npx astro check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Base.astro src/pages/index.astro
git commit -m "feat: add Base layout and placeholder index"
```

---

## Task 3: StatusBar component

Source: original lines 26–44.

**Files:**
- Create: `src/components/StatusBar.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/StatusBar.astro`**

```astro
---
const topItems = ["IDE › TERMINAL › SLACK", "——", "BUENOS AIRES / ARG", "——", "STATE: AVAILABLE 24/7"];
const tags = ["[ AI PRODUCT DEV ]", "[ 0 → PROD ]", "[ OPEN TO WORK ]"];
---
<div class="bg-flame text-ink border-t-[9px] border-b-[3px] border-ink [box-shadow:0_-16px_0_-13px_#141210,0_-24px_0_-21px_#141210]">
  <div class="max-w-[1320px] mx-auto py-[14px] px-[clamp(20px,5vw,72px)]">
    <div class="flex flex-wrap gap-x-[28px] gap-y-[10px] text-[11px] tracking-[0.16em] font-medium uppercase opacity-90">
      {topItems.map((t) => <span>{t}</span>)}
    </div>
    <div class="flex flex-wrap gap-x-[28px] gap-y-[14px] items-center mt-[10px] font-display font-extrabold [font-variation-settings:'wght'_800,'wdth'_118] text-[clamp(18px,2.6vw,30px)] tracking-[-0.01em]">
      <span>{tags[0]}</span>
      <span class="font-mono font-bold text-[0.7em]">::</span>
      <span>{tags[1]}</span>
      <span class="font-mono font-bold text-[0.7em]">::</span>
      <span>{tags[2]}</span>
    </div>
  </div>
</div>
```

Note: `&nbsp;` in the original tag text (e.g. `AI&nbsp;PRODUCT&nbsp;DEV`) prevented mid-tag wrapping. Reproduce with non-breaking spaces inside the strings, e.g. `"[ AI PRODUCT DEV ]"`, or keep `whitespace-nowrap` on each tag span. Use `whitespace-nowrap` on the tag spans — simpler and equivalent.

Apply `class="whitespace-nowrap"` to each of the three `{tags[...]}` spans.

- [ ] **Step 2: Wire into `src/pages/index.astro`** (replace the temporary body)

```astro
---
import Base from "../layouts/Base.astro";
import StatusBar from "../components/StatusBar.astro";
---
<Base>
  <StatusBar />
</Base>
```

- [ ] **Step 3: Verify**

Run: `npm run dev` and open `http://localhost:4321`.
Expected: orange bar at top, two rows of uppercase mono text (status line) + condensed-bold tag line with `::` separators. The thick ink top border + double box-shadow stripe effect from the original is present. Then `npx astro check` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/StatusBar.astro src/pages/index.astro
git commit -m "feat: add StatusBar component"
```

---

## Task 4: RoboticArm animation module (ported + improved)

This ports the canvas logic from the original `<script type="text/x-dc">` (lines 307–546) into a framework-agnostic module. **Improvements over the original:** `IntersectionObserver` pauses the RAF loop when the panel is offscreen; `prefers-reduced-motion: reduce` renders a single static frame instead of animating; a `cleanup()` function tears down listeners/observers/RAF.

**Files:**
- Create: `src/scripts/robotic-arm.ts`

- [ ] **Step 1: Create `src/scripts/robotic-arm.ts`**

The body of `render`, all draw helpers (`housing`, `gear`, `gripper`, `crate`), the kinematics, and the `resize` logic are copied verbatim from the original (lines 321–540), with these structural changes: it is an exported `init` function taking the box + canvas elements; it returns a `cleanup` function; the RAF loop is gated by an `isVisible` flag set by an `IntersectionObserver`; if reduced motion is preferred it renders exactly one frame and never schedules RAF.

```ts
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
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx astro check`
Expected: 0 errors. (The module is not yet imported anywhere; this confirms the TS is valid.)

- [ ] **Step 3: Commit**

```bash
git add src/scripts/robotic-arm.ts
git commit -m "feat: port robotic-arm canvas animation as a reusable module"
```

---

## Task 5: Hero component (with RoboticArm panel)

Source: original lines 46–100. The arm panel is extracted into `RoboticArm.astro`.

**Files:**
- Create: `src/components/RoboticArm.astro`
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/RoboticArm.astro`**

Reproduces the framed panel (lines 72–88): the `<canvas>`, the HUD corner brackets, the top/bottom status labels. The client `<script>` imports the module and wires init/cleanup. The labels are non-interactive (`pointer-events-none`).

```astro
<div
  id="arm-box"
  class="relative flex-[1_1_auto] min-h-[440px] bg-ink border-2 border-ink overflow-hidden"
>
  <canvas id="arm-canvas" class="absolute inset-0 block"></canvas>
  <div class="absolute top-3 left-3.5 right-3.5 flex justify-between text-[10px] tracking-[0.18em] uppercase text-[rgba(236,234,227,0.55)] pointer-events-none">
    <span>UNIT VP−01 / PICK &amp; PLACE</span>
    <span class="text-flame">● LIVE</span>
  </div>
  <div class="absolute bottom-3 left-3.5 right-3.5 flex justify-between text-[10px] tracking-[0.16em] uppercase text-[rgba(236,234,227,0.4)] pointer-events-none">
    <span>SYS.STATUS: OPERATIONAL</span>
    <span>0 FAILURES</span>
  </div>
  <span class="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-flame"></span>
  <span class="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-flame"></span>
  <span class="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-flame"></span>
  <span class="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-flame"></span>
</div>

<script>
  import { initRoboticArm } from "../scripts/robotic-arm";
  const box = document.getElementById("arm-box");
  const canvas = document.getElementById("arm-canvas") as HTMLCanvasElement | null;
  if (box && canvas) {
    const handle = initRoboticArm(box, canvas);
    window.addEventListener("beforeunload", () => handle.cleanup());
  }
</script>
```

- [ ] **Step 2: Create `src/components/Hero.astro`**

Ports the hero: left identity column (eyebrow, H1, description blurb with left rule, two CTA buttons) + right arm panel + bottom readout strip. The two CTAs reproduce the broken `style-hover` as real `hover:` utilities with `transition`.

```astro
---
import RoboticArm from "./RoboticArm.astro";
const readout = ["CORE_SYS: ONLINE", "STACK: MATURE", "MODEL: CLAUDE", "FOCUS: AGENTIC LOOPS"];
---
<section class="bg-flame text-ink px-[clamp(20px,5vw,72px)] pt-[clamp(40px,6vw,84px)] pb-[clamp(28px,4vw,56px)]">
  <div class="max-w-[1320px] mx-auto">
    <div class="flex flex-wrap gap-[clamp(32px,4vw,64px)] items-stretch">
      <!-- left: identity -->
      <div class="flex-[2_1_460px] min-w-[300px] flex flex-col justify-center">
        <div class="flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase font-medium mb-[clamp(20px,3vw,34px)]">
          <span class="w-[9px] h-[9px] bg-ink inline-block"></span>
          <span>[ LOC: −34.6037° / −58.3816° · BUENOS AIRES ]</span>
        </div>

        <h1 class="m-0 font-display font-black [font-variation-settings:'wght'_900,'wdth'_125] text-[clamp(52px,9vw,148px)] leading-[0.84] tracking-[-0.03em] uppercase">
          VALENTÍN<br />PIGNATELLI
        </h1>

        <div class="mt-[clamp(22px,3vw,34px)] max-w-[560px] border-l-[3px] border-ink pl-5">
          <p class="m-0 text-[clamp(13px,1.5vw,16px)] tracking-[0.14em] uppercase font-semibold">
            AI PRODUCT DEVELOPER — DE CERO A PRODUCCIÓN
          </p>
          <p class="mt-3.5 mb-0 text-[clamp(14px,1.6vw,17px)] leading-[1.55] font-normal">
            Construyo productos completos con IA: arquitectura backend, frontend, deployment y comercialización. Diseño loops agénticos que resuelven problemas verticales reales.
          </p>
        </div>

        <div class="flex flex-wrap gap-3.5 mt-[clamp(26px,3.5vw,40px)]">
          <a href="#proyectos"
             class="bg-ink text-bone no-underline px-[30px] py-4 text-[12px] tracking-[0.18em] uppercase font-semibold border-2 border-ink transition-all duration-[180ms] hover:bg-bone hover:text-ink">
            Ver Proyectos →
          </a>
          <a href="#contacto"
             class="bg-transparent text-ink no-underline px-[30px] py-4 text-[12px] tracking-[0.18em] uppercase font-semibold border-2 border-ink transition-all duration-[180ms] hover:bg-ink hover:text-bone">
            Contacto
          </a>
        </div>
      </div>

      <!-- right: arm panel -->
      <div class="flex-[1_1_380px] min-w-[300px] flex flex-col">
        <RoboticArm />
      </div>
    </div>

    <!-- bottom readout strip -->
    <div class="flex flex-wrap gap-x-9 gap-y-2.5 mt-[clamp(30px,4vw,52px)] pt-[18px] border-t-2 border-ink text-[11px] tracking-[0.16em] uppercase font-medium">
      {readout.map((r) => <span>{r}</span>)}
      <span class="ml-auto">© 2026 — VP</span>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Wire into `src/pages/index.astro`**

```astro
---
import Base from "../layouts/Base.astro";
import StatusBar from "../components/StatusBar.astro";
import Hero from "../components/Hero.astro";
---
<Base>
  <StatusBar />
  <Hero />
</Base>
```

- [ ] **Step 4: Verify**

Run: `npm run dev`, open `http://localhost:4321`.
Expected: the hero renders with the big headline on the left, the two CTA buttons (hover them — colors must invert smoothly), and on the right the dark framed panel with the **animated ASCII robotic arm picking and placing a crate**, the LIVE/status HUD labels, and the four flame corner brackets. Resize the window — the canvas re-scales without distortion. Then `npx astro check` → 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/RoboticArm.astro src/components/Hero.astro src/pages/index.astro
git commit -m "feat: add Hero with animated robotic-arm panel"
```

---

## Task 6: Marquee divider

Source: original lines 102–108.

**Files:**
- Create: `src/components/Marquee.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Marquee.astro`**

The original duplicates the text span twice and animates `translateX(0 → -50%)` over 32s (keyframe `vpmarquee` already in `global.css`). Reproduce, and add `motion-reduce:[animation:none]` so reduced-motion users get a static strip.

```astro
---
const items = ["AGENTIC LOOPS", "AI PRODUCT", "0 → PRODUCTION", "BUENOS AIRES / ARG", "ESCRIBANIA®", "CLAUDE API", "FULL-STACK"];
const text = items.join("  ✯  ") + "  ✯  ";
---
<div class="bg-ink overflow-hidden border-t-[3px] border-b-[3px] border-flame">
  <div class="inline-flex whitespace-nowrap will-change-transform py-[13px] [animation:vpmarquee_32s_linear_infinite] motion-reduce:[animation:none]">
    <span class="text-flame text-[13px] tracking-[0.18em] uppercase font-semibold px-0">&nbsp;{text}</span>
    <span class="text-flame text-[13px] tracking-[0.18em] uppercase font-semibold px-0" aria-hidden="true">&nbsp;{text}</span>
  </div>
</div>
```

- [ ] **Step 2: Wire into `index.astro`** — import `Marquee` and place `<Marquee />` after `<Hero />`.

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Expected: a black strip with flame top/bottom borders and uppercase text scrolling right-to-left in a seamless loop. `npx astro check` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Marquee.astro src/pages/index.astro
git commit -m "feat: add scrolling marquee divider"
```

---

## Task 7: About section (01 SOBRE_MÍ)

Source: original lines 110–134.

**Files:**
- Create: `src/components/About.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/About.astro`**

Header marker row (`01 ───── SOBRE_MÍ`), two-column grid: left big H2, right two paragraphs + a 2×2 info grid (ROLE/BASE/FOCUS/STATE) made of ink-gridlines over flame cells.

```astro
---
const cells = [
  { k: "ROLE", v: "AI PRODUCT DEV" },
  { k: "BASE", v: "BUENOS AIRES, AR" },
  { k: "FOCUS", v: "AGENTIC SYSTEMS" },
  { k: "STATE", v: "SHIPPING" },
];
---
<section class="bg-flame text-ink px-[clamp(20px,5vw,72px)] py-[clamp(56px,8vw,120px)]">
  <div class="max-w-[1320px] mx-auto">
    <div class="flex items-baseline gap-4 mb-[clamp(36px,5vw,64px)]">
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase">01</span>
      <span class="marker-line bg-ink"></span>
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase">SOBRE_MÍ</span>
    </div>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[clamp(32px,5vw,72px)] items-start">
      <div>
        <h2 class="m-0 font-display font-black [font-variation-settings:'wght'_880,'wdth'_110] text-[clamp(28px,3.6vw,52px)] leading-[0.98] tracking-[-0.02em]">
          Técnico en Electrónica + Estudiante de Ingeniería Informática. <span class="opacity-50">Autodidacta en desarrollo con IA.</span>
        </h2>
      </div>
      <div class="text-[clamp(14px,1.5vw,16px)] leading-[1.65] font-normal">
        <p class="mt-0 mb-[18px]">No solo implemento modelos: diseño sistemas agénticos que resuelven problemas verticales específicos, desde la arquitectura hasta el deployment.</p>
        <p class="mt-0 mb-7">Mi enfoque es construir productos que lleguen a producción — usados por clientes reales — no demos ni pruebas de concepto.</p>
        <div class="grid grid-cols-2 gap-px bg-ink border-2 border-ink">
          {cells.map((c) => (
            <div class="bg-flame px-4 py-3.5">
              <div class="label-eyebrow">{c.k}</div>
              <div class="font-semibold mt-1 text-[13px] tracking-[0.04em]">{c.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Wire into `index.astro`** — import `About`, place `<About />` after `<Marquee />`.

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Expected: orange section, marker row up top, big condensed headline on the left (the second sentence at 50% opacity), paragraphs + a 2×2 grid of cells separated by thin ink lines on the right. `npx astro check` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/About.astro src/pages/index.astro
git commit -m "feat: add About section"
```

---

## Task 8: Process section (02 CÓMO_CONSTRUYO)

Source: original lines 136–175. Five pipeline rows; the last (`05 Deploy`) is flame-colored.

**Files:**
- Create: `src/components/Process.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Process.astro`**

Data-drive the five rows. Each row: big condensed number | condensed title | description with a flame `[ ... ]` tail. The fifth row is highlighted flame and has a thicker bottom border.

```astro
---
const rows = [
  { n: "01", t: "Señal", d: "Detecto un problema vertical real y costoso.", tail: "[ TAREA RECIBIDA ] [ CONTEXTO CARGADO ]" },
  { n: "02", t: "Contexto", d: "Modelo el dominio y mapeo el flujo de datos.", tail: "[ INDEXANDO ] [ DEPENDENCIAS MAPEADAS ]" },
  { n: "03", t: "Ejecución", d: "Construyo el loop agéntico: backend, IA y frontend.", tail: "[ BUILD ] [ API + UI ]" },
  { n: "04", t: "Validación", d: "Pruebo contra casos reales y audito resultados.", tail: "[ TEST PASS ] [ AUDITED ]" },
  { n: "05", t: "Deploy", d: "Producción + comercialización. Clientes reales.", tail: "[ ENV: PRODUCTION ] [ LIVE ]", hot: true },
];
---
<section class="bg-bone text-ink px-[clamp(20px,5vw,72px)] py-[clamp(56px,8vw,120px)]">
  <div class="max-w-[1320px] mx-auto">
    <div class="flex flex-wrap items-baseline gap-4 mb-[clamp(8px,2vw,20px)]">
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase text-flame">02</span>
      <span class="marker-line bg-ink"></span>
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase">CÓMO_CONSTRUYO</span>
    </div>
    <h2 class="mt-0 mb-[clamp(28px,4vw,48px)] font-display font-black [font-variation-settings:'wght'_900,'wdth'_122] text-[clamp(30px,5vw,72px)] leading-[0.9] tracking-[-0.025em] uppercase">
      PIPELINE / 0 → PROD
    </h2>

    <div class="border-t-2 border-ink">
      {rows.map((r) => (
        <div class:list={[
          "grid grid-cols-[clamp(56px,8vw,110px)_minmax(0,1.4fr)_minmax(0,1.6fr)] gap-x-[clamp(12px,3vw,40px)] items-center py-[clamp(18px,2.4vw,30px)]",
          r.hot ? "border-b-2 border-ink" : "border-b border-[rgba(20,18,16,0.18)]",
        ]}>
          <span class:list={[
            "font-display font-black [font-variation-settings:'wght'_900,'wdth'_70] text-[clamp(40px,6vw,92px)] leading-[0.8]",
            r.hot && "text-flame",
          ]}>{r.n}</span>
          <span class:list={[
            "font-display font-extrabold [font-variation-settings:'wght'_800,'wdth'_118] text-[clamp(18px,2.4vw,34px)] tracking-[-0.01em] uppercase",
            r.hot && "text-flame",
          ]}>{r.t}</span>
          <span class="text-[clamp(11px,1.3vw,14px)] leading-[1.6] tracking-[0.04em]">
            {r.d} <span class="text-flame">{r.tail}</span>
          </span>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Wire into `index.astro`** — import `Process`, place `<Process />` after `<About />`.

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Expected: cream (`#ECEAE3`) section, five rows with huge condensed numbers, titles, and flame bracketed tails; row 05 (Deploy) number + title are flame. `npx astro check` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Process.astro src/pages/index.astro
git commit -m "feat: add Process pipeline section"
```

---

## Task 9: NEW AgenticLoop animation module

A second ASCII canvas animation matching the brand: a ring of labeled nodes (`SIGNAL → CONTEXT → BUILD → TEST → DEPLOY`) connected in a closed loop, with a bright "data pulse" packet traveling around the ring and a soft trailing glow. Same engineering contract as the arm: `init(box, canvas)` → `{ cleanup }`, DPR-capped, `IntersectionObserver` pause, `prefers-reduced-motion` static frame. It reuses the same ASCII grid + `set/line` rendering technique so it visually matches the arm.

**Files:**
- Create: `src/scripts/ascii-loop.ts`

- [ ] **Step 1: Create `src/scripts/ascii-loop.ts`**

```ts
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
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/ascii-loop.ts
git commit -m "feat: add agentic-loop ascii animation module"
```

---

## Task 10: AgenticLoop component (the new visual band)

A full-width framed band placed right after the Process section — a "live system" panel, same framed/HUD-bracket styling as the hero arm so the two animations read as a set.

**Files:**
- Create: `src/components/AgenticLoop.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/AgenticLoop.astro`**

```astro
<section class="bg-ink text-bone px-[clamp(20px,5vw,72px)] py-[clamp(40px,6vw,72px)] border-t-[3px] border-b-[3px] border-flame">
  <div class="max-w-[1320px] mx-auto">
    <div class="flex flex-wrap items-baseline gap-4 mb-[clamp(20px,3vw,32px)]">
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase text-flame">//</span>
      <span class="marker-line bg-flame"></span>
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase">RUNTIME_LOOP</span>
    </div>
    <div
      id="loop-box"
      class="relative w-full h-[clamp(260px,34vw,420px)] bg-ink border-2 border-flame overflow-hidden"
    >
      <canvas id="loop-canvas" class="absolute inset-0 block"></canvas>
      <div class="absolute top-3 left-3.5 right-3.5 flex justify-between text-[10px] tracking-[0.18em] uppercase text-[rgba(236,234,227,0.55)] pointer-events-none">
        <span>AGENTIC LOOP / SELF-SUSTAINING</span>
        <span class="text-flame">● CYCLING</span>
      </div>
      <div class="absolute bottom-3 left-3.5 right-3.5 flex justify-between text-[10px] tracking-[0.16em] uppercase text-[rgba(236,234,227,0.4)] pointer-events-none">
        <span>THROUGHPUT: NOMINAL</span>
        <span>LATENCY: LOW</span>
      </div>
      <span class="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-flame"></span>
      <span class="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-flame"></span>
      <span class="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-flame"></span>
      <span class="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-flame"></span>
    </div>
  </div>
</section>

<script>
  import { initAsciiLoop } from "../scripts/ascii-loop";
  const box = document.getElementById("loop-box");
  const canvas = document.getElementById("loop-canvas") as HTMLCanvasElement | null;
  if (box && canvas) {
    const handle = initAsciiLoop(box, canvas);
    window.addEventListener("beforeunload", () => handle.cleanup());
  }
</script>
```

- [ ] **Step 2: Wire into `index.astro`** — import `AgenticLoop`, place `<AgenticLoop />` after `<Process />`.

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Expected: a dark band with flame borders and corner brackets; inside, an ASCII elliptical ring with five labeled nodes (`SIGNAL/CONTEXT/BUILD/TEST/DEPLOY`), a bright `#` packet traveling around the ring leaving an `o`/`·` trail, the active node showing `@`, and a `LOOP NNN%` readout in the center. Scroll it offscreen and back — it should keep animating smoothly (and not peg the CPU while hidden). `npx astro check` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/AgenticLoop.astro src/pages/index.astro
git commit -m "feat: add AgenticLoop animated band"
```

---

## Task 11: Stack section (03 STACK_TÉCNICO)

Source: original lines 177–221. Note the original puts this on the same cream background as Process with no top padding (`padding:0 ... bottom`). Keep it visually continuous with Process.

**Files:**
- Create: `src/components/Stack.astro`
- Modify: `src/pages/index.astro`

> Placement note: in the original, Stack directly follows Process on one continuous cream block. Because we inserted `AgenticLoop` (a dark band) between them, render Stack as its own cream section **with** normal top padding (`py-[clamp(56px,8vw,120px)]`) so it stands on its own after the dark band. This is an intentional, minimal layout adjustment caused by the new animation; everything else is 1:1.

- [ ] **Step 1: Create `src/components/Stack.astro`**

```astro
---
const rows = [
  { layer: "Lenguajes", tools: "Python · JavaScript · TypeScript", status: "CORE" },
  { layer: "Frameworks", tools: "Flask · Next.js · React", status: "DAILY" },
  { layer: "IA", tools: "Claude API · Loops agénticos · Prompt eng.", status: "FOCUS" },
  { layer: "Data / Infra", tools: "Supabase · PostgreSQL · Deployment", status: "READY" },
  { layer: "UI / 3D", tools: "Three.js · Tailwind · Canvas / WebGL", status: "CRAFT", last: true },
];
---
<section class="bg-bone text-ink px-[clamp(20px,5vw,72px)] py-[clamp(56px,8vw,120px)]">
  <div class="max-w-[1320px] mx-auto">
    <div class="flex flex-wrap items-baseline gap-4 mb-[clamp(24px,4vw,44px)]">
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase text-flame">03</span>
      <span class="marker-line bg-ink"></span>
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase">STACK_TÉCNICO</span>
    </div>

    <div class="border-2 border-ink">
      <div class="grid grid-cols-[minmax(120px,1fr)_minmax(0,2fr)_minmax(90px,0.9fr)] bg-ink text-bone text-[11px] tracking-[0.18em] uppercase font-semibold">
        <span class="px-[18px] py-[13px]">CAPA</span>
        <span class="px-[18px] py-[13px]">HERRAMIENTAS</span>
        <span class="px-[18px] py-[13px] text-right">STATUS</span>
      </div>
      {rows.map((r) => (
        <div class:list={[
          "grid grid-cols-[minmax(120px,1fr)_minmax(0,2fr)_minmax(90px,0.9fr)] items-center",
          !r.last && "border-b border-[rgba(20,18,16,0.2)]",
        ]}>
          <span class="px-[18px] py-[15px] font-semibold tracking-[0.1em] uppercase text-[13px]">{r.layer}</span>
          <span class="px-[18px] py-[15px] text-[13px] tracking-[0.04em]">{r.tools}</span>
          <span class="px-[18px] py-[15px] text-right text-[11px] tracking-[0.12em] text-flame font-semibold">{r.status}</span>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Wire into `index.astro`** — import `Stack`, place `<Stack />` after `<AgenticLoop />`.

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Expected: cream section with a bordered table: dark header row (CAPA/HERRAMIENTAS/STATUS), five rows, flame status labels right-aligned. `npx astro check` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Stack.astro src/pages/index.astro
git commit -m "feat: add Stack table section"
```

---

## Task 12: Projects section (04 PROYECTOS)

Source: original lines 223–263. Featured card for EscribanIA with a vertical spine, title with flame "IA", external link, tags, and a spec mini-table. The external link `↗` had a broken `style-hover` (translate) — implement as real `hover:` transform on a `group`.

**Files:**
- Create: `src/components/Projects.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Projects.astro`**

```astro
---
const tags = ["Python", "Flask", "Claude API", "Supabase", "Next.js", "Three.js"];
const specs = [
  { k: "DOMINIO", v: "LEGAL / NOTARIAL", hot: false },
  { k: "CAPA IA", v: "AGENTIC LOOPS", hot: false },
  { k: "ESTADO", v: "EN PRODUCCIÓN", hot: true },
];
---
<section id="proyectos" class="bg-flame text-ink px-[clamp(20px,5vw,72px)] py-[clamp(56px,8vw,120px)]">
  <div class="max-w-[1320px] mx-auto">
    <div class="flex flex-wrap items-baseline gap-4 mb-[clamp(36px,5vw,60px)]">
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase">04</span>
      <span class="marker-line bg-ink"></span>
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase">PROYECTOS</span>
    </div>

    <div class="flex flex-wrap border-2 border-ink bg-bone">
      <!-- vertical spine -->
      <div class="bg-ink text-flame flex items-center justify-center px-2.5 py-[18px] [writing-mode:vertical-rl] rotate-180 font-display font-black [font-variation-settings:'wght'_900,'wdth'_118] text-[clamp(13px,1.4vw,18px)] tracking-[0.16em] uppercase">
        PRODUCTO 01 — EN PRODUCCIÓN
      </div>

      <div class="flex-[1_1_420px] min-w-[280px] p-[clamp(26px,3.5vw,48px)] text-ink">
        <div class="group flex flex-wrap items-center gap-3.5">
          <h3 class="m-0 font-display font-black [font-variation-settings:'wght'_900,'wdth'_122] text-[clamp(40px,6vw,90px)] leading-[0.85] tracking-[-0.03em] uppercase">
            Escriban<span class="text-flame">IA</span>
          </h3>
          <a href="https://escriban-ia.com.ar" target="_blank" rel="noopener"
             class="no-underline text-ink text-[clamp(22px,3vw,40px)] leading-none inline-block transition-transform duration-[180ms] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]">↗</a>
        </div>
        <p class="mt-[18px] mb-0 text-[clamp(12px,1.4vw,15px)] tracking-[0.12em] uppercase font-semibold text-flame">
          SaaS vertical con IA para escribanías argentinas
        </p>
        <p class="mt-4 mb-7 text-[clamp(13px,1.5vw,16px)] leading-[1.65] max-w-[640px]">
          Producto en producción que automatiza la recolección de datos, la auditoría de documentos societarios y la consulta al Boletín Oficial. Utiliza loops agénticos sobre Claude para resolver tareas reales de oficina.
        </p>

        <div class="flex flex-wrap gap-2 mb-[30px]">
          {tags.map((t) => (
            <span class="border-[1.5px] border-ink px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase font-medium">{t}</span>
          ))}
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] border-t-2 border-l-2 border-ink">
          {specs.map((s) => (
            <div class="border-r-2 border-b-2 border-ink px-4 py-[13px]">
              <div class="label-eyebrow">{s.k}</div>
              <div class:list={["font-semibold mt-[5px] text-[13px]", s.hot && "text-flame"]}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Wire into `index.astro`** — import `Projects`, place `<Projects />` after `<Stack />`.

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Expected: orange section, framed card with the dark vertical spine on the left ("PRODUCTO 01 — EN PRODUCCIÓN"), "EscribanIA" with flame "IA", the `↗` link nudges up-right on hover, tag chips, and a spec table with "EN PRODUCCIÓN" in flame. Clicking `↗` opens `https://escriban-ia.com.ar`. `npx astro check` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Projects.astro src/pages/index.astro
git commit -m "feat: add Projects featured card"
```

---

## Task 13: Contact section + footer (05 CONTACTO)

Source: original lines 265–303. Three contact links (Email/LinkedIn/GitHub) with the broken `style-hover` padding+color animation reimplemented as real `hover:`, plus the giant flame "PIGNATELLI" wordmark footer. The Cloudflare-obfuscated email becomes a plain `mailto:`.

> Email recovery: the original email was Cloudflare-protected. Decode the real address from the LinkedIn/GitHub handles context: it is `dev.valentinpignatelli@gmail.com` (provided by the project owner). Use this as the `mailto:` target. If the owner later supplies a different address, change the one `href`.

**Files:**
- Create: `src/components/Contact.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Contact.astro`**

```astro
---
const links = [
  { k: "EMAIL", v: "dev.valentinpignatelli@gmail.com", href: "mailto:dev.valentinpignatelli@gmail.com", arrow: "→", external: false },
  { k: "LINKEDIN", v: "Valentín Pignatelli", href: "https://www.linkedin.com/", arrow: "↗", external: true },
  { k: "GITHUB", v: "@valentinpignatelli", href: "https://github.com/valentinpignatelli", arrow: "↗", external: true },
];
---
<section id="contacto" class="bg-ink text-bone px-[clamp(20px,5vw,72px)] pt-[clamp(56px,8vw,120px)] pb-0">
  <div class="max-w-[1320px] mx-auto">
    <div class="flex flex-wrap items-baseline gap-4 mb-[clamp(36px,5vw,56px)]">
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase text-flame">05</span>
      <span class="marker-line bg-flame"></span>
      <span class="text-[12px] tracking-[0.22em] font-bold uppercase">CONTACTO</span>
    </div>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[clamp(36px,5vw,72px)] items-start">
      <h2 class="m-0 font-display font-black [font-variation-settings:'wght'_900,'wdth'_125] text-[clamp(40px,6.5vw,104px)] leading-[0.84] tracking-[-0.03em] uppercase">
        ¿CONSTRUIMOS ALGO <span class="text-flame">REAL?</span>
      </h2>

      <div class="flex flex-col border-t-2 border-flame">
        {links.map((l) => (
          <a
            href={l.href}
            target={l.external ? "_blank" : undefined}
            rel={l.external ? "noopener" : undefined}
            class="flex justify-between items-center gap-3 py-[22px] pl-1 no-underline text-bone border-b border-[rgba(236,234,227,0.18)] transition-[padding,color] duration-[180ms] hover:pl-[18px] hover:text-flame"
          >
            <span class="flex flex-col gap-1">
              <span class="text-[10px] tracking-[0.2em] uppercase opacity-50">{l.k}</span>
              <span class="text-[clamp(14px,1.6vw,18px)] font-medium tracking-[0.02em]">{l.v}</span>
            </span>
            <span class="text-[20px]">{l.arrow}</span>
          </a>
        ))}
      </div>
    </div>

    <!-- giant footer wordmark -->
    <div class="mt-[clamp(48px,7vw,96px)] overflow-hidden leading-[0.72] border-t-2 border-[rgba(236,234,227,0.18)] pt-[clamp(20px,3vw,40px)]">
      <div class="font-display font-black [font-variation-settings:'wght'_900,'wdth'_125] text-[clamp(56px,17.5vw,290px)] tracking-[-0.04em] text-flame whitespace-nowrap">
        PIGNATELLI
      </div>
      <div class="flex flex-wrap gap-x-7 gap-y-2.5 pt-[22px] pb-[clamp(30px,4vw,48px)] text-[11px] tracking-[0.16em] uppercase text-[rgba(236,234,227,0.55)]">
        <span>© 2026 VALENTÍN PIGNATELLI</span>
        <span>BUENOS AIRES / ARG</span>
        <span class="ml-auto">STATUS: OPERATIONAL — — —</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Wire into `index.astro`** — import `Contact`, place `<Contact />` last.

Final `src/pages/index.astro` should be:

```astro
---
import Base from "../layouts/Base.astro";
import StatusBar from "../components/StatusBar.astro";
import Hero from "../components/Hero.astro";
import Marquee from "../components/Marquee.astro";
import About from "../components/About.astro";
import Process from "../components/Process.astro";
import AgenticLoop from "../components/AgenticLoop.astro";
import Stack from "../components/Stack.astro";
import Projects from "../components/Projects.astro";
import Contact from "../components/Contact.astro";
---
<Base>
  <StatusBar />
  <Hero />
  <Marquee />
  <About />
  <Process />
  <AgenticLoop />
  <Stack />
  <Projects />
  <Contact />
</Base>
```

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Expected: dark contact section, big "¿CONSTRUIMOS ALGO REAL?" headline (REAL? in flame), three contact rows that indent + turn flame on hover, the `mailto:` works, and the huge flame "PIGNATELLI" wordmark with the footer meta line. `npx astro check` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Contact.astro src/pages/index.astro
git commit -m "feat: add Contact section and footer wordmark"
```

---

## Task 14: Anchor smooth-scroll + final full-page verification

The hero CTAs link to `#proyectos` and `#contacto`. Add smooth scrolling and confirm the whole page matches the original.

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add smooth scroll (reduced-motion safe) to `global.css`**

Inside the existing `@layer base` block, add to the `html, body` area:

```css
@layer base {
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
}
```

- [ ] **Step 2: Full-page visual diff against the original**

Open the original `Portfolio.dc.html` in one browser tab (via `file://`) and `npm run dev` in another. Scroll both top-to-bottom and confirm, section by section: StatusBar → Hero (arm animating) → Marquee → About → Process → **AgenticLoop (new)** → Stack → Projects → Contact/footer. Colors, type scale, borders, and spacing should match (the only intentional difference is the inserted AgenticLoop band and Stack now having its own top padding). Hover all interactive elements (2 hero CTAs, project `↗`, 3 contact rows) — all must animate (the original's `style-hover` was dead).

- [ ] **Step 3: Production build + preview**

Run: `npm run build`
Expected: builds with 0 errors; `dist/` contains `index.html` plus bundled JS for the two canvas scripts.

Run: `npm run preview`
Expected: serves the built site; both animations run; everything looks identical to dev.

- [ ] **Step 4: Type/lint gate**

Run: `npx astro check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: smooth anchor scrolling + final verification pass"
```

---

## Self-Review

**Spec coverage** (against the original `Portfolio.dc.html` and the three requirements: migrate to Astro+Tailwind, improve the arm, add one ASCII animation):

- Status bar → Task 3 ✓
- Hero + identity + CTAs → Task 5 ✓
- Robotic arm animation (ported) → Task 4; improved (offscreen pause, reduced-motion, cleanup) → Task 4; rendered → Task 5 ✓
- Marquee → Task 6 ✓
- About (01) → Task 7 ✓
- Process (02) → Task 8 ✓
- **New ASCII animation (AgenticLoop)** → module Task 9, component Task 10 ✓
- Stack (03) → Task 11 ✓
- Projects (04) → Task 12 ✓
- Contact + footer (05) → Task 13 ✓
- Broken `style-hover` → real hover: Tasks 5, 12, 13 ✓
- Astro + Tailwind v4 scaffold → Tasks 1–2 ✓
- Anchor targets `#proyectos` / `#contacto` exist (Projects/Contact section ids) + smooth scroll → Task 14 ✓

**Placeholder scan:** No "TBD"/"add error handling"/"similar to Task N" — all components and both animation modules contain complete code. The one piece of external data needed (email address) is resolved in Task 13 with a documented fallback.

**Type/name consistency:** `initRoboticArm(box, canvas) → { cleanup }` (Task 4) matches its call site (Task 5). `initAsciiLoop(box, canvas) → { cleanup }` (Task 9) matches its call site (Task 10). Element ids match between component markup and scripts (`arm-box`/`arm-canvas`, `loop-box`/`loop-canvas`). Tailwind tokens `ink`/`flame`/`bone` and fonts `display`/`mono` are defined once in `global.css` (Task 1) and used consistently throughout.

**Known intentional deviations from the original:** (1) AgenticLoop dark band inserted between Process and Stack; (2) Stack gets its own top padding because of that insertion. Both are documented in Tasks 10–11.
