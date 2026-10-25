/* Elastic Range — vanilla JS. Auto-initializes every [data-mi="elastic-range"].
   data-year, data-month (0-based), data-booked (days), data-rate (per night). Call window.initElasticRange(el) for later elements. */
(function () {
  'use strict';
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  function initElasticRange(root) {
    if (!root || root.__miRange) return;
    root.__miRange = true;
    evenLines(root);
    var year = Number(root.getAttribute('data-year')) || new Date().getFullYear();
    var month = root.hasAttribute('data-month') ? Number(root.getAttribute('data-month')) : new Date().getMonth();
    var booked = (root.getAttribute('data-booked') || '').split(',').filter(Boolean).map(Number);
    var rate = Number(root.getAttribute('data-rate')) || 0;
    var grid = root.querySelector('.er-grid');
    var bandsBox = root.querySelector('.er-bands');
    var bubble = root.querySelector('.er-bubble');
    var summary = root.querySelector('.er-summary');
    var clear = root.querySelector('.er-clear');
    var mon = MONTHS[month].slice(0, 3);

    var first = new Date(year, month, 1).getDay();
    var days = new Date(year, month + 1, 0).getDate();
    var cells = [];
    for (var b = 0; b < first; b++) grid.insertBefore(document.createElement('span'), bubble);
    for (var d = 1; d <= days; d++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'er-day';
      btn.textContent = d;
      btn.setAttribute('data-day', d);
      var isBooked = booked.indexOf(d) > -1;
      if (isBooked) btn.classList.add('is-booked');
      btn.setAttribute('aria-label', MONTHS[month] + ' ' + d + (isBooked ? ', booked' : ''));
      btn.tabIndex = d === 1 ? 0 : -1;
      grid.insertBefore(btn, bubble);
      cells[d] = btn;
    }
    var rows = Math.ceil((first + days) / 7);
    var bands = [];
    for (var r = 0; r < rows; r++) { var band = document.createElement('span'); band.className = 'er-band'; bandsBox.appendChild(band); bands.push(band); }
    var capA = document.createElement('span'); capA.className = 'er-cap';
    var capB = document.createElement('span'); capB.className = 'er-cap';
    bandsBox.append(capA, capB);

    var start = null, end = null, picking = false;

    function pos(day) { var c = cells[day]; return { x: c.offsetLeft, y: c.offsetTop, w: c.offsetWidth, h: c.offsetHeight }; }
    function rowOf(day) { return Math.floor((first + day - 1) / 7); }
    function firstBookedAfter(a) { var hit = null; booked.forEach(function (bd) { if (bd > a && (hit === null || bd < hit)) hit = bd; }); return hit; }

    function placeCap(cap, day) {
      if (!day) { cap.classList.remove('is-on'); return; }
      var p = pos(day);
      cap.style.left = p.x + (p.w - p.h) / 2 + 'px';
      cap.style.top = p.y + 'px';
      cap.classList.add('is-on');
    }

    function draw(a, z, strained) {
      Object.keys(cells).forEach(function (k) { cells[k].classList.remove('is-end', 'is-blocked'); });
      placeCap(capA, a);
      placeCap(capB, z && z !== a ? z : null);
      if (a) cells[a].classList.add('is-end');
      if (z) cells[z].classList.add('is-end');
      bands.forEach(function (band, r) {
        if (!a || !z || z === a) { band.classList.remove('is-on'); return; }
        var lo = Math.max(a, 1 + r * 7 - first), hi = Math.min(z, 7 * (r + 1) - first);
        if (lo > hi) {
          band.classList.remove('is-on');
          var anchor = pos(r < rowOf(a) ? a : z);
          band.style.left = anchor.x + 'px'; band.style.width = '0px'; band.style.top = anchor.y + 'px';
          return;
        }
        var p1 = pos(lo), p2 = pos(hi);
        band.style.top = p1.y + 'px';
        band.style.left = (lo === a ? p1.x + (p1.w - p1.h) / 2 : p1.x) + 'px';
        band.style.width = ((hi === z ? p2.x + (p2.w + p2.h) / 2 : p2.x + p2.w) - (lo === a ? p1.x + (p1.w - p1.h) / 2 : p1.x)) + 'px';
        band.classList.add('is-on');
      });
      if (a && z && z > a) {
        var nights = z - a;
        var p = pos(z);
        bubble.textContent = nights + (nights === 1 ? ' night' : ' nights') + (rate ? ' · $' + (nights * rate).toLocaleString('en-US') : '');
        bubble.style.left = p.x + p.w / 2 + 'px';
        bubble.style.top = p.y - 4 + 'px';
        bubble.classList.add('is-on');
      } else bubble.classList.remove('is-on');
      if (strained) {
        cells[strained].classList.add('is-blocked');
        capB.classList.remove('is-strain'); void capB.offsetWidth; capB.classList.add('is-strain');
      }
    }

    // While picking, the band follows the pointer but can't cross a booked night.
    function preview(day) {
      if (!picking || !start) return;
      if (day <= start) { draw(start, null); return; }
      var wall = firstBookedAfter(start);
      if (wall !== null && day >= wall) {
        draw(start, Math.max(start + 0, wall - 1) === start ? null : wall - 1, wall);
        summary.replaceChildren(Object.assign(document.createElement('span'), { className: 'er-warn', textContent: mon + ' ' + wall + ' is booked,' }), Object.assign(document.createElement('span'), { className: 'er-warn er-line', textContent: 'so your stay ends ' + mon + ' ' + (wall - 1) + '.' }));
        return;
      }
      draw(start, day);
      summarize(start, day, true);
    }

    function summarize(a, z, tentative) {
      summary.replaceChildren();
      if (!a) { summary.append('Choose a ', Object.assign(document.createElement('span'), { className: 'er-nowrap', textContent: 'check-in' }), ' date.'); return; }
      if (!z) {
        var next = Object.assign(document.createElement('span'), { className: 'er-line', textContent: 'Now choose ' });
        next.append(Object.assign(document.createElement('span'), { className: 'er-nowrap', textContent: 'check-out.' }));
        summary.append('Check-in ', Object.assign(document.createElement('b'), { textContent: mon + ' ' + a }), '.', next);
        return;
      }
      var nights = z - a;
      summary.append(Object.assign(document.createElement('b'), { textContent: mon + ' ' + a + ' – ' + mon + ' ' + z }), Object.assign(document.createElement('span'), { className: 'er-cost', textContent: nights + (nights === 1 ? ' night' : ' nights') + (rate ? ' · $' + (nights * rate).toLocaleString('en-US') + ' total' : '') + (tentative ? '' : '.') }));
    }

    function choose(day) {
      if (booked.indexOf(day) > -1) return;
      if (!picking || !start || day <= start) {
        start = day; end = null; picking = true;
        draw(start, null);
        summarize(start, null);
        clear.hidden = false;
        return;
      }
      var wall = firstBookedAfter(start);
      end = wall !== null && day >= wall ? wall - 1 : day;
      if (end <= start) { start = day; end = null; draw(start, null); summarize(start, null); return; }
      picking = false;
      draw(start, end);
      summarize(start, end);
    }

    grid.addEventListener('click', function (e) { var c = e.target.closest('.er-day'); if (c) choose(Number(c.getAttribute('data-day'))); });
    grid.addEventListener('pointerover', function (e) { var c = e.target.closest('.er-day'); if (c) preview(Number(c.getAttribute('data-day'))); });
    grid.addEventListener('pointerleave', function () { if (picking && start) { draw(start, null); summarize(start, null); } });
    grid.addEventListener('focusin', function (e) { var c = e.target.closest('.er-day'); if (c) preview(Number(c.getAttribute('data-day'))); });
    grid.addEventListener('keydown', function (e) {
      var c = e.target.closest('.er-day'); if (!c) return;
      var d0 = Number(c.getAttribute('data-day'));
      var map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (map[e.key] == null) return;
      e.preventDefault();
      var nd = Math.max(1, Math.min(days, d0 + map[e.key]));
      c.tabIndex = -1; cells[nd].tabIndex = 0; cells[nd].focus();
    });
    clear.addEventListener('click', function () {
      start = end = null; picking = false;
      draw(null, null);
      summarize(null);
      clear.hidden = true;
    });
    if (window.ResizeObserver) new ResizeObserver(function () { draw(start, end || null); }).observe(grid);
  }

  window.initElasticRange = initElasticRange;
  function boot() { document.querySelectorAll('[data-mi="elastic-range"]').forEach(initElasticRange); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
