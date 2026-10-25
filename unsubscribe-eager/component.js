/* Unsubscribe Comes to You — vanilla JS. Auto-initializes every [data-mi="unsubscribe-eager"].
   Within 220px of the pointer, the button springs toward it (kept inside the card) and gets keener as it gets
   closer. On touch and keyboard it simply stays put. Call window.initUnsubscribeEager(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var RANGE = 220, PULL = 0.62;

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

  function initUnsubscribeEager(root) {
    if (!root || root.__miUnsub) return;
    root.__miUnsub = true;
    evenLines(root);
    var btn = root.querySelector('.ue-btn'), label = root.querySelector('.ue-label');
    var status = root.querySelector('.ue-status'), undo = root.querySelector('.ue-undo');
    var x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, s = 1, ts = 1, raf = 0, done = false;

    function home() {
      var r = btn.getBoundingClientRect();
      return { cx: r.left + r.width / 2 - x, cy: r.top + r.height / 2 - y, w: r.width, h: r.height };
    }

    function step() {
      // A spring with a little overshoot, so it looks keen rather than mechanical.
      vx = (vx + (tx - x) * 0.14) * 0.72; vy = (vy + (ty - y) * 0.14) * 0.72;
      x += vx; y += vy; s += (ts - s) * 0.2;
      btn.style.setProperty('--ue-x', x.toFixed(1) + 'px');
      btn.style.setProperty('--ue-y', y.toFixed(1) + 'px');
      btn.style.setProperty('--ue-s', s.toFixed(3));
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) + Math.abs(ts - s) > 0.05) raf = requestAnimationFrame(step);
      else raf = 0;
    }
    function go() { if (!raf) raf = requestAnimationFrame(step); }

    root.addEventListener('pointermove', function (e) {
      if (done || e.pointerType !== 'mouse' || reduce.matches) return;
      var h = home(), dx = e.clientX - h.cx, dy = e.clientY - h.cy, d = Math.hypot(dx, dy);
      var card = root.getBoundingClientRect();
      if (d < RANGE) {
        var k = PULL * (1 - d / RANGE * 0.4);
        tx = dx * k; ty = dy * k;
        // Stay inside the card.
        tx = Math.max(card.left + 12 + h.w / 2 - h.cx, Math.min(card.right - 12 - h.w / 2 - h.cx, tx));
        ty = Math.max(card.top + 12 + h.h / 2 - h.cy, Math.min(card.bottom - 12 - h.h / 2 - h.cy, ty));
        ts = 1 + 0.18 * (1 - d / RANGE);
        var near = d < 150;
        root.classList.toggle('is-near', near);
        root.classList.toggle('is-eager', d < 70);
        label.textContent = d < 70 ? 'Yes, This One' : near ? 'Over Here' : 'Unsubscribe';
      } else {
        tx = 0; ty = 0; ts = 1;
        root.classList.remove('is-near', 'is-eager');
        label.textContent = 'Unsubscribe';
      }
      go();
    });
    root.addEventListener('pointerleave', function () {
      if (done) return;
      tx = 0; ty = 0; ts = 1;
      root.classList.remove('is-near', 'is-eager');
      label.textContent = 'Unsubscribe';
      go();
    });

    btn.addEventListener('click', function () {
      if (done) return;
      done = true;
      root.classList.remove('is-eager');
      root.classList.add('is-done');
      label.textContent = 'Unsubscribed';
      status.textContent = 'Done. No survey, no “Are you sure?”, no sad puppy. That’s it.';
      undo.hidden = false;
      tx = 0; ty = 0; ts = 1; go();
    });
    undo.addEventListener('click', function () {
      done = false;
      root.classList.remove('is-done', 'is-near');
      label.textContent = 'Unsubscribe';
      status.textContent = 'Resubscribed. We’ll pretend that didn’t happen.';
      undo.hidden = true;
      btn.focus();
    });
  }

  window.initUnsubscribeEager = initUnsubscribeEager;
  function boot() { document.querySelectorAll('[data-mi="unsubscribe-eager"]').forEach(initUnsubscribeEager); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
