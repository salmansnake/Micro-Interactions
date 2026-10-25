/* Friday Deploy Hard Hat — vanilla JS. Auto-initializes every [data-mi="friday-deploy"].
   The demo uses a pretend clock; in production, call root.setRisky(isFridayAfter4pm()) yourself.
   Risky deploys need a press-and-hold (data-hold ms). Call window.initFridayDeploy(el) for later elements. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  function initFridayDeploy(root) {
    if (!root || root.__miFriday) return;
    root.__miFriday = true;
    evenLines(root);
    var seg = root.querySelector('.fy-seg'), buttons = Array.prototype.slice.call(seg.querySelectorAll('button'));
    var deploy = root.querySelector('.fy-deploy'), label = root.querySelector('.fy-label'), fill = root.querySelector('.fy-fill');
    var warn = root.querySelector('.fy-warn'), later = root.querySelector('.fy-later'), status = root.querySelector('.fy-status');
    var oncall = root.getAttribute('data-oncall') || 'Whoever is on call';
    var holdMs = Number(root.getAttribute('data-hold')) || 2000;
    var risky = false, day = '', time = '', t0 = 0, raf = 0, holding = false, done = false;

    function setLabel() { label.textContent = done ? 'Deployed' : risky ? (holding ? 'Keep Holding…' : 'Hold to Deploy Anyway') : 'Deploy'; }

    function setRisky(on) {
      risky = on; done = false;
      root.classList.remove('is-done', 'is-leaving');
      root.classList.toggle('is-risky', on);
      warn.textContent = on ? 'It’s ' + time + ' on a ' + day + '. ' + oncall + ' is on call this weekend, and has plans.' : '';
      later.hidden = !on;
      fill.style.width = '0';
      status.textContent = '';
      setLabel();
    }

    function pick(i, focus) {
      var b = buttons[i];
      seg.style.setProperty('--i', i);
      buttons.forEach(function (x, k) { x.setAttribute('aria-checked', k === i ? 'true' : 'false'); x.tabIndex = k === i ? 0 : -1; });
      day = b.getAttribute('data-day'); time = b.getAttribute('data-time');
      setRisky(b.hasAttribute('data-risky'));
      if (focus) b.focus();
    }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { pick(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        pick((i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length, true);
      });
    });

    function finish() {
      done = true; holding = false;
      root.classList.add('is-done');
      fill.style.width = '100%';
      setLabel();
      later.hidden = true;
      warn.textContent = '';
      status.textContent = risky
        ? 'Deployed at ' + time + ' on a ' + day + '. ' + oncall + ' has been notified. ' + oncall + ' is not happy.'
        : 'Deployed to production. Have a lovely ' + day + '.';
    }

    function frame(now) {
      if (!holding) return;
      var p = Math.min(1, (now - t0) / (risky ? holdMs : 700));
      fill.style.width = (p * 100).toFixed(1) + '%';
      if (p >= 1) finish(); else raf = requestAnimationFrame(frame);
    }

    function press() {
      if (done) { setRisky(risky); return; }
      if (holding) return;
      holding = true; t0 = performance.now();
      setLabel();
      raf = requestAnimationFrame(frame);
    }
    function release() {
      if (!holding || !risky) return; // calm days finish on their own after one press
      holding = false;
      cancelAnimationFrame(raf);
      fill.style.transition = 'width 0.3s';
      fill.style.width = '0';
      setTimeout(function () { fill.style.transition = ''; }, 320);
      setLabel();
      status.textContent = 'Hold for ' + Math.round(holdMs / 1000) + ' full seconds. That’s how sure you need to be.';
    }

    deploy.addEventListener('pointerdown', function (e) { if (e.button === 0) { deploy.setPointerCapture && deploy.setPointerCapture(e.pointerId); press(); } });
    deploy.addEventListener('pointerup', release);
    deploy.addEventListener('pointercancel', release);
    deploy.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(); } });
    deploy.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); release(); } });

    later.addEventListener('click', function () {
      root.classList.add('is-leaving');
      later.hidden = true;
      warn.textContent = '';
      status.textContent = 'Scheduled for Monday 10:00 AM. Go enjoy your weekend.';
      setTimeout(function () { root.classList.remove('is-risky'); }, reduce.matches ? 0 : 500);
      label.textContent = 'Deploys Monday 10:00 AM';
      done = true;
    });

    root.setRisky = setRisky;
    var start = buttons.findIndex(function (b) { return b.getAttribute('aria-checked') === 'true'; });
    pick(start < 0 ? 0 : start);
  }

  window.initFridayDeploy = initFridayDeploy;
  function boot() { document.querySelectorAll('[data-mi="friday-deploy"]').forEach(initFridayDeploy); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
