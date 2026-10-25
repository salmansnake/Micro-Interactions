/* Lock Builder — vanilla JS. Auto-initializes every [data-mi="lock-builder"].
   Call window.initLockBuilder(el) for elements added later. */
(function () {
  'use strict';
  var RULES = {
    length: function (v) { return v.length >= 10; },
    case: function (v) { return /[a-z]/.test(v) && /[A-Z]/.test(v); },
    number: function (v) { return /\d/.test(v); },
    symbol: function (v) { return /[^A-Za-z0-9\s]/.test(v); }
  };
  var WORDS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

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

  function initLockBuilder(root) {
    if (!root || root.__miLock) return;
    root.__miLock = true;
    evenLines(root);
    var input = root.querySelector('.lb-input');
    var show = root.querySelector('.lb-show');
    var bolts = Array.prototype.slice.call(root.querySelectorAll('.lb-bolt'));
    var rules = Array.prototype.slice.call(root.querySelectorAll('[data-rule]'));
    var strength = root.querySelector('.lb-strength');
    var level = 0;

    function update() {
      var v = input.value;
      var met = 0;
      rules.forEach(function (li) {
        var ok = RULES[li.getAttribute('data-rule')](v);
        li.classList.toggle('is-met', ok);
        if (ok) met++;
      });
      // Bolts fill left to right, one per rule met.
      bolts.forEach(function (b, i) { b.classList.toggle('is-in', i < met); });
      if (met === 4 && level < 4) {
        root.classList.remove('is-locked');
        void root.offsetWidth;
        root.classList.add('is-locked');
      }
      level = met;
      root.setAttribute('data-level', String(met));
      if (!v) { strength.textContent = 'Each rule you meet adds a bolt.'; return; }
      var b = document.createElement('b');
      b.textContent = WORDS[met] || 'Weak';
      var rest = met === 4 ? '. Locked.' : '. ' + (4 - met) + (4 - met === 1 ? ' rule to go.' : ' rules to go.');
      strength.replaceChildren(b, document.createTextNode(rest));
    }

    input.addEventListener('input', update);
    show.addEventListener('click', function () {
      var on = input.type === 'password';
      input.type = on ? 'text' : 'password';
      show.textContent = on ? 'Hide' : 'Show';
      show.setAttribute('aria-pressed', on ? 'true' : 'false');
      input.focus();
    });
    update();
  }

  window.initLockBuilder = initLockBuilder;
  function boot() { document.querySelectorAll('[data-mi="lock-builder"]').forEach(initLockBuilder); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
