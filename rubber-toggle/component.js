/* Rubber Toggle — vanilla JS. Auto-initializes every [data-mi="rubber-toggle"].
   Drag a knob and it follows; drag past either end and it stretches like rubber (up to 1.5×, more slowly the further
   you go). Let go and it snaps to the nearer side on the pop spring. A tap squishes it, then flips it.
   Call window.initRubberToggle(el) for elements added later. */
(function () {
  'use strict';
  var TRAVEL = 20; // 52px track, 26px knob, 3px inset each side

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
      // A filled box marked data-fill spans the card from edge to edge, and its text fills it
      if (el.hasAttribute('data-fill')) return;
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

  function initRubberToggle(root) {
    if (!root || root.__miRtg) return;
    root.__miRtg = true;
    evenLines(root);

    root.querySelectorAll('.rtg-switch').forEach(function (sw) {
      var start = 0, base = 0, moved = false, down = false;
      function on() { return sw.getAttribute('aria-checked') === 'true'; }
      function rest() { sw.style.setProperty('--rtg-x', (on() ? TRAVEL : 0) + 'px'); sw.style.setProperty('--rtg-s', 1); }
      function flip(v) { sw.setAttribute('aria-checked', v ? 'true' : 'false'); rest(); }

      sw.addEventListener('pointerdown', function (e) {
        down = true; moved = false; start = e.clientX; base = on() ? TRAVEL : 0;
        sw.setPointerCapture(e.pointerId);
      });
      sw.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - start;
        if (!moved && Math.abs(dx) < 3) return;
        moved = true; sw.classList.add('is-dragging');
        var x = base + dx, over = x < 0 ? -x : Math.max(0, x - TRAVEL);
        // Past an end the knob stays put and stretches toward the pointer instead, with growing resistance (at most 1.5×)
        var s = 1 + 0.5 * (1 - Math.exp(-over / 40));
        sw.style.setProperty('--rtg-o', x < 0 ? '100% 50%' : '0 50%');
        sw.style.setProperty('--rtg-x', Math.max(0, Math.min(TRAVEL, x)) + 'px');
        sw.style.setProperty('--rtg-s', s.toFixed(3));
      });
      function up(e) {
        if (!down) return;
        down = false; sw.classList.remove('is-dragging');
        if (!moved) return;
        var x = base + (e.clientX - start);
        flip(x > TRAVEL / 2);
      }
      sw.addEventListener('pointerup', up);
      sw.addEventListener('pointercancel', function () { down = false; sw.classList.remove('is-dragging'); rest(); });
      sw.addEventListener('click', function (e) {
        if (moved) { moved = false; e.preventDefault(); return; }
        sw.classList.remove('is-squish'); void sw.offsetWidth; sw.classList.add('is-squish');
        flip(!on());
      });
      sw.addEventListener('animationend', function () { sw.classList.remove('is-squish'); });
      rest();
    });
  }

  window.initRubberToggle = initRubberToggle;
  function boot() { document.querySelectorAll('[data-mi="rubber-toggle"]').forEach(initRubberToggle); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
