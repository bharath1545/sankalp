/*
 * Loading screen. Runs once per browser session.
 * The inline snippet in index.html decides whether to show it (html.is-loading).
 * Progress eases to 92% and waits for the page's load event, takes at least 2.4 s
 * (0.4 s with reduced motion), then fades out. To see it again, clear sessionStorage
 * or open the site in a new tab/window.
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
  var loaded = document.readyState === 'complete';
  var shown = 0;
  var finished = false;

  window.addEventListener('load', function () { loaded = true; });

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
    try { sessionStorage.setItem('sankalp-loaded', '1'); } catch (e) {}
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
    if (t > 7000) loaded = true; // never wait forever
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
