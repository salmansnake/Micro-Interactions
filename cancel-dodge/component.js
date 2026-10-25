/* Cancel, Eventually — vanilla JS. Auto-initializes every [data-mi="cancel-dodge"].
   Hover (or tap, or press Enter on) Cancel Subscription and it swaps places with Keep My Plan: Cancel runs left,
   Keep runs right, and back again. While they're running neither can be clicked. After five swaps Cancel gives up,
   both walk home slowly, and Cancel works normally. Call window.initCancelDodge(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var TRIES = 5;
  var QUIPS = ['Whoa. Careful.', 'Are you sure sure?', 'We can talk about this.', 'Think of the 3 teammates.', 'Last chance to stay…'];

  function ms(el, name, fallback) {
    var v = getComputedStyle(el).getPropertyValue(name).trim();
    var n = parseFloat(v);
    if (!n) return fallback;
    return /ms$/.test(v) ? n : n * 1000;
  }

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

  function initCancelDodge(root) {
    if (!root || root.__miCancelDodge) return;
    root.__miCancelDodge = true;
    evenLines(root);
    var main = root.querySelector('.cn-main'), done = root.querySelector('.cn-done');
    var btn = root.querySelector('.cn-cancel');
    var keep = root.querySelector('.cn-keep'), again = root.querySelector('.cn-again');
    var quip = root.querySelector('.cn-quip');
    var tries = 0, swapped = false, running = false, free = false, timers = [];

    function later(fn, t) { timers.push(setTimeout(fn, t)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function reach() { return btn.offsetLeft - keep.offsetLeft; }       // one button width plus the gap
    function place(on) {
      var d = on ? reach() : 0;
      root.style.setProperty('--cn-x', (-d).toFixed(1) + 'px');           // Cancel runs left
      root.style.setProperty('--cn-keep-x', d.toFixed(1) + 'px');         // Keep My Plan runs right
    }
    function say(t) {
      quip.textContent = t;
      quip.classList.remove('is-new'); void quip.offsetWidth; if (t) quip.classList.add('is-new');
    }
    function plead() {
      keep.classList.remove('is-plead'); void keep.offsetWidth; keep.classList.add('is-plead');
    }

    function moveTo(on, dur, done_) {
      if (reduce.matches) {
        // No travel: both blink out and reappear swapped.
        root.classList.add('is-blink');
        later(function () { place(on); root.classList.remove('is-blink'); }, ms(root, '--duration-reduced', 120));
        later(done_, ms(root, '--duration-reduced', 120) * 2);
      } else {
        place(on);
        later(done_, dur);
      }
    }

    function dodge() {
      if (running || free) return;
      tries += 1;
      swapped = !swapped;                              // Cancel left and Keep right, then back, alternating
      running = true;
      root.classList.add('is-running', swapped ? 'is-run-l' : 'is-run-r');
      say(QUIPS[tries - 1] || QUIPS[QUIPS.length - 1]);
      plead();
      moveTo(swapped, ms(root, '--spring-ui-duration', 460), function () {
        root.classList.remove('is-running', 'is-run-l', 'is-run-r');
        running = false;
        if (tries >= TRIES) { tire(); return; }
        // Cursor caught up while it was landing: off it goes again.
        if (btn.matches(':hover')) dodge();
      });
    }

    function tire() {
      running = true;
      say('Fine. It’s tired.');
      root.classList.add('is-running', 'is-walking');
      swapped = false;
      moveTo(false, ms(root, '--spring-panel-duration', 530) * 2, function () {
        root.classList.remove('is-running', 'is-walking');
        running = false; free = true;
        root.classList.add('is-free');
        say('Okay. It’s all yours.');
        if (!reduce.matches) {
          root.classList.add('is-tired');
          later(function () { root.classList.remove('is-tired'); }, ms(root, '--duration-slower', 480) * 3);
        }
      });
    }

    function cancel() {
      main.hidden = true; done.hidden = false;
      done.focus({ preventScroll: true });
    }

    function reset() {
      clearTimers();
      tries = 0; swapped = false; running = false; free = false;
      root.classList.remove('is-running', 'is-run-l', 'is-run-r', 'is-walking', 'is-tired', 'is-blink', 'is-free');
      place(false);
      done.hidden = true; main.hidden = false;
    }

    // Mouse and pen: just arriving on it is enough to make it run.
    btn.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') dodge(); });
    // Touch: a tap is an attempt. Swallow it so no click lands.
    btn.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' && !free) { e.preventDefault(); dodge(); }
    });
    btn.addEventListener('click', function (e) {
      if (running) { e.preventDefault(); return; }       // clicks mid-run do nothing
      if (!free) { e.preventDefault(); if (e.detail === 0) dodge(); return; }   // keyboard: Enter counts as a try
      cancel();
    });
    keep.addEventListener('click', function (e) { if (running) { e.preventDefault(); return; } say('Great choice. It was the only choice.'); plead(); });
    again.addEventListener('click', function () {
      reset(); say('Welcome back. We knew you would.');
      keep.focus({ preventScroll: true });
    });
    window.addEventListener('resize', function () { if (swapped) place(true); });
  }

  window.initCancelDodge = initCancelDodge;
  function boot() { document.querySelectorAll('[data-mi="cancel-dodge"]').forEach(initCancelDodge); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
