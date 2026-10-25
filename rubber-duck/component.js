/* Rubber Duck Gate — vanilla JS. Auto-initializes every [data-mi="rubber-duck"].
   File Bug first summons the duck; it nods at every finished sentence. After two sentences you can
   say you figured it out, or file it anyway. Call window.initRubberDuck(el) for elements added later. */
(function () {
  'use strict';
  var NODS = ['Mm-hm.', 'Go on.', 'And then what happens?', 'Interesting.', 'Wait. Say that part again.', 'Quack. Keep going.'];

  function sentences(s) { return (s.match(/[.?!](\s|$)|\n/g) || []).length; }

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

  function initRubberDuck(root) {
    if (!root || root.__miDuck) return;
    root.__miDuck = true;
    evenLines(root);
    var desc = root.querySelector('.rd-desc'), label = root.querySelector('.rd-desc-label');
    var row = root.querySelector('.rd-duck-row'), duck = root.querySelector('.rd-duck'), say = root.querySelector('.rd-say');
    var submit = root.querySelector('.rd-submit'), solved = root.querySelector('.rd-solved'), file = root.querySelector('.rd-file');
    var pctEl = root.querySelector('.rd-pct'), pct = Number(root.getAttribute('data-solved')) || 37;
    var ducking = false, seen = 0, n = 0;

    function play(cls) { duck.classList.remove('is-nod', 'is-joy'); void duck.offsetWidth; duck.classList.add(cls); }

    function reset() {
      ducking = false; seen = 0; n = 0;
      root.classList.remove('is-ducking', 'is-closed');
      row.hidden = true;
      desc.value = ''; desc.disabled = false;
      label.textContent = 'What happens?';
      submit.hidden = false; submit.textContent = 'File Bug';
      solved.hidden = true; file.hidden = true;
    }

    submit.addEventListener('click', function () {
      if (submit.textContent !== 'File Bug') { reset(); desc.focus(); return; }
      ducking = true;
      root.classList.add('is-ducking');
      row.hidden = false;
      say.textContent = 'Before you file it, explain it to me. Step by step.';
      label.textContent = 'Explain it to the duck';
      submit.hidden = true;
      desc.focus();
    });

    desc.addEventListener('input', function () {
      if (!ducking) return;
      var s = sentences(desc.value);
      if (s > seen) {
        seen = s;
        say.textContent = NODS[n++ % NODS.length];
        play('is-nod');
      }
      if (seen >= 2) { solved.hidden = false; file.hidden = false; }
    });

    solved.addEventListener('click', function () {
      ducking = false;
      pct = Math.min(99, pct + 1);
      pctEl.textContent = pct + '%';
      say.textContent = 'Quack. Bug closed before it existed.';
      play('is-joy');
      root.classList.add('is-closed');
      desc.disabled = true;
      solved.hidden = true; file.hidden = true;
      submit.hidden = false; submit.textContent = 'Report Another';
      submit.focus();
    });

    file.addEventListener('click', function () {
      ducking = false;
      say.textContent = 'Filed as BUG-' + (1000 + Math.floor(Math.random() * 900)) + '. The duck believes in you.';
      play('is-nod');
      root.classList.add('is-closed');
      desc.disabled = true;
      solved.hidden = true; file.hidden = true;
      submit.hidden = false; submit.textContent = 'Report Another';
      submit.focus();
    });
  }

  window.initRubberDuck = initRubberDuck;
  function boot() { document.querySelectorAll('[data-mi="rubber-duck"]').forEach(initRubberDuck); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
