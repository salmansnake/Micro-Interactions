/* Session Fade — vanilla JS. Auto-initializes every [data-mi="session-fade"].
   data-timeout and data-warn are in seconds. Call window.initSessionFade(el) for later elements. */
(function () {
  'use strict';

  function initSessionFade(root) {
    if (!root || root.__miFade) return;
    root.__miFade = true;
    var TIMEOUT = (Number(root.getAttribute('data-timeout')) || 20) * 1000;
    var WARN = (Number(root.getAttribute('data-warn')) || 10) * 1000;
    var screen = root.querySelector('.sf-screen');
    var banner = root.querySelector('.sf-banner');
    var leftEl = root.querySelector('.sf-left');
    var lock = root.querySelector('.sf-lock');
    var ripple = root.querySelector('.sf-ripple');
    var deadline = 0, raf = 0, visible = false, locked = false, lastShown = '', lastFrame = 0;

    function fmt(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

    function tick() {
      raf = 0;
      if (locked) return;
      var now = performance.now();
      if (!visible) { deadline += now - (lastFrame || now); lastFrame = now; raf = requestAnimationFrame(tick); return; } // pause off screen
      lastFrame = now;
      var left = deadline - now;
      root.style.setProperty('--sf-r', Math.max(0, left / TIMEOUT).toFixed(4));
      if (left <= 0) { signOut(); return; }
      if (left <= WARN) {
        if (!root.classList.contains('is-waking')) root.style.setProperty('--sf-p', (1 - left / WARN).toFixed(4));
        if (banner.hidden) banner.hidden = false;
        var txt = fmt(left);
        if (txt !== lastShown) { leftEl.textContent = txt; lastShown = txt; }
      }
      raf = requestAnimationFrame(tick);
    }
    function start() {
      locked = false;
      lock.hidden = true;
      banner.hidden = true;
      deadline = performance.now() + TIMEOUT;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function wake(x, y) {
      if (locked) return;
      var warning = deadline - performance.now() <= WARN;
      deadline = performance.now() + TIMEOUT;
      if (!warning) return;
      banner.hidden = true;
      root.classList.add('is-waking');
      root.style.setProperty('--sf-p', '0');
      setTimeout(function () { root.classList.remove('is-waking'); }, 760);
      var r = screen.getBoundingClientRect();
      root.style.setProperty('--sf-x', (x != null ? x - r.left : r.width / 2) + 'px');
      root.style.setProperty('--sf-y', (y != null ? y - r.top : r.height / 2) + 'px');
      ripple.classList.remove('is-on');
      void ripple.offsetWidth;
      ripple.classList.add('is-on');
    }
    function signOut() {
      locked = true;
      banner.hidden = true;
      root.style.setProperty('--sf-p', '1');
      lock.hidden = false;
      var a = document.activeElement;
      if (!a || a === document.body || root.contains(a)) lock.querySelector('.sf-again').focus({ preventScroll: true });
    }

    screen.addEventListener('pointermove', function (e) { wake(e.clientX, e.clientY); });
    screen.addEventListener('pointerdown', function (e) { wake(e.clientX, e.clientY); });
    root.addEventListener('keydown', function () { wake(); });
    root.querySelector('.sf-stay').addEventListener('click', function (e) { wake(e.clientX, e.clientY); });
    root.querySelector('.sf-again').addEventListener('click', function () {
      root.classList.add('is-waking');
      root.style.setProperty('--sf-p', '0');
      setTimeout(function () { root.classList.remove('is-waking'); }, 760);
      start();
    });

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !deadline) start();
      }, { threshold: 0.4 }).observe(root);
    } else { visible = true; start(); }
  }

  window.initSessionFade = initSessionFade;
  function boot() { document.querySelectorAll('[data-mi="session-fade"]').forEach(initSessionFade); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
