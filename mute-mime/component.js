/* Mute Mime — vanilla JS. Auto-initializes every [data-mi="mute-mime"].
   The demo talks while you hold "Hold to Talk". In a real call, call root.talking(true/false) from your
   voice-activity detector. Call window.initMuteMime(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  function initMuteMime(root) {
    if (!root || root.__miMime) return;
    root.__miMime = true;
    evenLines(root);
    var tile = root.querySelector('.mm-tile'), box = root.querySelector('.mm-box'), waves = root.querySelector('.mm-waves');
    var toast = root.querySelector('.mm-toast'), secsEl = root.querySelector('.mm-secs'), unitEl = root.querySelector('.mm-unit'), inline = root.querySelector('.mm-unmute-inline');
    var mute = root.querySelector('.mm-mute'), muteLabel = root.querySelector('.mm-mute-label'), talk = root.querySelector('.mm-talk');
    var muted = true, speaking = false, spawn = 0, started = 0, clock = 0;

    function wave() {
      var i = document.createElement('i');
      if (muted) {
        // Grow until the ring meets the box's top and bottom edges, then flash the glass.
        var stop = (tile.clientHeight - 28) / 80;
        i.style.setProperty('--mm-stop', stop.toFixed(2));
        i.className = 'is-boxed';
        setTimeout(function () { box.classList.remove('is-hit'); void box.offsetWidth; box.classList.add('is-hit'); }, reduce.matches ? 0 : 560);
        setTimeout(function () { i.remove(); }, 800);
      } else {
        i.className = 'is-free';
        setTimeout(function () { i.remove(); }, 1250);
      }
      waves.appendChild(i);
    }

    function tickClock() {
      var s = Math.floor((performance.now() - started) / 1000);
      secsEl.textContent = s;
      unitEl.textContent = s === 1 ? 'second' : 'seconds';
      if (muted && performance.now() - started > 1400) toast.hidden = false;
    }

    function talking(on) {
      if (on === speaking) return;
      speaking = on;
      root.classList.toggle('is-talking', on);
      clearInterval(spawn); clearInterval(clock);
      if (on) {
        started = performance.now();
        wave();
        spawn = setInterval(wave, 420);
        clock = setInterval(tickClock, 250);
      }
    }

    function setMuted(m) {
      muted = m;
      mute.setAttribute('aria-pressed', m ? 'true' : 'false');
      muteLabel.textContent = m ? 'Unmute' : 'Mute';
      root.classList.toggle('is-live', !m);
      if (!m) toast.hidden = true;
    }

    talk.addEventListener('pointerdown', function (e) { if (e.button === 0) { talk.setPointerCapture && talk.setPointerCapture(e.pointerId); talking(true); } });
    talk.addEventListener('pointerup', function () { talking(false); });
    talk.addEventListener('pointercancel', function () { talking(false); });
    talk.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); talking(true); } });
    talk.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); talking(false); } });
    mute.addEventListener('click', function () { setMuted(!muted); });
    inline.addEventListener('click', function () { setMuted(false); talk.focus(); });

    root.talking = talking;
    root.setMuted = setMuted;
    setMuted(true);
  }

  window.initMuteMime = initMuteMime;
  function boot() { document.querySelectorAll('[data-mi="mute-mime"]').forEach(initMuteMime); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
