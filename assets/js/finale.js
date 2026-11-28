/* Finale for the countdown. Shown inside #hourTimer when the time reaches 00:00:00.
   1. Confetti while the timer shows 00:00:00.
   2. The thank-you messages, one at a time, in a loop.
   3. "If you have found it that is" + संकल्प’26, which glitches into Sankalp’26 and back, in a loop.
   No confetti at the end. Then the messages start again.
   API: SankalpFinale.start(box, { immediate }) and SankalpFinale.stop().
   immediate = skip the confetti-on-timer opening (for visitors who arrive after the end). */
(function () {
  'use strict';

  var LINES = [
    'Hope you enjoyed the hackathon',
    'Hope you had lots of water',
    'Hope you made new friends',
    'Hope you learnt',
    'Hope you resolved those errors',
    'Hope you found that intention'
  ];
  var LEAD = 'If you have found it that is';
  var FROM = 'संकल्प’26';
  var TO = 'Sankalp’26';
  var GLITCH_CYCLES = 4; // times संकल्प’26 glitches into Sankalp’26 before the messages start again
  var NOISE = '#%&@$*+=/<>01ΣΞ§¤░▒';
  var COLORS = ['#62c6e4', '#e98fd0', '#f5f3fa', '#f5ee00', '#a78bfa'];
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  var box = null, dom = null, cv = null, cx = null;
  var elLine, elLead, elBig, elGt;
  var token = 0, running = false;
  var parts = [], raf = 0, last = 0, W = 0, H = 0, sc = 1;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function sleep(ms, t) { return new Promise(function (r) { setTimeout(function () { r(t === token); }, ms); }); }

  /* ---------- confetti ---------- */
  function fit() {
    var r = box.getBoundingClientRect();
    var d = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; sc = Math.max(0.8, Math.min(2, W / 1100));
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    cx.setTransform(d, 0, 0, d, 0, 0);
  }
  function add(x, y, vx, vy) {
    parts.push({
      x: x, y: y, vx: vx, vy: vy,
      w: rnd(7, 13) * sc, h: rnd(4, 8) * sc, c: COLORS[(Math.random() * COLORS.length) | 0],
      k: rnd(2.0, 3.6), sw: rnd(-0.05, 0.05) * W,
      r: rnd(0, 6.28), vr: rnd(-9, 9), ph: rnd(0, 6.28), vp: rnd(4, 9), age: 0, life: rnd(5.2, 7.4)
    });
  }
  function cannon(x, angle, n) {
    for (var i = 0; i < n; i++) {
      var a = angle + rnd(-0.34, 0.34), v = rnd(1.8, 3.4) * H;
      add(x, H + 10, Math.cos(a) * v, Math.sin(a) * v);
    }
  }
  function volley(big) {
    if (reduce || !cv) return;
    fit();
    var n = big ? 90 : 55;
    cannon(0, -Math.PI * 0.34, n);
    cannon(W, -Math.PI * 0.66, n);
    for (var i = 0; i < (big ? 70 : 35); i++) add(rnd(0, W), rnd(-H * 0.4, -10), rnd(-0.06, 0.06) * W, rnd(0.05, 0.3) * H);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
  }
  function step(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    cx.clearRect(0, 0, W, H);
    var g = 1.1 * H;
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i], drag = Math.exp(-dt * p.k);
      p.age += dt; p.vy += g * dt; p.vx *= drag; p.vy *= drag;
      p.x += (p.vx + Math.sin(p.ph) * p.sw) * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.ph += p.vp * dt;
      if (p.y > H + 30 || p.age > p.life) { parts.splice(i, 1); continue; }
      cx.save();
      cx.globalAlpha = Math.min(1, (p.life - p.age) * 1.2);
      cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(1, Math.cos(p.ph));
      cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    }
    raf = parts.length ? requestAnimationFrame(step) : 0;
    if (!raf) cx.clearRect(0, 0, W, H);
  }

  /* ---------- glitch ---------- */
  function setBig(text) { elGt.textContent = text; elBig.setAttribute('data-text', text); }
  function scramble() {
    var a1 = rnd(0, 70), a2 = rnd(0, 70);
    elBig.style.setProperty('--a1', a1.toFixed(1) + '%');
    elBig.style.setProperty('--b1', Math.max(4, 100 - a1 - rnd(8, 34)).toFixed(1) + '%');
    elBig.style.setProperty('--a2', a2.toFixed(1) + '%');
    elBig.style.setProperty('--b2', Math.max(4, 100 - a2 - rnd(8, 34)).toFixed(1) + '%');
    elBig.style.setProperty('--dx', rnd(0.5, 1.8).toFixed(2) + 'cqw');
    elBig.style.setProperty('--jx', rnd(-0.9, 0.9).toFixed(2) + 'cqw');
    elBig.style.setProperty('--sk', rnd(-9, 9).toFixed(1) + 'deg');
    elBig.classList.toggle('flash', Math.random() < 0.25);
  }
  function calm() {
    ['--jx', '--sk', '--dx'].forEach(function (k) { elBig.style.setProperty(k, k === '--sk' ? '0deg' : '0cqw'); });
    elBig.classList.remove('on', 'flash');
  }
  function noise(n) { var s = ''; for (var i = 0; i < n; i++) s += NOISE.charAt((Math.random() * NOISE.length) | 0); return s; }
  function corrupt(str, p) {
    return str.split('').map(function (ch) { return Math.random() < p ? NOISE.charAt((Math.random() * NOISE.length) | 0) : ch; }).join('');
  }
  /* Burst: random frames flip between the two words and noise, with split slices. Ends on `to`. */
  async function glitch(from, to, t) {
    if (reduce) { setBig(to); return true; }
    var latin = from === TO ? from : to;
    var D = 1700, t0 = Date.now();
    elBig.classList.add('on');
    while (Date.now() - t0 < D) {
      var p = (Date.now() - t0) / D, pf = 1 - p, r = Math.random();
      var txt;
      if (r < pf * 0.6) txt = from;
      else if (r < pf * 0.6 + 0.15) txt = noise(8);
      else if (p > 0.4 && Math.random() < p) txt = to;
      else txt = corrupt(latin, pf * 0.7);
      setBig(txt);
      scramble();
      if (!(await sleep(rnd(40, 120), t))) return false;
    }
    setBig(to); calm();
    return true;
  }
  /* After landing: short glitch bursts now and then, text unchanged. */
  async function idle(ms, t) {
    var end = Date.now() + ms;
    while (Date.now() < end) {
      if (!(await sleep(rnd(900, 1700), t))) return false;
      if (reduce) continue;
      elBig.classList.add('on');
      for (var i = 0; i < 4; i++) { scramble(); if (!(await sleep(65, t))) return false; }
      calm();
    }
    return true;
  }

  /* ---------- build and run ---------- */
  function build() {
    if (dom) return;
    dom = document.createElement('div');
    dom.className = 'fn';
    dom.innerHTML =
      '<div class="fn-grp"><p class="fn-line"></p></div>' +
      '<div class="fn-grp"><p class="fn-lead"></p><p class="fn-big" data-text=""><span class="gt"></span></p></div>' +
      '<p class="ht-sr">' + LINES.join('. ') + '. ' + LEAD + ' ' + TO + '.</p>';
    box.appendChild(dom);
    cv = document.createElement('canvas');
    cv.className = 'fn-cv';
    cv.setAttribute('aria-hidden', 'true');
    box.appendChild(cv);
    cx = cv.getContext('2d');
    elLine = dom.querySelector('.fn-line');
    elLead = dom.querySelector('.fn-lead');
    elBig = dom.querySelector('.fn-big');
    elGt = dom.querySelector('.gt');
    elLead.textContent = LEAD;
    window.addEventListener('resize', function () { if (cv && box) fit(); });
  }

  async function run(t, immediate, toEnd) {
    if (!immediate) {
      box.classList.add('fn-boom');
      volley(true);
      if (!(await sleep(1000, t))) return;
      volley(true);
      if (!(await sleep(1700, t))) return;
    }
    box.classList.add('finale');
    if (!(await sleep(900, t))) return;
    box.classList.add('fn-gone');

    var cur = FROM;
    setBig(FROM);
    if (toEnd) {
      elLead.classList.add('gone');
      elBig.classList.add('in');
    } else {
      for (var i = 0; i < LINES.length; i++) {
        elLine.textContent = LINES[i];
        elLine.classList.add('in');
        if (!(await sleep(2500, t))) return;
        elLine.classList.remove('in');
        if (!(await sleep(700, t))) return;
      }
      elLead.classList.add('in');
      if (!(await sleep(1100, t))) return;
      elBig.classList.add('in');
      if (!(await sleep(2200, t))) return;
      if (!(await glitch(FROM, TO, t))) return;
      cur = TO;
      if (!(await idle(2200, t))) return;
      // The lead line goes away. Only the name is left.
      elLead.classList.remove('in');
      elLead.classList.add('gone');
      if (!(await sleep(900, t))) return;
    }

    // Final loop: संकल्प’26 and Sankalp’26 glitch into each other, for good. No confetti.
    while (t === token) {
      if (!(await idle(cur === FROM ? 2000 : 3400, t))) return;
      var next = cur === FROM ? TO : FROM;
      if (!(await glitch(cur, next, t))) return;
      cur = next;
    }
  }

  function start(el, opts) {
    if (running) return;
    box = el; running = true;
    build(); fit();
    var t = ++token;
    var toEnd = window.SANKALP_FINALE_END === true || /[?&]finale=end(&|$)/.test(location.search);
    run(t, !!(opts && opts.immediate), toEnd);
  }
  function stop() {
    if (!running) return;
    running = false; token++;
    parts.length = 0;
    if (cx) cx.clearRect(0, 0, W, H);
    ['fn-boom', 'finale', 'fn-gone'].forEach(function (c) { box.classList.remove(c); });
    [elLine, elLead, elBig].forEach(function (e) { if (e) e.classList.remove('in', 'gone'); });
    if (elBig) calm();
  }

  window.SankalpFinale = { start: start, stop: stop };
})();
