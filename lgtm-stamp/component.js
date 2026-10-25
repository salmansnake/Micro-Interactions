/* LGTM (Didn't Look) — vanilla JS. Auto-initializes every [data-mi="lgtm-stamp"].
   Files viewed follow how far the diff is scrolled. Approving before data-honest-seconds with under 80% of
   files viewed stamps "(Didn't Look)". Call window.initLgtmStamp(el) for elements added later. */
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

  function initLgtmStamp(root) {
    if (!root || root.__miLgtm) return;
    root.__miLgtm = true;
    evenLines(root);
    var files = Number(root.getAttribute('data-files')) || 48;
    var honestSecs = Number(root.getAttribute('data-honest-seconds')) || 20;
    var diff = root.querySelector('.lg-diff'), viewedEl = root.querySelector('.lg-viewed');
    var timer = root.querySelector('.lg-timer'), approve = root.querySelector('.lg-approve');
    var sub = root.querySelector('.lg-stamp-sub'), status = root.querySelector('.lg-status'), undo = root.querySelector('.lg-undo');
    var opened = 0, viewed = 0, raf = 0, stamped = false;

    function tick() {
      if (!opened || stamped) return;
      timer.textContent = 'Open for ' + ((performance.now() - opened) / 1000).toFixed(1) + ' seconds';
      raf = requestAnimationFrame(tick);
    }
    function start() { opened = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }

    diff.addEventListener('scroll', function () {
      var max = diff.scrollHeight - diff.clientHeight;
      var v = Math.round((max > 0 ? diff.scrollTop / max : 1) * files);
      if (v > viewed) { viewed = v; viewedEl.textContent = viewed; }
    }, { passive: true });

    approve.addEventListener('click', function () {
      if (stamped) return;
      stamped = true;
      cancelAnimationFrame(raf);
      var secs = opened ? (performance.now() - opened) / 1000 : 0;
      var honest = viewed >= files * 0.8 || secs >= honestSecs;
      root.classList.toggle('is-honest', honest);
      sub.textContent = honest ? '(Actually Looked)' : '(Didn’t Look)';
      root.classList.remove('is-stamped'); void root.offsetWidth; root.classList.add('is-stamped');
      approve.disabled = true;
      status.textContent = honest
        ? 'Approved after viewing ' + viewed + ' of ' + files + (files === 1 ? ' file' : ' files') + '. A rare and beautiful thing.'
        : 'Approved in ' + secs.toFixed(1) + ' seconds with ' + viewed + ' of ' + files + (files === 1 ? ' file' : ' files') + ' viewed. Sam is thrilled.';
      undo.hidden = false;
    });

    undo.addEventListener('click', function () {
      stamped = false;
      root.classList.remove('is-stamped', 'is-honest');
      approve.disabled = false;
      status.textContent = '';
      undo.hidden = true;
      approve.focus();
      start();
    });

    // The clock starts when the review is actually on screen.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); }
      }, { threshold: 0.5 });
      io.observe(root);
    } else start();
  }

  window.initLgtmStamp = initLgtmStamp;
  function boot() { document.querySelectorAll('[data-mi="lgtm-stamp"]').forEach(initLgtmStamp); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
