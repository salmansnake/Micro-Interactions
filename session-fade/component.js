/* Session Fade — vanilla JS. Auto-initializes every [data-mi="session-fade"].
   data-timeout and data-warn are in seconds. Call window.initSessionFade(el) for later elements. */
(function () {
  'use strict';

  // Even line breaks: text that wraps to two or three lines is narrowed until its lines are close in length,
  // with the first line the longest, so no line runs long while the next holds a word or two.
  function evenLines(root) {
    var SEL = 'p, li, dd, dt, small, label, figcaption, h1, h2, h3, h4';
    function widths(el) {
      var range = document.createRange(), rows = [];
      range.selectNodeContents(el);
      Array.prototype.forEach.call(range.getClientRects(), function (b) {
        if (!b.width) return;
        var row = rows.filter(function (x) { return Math.abs(x.t - b.top) < b.height / 2; })[0];
        if (row) { row.l = Math.min(row.l, b.left); row.r = Math.max(row.r, b.right); } else rows.push({ t: b.top, l: b.left, r: b.right });
      });
      return rows.sort(function (a, b) { return a.t - b.t; }).map(function (x) { return x.r - x.l; });
    }
    function fit(el) {
      el.style.maxWidth = ''; el.style.textWrap = '';
      var cs = getComputedStyle(el), full = el.getBoundingClientRect().width;
      if (!full || cs.whiteSpace === 'nowrap' || /flex|grid/.test(cs.display)) return;
      if (Array.prototype.some.call(el.children, function (c) { return !/^inline/.test(getComputedStyle(c).display); })) return;
      el.style.textWrap = 'wrap';
      var n = widths(el).length, lo = 0, hi = full, w, L;
      if (n < 2 || n > 3) { el.style.textWrap = ''; return; }
      while (hi - lo > 1) { w = (lo + hi) / 2; el.style.maxWidth = w + 'px'; if (widths(el).length > n) lo = w; else hi = w; }
      var best = 0, gap = Infinity;
      for (w = Math.ceil(hi); w <= full; w += 2) {
        el.style.maxWidth = w + 'px'; L = widths(el);
        // Each line no longer than the one above (within 10%, which reads as equal). Keep the most even width,
        // and prefer the first line longer: a last line longer than the first costs three times its overhang
        var score = Math.max.apply(null, L) - Math.min.apply(null, L) + Math.max(0, L[n - 1] - L[0]) * 3;
        if (L.length === n && L.every(function (x, i) { return !i || x <= L[i - 1] * 1.1 + 1; }) && score < gap) { gap = score; best = w; }
      }
      if (!best) { el.style.maxWidth = ''; el.style.textWrap = ''; return; }
      el.style.maxWidth = best + 'px';
      if (cs.textAlign === 'center' && cs.display === 'block') { el.style.marginLeft = 'auto'; el.style.marginRight = 'auto'; }
    }
    var queued = false, lastW = 0;
    function run() { queued = false; Array.prototype.forEach.call(root.querySelectorAll(SEL), fit); }
    function later() { if (!queued) { queued = true; requestAnimationFrame(run); } }
    later();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    if (window.ResizeObserver) new ResizeObserver(function () { var w = root.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; later(); } }).observe(root);
    if (window.MutationObserver) new MutationObserver(later).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
  }

  function initSessionFade(root) {
    if (!root || root.__miFade) return;
    root.__miFade = true;
    evenLines(root);
    var TIMEOUT = (Number(root.getAttribute('data-timeout')) || 20) * 1000;
    var WARN = (Number(root.getAttribute('data-warn')) || 10) * 1000;
    var screen = root.querySelector('.sf-screen');
    var banner = root.querySelector('.sf-banner');
    var leftEl = root.querySelector('.sf-left');
    var lock = root.querySelector('.sf-lock');
    var ripple = root.querySelector('.sf-ripple');
    var deadline = 0, raf = 0, visible = false, locked = false, lastShown = '', lastFrame = 0;

    function fmt(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

    function tick() {
      raf = 0;
      if (locked) return;
      var now = performance.now();
      if (!visible) { deadline += now - (lastFrame || now); lastFrame = now; raf = requestAnimationFrame(tick); return; } // pause off screen
      lastFrame = now;
      var left = deadline - now;
      root.style.setProperty('--sf-r', Math.max(0, left / TIMEOUT).toFixed(4));
      if (left <= 0) { signOut(); return; }
      if (left <= WARN) {
        if (!root.classList.contains('is-waking')) root.style.setProperty('--sf-p', (1 - left / WARN).toFixed(4));
        if (banner.hidden) banner.hidden = false;
        var txt = fmt(left);
        if (txt !== lastShown) { leftEl.textContent = txt; lastShown = txt; }
      }
      raf = requestAnimationFrame(tick);
    }
    function start() {
      locked = false;
      lock.hidden = true;
      banner.hidden = true;
      deadline = performance.now() + TIMEOUT;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function wake(x, y) {
      if (locked) return;
      var warning = deadline - performance.now() <= WARN;
      deadline = performance.now() + TIMEOUT;
      if (!warning) return;
      banner.hidden = true;
      root.classList.add('is-waking');
      root.style.setProperty('--sf-p', '0');
      setTimeout(function () { root.classList.remove('is-waking'); }, 760);
      var r = screen.getBoundingClientRect();
      root.style.setProperty('--sf-x', (x != null ? x - r.left : r.width / 2) + 'px');
      root.style.setProperty('--sf-y', (y != null ? y - r.top : r.height / 2) + 'px');
      ripple.classList.remove('is-on');
      void ripple.offsetWidth;
      ripple.classList.add('is-on');
    }
    function signOut() {
      locked = true;
      banner.hidden = true;
      root.style.setProperty('--sf-p', '1');
      lock.hidden = false;
      var a = document.activeElement;
      if (!a || a === document.body || root.contains(a)) lock.querySelector('.sf-again').focus({ preventScroll: true });
    }

    screen.addEventListener('pointermove', function (e) { wake(e.clientX, e.clientY); });
    screen.addEventListener('pointerdown', function (e) { wake(e.clientX, e.clientY); });
    root.addEventListener('keydown', function () { wake(); });
    root.querySelector('.sf-stay').addEventListener('click', function (e) { wake(e.clientX, e.clientY); });
    root.querySelector('.sf-again').addEventListener('click', function () {
      root.classList.add('is-waking');
      root.style.setProperty('--sf-p', '0');
      setTimeout(function () { root.classList.remove('is-waking'); }, 760);
      start();
    });

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !deadline) start();
      }, { threshold: 0.4 }).observe(root);
    } else { visible = true; start(); }
  }

  window.initSessionFade = initSessionFade;
  function boot() { document.querySelectorAll('[data-mi="session-fade"]').forEach(initSessionFade); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
