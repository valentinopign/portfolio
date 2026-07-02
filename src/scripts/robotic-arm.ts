export interface ArmHandle {
  cleanup: () => void;
}

const ASCII_ART = `                                                                                                                    
                                                                                                                    
                                                                                                                    
                                                                            .----::.                                
                                                                  :---------:::::::::---:.                           
                              .::-----------::.  ....       :--::::::::::::::::::--------.                         
                            :------::::::::::-----=------:::-=::::::::::::::::::..---=-----                        
                      .:--+=-::::::::::::::::::::--::::::::::=-:::::::::::::::::-===----:--                        
                    +*.-===:-:::-:--:::::::::-:::=-:::::::::-=-:=::-------:-=:-=++=---:----                        
                  -*+=*  ----::--==-----::::------=-----------===-------==+++===-::-:::-----                       
                 -=+:=  ::-::-.----+-----::::==-----=-             :--------:--:-::::-======-                      
                 *.**-  :::-:-.-:--+------------.                             -:::-=+++#####*:                     
                ****##+++==-=::=::--=--=:....                                 --=++###+++**#*                      
              :**=*+ .:+#+*====--:-----:                                      :=*#%*+*####****+*=                  
                         -*+*+=--:----:                                        -+**++++++++*+**+*++:               
                           -+*+=--:---:                                          **+++++++++++*####*++:            
                            :-++=-:----.                                        -+*%#+*##+**###=+::=+#*++:.        
                            .=+*+--:----                                        ++*#*##****+         *#++++        
                             -++*=-:-----                                      =**:-                  =+#*:        
                             .=+*+--:-----                                     *++-                  .#*+*.        
                              :++*=-::-----                                   +++++=                  :#*+:        
                              .-+*+=-::-----                                 .*#**##+.                 .**         
                               :=+*=--::-----.                                 :++-*#+.                            
                                -==*=--::-----:                                   -=++-                            
                                .-++*=--:::-----                                    -=                             
                                 :-*+*=--:::-----                                                                  
                                  -=::-=-:::::----.                                                                
                                  .:+**+=-::::::---.                                                               
                                   ::=**+=---::::---=-------:                                                      
                                    --++*=-----::::-=+---:-----                                                    
                                    .--*=*=----::::-===+-::-----:                                                  
                                     :-=+*+=--:::---==--==-:------                                                 
                                      :=#=*++=-::::--===-==-:------                                                
                                       =*=#+==---:::---=--=--:-----.                                               
                                       =*=#+==---::.---==-=--:-----:                                               
                                       -=-#=----:-::---=--=--:-----:                                               
                                      .=--*=----=-::---==-=--:-----                                                
                                    ..===*-====--::---==-==-:------                                                
                                :*+*.=*+++==------=====-=+--:-----                                                 
                                -**#*#=+*+=----======--+---:----:                                                  
                              ::=*#++**#++--------===----:-----                                                    
                              -+++**#++*+==----------::--==-.                                                      
                            .--====+++=+===-------:--===:.                                                         
                            .:::::-====+==--------====.                                                            
                            .:::::-====+==------====-                                                              
                          .:-:::::=====+===---===---+=.                                                            
                          --===--:===+++++===-=====--=:                                                            
                     .-*##---:::::::::......:::------=*#####:.                                                     
                .=########*=----::::::......::----==#%#########=:                                                  
               +**######********#################*****####**#***--                                                 
             ---*+++++**###########################*++++*#*##=*#::.                                                
            .---**++++++========++=======++++*++====++++*#*##=*#:::-.                                              
          =*----**+++++++++=====-*+=---:::::+---====++++*#*##=##::::+#                                             
         ==-----**++++++++++====-**=---:::::#---====+#######***#:::::=.                                            
                .+++++++++++++==-#*==---:::-#---====+++++++++-                                                     
                    :==+++++++==-###*+===##+#---====++=-.                                                          
                                *#**###******+                                                                     
                                 .........`;

