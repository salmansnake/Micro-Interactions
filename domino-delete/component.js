/* Domino Delete — vanilla JS. Auto-initializes every [data-mi="domino-delete"].
   Tap photos to pick them (they lift). Delete topples the picked ones left to right, 90ms apart, each falling over
   its bottom right edge into the next; then the rest slide together (measured before and after, then eased).
   A photo that stays rocks when the one falling into it lands. Undo stands them all back up. Call window.initDominoDelete(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var PHOTOS = [['IMG_2041', 'var(--aqua)', true], ['IMG_2042', 'var(--pink)', false], ['IMG_2043', 'var(--sage)', true], ['IMG_2044', 'var(--orange)', true], ['IMG_2045', 'var(--olive)', false], ['IMG_2046', 'var(--aqua)', true], ['IMG_2047', 'var(--pink)', false]];
  // Three little photos (hills, sea, mountains), each a sun (.s) over a far (.m) and a near (.f) layer, colored in CSS
  var SCENES = [
    '<circle class="s" cx="27" cy="17" r="6"/><path class="m" d="M0 40Q12 28 24 36T40 32V60H0Z"/><path class="f" d="M0 49Q16 39 40 47V60H0Z"/>',
    '<circle class="s" cx="20" cy="30" r="7"/><path class="m" d="M0 36H40V60H0Z"/><path class="f" d="M0 49Q10 45 20 49T40 49V60H0Z"/>',
    '<circle class="s" cx="12" cy="16" r="5"/><path class="m" d="M0 42L12 25L21 36L30 27L40 38V60H0Z"/><path class="f" d="M0 50L14 40L26 50L40 44V60H0Z"/>'
  ];
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

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
  // A button keeps one width whatever it says: as wide as its widest label (el is the label inside it)
  function keepWidth(btn, el, labels) {
    function size() {
      var keep = el.textContent, w = 0; btn.style.minWidth = '';
      labels.forEach(function (s) { el.textContent = s; w = Math.max(w, btn.getBoundingClientRect().width); });
      el.textContent = keep; btn.style.minWidth = Math.ceil(w) + 'px';
    }
    size();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  }

  function initDominoDelete(root) {
    if (!root || root.__miDmd) return;
    root.__miDmd = true;
    evenLines(root);
    var row = root.querySelector('.dmd-row'), del = root.querySelector('.dmd-del'), delLabel = del.querySelector('span');
    var undo = root.querySelector('.dmd-undo'), status = root.querySelector('.dmd-status'), last = [];

    PHOTOS.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dmd-tile' + (p[2] ? ' is-blurry' : ''); b.setAttribute('aria-pressed', p[2] ? 'true' : 'false');
      b.setAttribute('aria-label', p[0] + (p[2] ? ', blurry' : ''));
      b.style.setProperty('--dmd-k', p[1]);
      b.innerHTML = '<span class="dmd-pic"><svg viewBox="0 0 40 60" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + SCENES[i % 3] + '</svg></span><b></b><span class="dmd-check">' + CHECK + '</span>';
      b.querySelector('b').textContent = p[0].slice(-2);
      b.addEventListener('animationend', function () { b.classList.remove('is-knocked'); });
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); render(); });
      row.appendChild(b);
    });
    function picked() { return Array.prototype.filter.call(row.children, function (b) { return !b.classList.contains('is-gone') && b.getAttribute('aria-pressed') === 'true'; }); }
    function render() {
      var n = picked().length;
      del.disabled = !n; delLabel.textContent = n ? 'Delete ' + n : 'Delete';
    }
    // Slide the survivors into the gap: remember where they were, let them move, then ease from there
    function closeGap(before) {
      Array.prototype.forEach.call(row.children, function (b) {
        if (b.classList.contains('is-gone') || reduce.matches) return;
        var dx = before.get(b) - b.getBoundingClientRect().left;
        if (!dx) return;
        b.style.transition = 'none'; b.style.transform = 'translateX(' + dx + 'px)';
        void b.offsetWidth; b.style.transition = ''; b.style.transform = '';
      });
    }
    del.addEventListener('click', function () {
      var p = picked(); if (!p.length) return;
      del.disabled = true; last = p;
      p.forEach(function (b, i) {
        setTimeout(function () { b.classList.add('is-falling'); }, reduce.matches ? 0 : i * 90);
        // The photo it falls into, if that one stays, takes the hit as it lands
        var next = b.nextElementSibling;
        while (next && next.classList.contains('is-gone')) next = next.nextElementSibling;
        if (next && p.indexOf(next) < 0 && !reduce.matches) setTimeout(function () { next.classList.add('is-knocked'); }, i * 90 + 200);
      });
      setTimeout(function () {
        var before = new Map(); Array.prototype.forEach.call(row.children, function (b) { before.set(b, b.getBoundingClientRect().left); });
        p.forEach(function (b) { b.classList.add('is-gone'); b.classList.remove('is-falling'); b.setAttribute('aria-pressed', 'false'); });
        closeGap(before);
        undo.hidden = false;
        status.textContent = 'Toppled ' + p.length + (p.length === 1 ? ' photo' : ' photos') + '.';
        render(); undo.focus({ preventScroll: true });
      }, reduce.matches ? 140 : p.length * 90 + 440);
    });
    undo.addEventListener('click', function () {
      var before = new Map(); Array.prototype.forEach.call(row.children, function (b) { before.set(b, b.getBoundingClientRect().left); });
      last.forEach(function (b) { b.classList.remove('is-gone'); b.setAttribute('aria-pressed', 'true'); });
      closeGap(before);
      undo.hidden = true; status.textContent = 'Stood them all back up.'; render(); del.focus({ preventScroll: true });
    });
    render();
    keepWidth(del, delLabel, ['Delete', 'Delete 7']);
  }

  window.initDominoDelete = initDominoDelete;
  function boot() { document.querySelectorAll('[data-mi="domino-delete"]').forEach(initDominoDelete); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
