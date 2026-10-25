/* Refill Timer — vanilla JS. Auto-initializes every [data-mi="refill-timer"].
   data-max = credits, data-refill = ms per credit. Call window.initRefillTimer(el) for later elements. */
(function () {
  'use strict';
  var IDEAS = [
    'Yearly billing, with the savings up front',
    'Delete with confidence',
    'Your plan, at a glance',
    'Every change, saved',
    'Shortcuts you will actually use',
    'Pricing that explains itself',
    'Errors that point at the problem',
    'Uploads that know what you dropped'
  ];

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

  function initRefillTimer(root) {
    if (!root || root.__miRefill) return;
    root.__miRefill = true;
    evenLines(root);

    var max = Number(root.getAttribute('data-max')) || 5;
    var refill = Number(root.getAttribute('data-refill')) || 3000;
    var dotsBox = root.querySelector('.rt-dots');
    var left = root.querySelector('.rt-left');
    var out = root.querySelector('.rt-out');
    var btn = root.querySelector('.rt-btn');
    var label = root.querySelector('.rt-label');
    var credits = max;
    var last = 0;
    var raf = 0;
    var ideaIx = 0;
    var shownWhole = max;

    var dots = [];
    for (var i = 0; i < max; i++) {
      var d = document.createElement('span');
      d.className = 'rt-dot';
      d.appendChild(document.createElement('i'));
      dotsBox.appendChild(d);
      dots.push(d);
    }

    function bump(elm, cls) {
      elm.classList.remove(cls);
      void elm.offsetWidth;
      elm.classList.add(cls);
    }

    function render() {
      var whole = Math.floor(credits + 1e-6);
      dots.forEach(function (d, i) {
        var f = Math.max(0, Math.min(1, credits - i));
        d.style.setProperty('--rt-f', f.toFixed(3));
      });
      left.textContent = whole + ' of ' + max;
      var empty = whole < 1;
      root.classList.toggle('is-empty', empty);
      btn.setAttribute('aria-disabled', empty ? 'true' : 'false');
      if (empty) {
        var frac = credits - whole;
        var secs = Math.ceil(((1 - frac) * refill) / 1000);
        label.textContent = 'Next in ' + secs + 's';
        btn.style.setProperty('--rt-p', frac.toFixed(3));
      } else {
        label.textContent = 'Generate';
      }
      if (whole > shownWhole) {
        bump(dots[whole - 1], 'is-ready');
        if (shownWhole === 0) bump(btn, 'is-ready');
      }
      shownWhole = whole;
    }

    function tick(now) {
      raf = 0;
      if (last) credits = Math.min(max, credits + (now - last) / refill);
      last = now;
      render();
      if (credits < max) raf = requestAnimationFrame(tick);
      else last = 0;
    }
    function start() { if (!raf && credits < max) { last = 0; raf = requestAnimationFrame(tick); } }

    btn.addEventListener('click', function () {
      if (credits < 1) return;
      var spent = Math.floor(credits + 1e-6) - 1;
      credits -= 1;
      shownWhole = Math.floor(credits + 1e-6);
      bump(dots[spent], 'is-spent');
      var empty = out.querySelector('.rt-empty');
      if (empty) empty.remove();
      var li = document.createElement('li');
      li.textContent = IDEAS[ideaIx++ % IDEAS.length];
      out.insertBefore(li, out.firstChild);
      while (out.children.length > 3) out.lastChild.remove();
      render();
      start();
    });

    render();
  }

  window.initRefillTimer = initRefillTimer;
  function boot() { document.querySelectorAll('[data-mi="refill-timer"]').forEach(initRefillTimer); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