const BOX_ASCII = `
                                                                                                                    
                                                                                                                    
                                                                    ....::::::::...                                 
                                                           ..::::::::::::::::::::::::::.                            
                                                ....:::::::::::::::::::::::::::::.....  ....                        
                                      ....::::::::::::::::::::::::::::::........ . ... ....::::::::..               
                            ...:::::::::::::::::::::::::::::::..    .... .  ......:-::::::::::::::::::::::.         
                 ....:::::::::::::::::::::::::::::......           ....:..::::::::::::::::::::::::::::::::::::::.   
            :::::::::::::::::::::::::::::.....            ....:-:::::::::::::::::::::::::::::::::::::::----------.  
            :::::::::::::::::......              .....:::::::::::::::::::::::::::::::::::::::::------------------.  
            ::::::::::-..                .::..:::::::::::::::::::::::::::::::::::::::---------------------------:   
            :::::::::::.      ....::::::::::::::::::::::::::::::::::::::::::------------------------------------:   
            .:::::::::::      .:::::::::::::::::::::::::::::::::::----------------------------------------------:   
            .:::::::::::.     .:::::::::::::::::::::::::::------------------------------------------------------:   
            .:::::::::::.     .::::::::::::::::::---------------------------------------------------------------:   
            .:::::::::::.     .::::::::::::::-------------------------------------------------------------------:   
            .:::::::::::::.    ::::::::::::::-------------------------------------------------------------------:   
             :::::::::::::::::.::::::::::::::-------------------------------------------------------------------.   
             ::::::::::::::::::::::::::::::::-------------------------------------------------------------------.   
             ::::::::::::::::::::::::::::::::-------------------------------------------------------------------.   
             ::::::::::::::::::::::::::::::::-------------------------------------------------------------------    
             ::::::::::::::::::::::::::::::::-------------------------------------------------------------------    
             ::::::::::::::::::::::::::::::::-------------------------------------------------------------------    
             ::::::::::::::::::::::::::::::::-------------------------------------------------------------------    
             .:::::::::::::::::::::::::::::::-------------------------------------------------------------------    
             .:::::::::::::::::::::::::::::::-------------------------------------------------------------------    
             .:::::::::::::::::::::::::::::::-----------------------------------------------------=------------:    
             .:::::::::::::::::::::::::::::::---------------------------------------------===-----------------=:    
             .:::::::::::::::::::::::::::::::---------------------------------------=-----=====================.    
             .:::::::::::::::::::::::::::::::--------------------------------------=--==--=====================.    
             .:::::::::::::::::::::::::::::::-------------------------------=+**===-===========================.    
             .:::::::::::::::::::::::::::::::-----------------------===+#*=====*===============================     
             .:::::::::::::::::::::::::::::::-----------------=+++++=+=+-+%%%%+*===============================     
              :::::::::::::::::::::::::::::::-----------=*#*++==#%%+=+=+*%**+==*===============================     
              :::::::::::::::::::::::::::::::----==+*+--+==*++-=%%#==*=+===+===#=============================-.     
               .--:::::::::::::::::::::::::::----=+-##=+##=*++===+===*++===+==*#=====================+-::..         
                  .:-::::::::::::::::::::::::----=+**++-*=-*++=======*+++#*==================+===:....              
                     .::-::::::::::::::::::::----=+-*+==*==*++==**++*+=================+=--:.....                   
                         .---::--::::::::::::--===+-*+==+=+*=+===================++-:.......                        
                            .::--::::::::::::----=++=+*+==================+===:........                             
                               ..----::::::::----====================+=::...........                                
                                   .-----::::--==================:...........                                       
                                      .:----:--========++---..........                                              
                                          :---====+=:...........                                                    
                                             .:.                                                                    
`;

interface ArtPoint {
  x: number;
  y: number;
  ch: string;
  segment: number; // 0: Base, 1: Lower Arm, 2: Upper Arm, 3: Claw
  color: string;
}

interface BoxPoint {
  dx: number; // offset from box center
  dy: number;
  ch: string;
  color: string;
}

