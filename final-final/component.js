/* final_FINAL_v3 — vanilla JS. Auto-initializes every [data-mi="final-final"].
   Each save (button, or ⌘S / Ctrl+S inside the component) backspaces and retypes the name to its next stage.
   Call window.initFinalFinal(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var SUFFIXES = ['', ' final', ' final_v2', ' FINAL', ' FINAL_final', ' FINAL_final_v3', ' FINAL_final_v3 (use this one)',
    ' FINAL_final_v3 (use this one) (1)', ' FINAL_final_v3 (use this one) (1) EDITED', ''];
  var NOTES = { 3: 'Confident.', 5: 'Very confident.', 6: 'This is the one.', 7: 'This is also the one.', 8: 'Nine files. One deck. Nobody knows which is real.', 9: 'Full circle. It’s just “Pitch Deck” again.' };

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

  function initFinalFinal(root) {
    if (!root || root.__miFinal) return;
    root.__miFinal = true;
    evenLines(root);
    var base = root.getAttribute('data-base') || 'Untitled';
    var ext = root.getAttribute('data-ext') || '';
    var typed = root.querySelector('.fn-typed'), meta = root.querySelector('.fn-meta');
    var save = root.querySelector('.fn-save'), folder = root.querySelector('.fn-folder'), list = root.querySelector('.fn-list');
    var status = root.querySelector('.fn-status');
    var stage = 0, busy = false, files = [];

    function type(from, to, done) {
      if (reduce.matches) { typed.textContent = to; done(); return; }
      var keep = 0;
      while (keep < from.length && keep < to.length && from[keep] === to[keep]) keep++;
      var cur = from, typing = false;
      root.classList.add('is-typing');
      (function step() {
        if (!typing && cur.length > keep) { cur = cur.slice(0, -1); typed.textContent = cur; setTimeout(step, 22); return; }
        typing = true; // backspacing is done, now type forward
        if (cur.length < to.length) { cur = to.slice(0, cur.length + 1); typed.textContent = cur; setTimeout(step, 38); return; }
        root.classList.remove('is-typing');
        done();
      })();
    }

    function renderFolder() {
      list.replaceChildren();
      var shown = files.slice(-3).reverse();
      shown.forEach(function (f) { var li = document.createElement('li'); li.textContent = f + ext; list.appendChild(li); });
      if (files.length > 3) { var m = document.createElement('li'); m.className = 'fn-more'; m.textContent = 'and ' + (files.length - 3) + ' more'; list.appendChild(m); }
      folder.hidden = files.length === 0;
    }

    function doSave() {
      if (busy) return;
      busy = true;
      var oldName = base + SUFFIXES[stage];
      if (stage < SUFFIXES.length - 1 && files.indexOf(oldName) < 0) files.push(oldName);
      stage = (stage + 1) % SUFFIXES.length;
      var newName = base + SUFFIXES[stage];
      meta.textContent = '24 pages · Saving…';
      status.textContent = '';
      type(oldName, newName, function () {
        busy = false;
        meta.textContent = '24 pages · Saved just now';
        status.textContent = NOTES[stage] || '';
        if (stage === SUFFIXES.length - 1) { stage = 0; files = []; }
        renderFolder();
      });
    }

    save.addEventListener('click', doSave);
    root.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(); }
    });
    typed.textContent = base;
  }

  window.initFinalFinal = initFinalFinal;
  function boot() { document.querySelectorAll('[data-mi="final-final"]').forEach(initFinalFinal); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
