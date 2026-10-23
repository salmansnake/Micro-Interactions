/* LGTM (Didn't Look) — vanilla JS. Auto-initializes every [data-mi="lgtm-stamp"].
   Files viewed follow how far the diff is scrolled. Approving before data-honest-seconds with under 80% of
   files viewed stamps "(Didn't Look)". Call window.initLgtmStamp(el) for elements added later. */
(function () {
  'use strict';

  function initLgtmStamp(root) {
    if (!root || root.__miLgtm) return;
    root.__miLgtm = true;
    var files = Number(root.getAttribute('data-files')) || 48;
    var honestSecs = Number(root.getAttribute('data-honest-seconds')) || 20;
    var diff = root.querySelector('.lg-diff'), viewedEl = root.querySelector('.lg-viewed');
    var timer = root.querySelector('.lg-timer'), approve = root.querySelector('.lg-approve');
    var sub = root.querySelector('.lg-stamp-sub'), status = root.querySelector('.lg-status'), undo = root.querySelector('.lg-undo');
    var opened = 0, viewed = 0, raf = 0, stamped = false;

    function tick() {
      if (!opened || stamped) return;
      timer.textContent = 'Open for ' + ((performance.now() - opened) / 1000).toFixed(1) + ' seconds';
      raf = requestAnimationFrame(tick);
    }
    function start() { opened = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }

    diff.addEventListener('scroll', function () {
      var max = diff.scrollHeight - diff.clientHeight;
      var v = Math.round((max > 0 ? diff.scrollTop / max : 1) * files);
      if (v > viewed) { viewed = v; viewedEl.textContent = viewed; }
    }, { passive: true });

    approve.addEventListener('click', function () {
      if (stamped) return;
      stamped = true;
      cancelAnimationFrame(raf);
      var secs = opened ? (performance.now() - opened) / 1000 : 0;
      var honest = viewed >= files * 0.8 || secs >= honestSecs;
      root.classList.toggle('is-honest', honest);
      sub.textContent = honest ? '(Actually Looked)' : '(Didn’t Look)';
      root.classList.remove('is-stamped'); void root.offsetWidth; root.classList.add('is-stamped');
      approve.disabled = true;
      status.textContent = honest
        ? 'Approved after viewing ' + viewed + ' of ' + files + ' files. A rare and beautiful thing.'
        : 'Approved in ' + secs.toFixed(1) + ' seconds with ' + viewed + ' of ' + files + ' files viewed. Sam is thrilled.';
      undo.hidden = false;
    });

    undo.addEventListener('click', function () {
      stamped = false;
      root.classList.remove('is-stamped', 'is-honest');
      approve.disabled = false;
      status.textContent = '';
      undo.hidden = true;
      approve.focus();
      start();
    });

    // The clock starts when the review is actually on screen.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); }
      }, { threshold: 0.5 });
      io.observe(root);
    } else start();
  }

  window.initLgtmStamp = initLgtmStamp;
  function boot() { document.querySelectorAll('[data-mi="lgtm-stamp"]').forEach(initLgtmStamp); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
