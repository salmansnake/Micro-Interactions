/* Over-the-Shoulder Cursor — vanilla JS. Auto-initializes every [data-mi="shoulder-cursor"].
   The demo drives a teammate's cursor with a small script: it wanders, then settles on your paragraph. After 2.5s
   it puts on glasses; after 5s it leans in. Typing startles it away. In a real app, feed it live cursor positions.
   Call window.initShoulderCursor(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initShoulderCursor(root) {
    if (!root || root.__miShoulder) return;
    root.__miShoulder = true;
    var name = root.getAttribute('data-name') || 'They';
    var doc = root.querySelector('.oc-doc'), edit = root.querySelector('.oc-edit'), other = root.querySelector('.oc-other');
    var cur = root.querySelector('.oc-cursor'), status = root.querySelector('.oc-status');
    var pos = { x: 0, y: 0 }, target = { x: 0, y: 0 }, speed = 0.06, scale = 1, targetScale = 1;
    var phase = 'idle', since = 0, shown = 0, raf = 0, timers = [], running = false;

    function set(x, y, sp) { target.x = x; target.y = y; speed = sp || 0.06; }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearAll() { timers.forEach(clearTimeout); timers = []; }
    function box(el) { var d = doc.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - d.left, y: r.top - d.top, w: r.width, h: r.height }; }

    function frame(now) {
      pos.x += (target.x - pos.x) * speed;
      pos.y += (target.y - pos.y) * speed;
      scale += (targetScale - scale) * 0.08;
      cur.style.setProperty('--x', pos.x.toFixed(1) + 'px');
      cur.style.setProperty('--y', pos.y.toFixed(1) + 'px');
      cur.style.setProperty('--s', scale.toFixed(3));
      if (phase === 'reading') {
        var secs = (now - since) / 1000;
        if (secs > 2.5 && !root.classList.contains('is-reading')) { root.classList.add('is-reading'); status.textContent = name + ' is reading over your shoulder.'; }
        if (secs > 5) {
          root.classList.add('is-squinting');
          targetScale = 1.18;
          var whole = Math.floor(secs);
          if (whole !== shown && whole % 2 === 0) { shown = whole; status.textContent = name + ' has been reading this sentence for ' + whole + ' seconds.'; }
          // Creep along the line, word by word.
          var b = box(edit);
          target.x = Math.min(b.x + b.w - 40, target.x + 0.12);
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function wander() {
      clearAll();
      phase = 'wander';
      root.classList.remove('is-reading', 'is-squinting', 'is-startled');
      targetScale = 1;
      var d = doc.getBoundingClientRect(), o = box(other), e = box(edit);
      set(o.x + o.w * 0.6, o.y + 6, 0.05);
      status.textContent = name + ' is in this document.';
      later(function () { set(d.width * 0.75, 18, 0.05); }, 1200);
      later(function () {
        set(e.x + e.w * 0.32, e.y + 14, 0.045);
        later(function () { phase = 'reading'; since = performance.now(); }, 900);
      }, 2400);
    }

    function startle() {
      if (phase !== 'reading' && phase !== 'wander') return;
      clearAll();
      phase = 'startled';
      root.classList.add('is-startled');
      root.classList.remove('is-squinting');
      targetScale = 1;
      var d = doc.getBoundingClientRect();
      set(d.width - 60, d.height - 40, reduce.matches ? 1 : 0.22);
      status.textContent = name + ' suddenly remembered something else.';
      later(wander, 4200);
    }

    edit.addEventListener('input', startle);
    edit.addEventListener('keydown', function (e) { if (e.key.length === 1) startle(); });

    function start() {
      if (running) return;
      running = true;
      var d = doc.getBoundingClientRect();
      pos.x = target.x = d.width - 50; pos.y = target.y = d.height - 30;
      raf = requestAnimationFrame(frame);
      wander();
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en.some(function (x) { return x.isIntersecting; })) { io.disconnect(); start(); }
      }, { threshold: 0.4 });
      io.observe(root);
    } else start();
  }

  window.initShoulderCursor = initShoulderCursor;
  function boot() { document.querySelectorAll('[data-mi="shoulder-cursor"]').forEach(initShoulderCursor); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
