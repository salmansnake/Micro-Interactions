/* Camera-Off Curtain — vanilla JS. Auto-initializes every [data-mi="camera-curtain"].
   root.setCamera(on) drives it from your real camera state. Call window.initCameraCurtain(el) for later elements. */
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

  function initCameraCurtain(root) {
    if (!root || root.__miCurtain) return;
    root.__miCurtain = true;
    evenLines(root);
    var name = root.getAttribute('data-name') || 'You';
    var cam = root.querySelector('.cc-cam'), camLabel = root.querySelector('.cc-cam-label');
    var label = root.querySelector('.cc-label'), status = root.querySelector('.cc-status');
    var on = true, settle = 0, open = 0;

    function setCamera(v) {
      on = v;
      clearTimeout(settle); clearTimeout(open);
      root.classList.toggle('is-off', !on);
      root.classList.remove('is-settled', 'is-opening');
      cam.setAttribute('aria-pressed', on ? 'true' : 'false');
      camLabel.textContent = on ? 'Turn Camera Off' : 'Turn Camera On';
      label.textContent = on ? name : name + ' · Camera Off';
      if (on) {
        void root.offsetWidth;
        root.classList.add('is-opening');
        open = setTimeout(function () { root.classList.remove('is-opening'); }, 2100);
        status.textContent = 'Camera on. The audience is delighted.';
      } else {
        settle = setTimeout(function () { root.classList.add('is-settled'); }, 900);
        status.textContent = 'Camera off. The show will resume shortly.';
      }
    }

    cam.addEventListener('click', function () { setCamera(!on); });
    root.setCamera = setCamera;
  }

  window.initCameraCurtain = initCameraCurtain;
  function boot() { document.querySelectorAll('[data-mi="camera-curtain"]').forEach(initCameraCurtain); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
