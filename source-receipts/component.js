/* Source Receipts — vanilla JS. Auto-initializes every [data-mi="source-receipts"].
   Each sentence of the answer ends in a chip: a source number, or "My guess" when nothing backs it. Pointing at or
   pressing a number lights the sentence and its source together; "My guess" says so plainly. Hide Guesses strikes
   out every unsourced sentence. Call window.initSourceReceipts(el) for elements added later. */
(function () {
  'use strict';

  // A button keeps one width whatever it says: as wide as its widest label (el is the label inside it)
  function keepWidth(btn, el, labels) {
    function size() {
      var keep = el.textContent, w = 0; btn.style.minWidth = '';
      labels.forEach(function (s) { el.textContent = s; w = Math.max(w, btn.getBoundingClientRect().width); });
      el.textContent = keep; btn.style.minWidth = Math.ceil(w) + 'px';
    }
    size();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  }

  function initSourceReceipts(root) {
    if (!root || root.__miSrr) return;
    root.__miSrr = true;
    var sents = root.querySelectorAll('.srr-s'), sources = root.querySelectorAll('.srr-sources li'), chips = root.querySelectorAll('.srr-chip');
    var btn = root.querySelector('.srr-btn'), label = btn.querySelector('span'), status = root.querySelector('.srr-status'), pinned = null;
    var guesses = root.querySelectorAll('.srr-s.is-guess').length;

    function light(src) {
      sents.forEach(function (s) { s.classList.toggle('is-lit', !!src && s.getAttribute('data-src') === src); });
      sources.forEach(function (li) { li.classList.toggle('is-lit', !!src && li.getAttribute('data-src') === src); });
    }
    chips.forEach(function (c) {
      var src = c.getAttribute('data-src');
      c.setAttribute('aria-expanded', 'false');
      c.addEventListener('pointerenter', function () { if (!pinned) light(src); });
      c.addEventListener('pointerleave', function () { if (!pinned) light(null); });
      c.addEventListener('click', function () {
        chips.forEach(function (x) { if (x !== c) x.setAttribute('aria-expanded', 'false'); });
        var open = c.getAttribute('aria-expanded') !== 'true';
        c.setAttribute('aria-expanded', open); pinned = open && src ? src : null; light(pinned);
        if (!open) { status.textContent = ''; return; }
        if (!src) { status.textContent = 'No source for that one. It’s a guess, and it says so.'; return; }
        var li = root.querySelector('.srr-sources li[data-src="' + src + '"]');
        status.textContent = 'From ' + li.querySelector('b').textContent + ': ' + li.querySelector('small').textContent.replace(/ (\S+)$/, '\u00a0$1') + '.';
      });
    });
    btn.addEventListener('click', function () {
      var strict = !root.classList.contains('is-strict');
      root.classList.toggle('is-strict', strict); btn.setAttribute('aria-pressed', strict);
      label.textContent = strict ? 'Show Guesses' : 'Hide Guesses';
      status.textContent = strict ? 'Showing only what has a source. ' + guesses + (guesses === 1 ? '\u00a0guess' : '\u00a0guesses') + ' struck out for\u00a0now.' : 'Guesses are back, and each one is still marked as a\u00a0guess.';
    });
    keepWidth(btn, label, ['Hide Guesses', 'Show Guesses']);
  }

  window.initSourceReceipts = initSourceReceipts;
  function boot() { document.querySelectorAll('[data-mi="source-receipts"]').forEach(initSourceReceipts); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
