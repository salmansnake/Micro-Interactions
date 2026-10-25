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

  function initFrostedPeek(root) {
    if (!root || root.__miPeek) return;
    root.__miPeek = true;
    evenLines(root);

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
    // Three grid lines split the plot into four equal bands, from the top of the chart to the area's baseline
    [0.25, 0.5, 0.75].forEach(function (f) {
      svg.appendChild(el('line', { class: 'fp-grid', x1: px(0), x2: px(values.length - 1), y1: f * H, y2: f * H }));
    });
    var pts = values.map(function (v, i) { return px(i).toFixed(1) + ' ' + py(v).toFixed(1); });
    // The line (and the grid lines above) run from the first month's point to the last, never to the chart's edges: the frost's
    // blur repeats the edge pixels, so a line touching the edge showed through as a sharp stub
    var x0 = px(0).toFixed(1), x1 = px(values.length - 1).toFixed(1);
    svg.appendChild(el('path', { class: 'fp-area', d: 'M' + x0 + ' ' + H + ' L' + pts.join(' L') + ' L' + x1 + ' ' + H + ' Z' }));
    svg.appendChild(el('path', { class: 'fp-line', d: 'M' + pts.join(' L') }));
    monthRow.replaceChildren.apply(monthRow, months.map(function (m) { var s = document.createElement('span'); s.textContent = m; return s; }));

    function money(v) { return '$' + v.toFixed(1) + 'k'; }

    function place(x) {
      var w = chart.clientWidth;
      var half = parseFloat(getComputedStyle(chart).getPropertyValue('--fp-w')) || 40;
      x = Math.max(half, Math.min(w - half, x));
      chart.style.setProperty('--fp-x', x + 'px');
      var i = Math.max(0, Math.min(values.length - 1, Math.floor(x / (w / values.length))));
      // The dot sits on the month's point, not under the pointer, so it stays on the line between months
      lens.style.setProperty('--fp-dx', ((i + 0.5) * (w / values.length) - x).toFixed(1) + 'px');
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
