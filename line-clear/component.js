/* Line Clear — vanilla JS. Auto-initializes every [data-mi="line-clear"].
   Blocks are hour slots 0–7 (9 AM to 5 PM). Accepting an invite drops it into its slot; when every slot is full the
   day flashes like a cleared row and offers to protect lunch. Call window.initLineClear(el) for elements added later. */
(function () {
  'use strict';
  var SLOTS = 8, LUNCH = 3;

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

  function initLineClear(root) {
    if (!root || root.__miLineClear) return;
    root.__miLineClear = true;
    evenLines(root);
    var col = root.querySelector('.ct-col'), free = root.querySelector('.ct-free'), list = root.querySelector('.ct-list');
    var clear = root.querySelector('.ct-clear'), lunch = root.querySelector('.ct-lunch'), status = root.querySelector('.ct-status');

    function blocks() { return Array.prototype.slice.call(col.querySelectorAll('.ct-block:not(.is-out)')); }
    col.querySelectorAll('.ct-block').forEach(function (b) { b.style.setProperty('--slot', b.getAttribute('data-slot')); });

    function count() {
      var n = SLOTS - blocks().length;
      free.textContent = n === 0 ? 'No time free' : n + (n === 1 ? ' hour free' : ' hours free');
      root.classList.toggle('is-full', n === 0);
      return n;
    }

    function full() {
      blocks().forEach(function (b) { b.classList.remove('is-drop', 'is-flash'); void b.offsetWidth; b.classList.add('is-flash'); });
      setTimeout(function () { clear.hidden = false; lunch.focus(); }, 700);
    }

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var slot = btn.getAttribute('data-slot');
      var b = document.createElement('div');
      b.className = 'ct-block is-drop';
      b.setAttribute('data-slot', slot);
      b.style.setProperty('--slot', slot);
      b.style.setProperty('--c', btn.getAttribute('data-c'));
      b.textContent = btn.getAttribute('data-name');
      col.appendChild(b);
      var li = btn.closest('li'), next = li.nextElementSibling || li.previousElementSibling;
      li.remove();
      if (!list.children.length) root.querySelector('.ct-invites').hidden = true;
      if (next) next.querySelector('button').focus();
      status.textContent = '';
      if (count() === 0) setTimeout(full, 650);
    });

    lunch.addEventListener('click', function () {
      var taken = blocks().filter(function (b) { return Number(b.getAttribute('data-slot')) === LUNCH; })[0];
      var name = taken ? taken.textContent : 'that meeting';
      if (taken) { taken.classList.add('is-out'); setTimeout(function () { taken.remove(); }, 440); }
      setTimeout(function () {
        var l = document.createElement('div');
        l.className = 'ct-block is-lunch is-drop';
        l.setAttribute('data-slot', LUNCH);
        l.style.setProperty('--slot', LUNCH);
        l.textContent = 'Lunch (Protected)';
        col.appendChild(l);
        count();
        free.textContent = 'Lunch protected';
        root.classList.remove('is-full');
      }, 300);
      clear.hidden = true;
      status.textContent = 'Lunch protected. ' + name + ' moved to tomorrow, where it will also be fine.';
    });
    count();
  }

  window.initLineClear = initLineClear;
  function boot() { document.querySelectorAll('[data-mi="line-clear"]').forEach(initLineClear); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
