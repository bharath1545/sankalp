/* Full-screen 24-hour countdown overlay.
   The default end time is SANKALP_DATES.hourTimerEnd in config.js.
   At 00:00:00 finale.js takes over: confetti, then the thank-you messages in a loop.
   The overlay stays after the end, so visitors who arrive later also see the finale, not the old site.
   Open the site with ?controls to show Pause/Start, Reset and Set time. Reset or Set time brings the timer back.
   Those changes are saved in this browser only (localStorage), so visitors are never affected.
   No internet: the timer pauses and carries on when the connection is back. Every 5 seconds it asks
   this site for a small file (config.js). If that fails twice, or the browser says it is offline, it pauses. */
(function () {
  'use strict';
  var KEY = 'sankalp-hour-timer';
  var FULL = 24 * 3600 * 1000;
  var PING = 'assets/js/config.js'; // same site, so a blocked Google or a school firewall cannot pause the timer
  var box = document.getElementById('hourTimer');
  var dates = window.SANKALP_DATES || {};
  var defaultEnd = Date.parse(dates.hourTimerEnd);
  if (!box || isNaN(defaultEnd)) return;

  var controls = /[?&]controls(=|&|$)/.test(location.search);
  var $ = function (id) { return document.getElementById(id); };
  var hh = $('ht-h'), mm = $('ht-m'), ss = $('ht-s'), sr = $('ht-sr'), btn = $('ht-fs');
  var ctl = $('ht-ctl'), toggleBtn = $('ht-toggle'), resetBtn = $('ht-reset');
  var setForm = $('ht-set'), setInput = $('ht-set-in'), msg = $('ht-msg');
  var root = document.documentElement;
  var lastMin = -1;
  var finaleOn = false;

  // State is { end: ms } (running) or { paused: true, remaining: ms [, auto: true] }.
  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && (typeof v.end === 'number' || (v.paused === true && typeof v.remaining === 'number'))) return v;
    } catch (e) {}
    return { end: defaultEnd };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  var state = load();

  function remaining() {
    return state.paused ? state.remaining : Math.max(0, state.end - Date.now());
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var hasFinale = !!window.SankalpFinale;
  var late = !state.paused && remaining() === 0;
  // Without the finale script, keep the old behaviour: show nothing after the end.
  if (late && !hasFinale) return;

  function startFinale(immediate) {
    if (finaleOn || !hasFinale) return;
    finaleOn = true;
    window.SankalpFinale.start(box, { immediate: immediate });
  }
  function stopFinale() {
    if (!finaleOn) return;
    finaleOn = false;
    window.SankalpFinale.stop();
  }

  function tick() {
    var left = remaining();
    var s = Math.floor(left / 1000);
    hh.textContent = pad(Math.floor(s / 3600));
    mm.textContent = pad(Math.floor(s % 3600 / 60));
    ss.textContent = pad(s % 60);
    box.classList.toggle('paused', !!state.paused);
    if (toggleBtn) toggleBtn.textContent = state.paused ? 'Start' : 'Pause';
    var min = Math.floor(s / 60);
    if (min !== lastMin) {
      lastMin = min;
      if (!finaleOn) sr.textContent = Math.floor(s / 3600) + ' hours ' + (min % 60) + ' minutes remaining';
    }
    if (s === 0 && !state.paused) startFinale(false);
    else if (finaleOn && (s > 0 || state.paused)) stopFinale();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (box.requestFullscreen) box.requestFullscreen().catch(function () {});
  }

  // Fullscreen is not available on every browser (iPhone Safari). The overlay already fills the viewport.
  if (box.requestFullscreen) {
    btn.hidden = false;
    btn.addEventListener('click', toggleFullscreen);
    box.addEventListener('dblclick', function (e) {
      if (ctl && ctl.contains(e.target)) return;
      toggleFullscreen();
    });
  }

  if (controls && ctl) {
    ctl.hidden = false;
    toggleBtn.addEventListener('click', function () {
      var left = remaining();
      state = state.paused ? { end: Date.now() + left } : { paused: true, remaining: left };
      msg.textContent = '';
      save(); tick();
    });
    resetBtn.addEventListener('click', function () {
      state = { paused: true, remaining: FULL };
      msg.textContent = 'Reset to 24:00:00. Press Start.';
      save(); tick();
    });
    setForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = /^\s*(\d{1,2}):([0-5]?\d)(?::([0-5]?\d))?\s*$/.exec(setInput.value);
      if (!m) { msg.textContent = 'Use HH:MM:SS, for example 05:30:00.'; return; }
      var ms = ((+m[1]) * 3600 + (+m[2]) * 60 + (+(m[3] || 0))) * 1000;
      state = state.paused ? { paused: true, remaining: ms } : { end: Date.now() + ms };
      msg.textContent = '';
      setInput.value = '';
      save(); tick();
    });
  }

  // Pause while offline. An automatic pause carries { auto: true } so only it resumes by itself.
  var fails = 0, lastOk = Date.now(), checking = false;
  function goOffline() {
    if (state.paused || remaining() === 0) return;
    // Count the time up to the last good check, not the seconds spent finding out.
    state = { paused: true, remaining: Math.max(0, state.end - lastOk), auto: true };
    save(); tick();
  }
  function goOnline() {
    if (state.paused && state.auto) {
      state = { end: Date.now() + state.remaining };
      save(); tick();
    }
  }
  function check() {
    if (checking) return;
    if (navigator.onLine === false) { lastOk = Date.now(); fails = 2; goOffline(); return; }
    if (typeof fetch !== 'function') return;
    checking = true;
    var ac = typeof AbortController === 'function' ? new AbortController() : null;
    var to = setTimeout(function () { if (ac) ac.abort(); }, 4000);
    fetch(PING + '?t=' + Date.now(), { method: 'HEAD', cache: 'no-store', signal: ac ? ac.signal : undefined })
      .then(function () { fails = 0; lastOk = Date.now(); goOnline(); })
      .catch(function () { fails++; if (fails >= 2) goOffline(); })
      .then(function () { clearTimeout(to); checking = false; });
  }

  root.classList.add('has-hour-timer');
  box.hidden = false;
  if (late) startFinale(true);
  tick();
  setInterval(tick, 1000);
  setInterval(check, 5000);
  window.addEventListener('online', check);
  window.addEventListener('offline', check);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
  check();
})();
