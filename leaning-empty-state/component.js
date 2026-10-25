/* Leaning Empty State — vanilla JS. Auto-initializes every [data-mi="leaning-empty-state"].
   Call window.initLeaningEmptyState(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var RANGE = 320; // px from the button where the lean starts

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

  function initLeaningEmptyState(root) {
    if (!root || root.__miLean) return;
    root.__miLean = true;
    evenLines(root);
    var empty = root.querySelector('.le-empty');
    var filled = root.querySelector('.le-filled');
    var cta = root.querySelector('.le-cta');
    var tiles = Array.prototype.slice.call(root.querySelectorAll('.le-tile'));
    var raf = 0, px = 0, py = 0;

    function lean(pull) {
      var c = cta.getBoundingClientRect();
      var cx = c.left + c.width / 2, cy = c.top + c.height / 2;
      root.style.setProperty('--le-pull', pull.toFixed(3));
      tiles.forEach(function (t) {
        var r = t.getBoundingClientRect();
        var dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
        var len = Math.hypot(dx, dy) || 1;
        var ux = dx / len, uy = dy / len;
        // Tilt so the tile's face turns toward the button, and drift a little toward it.
        t.style.setProperty('--rx', (-uy * 22 * pull).toFixed(2) + 'deg');
        t.style.setProperty('--ry', (ux * 22 * pull).toFixed(2) + 'deg');
        t.style.setProperty('--tx', (ux * 8 * pull).toFixed(2) + 'px');
        t.style.setProperty('--ty', (uy * 8 * pull).toFixed(2) + 'px');
      });
    }

    function frame() {
      raf = 0;
      var c = cta.getBoundingClientRect();
      var d = Math.hypot(px - (c.left + c.width / 2), py - (c.top + c.height / 2));
      lean(Math.max(0, Math.min(1, 1 - d / RANGE)));
    }

    root.addEventListener('pointermove', function (e) {
      if (reduce.matches || empty.hidden) return;
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
    });
    root.addEventListener('pointerleave', function () { lean(0); });
    cta.addEventListener('focus', function () { if (!reduce.matches) lean(1); });
    cta.addEventListener('blur', function () { lean(0); });

    cta.addEventListener('click', function () {
      var c = cta.getBoundingClientRect();
      var done = function () {
        empty.hidden = true;
        filled.hidden = false;
        var item = filled.querySelector('.le-item');
        item.classList.remove('is-new');
        void item.offsetWidth;
        item.classList.add('is-new');
        filled.querySelector('.le-reset').focus();
      };
      if (reduce.matches) { done(); return; }
      // The tiles gather into the button, then the first project arrives.
      tiles.forEach(function (t, i) {
        var r = t.getBoundingClientRect();
        var dx = c.left + c.width / 2 - (r.left + r.width / 2), dy = c.top + c.height / 2 - (r.top + r.height / 2);
        t.animate([
          { transform: getComputedStyle(t).transform, opacity: 1 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.2) rotate(' + (i % 2 ? 40 : -40) + 'deg)', opacity: 0 }
        ], { duration: 420, delay: i * 50, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
      });
      cta.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: 600, delay: 260 });
      setTimeout(done, 620);
    });

    root.querySelector('.le-reset').addEventListener('click', function () {
      filled.hidden = true;
      empty.hidden = false;
      tiles.forEach(function (t) { t.getAnimations().forEach(function (a) { a.cancel(); }); });
      lean(0);
      cta.focus();
    });
  }

  window.initLeaningEmptyState = initLeaningEmptyState;
  function boot() { document.querySelectorAll('[data-mi="leaning-empty-state"]').forEach(initLeaningEmptyState); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
