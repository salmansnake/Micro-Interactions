/* Unsure Underline — vanilla JS. Auto-initializes every [data-mi="unsure-underline"].
   Mark words as <span class="uu-w" data-c="0.42" data-alts="a,b">word</span> (c = model confidence 0–1).
   Call window.initUnsureUnderline(el) for elements added later. */
(function () {
  'use strict';

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

  function initUnsureUnderline(root) {
    if (!root || root.__miUnsure) return;
    root.__miUnsure = true;
    evenLines(root);
    var words = Array.prototype.slice.call(root.querySelectorAll('.uu-w'));
    var pop = root.querySelector('.uu-pop');
    var confText = root.querySelector('.uu-conf-text');
    var meter = root.querySelector('.uu-meter');
    var alts = root.querySelector('.uu-alts');
    var toggle = root.querySelector('.uu-on');
    var status = root.querySelector('.uu-status');
    var openWord = null;

    function unsureLeft() { return words.filter(function (w) { return !w.classList.contains('is-sure'); }).length; }
    function say() {
      var n = unsureLeft();
      status.textContent = n ? n + (n === 1 ? ' word to check. ' : ' words to check. ') + 'Darker underlines are less certain.' : 'Every word checked. Ready to send.';
    }

    words.forEach(function (w) {
      var c = Number(w.getAttribute('data-c'));
      w.style.setProperty('--u', (1 - c).toFixed(2));
      w.tabIndex = 0;
      w.setAttribute('role', 'button');
      w.setAttribute('aria-haspopup', 'dialog');
      w.setAttribute('aria-label', w.textContent + ', ' + Math.round(c * 100) + '% sure. Show alternatives.');
    });

    function close() {
      if (!openWord) return;
      openWord.classList.remove('is-open');
      pop.hidden = true;
      var w = openWord; openWord = null;
      return w;
    }

    function settle(w, text) {
      var changed = text !== w.textContent;
      w.textContent = text;
      w.classList.add('is-sure');
      w.setAttribute('data-c', '1');
      w.removeAttribute('role'); w.removeAttribute('aria-haspopup'); w.removeAttribute('aria-label');
      w.tabIndex = -1;
      w.classList.remove('is-swap', 'is-fixed'); void w.offsetWidth;
      if (changed) w.classList.add('is-swap');
      setTimeout(function () { w.classList.add('is-fixed'); }, changed ? 300 : 0);
      say();
      var next = words.filter(function (x) { return !x.classList.contains('is-sure'); })[0];
      if (next) next.focus({ preventScroll: true });
    }

    function open(w) {
      if (root.classList.contains('is-hidden') || w.classList.contains('is-sure')) return;
      close();
      openWord = w;
      w.classList.add('is-open');
      var c = Number(w.getAttribute('data-c'));
      confText.textContent = Math.round(c * 100) + '% sure';
      meter.style.setProperty('--c', c);
      alts.replaceChildren();
      var keep = document.createElement('button');
      keep.type = 'button'; keep.className = 'is-keep'; keep.textContent = 'Keep “' + w.textContent + '”';
      keep.addEventListener('click', function () { close(); settle(w, w.textContent); });
      alts.appendChild(keep);
      w.getAttribute('data-alts').split(',').forEach(function (a) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = a.trim();
        b.addEventListener('click', function () { close(); settle(w, a.trim()); });
        alts.appendChild(b);
      });
      pop.hidden = false;
      var o = root.getBoundingClientRect(), r = w.getBoundingClientRect();
      var left = Math.max(12, Math.min(o.width - pop.offsetWidth - 12, r.left - o.left + r.width / 2 - pop.offsetWidth / 2));
      var top = r.top - o.top - pop.offsetHeight - 8;
      if (top < 8) top = r.bottom - o.top + 8;
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      keep.focus({ preventScroll: true });
    }

    root.addEventListener('click', function (e) {
      var w = e.target.closest('.uu-w');
      if (w) { openWord === w ? close() : open(w); }
    });
    root.addEventListener('keydown', function (e) {
      var w = e.target.closest('.uu-w');
      if (w && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(w); }
      if (e.key === 'Escape' && openWord) { var back = close(); back.focus(); }
    });
    document.addEventListener('pointerdown', function (e) {
      if (openWord && !pop.contains(e.target) && !openWord.contains(e.target)) close();
    });
    toggle.addEventListener('change', function () {
      root.classList.toggle('is-hidden', !toggle.checked);
      close();
      words.forEach(function (w) { if (!w.classList.contains('is-sure')) w.tabIndex = toggle.checked ? 0 : -1; });
      status.textContent = toggle.checked ? '' : 'Confidence hidden.';
      if (toggle.checked) say();
    });
    say();
  }

  window.initUnsureUnderline = initUnsureUnderline;
  function boot() { document.querySelectorAll('[data-mi="unsure-underline"]').forEach(initUnsureUnderline); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
