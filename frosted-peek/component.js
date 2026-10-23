/* Frosted Peek — vanilla JS. Auto-initializes every [data-mi="frosted-peek"].
   Call window.initFrostedPeek(el) for elements added later.
   Set data-values="32,35,…" and data-months="Nov,Dec,…" on the root to use your own numbers. */
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var VALUES = [38.4, 40.1, 39.2, 42.8, 44.5, 43.1, 46.9, 48.2, 47.6, 50.3, 52.8, 54.1];
  var MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  var FULL = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function initFrostedPeek(root) {
    if (!root || root.__miPeek) return;
    root.__miPeek = true;

    var values = root.getAttribute('data-values') ? root.getAttribute('data-values').split(',').map(Number) : VALUES;
    var months = root.getAttribute('data-months') ? root.getAttribute('data-months').split(',') : MONTHS;
    var chart = root.querySelector('.fp-chart');
    var svg = root.querySelector('.fp-svg');
    var monthRow = root.querySelector('.fp-months');
    var lens = root.querySelector('.fp-lens');
    var tip = root.querySelector('.fp-tip');
    var cta = root.querySelector('.fp-cta');
    var note = root.querySelector('.fp-note');
    var noteText = note ? note.textContent : '';
    var index = 0;
    var dragging = false;
    var closeTimer = 0;
    var unlocked = false;

    // ---- draw the chart (viewBox 480 × 200) ----
    var W = 480, H = 200, padT = 46, padB = 14;
    var lo = Math.min.apply(null, values) * 0.9, hi = Math.max.apply(null, values) * 1.04;
    function px(i) { return (i + 0.5) * (W / values.length); }
    function py(v) { return padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB); }
    [0.33, 0.66].forEach(function (f) {
      svg.appendChild(el('line', { class: 'fp-grid', x1: 0, x2: W, y1: padT + f * (H - padT - padB), y2: padT + f * (H - padT - padB) }));
    });
    var pts = values.map(function (v, i) { return px(i).toFixed(1) + ' ' + py(v).toFixed(1); });
    var first = py(values[0]).toFixed(1), last = py(values[values.length - 1]).toFixed(1);
    svg.appendChild(el('path', { class: 'fp-area', d: 'M0 ' + H + ' L0 ' + first + ' L' + pts.join(' L') + ' L' + W + ' ' + last + ' L' + W + ' ' + H + ' Z' }));
    svg.appendChild(el('path', { class: 'fp-line', d: 'M0 ' + first + ' L' + pts.join(' L') + ' L' + W + ' ' + last }));
    monthRow.replaceChildren.apply(monthRow, months.map(function (m) { var s = document.createElement('span'); s.textContent = m; return s; }));

    function money(v) { return '$' + v.toFixed(1) + 'k'; }

    function place(x) {
      var w = chart.clientWidth;
      var half = parseFloat(getComputedStyle(chart).getPropertyValue('--fp-w')) || 40;
      x = Math.max(half, Math.min(w - half, x));
      chart.style.setProperty('--fp-x', x + 'px');
      var i = Math.max(0, Math.min(values.length - 1, Math.floor(x / (w / values.length))));
      if (i !== index || !tip.textContent) {
        index = i;
        tip.textContent = months[i] + ' · ' + money(values[i]);
        lens.style.setProperty('--fp-y', ((py(values[i]) / H) * (chart.clientHeight - 22)).toFixed(1) + 'px');
        chart.setAttribute('aria-valuenow', i);
        chart.setAttribute('aria-valuetext', (FULL[months[i]] || months[i]) + ', ' + money(values[i]) + ' forecast');
      }
    }
    function snapTo(i) { place((i + 0.5) * (chart.clientWidth / values.length)); }
    function open(on) {
      if (unlocked) return;
      clearTimeout(closeTimer);
      chart.classList.toggle('is-open', on);
      chart.style.setProperty('--fp-o', on ? 1 : 0);
    }
    function localX(e) { return e.clientX - chart.getBoundingClientRect().left; }

    chart.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { place(localX(e)); open(true); } });
    chart.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || dragging) place(localX(e)); });
    chart.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !dragging) open(false); });
    chart.addEventListener('pointerdown', function (e) {
      dragging = true;
      chart.classList.add('is-dragging');
      try { chart.setPointerCapture(e.pointerId); } catch (err) {}
      place(localX(e));
      open(true);
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      chart.classList.remove('is-dragging');
      if (e.pointerType !== 'mouse') closeTimer = setTimeout(function () { open(false); }, 900);
    }
    chart.addEventListener('pointerup', endDrag);
    chart.addEventListener('pointercancel', endDrag);

    chart.addEventListener('focus', function () { snapTo(index); open(true); });
    chart.addEventListener('blur', function () { open(false); });
    chart.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowUp') index = Math.min(values.length - 1, index + 1);
      else if (k === 'ArrowLeft' || k === 'ArrowDown') index = Math.max(0, index - 1);
      else if (k === 'Home') index = 0;
      else if (k === 'End') index = values.length - 1;
      else if (k === 'Escape') { open(false); return; }
      else return;
      e.preventDefault();
      open(true);
      tip.textContent = '';
      snapTo(index);
    });

    cta.addEventListener('click', function () {
      if (!unlocked) {
        unlocked = true;
        root.classList.add('is-unlocked');
        chart.classList.remove('is-open');
        chart.style.setProperty('--fp-o', 1);
        chart.style.setProperty('--fp-w', chart.clientWidth + 'px'); // the frost clears completely
        cta.textContent = 'Reset Demo';
        if (note) note.textContent = 'Pro trial started. Every month is yours for 14 days.';
      } else {
        unlocked = false;
        root.classList.remove('is-unlocked');
        chart.style.setProperty('--fp-w', '40px');
        chart.style.setProperty('--fp-o', 0);
        cta.textContent = 'Unlock Forecasts';
        if (note) note.textContent = noteText;
      }
    });

    snapTo(0);
  }

  window.initFrostedPeek = initFrostedPeek;
  function boot() { document.querySelectorAll('[data-mi="frosted-peek"]').forEach(initFrostedPeek); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
