/* Friday Deploy Hard Hat — vanilla JS. Auto-initializes every [data-mi="friday-deploy"].
   The demo uses a pretend clock; in production, call root.setRisky(isFridayAfter4pm()) yourself.
   Risky deploys need a press-and-hold (data-hold ms). Call window.initFridayDeploy(el) for later elements. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initFridayDeploy(root) {
    if (!root || root.__miFriday) return;
    root.__miFriday = true;
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
