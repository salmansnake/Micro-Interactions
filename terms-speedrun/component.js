/* Terms Speedrun — vanilla JS. Auto-initializes every [data-mi="terms-speedrun"].
   Reading speed = words scrolled past per second. Reaching the end faster than data-honest-wps (default 12,
   about 720 words a minute) counts as a speedrun. Call window.initTermsSpeedrun(el) for elements added later. */
(function () {
  'use strict';
  var SKIM = 25, SPEEDRUN = 120; // live meter thresholds, words per second

  // Even line breaks: text that wraps to two or three lines is narrowed until its lines are close in length,
  // with the first line the longest, so no line runs long while the next holds a word or two.
  function evenLines(root) {
    var SEL = 'p, li, dd, dt, small, label, figcaption, h1, h2, h3, h4';
    function widths(el) {
      var range = document.createRange(), rows = [];
      range.selectNodeContents(el);
      Array.prototype.forEach.call(range.getClientRects(), function (b) {
        if (!b.width) return;
        var row = rows.filter(function (x) { return Math.abs(x.t - b.top) < b.height / 2; })[0];
        if (row) { row.l = Math.min(row.l, b.left); row.r = Math.max(row.r, b.right); } else rows.push({ t: b.top, l: b.left, r: b.right });
      });
      return rows.sort(function (a, b) { return a.t - b.t; }).map(function (x) { return x.r - x.l; });
    }
    function fit(el) {
      el.style.maxWidth = ''; el.style.textWrap = '';
      // A filled box marked data-fill spans the card from edge to edge, and its text fills it
      if (el.hasAttribute('data-fill')) return;
      var cs = getComputedStyle(el), full = el.getBoundingClientRect().width;
      if (!full || cs.whiteSpace === 'nowrap' || /flex|grid/.test(cs.display)) return;
      if (Array.prototype.some.call(el.children, function (c) { return !/^inline/.test(getComputedStyle(c).display); })) return;
      el.style.textWrap = 'wrap';
      var n = widths(el).length, lo = 0, hi = full, w, L;
      if (n < 2 || n > 3) { el.style.textWrap = ''; return; }
      while (hi - lo > 1) { w = (lo + hi) / 2; el.style.maxWidth = w + 'px'; if (widths(el).length > n) lo = w; else hi = w; }
      var best = 0, gap = Infinity;
      for (w = Math.ceil(hi); w <= full; w += 2) {
        el.style.maxWidth = w + 'px'; L = widths(el);
        // Each line no longer than the one above (within 10%, which reads as equal). Keep the most even width,
        // and prefer the first line longer: a last line longer than the first costs three times its overhang
        var score = Math.max.apply(null, L) - Math.min.apply(null, L) + Math.max(0, L[n - 1] - L[0]) * 3;
        if (L.length === n && L.every(function (x, i) { return !i || x <= L[i - 1] * 1.1 + 1; }) && score < gap) { gap = score; best = w; }
      }
      if (!best) { el.style.maxWidth = ''; el.style.textWrap = ''; return; }
      el.style.maxWidth = best + 'px';
      if (cs.textAlign === 'center' && cs.display === 'block') { el.style.marginLeft = 'auto'; el.style.marginRight = 'auto'; }
    }
    var queued = false, lastW = 0;
    function run() { queued = false; Array.prototype.forEach.call(root.querySelectorAll(SEL), fit); }
    function later() { if (!queued) { queued = true; requestAnimationFrame(run); } }
    later();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    if (window.ResizeObserver) new ResizeObserver(function () { var w = root.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; later(); } }).observe(root);
    if (window.MutationObserver) new MutationObserver(later).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
  }

  function initTermsSpeedrun(root) {
    if (!root || root.__miTerms) return;
    root.__miTerms = true;
    evenLines(root);
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
        record.textContent = 'You read ' + total.toLocaleString('en-US') + ' words in ' + secs.toFixed(1) + ' seconds. That’s ' + Math.round(avg).toLocaleString('en-US') + ' words per\u00a0second.';
        tldr.hidden = false;
      } else {
        root.setAttribute('data-speed', '');
        record.textContent = 'You actually read all ' + total.toLocaleString('en-US') + ' words. Section 8 says you’re owed a high\u00a0five.'; // never 1: the whole terms
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
