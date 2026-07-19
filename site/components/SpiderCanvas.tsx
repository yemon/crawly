'use client';

import { useEffect, useRef } from 'react';

// Ports the animated spider from the original static index.html into a
// client-only React component. The animation looks up specific IDs from the
// Hero component (addBtn, saveBug, tbody, overlay, confirm, f-bug, f-by,
// f-sev, confirmNo, confirmYes, stage, logoPerch). Keep them in sync.

export default function SpiderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (cleanupRef.current) return; // guard StrictMode double-invoke
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ---- everything below is the original IIFE from index.html, adapted
    // ---- so `canvas`/`ctx` come from the ref and cleanup is possible.
    const TAU = Math.PI * 2;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const easeS = (t: number) => t * t * (3 - 2 * t);
    const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    function angLerp(a: number, b: number, t: number) {
      let d = (b - a) % TAU;
      if (d > Math.PI) d -= TAU;
      if (d < -Math.PI) d += TAU;
      return a + d * t;
    }

    type ThemeSpec = {
      body: string;
      legs: string;
      fang: string;
      eye: string;
      pupil: string;
      eyeRing: string | null;
      silkA: number;
    };
    const THEMES: Record<'noir' | 'hero', ThemeSpec> = {
      noir: { body: '#141414', legs: '#141414', fang: '#141414', eye: '#ffffff', pupil: '#141414', eyeRing: null, silkA: 0.28 },
      hero: { body: '#e02f2f', legs: '#2a49c8', fang: '#e02f2f', eye: '#ffffff', pupil: '#141414', eyeRing: '#101010', silkA: 0.32 },
    };
    let themeName: 'noir' | 'hero' = (document.documentElement.getAttribute('data-theme') as 'noir' | 'hero') || 'noir';

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = innerWidth, H = innerHeight, DPR = 1;
    function resize() {
      W = innerWidth; H = innerHeight;
      DPR = Math.min(devicePixelRatio || 1, 2);
      canvas!.width = W * DPR; canvas!.height = H * DPR;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    addEventListener('resize', resize);
    resize();

    function pow(word: string, x: number, y: number, big: boolean) {
      const p = document.createElement('div');
      p.className = 'fx-pow ' + (big ? 'big' : 'small');
      p.textContent = word;
      p.style.left = clamp(x, 70, W - 70) + 'px';
      p.style.top = clamp(y, 46, H - 46) + 'px';
      p.style.transform += ` rotate(${(Math.random() * 16 - 9).toFixed(1)}deg)`;
      document.body.appendChild(p);
      setTimeout(() => p.classList.add('out'), big ? 1000 : 650);
      setTimeout(() => p.remove(), big ? 1400 : 1000);
    }
    let bubbleEl: HTMLDivElement | null = null;
    let bubbleTimer = 0 as unknown as ReturnType<typeof setTimeout>;
    function bubble(sp: Spider, text: string, ms?: number) {
      if (bubbleEl) bubbleEl.remove();
      clearTimeout(bubbleTimer);
      const b = document.createElement('div');
      b.className = 'fx-bubble';
      b.textContent = text;
      b.style.left = clamp(sp.x - 30, 10, W - 265) + 'px';
      b.style.top = clamp(sp.y - 104, 8, H - 130) + 'px';
      document.body.appendChild(b);
      bubbleEl = b;
      bubbleTimer = setTimeout(() => {
        b.classList.add('out');
        setTimeout(() => { if (bubbleEl === b) bubbleEl = null; b.remove(); }, 300);
      }, ms || 1600);
    }

    const LEG_DEF = [
      { a: -0.6, r: 36 }, { a: -1.15, r: 38 }, { a: -1.95, r: 38 }, { a: -2.55, r: 34 },
      { a: 0.6, r: 36 }, { a: 1.15, r: 38 }, { a: 1.95, r: 38 }, { a: 2.55, r: 34 },
    ];
    const CROUCH_T = 0.06, SHOOT_T = 0.1, HOLD_T = 0.1;
    const AIM_T = CROUCH_T + SHOOT_T + HOLD_T;
    const ZIP_T = 0.1, HOP_T = 0.3, ZIP_DIST = 300, MAXV = 115;

    type Leg = {
      ang: number; rest: number; bend: number;
      fx: number; fy: number; stepping: boolean; st: number;
      sx: number; sy: number; tx: number; ty: number;
    };
    type Goal = { x: number; y: number; resolve: () => void; age: number };
    type Drop = { fromY: number; toY: number; resolve: () => void };
    type Hop = { fx: number; fy: number; tx: number; ty: number; resolve: () => void };

    class Spider {
      k: number; R: number; quiet: boolean;
      faceAt: { x: number; y: number } | null = null;
      x: number; y: number; vx = 0; vy = 0;
      heading = -Math.PI / 2; speed = 0;
      mode: 'walk' | 'aim' | 'zip' | 'hop' | 'drop' | 'ascend' = 'walk';
      modeT = 0; cool = 0;
      web = { ax: 0, ay: 0, lineA: 0, splatA: 0 };
      zipFrom = { x: 0, y: 0 }; land = { x: 0, y: 0 };
      goal: Goal | null = null; dropState: Drop | null = null; hopState: Hop | null = null;
      airLift = 0; landT = 0;
      blinkT = Math.random() * 2; nextBlink = 2 + Math.random() * 3;
      typing = false; visible = false;
      getTarget: () => { x: number; y: number } | null = () => null;
      legs: Leg[];
      constructor(x: number, y: number, k?: number, quiet?: boolean) {
        this.k = k || 1;
        this.R = 11 * this.k;
        this.quiet = !!quiet;
        this.x = x; this.y = y;
        this.legs = LEG_DEF.map((d, i) => ({
          ang: d.a, rest: d.r * this.k,
          bend: (i < 4 ? -1 : 1) * (Math.abs(d.a) < 1.5 ? 1 : -1),
          fx: 0, fy: 0, stepping: false, st: 0, sx: 0, sy: 0, tx: 0, ty: 0,
        }));
        this.plantFeet(6);
      }
      homeFoot(leg: Leg, lead: number) {
        const a = this.heading + leg.ang;
        return {
          x: this.x + Math.cos(a) * leg.rest + this.vx * lead,
          y: this.y + Math.sin(a) * leg.rest + this.vy * lead,
        };
      }
      plantFeet(j: number) {
        for (const leg of this.legs) {
          const h = this.homeFoot(leg, 0);
          leg.stepping = false;
          leg.fx = h.x + (Math.random() - 0.5) * j;
          leg.fy = h.y + (Math.random() - 0.5) * j;
        }
      }
      target(): { x: number; y: number } {
        if (this.goal) return this.goal;
        const t = this.getTarget();
        if (t) return t;
        return this;
      }
      goTo(x: number, y: number) {
        return new Promise<void>((res) => {
          this.goal = { x: clamp(x, 24, W - 24), y: clamp(y, 24, H - 24), resolve: res, age: 0 };
        });
      }
      hop(x: number, y: number) {
        return new Promise<void>((res) => {
          this.mode = 'hop'; this.modeT = 0;
          this.hopState = { fx: this.x, fy: this.y, tx: clamp(x, 24, W - 24), ty: clamp(y, 24, H - 24), resolve: res };
          const d = Math.hypot(x - this.x, y - this.y);
          if (d > 2) this.heading = Math.atan2(y - this.y, x - this.x);
          for (const leg of this.legs) leg.stepping = false;
        });
      }
      dropIn(x: number, toY: number) {
        this.visible = true;
        this.x = clamp(x, 40, W - 40); this.y = -60;
        this.vx = 0; this.vy = 0; this.heading = Math.PI / 2;
        this.mode = 'drop'; this.modeT = 0;
        if (!this.quiet) pow('THWIP!', this.x, Math.max(70, toY - 120), false);
        return new Promise<void>((res) => { this.dropState = { fromY: -60, toY, resolve: res }; });
      }
      update(dt: number) {
        if (this.mode === 'drop' || this.mode === 'ascend') {
          this.modeT += dt;
          const up = this.mode === 'ascend';
          const t = Math.min(this.modeT / (up ? 0.5 : 0.6), 1);
          const kk = up ? t * t : easeOut3(t);
          this.y = lerp(this.dropState!.fromY, this.dropState!.toY, kk);
          this.heading = angLerp(this.heading, Math.PI / 2, 1 - Math.pow(0.001, dt));
          for (const leg of this.legs) {
            const a = this.heading + leg.ang;
            leg.fx = this.x + Math.cos(a) * leg.rest * 0.5;
            leg.fy = this.y + Math.sin(a) * leg.rest * 0.5 - 4;
            leg.stepping = false;
          }
          if (t >= 1) {
            const done = this.dropState!; this.dropState = null;
            this.mode = 'walk'; this.vx = 0; this.vy = 20;
            if (!up) this.plantFeet(9);
            done.resolve && done.resolve();
          }
          this.blink(dt);
          return;
        }

        const tgt = this.target();
        const dx = tgt.x - this.x, dy = tgt.y - this.y;
        const d = Math.hypot(dx, dy);
        const stopR = 30;

        if (this.mode === 'walk') {
          this.cool = Math.max(0, this.cool - dt);
          const mayZip = tgt !== this;
          if (mayZip && this.cool <= 0 && d > ZIP_DIST) {
            this.mode = 'aim'; this.modeT = 0;
            this.web.ax = tgt.x; this.web.ay = tgt.y;
            this.web.lineA = 0; this.web.splatA = 0;
          }
        }

        if (this.mode === 'aim') {
          this.modeT += dt;
          this.vx *= Math.pow(0.001, dt); this.vy *= Math.pow(0.001, dt);
          this.x += this.vx * dt; this.y += this.vy * dt;
          this.heading = angLerp(this.heading, Math.atan2(this.web.ay - this.y, this.web.ax - this.x), 1 - Math.pow(1e-7, dt));
          if (this.modeT > CROUCH_T) this.web.lineA = 1;
          if (this.modeT > CROUCH_T + SHOOT_T && !this.web.splatA) {
            this.web.splatA = 1;
            if (!this.quiet) pow('THWIP!', this.web.ax, this.web.ay - 24, false);
          }
          if (this.modeT >= AIM_T) {
            this.mode = 'zip'; this.modeT = 0;
            this.zipFrom.x = this.x; this.zipFrom.y = this.y;
            const zd = Math.hypot(this.web.ax - this.x, this.web.ay - this.y) || 1;
            const zux = (this.web.ax - this.x) / zd, zuy = (this.web.ay - this.y) / zd;
            this.land.x = clamp(this.web.ax - zux * 26, 24, W - 24);
            this.land.y = clamp(this.web.ay - zuy * 26, 24, H - 24);
            this.heading = Math.atan2(zuy, zux);
            for (const leg of this.legs) leg.stepping = false;
          }
        } else if (this.mode === 'zip') {
          this.modeT += dt;
          const tt = Math.min(this.modeT / ZIP_T, 1);
          const e = easeOut3(tt);
          const nx = lerp(this.zipFrom.x, this.land.x, e), ny = lerp(this.zipFrom.y, this.land.y, e);
          this.vx = (nx - this.x) / Math.max(dt, 0.001);
          this.vy = (ny - this.y) / Math.max(dt, 0.001);
          this.x = nx; this.y = ny;
          for (const leg of this.legs) {
            const a = this.heading + leg.ang;
            leg.fx = this.x + Math.cos(a) * leg.rest * 0.45 - Math.cos(this.heading) * 7;
            leg.fy = this.y + Math.sin(a) * leg.rest * 0.45 - Math.sin(this.heading) * 7;
          }
          if (tt >= 1) {
            this.mode = 'walk'; this.cool = 0.35;
            const sp = Math.hypot(this.vx, this.vy) || 1;
            this.vx = (this.vx / sp) * 25; this.vy = (this.vy / sp) * 25;
            this.plantFeet(9);
          }
        } else if (this.mode === 'hop') {
          this.modeT += dt;
          const tt = Math.min(this.modeT / HOP_T, 1);
          const e = easeS(tt);
          const hs = this.hopState!;
          const nx = lerp(hs.fx, hs.tx, e), ny = lerp(hs.fy, hs.ty, e);
          this.vx = (nx - this.x) / Math.max(dt, 0.001);
          this.vy = (ny - this.y) / Math.max(dt, 0.001);
          this.x = nx; this.y = ny;
          this.airLift = Math.sin(Math.PI * tt);
          for (const leg of this.legs) {
            const a = this.heading + leg.ang;
            leg.fx = this.x + Math.cos(a) * leg.rest * 0.5;
            leg.fy = this.y + Math.sin(a) * leg.rest * 0.5;
            leg.stepping = false;
          }
          if (tt >= 1) {
            this.mode = 'walk';
            this.airLift = 0; this.landT = 0.12;
            this.cool = Math.max(this.cool, 0.2);
            this.vx = 0; this.vy = 0;
            this.plantFeet(8);
            const done = this.hopState!; this.hopState = null;
            done.resolve && done.resolve();
          }
        } else {
          let want = 0;
          if (d > stopR) want = Math.min(MAXV, (d - stopR) * 2.2);
          const ux = d > 0.001 ? dx / d : 0, uy = d > 0.001 ? dy / d : 0;
          const kk = 1 - Math.pow(0.002, dt);
          this.vx = lerp(this.vx, ux * want, kk);
          this.vy = lerp(this.vy, uy * want, kk);
          this.x = clamp(this.x + this.vx * dt, 24, W - 24);
          this.y = clamp(this.y + this.vy * dt, 24, H - 24);
          const sp = Math.hypot(this.vx, this.vy);
          if (sp > 8) {
            this.heading = angLerp(this.heading, Math.atan2(this.vy, this.vx), 1 - Math.pow(0.001, dt));
          } else if (d > stopR + 6) {
            this.heading = angLerp(this.heading, Math.atan2(dy, dx), 1 - Math.pow(0.02, dt));
          } else if (this.faceAt) {
            this.heading = angLerp(this.heading, Math.atan2(this.faceAt.y - this.y, this.faceAt.x - this.x), 1 - Math.pow(0.004, dt));
          }
          this.web.lineA = Math.max(0, this.web.lineA - dt * 7);
          this.web.splatA = Math.max(0, this.web.splatA - dt * 1.8);
        }
        this.speed = Math.hypot(this.vx, this.vy);
        this.landT = Math.max(0, this.landT - dt);

        if (this.goal) {
          this.goal.age += dt;
          if ((this.mode === 'walk' && d < stopR + 5 && this.speed < 16) || this.goal.age > 6) {
            const g = this.goal; this.goal = null;
            g.resolve();
          }
        }

        if (this.mode !== 'zip' && this.mode !== 'hop') {
          const speedT = Math.min(this.speed / MAXV, 1);
          const stepDur = lerp(0.22, 0.11, speedT);
          const trig = (this.speed < 15 ? 6 : 13 * (1 - 0.25 * speedT)) * this.k;
          for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            if (leg.stepping) {
              leg.st += dt / stepDur;
              if (leg.st >= 1) { leg.stepping = false; leg.fx = leg.tx; leg.fy = leg.ty; }
              continue;
            }
            const home = this.homeFoot(leg, 0.13);
            const off = Math.hypot(home.x - leg.fx, home.y - leg.fy);
            if (off > trig) {
              const base = i < 4 ? 0 : 4, jj = i - base;
              const blockers: number[] = [];
              if (jj > 0) blockers.push(base + jj - 1);
              if (jj < 3) blockers.push(base + jj + 1);
              blockers.push(i < 4 ? i + 4 : i - 4);
              const blocked = blockers.some((b) => this.legs[b].stepping);
              if (!blocked || off > trig * 1.8) {
                leg.stepping = true; leg.st = 0;
                leg.sx = leg.fx; leg.sy = leg.fy;
                const oa = Math.atan2(home.y - leg.fy, home.x - leg.fx);
                const over = Math.min(off * 0.35, 8 * this.k);
                leg.tx = home.x + Math.cos(oa) * over;
                leg.ty = home.y + Math.sin(oa) * over;
              }
            }
          }
        }
        this.blink(dt);
      }
      blink(dt: number) {
        this.blinkT += dt;
        if (this.blinkT > this.nextBlink) { this.blinkT = 0; this.nextBlink = 2 + Math.random() * 3.5; }
      }
      footPos(leg: Leg) {
        if (!leg.stepping) return { x: leg.fx, y: leg.fy, lift: 0 };
        const e = easeS(leg.st);
        return { x: lerp(leg.sx, leg.tx, e), y: lerp(leg.sy, leg.ty, e), lift: Math.sin(leg.st * Math.PI) };
      }
      drawLeg(hipx: number, hipy: number, fx: number, fy: number, bodyX: number, bodyY: number, bend: number, lift: number) {
        const dx = fx - hipx, dy = fy - hipy;
        const d = Math.hypot(dx, dy) || 0.001;
        const maxD = 41 * this.k;
        let ex = fx, ey = fy;
        if (d > maxD) { ex = hipx + (dx / d) * maxD; ey = hipy + (dy / d) * maxD; }
        ey -= lift * 3;
        const cdx = ex - hipx, cdy = ey - hipy;
        const cd = Math.hypot(cdx, cdy) || 0.001;
        const mx = (hipx + ex) / 2, my = (hipy + ey) / 2;
        const ox = mx - bodyX, oy = my - bodyY;
        const od = Math.hypot(ox, oy) || 0.001;
        const arch = 8 * this.k * (1 + lift * 0.9);
        const cx = mx + (-cdy / cd) * arch * bend + (ox / od) * 2.5;
        const cy = my + (cdx / cd) * arch * bend + (oy / od) * 2.5;
        ctx!.beginPath();
        ctx!.moveTo(hipx, hipy);
        ctx!.quadraticCurveTo(cx, cy, ex, ey);
        ctx!.stroke();
      }
      drawWeb(headX: number, headY: number, P: ThemeSpec) {
        let lineA = 0, tipP = 1;
        if (this.mode === 'aim') {
          if (this.modeT > CROUCH_T) { lineA = 1; tipP = Math.min((this.modeT - CROUCH_T) / SHOOT_T, 1); }
        } else if (this.mode === 'zip') {
          lineA = 1;
        } else if (this.mode === 'drop' || this.mode === 'ascend') {
          ctx!.strokeStyle = `rgba(17,17,17,${P.silkA})`;
          ctx!.lineWidth = 1.2;
          ctx!.beginPath();
          ctx!.moveTo(this.x, 0);
          ctx!.lineTo(this.x, this.y - 6);
          ctx!.stroke();
          return;
        } else if (this.web.lineA > 0) {
          lineA = this.web.lineA;
        }
        if (lineA > 0) {
          const e = easeOut3(tipP);
          const tx = lerp(headX, this.web.ax, e), ty = lerp(headY, this.web.ay, e);
          ctx!.strokeStyle = `rgba(17,17,17,${(P.silkA * lineA).toFixed(3)})`;
          ctx!.lineWidth = 1.1;
          ctx!.beginPath(); ctx!.moveTo(headX, headY); ctx!.lineTo(tx, ty); ctx!.stroke();
          if (tipP < 1) {
            ctx!.fillStyle = 'rgba(17,17,17,0.4)';
            ctx!.beginPath(); ctx!.arc(tx, ty, 2, 0, TAU); ctx!.fill();
          }
        }
        if (this.web.splatA > 0) {
          const a = this.web.splatA;
          ctx!.strokeStyle = `rgba(17,17,17,${(0.34 * a).toFixed(3)})`;
          ctx!.lineWidth = 1;
          for (let i = 0; i < 6; i++) {
            const an = (i / 6) * TAU + 0.26;
            ctx!.beginPath();
            ctx!.moveTo(this.web.ax + Math.cos(an) * 1.5, this.web.ay + Math.sin(an) * 1.5);
            ctx!.lineTo(this.web.ax + Math.cos(an) * 6, this.web.ay + Math.sin(an) * 6);
            ctx!.stroke();
          }
        }
      }
      draw(t: number) {
        if (!this.visible) return;
        const P = THEMES[themeName];
        const R = this.R, k = this.k;
        const hx = Math.cos(this.heading), hy = Math.sin(this.heading);
        const px = -hy, py = hx;
        const zipping = this.mode === 'zip';
        const hopping = this.mode === 'hop';
        const dropping = this.mode === 'drop' || this.mode === 'ascend';
        const crouch = this.mode === 'aim' && this.modeT < CROUCH_T;
        const speedT = Math.min(this.speed / MAXV, 1);
        const holding = this.mode === 'aim' && this.modeT > CROUCH_T + SHOOT_T;
        let wob = zipping || hopping || dropping ? 0 : Math.sin(t * 15) * speedT * 1.1;
        if (holding) wob = Math.sin(t * 48) * 1.3;
        if (this.typing) wob = Math.sin(t * 28) * 0.5;
        const breathe = Math.sin(t * 2.1 + this.x * 0.01) * 0.5 * (1 - speedT);
        const bx = this.x + px * wob;
        const by = this.y + py * wob;
        let squish = crouch ? 0.92 : 1;
        if (this.landT > 0) squish = 0.86 + 0.14 * (1 - this.landT / 0.12);

        const headR = R * squish;
        const hcx = bx + hx * R * (0.7 + (zipping ? 0.18 : 0));
        const hcy = by + hy * R * (0.7 + (zipping ? 0.18 : 0));

        if (!dropping) {
          const shScale = (1 - this.airLift * 0.4) * k;
          ctx!.save();
          ctx!.translate(this.x, this.y + 6);
          ctx!.rotate(this.heading);
          ctx!.fillStyle = `rgba(17,17,17,${(zipping ? 0.03 : 0.05) * (1 - this.airLift * 0.5)})`;
          ctx!.beginPath();
          ctx!.ellipse(0, 0, 24 * shScale, 16 * shScale, 0, 0, TAU);
          ctx!.fill();
          ctx!.restore();
        }

        this.drawWeb(hcx + hx * headR * 0.85, hcy + hy * headR * 0.85, P);

        ctx!.save();
        ctx!.translate(0, -this.airLift * 26);

        ctx!.strokeStyle = P.legs;
        ctx!.lineWidth = 2.1 * k;
        ctx!.lineCap = 'round';
        for (const leg of this.legs) {
          let f: { x: number; y: number; lift?: number } = this.footPos(leg);
          let lift = zipping || hopping ? 1 : (f.lift || 0);
          if (this.mode === 'aim' && Math.abs(leg.ang) < 0.7) {
            const fa = this.heading + leg.ang * 0.5;
            f = { x: bx + Math.cos(fa) * leg.rest * 0.92, y: by + Math.sin(fa) * leg.rest * 0.92 };
            lift = 1;
          } else if (this.typing && Math.abs(leg.ang) < 0.7) {
            const fa = this.heading + leg.ang * 0.5;
            const tap = Math.max(0, Math.sin(t * 14 + (leg.ang < 0 ? 0 : Math.PI)));
            f = { x: bx + Math.cos(fa) * leg.rest * 0.8, y: by + Math.sin(fa) * leg.rest * 0.8 };
            lift = tap * 0.9;
          }
          const ha = this.heading + leg.ang;
          const hipx = bx + Math.cos(ha) * R * 0.75;
          const hipy = by + Math.sin(ha) * R * 0.75;
          this.drawLeg(hipx, hipy, f.x, f.y, bx, by, leg.bend, lift);
        }

        ctx!.fillStyle = P.body;
        const abR = (R * 1.45 + breathe) * squish;
        const stretch = zipping ? 1.18 : 1;
        ctx!.beginPath();
        ctx!.ellipse(bx - hx * R * 1.25, by - hy * R * 1.25, abR * 1.06 * stretch, abR, this.heading, 0, TAU);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(hcx, hcy, headR, 0, TAU);
        ctx!.fill();

        ctx!.fillStyle = P.fang;
        for (const s of [-1, 1]) {
          const fx = hcx + hx * headR * 1.18 + px * headR * 0.32 * s;
          const fy = hcy + hy * headR * 1.18 + py * headR * 0.32 * s;
          ctx!.beginPath(); ctx!.arc(fx, fy, 1.7 * k, 0, TAU); ctx!.fill();
        }

        let open = 1;
        if (this.blinkT < 0.13) {
          const q = this.blinkT / 0.13;
          open = q < 0.5 ? 1 - q * 2 : (q - 0.5) * 2;
          open = Math.max(open, 0.08);
        }
        const look = this.faceAt || this.target();
        for (const s of [-1, 1]) {
          const ex = hcx + hx * headR * 0.42 + px * headR * 0.46 * s;
          const ey = hcy + hy * headR * 0.42 + py * headR * 0.46 * s;
          ctx!.fillStyle = P.eye;
          ctx!.beginPath();
          ctx!.ellipse(ex, ey, 4 * k, 4 * k * open, this.heading, 0, TAU);
          ctx!.fill();
          if (P.eyeRing) {
            ctx!.strokeStyle = P.eyeRing;
            ctx!.lineWidth = 1.3 * k;
            ctx!.beginPath();
            ctx!.ellipse(ex, ey, 4 * k, 4 * k * open, this.heading, 0, TAU);
            ctx!.stroke();
          }
          if (open > 0.35) {
            let ldx = look.x - ex, ldy = look.y - ey;
            const ld = Math.hypot(ldx, ldy) || 1;
            ldx /= ld; ldy /= ld;
            ctx!.fillStyle = P.pupil;
            ctx!.beginPath();
            ctx!.ellipse(ex + ldx * 1.4, ey + ldy * 1.4, 2 * k, 2 * k * open, 0, 0, TAU);
            ctx!.fill();
          }
        }
        ctx!.restore();
      }
    }

    const spiders: Spider[] = [];
    let last = performance.now();
    let running = true;
    function frame(now: number) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx!.clearRect(0, 0, W, H);
      for (const s of spiders) { s.update(dt); s.draw(now / 1000); }
      requestAnimationFrame(frame);
    }

    // ---- demo mini app hookup
    const tbody = document.getElementById('tbody');
    const overlay = document.getElementById('overlay');
    const confirmBox = document.getElementById('confirm');
    const fBug = document.getElementById('f-bug') as HTMLInputElement | null;
    const fBy = document.getElementById('f-by') as HTMLInputElement | null;
    const fSev = document.getElementById('f-sev') as HTMLSelectElement | null;
    const stage = document.getElementById('stage');
    const logoPerch = document.getElementById('logoPerch');
    const addBtn = document.getElementById('addBtn');
    const cancelBug = document.getElementById('cancelBug');
    const saveBug = document.getElementById('saveBug');
    const confirmNo = document.getElementById('confirmNo');
    const confirmYes = document.getElementById('confirmYes');
    if (!tbody || !overlay || !confirmBox || !fBug || !fBy || !fSev || !stage || !logoPerch || !addBtn || !cancelBug || !saveBug || !confirmNo || !confirmYes) {
      running = false;
      removeEventListener('resize', resize);
      return;
    }

    let rowToDelete: HTMLTableRowElement | null = null;
    function addRow(bugTxt: string, by: string, sev: string, freshRow: boolean): HTMLTableRowElement {
      const tr = document.createElement('tr');
      if (freshRow) tr.className = 'fresh';
      const sevMap: Record<string, string> = { Low: 'low', Medium: 'med', High: 'high' };
      const sevCls = 'sev ' + (sevMap[sev] || 'low');
      tr.innerHTML =
        `<td>${bugTxt}</td><td>${by}</td><td><span class="${sevCls}">${sev}</span></td>` +
        `<td style="text-align:right"><button class="rowdel">Delete</button></td>`;
      tr.querySelector('.rowdel')!.addEventListener('click', () => {
        rowToDelete = tr;
        confirmBox!.classList.add('open');
      });
      tbody!.appendChild(tr);
      return tr;
    }
    addRow('Dropdown fell up', 'jjj', 'High', false);
    addRow('Submit button is shy', 'may parker', 'Low', false);
    addRow('Dark mode too dark', 'yemon', 'Medium', false);

    const onAdd = () => {
      fBug!.value = ''; fBy!.value = ''; fSev!.value = 'Low';
      overlay!.classList.add('open');
    };
    const onCancel = () => overlay!.classList.remove('open');
    let lastAdded: HTMLTableRowElement | null = null;
    const onSave = () => {
      lastAdded = addRow(fBug!.value || 'Mystery bug', fBy!.value || 'anon', fSev!.value, true);
      overlay!.classList.remove('open');
    };
    const onConfirmNo = () => {
      rowToDelete = null;
      confirmBox!.classList.remove('open');
    };
    const onConfirmYes = () => {
      confirmBox!.classList.remove('open');
      const tr = rowToDelete; rowToDelete = null;
      if (tr) {
        tr.classList.add('dying');
        setTimeout(() => tr.remove(), 320);
      }
    };
    addBtn.addEventListener('click', onAdd);
    cancelBug.addEventListener('click', onCancel);
    saveBug.addEventListener('click', onSave);
    confirmNo.addEventListener('click', onConfirmNo);
    confirmYes.addEventListener('click', onConfirmYes);

    function rectOf(el: Element) { return el.getBoundingClientRect(); }
    function stageVisible() {
      const r = rectOf(stage!);
      if (!r.width) return false;
      const overlap = Math.min(r.bottom, H) - Math.max(r.top, 0);
      return overlap > Math.min(160, r.height * 0.4);
    }
    function perchSpot() {
      const r = rectOf(logoPerch!);
      if (r.width) return { x: r.left + r.width / 2, y: r.top + r.height / 2 + 2 };
      return { x: 40, y: 30 };
    }

    // Scene gate: when the hero stage isn't in view (or the tab is hidden) the
    // demo loop is aborted immediately. Any in-flight goTo/hop for a spider is
    // resolved right away so awaits unblock and the ABORT throw can propagate.
    const ABORT: unique symbol = Symbol('scene-aborted');
    let sceneActive = stageVisible() && !document.hidden;
    const sceneWaiters: Array<() => void> = [];
    function setSceneActive(next: boolean) {
      if (next === sceneActive) return;
      sceneActive = next;
      if (next) {
        const q = sceneWaiters.splice(0);
        for (const w of q) w();
      } else {
        for (const s of spiders) {
          if (s.goal) { s.goal.resolve(); s.goal = null; }
          if (s.hopState) { s.hopState.resolve(); s.hopState = null; }
        }
      }
    }
    function throwIfInactive() { if (!sceneActive) throw ABORT; }
    async function waitSceneActive() {
      if (sceneActive) return;
      await new Promise<void>((res) => sceneWaiters.push(res));
    }
    async function checkedSleep(ms: number) {
      const start = performance.now();
      while (performance.now() - start < ms) {
        throwIfInactive();
        await sleep(Math.min(50, ms - (performance.now() - start)));
      }
      throwIfInactive();
    }
    async function checkedGoTo(sp: Spider, x: number, y: number) {
      await sp.goTo(x, y);
      throwIfInactive();
    }
    async function checkedHop(sp: Spider, x: number, y: number) {
      await sp.hop(x, y);
      throwIfInactive();
    }
    async function parkAtPerch(sp: Spider) {
      const spot = perchSpot();
      if (sp.goal) { sp.goal.resolve(); sp.goal = null; }
      try { await sp.goTo(spot.x, spot.y); } catch { /* ignored */ }
      sp.faceAt = { x: spot.x + 70, y: spot.y };
    }

    const sceneObserver = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.target === stage) {
        setSceneActive(e.isIntersecting && e.intersectionRatio >= 0.35 && !document.hidden);
      }
    }, { threshold: [0, 0.1, 0.35, 0.5, 0.75] });
    sceneObserver.observe(stage!);
    const onVisibility = () => setSceneActive(stageVisible() && !document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    function approachPoint(r: DOMRect, fromX: number) {
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
    function perchPoint(r: DOMRect) {
      return { x: clamp(r.left + 4, 26, W - 26), y: clamp(r.top - 24, 26, H - 26) };
    }
    async function pounceOn(sp: Spider, el: Element) {
      const r = rectOf(el);
      const ap = approachPoint(r, sp.x);
      await checkedGoTo(sp, ap.x, ap.y);
      const r2 = rectOf(el);
      sp.faceAt = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };
      await checkedSleep(180);
      await checkedHop(sp, r2.left + r2.width / 2, r2.top + r2.height / 2);
      (el as HTMLElement).click();
      sp.faceAt = null;
      pow('BANG!', r2.left + r2.width / 2, r2.top - 12, false);
      await checkedSleep(280);
      const r3 = rectOf(el);
      const ap2 = approachPoint(r3, sp.x);
      await checkedHop(sp, ap2.x, ap2.y);
      await checkedSleep(140);
    }
    async function typeIn(sp: Spider, el: HTMLInputElement, value: string) {
      const r = rectOf(el);
      const perch = perchPoint(r);
      await checkedGoTo(sp, perch.x, perch.y);
      sp.faceAt = { x: r.left + Math.min(70, r.width * 0.4), y: r.top + r.height / 2 };
      await checkedSleep(150);
      // preventScroll: the user might have scrolled the hero out of view; focusing
      // an off-screen input would yank them back to the top. Never do that.
      el.focus({ preventScroll: true });
      sp.typing = true;
      el.value = '';
      for (const ch of value) {
        throwIfInactive();
        el.value += ch;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(25);
      }
      sp.typing = false;
      sp.faceAt = null;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.blur();
      await checkedSleep(160);
    }

    const BUGS: [string, string, string][] = [
      ['Button ran away', 'crawly', 'High'],
      ['Form ate my vowels', 'crawly', 'Medium'],
      ['Modal will not close', 'crawly', 'High'],
      ['Tooltip tells lies', 'crawly', 'Low'],
    ];
    const QUIPS = ['Watch this.', 'Again!', 'I could do this all day.', 'Routine patrol.'];

    async function demoLoop(sp: Spider) {
      await waitSceneActive();
      const sRect = rectOf(stage!);
      try { await sp.dropIn(sRect.left + sRect.width * 0.5, clamp(sRect.top + 90, 90, H - 90)); }
      catch { /* ignore */ }
      pow('WHOOSH!', sp.x, Math.max(60, sp.y - 50), false);
      bubble(sp, 'Hi. I test forms for a living.', 2100);
      try { await checkedSleep(1400); } catch { /* falls into loop */ }
      let cycle = 0;
      while (running) {
        try {
          if (!sceneActive) {
            sp.typing = false;
            sp.faceAt = null;
            await parkAtPerch(sp);
            await waitSceneActive();
            sp.faceAt = null;
          }
          const bug = BUGS[cycle % BUGS.length];
          if (cycle > 0 && cycle % 2 === 0) {
            bubble(sp, QUIPS[(cycle / 2 - 1) % QUIPS.length], 1500);
            await checkedSleep(600);
          }
          await pounceOn(sp, addBtn!);
          await checkedSleep(320);
          await typeIn(sp, fBug!, bug[0]);
          await typeIn(sp, fBy!, bug[1]);
          {
            const sr = rectOf(fSev!);
            const perch = perchPoint(sr);
            await checkedGoTo(sp, perch.x, perch.y);
            sp.faceAt = { x: sr.left + Math.min(70, sr.width * 0.4), y: sr.top + sr.height / 2 };
            await checkedSleep(240);
            fSev!.value = bug[2];
            fSev!.dispatchEvent(new Event('change', { bubbles: true }));
            await checkedSleep(240);
            sp.faceAt = null;
          }
          await pounceOn(sp, saveBug!);
          if (lastAdded) {
            const rr = rectOf(lastAdded);
            pow('KPOW!', rr.left + rr.width / 2, rr.top, false);
          }
          await checkedSleep(900);
          if (lastAdded) {
            const del = lastAdded.querySelector('.rowdel');
            if (del) {
              await pounceOn(sp, del);
              await checkedSleep(300);
              await pounceOn(sp, confirmYes!);
              await checkedSleep(500);
            }
          }
          cycle++;
          await checkedSleep(1100);
        } catch (err) {
          if (err !== ABORT) throw err;
          sp.typing = false;
          sp.faceAt = null;
          // scene deactivated mid-cycle; return the spider to the header perch
          // and wait for the user to scroll the hero back into view
        }
      }
    }

    function startPatrol(sp: Spider) {
      (async () => {
        while (running) {
          if (document.hidden) { await sleep(800); continue; }
          const spot = perchSpot();
          await sp.goTo(spot.x, spot.y);
          sp.faceAt = { x: spot.x + 70, y: spot.y };
          await sleep(1000 + Math.random() * 500);
          sp.faceAt = null;
          if (!sceneActive) { await sleep(400); continue; }
          const s = rectOf(stage!);
          const cx = s.left > 90 ? s.left - 34 : s.left + 40;
          await sp.goTo(clamp(cx, 30, W - 30), clamp(s.top + 150, 80, H - 60));
          sp.faceAt = { x: s.left + s.width / 2, y: clamp(s.top + 160, 100, H - 40) };
          await sleep(1700 + Math.random() * 1300);
          sp.faceAt = null;
        }
      })();
      addEventListener('click', onNearbyClick, { capture: true, passive: true });
      function onNearbyClick(e: MouseEvent) {
        if (sp.mode !== 'walk' || sp.hopState || sp.dropState) return;
        const d = Math.hypot(e.clientX - sp.x, e.clientY - sp.y);
        if (d > 260) return;
        if (sp.goal) { sp.goal.resolve(); sp.goal = null; }
        sp.hop(e.clientX, e.clientY);
      }
      nearbyClickHandler = onNearbyClick;
    }
    let nearbyClickHandler: ((e: MouseEvent) => void) | null = null;

    const onTheme = (e: Event) => {
      const detail = (e as CustomEvent<{ theme: 'noir' | 'hero' }>).detail;
      if (detail && (detail.theme === 'noir' || detail.theme === 'hero')) themeName = detail.theme;
    };
    window.addEventListener('crawly:theme', onTheme);

    requestAnimationFrame(frame);
    const demoSpider = new Spider(W * 0.7, -60, 1);
    spiders.push(demoSpider);
    demoLoop(demoSpider);

    let roamer: Spider | null = null;
    if (!reduceMotion) {
      // Small scale so it fits neatly on the 34x30 nav logoPerch when idle.
      roamer = new Spider(40, -60, 0.55, true);
      spiders.push(roamer);
      setTimeout(async () => {
        const spot = perchSpot();
        await roamer!.dropIn(spot.x, spot.y);
        startPatrol(roamer!);
      }, 1400);
    }

    cleanupRef.current = () => {
      running = false;
      removeEventListener('resize', resize);
      window.removeEventListener('crawly:theme', onTheme);
      document.removeEventListener('visibilitychange', onVisibility);
      sceneObserver.disconnect();
      // release any pending scene waiters so demoLoop can finish
      const q = sceneWaiters.splice(0);
      for (const w of q) w();
      if (nearbyClickHandler) removeEventListener('click', nearbyClickHandler, { capture: true } as EventListenerOptions);
      addBtn.removeEventListener('click', onAdd);
      cancelBug.removeEventListener('click', onCancel);
      saveBug.removeEventListener('click', onSave);
      confirmNo.removeEventListener('click', onConfirmNo);
      confirmYes.removeEventListener('click', onConfirmYes);
      document.querySelectorAll('.fx-pow, .fx-bubble').forEach((n) => n.remove());
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return <canvas id="web-canvas" ref={canvasRef} aria-hidden />;
}
