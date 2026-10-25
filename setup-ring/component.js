/* Setup Ring — vanilla JS. Auto-initializes every [data-mi="setup-ring"].
   One ring segment per .su-task. Call window.initSetupRing(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var R = 32, C = 2 * Math.PI * R, GAP = 7; // ring radius, circumference, gap between segments (px)

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

  function initSetupRing(root) {
    if (!root || root.__miRing) return;
    root.__miRing = true;
    evenLines(root);
    var tasks = Array.prototype.slice.call(root.querySelectorAll('.su-task'));
    var segsBox = root.querySelector('.su-segs');
    var ring = root.querySelector('.su-ring');
    var pct = root.querySelector('.su-pct');
    var sub = root.querySelector('.su-sub');
    var list = root.querySelector('.su-list');
    var finish = root.querySelector('.su-finish');
    var n = tasks.length;
    var segLen = C / n - GAP;
    var done = 0;
    var shownPct = 0;

    // One arc per task, each with its own dash so it fills on its own.
    var segs = tasks.map(function (t, i) {
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('class', 'su-seg');
      c.setAttribute('cx', 40); c.setAttribute('cy', 40); c.setAttribute('r', R);
      c.setAttribute('transform', 'rotate(' + ((360 / n) * i + (GAP / C) * 180) + ' 40 40)');
      segsBox.appendChild(c);
      return c;
    });
    function fillSeg(i, on) {
      // the dash grows from nothing to the segment's length
      segs[i].style.strokeDasharray = (on ? segLen : 0.001) + ' ' + C;
      segs[i].style.strokeDashoffset = '0';
      segs[i].classList.toggle('is-on', on);
    }
    segs.forEach(function (s, i) { fillSeg(i, false); });

    function countTo(target) {
      var from = shownPct, t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / 500);
        shownPct = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
        pct.textContent = shownPct + '%';
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }

    function land(i) {
      fillSeg(i, true);
      ring.classList.remove('is-hit');
      void ring.offsetWidth;
      ring.classList.add('is-hit');
      countTo(Math.round((done / n) * 100));
      var left = n - done;
      sub.textContent = left ? left + (left === 1 ? ' step left' : ' steps left') : 'All set';
      if (!left) setTimeout(complete, 350);
    }

    function complete() {
      root.classList.add('is-done');
      setTimeout(function () {
        list.hidden = true;
        finish.hidden = false;
        finish.querySelector('.su-reset').focus({ preventScroll: true });
      }, reduce.matches ? 0 : 600);
    }

    function flyFrom(task, i) {
      var o = root.getBoundingClientRect();
      var a = task.querySelector('.su-check').getBoundingClientRect();
      var b = ring.getBoundingClientRect();
      // land on the middle of this task's segment
      var ang = ((360 / n) * (i + 0.5) - 90) * Math.PI / 180;
      var scale = b.width / 80;
      var x1 = b.left - o.left + (40 + Math.cos(ang) * R) * scale, y1 = b.top - o.top + (40 + Math.sin(ang) * R) * scale;
      var x0 = a.left - o.left + a.width / 2, y0 = a.top - o.top + a.height / 2;
      var dot = document.createElement('span');
      dot.className = 'su-dot';
      root.appendChild(dot);
      var frames = [];
      for (var k = 0; k <= 12; k++) {
        var t = k / 12;
        frames.push({ transform: 'translate(' + (x0 + (x1 - x0) * t).toFixed(1) + 'px,' + (y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 50).toFixed(1) + 'px) scale(' + (1 - t * 0.3).toFixed(2) + ')' });
      }
      dot.animate(frames, { duration: 560, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }).finished.then(function () { dot.remove(); land(i); });
    }

    tasks.forEach(function (task, i) {
      task.querySelector('.su-do').addEventListener('click', function () {
        if (task.classList.contains('is-done')) return;
        task.classList.add('is-done');
        done++;
        var next = tasks.filter(function (t) { return !t.classList.contains('is-done'); })[0];
        if (next) next.querySelector('.su-do').focus({ preventScroll: true });
        if (reduce.matches) land(i); else flyFrom(task, i);
      });
    });

    root.querySelector('.su-reset').addEventListener('click', function () {
      root.classList.remove('is-done');
      tasks.forEach(function (t, i) { t.classList.remove('is-done'); fillSeg(i, false); });
      done = 0;
      countTo(0);
      sub.textContent = n + (n === 1 ? ' step left' : ' steps left');
      finish.hidden = true;
      list.hidden = false;
      tasks[0].querySelector('.su-do').focus();
    });
  }

  window.initSetupRing = initSetupRing;
  function boot() { document.querySelectorAll('[data-mi="setup-ring"]').forEach(initSetupRing); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
