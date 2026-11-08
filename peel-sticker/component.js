/* Peel Sticker — vanilla JS. Auto-initializes every [data-mi="peel-sticker"].
   Dragging left pulls the sticker's right edge back over itself (--pst-peel is how far the edge has moved). Past 55% of
   its width it comes off and flies away; short of that it springs back flat. A press (or Enter) peels it in one go.
   Call window.initPeelSticker(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  function initPeelSticker(root) {
    if (!root || root.__miPst) return;
    root.__miPst = true;
    evenLines(root);
    var sticker = root.querySelector('.pst-sticker'), key = root.querySelector('.pst-key'), status = root.querySelector('.pst-status');
    var copy = root.querySelector('.pst-copy'), copyLabel = root.querySelector('.pst-clabel');
    var code = root.getAttribute('data-key') || key.textContent;
    var down = false, moved = false, start = 0, peel = 0, gone = false, timer = 0;
    key.textContent = code;

    function set(px) { peel = px; root.style.setProperty('--pst-peel', px.toFixed(1) + 'px'); root.classList.toggle('is-peeling', px > 0.5); }
    function off() {
      gone = true; root.classList.add('is-gone', 'is-peeled');
      // Once it's off, the sticker leaves the tab order at once and the page when it has flown away
      sticker.tabIndex = -1; sticker.setAttribute('aria-hidden', 'true');
      sticker.addEventListener('animationend', function () { sticker.hidden = true; }, { once: true });
      key.removeAttribute('aria-hidden');
      status.textContent = 'Peeled clean. The key is yours.';
      copy.hidden = false; copy.focus({ preventScroll: true });
    }
    function springBack() {
      root.classList.add('is-springing'); set(0);
      setTimeout(function () { root.classList.remove('is-springing'); }, 480);
    }

    sticker.addEventListener('pointerdown', function (e) {
      if (gone) return;
      down = true; moved = false; start = e.clientX; sticker.setPointerCapture(e.pointerId);
    });
    sticker.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = start - e.clientX;
      if (!moved && Math.abs(dx) < 3) return;
      moved = true;
      set(Math.max(0, Math.min(sticker.clientWidth * 1.4, dx)));
    });
    function up() {
      if (!down) return;
      down = false;
      if (!moved) return;
      if (peel > sticker.clientWidth * 0.55) off(); else springBack();
    }
    sticker.addEventListener('pointerup', up);
    sticker.addEventListener('pointercancel', function () { down = false; springBack(); });
    // A press, or the keyboard: peel it in one smooth pull
    sticker.addEventListener('click', function () {
      if (gone || moved) { moved = false; return; }
      if (reduce.matches) return off();
      var W = sticker.clientWidth, t0 = performance.now();
      (function pull(now) {
        var t = Math.min(1, (now - t0) / 520), e = t * t * (3 - 2 * t);
        set(e * W * 0.8);
        if (t < 1) requestAnimationFrame(pull); else off();
      })(t0);
    });

    copy.addEventListener('click', function () {
      try { if (navigator.clipboard) navigator.clipboard.writeText(code).catch(function () {}); } catch (e) {}
      copy.classList.add('is-done'); copyLabel.textContent = 'Copied';
      clearTimeout(timer);
      timer = setTimeout(function () { copy.classList.remove('is-done'); copyLabel.textContent = 'Copy Key'; }, 1500);
    });
    // Copy keeps its width when it says Copied (button rule: confirmations never move)
    function sizeCopy() {
      var was = copy.hidden; copy.hidden = false; copy.style.minWidth = '';
      var w = copy.getBoundingClientRect().width; copyLabel.textContent = 'Copied';
      copy.classList.add('is-done'); w = Math.max(w, copy.getBoundingClientRect().width);
      copy.classList.remove('is-done'); copyLabel.textContent = 'Copy Key';
      copy.style.minWidth = Math.ceil(w) + 'px'; copy.hidden = was;
    }
    sizeCopy();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeCopy);
  }

  window.initPeelSticker = initPeelSticker;
  function boot() { document.querySelectorAll('[data-mi="peel-sticker"]').forEach(initPeelSticker); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
