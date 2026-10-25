/* Tone Thermometer — vanilla JS. Auto-initializes every [data-mi="tone-thermometer"].
   Each cold phrase costs degrees from a 22° start; Warm It Up swaps them for warmer wording.
   Edit PHRASES for your product's tone. Call window.initToneThermometer(el) for elements added later. */
(function () {
  'use strict';
  var BASE = 22;
  // [pattern, degrees lost, warmer replacement]
  var PHRASES = [
    [/per my (last|previous) (email|message)/gi, 14, 'in case it got buried'],
    [/as previously mentioned/gi, 10, 'as a quick recap'],
    [/as i (said|mentioned)/gi, 8, 'like I mentioned'],
    [/friendly reminder/gi, 7, 'just a nudge'],
    [/going forward/gi, 5, 'next time'],
    [/\bnoted\./gi, 6, 'Got it, thank you.'],
    [/thanks in advance/gi, 4, 'thank you so much'],
    [/just to clarify/gi, 3, 'to make sure we’re aligned'],
    [/\bkindly\b/gi, 3, 'please'],
    [/\bplease advise\b/gi, 4, 'let me know what you think']
  ];
  // Thermometer color: Orange (warm) through muted to Aqua (cold), blended in sRGB.
  var STOPS = [[0, 'ai-text'], [0.5, 'muted-foreground'], [1, 'brand-strong']];
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
  function colorAt(v, root) {
    var S = STOPS.map(function (st) { return [st[0], tokenRGB(root, st[1])]; });
    for (var i = 1; i < S.length; i++) if (v <= S[i][0]) {
      var a = S[i - 1], b = S[i], t = (v - a[0]) / (b[0] - a[0]);
      return 'rgb(' + a[1].map(function (x, k) { return Math.round(x + (b[1][k] - x) * t); }).join(', ') + ')';
    }
    return 'rgb(' + S[S.length - 1][1].join(', ') + ')';
  }
  function word(t) { return t >= 18 ? 'Warm' : t >= 10 ? 'Mild' : t > 0 ? 'Chilly' : t > -10 ? 'Freezing' : 'Arctic'; }
  function matchCase(found, rep) { return /^[A-Z]/.test(found) ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep; }

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

  function initToneThermometer(root) {
    if (!root || root.__miTone) return;
    root.__miTone = true;
    evenLines(root);
    var input = root.querySelector('.tn-input'), temp = root.querySelector('.tn-temp'), deg = root.querySelector('.tn-deg');
    var wordEl = root.querySelector('.tn-word'), mercury = root.querySelector('.tn-mercury');
    var fix = root.querySelector('.tn-fix'), fixText = root.querySelector('.tn-fix-text'), warm = root.querySelector('.tn-warm');
    var send = root.querySelector('.tn-send'), status = root.querySelector('.tn-status');
    var to = root.getAttribute('data-to') || 'They';
    var last = BASE;

    function measure() {
      var t = BASE, hits = 0, text = input.value;
      PHRASES.forEach(function (p) { var m = text.match(p[0]); if (m) { t -= p[1] * m.length; hits += m.length; } });
      return { t: t, hits: hits };
    }

    function render() {
      var r = measure(), t = r.t;
      var cold = Math.max(0, Math.min(1, (12 - t) / 30));
      root.style.setProperty('--tn-cold', cold.toFixed(3));
      root.style.setProperty('--tn-c', colorAt(Math.max(0, Math.min(1, (BASE - t) / 34)), root));
      deg.textContent = t + '°';
      wordEl.textContent = word(t);
      mercury.setAttribute('d', 'M12 15V' + (15 - Math.max(0.5, Math.min(7, (t + 12) / 34 * 7))).toFixed(1));
      if (t < last) { temp.classList.remove('is-drop'); void temp.offsetWidth; temp.classList.add('is-drop'); }
      last = t;
      fix.hidden = r.hits === 0;
      if (r.hits) fixText.textContent = r.hits + (r.hits === 1 ? ' phrase is' : ' phrases are') + ' making this ' + (t <= 0 ? 'freezing.' : 'chilly.');
    }

    onTheme(render);
    input.addEventListener('input', function () { status.textContent = ''; render(); });
    root.querySelectorAll('.tn-chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        var add = b.textContent.trim();
        input.value = input.value.replace(/\s*$/, '') + ' ' + add + (/[.!?]$/.test(add) ? '' : ', the deadline is Friday.');
        render();
      });
    });
    warm.addEventListener('click', function () {
      var text = input.value;
      PHRASES.forEach(function (p) { text = text.replace(p[0], function (m) { return matchCase(m, p[2]); }); });
      input.value = text;
      render();
      status.textContent = 'Thawed. Same message, fewer enemies.';
      input.focus();
    });
    send.addEventListener('click', function () {
      var t = measure().t;
      status.textContent = t >= 10 ? 'Sent at ' + t + '°. ' + to + ' will reply today.' : 'Sent at ' + t + '°. ' + to + ' will reply in three to five business days.';
    });
    render();
  }

  window.initToneThermometer = initToneThermometer;
  function boot() { document.querySelectorAll('[data-mi="tone-thermometer"]').forEach(initToneThermometer); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