function parseBoxASCII(ascii: string): BoxPoint[] {
  const lines = ascii.split("\n");
  let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
  
  // Find bounds of non-empty chars
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      if (line[x] !== " " && line[x] !== "\r" && line[x] !== undefined) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const w = maxX - minX;
  const h = maxY - minY;
  
  // Downsample to target size (16 wide, 7 high)
  const targetW = 16;
  const targetH = 7;
  
  const grid: { ch: string; color: string }[][] = Array.from({ length: targetH + 1 }, () => 
    Array.from({ length: targetW + 1 }, () => ({ ch: " ", color: "" }))
  );

  const getColor = (ch: string): string => {
    if (ch === "%" || ch === "#") return "#FFFFFF"; // Pure white highlight
    if (ch === "=" || ch === "*") return "#F4D3B2"; // Very light cream/kraft
    if (ch === "+" || ch === "-") return "#DDA15E"; // Warm golden cardboard
    if (ch === ":" || ch === ".") return "#BC6C25"; // Cardboard brown
    return "#DDA15E";
  };

  const getWeight = (ch: string): number => {
    if (ch === " " || ch === "\r") return 0;
    if (ch === "." || ch === ":" || ch === "-") return 1;
    if (ch === "+" || ch === "=" || ch === "*") return 2;
    if (ch === "#" || ch === "%") return 3;
    return 1;
  };

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch === " " || ch === "\r" || ch === "" || ch === undefined) continue;
      
      const tx = Math.min(targetW, Math.max(0, Math.round((x - minX) * (targetW / w))));
      const ty = Math.min(targetH, Math.max(0, Math.round((y - minY) * (targetH / h))));
      
      const curWeight = getWeight(grid[ty][tx].ch);
      const newWeight = getWeight(ch);
      if (newWeight > curWeight) {
        grid[ty][tx] = { ch, color: getColor(ch) };
      }
    }
  }

  const pts: BoxPoint[] = [];
  const cx = targetW / 2;
  const cy = targetH / 2;
  for (let y = 0; y <= targetH; y++) {
    for (let x = 0; x <= targetW; x++) {
      if (grid[y][x].ch !== " ") {
        pts.push({
          dx: x - cx,
          dy: y - cy,
          ch: grid[y][x].ch,
          color: grid[y][x].color,
        });
      }
    }
  }
  return pts;
}

