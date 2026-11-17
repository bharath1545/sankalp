/*
 * Loading screen. Runs on every page load, including refreshes.
 * The inline snippet in index.html turns it on (html.is-loading).
 * Progress eases to 92% and waits until the page has really loaded
 * (load event and web fonts), takes at least 2.4 s (0.4 s with reduced motion),
 * then fades out.
 */
(function () {
  var root = document.documentElement;
  var el = document.getElementById('loader');
  if (!root.classList.contains('is-loading') || !el) { root.classList.remove('is-loading'); return; }

  var fill = el.querySelector('.ld-fill');
  var pct = el.querySelector('.ld-row b');
  var bar = el.querySelector('[role=progressbar]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MIN = reduce ? 400 : 2400;
  var t0 = performance.now();
  var pageLoaded = document.readyState === 'complete';
  var fontsReady = !(document.fonts && document.fonts.ready);
  var loaded = false;
  var shown = 0;
  var finished = false;

  window.addEventListener('load', function () { pageLoaded = true; });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { fontsReady = true; }, function () { fontsReady = true; });
  }

  function ease(t) { return 1 - Math.pow(1 - t, 2.4); }

  function paint(p) {
    var v = Math.round(p);
    fill.style.width = p + '%';
    pct.textContent = v + '%';
    bar.setAttribute('aria-valuenow', v);
  }

  function finish() {
    if (finished) return;
    finished = true;
    el.classList.add('out');
    root.classList.remove('is-loading');
    // keep the element for the fade, then remove it
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, reduce ? 0 : 800);
    // the page could not scroll to a #hash while it was locked
    if (location.hash.length > 1) {
      try { var t = document.querySelector(location.hash); if (t) t.scrollIntoView(); } catch (e) {}
    }
  }

  function frame(now) {
    var t = now - t0;
    if (t > 7000) { pageLoaded = true; fontsReady = true; } // never wait forever
    loaded = pageLoaded && fontsReady;
    var target = ease(Math.min(1, t / MIN)) * 100;
    if (!loaded) target = Math.min(target, 92);
    else if (t >= MIN) target = 100;
    shown += (target - shown) * (reduce ? 1 : 0.25);
    if (target === 100 && shown > 99.5) shown = 100;
    paint(shown);
    if (shown >= 100) { setTimeout(finish, reduce ? 0 : 250); return; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
