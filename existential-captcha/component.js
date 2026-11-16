/* Existential Captcha — vanilla JS. Auto-initializes every [data-mi="existential-captcha"].
   Ticking the box starts a spinner and a run of second thoughts, one every 900ms, then asks whether you're sure.
   Either answer ends with a tick; after that the box stays checked. Call window.initExistentialCaptcha(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var THOUGHTS = ['Hmm. How would I know, though?', 'I did pass a test like this last week.', 'Do robots dream? I had a dream once.', 'Are any of us really not robots?'];

  function initExistentialCaptcha(root) {
    if (!root || root.__miExc) return;
    root.__miExc = true;
    var check = root.querySelector('.exc-check'), list = root.querySelector('.exc-thoughts'), pick = root.querySelector('.exc-pick');
    var sure = root.querySelector('.exc-sure'), think = root.querySelector('.exc-think'), status = root.querySelector('.exc-status');
    var state = 'idle', timers = [];

    function later(fn, ms) { timers.push(setTimeout(fn, reduce.matches ? Math.min(ms, 300) : ms)); }
    function verify(text) {
      state = 'done'; pick.hidden = true;
      root.classList.remove('is-thinking'); root.classList.add('is-settled');
      check.setAttribute('aria-checked', 'true'); check.setAttribute('aria-disabled', 'true');
      status.textContent = text;
      check.focus({ preventScroll: true });
    }

    check.addEventListener('click', function () {
      if (state !== 'idle') return;
      state = 'thinking';
      root.classList.add('is-thinking');
      THOUGHTS.forEach(function (t, i) {
        later(function () { var li = document.createElement('li'); li.textContent = t; list.appendChild(li); }, 900 + i * 900);
      });
      later(function () { pick.hidden = false; sure.focus({ preventScroll: true }); }, 900 + THOUGHTS.length * 900);
    });
    sure.addEventListener('click', function () { verify('Verified. Probably.'); });
    think.addEventListener('click', function () {
      pick.hidden = true;
      status.textContent = 'Take your time. I’ll be here. I’m always\u00a0here.';
      later(function () { verify('Verified anyway. We’re in this together.'); }, 2400);
    });
  }

  window.initExistentialCaptcha = initExistentialCaptcha;
  function boot() { document.querySelectorAll('[data-mi="existential-captcha"]').forEach(initExistentialCaptcha); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
