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

  function initCancelDodge(root) {
    if (!root || root.__miCancelDodge) return;
    root.__miCancelDodge = true;
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
