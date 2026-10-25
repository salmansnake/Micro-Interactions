/* Dizzy Refresh — vanilla JS. Auto-initializes every [data-mi="dizzy-refresh"].
   Drag the list down past 60px (or press the refresh button). Refreshes inside 20 seconds stack up: at 3 the
   spinner gets woozy, at 5 it's dizzy and offers to notify you instead. Replace load() with your fetch.
   Call window.initDizzyRefresh(el) for elements added later. */
(function () {
  'use strict';
  var THRESHOLD = 60, WINDOW = 20000;

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

  function initDizzyRefresh(root) {
    if (!root || root.__miDizzy) return;
    root.__miDizzy = true;
    evenLines(root);
    var vp = root.querySelector('.dz-viewport'), spinner = root.querySelector('.dz-spinner');
    var btn = root.querySelector('.dz-refresh'), status = root.querySelector('.dz-status');
    var notify = root.querySelector('.dz-notify'), sw = root.querySelector('.dz-switch');
    var lastTime = root.getAttribute('data-last') || 'a while ago';
    var startY = null, pull = 0, loading = false, times = [], calm = 0;

    function setPull(px) {
      pull = px;
      root.style.setProperty('--dz-pull', px.toFixed(1));
      // The arc draws itself as you pull; at the threshold it is three quarters round.
      spinner.style.setProperty('--dz-arc', (Math.min(1, px / THRESHOLD) * 75).toFixed(1));
    }

    function load(done) { setTimeout(done, 900); }

    function refresh() {
      if (loading) return;
      loading = true;
      var now = Date.now();
      times = times.filter(function (t) { return now - t < WINDOW; });
      times.push(now);
      var n = times.length;
      root.classList.toggle('is-woozy', n >= 3);
      root.classList.add('is-loading');
      setPull(THRESHOLD);
      clearTimeout(calm);
      load(function () {
        loading = false;
        root.classList.remove('is-loading');
        root.classList.toggle('is-dizzy', n >= 5);
        if (n >= 5) {
          status.textContent = 'Nothing new since ' + lastTime + '. I’ll tell you when there is. Please stop.';
          notify.hidden = false;
          setTimeout(function () { setPull(0); }, 1800);
        } else {
          status.textContent = n === 1 ? 'Nothing new. Last message arrived at ' + lastTime + '.'
            : n === 2 ? 'Still nothing new since ' + lastTime + '.'
            : n === 3 ? 'Nothing. The spinner is getting woozy.'
            : 'Nothing. Again. The spinner needs a minute.';
          setPull(0);
        }
        calm = setTimeout(function () { root.classList.remove('is-woozy', 'is-dizzy'); times = []; }, 8000);
      });
    }

    vp.addEventListener('pointerdown', function (e) {
      if (loading || e.button !== 0) return;
      startY = e.clientY;
      vp.setPointerCapture && vp.setPointerCapture(e.pointerId);
      root.classList.add('is-dragging');
    });
    vp.addEventListener('pointermove', function (e) {
      if (startY == null) return;
      var dy = Math.max(0, e.clientY - startY);
      setPull(Math.min(110, dy * 0.55)); // rubber-band resistance
    });
    function end() {
      if (startY == null) return;
      startY = null;
      root.classList.remove('is-dragging');
      if (pull >= THRESHOLD) refresh(); else setPull(0);
    }
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    btn.addEventListener('click', refresh);
    sw.addEventListener('change', function () {
      status.textContent = sw.checked ? 'Okay. You’ll get a notification. You can stop pulling now.' : 'Notifications off. Pull away.';
      if (sw.checked) { root.classList.remove('is-dizzy', 'is-woozy'); times = []; }
    });
    setPull(0);
  }

  window.initDizzyRefresh = initDizzyRefresh;
  function boot() { document.querySelectorAll('[data-mi="dizzy-refresh"]').forEach(initDizzyRefresh); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
