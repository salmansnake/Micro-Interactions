/* Elastic Range — vanilla JS. Auto-initializes every [data-mi="elastic-range"].
   data-year, data-month (0-based), data-booked (days), data-rate (per night). Call window.initElasticRange(el) for later elements. */
(function () {
  'use strict';
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function initElasticRange(root) {
    if (!root || root.__miRange) return;
    root.__miRange = true;
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
        bubble.textContent = nights + (nights === 1 ? ' night' : ' nights') + (rate ? ' · $' + (nights * rate).toLocaleString() : '');
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
        summary.replaceChildren(Object.assign(document.createElement('span'), { className: 'er-warn', textContent: mon + ' ' + wall + ' is booked, so your stay ends ' + mon + ' ' + (wall - 1) + '.' }));
        return;
      }
      draw(start, day);
      summarize(start, day, true);
    }

    function summarize(a, z, tentative) {
      summary.replaceChildren();
      if (!a) { summary.textContent = 'Choose a check-in date.'; return; }
      if (!z) { summary.append('Check-in ', Object.assign(document.createElement('b'), { textContent: mon + ' ' + a }), '. Now choose check-out.'); return; }
      var nights = z - a;
      summary.append(Object.assign(document.createElement('b'), { textContent: mon + ' ' + a + ' – ' + mon + ' ' + z }), ' · ' + nights + (nights === 1 ? ' night' : ' nights') + (rate ? ' · $' + (nights * rate).toLocaleString() + ' total' : '') + (tentative ? '' : '.'));
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
