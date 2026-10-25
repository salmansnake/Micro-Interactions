/* Step Fold — vanilla JS. Auto-initializes every [data-mi="step-fold"].
   Each .fo-step has data-step and data-title; summary() below says what its chip shows.
   Call window.initStepFold(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var PRICES = { Starter: 12, Pro: 29, Team: 79 };

  function initStepFold(root) {
    if (!root || root.__miFold) return;
    root.__miFold = true;
    var steps = Array.prototype.slice.call(root.querySelectorAll('.fo-step'));
    var chips = root.querySelector('.fo-chips');
    var done = root.querySelector('.fo-done');
    var total = root.querySelector('.fo-total');
    var seatsOut = root.querySelector('.fo-seats');
    var email = root.querySelector('.fo-email');
    var seats = 5;
    var finished = {}; // step -> true
    var current = 0;

    function value(step) {
      var k = step.getAttribute('data-step');
      if (k === 'plan') return root.querySelector('input[name="fo-plan"]:checked').value;
      if (k === 'seats') return seats + (seats === 1 ? ' seat' : ' seats');
      if (k === 'email') return email.value.trim();
      return '';
    }

    function renderChips() {
      chips.replaceChildren();
      steps.forEach(function (s, i) {
        if (!finished[i] || i === current) return;
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'fo-chip';
        var n = document.createElement('i'); n.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
        var label = document.createElement('small'); label.textContent = s.getAttribute('data-title');
        var b = document.createElement('b'); b.textContent = value(s);
        c.append(n, label, b);
        c.setAttribute('aria-label', 'Edit ' + s.getAttribute('data-title') + ': ' + value(s));
        c.addEventListener('click', function () { open(i); });
        chips.appendChild(c);
      });
    }

    function layout() {
      var allDone = steps.every(function (s, i) { return finished[i]; }) && current === -1;
      steps.forEach(function (s, i) {
        s.hidden = !!finished[i] && i !== current;
        s.classList.toggle('is-waiting', !finished[i] && i !== current);
      });
      done.hidden = !allDone;
      if (allDone) {
        var plan = root.querySelector('input[name="fo-plan"]:checked').value;
        var b = document.createElement('b');
        b.textContent = '$' + (PRICES[plan] * seats).toLocaleString();
        total.replaceChildren(b, document.createTextNode(' per month after a 14-day trial. Billed to ' + email.value.trim() + '.'));
      }
      renderChips();
    }

    function open(i, quiet) {
      var prev = current;
      current = i;
      layout();
      var s = steps[i];
      if (!reduce.matches) { s.classList.remove('is-unfolding'); void s.offsetWidth; s.classList.add('is-unfolding'); }
      var focusable = s.querySelector('input, button');
      if (focusable && !quiet) focusable.focus({ preventScroll: true });
      return prev;
    }

    function complete(i) {
      if (steps[i].getAttribute('data-step') === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        email.setAttribute('aria-invalid', 'true'); email.focus(); return;
      }
      email.removeAttribute('aria-invalid');
      finished[i] = true;
      var next = steps.findIndex(function (s, k) { return !finished[k]; });
      var go = function () {
        steps[i].classList.remove('is-folding');
        if (next === -1) { current = -1; layout(); root.querySelector('.fo-start').focus({ preventScroll: true }); }
        else open(next);
      };
      if (reduce.matches) { go(); return; }
      steps[i].classList.add('is-folding');
      setTimeout(go, 400);
    }

    steps.forEach(function (s, i) {
      s.querySelector('.fo-next').addEventListener('click', function () { complete(i); });
    });
    root.querySelector('.fo-minus').addEventListener('click', function () { seats = Math.max(1, seats - 1); seatsOut.textContent = seats; });
    root.querySelector('.fo-plus').addEventListener('click', function () { seats = Math.min(99, seats + 1); seatsOut.textContent = seats; });
    email.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); complete(steps.indexOf(email.closest('.fo-step'))); } });
    root.querySelector('.fo-start').addEventListener('click', function () {
      total.textContent = 'Trial started. Welcome to ' + root.querySelector('input[name="fo-plan"]:checked').value + '.';
      setTimeout(function () { finished = {}; open(0); }, 1800);
    });
    open(0, true);
  }

  window.initStepFold = initStepFold;
  function boot() { document.querySelectorAll('[data-mi="step-fold"]').forEach(initStepFold); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
