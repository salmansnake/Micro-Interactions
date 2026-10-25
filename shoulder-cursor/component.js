/* Over-the-Shoulder Cursor — vanilla JS. Auto-initializes every [data-mi="shoulder-cursor"].
   The demo drives a teammate's cursor with a small script: it wanders, then settles on your paragraph. After 2.5s
   it puts on glasses; after 5s it leans in. Typing startles it away. In a real app, feed it live cursor positions.
   Call window.initShoulderCursor(el) for elements added later. */
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

  function initShoulderCursor(root) {
    if (!root || root.__miShoulder) return;
    root.__miShoulder = true;
    evenLines(root);
    var name = root.getAttribute('data-name') || 'They';
    var doc = root.querySelector('.oc-doc'), edit = root.querySelector('.oc-edit'), other = root.querySelector('.oc-other');
    var cur = root.querySelector('.oc-cursor'), status = root.querySelector('.oc-status');
    var pos = { x: 0, y: 0 }, target = { x: 0, y: 0 }, speed = 0.06, scale = 1, targetScale = 1;
    var phase = 'idle', since = 0, shown = 0, raf = 0, timers = [], running = false;

    function set(x, y, sp) { target.x = x; target.y = y; speed = sp || 0.06; }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearAll() { timers.forEach(clearTimeout); timers = []; }
    function box(el) { var d = doc.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - d.left, y: r.top - d.top, w: r.width, h: r.height }; }

    function frame(now) {
      pos.x += (target.x - pos.x) * speed;
      pos.y += (target.y - pos.y) * speed;
      scale += (targetScale - scale) * 0.08;
      cur.style.setProperty('--x', pos.x.toFixed(1) + 'px');
      cur.style.setProperty('--y', pos.y.toFixed(1) + 'px');
      cur.style.setProperty('--s', scale.toFixed(3));
      if (phase === 'reading') {
        var secs = (now - since) / 1000;
        if (secs > 2.5 && !root.classList.contains('is-reading')) { root.classList.add('is-reading'); status.textContent = name + ' is reading over your shoulder.'; }
        if (secs > 5) {
          root.classList.add('is-squinting');
          targetScale = 1.18;
          var whole = Math.floor(secs);
          if (whole !== shown && whole % 2 === 0) { shown = whole; status.textContent = name + ' has been reading this sentence for ' + whole + ' seconds.'; } // never 1: even seconds only
          // Creep along the line, word by word.
          var b = box(edit);
          target.x = Math.min(b.x + b.w - 40, target.x + 0.12);
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function wander() {
      clearAll();
      phase = 'wander';
      root.classList.remove('is-reading', 'is-squinting', 'is-startled');
      targetScale = 1;
      var d = doc.getBoundingClientRect(), o = box(other), e = box(edit);
      set(o.x + o.w * 0.6, o.y + 6, 0.05);
      status.textContent = name + ' is in this document.';
      later(function () { set(d.width * 0.75, 18, 0.05); }, 1200);
      later(function () {
        set(e.x + e.w * 0.32, e.y + 14, 0.045);
        later(function () { phase = 'reading'; since = performance.now(); }, 900);
      }, 2400);
    }

    function startle() {
      if (phase !== 'reading' && phase !== 'wander') return;
      clearAll();
      phase = 'startled';
      root.classList.add('is-startled');
      root.classList.remove('is-squinting');
      targetScale = 1;
      var d = doc.getBoundingClientRect();
      set(d.width - 60, d.height - 40, reduce.matches ? 1 : 0.22);
      status.textContent = name + ' suddenly remembered something else.';
      later(wander, 4200);
    }

    edit.addEventListener('input', startle);
    edit.addEventListener('keydown', function (e) { if (e.key.length === 1) startle(); });

    function start() {
      if (running) return;
      running = true;
      var d = doc.getBoundingClientRect();
      pos.x = target.x = d.width - 50; pos.y = target.y = d.height - 30;
      raf = requestAnimationFrame(frame);
      wander();
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en.some(function (x) { return x.isIntersecting; })) { io.disconnect(); start(); }
      }, { threshold: 0.4 });
      io.observe(root);
    } else start();
  }

  window.initShoulderCursor = initShoulderCursor;
  function boot() { document.querySelectorAll('[data-mi="shoulder-cursor"]').forEach(initShoulderCursor); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
