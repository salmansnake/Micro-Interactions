/* Sort Trace — vanilla JS. Auto-initializes every [data-mi="sort-trace"].
   Rows carry their sort values as data-* attributes. Call window.initSortTrace(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var NS = 'http://www.w3.org/2000/svg';
  var LABEL = { name: 'name', mrr: 'MRR', growth: 'growth' };

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

  function initSortTrace(root) {
    if (!root || root.__miSort) return;
    root.__miSort = true;
    evenLines(root);
    var body = root.querySelector('.st-body');
    var trails = root.querySelector('.st-trails');
    var heads = Array.prototype.slice.call(root.querySelectorAll('.st-sort'));
    var status = root.querySelector('.st-status');
    var clearTimer = 0;

    function rows() { return Array.prototype.slice.call(body.querySelectorAll('.st-row')); }

    function sortBy(key, dir, type) {
      var list = rows();
      var before = new Map(), index = new Map();
      list.forEach(function (r, i) { before.set(r, r.offsetTop + r.offsetHeight / 2); index.set(r, i); });
      list.sort(function (a, b) {
        var x = a.getAttribute('data-' + key), y = b.getAttribute('data-' + key);
        var c = type === 'num' ? Number(x) - Number(y) : x.localeCompare(y);
        return dir === 'ascending' ? c : -c;
      }).forEach(function (r) { body.appendChild(r); });

      trails.replaceChildren();
      clearTimeout(clearTimer);
      rows().forEach(function (r, i) {
        var from = before.get(r), to = r.offsetTop + r.offsetHeight / 2;
        var moved = index.get(r) - i; // positive = moved up
        var delta = r.querySelector('.st-delta');
        delta.classList.remove('is-on', 'up', 'down');
        r.classList.remove('is-moved');
        if (!moved) return;
        var dirCls = moved > 0 ? 'up' : 'down';
        delta.textContent = (moved > 0 ? '↑' : '↓') + Math.abs(moved);
        delta.classList.add(dirCls);
        void r.offsetWidth;
        r.classList.add('is-moved');
        setTimeout(function () { delta.classList.add('is-on'); }, reduce.matches ? 0 : 420);
        // A curved trail in the gutter from the old row position to the new one.
        var x = 10 + (Math.abs(moved) % 3) * 4;
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('class', dirCls);
        p.setAttribute('d', 'M14 ' + from + ' C' + (14 - x) + ' ' + from + ' ' + (14 - x) + ' ' + to + ' 14 ' + to);
        var dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('class', dirCls); dot.setAttribute('cx', 14); dot.setAttribute('cy', to); dot.setAttribute('r', 2.5);
        trails.append(p, dot);
        if (!reduce.matches) {
          var L = p.getTotalLength();
          p.style.strokeDasharray = L + ' ' + L;
          p.animate([{ strokeDashoffset: L, opacity: 0.9 }, { strokeDashoffset: 0, opacity: 0.9, offset: 0.35 }, { strokeDashoffset: 0, opacity: 0 }], { duration: 2600, easing: 'ease-out', fill: 'forwards' });
          dot.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { duration: 2600, fill: 'forwards' });
          // FLIP the row itself
          r.animate([{ transform: 'translateY(' + (from - to) + 'px)' }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.9,.25,1.05)' });
        }
      });
      clearTimer = setTimeout(function () {
        trails.replaceChildren();
        rows().forEach(function (r) { r.querySelector('.st-delta').classList.remove('is-on'); });
      }, 2800);
    }

    heads.forEach(function (h) {
      h.addEventListener('click', function () {
        var cur = h.getAttribute('aria-sort');
        var dir = cur === 'descending' ? 'ascending' : cur === 'ascending' ? 'descending' : (h.getAttribute('data-type') === 'num' ? 'descending' : 'ascending');
        heads.forEach(function (o) { o.setAttribute('aria-sort', o === h ? dir : 'none'); });
        var key = h.getAttribute('data-key');
        sortBy(key, dir, h.getAttribute('data-type'));
        status.textContent = 'Sorted by ' + LABEL[key] + ', ' + (h.getAttribute('data-type') === 'num' ? (dir === 'descending' ? 'highest first.' : 'lowest first.') : (dir === 'ascending' ? 'A to Z.' : 'Z to A.'));
      });
    });
  }

  window.initSortTrace = initSortTrace;
  function boot() { document.querySelectorAll('[data-mi="sort-trace"]').forEach(initSortTrace); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
