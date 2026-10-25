/* Lasso Select — vanilla JS. Auto-initializes every [data-mi="lasso-select"].
   Items are [role="option"] inside .ls-grid. Call window.initLassoSelect(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Lucide arrow-right, arrow-down-to-line and check
  var ICONS = {
    move: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    download: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
    done: '<path d="M20 6 9 17l-5-5"/>'
  };
  function svg(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }

  // Ray-casting point-in-polygon test.
  function inside(x, y, pts) {
    var hit = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }

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

  function initLassoSelect(root) {
    if (!root || root.__miLasso) return;
    root.__miLasso = true;
    evenLines(root);
    var area = root.querySelector('.ls-area');
    var items = Array.prototype.slice.call(root.querySelectorAll('[role="option"]'));
    var path = root.querySelector('.ls-path');
    var count = root.querySelector('.ls-count');
    var bar = root.querySelector('.ls-bar');
    var barText = root.querySelector('.ls-bar-text');
    var barLabel = root.querySelector('.ls-bar-label');
    var barIcon = root.querySelector('.ls-bar-icon');
    var acts = root.querySelectorAll('.ls-act');
    var run = 0, busy = false;
    var pts = [], drawing = false, base = [], lastHot = -1, raf = 0;

    function isSel(el) { return el.getAttribute('aria-selected') === 'true'; }
    function setSel(el, on) { el.setAttribute('aria-selected', on ? 'true' : 'false'); }
    function selectedCount() { return items.filter(isSel).length; }
    // Any change to the selection cancels a Move or Download in progress
    function stop() {
      clearTimeout(run); run = 0; busy = false;
      root.classList.remove('is-busy', 'is-moving', 'is-downloading', 'is-done');
      barIcon.innerHTML = '';
      barText.style.minWidth = '';
      items.forEach(function (el) { el.classList.remove('is-carried'); });
      Array.prototype.forEach.call(acts, function (b) { b.removeAttribute('aria-disabled'); });
    }
    function updateBar() {
      stop();
      var n = selectedCount();
      bar.hidden = n === 0;
      barLabel.textContent = n + ' Selected';
    }
    function local(e) { var r = area.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function centers() {
      var r = area.getBoundingClientRect();
      return items.map(function (el) { var b = el.getBoundingClientRect(); return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2]; });
    }

    var cs = [];
    function frame() {
      raf = 0;
      if (pts.length < 2) return;
      path.setAttribute('d', 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z');
      var hot = 0;
      items.forEach(function (el, i) {
        var inLoop = pts.length > 2 && inside(cs[i][0], cs[i][1], pts);
        el.classList.toggle('is-hot', inLoop);
        if (inLoop) hot++;
      });
      var total = hot + base.filter(function (el) { return !el.classList.contains('is-hot'); }).length;
      var last = pts[pts.length - 1];
      count.style.setProperty('--x', last[0] + 'px');
      count.style.setProperty('--y', last[1] + 'px');
      count.textContent = String(total);
      count.classList.toggle('is-on', total > 0);
      if (total !== lastHot) { count.classList.remove('is-bump'); void count.offsetWidth; count.classList.add('is-bump'); lastHot = total; }
    }

    area.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drawing = true;
      try { area.setPointerCapture(e.pointerId); } catch (err) {}
      base = e.shiftKey || e.metaKey ? items.filter(isSel) : [];
      if (!e.shiftKey && !e.metaKey) items.forEach(function (el) { setSel(el, false); });
      cs = centers();
      pts = [local(e)];
      lastHot = -1;
      path.classList.remove('is-closing');
      updateBar();
    });
    area.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      var p = local(e), q = pts[pts.length - 1];
      if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 4) return;
      pts.push(p);
      if (!raf) raf = requestAnimationFrame(frame);
    });
    function end() {
      if (!drawing) return;
      drawing = false;
      if (pts.length < 3) {
        // A click, not a loop: select or clear what's under the pointer.
        var el = document.elementFromPoint(area.getBoundingClientRect().left + pts[0][0], area.getBoundingClientRect().top + pts[0][1]);
        var item = el && el.closest('[role="option"]');
        if (item) { setSel(item, true); item.focus({ preventScroll: true }); }
      } else {
        items.forEach(function (el) { if (el.classList.contains('is-hot')) setSel(el, true); el.classList.remove('is-hot'); });
      }
      path.classList.add('is-closing');
      count.classList.remove('is-on');
      pts = [];
      updateBar();
    }
    area.addEventListener('pointerup', end);
    area.addEventListener('pointercancel', end);

    // Keyboard: arrows move, Space toggles, ⌘A / Ctrl+A selects all, Escape clears.
    area.addEventListener('keydown', function (e) {
      var i = items.indexOf(document.activeElement);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); items.forEach(function (el) { setSel(el, true); }); updateBar(); return; }
      if (e.key === 'Escape') { items.forEach(function (el) { setSel(el, false); }); updateBar(); return; }
      if (i < 0) return;
      var cols = Math.max(1, Math.round(area.querySelector('.ls-grid').clientWidth / items[0].offsetWidth));
      var move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
      if (move) {
        e.preventDefault();
        var n = Math.max(0, Math.min(items.length - 1, i + move));
        items[i].tabIndex = -1; items[n].tabIndex = 0; items[n].focus();
        if (e.shiftKey) setSel(items[n], true), updateBar();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setSel(items[i], !isSel(items[i]));
        updateBar();
      }
    });
    root.querySelector('.ls-clear').addEventListener('click', function () {
      items.forEach(function (el) { setSel(el, false); });
      updateBar();
      area.querySelector('[tabindex="0"]').focus();
    });
    // Move and Download play a small, quiet scene: the files hop (or dip) while a line fills under "Moving 2 files",
    // then a check and "Moved 2 files". The selection clears a moment later.
    Array.prototype.forEach.call(acts, function (b) {
      b.addEventListener('click', function () {
        if (busy) return;
        var move = b.getAttribute('data-act') === 'move';
        var n = selectedCount(), files = n + (n === 1 ? ' file' : ' files'), k = 0;
        stop();
        busy = true;
        barLabel.textContent = (move ? 'Moving ' : 'Downloading ') + files;
        barIcon.innerHTML = svg(move ? ICONS.move : ICONS.download);
        barText.style.minWidth = barText.getBoundingClientRect().width + 'px'; // the shorter past tense doesn't shrink the bar
        root.classList.add('is-busy', move ? 'is-moving' : 'is-downloading');
        Array.prototype.forEach.call(acts, function (a) { a.setAttribute('aria-disabled', 'true'); });
        items.forEach(function (el) { if (isSel(el)) { el.style.setProperty('--ls-i', k++); el.classList.add('is-carried'); } });
        run = setTimeout(function () {
          root.classList.remove('is-moving', 'is-downloading');
          root.classList.add('is-done');
          items.forEach(function (el) { el.classList.remove('is-carried'); });
          barIcon.innerHTML = svg(ICONS.done);
          barLabel.textContent = (move ? 'Moved ' : 'Downloaded ') + files;
          run = setTimeout(function () {
            var had = bar.contains(document.activeElement);
            items.forEach(function (el) { setSel(el, false); });
            updateBar();
            if (had) area.querySelector('[tabindex="0"]').focus();
          }, 1600);
        }, reduce.matches ? 400 : 1100);
      });
    });
  }

  window.initLassoSelect = initLassoSelect;
  function boot() { document.querySelectorAll('[data-mi="lasso-select"]').forEach(initLassoSelect); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
