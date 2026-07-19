// Crawly content script: the spider, the recorder, and the player.
// Everything stays dormant until the user acts, and non-localhost
// domains additionally require explicit consent.

(() => {
'use strict';
if (window.top !== window) return;          // top frame only
if (window.__crawlyLoaded) return;
window.__crawlyLoaded = true;

const STORE = chrome.storage.local;
const TAU = Math.PI * 2;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const lerp = (a, b, t) => a + (b - a) * t;
const easeS = t => t * t * (3 - 2 * t);
const easeOut3 = t => 1 - Math.pow(1 - t, 3);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function angLerp(a, b, t) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return a + d * t;
}
const normText = el => (el && (el.textContent || '') || '').replace(/\s+/g, ' ').trim();

const THEMES = {
  noir: { body: '#141414', legs: '#141414', fang: '#141414', eye: '#ffffff', pupil: '#141414', eyeRing: null,      silkA: 0.28 },
  hero: { body: '#e02f2f', legs: '#2a49c8', fang: '#e02f2f', eye: '#ffffff', pupil: '#141414', eyeRing: '#101010', silkA: 0.32 },
};
let theme = 'noir';

const isLocal = () => ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

// per-tab, per-origin state that survives reloads and same-origin navigation
const RUN_KEY = '__crawly_run', REC_KEY = '__crawly_rec', AUTO_KEY = '__crawly_autoran';
function ssGet(k) { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function ssSet(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function ssDel(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
const fresh = (t, ms) => typeof t === 'number' && (Date.now() - t) < ms;

/* ============================================================
   Shadow UI shell
   ============================================================ */
let host = null, root = null, canvas = null, ctx = null, ui = null;

const UI_CSS = `
  .cv { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; }
  .bubble {
    position: fixed; max-width: 270px; z-index: 5;
    background: #fff; color: #111; border: 3px solid #111; border-radius: 14px;
    padding: 9px 14px 7px; font: 20px/1.12 'Bangers', 'Comic Sans MS', cursive;
    letter-spacing: .6px; box-shadow: 4px 4px 0 rgba(17,17,17,.9);
    transform: rotate(-1.2deg); animation: crawly-pop .3s cubic-bezier(.2,1.6,.4,1);
  }
  .bubble::after {
    content: ''; position: absolute; bottom: -11px; left: 24px; width: 15px; height: 15px;
    background: #fff; border-right: 3px solid #111; border-bottom: 3px solid #111;
    transform: rotate(45deg);
  }
  .bubble.below::after { bottom: auto; top: -11px; border: 0; border-left: 3px solid #111; border-top: 3px solid #111; }
  .pow {
    position: fixed; z-index: 6; transform: translate(-50%, -50%);
    font-family: 'Bangers', 'Comic Sans MS', cursive; color: #fff;
    -webkit-text-stroke: 2.5px #111; paint-order: stroke fill;
    text-shadow: 4px 4px 0 #111; letter-spacing: 2px; white-space: nowrap;
    animation: crawly-pow .4s cubic-bezier(.2,1.8,.4,1); pointer-events: none;
  }
  .pow.small { font-size: 38px; }
  .pow.big { font-size: 84px; -webkit-text-stroke: 3.5px #111; text-shadow: 6px 6px 0 #111; }
  .pow.out, .bubble.out, .chip.out { opacity: 0; transition: opacity .25s ease; }
  .chip {
    position: fixed; top: 14px; right: 14px; z-index: 7; display: flex; gap: 10px; align-items: center;
    background: #fff; border: 3px solid #111; border-radius: 999px; padding: 5px 8px 5px 14px;
    font: 17px 'Bangers', cursive; letter-spacing: 1px; color: #111;
    box-shadow: 3px 3px 0 #111; pointer-events: auto;
  }
  .chip .dot { width: 10px; height: 10px; border-radius: 50%; background: #111; animation: crawly-blink 1.1s steps(2, start) infinite; }
  .chip button {
    font: 15px 'Bangers', cursive; letter-spacing: 1px; border: 2.5px solid #111; border-radius: 999px;
    background: #111; color: #fff; padding: 3px 12px 2px; cursor: pointer;
  }
  .chip button:hover { background: #fff; color: #111; }
  .modal {
    position: fixed; inset: 0; z-index: 9; background: rgba(17,17,17,.42);
    display: flex; align-items: center; justify-content: center; pointer-events: auto;
  }
  .panel {
    background: #fff; border: 4px solid #111; border-radius: 16px; box-shadow: 9px 9px 0 #111;
    background-image: radial-gradient(circle, rgba(17,17,17,.12) 1px, transparent 1.4px);
    background-size: 12px 12px; padding: 24px 28px 22px; max-width: 400px; margin: 16px;
    text-align: center; transform: rotate(-.6deg); color: #111;
  }
  .panel h1 { font: 36px/1 'Bangers', cursive; letter-spacing: 1.5px; margin: 0 0 10px; }
  .panel .org { display: inline-block; font: 13px/1.5 ui-monospace, monospace; background: #111; color: #fff; padding: 2px 10px; border-radius: 7px; margin-bottom: 10px; }
  .panel p { font: 14px/1.45 system-ui, sans-serif; margin: 0 0 16px; }
  .panel .row { display: flex; gap: 12px; justify-content: center; }
  .btn {
    font: 22px 'Bangers', cursive; letter-spacing: 1.5px; padding: 7px 24px 5px;
    border: 3px solid #111; border-radius: 10px; background: #fff; color: #111;
    cursor: pointer; box-shadow: 3px 3px 0 #111;
  }
  .btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 #111; }
  .btn.primary { background: #111; color: #fff; }
  .btn.primary:hover { background: #fff; color: #111; }
  .btn:not(.primary):hover { background: #111; color: #fff; }
  @keyframes crawly-pop { from { transform: scale(.4) rotate(-1.2deg); } }
  @keyframes crawly-pow { from { transform: translate(-50%,-50%) scale(.2); } 60% { transform: translate(-50%,-50%) scale(1.22); } }
  @keyframes crawly-blink { to { opacity: .15; } }
`;

function injectFont() {
  const url = chrome.runtime.getURL('fonts/bangers.woff2');
  const css = `@font-face { font-family: 'Bangers'; src: url('${url}') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }`;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } catch (e) {
    const st = document.createElement('style');
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }
}

function ensureUI() {
  if (host) return;
  injectFont();
  host = document.createElement('div');
  host.id = '__crawly_host';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  root = host.attachShadow({ mode: 'open' });
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(UI_CSS);
    root.adoptedStyleSheets = [sheet];
  } catch (e) {
    const st = document.createElement('style');
    st.textContent = UI_CSS;
    root.appendChild(st);
  }
  canvas = document.createElement('canvas');
  canvas.className = 'cv';
  root.appendChild(canvas);
  ui = document.createElement('div');
  root.appendChild(ui);
  ctx = canvas.getContext('2d');
  document.documentElement.appendChild(host);
  resizeCanvas();
  addEventListener('resize', resizeCanvas);
}

/* ============================================================
   Spider engine
   ============================================================ */
let W = innerWidth, H = innerHeight, DPR = 1;
function resizeCanvas() {
  W = innerWidth; H = innerHeight;
  if (!canvas) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  canvas.width = W * DPR; canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

const R = 11;
const MAXV = 115;
const ZIP_DIST = 300;
const CROUCH_T = 0.06, SHOOT_T = 0.1, HOLD_T = 0.1;
const AIM_T = CROUCH_T + SHOOT_T + HOLD_T;
const ZIP_T = 0.1;

const spider = { x: 200, y: 200, vx: 0, vy: 0, heading: -Math.PI / 2, speed: 0, mode: 'walk', modeT: 0, cool: 0 };
const zipFrom = { x: 0, y: 0 }, land = { x: 0, y: 0 };
const web = { ax: 0, ay: 0, lineA: 0, splatA: 0 };
const pointer = { x: innerWidth / 2, y: innerHeight / 2, moved: false };
let visible = false, roaming = false, running = false, typing = false;
let goal = null;            // {x, y, resolve, age}
let faceAt = null;          // look/turn target while standing still
let tagOnly = false;        // aim that only tags with silk, no zip
let dropState = null;       // {toY, resolve} while mode is drop / ascend
let hopState = null;        // {fx, fy, tx, ty, resolve} while mode is hop
let airLift = 0;            // 0..1, how high off the ground mid-jump
let landT = 0;              // landing squash timer
let blinkT = 0, nextBlink = 2.5;

addEventListener('mousemove', e => {
  pointer.x = e.clientX; pointer.y = e.clientY; pointer.moved = true;
  if (rec) maybeRecordMove(e.clientX, e.clientY);
}, { passive: true, capture: true });

const LEG_DEF = [
  { a: -0.6, r: 36 }, { a: -1.15, r: 38 }, { a: -1.95, r: 38 }, { a: -2.55, r: 34 },
  { a:  0.6, r: 36 }, { a:  1.15, r: 38 }, { a:  1.95, r: 38 }, { a:  2.55, r: 34 },
];
const legs = LEG_DEF.map((d, i) => ({
  ang: d.a, rest: d.r,
  bend: (i < 4 ? -1 : 1) * (Math.abs(d.a) < 1.5 ? 1 : -1),
  fx: 0, fy: 0, stepping: false, st: 0, sx: 0, sy: 0, tx: 0, ty: 0,
}));
const BLOCKERS = legs.map((_, i) => {
  const base = i < 4 ? 0 : 4, j = i - base, out = [];
  if (j > 0) out.push(base + j - 1);
  if (j < 3) out.push(base + j + 1);
  out.push(i < 4 ? i + 4 : i - 4);
  return out;
});

function homeFoot(leg, lead) {
  const a = spider.heading + leg.ang;
  return {
    x: spider.x + Math.cos(a) * leg.rest + spider.vx * lead,
    y: spider.y + Math.sin(a) * leg.rest + spider.vy * lead,
  };
}
function plantFeet(jitter) {
  for (const leg of legs) {
    const h = homeFoot(leg, 0);
    leg.stepping = false;
    leg.fx = h.x + (Math.random() - 0.5) * jitter;
    leg.fy = h.y + (Math.random() - 0.5) * jitter;
  }
}

function currentTarget() {
  if (goal) return goal;
  if (roaming && pointer.moved) return pointer;
  return spider;
}

function update(dt) {
  if (spider.mode === 'drop' || spider.mode === 'ascend') {
    spider.modeT += dt;
    const up = spider.mode === 'ascend';
    const dur = up ? 0.5 : 0.6;
    const t = Math.min(spider.modeT / dur, 1);
    const k = up ? t * t : easeOut3(t);
    spider.y = lerp(dropState.fromY, dropState.toY, k);
    spider.heading = angLerp(spider.heading, Math.PI / 2, 1 - Math.pow(0.001, dt));
    for (const leg of legs) { // legs dangle in a loose ball on the thread
      const a = spider.heading + leg.ang;
      leg.fx = spider.x + Math.cos(a) * leg.rest * 0.5;
      leg.fy = spider.y + Math.sin(a) * leg.rest * 0.5 - 4;
      leg.stepping = false;
    }
    if (t >= 1) {
      const done = dropState; dropState = null;
      spider.mode = 'walk'; spider.vx = 0; spider.vy = 20;
      if (!up) plantFeet(9);
      done.resolve && done.resolve();
    }
    blinkT += dt;
    if (blinkT > nextBlink) { blinkT = 0; nextBlink = 2 + Math.random() * 3.5; }
    return;
  }

  const tgt = currentTarget();
  const dx = tgt.x - spider.x, dy = tgt.y - spider.y;
  const d = Math.hypot(dx, dy);
  const stopR = 30;

  if (spider.mode === 'walk') {
    spider.cool = Math.max(0, spider.cool - dt);
    const mayZip = goal ? true : (roaming && pointer.moved);
    if (mayZip && spider.cool <= 0 && d > ZIP_DIST) {
      spider.mode = 'aim'; spider.modeT = 0;
      web.ax = tgt.x; web.ay = tgt.y;
      web.lineA = 0; web.splatA = 0;
    }
  }

  if (spider.mode === 'aim') {
    spider.modeT += dt;
    spider.vx *= Math.pow(0.001, dt);
    spider.vy *= Math.pow(0.001, dt);
    spider.x += spider.vx * dt;
    spider.y += spider.vy * dt;
    spider.heading = angLerp(spider.heading, Math.atan2(web.ay - spider.y, web.ax - spider.x), 1 - Math.pow(1e-7, dt));
    if (spider.modeT > CROUCH_T) web.lineA = 1;
    if (spider.modeT > CROUCH_T + SHOOT_T && !web.splatA) { web.splatA = 1; powAt('THWIP!', web.ax, web.ay - 24, false); }
    if (spider.modeT >= AIM_T && tagOnly) {
      // silk tag only: mark the spot, stay put
      tagOnly = false;
      spider.mode = 'walk';
      spider.cool = 0.4;
    } else if (spider.modeT >= AIM_T) {
      spider.mode = 'zip'; spider.modeT = 0;
      zipFrom.x = spider.x; zipFrom.y = spider.y;
      const zd = Math.hypot(web.ax - spider.x, web.ay - spider.y) || 1;
      const zux = (web.ax - spider.x) / zd, zuy = (web.ay - spider.y) / zd;
      land.x = clamp(web.ax - zux * 26, 24, W - 24);
      land.y = clamp(web.ay - zuy * 26, 24, H - 24);
      spider.heading = Math.atan2(zuy, zux);
      for (const leg of legs) leg.stepping = false;
    }
  } else if (spider.mode === 'zip') {
    spider.modeT += dt;
    const tt = Math.min(spider.modeT / ZIP_T, 1);
    const e = easeOut3(tt);
    const nx = lerp(zipFrom.x, land.x, e), ny = lerp(zipFrom.y, land.y, e);
    spider.vx = (nx - spider.x) / Math.max(dt, 0.001);
    spider.vy = (ny - spider.y) / Math.max(dt, 0.001);
    spider.x = nx; spider.y = ny;
    for (const leg of legs) {
      const a = spider.heading + leg.ang;
      leg.fx = spider.x + Math.cos(a) * leg.rest * 0.45 - Math.cos(spider.heading) * 7;
      leg.fy = spider.y + Math.sin(a) * leg.rest * 0.45 - Math.sin(spider.heading) * 7;
    }
    if (tt >= 1) {
      spider.mode = 'walk'; spider.cool = 0.35;
      const sp = Math.hypot(spider.vx, spider.vy) || 1;
      spider.vx = (spider.vx / sp) * 25;
      spider.vy = (spider.vy / sp) * 25;
      plantFeet(9);
    }
  } else if (spider.mode === 'hop') {
    spider.modeT += dt;
    const HOP_T = 0.3;
    const tt = Math.min(spider.modeT / HOP_T, 1);
    const e = easeS(tt);
    const hs = hopState;
    const nx = lerp(hs.fx, hs.tx, e), ny = lerp(hs.fy, hs.ty, e);
    spider.vx = (nx - spider.x) / Math.max(dt, 0.001);
    spider.vy = (ny - spider.y) / Math.max(dt, 0.001);
    spider.x = nx; spider.y = ny;
    airLift = Math.sin(Math.PI * tt);
    for (const leg of legs) { // tuck in mid-air
      const a = spider.heading + leg.ang;
      leg.fx = spider.x + Math.cos(a) * leg.rest * 0.5;
      leg.fy = spider.y + Math.sin(a) * leg.rest * 0.5;
      leg.stepping = false;
    }
    if (tt >= 1) {
      spider.mode = 'walk';
      airLift = 0; landT = 0.12;
      spider.cool = Math.max(spider.cool, 0.2);
      spider.vx = 0; spider.vy = 0;
      plantFeet(8);
      const done = hopState; hopState = null;
      done.resolve && done.resolve();
    }
  } else {
    let want = 0;
    if (d > stopR) want = Math.min(MAXV, (d - stopR) * 2.2);
    const ux = d > 0.001 ? dx / d : 0, uy = d > 0.001 ? dy / d : 0;
    const k = 1 - Math.pow(0.002, dt);
    spider.vx = lerp(spider.vx, ux * want, k);
    spider.vy = lerp(spider.vy, uy * want, k);
    spider.x = clamp(spider.x + spider.vx * dt, 24, W - 24);
    spider.y = clamp(spider.y + spider.vy * dt, 24, H - 24);
    const sp = Math.hypot(spider.vx, spider.vy);
    if (sp > 8) {
      spider.heading = angLerp(spider.heading, Math.atan2(spider.vy, spider.vx), 1 - Math.pow(0.001, dt));
    } else if (d > stopR + 6) {
      spider.heading = angLerp(spider.heading, Math.atan2(dy, dx), 1 - Math.pow(0.02, dt));
    } else if (faceAt) {
      spider.heading = angLerp(spider.heading, Math.atan2(faceAt.y - spider.y, faceAt.x - spider.x), 1 - Math.pow(0.004, dt));
    }
    web.lineA = Math.max(0, web.lineA - dt * 7);
    web.splatA = Math.max(0, web.splatA - dt * 1.8);
  }
  spider.speed = Math.hypot(spider.vx, spider.vy);
  landT = Math.max(0, landT - dt);

  // arrival check for scripted goals (with a safety valve)
  if (goal) {
    goal.age = (goal.age || 0) + dt;
    if ((spider.mode === 'walk' && d < stopR + 5 && spider.speed < 16) || goal.age > 6) {
      const g = goal; goal = null;
      g.resolve();
    }
  }

  if (spider.mode !== 'zip' && spider.mode !== 'hop') {
    const speedT = Math.min(spider.speed / MAXV, 1);
    const stepDur = lerp(0.22, 0.11, speedT);
    const trig = spider.speed < 15 ? 6 : 13 * (1 - 0.25 * speedT);
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      if (leg.stepping) {
        leg.st += dt / stepDur;
        if (leg.st >= 1) { leg.stepping = false; leg.fx = leg.tx; leg.fy = leg.ty; }
        continue;
      }
      const home = homeFoot(leg, 0.13);
      const off = Math.hypot(home.x - leg.fx, home.y - leg.fy);
      if (off > trig) {
        const blocked = BLOCKERS[i].some(j => legs[j].stepping);
        if (!blocked || off > trig * 1.8) {
          leg.stepping = true; leg.st = 0;
          leg.sx = leg.fx; leg.sy = leg.fy;
          const oa = Math.atan2(home.y - leg.fy, home.x - leg.fx);
          const over = Math.min(off * 0.35, 8);
          leg.tx = home.x + Math.cos(oa) * over;
          leg.ty = home.y + Math.sin(oa) * over;
        }
      }
    }
  }

  blinkT += dt;
  if (blinkT > nextBlink) { blinkT = 0; nextBlink = 2 + Math.random() * 3.5; }
}

function footPos(leg) {
  if (!leg.stepping) return { x: leg.fx, y: leg.fy, lift: 0 };
  const e = easeS(leg.st);
  return { x: lerp(leg.sx, leg.tx, e), y: lerp(leg.sy, leg.ty, e), lift: Math.sin(leg.st * Math.PI) };
}

function drawLeg(hipx, hipy, fx, fy, bodyX, bodyY, bend, lift) {
  let dx = fx - hipx, dy = fy - hipy;
  const d = Math.hypot(dx, dy) || 0.001;
  const maxD = 41;
  let ex = fx, ey = fy;
  if (d > maxD) { ex = hipx + (dx / d) * maxD; ey = hipy + (dy / d) * maxD; }
  ey -= lift * 3;
  const cdx = ex - hipx, cdy = ey - hipy;
  const cd = Math.hypot(cdx, cdy) || 0.001;
  const mx = (hipx + ex) / 2, my = (hipy + ey) / 2;
  const ox = mx - bodyX, oy = my - bodyY;
  const od = Math.hypot(ox, oy) || 0.001;
  const arch = 8 * (1 + lift * 0.9);
  const cx = mx + (-cdy / cd) * arch * bend + (ox / od) * 2.5;
  const cy = my + (cdx / cd) * arch * bend + (oy / od) * 2.5;
  ctx.beginPath();
  ctx.moveTo(hipx, hipy);
  ctx.quadraticCurveTo(cx, cy, ex, ey);
  ctx.stroke();
}

function drawWeb(headX, headY, P) {
  let lineA = 0, tipP = 1;
  if (spider.mode === 'aim') {
    if (spider.modeT > CROUCH_T) { lineA = 1; tipP = Math.min((spider.modeT - CROUCH_T) / SHOOT_T, 1); }
  } else if (spider.mode === 'zip') {
    lineA = 1;
  } else if (spider.mode === 'drop' || spider.mode === 'ascend') {
    // silk thread straight up while dropping in or leaving
    ctx.strokeStyle = `rgba(17,17,17,${P.silkA})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(spider.x, 0);
    ctx.lineTo(spider.x, spider.y - 6);
    ctx.stroke();
    return;
  } else if (web.lineA > 0) {
    lineA = web.lineA;
  }
  if (lineA > 0) {
    const e = easeOut3(tipP);
    const tx = lerp(headX, web.ax, e), ty = lerp(headY, web.ay, e);
    ctx.strokeStyle = `rgba(17,17,17,${(P.silkA * lineA).toFixed(3)})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    if (tipP < 1) {
      ctx.fillStyle = 'rgba(17,17,17,0.4)';
      ctx.beginPath(); ctx.arc(tx, ty, 2, 0, TAU); ctx.fill();
    }
  }
  if (web.splatA > 0) {
    const a = web.splatA;
    ctx.strokeStyle = `rgba(17,17,17,${(0.34 * a).toFixed(3)})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const an = (i / 6) * TAU + 0.26;
      ctx.beginPath();
      ctx.moveTo(web.ax + Math.cos(an) * 1.5, web.ay + Math.sin(an) * 1.5);
      ctx.lineTo(web.ax + Math.cos(an) * 6, web.ay + Math.sin(an) * 6);
      ctx.stroke();
    }
  }
}

function draw(t) {
  ctx.clearRect(0, 0, W, H);
  const P = THEMES[theme] || THEMES.noir;
  const hx = Math.cos(spider.heading), hy = Math.sin(spider.heading);
  const px = -hy, py = hx;
  const zipping = spider.mode === 'zip';
  const hopping = spider.mode === 'hop';
  const dropping = spider.mode === 'drop' || spider.mode === 'ascend';
  const crouch = spider.mode === 'aim' && spider.modeT < CROUCH_T;
  const speedT = Math.min(spider.speed / MAXV, 1);
  const holding = spider.mode === 'aim' && spider.modeT > CROUCH_T + SHOOT_T;
  let wob = zipping || hopping || dropping ? 0 : Math.sin(t * 15) * speedT * 1.1;
  if (holding) wob = Math.sin(t * 48) * 1.3;
  if (typing) wob = Math.sin(t * 28) * 0.5;
  const breathe = Math.sin(t * 2.1) * 0.5 * (1 - speedT);
  const bx = spider.x + px * wob;
  const by = spider.y + py * wob;
  // squash on crouch, squash again right after a jump lands
  let squish = crouch ? 0.92 : 1;
  if (landT > 0) squish = 0.86 + 0.14 * (1 - landT / 0.12);

  const headR = R * squish;
  const hcx = bx + hx * R * (0.7 + (zipping ? 0.18 : 0));
  const hcy = by + hy * R * (0.7 + (zipping ? 0.18 : 0));

  if (!dropping) {
    // the shadow stays on the ground and shrinks while the spider is airborne
    const shScale = 1 - airLift * 0.4;
    ctx.save();
    ctx.translate(spider.x, spider.y + 6);
    ctx.rotate(spider.heading);
    ctx.fillStyle = `rgba(17,17,17,${(zipping ? 0.03 : 0.05) * (1 - airLift * 0.5)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24 * shScale, 16 * shScale, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawWeb(hcx + hx * headR * 0.85, hcy + hy * headR * 0.85, P);

  // everything from here up is the spider itself; lift it off the page mid-jump
  ctx.save();
  ctx.translate(0, -airLift * 26);

  ctx.strokeStyle = P.legs;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  for (const leg of legs) {
    let f = footPos(leg);
    let lift = zipping || hopping ? 1 : f.lift;
    if (spider.mode === 'aim' && Math.abs(leg.ang) < 0.7) {
      const fa = spider.heading + leg.ang * 0.5;
      f = { x: bx + Math.cos(fa) * leg.rest * 0.92, y: by + Math.sin(fa) * leg.rest * 0.92 };
      lift = 1;
    } else if (typing && Math.abs(leg.ang) < 0.7) {
      // front pair taps away at the field like little typing hands
      const fa = spider.heading + leg.ang * 0.5;
      const tap = Math.max(0, Math.sin(t * 14 + (leg.ang < 0 ? 0 : Math.PI)));
      f = { x: bx + Math.cos(fa) * leg.rest * 0.8, y: by + Math.sin(fa) * leg.rest * 0.8 };
      lift = tap * 0.9;
    }
    const ha = spider.heading + leg.ang;
    const hipx = bx + Math.cos(ha) * R * 0.75;
    const hipy = by + Math.sin(ha) * R * 0.75;
    drawLeg(hipx, hipy, f.x, f.y, bx, by, leg.bend, lift);
  }

  ctx.fillStyle = P.body;
  const abR = (R * 1.45 + breathe) * squish;
  const stretch = zipping ? 1.18 : 1;
  ctx.beginPath();
  ctx.ellipse(bx - hx * R * 1.25, by - hy * R * 1.25, abR * 1.06 * stretch, abR, spider.heading, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hcx, hcy, headR, 0, TAU);
  ctx.fill();

  ctx.fillStyle = P.fang;
  for (const s of [-1, 1]) {
    const fx = hcx + hx * headR * 1.18 + px * headR * 0.32 * s;
    const fy = hcy + hy * headR * 1.18 + py * headR * 0.32 * s;
    ctx.beginPath(); ctx.arc(fx, fy, 1.7, 0, TAU); ctx.fill();
  }

  let open = 1;
  if (blinkT < 0.13) {
    const q = blinkT / 0.13;
    open = q < 0.5 ? 1 - q * 2 : (q - 0.5) * 2;
    open = Math.max(open, 0.08);
  }
  const look = faceAt || currentTarget();
  for (const s of [-1, 1]) {
    const ex = hcx + hx * headR * 0.42 + px * headR * 0.46 * s;
    const ey = hcy + hy * headR * 0.42 + py * headR * 0.46 * s;
    ctx.fillStyle = P.eye;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 4, 4 * open, spider.heading, 0, TAU);
    ctx.fill();
    if (P.eyeRing) {
      ctx.strokeStyle = P.eyeRing;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(ex, ey, 4, 4 * open, spider.heading, 0, TAU);
      ctx.stroke();
    }
    if (open > 0.35) {
      let ldx = look.x - ex, ldy = look.y - ey;
      const ld = Math.hypot(ldx, ldy) || 1;
      ldx /= ld; ldy /= ld;
      ctx.fillStyle = P.pupil;
      ctx.beginPath();
      ctx.ellipse(ex + ldx * 1.4, ey + ldy * 1.4, 2, 2 * open, 0, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore(); // end of airborne lift
}

let rafId = 0, lastT = 0;
function frame(now) {
  if (!visible) { rafId = 0; return; }
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now;
  update(dt);
  draw(now / 1000);
  rafId = requestAnimationFrame(frame);
}
function showSpider() {
  ensureUI();
  if (visible) return;
  visible = true;
  canvas.style.display = '';
  lastT = performance.now();
  if (!rafId) rafId = requestAnimationFrame(frame);
}
function hideSpider() {
  visible = false;
  if (canvas) { canvas.style.display = 'none'; ctx.clearRect(0, 0, W, H); }
}

function goTo(x, y) {
  return new Promise(res => { goal = { x: clamp(x, 24, W - 24), y: clamp(y, 24, H - 24), resolve: res, age: 0 }; });
}
// a short pounce through the air, landing right on the target
function hop(x, y) {
  return new Promise(res => {
    spider.mode = 'hop'; spider.modeT = 0;
    hopState = { fx: spider.x, fy: spider.y, tx: clamp(x, 24, W - 24), ty: clamp(y, 24, H - 24), resolve: res };
    const d = Math.hypot(x - spider.x, y - spider.y);
    if (d > 2) spider.heading = Math.atan2(y - spider.y, x - spider.x);
    for (const leg of legs) leg.stepping = false;
  });
}
// while roaming or recording, pounce on whatever the user clicks
addEventListener('click', e => {
  if (!visible || !roaming || running || goal || dropState || hopState) return;
  if (spider.mode !== 'walk') return;
  if (ownUI(e)) return;
  const d = Math.hypot(e.clientX - spider.x, e.clientY - spider.y);
  if (d > 260) return; // too far to pounce, the chase handles it
  hop(e.clientX, e.clientY);
}, { capture: true, passive: true });
function dropIn(x) {
  showSpider();
  spider.x = clamp(x != null ? x : W / 2, 40, W - 40);
  spider.y = -60;
  spider.vx = 0; spider.vy = 0;
  spider.heading = Math.PI / 2;
  spider.mode = 'drop'; spider.modeT = 0;
  powAt('THWIP!', spider.x, 70, false);
  return new Promise(res => { dropState = { fromY: -60, toY: Math.min(H * 0.34, 260), resolve: res }; });
}
function ascend() {
  spider.mode = 'ascend'; spider.modeT = 0;
  return new Promise(res => {
    dropState = { fromY: spider.y, toY: -70, resolve: () => { hideSpider(); res(); } };
  });
}

/* ============================================================
   Comic UI: bubbles, onomatopoeia, chip, consent
   ============================================================ */
let bubbleEl = null, bubbleTimer = 0;
function bubble(text, ms) {
  ensureUI();
  if (bubbleEl) { bubbleEl.remove(); bubbleEl = null; }
  clearTimeout(bubbleTimer);
  const b = document.createElement('div');
  b.className = 'bubble';
  b.textContent = text;
  let x, y, below = false;
  if (visible) {
    x = clamp(spider.x - 30, 12, W - 290);
    if (spider.y > 150) { y = spider.y - 64; b.style.transform += ''; } else { y = spider.y + 46; below = true; }
    y = clamp(y - 40, 10, H - 120);
  } else { x = clamp(W / 2 - 140, 12, W - 290); y = 18; }
  if (below) b.classList.add('below');
  b.style.left = x + 'px';
  b.style.top = y + 'px';
  ui.appendChild(b);
  bubbleEl = b;
  bubbleTimer = setTimeout(() => {
    b.classList.add('out');
    setTimeout(() => { if (bubbleEl === b) bubbleEl = null; b.remove(); }, 300);
  }, ms || 1600);
}

function powAt(word, x, y, big) {
  ensureUI();
  const p = document.createElement('div');
  p.className = 'pow ' + (big ? 'big' : 'small');
  p.textContent = word;
  p.style.left = clamp(x, 70, W - 70) + 'px';
  p.style.top = clamp(y, 50, H - 50) + 'px';
  p.style.transform += ` rotate(${(Math.random() * 16 - 9).toFixed(1)}deg)`;
  ui.appendChild(p);
  setTimeout(() => p.classList.add('out'), big ? 1100 : 700);
  setTimeout(() => p.remove(), big ? 1500 : 1050);
}

let chipEl = null;
function showChip() {
  ensureUI();
  if (chipEl) return;
  const c = document.createElement('div');
  c.className = 'chip';
  c.innerHTML = `<span class="dot"></span><span class="n">REC 0</span>`;
  const stop = document.createElement('button');
  stop.textContent = 'STOP';
  stop.addEventListener('click', () => { stopRecording(null); });
  c.appendChild(stop);
  ui.appendChild(c);
  chipEl = c;
}
function chipCount(n) {
  if (chipEl) chipEl.querySelector('.n').textContent = 'REC ' + n;
}
function hideChip() {
  if (!chipEl) return;
  const c = chipEl; chipEl = null;
  c.classList.add('out');
  setTimeout(() => c.remove(), 300);
}

function isPaymentOrOtpField(el) {
  const ac = (el.getAttribute('autocomplete') || '').toLowerCase().trim();
  return ac.startsWith('cc-') || ac === 'one-time-code';
}
function isPasswordField(el) {
  if (!el || el.tagName !== 'INPUT') return false;
  const ty = (el.type || 'text').toLowerCase();
  if (ty === 'password') return true;
  const ac = (el.getAttribute('autocomplete') || '').toLowerCase().trim();
  return ac === 'current-password' || ac === 'new-password';
}
function pageHasPasswordFields() {
  return !!document.querySelector(
    'input[type="password"], input[autocomplete="current-password"], input[autocomplete="new-password"]'
  );
}

async function askPasswordChoice() {
  return new Promise(res => {
    ensureUI();
    const m = document.createElement('div');
    m.className = 'modal';
    const panel = document.createElement('div');
    panel.className = 'panel';
    const h = document.createElement('h1'); h.textContent = 'PASSWORDS ON THIS PAGE!';
    const p = document.createElement('p');
    p.textContent = 'If you record password fields, Crawly saves what you type as plaintext in your browser. Anyone with access to this Chrome profile could read it. Payment card and one-time-code fields are always skipped.';
    const row = document.createElement('div'); row.className = 'row';
    const skip = document.createElement('button'); skip.className = 'btn primary'; skip.textContent = 'SKIP PASSWORDS';
    const record = document.createElement('button'); record.className = 'btn'; record.textContent = 'RECORD ANYWAY';
    row.append(skip, record);
    panel.append(h, p, row);
    m.appendChild(panel);
    ui.appendChild(m);
    const finish = choice => { m.remove(); res(choice); };
    skip.addEventListener('click', () => finish(false));
    record.addEventListener('click', () => finish(true));
  });
}

// Consent is now gated by chrome.permissions at the extension level; the script
// only runs on origins the user granted from the popup, so we always return true.
async function ensureConsent() { return true; }

/* ============================================================
   Selector building and resolving
   ============================================================ */
function attrEsc(v) { return String(v).replace(/"/g, '\\"'); }

function cssPath(el) {
  const parts = [];
  let cur = el, hops = 0;
  while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement && hops < 7) {
    let part = cur.tagName.toLowerCase();
    if (cur.id) { parts.unshift('#' + CSS.escape(cur.id)); cur = null; break; }
    const parent = cur.parentElement;
    if (parent) {
      const same = [...parent.children].filter(c => c.tagName === cur.tagName);
      if (same.length > 1) part += `:nth-of-type(${same.indexOf(cur) + 1})`;
    }
    parts.unshift(part);
    cur = parent; hops++;
  }
  return parts.join(' > ');
}

function buildSelectors(el) {
  const s = [];
  const tag = el.tagName.toLowerCase();
  for (const attr of ['data-testid', 'data-test', 'data-cy']) {
    const v = el.getAttribute(attr);
    if (v) s.push(`[${attr}="${attrEsc(v)}"]`);
  }
  if (el.id) s.push('#' + CSS.escape(el.id));
  if (el.getAttribute('name')) s.push(`${tag}[name="${attrEsc(el.getAttribute('name'))}"]`);
  const al = el.getAttribute('aria-label');
  if (al) s.push(`${tag}[aria-label="${attrEsc(al)}"]`);
  const ph = el.getAttribute('placeholder');
  if (ph) s.push(`${tag}[placeholder="${attrEsc(ph)}"]`);
  const path = cssPath(el);
  if (path) s.push(path);
  return [...new Set(s)];
}

function labelFor(el) {
  const t = el.tagName.toLowerCase();
  let lab = el.getAttribute('aria-label') || el.getAttribute('placeholder') || '';
  if (!lab && el.id) {
    const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (l) lab = normText(l);
  }
  if (!lab && (t === 'button' || t === 'a' || el.getAttribute('role') === 'button')) lab = normText(el);
  if (!lab && t === 'input' && (el.type === 'submit' || el.type === 'button')) lab = el.value;
  if (!lab) lab = el.getAttribute('name') || el.id || t;
  lab = String(lab).replace(/\s+/g, ' ').trim();
  return lab.length > 42 ? lab.slice(0, 40) + '..' : (lab || t);
}

function isVisible(el) {
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return false;
  const cs = getComputedStyle(el);
  return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
}
function isDisabled(el) {
  return !!(el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('fieldset[disabled]'));
}

async function resolveStep(step, timeout) {
  const t0 = performance.now();
  while (performance.now() - t0 < timeout) {
    for (const sel of step.selectors || []) {
      let els = [];
      try { els = [...document.querySelectorAll(sel)]; } catch (e) { continue; }
      els = els.filter(isVisible);
      if (els.length === 1) return els[0];
      if (els.length > 1) {
        if (step.text) {
          const m = els.find(e => normText(e) === step.text);
          if (m) return m;
        }
        return els[0];
      }
    }
    if (step.text && step.tag) {
      const m = [...document.querySelectorAll(step.tag)].find(e => isVisible(e) && normText(e) === step.text);
      if (m) return m;
    }
    if (step.type === 'click' && step.x != null) {
      const m = document.elementFromPoint(clamp(step.x, 0, W - 1), clamp(step.y, 0, H - 1));
      if (m && m !== document.body && m !== document.documentElement && !host.contains(m)) return m;
    }
    await sleep(150);
  }
  return null;
}

/* ============================================================
   Recorder
   ============================================================ */
let rec = null; // { steps, fillEls, fillIdx, selEls, selIdx, lastMoveT, lastMX, lastMY }

function ownUI(e) {
  return host && e.composedPath && e.composedPath().includes(host);
}

function persistRec() {
  if (rec) ssSet(REC_KEY, { steps: rec.steps, recordPasswords: !!rec.recordPasswords, t: Date.now() });
}

// moves are recorded in short bursts: 0.5s from the first move, then muted
// until the next click or focus/blur. when the mute kicks in, the spider
// stops chasing, faces the cursor, and tags it with silk.
function maybeRecordMove(x, y) {
  if (!rec || rec.movesMuted) return;
  const now = performance.now();
  if (rec.moveBurstStart == null) rec.moveBurstStart = now;
  if (now - rec.moveBurstStart > 500) {
    rec.movesMuted = true;
    if (visible && !running && spider.mode === 'walk') {
      roaming = false; // enough chasing
      tagOnly = true;
      spider.mode = 'aim'; spider.modeT = 0;
      web.ax = x; web.ay = y;
      web.lineA = 0; web.splatA = 0;
    }
    return;
  }
  if (now - rec.lastMoveT > 120 && Math.hypot(x - rec.lastMX, y - rec.lastMY) > 40) {
    rec.steps.push({ type: 'move', x: Math.round(x), y: Math.round(y) });
    rec.lastMoveT = now; rec.lastMX = x; rec.lastMY = y;
    chipCount(rec.steps.length);
    persistRec();
  }
}

// a click or focus/blur is a real interaction: moves may record again
function recAnchor() {
  if (!rec) return;
  rec.movesMuted = false;
  rec.moveBurstStart = null;
  if (!running && !roaming) { roaming = true; showSpider(); }
}
function onFocusCap() { recAnchor(); }

function onClickCap(e) {
  if (!rec || ownUI(e)) return;
  recAnchor();
  let t = e.composedPath ? e.composedPath()[0] : e.target;
  if (!(t instanceof Element)) t = e.target;
  if (!(t instanceof Element)) return;
  const a = (t.closest && t.closest('button, a, [role="button"], input, select, textarea, label, summary, [onclick]')) || t;
  const tag = a.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (tag === 'INPUT') {
    const ty = (a.type || 'text').toLowerCase();
    if (!['checkbox', 'radio', 'button', 'submit', 'reset'].includes(ty)) return;
  }
  rec.steps.push({
    type: 'click',
    selectors: buildSelectors(a),
    label: labelFor(a),
    tag: a.tagName.toLowerCase(),
    text: normText(a).slice(0, 60) || null,
    x: Math.round(e.clientX), y: Math.round(e.clientY),
  });
  chipCount(rec.steps.length);
  persistRec();
}

function onInputCap(e) {
  if (!rec || ownUI(e)) return;
  recAnchor();
  const el = e.target;
  if (!(el instanceof Element)) return;
  if (el.tagName === 'INPUT') {
    const ty = (el.type || 'text').toLowerCase();
    if (['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color'].includes(ty)) return;
    if (isPaymentOrOtpField(el)) return;
    if (isPasswordField(el) && !rec.recordPasswords) return;
  } else if (el.tagName !== 'TEXTAREA') return;
  const k = rec.fillEls.indexOf(el);
  if (k >= 0) {
    rec.steps[rec.fillIdx[k]].value = el.value;
  } else {
    rec.fillEls.push(el);
    rec.steps.push({
      type: 'fill',
      selectors: buildSelectors(el),
      label: labelFor(el),
      value: el.value,
      inputType: el.tagName === 'TEXTAREA' ? 'textarea' : (el.type || 'text'),
    });
    rec.fillIdx.push(rec.steps.length - 1);
  }
  chipCount(rec.steps.length);
  persistRec();
}

function onChangeCap(e) {
  if (!rec || ownUI(e)) return;
  recAnchor();
  const el = e.target;
  if (!(el instanceof Element) || el.tagName !== 'SELECT') return;
  const k = rec.selEls.indexOf(el);
  if (k >= 0) {
    rec.steps[rec.selIdx[k]].value = el.value;
  } else {
    rec.selEls.push(el);
    rec.steps.push({ type: 'select', selectors: buildSelectors(el), label: labelFor(el), value: el.value });
    rec.selIdx.push(rec.steps.length - 1);
  }
  chipCount(rec.steps.length);
  persistRec();
}

async function startRecording() {
  if (rec || running) return { ok: false, reason: rec ? 'already-recording' : 'running' };
  const ok = await ensureConsent(true);
  if (!ok) return { ok: false, reason: 'consent' };
  const recordPasswords = pageHasPasswordFields() ? await askPasswordChoice() : false;
  ssDel(RUN_KEY);
  rec = { steps: [], fillEls: [], fillIdx: [], selEls: [], selIdx: [], lastMoveT: 0, lastMX: -999, lastMY: -999, moveBurstStart: null, movesMuted: false, recordPasswords };
  persistRec();
  document.addEventListener('click', onClickCap, true);
  document.addEventListener('input', onInputCap, true);
  document.addEventListener('change', onChangeCap, true);
  document.addEventListener('focusin', onFocusCap, true);
  document.addEventListener('focusout', onFocusCap, true);
  showChip(); chipCount(0);
  roaming = true;
  showSpider();
  spider.x = clamp(pointer.moved ? pointer.x + 60 : W / 2, 24, W - 24);
  spider.y = clamp(pointer.moved ? pointer.y + 60 : H - 80, 24, H - 24);
  plantFeet(6);
  bubble('Recording! Do your thing, I am watching.', 2000);
  try { chrome.runtime.sendMessage({ cmd: 'REC_BADGE', on: true }); } catch (e) {}
  return { ok: true };
}

// picks a recording back up after a reload or same-origin navigation
function resumeRecording(state) {
  rec = { steps: state.steps || [], fillEls: [], fillIdx: [], selEls: [], selIdx: [], lastMoveT: 0, lastMX: -999, lastMY: -999, moveBurstStart: null, movesMuted: false, recordPasswords: !!state.recordPasswords };
  const last = rec.steps[rec.steps.length - 1];
  if (!last || last.type !== 'nav' || last.path !== location.pathname) {
    rec.steps.push({ type: 'nav', path: location.pathname });
  }
  persistRec();
  document.addEventListener('click', onClickCap, true);
  document.addEventListener('input', onInputCap, true);
  document.addEventListener('change', onChangeCap, true);
  document.addEventListener('focusin', onFocusCap, true);
  document.addEventListener('focusout', onFocusCap, true);
  showChip(); chipCount(rec.steps.length);
  roaming = true;
  showSpider();
  spider.x = W / 2; spider.y = clamp(H - 90, 24, H - 24);
  plantFeet(6);
  bubble('Still recording! New page, same crawl.', 1900);
  try { chrome.runtime.sendMessage({ cmd: 'REC_BADGE', on: true }); } catch (e) {}
}

async function stopRecording(name, cancel) {
  if (!rec) return { ok: false, reason: 'not-recording' };
  document.removeEventListener('click', onClickCap, true);
  document.removeEventListener('input', onInputCap, true);
  document.removeEventListener('change', onChangeCap, true);
  document.removeEventListener('focusin', onFocusCap, true);
  document.removeEventListener('focusout', onFocusCap, true);
  const steps = rec.steps;
  rec = null;
  ssDel(REC_KEY);
  hideChip();
  roaming = false;
  try { chrome.runtime.sendMessage({ cmd: 'REC_BADGE', on: false }); } catch (e) {}
  if (cancel) { bubble('Recording tossed.', 1300); setTimeout(() => hideSpider(), 1300); return { ok: true, cancelled: true }; }
  while (steps.length && steps[steps.length - 1].type === 'move') steps.pop();
  if (!steps.length) {
    bubble('Nothing recorded, so nothing saved!', 1800);
    setTimeout(() => hideSpider(), 1800);
    return { ok: false, reason: 'empty' };
  }
  const automation = {
    id: 'a_' + Math.random().toString(36).slice(2, 10),
    name: (name && String(name).trim()) || `.../${(location.pathname + location.search).replace(/^\/+/, '')} crawl`,
    origin: location.origin,
    pathPrefix: location.pathname,
    enabled: true,
    createdAt: Date.now(),
    steps,
  };
  const cur = await STORE.get('automations');
  const list = cur.automations || [];
  list.push(automation);
  await STORE.set({ automations: list });
  powAt('KPOW!', W / 2, H * 0.28, false);
  bubble(`Saved "${automation.name}" (${steps.length} steps)!`, 2200);
  setTimeout(() => { if (!rec && !running && !roaming) hideSpider(); }, 2300);
  return { ok: true, automation: { id: automation.id, name: automation.name, steps: steps.length } };
}

/* ============================================================
   Player
   ============================================================ */
function setNativeValue(el, v) {
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype
    : el.tagName === 'SELECT' ? HTMLSelectElement.prototype
    : HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  if (desc && desc.set) desc.set.call(el, v); else el.value = v;
}

async function typeInto(el, value) {
  el.focus();
  if (el.value) {
    setNativeValue(el, '');
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
    await sleep(60);
  }
  const chars = [...String(value)];
  for (const ch of chars) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
    setNativeValue(el, el.value + ch);
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: ch, inputType: 'insertText' }));
    el.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
    await sleep(25); // the agreed 25 ms per character
  }
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.blur();
}

function dispatchClick(el) {
  const r = el.getBoundingClientRect();
  const opts = {
    bubbles: true, cancelable: true, composed: true, view: window,
    clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0,
  };
  el.dispatchEvent(new PointerEvent('pointerdown', opts));
  el.dispatchEvent(new MouseEvent('mousedown', opts));
  if (el.focus) try { el.focus(); } catch (e) {}
  el.dispatchEvent(new PointerEvent('pointerup', opts));
  el.dispatchEvent(new MouseEvent('mouseup', opts));
  el.click();
}

function ensureInView(el) {
  const r = el.getBoundingClientRect();
  if (r.top < 70 || r.bottom > H - 70) {
    el.scrollIntoView({ block: 'center', behavior: 'auto' });
    return true;
  }
  return false;
}

// pick the side of the element nearest to where the spider already is,
// so it does not walk past the target and end up facing away from it
function approachPoint(r, fromX) {
  const cy = r.top + r.height / 2;
  const cx = r.left + r.width / 2;
  const leftRoom = r.left > 110, rightRoom = W - r.right > 110;
  let x;
  if (leftRoom && rightRoom) x = fromX <= cx ? r.left - 44 : r.right + 44;
  else if (leftRoom) x = r.left - 44;
  else if (rightRoom) x = r.right + 44;
  else x = cx;
  return { x: clamp(x, 26, W - 26), y: clamp(cy, 26, H - 26) };
}
// perch just above the top-left corner of a field, like a scribe at a desk
function perchPoint(r) {
  return { x: clamp(r.left + 4, 26, W - 26), y: clamp(r.top - 24, 26, H - 26) };
}

const stepName = st => `"${st.label || st.text || st.tag || 'element'}"`;

function saveRun(autoId, next) { ssSet(RUN_KEY, { id: autoId, next, t: Date.now() }); }

async function failRun(st, i, total, msg) {
  ssDel(RUN_KEY);
  const at = st && st.__rect ? st.__rect : { x: spider.x, y: spider.y - 40 };
  powAt('OMG!', at.x, at.y - 20, false);
  bubble(msg, 2100);
  await sleep(1100);
  powAt('BOOM!', W / 2, H * 0.4, true);
  await sleep(500);
  bubble(`Run failed at step ${i + 1} of ${total}.`, 2400);
  await sleep(2000);
}

async function runAutomation(auto, startIndex, resumed) {
  startIndex = startIndex || 0;
  if (running) { bubble('Hold on, a run is in progress!', 1500); return { ok: false, reason: 'busy' }; }
  if (rec) { bubble('Stop recording before running!', 1500); return { ok: false, reason: 'recording' }; }
  running = true;
  const steps = auto.steps || [];
  try {
    await dropIn(W / 2);
    powAt('WHOOSH!', spider.x, spider.y - 46, false);
    bubble(resumed
      ? `Back! Continuing "${auto.name}" at step ${startIndex + 1}.`
      : `Running "${auto.name}"!`, 1700);
    await sleep(800);
    if (!resumed && auto.pathPrefix && auto.pathPrefix !== '/' && !location.pathname.startsWith(auto.pathPrefix)) {
      bubble(`Psst, this was recorded on ${auto.pathPrefix}. Trying anyway!`, 2000);
      await sleep(1200);
    }
    for (let i = startIndex; i < steps.length; i++) {
      const st = steps[i];
      saveRun(auto.id, i); // if the page unloads mid-step, resume from this step
      if (st.type === 'move') {
        await goTo(st.x, st.y);
        saveRun(auto.id, i + 1);
        continue;
      }
      if (st.type === 'nav') {
        if (location.pathname !== st.path) {
          bubble(`Waiting to land on ${st.path}...`, 1500);
          const t0 = performance.now();
          let landed = false;
          while (performance.now() - t0 < 6000) {
            if (location.pathname === st.path) { landed = true; break; }
            await sleep(200);
          }
          if (!landed) {
            st.__rect = null;
            await failRun(st, i, steps.length, `Expected to land on ${st.path} but we are stuck on ${location.pathname}!`);
            return { ok: false, failedAt: i, reason: 'nav' };
          }
        }
        saveRun(auto.id, i + 1);
        continue;
      }
      const el = await resolveStep(st, 4000);
      if (!el) {
        st.__rect = null;
        await failRun(st, i, steps.length, `${stepName(st)} is GONE! It was here when you recorded.`);
        return { ok: false, failedAt: i, reason: 'missing' };
      }
      if (ensureInView(el)) await sleep(260);
      let r = el.getBoundingClientRect();
      st.__rect = { x: r.left + r.width / 2, y: r.top };

      if (st.type === 'click') {
        const ap = approachPoint(r, spider.x);
        await goTo(ap.x, ap.y);
        faceAt = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        await sleep(180); // square up to face the button before leaping
        if (isDisabled(el)) {
          faceAt = null;
          await failRun(st, i, steps.length, `${stepName(st)} is DISABLED! Someone nerfed it.`);
          return { ok: false, failedAt: i, reason: 'disabled' };
        }
        if (st.text && normText(el) && normText(el) !== st.text) {
          bubble(`Hmm, its label changed to "${normText(el).slice(0, 26)}". Clicking anyway!`, 1700);
          await sleep(900);
        }
        saveRun(auto.id, i + 1); // clicks may navigate away instantly
        r = el.getBoundingClientRect();
        await hop(r.left + r.width / 2, r.top + r.height / 2); // pounce onto it
        dispatchClick(el); // the landing is the click
        faceAt = null;
        powAt('BANG!', r.left + r.width / 2, r.top - 12, false);
        await sleep(300);
        await hop(ap.x, ap.y); // hop back off so the result shows
        await sleep(160);
      } else if (st.type === 'fill') {
        const perch = perchPoint(r);
        await goTo(perch.x, perch.y);
        faceAt = { x: r.left + Math.min(70, r.width * 0.4), y: r.top + r.height / 2 };
        await sleep(150);
        if (isDisabled(el) || el.readOnly) {
          faceAt = null;
          await failRun(st, i, steps.length, `${stepName(st)} will not take input anymore!`);
          return { ok: false, failedAt: i, reason: 'disabled' };
        }
        typing = true;
        await typeInto(el, st.value || '');
        typing = false;
        faceAt = null;
        await sleep(160);
      } else if (st.type === 'select') {
        const perch = perchPoint(r);
        await goTo(perch.x, perch.y);
        faceAt = { x: r.left + Math.min(70, r.width * 0.4), y: r.top + r.height / 2 };
        await sleep(200);
        setNativeValue(el, st.value);
        el.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(260);
        faceAt = null;
      }
      saveRun(auto.id, i + 1);
      await sleep(140);
    }
    ssDel(RUN_KEY);
    powAt('KPOW!', W / 2, H * 0.32, true);
    await sleep(300);
    bubble(`All ${steps.length} steps passed!`, 2100);
    await sleep(2000);
    return { ok: true };
  } finally {
    typing = false;
    try { await ascend(); } catch (e) { hideSpider(); }
    running = false;
  }
}

/* ============================================================
   Messaging + live settings
   ============================================================ */
STORE.get('settings').then(({ settings }) => { if (settings && settings.theme) theme = settings.theme; });
chrome.storage.onChanged.addListener((ch, area) => {
  if (area === 'local' && ch.settings && ch.settings.newValue && ch.settings.newValue.theme) {
    theme = ch.settings.newValue.theme;
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg && msg.cmd) {
      case 'GET_STATE': {
        const consent = isLocal() ? true : await ensureConsent(false);
        return {
          ok: true,
          origin: location.origin,
          path: location.pathname,
          local: isLocal(),
          consent,
          recording: !!rec,
          stepCount: rec ? rec.steps.length : 0,
          running, roaming, theme,
          spider: visible ? { x: Math.round(spider.x), y: Math.round(spider.y), mode: spider.mode } : null,
        };
      }
      case 'START_RECORD': return startRecording();
      case 'STOP_RECORD': return stopRecording(msg.name, false);
      case 'CANCEL_RECORD': return stopRecording(null, true);
      case 'RUN': {
        const consent = await ensureConsent(true);
        if (!consent) return { ok: false, reason: 'consent' };
        const { automations = [] } = await STORE.get('automations');
        const auto = automations.find(a => a.id === msg.id);
        if (!auto) return { ok: false, reason: 'not-found' };
        if (!auto.enabled) return { ok: false, reason: 'disabled' };
        if (auto.origin !== location.origin) return { ok: false, reason: 'wrong-origin' };
        ssDel(RUN_KEY); // a fresh manual run always starts from step one
        runAutomation(auto); // runs on its own; progress plays out on the page
        return { ok: true, started: true };
      }
      case 'TOGGLE_ROAM': {
        if (msg.on) {
          const consent = await ensureConsent(true);
          if (!consent) return { ok: false, reason: 'consent' };
          roaming = true;
          showSpider();
          if (!pointer.moved) { spider.x = W / 2; spider.y = H * 0.6; }
          plantFeet(6);
        } else {
          roaming = false;
          if (!rec && !running) hideSpider();
        }
        return { ok: true, roaming };
      }
      case 'SET_THEME': {
        if (THEMES[msg.theme]) theme = msg.theme;
        return { ok: true };
      }
      default: return { ok: false, reason: 'unknown-cmd' };
    }
  })().then(sendResponse).catch(err => sendResponse({ ok: false, error: String(err) }));
  return true;
});

/* ============================================================
   Boot: resume recordings, resume runs, or auto-run
   ============================================================ */
async function maybeAutoRun() {
  if (rec || running) return;
  const consent = await ensureConsent(false); // never pop the consent modal on page load
  if (!consent) return;
  const { automations = [] } = await STORE.get('automations');
  const guard = ssGet(AUTO_KEY);
  const candidates = automations
    .filter(a => a.enabled && a.autoRun && a.origin === location.origin &&
      location.pathname.startsWith(a.pathPrefix || '/'))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const auto = candidates.find(a => !(guard && guard.id === a.id && fresh(guard.t, 60000)));
  if (!auto) return;
  ssSet(AUTO_KEY, { id: auto.id, t: Date.now() }); // loop brake, set before we touch anything
  await sleep(900); // let the app hydrate
  if (rec || running) return;
  runAutomation(auto);
}

async function boot() {
  const recState = ssGet(REC_KEY);
  if (recState && fresh(recState.t, 300000) && Array.isArray(recState.steps)) {
    const consent = await ensureConsent(false);
    if (consent) { resumeRecording(recState); return; }
    ssDel(REC_KEY);
  }
  const runState = ssGet(RUN_KEY);
  if (runState && fresh(runState.t, 45000) && runState.id) {
    const consent = await ensureConsent(false);
    const { automations = [] } = await STORE.get('automations');
    const auto = automations.find(a => a.id === runState.id);
    if (consent && auto && auto.enabled && auto.origin === location.origin) {
      await sleep(600); // let the new page settle before the spider drops back in
      runAutomation(auto, Math.min(runState.next || 0, (auto.steps || []).length), true);
      return;
    }
    ssDel(RUN_KEY);
  }
  maybeAutoRun();
}
boot();
})();
