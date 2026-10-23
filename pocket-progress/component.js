/* Pocket Progress — vanilla JS. Auto-initializes every [data-mi="pocket-progress"].
   The demo fakes progress over data-duration ms; feed setProgress(0–1) from your real job instead.
   Call window.initPocketProgress(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initPocketProgress(root) {
    if (!root || root.__miPocket) return;
    root.__miPocket = true;
    var DURATION = Number(root.getAttribute('data-duration')) || 9000;
    var exportBtn = root.querySelector('.pp-export');
    var sheet = root.querySelector('.pp-sheet');
    var track = root.querySelector('.pp-track');
    var title = root.querySelector('.pp-sheet-title');
    var sub = root.querySelector('.pp-sheet-sub');
    var pocketBtn = root.querySelector('.pp-pocket');
    var cancelBtn = root.querySelector('.pp-cancel');
    var pill = root.querySelector('.pp-pill');
    var pillText = root.querySelector('.pp-pill-text');
    var status = root.querySelector('.pp-status');
    var p = 0, raf = 0, t0 = 0, running = false, done = false, pocketed = false;

    function setProgress(v) {
      p = Math.max(0, Math.min(1, v));
      root.style.setProperty('--pp-p', p.toFixed(4));
      var pct = Math.round(p * 100);
      track.setAttribute('aria-valuenow', pct);
      if (!done) pillText.textContent = 'Exporting · ' + pct + '%';
      if (p >= 1 && !done) finish();
    }

    function tick(now) {
      raf = 0;
      if (!running) return;
      var k = (now - t0) / DURATION;
      // uneven, like real work: quick start, a slow middle, a quick end
      setProgress(k < 1 ? k + Math.sin(k * Math.PI * 2) * 0.05 * (1 - k) : 1);
      if (running && !done) raf = requestAnimationFrame(tick);
    }

    // Morph one element into another's box (FLIP).
    function morph(fromEl, toEl, ms) {
      if (reduce.matches) return;
      var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      var sx = a.width / b.width, sy = a.height / b.height;
      toEl.animate([
        { transform: 'translate(' + (a.right - b.right) + 'px,' + (a.bottom - b.bottom) + 'px) scale(' + sx + ',' + sy + ')', borderRadius: '22px', opacity: 0.6 },
        { transform: 'none', opacity: 1 }
      ], { duration: ms || 580, easing: 'cubic-bezier(.2,.9,.25,1.08)' });
    }

    function pocket() {
      pocketed = true;
      pill.hidden = false;
      morph(sheet, pill);
      sheet.hidden = true;
      status.textContent = 'Export continues in the background.';
      setTimeout(function () { if (status.textContent.indexOf('background') > -1) status.textContent = ''; }, 2600);
      pill.focus({ preventScroll: true });
    }
    function unpocket() {
      pocketed = false;
      sheet.hidden = false;
      sheet.classList.remove('is-in');
      morph(pill, sheet, 520);
      pill.hidden = true;
      (done ? pocketBtn : pocketBtn).focus({ preventScroll: true });
    }

    function finish() {
      done = true;
      running = false;
      root.classList.add('is-done');
      title.textContent = 'Export Ready';
      sub.textContent = 'workspaces.csv · 12,400 rows · 2.1 MB';
      pocketBtn.textContent = 'Done';
      cancelBtn.hidden = true;
      pillText.textContent = 'Export Ready';
      pill.setAttribute('aria-label', 'Export ready. Open details.');
      status.textContent = 'Your export is ready.';
      if (pocketed) { pill.classList.remove('is-ping'); void pill.offsetWidth; pill.classList.add('is-ping'); }
    }

    function reset() {
      running = false; done = false; pocketed = false;
      cancelAnimationFrame(raf); raf = 0;
      root.classList.remove('is-done');
      sheet.hidden = true; pill.hidden = true;
      title.textContent = 'Exporting 12,400 Rows';
      sub.textContent = 'You can keep working while this runs.';
      pocketBtn.textContent = 'Keep Working';
      cancelBtn.hidden = false;
      pill.setAttribute('aria-label', 'Export in progress. Open details.');
      setProgress(0);
      exportBtn.disabled = false;
    }

    exportBtn.addEventListener('click', function () {
      reset();
      exportBtn.disabled = true;
      sheet.hidden = false;
      sheet.classList.remove('is-in'); void sheet.offsetWidth; sheet.classList.add('is-in');
      running = true;
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
      pocketBtn.focus({ preventScroll: true });
    });
    pocketBtn.addEventListener('click', function () {
      if (done) { reset(); status.textContent = ''; exportBtn.focus(); return; }
      pocket();
    });
    cancelBtn.addEventListener('click', function () { reset(); status.textContent = 'Export canceled.'; exportBtn.focus(); });
    pill.addEventListener('click', unpocket);
    root.querySelector('.pp-rows').addEventListener('click', function (e) {
      var li = e.target.closest('li'); if (li) li.classList.toggle('is-picked');
    });
    root.querySelector('.pp-rows').addEventListener('keydown', function (e) {
      var li = e.target.closest('li'); if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); li.classList.toggle('is-picked'); }
    });
    root.setProgress = setProgress;
  }

  window.initPocketProgress = initPocketProgress;
  function boot() { document.querySelectorAll('[data-mi="pocket-progress"]').forEach(initPocketProgress); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
