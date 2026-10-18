/*!
 * Chert Festival FX — 节日特效层（主流节日全覆盖）
 * 支持：元旦/情人节/元宵/愚人/清明/劳动/儿童/端午/七夕/中秋/国庆/重阳/万圣/感恩/圣诞/除夕/春节
 * 用法：在 </body> 前引入 <script src="festival-fx.js" defer></script>
 */
(function () {
  'use strict';

  /* ==================== 全局配置 ==================== */
  const CFG = {
    zIndex: 2147483600,
    storageKey: 'chert-fx-mode',
    backdropDim: 0,       // 浅色官网建议 0.22~0.32
    topInset: 0,          // 固定导航高度，如 64
    maxSparks: 1600,
  };

  /* ==================== 农历日期表（按年补充） ==================== */
  const LUNAR = {
    yuanxiao:   ['2025-02-12','2026-03-03','2027-02-20','2028-02-09','2029-02-27','2030-02-17'],
    qingming:   ['2025-04-04','2026-04-05','2027-04-05','2028-04-04','2029-04-04','2030-04-05'],
    dragonboat: ['2025-05-31','2026-06-19','2027-06-09','2028-05-28','2029-06-16','2030-06-05'],
    qixi:       ['2025-08-29','2026-08-19','2027-08-08','2028-08-26','2029-08-16','2030-08-05'],
    midautumn:  ['2025-10-06','2026-09-25','2027-09-15','2028-10-03','2029-09-22','2030-09-12'],
    chongyang:  ['2025-10-29','2026-10-18','2027-10-08','2028-10-26','2029-10-16','2030-10-05'],
    newyearEve: ['2025-01-28','2026-02-16','2027-02-05','2028-01-25','2029-02-12','2030-02-02'],
    spring:     ['2025-01-29','2026-02-17','2027-02-06','2028-01-26','2029-02-13','2030-02-03'],
  };
  const LUNAR_RANGE = {
    yuanxiao: 1, qingming: 1, dragonboat: 1, qixi: 1,
    midautumn: 2, chongyang: 1, newyearEve: 0, spring: 4,
  };

  /* ==================== 工具 ==================== */
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hexToRgba(hex, a) {
    hex = String(hex).replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const n = parseInt(hex, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function today0() { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function nearDates(list, span) {
    const t = today0();
    return list.some(ds => Math.abs((t - new Date(ds + 'T00:00:00').getTime()) / 864e5) <= span);
  }
  function md() { const d = new Date(); return (d.getMonth() + 1) * 100 + d.getDate(); }
  function roundRect(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  /* ==================== 自动识别（优先级从高到低） ==================== */
  function detect() {
    // 农历节日优先
    if (nearDates(LUNAR.newyearEve, LUNAR_RANGE.newyearEve)) return 'newyearEve';
    if (nearDates(LUNAR.spring,     LUNAR_RANGE.spring))     return 'spring';
    if (nearDates(LUNAR.yuanxiao,   LUNAR_RANGE.yuanxiao))   return 'yuanxiao';
    if (nearDates(LUNAR.qingming,   LUNAR_RANGE.qingming))   return 'qingming';
    if (nearDates(LUNAR.dragonboat, LUNAR_RANGE.dragonboat)) return 'dragonboat';
    if (nearDates(LUNAR.qixi,       LUNAR_RANGE.qixi))       return 'qixi';
    if (nearDates(LUNAR.midautumn,  LUNAR_RANGE.midautumn))  return 'midautumn';
    if (nearDates(LUNAR.chongyang,  LUNAR_RANGE.chongyang))  return 'chongyang';

    // 公历节日
    const d = md();
    if (d >= 1228 || d <= 103) return 'newyear';     // 跨年窗口
    if (d >= 207 && d <= 216)  return 'valentine';
    if (d >= 320 && d <= 322)  return 'aprilfool';   // 愚人节前后
    if (d >= 428 && d <= 506)  return 'labor';
    if (d >= 526 && d <= 602)  return 'children';
    if (d >= 926 && d <= 1007) return 'national';
    if (d >= 1024 && d <= 1101) return 'halloween';
    if (d >= 1118 && d <= 1129) return 'thanksgiving'; // 11月第四个周四窗口
    if (d >= 1215 && d <= 1226) return 'christmas';

    return 'none';
  }

  /* ==================== Canvas 层 ==================== */
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: String(CFG.zIndex), display: 'none',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // 背景层：远山、云等氛围元素置于内容底层（zIndex:-1），不遮挡文字、不产生"雾感"
  const bgCanvas = document.createElement('canvas');
  bgCanvas.setAttribute('aria-hidden', 'true');
  Object.assign(bgCanvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '-1', display: 'none',
  });
  document.body.appendChild(bgCanvas);
  const bgCtx = bgCanvas.getContext('2d');

  const S = {
    mode: 'none', w: 0, h: 0, dpr: 1, running: false, last: 0, raf: 0,
    moon: null, moonCache: null,
    petals: [], clouds: [], stars: [],
    lanterns: [], crackers: [], rockets: [], sparks: [],
    snow: [], hearts: [], eggs: [], party: [], leaves: [], doves: [],
    lanterns2: [], stars2: [],
    boats: [], waves: [], hills: [], rain: [], willows: [], milky: [], bridge: [],
    nextFirework: 0, nextEvent: 0,
  };

  /* ==================== 尺寸 ==================== */
  function resize() {
    S.dpr = Math.min(devicePixelRatio || 1, 2);
    S.w = innerWidth; S.h = innerHeight;
    canvas.width  = Math.floor(S.w * S.dpr);
    canvas.height = Math.floor(S.h * S.dpr);
    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    bgCanvas.width  = Math.floor(S.w * S.dpr);
    bgCanvas.height = Math.floor(S.h * S.dpr);
    bgCtx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    if (S.running) layout();
  }

  /* ==================== 通用绘制工具 ==================== */
  function drawMoonBase(r) {
    const size = Math.ceil(r * 3.4), pad = size / 2;
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(size * S.dpr);
    const g = c.getContext('2d');
    g.scale(S.dpr, S.dpr);
    const cx = pad, cy = pad;

    const halo = g.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.7);
    halo.addColorStop(0, 'rgba(255,240,190,.34)');
    halo.addColorStop(0.45, 'rgba(255,222,150,.10)');
    halo.addColorStop(1, 'rgba(255,220,140,0)');
    g.fillStyle = halo;
    g.beginPath(); g.arc(cx, cy, r * 1.7, 0, TAU); g.fill();

    const body = g.createRadialGradient(cx - r * .3, cy - r * .35, r * .1, cx, cy, r);
    body.addColorStop(0, '#fffdf2');
    body.addColorStop(0.62, '#fff2c0');
    body.addColorStop(1, '#f3d784');
    g.fillStyle = body;
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();

    g.fillStyle = 'rgba(190,158,86,.24)';
    [[-.30,.20,.15],[.24,-.26,.11],[.06,.44,.085],[-.46,-.18,.06],[.40,.30,.055]]
      .forEach(([x, y, s]) => {
        g.beginPath(); g.arc(cx + x * r, cy + y * r, s * r, 0, TAU); g.fill();
      });

    return { canvas: c, size };
  }

  function drawRabbit(g, x, y, s, fill) {
    g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = fill;
    g.beginPath(); g.arc(13, -4, 4.2, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(0, 0, 13, 10.5, -0.08, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(-13, -24, 2.9, 10, -0.30, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(-6.6, -23, 2.7, 9, 0.10, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(-9, -11, 8, 7.4, -0.24, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(-6, 4, 3.8, 5.6, -0.08, 0, TAU); g.fill();
    g.restore();
  }

  function drawCloud(c, g) {
    g = g || ctx;
    const col = c.color || '#cfe0ff';
    g.save();
    g.translate(c.x, c.y);
    // 外层柔边晕（同形放大、更淡），给云一点羽化而非硬边
    g.fillStyle = hexToRgba(col, c.a * 0.45);
    cloudBody(g, c.w * 1.06);
    // 实体云形（cumulus：底盘椭圆 + 顶部隆起圆）
    g.fillStyle = hexToRgba(col, c.a);
    cloudBody(g, c.w);
    g.restore();
  }

  // 一朵云的形状：底部圆润底盘 + 上方数个隆起圆，整体轮廓像云而非散团
  function cloudBody(g, W) {
    const r = W * 0.15;
    g.beginPath();
    g.ellipse(0, r * 0.4, W * 0.5, r * 0.9, 0, 0, TAU);
    g.fill();
    const bumps = [
      [-W * 0.24, -r * 0.2, r * 0.95],
      [-W * 0.10, -r * 0.8, r * 1.05],
      [ W * 0.08, -r * 0.9, r * 1.00],
      [ W * 0.24, -r * 0.3, r * 0.85],
    ];
    for (const [cx, cy, cr] of bumps) {
      g.beginPath();
      g.arc(cx, cy, cr, 0, TAU);
      g.fill();
    }
  }

  /* ==================== 火花系统（烟花/鞭炮/魔法共用） ==================== */
  function pushSpark(p) {
    if (S.sparks.length >= CFG.maxSparks) S.sparks.shift();
    S.sparks.push(p);
  }
  function burst(x, y, count, hue) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const sp = Math.pow(Math.random(), 0.6) * 3.6;
      pushSpark({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.8,
        life: 1, decay: rand(0.018, 0.038), size: rand(1.1, 2.4), hue: hue + rand(-12, 12),
      });
    }
  }
  function explode(x, y, hue) {
    const n = 70 + ((Math.random() * 45) | 0);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const sp = Math.pow(Math.random(), 0.55) * 7.2;
      pushSpark({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: rand(0.010, 0.020), size: rand(1.3, 2.8), hue: hue + rand(-28, 28),
      });
    }
  }
  function updateSparks(dt) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = S.sparks.length - 1; i >= 0; i--) {
      const p = S.sparks[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 0.075 * dt; p.vx *= 0.986; p.vy *= 0.986;
      p.life -= p.decay * dt;
      if (p.life <= 0) { S.sparks[i] = S.sparks[S.sparks.length - 1]; S.sparks.pop(); continue; }
      ctx.globalAlpha = Math.min(1, p.life);
      ctx.fillStyle = `hsl(${p.hue} 100% ${52 + 28 * p.life}%)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  /* ==================== 通用粒子生成 ==================== */
  function makePetal(initial, opt = {}) {
    return {
      x: Math.random() * S.w,
      y: initial ? Math.random() * S.h : -20,
      vx: rand(-0.25, 0.25),
      vy: rand(opt.vyMin ?? 0.45, opt.vyMax ?? 1.15),
      // 形状范围可选：粽子 / 菊花 / 艾草等通过收窄或放大 rx、ry 复用同一套飘落逻辑
      rx: rand(opt.rxMin ?? 2.2, opt.rxMax ?? 4.6),
      ry: rand(opt.ryMin ?? 1.2, opt.ryMax ?? 2.4),
      rot: Math.random() * TAU,
      vr: rand(-0.03, 0.03),
      sw: Math.random() * TAU,
      swSpeed: rand(0.008, 0.02),
      a: rand(opt.aMin ?? 0.35, opt.aMax ?? 0.75),
      color: (opt.colors || ['#ffd166', '#f6b73c'])[Math.random() < .5 ? 0 : 1],
    };
  }
  function drawPetals(dt, opt = {}) {
    for (const p of S.petals) {
      p.sw += p.swSpeed * dt;
      p.x += Math.sin(p.sw) * 0.55 * dt + p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > S.h + 30 || p.x < -40 || p.x > S.w + 40) {
        Object.assign(p, makePetal(false, opt));
        p.x = Math.random() * S.w;
      }
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ==================== 1. 元旦 ==================== */
  function layoutNewyear() {
    S.stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * S.w, y: Math.random() * S.h * 0.85,
      r: rand(0.6, 1.5), p: Math.random() * TAU, s: rand(0.6, 1.9),
    }));
    S.petals = Array.from({ length: 26 }, () => makePetal(true, { colors: ['#ffd166', '#ef476f'] }));
  }
  function drawNewyear(dt, now) {
    for (const s of S.stars) {
      ctx.globalAlpha = (0.25 + 0.6 * (0.5 + 0.5 * Math.sin(now * 0.001 * s.s + s.p))) * 0.8;
      ctx.fillStyle = '#fff8dc';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawPetals(dt, { colors: ['#ffd166', '#ef476f'] });
  }

  /* ==================== 2. 情人节 ==================== */
  function layoutValentine() {
    S.hearts = Array.from({ length: 24 }, () => ({
      x: Math.random() * S.w,
      y: Math.random() * S.h,
      vx: rand(-0.35, 0.35),
      vy: rand(-0.7, -0.3),
      s: rand(8, 18),
      rot: rand(-0.3, 0.3),
      vr: rand(-0.01, 0.01),
      a: rand(0.3, 0.7),
      color: ['#ff4d6d', '#ff85a1', '#ffb3c1'][(Math.random() * 3) | 0],
    }));
  }
  function drawHeart(x, y, s, rot, color, a) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha = a; ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s * 0.6, -s * 0.15, -s * 0.35, -s * 0.6, 0, -s * 0.25);
    ctx.bezierCurveTo(s * 0.35, -s * 0.6, s * 0.6, -s * 0.15, 0, s * 0.35);
    ctx.fill();
    ctx.restore();
  }
  function drawValentine(dt) {
    for (const h of S.hearts) {
      h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt;
      if (h.y < -30) { h.y = S.h + 30; h.x = Math.random() * S.w; }
      if (h.x < -30) h.x = S.w + 30;
      if (h.x > S.w + 30) h.x = -30;
      drawHeart(h.x, h.y, h.s, h.rot, h.color, h.a);
    }
  }

  /* ==================== 3. 元宵 ==================== */
  function layoutYuanxiao() {
    S.lanterns2 = Array.from({ length: 5 }, () => ({
      x: rand(0.1, 0.9) * S.w,
      y: rand(0.1, 0.7) * S.h,
      r: rand(10, 22),
      phase: Math.random() * TAU,
    }));
  }
  function drawYuanxiao(dt, now) {
    for (const L of S.lanterns2) {
      const pulse = 0.7 + 0.3 * Math.sin(now * 0.002 + L.phase);
      const g = ctx.createRadialGradient(L.x, L.y, 2, L.x, L.y, L.r * 2.6);
      g.addColorStop(0, `rgba(255,200,120,${0.55 * pulse})`);
      g.addColorStop(1, 'rgba(255,180,100,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(L.x, L.y, L.r * 2.6, 0, TAU); ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ff5a3c';
      ctx.beginPath(); ctx.ellipse(L.x, L.y, L.r * 0.55, L.r * 0.72, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffd166';
      roundRect(ctx, L.x - L.r * 0.35, L.y - L.r * 0.82, L.r * 0.7, 3, 1.5); ctx.fill();
      roundRect(ctx, L.x - L.r * 0.35, L.y + L.r * 0.72, L.r * 0.7, 3, 1.5); ctx.fill();
      ctx.restore();
    }
  }

  /* ==================== 4. 愚人节 ==================== */
  function layoutAprilfool() {
    S.eggs = Array.from({ length: 14 }, () => ({
      x: Math.random() * S.w,
      y: Math.random() * S.h,
      rot: rand(-0.4, 0.4),
      vr: rand(-0.02, 0.02),
      s: rand(10, 20),
      color: ['#ffd166', '#06d6a0', '#ef476f', '#4f8cff'][(Math.random() * 4) | 0],
      a: rand(0.35, 0.75),
    }));
  }
  function drawEgg(x, y, s, rot, color, a) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.42, s * 0.55, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath(); ctx.ellipse(-s * 0.12, -s * 0.18, s * 0.1, s * 0.13, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function drawAprilfool(dt) {
    for (const e of S.eggs) {
      e.rot += e.vr * dt;
      drawEgg(e.x, e.y, e.s, e.rot, e.color, e.a);
    }
  }

  /* ==================== 5. 清明 ==================== */
  function layoutQingming() {
    // 雨丝：细长斜线，自上而下滑落
    S.rain = Array.from({ length: 70 }, () => ({
      x: rand(-0.1, 1.1) * S.w,
      y: rand(-0.2, 1.0) * S.h,
      len: rand(10, 26),
      v: rand(4.5, 9.0),
      a: rand(0.10, 0.30),
      tilt: rand(0.10, 0.24),
    }));
    // 柳枝：顶端固定于页面上方，末端随风摆动
    S.willows = Array.from({ length: 7 }, (_, i) => ({
      x: (i + 0.5) / 7 * S.w + rand(-30, 30),
      len: rand(70, 165),
      p: Math.random() * TAU,
      sway: rand(0.8, 2.0),
      a: rand(0.16, 0.34),
    }));
    // 阴云：清明雨天的低饱和云层
    S.clouds = Array.from({ length: 6 }, () => ({
      x: rand(-S.w * 0.2, S.w * 1.1),
      y: rand(CFG.topInset + 20, S.h * 0.50),
      w: rand(260, 520),
      h: rand(32, 62),
      v: rand(0.10, 0.26) * (Math.random() < .5 ? 1 : -1),
      a: rand(0.16, 0.32),
      color: '#9aa8b5',
    }));
  }

  function drawRain(d, now) {
    ctx.save();
    ctx.strokeStyle = `rgba(190,214,232,${d.a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - d.len * d.tilt, d.y + d.len);
    ctx.stroke();
    ctx.restore();
  }

  function drawWillow(w, now) {
    // 二次贝塞尔：顶端固定，末端随正弦摆动
    const swing = Math.sin(now * 0.0012 + w.p) * w.sway * 12;
    ctx.save();
    ctx.strokeStyle = `rgba(150,196,140,${w.a})`;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w.x, CFG.topInset);
    ctx.quadraticCurveTo(w.x + swing * 0.4, CFG.topInset + w.len * 0.55,
                        w.x + swing,        CFG.topInset + w.len);
    ctx.stroke();
    // 沿柳条点缀小叶
    ctx.fillStyle = `rgba(168,208,150,${w.a * 0.85})`;
    for (let k = 1; k <= 3; k++) {
      const t = k / 4;
      const lx = w.x + swing * t * t;
      const ly = CFG.topInset + w.len * t;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 3.2, 1.5, 0.6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawQingming(dt, now) {
    // 阴云（背景层，内容之下）
    for (const c of S.clouds) {
      c.x += c.v * dt;
      if (c.v > 0 && c.x - c.w > S.w) c.x = -c.w;
      if (c.v < 0 && c.x + c.w < 0) c.x = S.w + c.w;
      drawCloud(c, bgCtx);
    }
    // 柳枝
    for (const w of S.willows) drawWillow(w, now);
    // 雨丝
    for (const d of S.rain) {
      d.y += d.v * dt;
      d.x -= d.v * d.tilt * dt;
      if (d.y > S.h) { d.y = -d.len; d.x = rand(-0.1, 1.1) * S.w; }
      if (d.x < -40) d.x = S.w + 40;
      drawRain(d, now);
    }
  }

  /* ==================== 6. 劳动节 ==================== */
  function layoutLabor() {
    S.stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * S.w, y: Math.random() * S.h * 0.8,
      r: rand(0.8, 1.8), p: Math.random() * TAU, s: rand(0.5, 1.6),
    }));
  }
  function drawLabor(dt, now) {
    for (const s of S.stars) {
      ctx.globalAlpha = (0.3 + 0.55 * (0.5 + 0.5 * Math.sin(now * 0.001 * s.s + s.p)));
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ==================== 7. 儿童节 ==================== */
  function layoutChildren() {
    S.party = Array.from({ length: 22 }, () => ({
      x: Math.random() * S.w,
      y: Math.random() * S.h,
      vx: rand(-0.4, 0.4),
      vy: rand(-0.5, -0.2),
      rot: rand(-0.5, 0.5),
      vr: rand(-0.03, 0.03),
      s: rand(4, 9),
      a: rand(0.4, 0.85),
      color: ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#f368e0'][(Math.random() * 5) | 0],
    }));
  }
  function drawChildren(dt) {
    for (const p of S.party) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.y < -20) { p.y = S.h + 20; p.x = Math.random() * S.w; }
      if (p.x < -20) p.x = S.w + 20;
      if (p.x > S.w + 20) p.x = -20;
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      roundRect(ctx, -p.s / 2, -p.s / 2, p.s, p.s * 0.6, 1.5);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ==================== 8. 端午 ==================== */
  function layoutDragonboat() {
    // 龙舟：两层景深。远处大而快（贴底、偏淡），近处小而慢（偏上、偏实）
    S.boats = [
      { x: rand(-420, S.w), y: S.h * 0.86, s: 1.42, v: rand(0.52, 0.82), p: Math.random() * TAU, a: 0.55 },
      { x: rand(-420, S.w), y: S.h * 0.70, s: 1.00, v: rand(0.30, 0.50), p: Math.random() * TAU, a: 0.90 },
    ];
    // 水面波纹：底部三层，缓慢起伏
    S.waves = Array.from({ length: 3 }, (_, i) => ({
      y: S.h * (0.78 + i * 0.075),
      amp: rand(3.5, 8),
      len: rand(170, 330),
      v: rand(0.005, 0.013),
      p: Math.random() * TAU,
      color: `rgba(125,195,215,${0.15 + i * 0.05})`,
    }));
    // 艾草叶片：收窄 ry 得到细长叶形
    S.petals = Array.from({ length: 18 }, () => makePetal(true, {
      colors: ['#3f9e5c', '#6fbf5f'],
      vyMin: 0.40, vyMax: 1.05, aMin: 0.28, aMax: 0.58,
      rxMin: 3.4, rxMax: 5.2, ryMin: 0.7, ryMax: 1.2,
    }));
  }

  function drawDragonBoat(b, now) {
    const bob = Math.sin(now * 0.0015 + b.p) * 4;
    ctx.save();
    ctx.globalAlpha = b.a;
    ctx.translate(b.x, b.y + bob);
    ctx.scale(b.s, b.s);

    // 船身：上方开口的弧形木舟（底部外凸 + 内凹甲板线）
    ctx.fillStyle = 'rgba(118,64,34,.92)';
    ctx.beginPath();
    ctx.moveTo(-96, -8);
    ctx.quadraticCurveTo(0, 30, 96, -14);
    ctx.lineTo(84, -22);
    ctx.quadraticCurveTo(0, 12, -84, -18);
    ctx.closePath();
    ctx.fill();

    // 船身纹路
    ctx.strokeStyle = 'rgba(255,214,140,.32)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-90, -4);
    ctx.quadraticCurveTo(0, 24, 90, -10);
    ctx.stroke();

    // 船尾上翘
    ctx.fillStyle = 'rgba(96,50,28,.92)';
    ctx.beginPath();
    ctx.moveTo(-96, -8);
    ctx.quadraticCurveTo(-124, -30, -108, -40);
    ctx.lineTo(-96, -18);
    ctx.closePath();
    ctx.fill();

    // 龙头：颈部上扬 + 双角 + 眼
    ctx.fillStyle = 'rgba(150,70,34,.95)';
    ctx.beginPath();
    ctx.moveTo(96, -14);
    ctx.quadraticCurveTo(120, -34, 134, -52);
    ctx.lineTo(146, -44);
    ctx.quadraticCurveTo(126, -26, 104, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,214,140,.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(138, -50); ctx.lineTo(150, -62);
    ctx.moveTo(132, -48); ctx.lineTo(140, -60);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,240,190,.90)';
    ctx.beginPath(); ctx.arc(136, -46, 2.2, 0, TAU); ctx.fill();

    // 桨手剪影：头 + 身 + 桨
    ctx.fillStyle = 'rgba(58,32,17,.78)';
    [-52, -8, 36].forEach(px => {
      ctx.beginPath(); ctx.arc(px, -24, 5, 0, TAU); ctx.fill();
      roundRect(ctx, px - 4, -20, 8, 15, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(58,32,17,.68)';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(px, -16); ctx.lineTo(px + 15, -6); ctx.stroke();
    });

    ctx.restore();
  }
  function drawDragonboat(dt, now) {
    // 水面波纹：逐层正弦，越靠下越浓
    ctx.save();
    for (const w of S.waves) {
      w.p += w.v * dt;
      ctx.strokeStyle = w.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = -20; x <= S.w + 20; x += 8) {
        const y = w.y + Math.sin(x / w.len + w.p) * w.amp;
        if (x <= -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 龙舟：数组按「远→近」排列，顺序绘制即得正确遮挡
    for (const b of S.boats) {
      drawDragonBoat(b, now);
      b.x += b.v * dt;
      if (b.x > S.w + 420) b.x = -420;
    }

    // 艾草叶片飘落
    drawPetals(dt, {
      colors: ['#3f9e5c', '#6fbf5f'],
      vyMin: 0.40, vyMax: 1.05, aMin: 0.28, aMax: 0.58,
      rxMin: 3.4, rxMax: 5.2, ryMin: 0.7, ryMax: 1.2,
    });
  }

  /* ==================== 9. 七夕 ==================== */
  function layoutQixi() {
    // 星河：斜向银河带，用 t 记录沿带方向的位置、off 记录法向偏移
    S.milky = Array.from({ length: 90 }, () => ({
      t: Math.random(),
      off: rand(-58, 58),
      r: rand(0.5, 1.5),
      p: Math.random() * TAU,
      s: rand(0.7, 2.0),
    }));
    // 喜鹊：沿鹊桥停驻
    S.bridge = Array.from({ length: 6 }, (_, i) => ({
      t: (i + 0.5) / 6,
      hop: Math.random() * TAU,
    }));
    // 星星：夜空底噪
    S.stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * S.w, y: Math.random() * S.h * 0.8,
      r: rand(0.6, 1.6), p: Math.random() * TAU, s: rand(0.6, 2.0),
    }));
    // 心形：自下而上缓慢升腾
    S.hearts = Array.from({ length: 8 }, () => ({
      x: Math.random() * S.w,
      y: rand(S.h * 0.30, S.h),
      vx: rand(-0.16, 0.16),
      vy: rand(-0.42, -0.18),
      s: rand(6, 12),
      rot: rand(-0.2, 0.2),
      vr: rand(-0.008, 0.008),
      a: rand(0.22, 0.50),
      color: '#ff85a1',
    }));
  }

  // 银河：对角柔光带 + 密集星点（lighter 叠加，不遮挡内容）
  function drawMilkyWay(now) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, S.h * 0.05, S.w, S.h * 0.85);
    g.addColorStop(0, 'rgba(120,140,220,0)');
    g.addColorStop(0.45, 'rgba(150,170,235,.055)');
    g.addColorStop(0.55, 'rgba(180,190,240,.075)');
    g.addColorStop(1, 'rgba(120,140,220,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S.w, S.h);
    for (const m of S.milky) {
      const bx = m.t * S.w;
      const by = S.h * 0.10 + m.t * S.h * 0.72;
      const x = bx + -0.62 * m.off;
      const y = by + 0.78 * m.off;
      ctx.globalAlpha = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(now * 0.001 * m.s + m.p));
      ctx.fillStyle = '#dfe7ff';
      ctx.beginPath(); ctx.arc(x, y, m.r, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  // 鹊桥：横跨的柔光拱，喜鹊沿拱线停驻
  function drawBridge(now) {
    const y0 = CFG.topInset + S.h * 0.30;
    const w = S.w;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(200,190,245,.13)';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-30, y0);
    ctx.quadraticCurveTo(w * 0.5, y0 + S.h * 0.16, w + 30, y0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(225,220,255,.18)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-30, y0);
    ctx.quadraticCurveTo(w * 0.5, y0 + S.h * 0.16, w + 30, y0);
    ctx.stroke();
    for (const b of S.bridge) {
      // 二次贝塞尔拱线上的点：t 处高度最大偏移 4·h·t(1-t)
      const bx = -30 + (w + 60) * b.t;
      const by = y0 + 4 * S.h * 0.16 * b.t * (1 - b.t) + Math.sin(now * 0.002 + b.hop) * 2;
      ctx.fillStyle = 'rgba(226,228,246,.58)';
      ctx.beginPath(); ctx.ellipse(bx, by, 4.2, 3.0, -0.35, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(bx + 3.4, by - 2.6, 2.6, 2.0, -0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(120,125,150,.62)';
      ctx.beginPath();
      ctx.moveTo(bx - 3.6, by - 0.4);
      ctx.lineTo(bx - 8.2, by + 1.4);
      ctx.lineTo(bx - 3.4, by + 1.8);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawQixi(dt, now) {
    // 夜空底噪
    for (const s of S.stars) {
      ctx.globalAlpha = 0.3 + 0.55 * (0.5 + 0.5 * Math.sin(now * 0.001 * s.s + s.p));
      ctx.fillStyle = '#e0e7ff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 银河 + 鹊桥
    drawMilkyWay(now);
    drawBridge(now);

    // 心形升腾
    for (const h of S.hearts) {
      h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt;
      if (h.y < -30) { h.y = S.h + 30; h.x = Math.random() * S.w; }
      drawHeart(h.x, h.y, h.s, h.rot, h.color, h.a);
    }
  }

  /* ==================== 10. 中秋 ==================== */
  function layoutMidautumn() {
    const r = Math.min(S.w, S.h) * 0.135;
    S.moon = { x: S.w - r * 1.3, y: CFG.topInset + r * 1.15, r };
    S.moonCache = drawMoonBase(r);
    S.clouds = Array.from({ length: 4 }, () => ({
      x: rand(-S.w * 0.2, S.w * 1.1),
      y: rand(CFG.topInset + S.h * 0.05, S.h * 0.62),
      w: rand(190, 400),
      h: rand(26, 50),
      v: rand(0.10, 0.30) * (Math.random() < .5 ? 1 : -1),
      a: rand(0.10, 0.22),
    }));
    S.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * S.w, y: Math.random() * S.h * 0.85,
      r: rand(0.6, 1.5), p: Math.random() * TAU, s: rand(0.6, 1.9),
    }));
    S.petals = Array.from({ length: 26 }, () => makePetal(true));
  }
  function drawMidautumn(dt, now) {
    for (const s of S.stars) {
      ctx.globalAlpha = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(now * 0.001 * s.s + s.p));
      ctx.fillStyle = '#fff8dc';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (S.moonCache) {
      const sz = S.moonCache.size;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(S.moonCache.canvas, S.moon.x - sz / 2, S.moon.y - sz / 2, sz, sz);
      ctx.restore();
    }
    const { x: mx, y: my, r } = S.moon;
    const s = r / 78;
    drawRabbit(ctx, mx - r * 0.10, my + r * 0.50 - 13 * s, s, 'rgba(74,55,30,.80)');
    for (const c of S.clouds) {
      c.x += c.v * dt;
      if (c.v > 0 && c.x - c.w > S.w) c.x = -c.w;
      if (c.v < 0 && c.x + c.w < 0) c.x = S.w + c.w;
      drawCloud(c, bgCtx);
    }
    drawPetals(dt);
  }

  /* ==================== 11. 国庆 ==================== */
  function layoutNational() {
    S.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * S.w, y: Math.random() * S.h * 0.85,
      r: rand(0.6, 1.6), p: Math.random() * TAU, s: rand(0.6, 2.0),
    }));
    S.rockets = [];
    S.nextFirework = performance.now() + 600;
  }
  function drawNational(dt, now) {
    for (const s of S.stars) {
      ctx.globalAlpha = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(now * 0.001 * s.s + s.p));
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (now > S.nextFirework && S.rockets.length < 3) {
      S.rockets.push({
        x: rand(S.w * 0.12, S.w * 0.88), y: S.h + 12,
        vx: rand(-0.7, 0.7), vy: rand(-11.5, -8.5),
        targetY: CFG.topInset + rand(S.h * 0.08, S.h * 0.40),
        hue: rand(0, 360), trail: [],
      });
      S.nextFirework = now + rand(900, 1900);
    }
    updateRockets(dt);
  }

  /* ==================== 12. 重阳 ==================== */
  function layoutChongyang() {
    // 远山：三层剪影（数组按「远 → 近」排列；远山更高更淡、近山更低更浓，近山实心盖远山，避免半透明叠加成"雾"）
    S.hills = [0, 1, 2].map(i => ({
      y: S.h * (0.70 + i * 0.075),
      amp: rand(18, 40) - i * 4,
      len: rand(220, 420) + i * 60,
      p: Math.random() * TAU,
      color: `rgba(${96 + i * 26},${82 + i * 20},${104 + i * 16},${0.32 + i * 0.22})`,
    }));
    // 菊花：放大 rx / ry 得到饱满花形，缓慢旋转飘落
    S.petals = Array.from({ length: 16 }, () => makePetal(true, {
      colors: ['#e8a33d', '#f0b95c'],
      vyMin: 0.30, vyMax: 0.78, aMin: 0.35, aMax: 0.68,
      rxMin: 5.4, rxMax: 8.2, ryMin: 4.8, ryMax: 6.8,
    }));
  }

  // 山峦剪影：两层正弦叠加形成自然山脊（g 为目标画布，山/云走背景层）
  function drawHill(h, now, g) {
    g = g || ctx;
    g.save();
    g.fillStyle = h.color;
    g.beginPath();
    g.moveTo(-40, S.h + 10);
    for (let x = -40; x <= S.w + 40; x += 10) {
      const ridge = Math.sin(x / h.len + h.p) * h.amp
                  + Math.sin(x / (h.len * 0.37) + h.p * 1.6) * h.amp * 0.35;
      g.lineTo(x, h.y + ridge);
    }
    g.lineTo(S.w + 40, S.h + 10);
    g.closePath();
    g.fill();
    g.restore();
  }

  // 菊花：外 8 瓣 + 内 6 瓣 + 花心
  function drawChrysanthemum(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.a;
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate((i / 8) * TAU);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, -p.ry * 1.18, p.rx * 0.32, p.ry * 0.74, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,236,180,.70)';
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i / 6) * TAU + 0.42);
      ctx.beginPath();
      ctx.ellipse(0, -p.ry * 0.64, p.rx * 0.25, p.ry * 0.50, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(176,108,24,.88)';
    ctx.beginPath(); ctx.arc(0, 0, p.ry * 0.32, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function drawChongyang(dt, now) {
    // 远山剪影（数组按远 → 近排列，绘制在背景层，不遮挡内容）
    for (const h of S.hills) drawHill(h, now, bgCtx);

    // 菊花飘落
    for (const p of S.petals) {
      p.sw += p.swSpeed * dt;
      p.x += Math.sin(p.sw) * 0.5 * dt + p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > S.h + 30 || p.x < -40 || p.x > S.w + 40) {
        Object.assign(p, makePetal(false, {
          colors: ['#e8a33d', '#f0b95c'],
          vyMin: 0.30, vyMax: 0.78, aMin: 0.35, aMax: 0.68,
          rxMin: 5.4, rxMax: 8.2, ryMin: 4.8, ryMax: 6.8,
        }));
        p.x = Math.random() * S.w;
      }
      drawChrysanthemum(p);
    }
  }

  /* ==================== 13. 万圣节 ==================== */
  function layoutHalloween() {
    S.petals = Array.from({ length: 20 }, () => makePetal(true, {
      colors: ['#ff7a18', '#8b5cf6'], vyMin: 0.35, vyMax: 0.9,
      aMin: 0.3, aMax: 0.65,
    }));
    S.eggs = Array.from({ length: 8 }, () => ({
      x: Math.random() * S.w, y: Math.random() * S.h,
      rot: rand(-0.3, 0.3), vr: rand(-0.015, 0.015),
      s: rand(14, 24), color: '#ff7a18', a: rand(0.25, 0.55),
    }));
  }
  function drawHalloween(dt) {
    drawPetals(dt, { colors: ['#ff7a18', '#8b5cf6'], vyMin: 0.35, vyMax: 0.9, aMin: 0.3, aMax: 0.65 });
    for (const e of S.eggs) {
      e.rot += e.vr * dt;
      drawEgg(e.x, e.y, e.s, e.rot, e.color, e.a);
    }
  }

  /* ==================== 14. 感恩节 ==================== */
  function layoutThanksgiving() {
    S.leaves = Array.from({ length: 24 }, () => ({
      x: Math.random() * S.w,
      y: initialY(),
      vx: rand(-0.3, 0.3),
      vy: rand(0.4, 0.95),
      rot: Math.random() * TAU,
      vr: rand(-0.03, 0.03),
      sw: Math.random() * TAU,
      swSpeed: rand(0.01, 0.025),
      s: rand(6, 12),
      a: rand(0.4, 0.8),
      color: ['#d35400', '#e67e22', '#c0392b', '#f39c12'][(Math.random() * 4) | 0],
    }));
    function initialY() { return Math.random() * S.h; }
  }
  function drawLeaf(x, y, s, rot, color, a) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.7, -s * 0.4, s * 0.5, s * 0.6, 0, s);
    ctx.bezierCurveTo(-s * 0.5, s * 0.6, -s * 0.7, -s * 0.4, 0, -s);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.15)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
    ctx.restore();
  }
  function drawThanksgiving(dt) {
    for (const l of S.leaves) {
      l.sw += l.swSpeed * dt;
      l.x += Math.sin(l.sw) * 0.6 * dt + l.vx * dt;
      l.y += l.vy * dt;
      l.rot += l.vr * dt;
      if (l.y > S.h + 30) { l.y = -30; l.x = Math.random() * S.w; }
      if (l.x < -30) l.x = S.w + 30;
      if (l.x > S.w + 30) l.x = -30;
      drawLeaf(l.x, l.y, l.s, l.rot, l.color, l.a);
    }
  }

  /* ==================== 15. 圣诞 ==================== */
  function layoutChristmas() {
    S.snow = Array.from({ length: 60 }, () => ({
      x: Math.random() * S.w,
      y: Math.random() * S.h,
      r: rand(1.2, 3.2),
      vx: rand(-0.3, 0.3),
      vy: rand(0.5, 1.4),
      sw: Math.random() * TAU,
      swSpeed: rand(0.01, 0.02),
      a: rand(0.4, 0.9),
    }));
  }
  function drawChristmas(dt) {
    for (const s of S.snow) {
      s.sw += s.swSpeed * dt;
      s.x += Math.sin(s.sw) * 0.4 * dt + s.vx * dt;
      s.y += s.vy * dt;
      if (s.y > S.h + 10) { s.y = -10; s.x = Math.random() * S.w; }
      if (s.x < -10) s.x = S.w + 10;
      if (s.x > S.w + 10) s.x = -10;
      ctx.save();
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  /* ==================== 16. 除夕 ==================== */
  function layoutNewyearEve() {
    S.lanterns = Array.from({ length: 2 }, (_, i) => ({
      x: i === 0 ? S.w * 0.10 : S.w * 0.90,
      len: rand(60, 90) + CFG.topInset,
      w: rand(38, 48), h: rand(44, 56),
      phase: Math.random() * TAU,
    }));
    S.rockets = [];
    S.nextFirework = performance.now() + 400;
  }
  function drawNewyearEve(dt, now) {
    for (const L of S.lanterns) drawLantern(L, now);
    if (now > S.nextFirework && S.rockets.length < 3) {
      S.rockets.push({
        x: rand(S.w * 0.12, S.w * 0.88), y: S.h + 12,
        vx: rand(-0.7, 0.7), vy: rand(-11.5, -8.5),
        targetY: CFG.topInset + rand(S.h * 0.08, S.h * 0.40),
        hue: rand(0, 360), trail: [],
      });
      S.nextFirework = now + rand(900, 1900);
    }
    updateRockets(dt);
  }

  /* ==================== 17. 春节 ==================== */
  function layoutSpring() {
    S.lanterns = Array.from({ length: 2 }, (_, i) => ({
      x: i === 0 ? S.w * 0.10 : S.w * 0.90,
      len: rand(60, 90) + CFG.topInset,
      w: rand(38, 48), h: rand(44, 56),
      phase: Math.random() * TAU,
    }));
    S.crackers = Array.from({ length: 2 }, () => makeCracker(CFG.topInset));
    S.rockets = [];
    S.nextFirework = performance.now() + 500;
  }
  function makeCracker(top) {
    const n = 9 + ((Math.random() * 6) | 0);
    return {
      x: Math.random() < .5 ? rand(S.w * 0.05, S.w * 0.17) : rand(S.w * 0.83, S.w * 0.95),
      y0: top - 30, len: rand(80, 150), n,
      popped: new Array(n).fill(false),
      nextAt: performance.now() + rand(800, 2600),
    };
  }
  function drawLantern(L, now) {
    const ang = Math.sin(now * 0.0011 + L.phase) * 0.055;
    const px = L.x + Math.sin(ang) * L.len;
    const py = L.len * Math.cos(ang);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,205,130,.35)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(L.x, CFG.topInset - 20); ctx.lineTo(px, py); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(px, py + L.h / 2);
    ctx.rotate(ang * 0.7);
    const w = L.w, h = L.h;
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 1.7);
    g.addColorStop(0, 'rgba(255,90,60,.30)');
    g.addColorStop(1, 'rgba(255,90,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, w * 1.7, 0, TAU); ctx.fill();

    const lg = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    lg.addColorStop(0, '#9c1b28');
    lg.addColorStop(0.35, '#ff6154');
    lg.addColorStop(0.62, '#e63946');
    lg.addColorStop(1, '#8c1723');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); ctx.fill();

    ctx.strokeStyle = 'rgba(255,214,102,.45)';
    ctx.lineWidth = 1;
    [-0.22, 0.22].forEach(k => {
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.abs(w * k), h / 2, 0, 0, TAU);
      ctx.stroke();
    });

    ctx.fillStyle = '#ffd166';
    roundRect(ctx, -w * 0.29, -h / 2 - 5, w * 0.58, 5, 2); ctx.fill();
    roundRect(ctx, -w * 0.29, h / 2, w * 0.58, 5, 2); ctx.fill();

    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, h / 2 + 5); ctx.lineTo(0, h / 2 + 24); ctx.stroke();
    ctx.restore();
  }
  function updateCracker(c, dt, now) {
    const seg = c.len / c.n;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,190,120,.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(c.x, c.y0); ctx.lineTo(c.x, c.y0 + c.len); ctx.stroke();
    for (let i = 0; i < c.n; i++) {
      if (c.popped[i]) continue;
      const y = c.y0 + 12 + i * seg;
      ctx.save();
      ctx.translate(c.x, y);
      const grad = ctx.createLinearGradient(-5, 0, 5, 0);
      grad.addColorStop(0, '#a51d1d');
      grad.addColorStop(0.5, '#e63946');
      grad.addColorStop(1, '#8f1a1a');
      ctx.fillStyle = grad;
      roundRect(ctx, -5, -seg * 0.33, 10, seg * 0.66, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,222,150,.8)';
      ctx.fillRect(-5, -0.9, 10, 1.8);
      ctx.restore();
    }
    ctx.restore();

    if (now > c.nextAt) {
      const remain = [];
      for (let i = 0; i < c.n; i++) if (!c.popped[i]) remain.push(i);
      if (remain.length) {
        const idx = remain[(Math.random() * remain.length) | 0];
        c.popped[idx] = true;
        burst(c.x, c.y0 + 12 + idx * seg, 16, rand(20, 38));
        c.nextAt = now + rand(220, 700);
      } else {
        c.popped.fill(false);
        c.nextAt = now + rand(2600, 5200);
      }
    }
  }
  function updateRockets(dt) {
    for (let i = S.rockets.length - 1; i >= 0; i--) {
      const r = S.rockets[i];
      r.x += r.vx * dt; r.y += r.vy * dt;
      r.vy += 0.14 * dt;
      r.trail.push({ x: r.x, y: r.y, life: 1 });
      if (r.trail.length > 14) r.trail.shift();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const t of r.trail) {
        t.life -= 0.07 * dt;
        if (t.life <= 0) continue;
        ctx.globalAlpha = t.life * 0.55;
        ctx.fillStyle = `hsl(${r.hue} 100% 76%)`;
        ctx.beginPath(); ctx.arc(t.x, t.y, 1.7, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff6cf';
      ctx.beginPath(); ctx.arc(r.x, r.y, 2.3, 0, TAU); ctx.fill();
      ctx.restore();
      if (r.y <= r.targetY || r.vy >= 0) {
        explode(r.x, r.y, r.hue);
        S.rockets.splice(i, 1);
      }
    }
    updateSparks(dt);
  }
  function drawSpring(dt, now) {
    for (const L of S.lanterns) drawLantern(L, now);
    for (const c of S.crackers) updateCracker(c, dt, now);
    if (now > S.nextFirework && S.rockets.length < 4) {
      S.rockets.push({
        x: rand(S.w * 0.12, S.w * 0.88), y: S.h + 12,
        vx: rand(-0.7, 0.7), vy: rand(-11.5, -8.5),
        targetY: CFG.topInset + rand(S.h * 0.08, S.h * 0.40),
        hue: rand(0, 360), trail: [],
      });
      S.nextFirework = now + rand(900, 1900);
    }
    updateRockets(dt);
  }

  /* ==================== 布局分发 ==================== */
  function layout() {
    S.petals = []; S.clouds = []; S.stars = []; S.stars2 = [];
    S.lanterns = []; S.crackers = []; S.rockets = []; S.sparks = [];
    S.snow = []; S.hearts = []; S.eggs = []; S.party = []; S.leaves = [];
    S.lanterns2 = [];
    S.boats = []; S.waves = []; S.hills = []; S.rain = []; S.willows = []; S.milky = []; S.bridge = [];
    switch (S.mode) {
      case 'newyear':      layoutNewyear(); break;
      case 'valentine':    layoutValentine(); break;
      case 'yuanxiao':     layoutYuanxiao(); break;
      case 'aprilfool':    layoutAprilfool(); break;
      case 'qingming':     layoutQingming(); break;
      case 'labor':        layoutLabor(); break;
      case 'children':     layoutChildren(); break;
      case 'dragonboat':   layoutDragonboat(); break;
      case 'qixi':         layoutQixi(); break;
      case 'midautumn':    layoutMidautumn(); break;
      case 'national':     layoutNational(); break;
      case 'chongyang':    layoutChongyang(); break;
      case 'halloween':    layoutHalloween(); break;
      case 'thanksgiving': layoutThanksgiving(); break;
      case 'christmas':    layoutChristmas(); break;
      case 'newyearEve':   layoutNewyearEve(); break;
      case 'spring':       layoutSpring(); break;
    }
  }

  /* ==================== 主循环 ==================== */
  function loop(t) {
    if (!S.running) return;
    const dt = Math.min(3, (t - S.last) / 16.667) || 1;
    S.last = t;

    ctx.clearRect(0, 0, S.w, S.h);
    bgCtx.clearRect(0, 0, S.w, S.h);
    if (CFG.backdropDim > 0) {
      ctx.fillStyle = `rgba(6,8,16,${CFG.backdropDim})`;
      ctx.fillRect(0, 0, S.w, S.h);
    }

    switch (S.mode) {
      case 'newyear':      drawNewyear(dt, t); break;
      case 'valentine':    drawValentine(dt); break;
      case 'yuanxiao':     drawYuanxiao(dt, t); break;
      case 'aprilfool':    drawAprilfool(dt); break;
      case 'qingming':     drawQingming(dt, t); break;
      case 'labor':        drawLabor(dt, t); break;
      case 'children':     drawChildren(dt); break;
      case 'dragonboat':   drawDragonboat(dt, t); break;
      case 'qixi':         drawQixi(dt, t); break;
      case 'midautumn':    drawMidautumn(dt, t); break;
      case 'national':     drawNational(dt, t); break;
      case 'chongyang':    drawChongyang(dt, t); break;
      case 'halloween':    drawHalloween(dt); break;
      case 'thanksgiving': drawThanksgiving(dt); break;
      case 'christmas':    drawChristmas(dt); break;
      case 'newyearEve':   drawNewyearEve(dt, t); break;
      case 'spring':       drawSpring(dt, t); break;
    }

    S.raf = requestAnimationFrame(loop);
  }

  function start() {
    if (S.running) return;
    S.running = true;
    S.last = performance.now();
    S.raf = requestAnimationFrame(loop);
  }
  function stop() {
    S.running = false;
    cancelAnimationFrame(S.raf);
  }

  /* ==================== 模式切换 ==================== */
  function setMode(requested) {
    const real = requested === 'auto' ? detect() : requested;
    stop();
    ctx.clearRect(0, 0, S.w, S.h);
    bgCtx.clearRect(0, 0, S.w, S.h);
    S.mode = real;

    if (real === 'none' || reduced) {
      canvas.style.display = 'none';
      bgCanvas.style.display = 'none';
      updateUI(requested);
      return;
    }
    canvas.style.display = 'block';
    bgCanvas.style.display = 'block';
    layout();
    start();
    updateUI(requested);
  }

  /* ==================== 控制面板 ==================== */
  const host = document.createElement('div');
  host.style.cssText = `position:fixed;right:20px;bottom:20px;z-index:${CFG.zIndex + 1};`;
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      .wrap{position:relative;font-family:system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;}
      .fab{width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.18);
        background:rgba(16,18,26,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
        color:#fff;font-size:17px;cursor:pointer;display:grid;place-items:center;
        box-shadow:0 10px 30px -12px rgba(0,0,0,.9);transition:transform .2s,border-color .2s;}
      .fab:hover{transform:scale(1.06);border-color:rgba(255,255,255,.35);}
      .panel{position:absolute;right:0;bottom:58px;width:224px;max-height:70vh;overflow-y:auto;
        padding:6px;border-radius:14px;background:rgba(16,18,26,.94);
        border:1px solid rgba(255,255,255,.12);
        box-shadow:0 24px 60px -20px rgba(0,0,0,.95);
        opacity:0;transform:translateY(8px) scale(.98);pointer-events:none;
        transition:.2s cubic-bezier(.2,.7,.3,1);scrollbar-width:thin;}
      .panel.open{opacity:1;transform:none;pointer-events:auto;}
      .panel::-webkit-scrollbar{width:4px;}
      .panel::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:2px;}
      .panel h6{margin:8px 10px 6px;font-size:10.5px;letter-spacing:.1em;
        text-transform:uppercase;color:rgba(255,255,255,.38);font-weight:700;}
      .opt{display:flex;justify-content:space-between;align-items:center;width:100%;
        padding:9px 10px;border:none;border-radius:9px;background:transparent;color:#e6ebf5;
        font-size:13px;font-family:inherit;cursor:pointer;text-align:left;transition:background .15s;}
      .opt:hover{background:rgba(255,255,255,.08);}
      .opt.on{background:rgba(255,255,255,.14);font-weight:600;}
      .opt small{font-size:10px;color:rgba(255,255,255,.4);font-weight:400;}
      .opt.on small{color:rgba(255,255,255,.6);}
      .divider{height:1px;background:rgba(255,255,255,.08);margin:6px 4px;}
    </style>
    <div class="wrap">
      <button class="fab" id="fab" title="节日特效" aria-label="节日特效设置">✦</button>
      <div class="panel" id="panel">
        <h6>节日特效</h6>
        <div id="opts"></div>
      </div>
    </div>`;

  const fab = shadow.getElementById('fab');
  const panel = shadow.getElementById('panel');
  const opts = shadow.getElementById('opts');

  const OPTIONS = [
    { group: '通用' },
    { key: 'auto', label: '自动跟随日期', hint: '推荐' },
    { key: 'none', label: '关闭特效' },
    { divider: true },
    { group: '公历节日' },
    { key: 'newyear',      label: '元旦' },
    { key: 'valentine',    label: '情人节' },
    { key: 'aprilfool',    label: '愚人节' },
    { key: 'labor',        label: '劳动节' },
    { key: 'children',     label: '儿童节' },
    { key: 'national',     label: '国庆节' },
    { key: 'halloween',    label: '万圣节' },
    { key: 'thanksgiving', label: '感恩节' },
    { key: 'christmas',    label: '圣诞节' },
    { divider: true },
    { group: '农历节日' },
    { key: 'yuanxiao',     label: '元宵节' },
    { key: 'qingming',     label: '清明节' },
    { key: 'dragonboat',   label: '端午节' },
    { key: 'qixi',         label: '七夕节' },
    { key: 'midautumn',    label: '中秋节' },
    { key: 'chongyang',    label: '重阳节' },
    { key: 'newyearEve',   label: '除夕' },
    { key: 'spring',       label: '春节' },
  ];

  function buildOptions() {
    opts.innerHTML = '';
    OPTIONS.forEach(o => {
      if (o.divider) {
        const d = document.createElement('div');
        d.className = 'divider';
        opts.appendChild(d);
        return;
      }
      if (o.group) {
        const h = document.createElement('h6');
        h.textContent = o.group;
        opts.appendChild(h);
        return;
      }
      const b = document.createElement('button');
      b.className = 'opt';
      b.dataset.key = o.key;
      b.innerHTML = `<span>${o.label}</span>` + (o.hint ? `<small>${o.hint}</small>` : '');
      b.addEventListener('click', () => {
        try { localStorage.setItem(CFG.storageKey, o.key); } catch (e) {}
        setMode(o.key);
        panel.classList.remove('open');
      });
      opts.appendChild(b);
    });
  }

  function updateUI(requested) {
    shadow.querySelectorAll('.opt').forEach(el => {
      el.classList.toggle('on', el.dataset.key === requested);
    });
  }

  buildOptions();

  fab.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!e.composedPath().includes(host)) panel.classList.remove('open');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') panel.classList.remove('open');
  });

  /* ==================== 生命周期 ==================== */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (S.mode !== 'none' && !reduced) start();
  });

  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(resize, 180);
  });

  /* ==================== 启动 ==================== */
  resize();

  let saved = 'auto';
  try { saved = localStorage.getItem(CFG.storageKey) || 'auto'; } catch (e) {}
  setMode(saved);

  window.ChertFX = {
    set: setMode,
    detect,
    list: () => Object.keys(LUNAR).concat(['newyear','valentine','aprilfool','labor','children','national','halloween','thanksgiving','christmas']),
    get mode() { return S.mode; },
  };

})();