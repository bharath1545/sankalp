/* Full-screen 24-hour countdown overlay.
   The default end time is SANKALP_DATES.hourTimerEnd in config.js.
   Open the site with ?controls to show Pause/Start, Reset and Set time under the timer.
   Those changes are saved in this browser only (localStorage), so visitors are never affected.
   When the time runs out the overlay removes itself, except with ?controls. */
(function () {
  'use strict';
  var KEY = 'sankalp-hour-timer';
  var FULL = 24 * 3600 * 1000;
  var box = document.getElementById('hourTimer');
  var dates = window.SANKALP_DATES || {};
  var defaultEnd = Date.parse(dates.hourTimerEnd);
  if (!box || isNaN(defaultEnd)) return;

  var controls = /[?&]controls(=|&|$)/.test(location.search);
  var hh = document.getElementById('ht-h');
  var mm = document.getElementById('ht-m');
  var ss = document.getElementById('ht-s');
  var sr = document.getElementById('ht-sr');
  var btn = document.getElementById('ht-fs');
  var ctl = document.getElementById('ht-ctl');
  var toggleBtn = document.getElementById('ht-toggle');
  var resetBtn = document.getElementById('ht-reset');
  var setForm = document.getElementById('ht-set');
  var setInput = document.getElementById('ht-set-in');
  var msg = document.getElementById('ht-msg');
  var root = document.documentElement;
  var timer = null;
  var lastMin = -1;

  // State is either { end: ms } (running) or { paused: true, remaining: ms }.
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

  if (!controls && !state.paused && remaining() === 0) return;

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
      sr.textContent = Math.floor(s / 3600) + ' hours ' + (min % 60) + ' minutes remaining';
    }
    if (s === 0 && !state.paused && !controls) finish();
  }

  function finish() {
    clearInterval(timer);
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    box.hidden = true;
    root.classList.remove('has-hour-timer');
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

  root.classList.add('has-hour-timer');
  box.hidden = false;
  tick();
  timer = setInterval(tick, 1000);
})();
