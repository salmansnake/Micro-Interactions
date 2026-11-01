/* Time Zone Sundial — vanilla JS. Auto-initializes every [data-mi="timezone-sundial"].
   The slider picks a half-hour slot in the home time zone (data-home) on data-date. Each person (data-tz) gets their
   local time and a sky in natural colors: blue with the sun by day, a violet-to-orange glow at dawn and dusk, navy with the moon at night.
   Call window.initTimezoneSundial(el) for elements added later. */
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
      // A filled box marked data-fill spans the card from edge to edge, and its text fills it
      if (el.hasAttribute('data-fill')) return;
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

  function parts(ms, tz) {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' })
      .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return p;
  }
  function clock(ms, tz) { return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date(ms)); }

  function initTimezoneSundial(root) {
    if (!root || root.__miTzs) return;
    root.__miTzs = true;
    evenLines(root);
    var range = root.querySelector('.tzs-range'), time = root.querySelector('.tzs-time');
    var status = root.querySelector('.tzs-status'), best = root.querySelector('.tzs-best');
    var home = root.getAttribute('data-home') || 'America/Chicago';
    var d = (root.getAttribute('data-date') || '2026-11-05').split('-').map(Number);
    var people = Array.prototype.map.call(root.querySelectorAll('.tzs-people li'), function (li) {
      return { li: li, tz: li.getAttribute('data-tz'), city: li.getAttribute('data-city'), name: li.querySelector('b').textContent.split(' ')[0], small: li.querySelector('small'), sun: li.querySelector('.tzs-sun'), moon: li.querySelector('.tzs-moon') };
    });
    var min = Number(range.min), max = Number(range.max), anim = 0;

    // The instant of a slot: midnight on the date in the home zone, plus 30 minutes a step
    function instant(v) {
      var guess = Date.UTC(d[0], d[1] - 1, d[2], 0, v * 30), p = parts(guess, home);
      var asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
      return guess - (asUtc - guess);
    }
    function look(v) {
      var ms = instant(v), homeDay = parts(ms, home).day;
      return people.map(function (p) {
        var q = parts(ms, p.tz), h = (+q.hour % 24) + (+q.minute) / 60;
        return { p: p, h: h, t: clock(ms, p.tz), day: q.day !== homeDay ? q.weekday : '', asleep: h < 7 || h >= 23, edge: (h >= 7 && h < 8) || (h >= 21 && h < 23) };
      });
    }
    function score(v) {
      var L = look(v);
      return { asleep: L.filter(function (x) { return x.asleep; }).length, kind: L.filter(function (x) { return !x.asleep && !x.edge; }).length };
    }

    // Green band on the track: every slot where nobody is asleep
    function band() {
      var stops = [], fill = 'var(--tzs-fill)', ok = 'color-mix(in oklab, var(--success) 45%, var(--tzs-fill))';
      for (var v = min; v <= max; v++) {
        var c = score(v).asleep ? fill : ok, a = (v - 0.5 - min) / (max - min), b = (v + 0.5 - min) / (max - min);
        a = Math.max(0, a); b = Math.min(1, b);
        stops.push(c + ' calc(12px + (100% - 24px) * ' + a.toFixed(4) + ') calc(12px + (100% - 24px) * ' + b.toFixed(4) + ')');
      }
      root.style.setProperty('--tzs-band', 'linear-gradient(to right, ' + stops.join(', ') + ')');
    }

    function list(names) { return names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]; }

    function render() {
      var v = Number(range.value), L = look(v), ms = instant(v);
      time.textContent = clock(ms, home);
      range.setAttribute('aria-valuetext', clock(ms, home) + ' in Austin');
      L.forEach(function (x) {
        var li = x.p.li, h = x.h, night = h < 6 || h >= 21, dusk = !night && (h < 8 || h >= 18);
        li.classList.toggle('is-night', night); li.classList.toggle('is-dusk', dusk); li.classList.toggle('is-asleep', x.asleep);
        x.p.small.innerHTML = '';
        x.p.small.appendChild(document.createTextNode(x.p.city + ' · ' + x.t + (x.day ? ' ' + x.day : '')));
        if (x.asleep) { var em = document.createElement('em'); em.textContent = ' · asleep'; x.p.small.appendChild(em); }
        // The sun crosses from 6 AM to 9 PM, the moon from 9 PM to 6 AM, low at the ends and high in the middle
        var f = night ? ((h < 6 ? h + 24 : h) - 21) / 9 : (h - 6) / 15;
        var tr = 'translate(' + (f * 32).toFixed(1) + 'px, ' + (6 - Math.sin(Math.PI * f) * 8).toFixed(1) + 'px)';
        x.p.sun.style.transform = tr; x.p.moon.style.transform = tr;
      });
      var asleep = L.filter(function (x) { return x.asleep; }), edge = L.filter(function (x) { return x.edge; });
      if (asleep.length === 1) status.textContent = asleep[0].p.name + ' is asleep. It’s ' + asleep[0].t + ' there.';
      else if (asleep.length) status.textContent = list(asleep.map(function (x) { return x.p.name; })) + ' are asleep.';
      else if (edge.length) status.textContent = 'Everyone is awake. It’s ' + list(edge.map(function (x) { return (x.h < 12 ? 'early for ' : 'late for ') + x.p.name; })) + '.';
      else status.textContent = 'Everyone is awake and at work.';
    }

    // Find a Kind Time: nobody asleep first, then the most people inside working hours, then the nearest slot
    best.addEventListener('click', function () {
      var now = Number(range.value), pick = now, top = null;
      for (var v = min; v <= max; v++) {
        var s = score(v), key = [-s.asleep, s.kind, -Math.abs(v - now)];
        if (!top || key[0] > top[0] || (key[0] === top[0] && (key[1] > top[1] || (key[1] === top[1] && key[2] > top[2])))) { top = key; pick = v; }
      }
      if (pick === now) { render(); status.textContent = 'This is already the kindest time.'; return; }
      cancelAnimationFrame(anim);
      if (reduce.matches) { range.value = pick; render(); return; }
      (function walk() {
        var v = Number(range.value);
        if (v === pick) return;
        range.value = v + (pick > v ? 1 : -1); render();
        anim = requestAnimationFrame(function () { anim = requestAnimationFrame(walk); });
      })();
    });

    range.addEventListener('input', function () { cancelAnimationFrame(anim); render(); });
    band();
    render();
  }

  window.initTimezoneSundial = initTimezoneSundial;
  function boot() { document.querySelectorAll('[data-mi="timezone-sundial"]').forEach(initTimezoneSundial); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
