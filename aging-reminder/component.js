/* Aging Reminder — vanilla JS. Auto-initializes every [data-mi="aging-reminder"].
   Age runs 0–1 over eight snoozes: paper yellows, the corner curls, tape appears at 3, a coffee ring at 5.
   Call window.initAgingReminder(el) for elements added later. */
(function () {
  'use strict';
  var MAX = 8;
  var NOTES = { 3: 'It’s been taped back up.', 5: 'This reminder has seen things.', 7: 'It’s older than some of your projects.', 8: 'It’s now a historical document.' };

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

  function initAgingReminder(root) {
    if (!root || root.__miAge) return;
    root.__miAge = true;
    evenLines(root);
    var who = root.getAttribute('data-who') || 'them';
    var startHour = Number(root.getAttribute('data-start')) || 10;
    var since = root.querySelector('.ar-since'), status = root.querySelector('.ar-status');
    var snooze = root.querySelector('.ar-snooze'), done = root.querySelector('.ar-done');
    var stage = root.querySelector('.ar-stage');
    var n = 0, finished = false;

    // The curl reveals the stage behind it, so it needs that color as an opaque value.
    function nums(c) { return (c.match(/[\d.]+/g) || []).map(Number); }
    function stageColor() {
      var f = nums(getComputedStyle(stage).backgroundColor), b = nums(getComputedStyle(root).backgroundColor);
      var a = f.length > 3 ? f[3] : 1;
      root.style.setProperty('--ar-stage-bg', 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(f[i] * a + (b[i] || 255) * (1 - a)); }).join(', ') + ')');
    }
    stageColor();
    if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { setTimeout(stageColor, 50); });

    function hour(h) { var hh = h % 24, ap = hh >= 12 ? 'PM' : 'AM'; return (hh % 12 || 12) + ':00 ' + ap; }

    function render() {
      var age = Math.min(1, n / MAX);
      root.style.setProperty('--ar-age', age.toFixed(3));
      root.style.setProperty('--ar-tilt', (n === 0 ? 0 : (n % 2 ? -1 : 1) * Math.min(3.5, 0.6 + n * 0.4)).toFixed(2) + 'deg');
      root.classList.toggle('is-taped', n >= 3);
      root.classList.toggle('is-stained', n >= 5);
      since.textContent = n === 0 ? 'Due today at ' + hour(startHour)
        : 'Snoozed ' + n + (n === 1 ? ' time' : ' times') + '. It’s now ' + hour(startHour + n) + (startHour + n >= 24 ? ', tomorrow' : '') + '.';
      // Very narrow cards show just "Seriously?" so the label always fits on one line.
      snooze.innerHTML = n >= MAX ? '<span class="ar-long">Snooze (Seriously?)</span><span class="ar-short">Seriously?</span>' : 'Snooze 1 Hour';
      status.textContent = NOTES[n] || '';
    }

    snooze.addEventListener('click', function () { if (finished) return; n++; render(); });
    done.addEventListener('click', function () {
      if (finished) {
        finished = false; n = 0;
        root.classList.remove('is-done');
        done.textContent = 'Done'; snooze.disabled = false;
        render();
        return;
      }
      finished = true;
      root.classList.add('is-done');
      snooze.disabled = true;
      done.textContent = 'Undo';
      status.textContent = n === 0 ? 'Done on time. Who are you?' : 'Done after ' + n + (n === 1 ? ' snooze' : ' snoozes') + '. ' + who + ' will be so relieved.';
    });
    render();
  }

  window.initAgingReminder = initAgingReminder;
  function boot() { document.querySelectorAll('[data-mi="aging-reminder"]').forEach(initAgingReminder); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
