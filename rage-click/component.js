/* Rage Click Detector — vanilla JS. Auto-initializes every [data-mi="rage-click"].
   Four or more clicks inside 1.5 seconds on a busy button counts as a rage click. Only one job ever starts.
   Replace startJob() with your real request. Call window.initRageClick(el) for elements added later. */
(function () {
  'use strict';
  var RAGE_CLICKS = 4, RAGE_WINDOW = 1500;

  function initRageClick(root) {
    if (!root || root.__miRage) return;
    root.__miRage = true;
    var btn = root.querySelector('.rc-btn'), label = root.querySelector('.rc-label'), count = root.querySelector('.rc-count');
    var bar = root.querySelector('.rc-bar i'), msg = root.querySelector('.rc-msg');
    var wrap = root.querySelector('.rc-ball-wrap'), ball = root.querySelector('.rc-ball'), squeezesEl = root.querySelector('.rc-squeezes');
    var duration = Number(root.getAttribute('data-duration')) || 5000;
    var file = root.getAttribute('data-file') || 'Report.pdf';
    var state = 'idle', t0 = 0, raf = 0, clicks = [], extra = 0, raged = false, preached = false, squeezes = 0, holding = false;

    function left() { return Math.max(1, Math.round((duration - (performance.now() - t0)) / 1000)); }
    function secs(n) { return n === 1 ? 'about a second' : 'about ' + n + ' seconds'; }

    function tick(now) {
      var p = Math.min(1, (now - t0) / duration);
      bar.style.width = (p * 100).toFixed(2) + '%';
      if (p < 1) raf = requestAnimationFrame(tick); else finish();
    }

    function startJob() {
      state = 'busy';
      root.classList.add('is-busy');
      btn.setAttribute('aria-disabled', 'true');
      label.textContent = 'Exporting…';
      msg.textContent = '';
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function finish() {
      state = 'done';
      root.classList.remove('is-busy');
      root.classList.add('is-done');
      btn.removeAttribute('aria-disabled');
      label.textContent = 'Download PDF';
      count.classList.remove('is-on');
      root.classList.remove('is-raging');
      msg.textContent = raged ? 'Done. It was always going to take ' + Math.round(duration / 1000) + ' seconds.' : 'Your report is ready.';
    }

    function reset() {
      state = 'idle'; clicks = []; extra = 0; raged = false; preached = false; squeezes = 0;
      root.classList.remove('is-done', 'is-busy', 'is-raging');
      label.textContent = 'Export PDF';
      bar.style.width = '0';
      wrap.hidden = true;
      squeezesEl.textContent = '0 squeezes';
      msg.textContent = '';
    }

    function nudge(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

    btn.addEventListener('click', function () {
      if (state === 'idle') { startJob(); return; }
      if (state === 'done') {
        msg.textContent = 'Downloaded “' + file + '.”';
        setTimeout(reset, 1600);
        state = 'leaving';
        return;
      }
      if (state !== 'busy') return;
      // Every extra click while busy is counted, never queued.
      var now = performance.now();
      extra++;
      clicks.push(now);
      clicks = clicks.filter(function (t) { return now - t < RAGE_WINDOW; });
      count.textContent = '×' + (extra + 1);
      count.classList.add('is-on');
      nudge(count, 'is-bump');
      nudge(btn, 'is-nudge');
      if (!raged && clicks.length >= RAGE_CLICKS) {
        raged = true;
        root.classList.add('is-raging');
        msg.textContent = 'Okay, okay. I heard you. It’s still exporting, ' + secs(left()) + ' left. Only one export was started.';
        wrap.hidden = false;
      } else if (raged && !preached && extra >= 12) {
        preached = true;
        msg.textContent = 'Clicking faster won’t make it faster. But it’s sweet that you care.';
      } else if (!raged) {
        msg.textContent = 'Still working on it. ' + secs(left()).replace(/^a/, 'A') + ' left.';
      }
    });

    function squeeze() { if (holding) return; holding = true; ball.classList.add('is-squeeze'); }
    function release() {
      if (!holding) return;
      holding = false;
      ball.classList.remove('is-squeeze');
      squeezes++;
      squeezesEl.textContent = squeezes + (squeezes === 1 ? ' squeeze' : ' squeezes') + (squeezes >= 10 ? '. You’re doing great.' : '');
    }
    ball.addEventListener('pointerdown', function (e) { if (e.button === 0) { ball.setPointerCapture && ball.setPointerCapture(e.pointerId); squeeze(); } });
    ball.addEventListener('pointerup', release);
    ball.addEventListener('pointercancel', release);
    ball.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); squeeze(); } });
    ball.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); release(); } });
  }

  window.initRageClick = initRageClick;
  function boot() { document.querySelectorAll('[data-mi="rage-click"]').forEach(initRageClick); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
