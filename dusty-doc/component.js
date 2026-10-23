/* Dusty Doc — vanilla JS. Auto-initializes every [data-mi="dusty-doc"].
   Dust specks live on a canvas over the page. Scrolling blows a share of them off; a fast swipe blows away the
   ones under the pointer. Show it only for files untouched for a long time. Call window.initDustyDoc(el) for later elements. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initDustyDoc(root) {
    if (!root || root.__miDust) return;
    root.__miDust = true;
    var page = root.querySelector('.dd-page'), scroll = root.querySelector('.dd-scroll'), canvas = root.querySelector('.dd-dust');
    var status = root.querySelector('.dd-status'), again = root.querySelector('.dd-again');
    var N = Number(root.getAttribute('data-specks')) || 520;
    // Dust colors come from the Outcraft tokens (Olive and Stone), read as "r,g,b".
    function tok(name) { var p = document.createElement('span'); p.style.cssText = 'display:none;color:var(--' + name + ')'; root.appendChild(p); var m = getComputedStyle(p).color.match(/[\d.]+/g); root.removeChild(p); return m ? m.slice(0, 3).join(',') : '128,128,128'; }
    var TONES = [tok('olive'), tok('stone')];
    var ctx = canvas.getContext('2d'), dpr = 1, W = 0, H = 0, specks = [], stuck = 0, raf = 0, lastTop = 0, last = null, done = false;

    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = page.clientWidth; H = page.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      specks = [];
      for (var i = 0; i < N; i++) {
        var big = Math.random() < 0.08;
        specks.push({ x: Math.random() * W, y: Math.random() * H, r: big ? 1.6 + Math.random() * 1.4 : 0.5 + Math.random() * 1.1,
          a: 0.35 + Math.random() * 0.5, tone: TONES[Math.random() < 0.5 ? 0 : 1], vx: 0, vy: 0, free: false });
      }
      stuck = N; done = false;
      root.classList.remove('is-web-gone');
      root.style.setProperty('--dd-age', 1);
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < specks.length; i++) {
        var s = specks[i];
        ctx.fillStyle = 'rgba(' + s.tone + ',' + s.a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
    }

    function loop() {
      var moving = false;
      for (var i = specks.length - 1; i >= 0; i--) {
        var s = specks[i];
        if (!s.free) continue;
        s.x += s.vx; s.y += s.vy; s.vx *= 0.96; s.vy = s.vy * 0.96 + 0.02; s.a -= 0.012;
        if (s.a <= 0 || s.x < -10 || s.x > W + 10 || s.y < -10 || s.y > H + 10) specks.splice(i, 1);
        else moving = true;
      }
      draw();
      raf = moving ? requestAnimationFrame(loop) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }

    function release(s, vx, vy) {
      if (s.free) return;
      s.free = true; stuck--;
      s.vx = vx + (Math.random() - 0.5) * 2.5; s.vy = vy + (Math.random() - 0.5) * 2.5;
    }

    function progress() {
      var age = stuck / N;
      root.style.setProperty('--dd-age', age.toFixed(3));
      if (age < 0.45) root.classList.add('is-web-gone');
      if (!done && age < 0.04) {
        done = true;
        specks.forEach(function (s) { release(s, 0, -1); });
        root.style.setProperty('--dd-age', 0);
        status.textContent = 'Good as new. It still says “Q3 2022” though.';
        again.hidden = false;
      }
      kick();
    }

    // Scrolling: each 10px blows roughly 12% of what's left, upward or downward with the motion.
    scroll.addEventListener('scroll', function () {
      var dy = scroll.scrollTop - lastTop; lastTop = scroll.scrollTop;
      var share = Math.min(0.5, Math.abs(dy) * 0.012);
      var dir = dy > 0 ? -1 : 1;
      specks.forEach(function (s) { if (!s.free && Math.random() < share) release(s, (Math.random() - 0.5) * 3, dir * (2 + Math.abs(dy) * 0.08)); });
      progress();
    }, { passive: true });

    // Swiping: fast pointer moves blow away nearby specks in the direction of travel.
    page.addEventListener('pointermove', function (e) {
      var r = page.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now();
      if (last) {
        var dt = Math.max(1, now - last.t), vx = (x - last.x) / dt, vy = (y - last.y) / dt, sp = Math.hypot(vx, vy);
        if (sp > 0.6) {
          specks.forEach(function (s) {
            if (!s.free && Math.hypot(s.x - x, s.y - y) < 46) release(s, vx * 9, vy * 9);
          });
          progress();
        }
      }
      last = { x: x, y: y, t: now };
    });
    page.addEventListener('pointerleave', function () { last = null; });

    again.addEventListener('click', function () {
      again.hidden = true;
      status.textContent = 'Three more years pass…';
      if (reduce.matches) { seed(); return; }
      // Dust settles back in over a second.
      var full = N; N = 0; seed(); N = full;
      var added = 0;
      (function settle() {
        for (var k = 0; k < 26 && added < N; k++, added++) {
          specks.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() < 0.08 ? 1.6 + Math.random() * 1.4 : 0.5 + Math.random() * 1.1,
            a: 0.35 + Math.random() * 0.5, tone: TONES[Math.random() < 0.5 ? 0 : 1], vx: 0, vy: 0, free: false });
        }
        stuck = specks.filter(function (s) { return !s.free; }).length;
        root.style.setProperty('--dd-age', (added / N).toFixed(3));
        draw();
        if (added < N) requestAnimationFrame(settle);
        else { done = false; status.textContent = 'Scroll or swipe across it to blow the dust off.'; }
      })();
    });

    size(); seed();
    if ('ResizeObserver' in window) new ResizeObserver(function () { var w = W, h = H; size(); if (w && h) { specks.forEach(function (s) { s.x *= W / w; s.y *= H / h; }); } draw(); }).observe(page);
  }

  window.initDustyDoc = initDustyDoc;
  function boot() { document.querySelectorAll('[data-mi="dusty-doc"]').forEach(initDustyDoc); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
