/* Access Ladder — vanilla JS. Auto-initializes every [data-mi="access-ladder"].
   Rungs are [data-level] buttons from most private (0) up. Call window.initAccessLadder(el) for later elements. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var COUNTS = [1, 4, 49, Infinity];
  var PALETTE = ['var(--chart-2)', 'var(--success-text)', 'var(--warning-text)', 'var(--chart-6)', 'var(--chart-1)', 'var(--chart-7)', 'var(--chart-5)'];
  var GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/></svg>';

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

  function initAccessLadder(root) {
    if (!root || root.__miLadder) return;
    root.__miLadder = true;
    evenLines(root);
    var rungs = Array.prototype.slice.call(root.querySelectorAll('.al-rung'));
    var crowd = root.querySelector('.al-crowd');
    var reach = root.querySelector('.al-reach');
    var warn = root.querySelector('.al-warn');
    var copy = root.querySelector('.al-copy');
    var COPIED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Copied';
    // As wide as its "Copied" state from the start, so confirming never resizes it
    (function () { var keep = copy.innerHTML; copy.innerHTML = COPIED; var w = parseFloat(getComputedStyle(copy).width); copy.innerHTML = keep; if (w) copy.style.minWidth = Math.ceil(w) + 'px'; })();
    var link = root.querySelector('.al-link');
    var level = -1;
    var gen = 0;

    // Few people: one row beside You, centered vertically (You spans 2 columns and 2 rows)
    function fit(n) {
      var cols = Math.floor((crowd.clientWidth - 24 + 4) / 18);
      crowd.classList.toggle('is-few', n > 1 && n - 1 <= cols - 2);
    }
    if (window.ResizeObserver) new ResizeObserver(function () { fit(crowd.querySelectorAll('.al-p:not(.is-out)').length); }).observe(crowd);

    function people(n) {
      var have = crowd.querySelectorAll('.al-p:not(.is-out)');
      var g = crowd.querySelector('.al-globe');
      if (g) g.remove();
      if (n === Infinity) {
        crowd.querySelectorAll('.al-p').forEach(function (p) { p.remove(); });
        var gl = document.createElement('span'); gl.className = 'al-globe'; gl.innerHTML = GLOBE; crowd.appendChild(gl);
        return;
      }
      if (!have.length) {
        var you = document.createElement('span'); you.className = 'al-p is-you'; you.textContent = 'You'; you.style.setProperty('--c', 'var(--chart-1)');
        crowd.appendChild(you);
        have = [you];
      }
      var cur = have.length;
      for (var i = cur; i < n; i++) {
        var p = document.createElement('span'); p.className = 'al-p';
        p.style.setProperty('--c', PALETTE[i % PALETTE.length]);
        p.style.animationDelay = Math.min((i - cur) * 12, 400) + 'ms';
        crowd.appendChild(p);
      }
      gen++;
      if (n >= cur) { fit(n); return; }
      // Leaving: the last dots shrink away first, mirroring how they arrived. Their cells are held until
      // the last one is gone, then the ones that stay glide to their new spots instead of jumping.
      var quick = reduce.matches;
      var wait = quick ? 0 : 260 + Math.min((cur - 1 - n) * 6, 200) + 30;
      for (var j = cur - 1; j >= n; j--) {
        var el = have[j];
        el.style.animationDelay = Math.min((cur - 1 - j) * 6, 200) + 'ms';
        el.classList.add('is-out');
      }
      var mine = gen;
      function settle() {
        if (mine !== gen) return;
        crowd.querySelectorAll('.al-p.is-out').forEach(function (o) { o.remove(); });
        var keep = Array.prototype.slice.call(crowd.querySelectorAll('.al-p'));
        var first = keep.map(function (k) { return k.getBoundingClientRect(); });
        fit(n);
        if (quick) return;
        keep.forEach(function (k, i) {
          var r = k.getBoundingClientRect();
          var dx = first[i].left - r.left, dy = first[i].top - r.top;
          if (dx || dy) k.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
        });
      }
      if (quick) settle(); else setTimeout(settle, wait);
    }

    function set(l, focus) {
      if (l === level) return;
      level = l;
      root.setAttribute('data-level', l);
      root.style.setProperty('--al-level', l);
      rungs.forEach(function (r) {
        var rl = Number(r.getAttribute('data-level'));
        r.setAttribute('aria-checked', rl === l ? 'true' : 'false');
        r.tabIndex = rl === l ? 0 : -1;
        r.classList.toggle('is-reached', rl <= l);
      });
      people(COUNTS[l]);
      var b = document.createElement('b');
      b.textContent = COUNTS[l] === Infinity ? 'Anyone' : COUNTS[l] === 1 ? 'Only you' : COUNTS[l] + ' people';
      reach.replaceChildren(b, document.createTextNode(COUNTS[l] === Infinity ? ' with the link can open it.' : COUNTS[l] === 1 ? ' can open it.' : ' can open it.'));
      warn.hidden = l !== 3;
      copy.disabled = l === 0;
      link.style.opacity = l === 0 ? 0.4 : 1;
      if (focus) rungs.filter(function (r) { return Number(r.getAttribute('data-level')) === l; })[0].focus();
    }

    rungs.forEach(function (r) {
      r.addEventListener('click', function () { set(Number(r.getAttribute('data-level'))); });
      r.addEventListener('keydown', function (e) {
        var d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
        if (d == null) return;
        e.preventDefault();
        set(Math.max(0, Math.min(rungs.length - 1, level + d)), true);
      });
    });
    copy.addEventListener('click', function () {
      try { navigator.clipboard.writeText('https://' + link.textContent).catch(function () {}); } catch (e) {}
      copy.innerHTML = COPIED; copy.classList.add('is-done');
      setTimeout(function () { copy.textContent = 'Copy Link'; copy.classList.remove('is-done'); }, 1400);
    });
    set(Number((root.querySelector('[aria-checked="true"]') || rungs[0]).getAttribute('data-level')));
  }

  window.initAccessLadder = initAccessLadder;
  function boot() { document.querySelectorAll('[data-mi="access-ladder"]').forEach(initAccessLadder); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
