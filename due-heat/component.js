/* Due Heat — vanilla JS. Auto-initializes every [data-mi="due-heat"].
   Rows set data-due-hours (from now) or data-due (an ISO date). The range moves a pretend clock for the demo.
   Call window.initDueHeat(el) for elements added later. */
(function () {
  'use strict';
  var WINDOW_H = 72; // heat starts rising 3 days out
  // Color stops along the heat scale (muted, info blue, warning amber, danger red; text tokens), blended in sRGB.
  var STOPS = [[0, 'muted-foreground'], [0.3, 'info-text'], [0.72, 'warning-text'], [1, 'danger-text']];
  // Reads a token as [r, g, b] so the scale follows the theme (Outcraft tokens, never hardcoded colors).
  function tokenRGB(root, name) {
    var p = document.createElement('span'); p.style.cssText = 'display:none;color:var(--' + name + ')';
    root.appendChild(p); var m = getComputedStyle(p).color.match(/[\d.]+/g); root.removeChild(p);
    return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
  }
  // Re-read the tokens when the theme changes.
  function onTheme(fn) {
    new MutationObserver(function () { requestAnimationFrame(fn); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', fn);
  }
  function colorAt(h, root) {
    var S = STOPS.map(function (st) { return [st[0], tokenRGB(root, st[1])]; });
    for (var i = 1; i < S.length; i++) {
      if (h <= S[i][0]) {
        var a = S[i - 1], b = S[i], t = (h - a[0]) / (b[0] - a[0]);
        return 'rgb(' + a[1].map(function (v, k) { return Math.round(v + (b[1][k] - v) * t); }).join(', ') + ')';
      }
    }
    return 'rgb(' + S[S.length - 1][1].join(', ') + ')';
  }

  function left(hours) {
    var a = Math.abs(hours);
    var txt = a < 1 ? Math.max(1, Math.round(a * 60)) + 'm' : a < 48 ? Math.round(a) + 'h' : Math.round(a / 24) + 'd';
    return hours < 0 ? txt + ' overdue' : 'in ' + txt;
  }

  function initDueHeat(root) {
    if (!root || root.__miHeat) return;
    root.__miHeat = true;
    var start = Date.now();
    var rows = Array.prototype.slice.call(root.querySelectorAll('.dh-row')).map(function (r) {
      var due = r.hasAttribute('data-due') ? new Date(r.getAttribute('data-due')).getTime() : start + Number(r.getAttribute('data-due-hours')) * 3600000;
      return { el: r, chip: r.querySelector('.dh-chip'), label: r.querySelector('.dh-left'), due: due, over: false };
    });
    var range = root.querySelector('.dh-range');
    var now = root.querySelector('.dh-now');

    function render() {
      var shift = range ? Number(range.value) : 0;
      var t = start + shift * 3600000;
      now.textContent = shift ? '+' + (shift % 1 ? shift.toFixed(1) : shift) + ' hours' : 'Now';
      rows.forEach(function (r) {
        var hours = (r.due - t) / 3600000;
        // Heat eases in: barely warm three days out, hot in the final hours.
        var heat = hours <= 0 ? 1 : Math.pow(Math.max(0, 1 - hours / WINDOW_H), 2.2);
        r.chip.style.setProperty('--dh-c', colorAt(heat, root));
        r.chip.classList.toggle('is-warm', hours > 0 && hours < 24);
        r.chip.style.setProperty('--beat', (0.6 + Math.max(0, hours) / 24 * 1.8).toFixed(2) + 's');
        var over = hours <= 0;
        r.chip.classList.toggle('is-over', over);
        if (over && !r.over) { r.el.classList.remove('is-overdue-new'); void r.el.offsetWidth; r.el.classList.add('is-overdue-new'); }
        r.over = over;
        r.label.textContent = left(hours);
        r.chip.setAttribute('aria-label', 'Due ' + left(hours));
      });
    }

    if (range) range.addEventListener('input', render);
    setInterval(render, 30000); // real time keeps warming things up
    render();
    onTheme(render);
  }

  window.initDueHeat = initDueHeat;
  function boot() { document.querySelectorAll('[data-mi="due-heat"]').forEach(initDueHeat); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
