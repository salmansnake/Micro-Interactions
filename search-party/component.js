/* 404 Search Party — vanilla JS. Auto-initializes every [data-mi="search-party"].
   Three cursors sweep the dark room on their own looping paths, each with a flashlight (a hole in the night layer's
   mask); your pointer carries a fourth. After 5 seconds one of them walks to the clue (data-typo) and the page
   suggests the address it meant (data-fix). Call window.initSearchParty(el) for elements added later. */
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

  function initSearchParty(root) {
    if (!root || root.__miSpy) return;
    root.__miSpy = true;
    evenLines(root);
    var dark = root.querySelector('.spy-dark'), find = root.querySelector('.spy-find'), cursors = root.querySelectorAll('.spy-cursor');
    var found = root.querySelector('.spy-found'), msg = root.querySelector('.spy-msg'), status = root.querySelector('.spy-status');
    var typo = root.getAttribute('data-typo') || '/pricng', fix = root.getAttribute('data-fix') || '/pricing';
    var t0 = performance.now(), raf = 0, done = false, walk = null;
    find.textContent = typo;
    // Each searcher loops a different figure-eight across the room
    var PATHS = [[0.28, 0.32, 0.9, 1.3, 0], [0.32, 0.3, 1.2, 0.8, 2], [0.36, 0.34, 0.7, 1.1, 4]];

    function frame(now) {
      if (!root.isConnected) return;
      var W = dark.clientWidth, H = dark.clientHeight, t = (now - t0) / 1000;
      cursors.forEach(function (c, i) {
        var p = PATHS[i], x, y;
        if (walk && i === 0) {
          var k = Math.min(1, (now - walk.t) / 1200), e = k * k * (3 - 2 * k);
          x = walk.x + (walk.tx - walk.x) * e; y = walk.y + (walk.ty - walk.y) * e;
          if (k === 1 && !done) reveal();
        } else {
          x = W * (0.5 + p[0] * Math.sin(t * p[2] + p[4])); y = H * (0.5 + p[1] * Math.sin(t * p[3] * 2 + p[4]));
        }
        c.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
        dark.style.setProperty('--x' + i, (x + 4).toFixed(1) + 'px'); dark.style.setProperty('--y' + i, (y + 4).toFixed(1) + 'px');
        c.__x = x; c.__y = y;
      });
      if (!walk && t > 5) {
        var fr = find.getBoundingClientRect(), dr = dark.getBoundingClientRect();
        walk = { t: now, x: cursors[0].__x, y: cursors[0].__y, tx: fr.left - dr.left + fr.width / 2, ty: fr.top - dr.top + fr.height + 2 };
        status.textContent = 'Wait, something over here…';
      }
      raf = requestAnimationFrame(frame);
    }
    function reveal() {
      done = true; root.classList.add('is-found');
      msg.innerHTML = 'Found it. You typed <code></code>. You probably meant <code></code>.';
      var codes = msg.querySelectorAll('code'); codes[0].textContent = typo; codes[1].textContent = fix;
      found.hidden = false; status.textContent = '';
    }

    dark.addEventListener('pointermove', function (e) {
      var r = dark.getBoundingClientRect();
      dark.style.setProperty('--xp', (e.clientX - r.left) + 'px'); dark.style.setProperty('--yp', (e.clientY - r.top) + 'px');
    });
    dark.addEventListener('pointerleave', function () { dark.style.setProperty('--xp', '-99px'); dark.style.setProperty('--yp', '-99px'); });
    root.querySelectorAll('.spy-links a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); status.textContent = 'In a real app this would take you to ' + (a.textContent.indexOf('Pricing') >= 0 ? fix : '/') + '.'; }); });

    if (reduce.matches) { var W = dark.clientWidth, H = dark.clientHeight; [[0.25, 0.3], [0.7, 0.35], [0.5, 0.75]].forEach(function (p, i) { dark.style.setProperty('--x' + i, p[0] * W + 'px'); dark.style.setProperty('--y' + i, p[1] * H + 'px'); cursors[i].style.transform = 'translate(' + p[0] * W + 'px, ' + p[1] * H + 'px)'; }); reveal(); return; }
    raf = requestAnimationFrame(frame);
  }

  window.initSearchParty = initSearchParty;
  function boot() { document.querySelectorAll('[data-mi="search-party"]').forEach(initSearchParty); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
