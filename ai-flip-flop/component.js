/* AI Flip-Flop — vanilla JS. Auto-initializes every [data-mi="ai-flip-flop"].
   Each "Are You Sure?" swaps in the next scripted answer, thinking a little longer each time.
   Pass your own script with root.setScript([{ c: 0–100, t: 'answer' }, …]). Call window.initAiFlipFlop(el) for later elements. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var SCRIPT = [
    { c: 100, t: 'There are 3 r’s in “strawberry.”' },
    { c: 72, t: 'Good catch. Looking again, there are 2 r’s in “strawberry.”' },
    { c: 47, t: 'Apologies for the confusion. It’s 3. Or 2. It depends how you count the second one.' },
    { c: 19, t: 'Strawberry has as many r’s as feels right to you.' },
    { c: 4, t: 'I’m honestly not sure what an r is anymore.' },
    { c: 100, t: 'Final answer: 3. Please don’t ask again.' }
  ];
  // Confidence color: red at 0, amber in the middle, green at 100 (status text tokens), blended in sRGB.
  var STOPS = [[0, 'danger-text'], [0.5, 'warning-text'], [1, 'success-text']];
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
    for (var i = 1; i < S.length; i++) {
      if (v <= S[i][0]) {
        var a = S[i - 1], b = S[i], t = (v - a[0]) / (b[0] - a[0]);
        return 'rgb(' + a[1].map(function (x, k) { return Math.round(x + (b[1][k] - x) * t); }).join(', ') + ')';
      }
    }
    return 'rgb(' + S[S.length - 1][1].join(', ') + ')';
  }
  function times(n) { return n === 1 ? 'once' : n === 2 ? 'twice' : n + ' times'; }

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

  function initAiFlipFlop(root) {
    if (!root || root.__miFlip) return;
    root.__miFlip = true;
    evenLines(root);
    var script = SCRIPT;
    var text = root.querySelector('.ff-text'), val = root.querySelector('.ff-conf-val'), conf = root.querySelector('.ff-conf');
    var card = root.querySelector('.ff-a'), sure = root.querySelector('.ff-sure'), countEl = root.querySelector('.ff-count');
    var step = 0, asked = 1, busy = false;

    var lastC = 100;
    onTheme(function () { root.style.setProperty('--ff-c', colorAt(lastC, root)); });
    function show(i, animate) {
      var s = script[i], c = s.c / 100;
      lastC = c;
      root.style.setProperty('--ff-c', colorAt(c, root));
      root.style.setProperty('--ff-s', (0.7 + 0.3 * c).toFixed(3));
      root.classList.toggle('is-sweating', s.c < 60);
      root.classList.toggle('is-panicking', s.c < 25);
      val.textContent = s.c + '%';
      conf.setAttribute('aria-label', s.c + ' percent sure');
      text.classList.remove('is-thinking');
      text.textContent = s.t;
      if (animate) {
        text.classList.remove('is-in'); void text.offsetWidth; text.classList.add('is-in');
        if (s.c < 30) { card.classList.remove('is-shaky'); void card.offsetWidth; card.classList.add('is-shaky'); }
      }
      var last = i === script.length - 1;
      if (last && i > 0) {
        root.classList.remove('is-puff'); void root.offsetWidth; root.classList.add('is-puff');
        countEl.textContent = 'Asked ' + times(asked) + '. Back to 100%, as if nothing happened.';
      } else countEl.textContent = 'Asked ' + times(asked) + '.';
      sure.textContent = last && i > 0 ? 'Start Over' : 'Are You Sure?';
    }

    sure.addEventListener('click', function () {
      if (busy) return;
      if (step === script.length - 1 && step > 0) { step = 0; asked = 1; root.classList.remove('is-puff'); show(0, true); return; }
      busy = true;
      sure.disabled = true;
      asked++;
      step++;
      // Doubt takes time: each answer thinks longer than the last.
      text.classList.remove('is-in');
      text.classList.add('is-thinking');
      text.textContent = step === script.length - 1 ? 'Pulling itself together…' : 'Reconsidering…';
      setTimeout(function () {
        busy = false;
        sure.disabled = false;
        show(step, true);
        sure.focus();
      }, reduce.matches ? 300 : 600 + step * 260);
    });

    root.setScript = function (s) { script = s; step = 0; asked = 1; show(0, false); };
    show(0, false);
  }

  window.initAiFlipFlop = initAiFlipFlop;
  function boot() { document.querySelectorAll('[data-mi="ai-flip-flop"]').forEach(initAiFlipFlop); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
