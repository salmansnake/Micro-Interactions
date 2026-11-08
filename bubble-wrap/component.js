/* Bubble Wrap Loader — vanilla JS. Auto-initializes every [data-mi="bubble-wrap"].
   The upload runs on its own (data-seconds); the sheet of data-bubbles bubbles (6 to 60) is just for passing the time.
   Press a bubble, or drag across several, to pop them. Arrow keys move between bubbles; Space or Enter pops.
   Call window.initBubbleWrap(el) for elements added later. */
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

  function initBubbleWrap(root) {
    if (!root || root.__miBw) return;
    root.__miBw = true;
    evenLines(root);
    var sheet = root.querySelector('.bw-sheet'), bar = root.querySelector('.bw-bar'), pct = root.querySelector('.bw-pct');
    var sub = root.querySelector('.bw-sub'), status = root.querySelector('.bw-status'), fresh = root.querySelector('.bw-new');
    var count = Math.min(60, Math.max(6, Number(root.getAttribute('data-bubbles')) || 32)), secs = Number(root.getAttribute('data-seconds')) || 14;
    var popped = 0, total = 0, done = false, t0 = performance.now(), raf = 0, dragging = false, at = 0;

    function say() {
      if (done) status.textContent = 'Uploaded. You popped ' + total + (total === 1 ? ' bubble' : ' bubbles') + ' while you waited.';
      else if (popped === count) status.textContent = 'Sheet finished. There’s always another sheet.';
      else if (total) status.textContent = total + ' popped. It doesn’t make it faster. It does feel nice.';
    }

    function build() {
      sheet.innerHTML = ''; popped = 0;
      for (var i = 0; i < count; i++) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'bw-b'; b.tabIndex = i === at ? 0 : -1;
        b.setAttribute('aria-label', 'Bubble ' + (i + 1));
        sheet.appendChild(b);
      }
    }
    function pop(b) {
      if (!b || !b.classList.contains('bw-b') || b.classList.contains('is-popped')) return;
      b.classList.add('is-popped'); b.setAttribute('aria-label', 'Popped');
      popped++; total++; say();
    }

    // Press, or drag across: every bubble under the pointer pops
    sheet.addEventListener('pointerdown', function (e) {
      dragging = true; sheet.setPointerCapture(e.pointerId);
      pop(e.target.closest('.bw-b'));
    });
    sheet.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var el = document.elementFromPoint(e.clientX, e.clientY);
      pop(el && el.closest ? el.closest('.bw-b') : null);
    });
    ['pointerup', 'pointercancel'].forEach(function (t) { sheet.addEventListener(t, function () { dragging = false; }); });
    // One tab stop for the whole sheet; arrows move, Space and Enter pop
    sheet.addEventListener('keydown', function (e) {
      var bs = sheet.querySelectorAll('.bw-b'), cols = Math.max(1, Math.round(sheet.clientWidth / (bs[0].offsetWidth + 6))), to = at;
      if (e.key === 'ArrowRight') to = at + 1; else if (e.key === 'ArrowLeft') to = at - 1;
      else if (e.key === 'ArrowDown') to = at + cols; else if (e.key === 'ArrowUp') to = at - cols;
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pop(bs[at]); return; }
      else return;
      e.preventDefault();
      to = Math.max(0, Math.min(bs.length - 1, to));
      bs[at].tabIndex = -1; at = to; bs[at].tabIndex = 0; bs[at].focus();
    });
    sheet.addEventListener('click', function (e) { if (e.detail === 0) pop(e.target.closest('.bw-b')); });

    fresh.addEventListener('click', function () { at = 0; build(); say(); if (!total) status.textContent = 'Something to do while you wait.'; });

    // The upload, on its own clock
    (function tick(now) {
      if (!root.isConnected) return;
      var t = Math.min(1, (now - t0) / (secs * 1000)), p = Math.round(t * 100);
      root.style.setProperty('--bw-p', t.toFixed(4));
      pct.textContent = p + '%'; bar.setAttribute('aria-valuenow', p);
      var left = Math.ceil(secs * (1 - t));
      sub.textContent = t < 1 ? 'About ' + left + (left === 1 ? ' second' : ' seconds') + ' left' : 'All 12 photos are up';
      if (t < 1) { raf = requestAnimationFrame(tick); return; }
      done = true; root.classList.add('is-done'); say();
      if (!total) status.textContent = 'Uploaded. You didn’t pop a single one. Remarkable restraint.';
    })(t0);
    build();
  }

  window.initBubbleWrap = initBubbleWrap;
  function boot() { document.querySelectorAll('[data-mi="bubble-wrap"]').forEach(initBubbleWrap); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
