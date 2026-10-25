/* Autosave Appreciation — vanilla JS. Auto-initializes every [data-mi="autosave-thanks"].
   Catches ⌘S / Ctrl+S while focus is inside the component (or the keycap button) and thanks you instead of
   opening the browser's Save dialog. Call window.initAutosaveThanks(el) for elements added later. */
(function () {
  'use strict';
  // The message for the nth press; the highest threshold reached wins.
  var LINES = [[1, 'Already saved. But I appreciate the gesture.'], [2, 'Still saved. Every keystroke, actually.'], [3, 'Saved. Again. It’s fine.'],
    [5, 'We’ve got it. You can let go.'], [8, 'Muscle memory is a beautiful thing.'], [12, 'The file is now extremely safe.'], [20, 'At this point it’s a ritual. Respect.']];

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

  function initAutosaveThanks(root) {
    if (!root || root.__miSave) return;
    root.__miSave = true;
    evenLines(root);
    var input = root.querySelector('.av-input'), savedText = root.querySelector('.av-saved-text');
    var toast = root.querySelector('.av-toast'), text = root.querySelector('.av-toast-text'), countEl = root.querySelector('.av-count');
    var keys = root.querySelector('.av-keys'), live = root.querySelector('.av-live');
    var presses = 0, hide = 0, saving = 0;

    function thank() {
      presses++;
      var line = LINES[0][1];
      LINES.forEach(function (l) { if (presses >= l[0]) line = l[1]; });
      text.textContent = line;
      countEl.textContent = presses > 1 ? '×' + presses : '';
      live.textContent = line;
      root.classList.add('is-thanked');
      toast.classList.remove('is-bump'); void toast.offsetWidth; toast.classList.add('is-bump');
      clearTimeout(hide);
      hide = setTimeout(function () { root.classList.remove('is-thanked'); }, 2600);
    }

    root.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); thank(); }
    });
    keys.addEventListener('click', thank);
    input.addEventListener('input', function () {
      root.classList.add('is-saving');
      savedText.textContent = 'Saving…';
      clearTimeout(saving);
      saving = setTimeout(function () { root.classList.remove('is-saving'); savedText.textContent = 'Saved'; }, 600);
    });
  }

  window.initAutosaveThanks = initAutosaveThanks;
  function boot() { document.querySelectorAll('[data-mi="autosave-thanks"]').forEach(initAutosaveThanks); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