export function initRoboticArm(box: HTMLElement, canvas: HTMLCanvasElement): ArmHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { cleanup: () => {} };

  const prefersReduced = false; // Force animation on

  const COL = {
    arm: "#FF6A2B",     // Flame/Orange highlights
    joint: "#FFEDE2",   // Cream/White
    hud: "rgba(236,234,227,0.7)", // Light grey/white
    dim: "rgba(255,109,43,0.35)",  // Dim orange
    bgDot: "rgba(255,109,43,0.12)",
  };

  const getColor = (ch: string): string => {
    if (ch === "=" || ch === "+" || ch === "*") return COL.arm;
    if (ch === "#" || ch === "%") return COL.joint;
    if (ch === ":" || ch === "-") return COL.hud;
    if (ch === ".") return COL.dim;
    return COL.hud;
  };

  // Parse ASCII art once into point array
  const lines = ASCII_ART.split("\n");
  const points: ArtPoint[] = [];

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch === " " || ch === "") continue;

      // Classify segment
      let segment = 0;
      if (y >= 47) {
        segment = 0; // Base
      } else if (y >= 25) {
        segment = 1; // Lower Arm (Body)
      } else {
        if (x >= 61) {
          segment = 3; // Claw
        } else {
          segment = 2; // Upper Arm (Forearm)
        }
      }

      points.push({
        x,
        y,
        ch,
        segment,
        color: getColor(ch),
      });
    }
  }

  // Parse custom box ASCII
  const boxPoints = parseBoxASCII(BOX_ASCII);

  let W = 0, H = 0, dpr = 1, C = 120, R = 60, cellW = 4, cellH = 7, fontPx = 7;
  let raf = 0, isVisible = true, running = false;
  let offsetX = 0, offsetY = 0;

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

    // Fit grid maintaining character aspect ratio (width = 0.6 * height)
    fontPx = Math.max(4.5, Math.min(9.5, Math.min(H / 60, (W / 120) / 0.6)));
    cellH = fontPx;
    cellW = fontPx * 0.6;
    
    C = Math.floor(W / cellW);
    R = Math.floor(H / cellH);

    // Centering offsets
    offsetX = Math.floor((C - 120) / 2);
    offsetY = Math.min(Math.floor((R - 60) / 2), R - 61);

    if (!running) {
      drawFrame();
    }
  };

  const rotate = (dx: number, dy: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos,
    };
  };

  const start = performance.now();

  function drawFrame(): boolean {
    const now = performance.now();
    const time = (now - start) / 1000;
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

    // Faint background dot field
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < C; x++) {
        if (((x * 11 + y * 17) % 23) === 0) {
          set(x, y, ".", COL.bgDot);
        }
      }
    }

    // Kinematics angle calculations based on loop phase (10 second cycle)
    const t = time % 10;
    let theta1 = 0, theta2 = 0, theta3 = 0;
    let phi = 0.08; // Claw open angle
    let bx = 92;
    let by = 48;

    const Rest = { t1: -0.05, t2: 0.0, t3: 0.0 };
    const Reach = { t1: 0.28, t2: 0.55, t3: -0.15 }; // t2 lowered so the claw stops on top of the box instead of sinking into it
    const High = { t1: -0.25, t2: -0.10, t3: 0.10 };

    // Lock the lower body + base: movement comes ONLY from the elbow up.
    // theta1 (body rotation around the base) is held at its rest pose for the
    // whole frame, so the elbow pivot is stationary and the box math stays in
    // sync with the claw. Only theta2 (forearm) and theta3 (claw) animate below.
    theta1 = Rest.t1;

    const floorX = 91;
    const floorY = 49;

    // Fine-tune where the held box sits relative to the claw so it stays
    // centered between the two fingers instead of resting on the right one.
    const boxGripDX = -6; // negative = shift box left
    const boxGripDY = 5;  // positive = shift box down

    function easeInOut(x: number): number {
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    if (t < 2.5) {
      // 1. Rest to Reach Pose
      const p = t / 2.5;
      const ep = easeInOut(p);
      theta2 = Rest.t2 + (Reach.t2 - Rest.t2) * ep;
      theta3 = Rest.t3 + (Reach.t3 - Rest.t3) * ep;
      
      if (t > 2.0) {
        // Closes claw around box between 2.0s and 2.5s
        const cp = (t - 2.0) / 0.5;
        phi = 0.08 * (1 - cp);
      } else {
        phi = 0.08;
      }
      bx = floorX;
      by = floorY;
    } else if (t < 3.5) {
      // 2. Grabbing box on the floor
      theta2 = Reach.t2;
      theta3 = Reach.t3;
      phi = 0.0;
      bx = floorX;
      by = floorY;
    } else if (t < 6.0) {
      // 3. Lifting box to High Pose
      const p = (t - 3.5) / 2.5;
      const ep = easeInOut(p);
      theta2 = Reach.t2 + (High.t2 - Reach.t2) * ep;
      theta3 = Reach.t3 + (High.t3 - Reach.t3) * ep;
      phi = 0.0;
      
      // Calculate active claw position to attach box
      const elbowLocal = rotate(35 - 55, 25 - 47, theta1);
      const ex = 55 + elbowLocal.x;
      const ey = 47 + elbowLocal.y;
      const wristLocal = rotate(75 - 35, 14 - 25, theta1 + theta2);
      const wx_wrist = ex + wristLocal.x;
      const wy_wrist = ey + wristLocal.y;
      bx = wx_wrist + Math.cos(theta1 + theta2 + theta3) * 22 + boxGripDX;
      by = wy_wrist + Math.sin(theta1 + theta2 + theta3) * 22 + boxGripDY;
    } else if (t < 6.5) {
      // 4. Holding box high
      theta2 = High.t2;
      theta3 = High.t3;
      phi = 0.0;
      
      const elbowLocal = rotate(35 - 55, 25 - 47, theta1);
      const ex = 55 + elbowLocal.x;
      const ey = 47 + elbowLocal.y;
      const wristLocal = rotate(75 - 35, 14 - 25, theta1 + theta2);
      const wx_wrist = ex + wristLocal.x;
      const wy_wrist = ey + wristLocal.y;
      bx = wx_wrist + Math.cos(theta1 + theta2 + theta3) * 22 + boxGripDX;
      by = wy_wrist + Math.sin(theta1 + theta2 + theta3) * 22 + boxGripDY;
    } else if (t < 9.0) {
      // 5. Returning to Rest Pose & Dropping the box
      const p = (t - 6.5) / 2.5;
      const ep = easeInOut(p);
      theta2 = High.t2 + (Rest.t2 - High.t2) * ep;
      theta3 = High.t3 + (Rest.t3 - High.t3) * ep;
      
      if (t < 6.8) {
        // Claw opens between 6.5s and 6.8s
        const op = (t - 6.5) / 0.3;
        phi = 0.08 * op;
      } else {
        phi = 0.08;
      }
      
      // Box drops straight down from exactly where it was being held at the
      // High pose, so there's no upward/sideways jump when the claw lets go.
      const elbowLocal = rotate(35 - 55, 25 - 47, theta1);
      const ex = 55 + elbowLocal.x;
      const ey = 47 + elbowLocal.y;
      const wristLocal = rotate(75 - 35, 14 - 25, theta1 + High.t2);
      const wx_wrist = ex + wristLocal.x;
      const wy_wrist = ey + wristLocal.y;
      const dropStartX = wx_wrist + Math.cos(theta1 + High.t2 + High.t3) * 22 + boxGripDX;
      const dropStartY = wy_wrist + Math.sin(theta1 + High.t2 + High.t3) * 22 + boxGripDY;

      const dt = t - 6.5;
      bx = dropStartX;
      by = Math.min(floorY, dropStartY + 0.5 * 60 * dt * dt);
    } else {
      // 6. Reset pose waiting on next loop
      theta2 = Rest.t2;
      theta3 = Rest.t3;
      phi = 0.08;
      bx = floorX;
      by = floorY;
    }

    // Precalculate world pivots for drawing the arm
    const elbowLocal = rotate(35 - 55, 25 - 47, theta1);
    const ex = 55 + elbowLocal.x;
    const ey = 47 + elbowLocal.y;

    const wristLocal = rotate(75 - 35, 14 - 25, theta1 + theta2);
    const wx_wrist = ex + wristLocal.x;
    const wy_wrist = ey + wristLocal.y;

    // Rotate and map all ASCII arm points
    points.forEach((p) => {
      let wx = p.x;
      let wy = p.y;

      if (p.segment === 1) {
        // Lower Arm: rotate around Base pivot (55, 47)
        const r = rotate(p.x - 55, p.y - 47, theta1);
        wx = 55 + r.x;
        wy = 47 + r.y;
      } else if (p.segment === 2) {
        // Upper Arm: rotate around Elbow pivot (ex, ey)
        const r = rotate(p.x - 35, p.y - 25, theta1 + theta2);
        wx = ex + r.x;
        wy = ey + r.y;
      } else if (p.segment === 3) {
        // Claw: wrist pivot is (75, 14).
        let cx = p.x;
        let cy = p.y;
        if (p.y >= 17 && p.x >= 86) {
          // Slide and rotate fingers based on computed phi
          if (p.x < 95) {
            // Left finger: rotate around (86, 17) and slide left
            const rLocal = rotate(p.x - 86, p.y - 17, phi);
            cx = 86 + rLocal.x - phi * 10;
            cy = 17 + rLocal.y;
          } else {
            // Right finger: rotate around (104, 17) and slide right
            const rLocal = rotate(p.x - 104, p.y - 17, -phi);
            cx = 104 + rLocal.x + phi * 10;
            cy = 17 + rLocal.y;
          }
        }
        // Rotate the entire claw (including animated fingers) around Wrist pivot
        const r = rotate(cx - 75, cy - 14, theta1 + theta2 + theta3);
        wx = wx_wrist + r.x;
        wy = wy_wrist + r.y;
      }

      // Center the arm coordinates on the canvas
      set(wx + offsetX, wy + offsetY, p.ch, p.color);
    });

    // Draw downsampled animated box
    boxPoints.forEach((pt) => {
      set(bx + pt.dx + offsetX, by + pt.dy + offsetY, pt.ch, pt.color);
    });

    // Blinking status HUD overlay inside the canvas
    if (Math.floor(time * 2) % 2 === 0) {
      set(C - 2, 2, "_", COL.hud);
    }

    // Paint to canvas
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
    return true;
  }

  const loop = () => {
    if (!running) return;
    if (isVisible) {
      const drew = drawFrame();
      if (drew && prefersReduced) { running = false; return; }
    }
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
