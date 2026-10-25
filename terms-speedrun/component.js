/* Terms Speedrun — vanilla JS. Auto-initializes every [data-mi="terms-speedrun"].
   Reading speed = words scrolled past per second. Reaching the end faster than data-honest-wps (default 12,
   about 720 words a minute) counts as a speedrun. Call window.initTermsSpeedrun(el) for elements added later. */
(function () {
  'use strict';
  var SKIM = 25, SPEEDRUN = 120; // live meter thresholds, words per second

  function initTermsSpeedrun(root) {
    if (!root || root.__miTerms) return;
    root.__miTerms = true;
    var doc = root.querySelector('.ts-doc'), wpsEl = root.querySelector('.ts-wps'), mode = root.querySelector('.ts-mode');
    var bar = root.querySelector('.ts-progress i'), check = root.querySelector('.ts-check'), label = root.querySelector('.ts-label');
    var result = root.querySelector('.ts-result'), record = root.querySelector('.ts-record'), tldr = root.querySelector('.ts-tldr');
    var cont = root.querySelector('.ts-continue');
    var honest = Number(root.getAttribute('data-honest-wps')) || 12;
    var total = doc.textContent.trim().split(/\s+/).length;
    var started = 0, done = false, samples = [], raf = 0, shown = 0;

    function read() {
      var max = doc.scrollHeight - doc.clientHeight;
      return max > 0 ? Math.min(1, doc.scrollTop / max) : 1;
    }

    function speed(now) {
      samples = samples.filter(function (s) { return now - s.t < 400; });
      if (samples.length < 2) return 0;
      var a = samples[0], b = samples[samples.length - 1];
      return Math.max(0, (b.w - a.w) / Math.max(0.05, (b.t - a.t) / 1000));
    }

    // The meter eases toward the live speed and decays to zero when scrolling stops.
    function loop(now) {
      if (done) { raf = 0; return; } // the meter freezes on the final average
      var target = speed(now);
      shown += (target - shown) * 0.25;
      if (shown < 0.5 && target === 0) shown = 0;
      wpsEl.textContent = Math.round(shown).toLocaleString('en-US');
      var s = shown >= SPEEDRUN ? 'speedrun' : shown >= SKIM ? 'skim' : '';
      if (!done) root.setAttribute('data-speed', s);
      mode.textContent = s === 'speedrun' ? 'Speedrunning' : s === 'skim' ? 'Skimming' : '';
      if (shown > 0 || samples.length) raf = requestAnimationFrame(loop); else raf = 0;
    }

    function finish(now) {
      done = true;
      var secs = Math.max(0.1, (now - started) / 1000);
      var avg = total / secs;
      check.disabled = false;
      cancelAnimationFrame(raf); raf = 0;
      wpsEl.textContent = Math.round(avg).toLocaleString('en-US');
      mode.textContent = avg >= SPEEDRUN ? 'Speedrunning' : avg > honest ? 'Skimming' : 'Reading';
      result.hidden = false;
      if (avg > honest) {
        root.classList.add('is-busted');
        root.setAttribute('data-speed', avg >= SPEEDRUN ? 'speedrun' : 'skim');
        label.textContent = 'I have not read this, and we both know it.';
        label.classList.remove('is-swap'); void label.offsetWidth; label.classList.add('is-swap');
        record.textContent = 'You read ' + total.toLocaleString('en-US') + ' words in ' + secs.toFixed(1) + ' seconds. That’s ' + Math.round(avg).toLocaleString('en-US') + ' words per second.';
        tldr.hidden = false;
      } else {
        root.setAttribute('data-speed', '');
        record.textContent = 'You actually read all ' + total.toLocaleString('en-US') + ' words. Section 8 says you’re owed a high five.';
      }
    }

    doc.addEventListener('scroll', function () {
      var now = performance.now();
      if (!started) started = now;
      var p = read();
      bar.style.width = (p * 100).toFixed(1) + '%';
      samples.push({ t: now, w: p * total });
      if (!raf) raf = requestAnimationFrame(loop);
      if (!done && doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 4) finish(now);
    }, { passive: true });

    check.addEventListener('change', function () { cont.disabled = !check.checked; });
    cont.addEventListener('click', function () {
      cont.textContent = root.classList.contains('is-busted') ? 'Welcome Aboard, Speedrunner' : 'Welcome Aboard';
      cont.disabled = true;
    });
  }

  window.initTermsSpeedrun = initTermsSpeedrun;
  function boot() { document.querySelectorAll('[data-mi="terms-speedrun"]').forEach(initTermsSpeedrun); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
