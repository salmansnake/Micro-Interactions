/* Overtime Fuse — vanilla JS. Auto-initializes every [data-mi="overtime-fuse"].
   The range is a pretend clock in minutes since the start; in a real call, call root.setMinutes(n) every second.
   The fuse is data-fuse minutes long. Call window.initOvertimeFuse(el) for elements added later. */
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

  function initOvertimeFuse(root) {
    if (!root || root.__miFuse) return;
    root.__miFuse = true;
    evenLines(root);
    var length = Number(root.getAttribute('data-length')) || 30;
    var people = Number(root.getAttribute('data-people')) || 6;
    var fuse = Number(root.getAttribute('data-fuse')) || 15;
    var clock = root.querySelector('.of-clock'), line = root.querySelector('.of-line');
    var range = root.querySelector('.of-range'), end = root.querySelector('.of-end');
    var ended = false;

    function mmss(min) { var s = Math.round(min * 60); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function mins(n) { n = Math.round(n); return n + (n === 1 ? ' minute' : ' minutes'); }

    function setMinutes(m) {
      if (ended) return;
      var over = m - length;
      clock.textContent = mmss(m);
      root.style.setProperty('--of-p', Math.min(1, m / length).toFixed(4));
      root.classList.toggle('is-over', over > 0);
      root.classList.toggle('is-late', over >= 5);
      if (over <= 0) {
        var left = -over;
        line.textContent = left < 1 ? 'On time. Less than a minute left.' : 'On time. ' + mins(left) + ' left.';
        return;
      }
      var left2 = Math.max(0, 1 - over / fuse);
      root.style.setProperty('--of-left', left2.toFixed(4));
      root.style.setProperty('--of-heat', (1 + (1 - left2) * 0.7).toFixed(2));
      if (left2 === 0) line.textContent = mins(over) + ' over. The fuse is out. Everyone is still here, physically.';
      else line.textContent = mins(over) + ' over · ' + people + (people === 1 ? ' person · ' : ' people · ') + Math.round(over * people) + ' person-minutes';
    }

    range.addEventListener('input', function () { setMinutes(Number(range.value)); });
    end.addEventListener('click', function () {
      var over = Number(range.value) - length;
      ended = true;
      root.classList.remove('is-over', 'is-late');
      line.textContent = over > 0 ? 'Meeting ended. ' + people + (people === 1 ? ' person just got their' : ' people just got their') + ' afternoon back.' : 'Meeting ended early. A legend.';
      end.textContent = 'Ended';
      end.disabled = true;
    });
    root.setMinutes = setMinutes;
    setMinutes(Number(range.value));
  }

  window.initOvertimeFuse = initOvertimeFuse;
  function boot() { document.querySelectorAll('[data-mi="overtime-fuse"]').forEach(initOvertimeFuse); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
