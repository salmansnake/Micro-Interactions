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

  function initAiFlipFlop(root) {
    if (!root || root.__miFlip) return;
    root.__miFlip = true;
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
