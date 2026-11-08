/* Tired Hand — vanilla JS. Auto-initializes every [data-mi="tired-hand"].
   Raise Hand starts a sped-up clock (one meeting minute every 2 seconds). Each minute the hand gets more tired:
   droops, switches arms, droops further, rests on a stick, waves wildly, and at last someone notices.
   Call window.initTiredHand(el) for elements added later. */
(function () {
  'use strict';
  var STEP = 2000;
  // Per meeting minute: tilt, which arm, extras, and what the status says
  var STAGES = [
    { tilt: 0, flip: 1, say: 'Hand raised. Mira is still talking.' },
    { tilt: 18, flip: 1, say: '1 minute. The arm is getting heavy.' },
    { tilt: -8, flip: -1, say: '2 minutes. Switched arms.' },
    { tilt: 38, flip: -1, say: '3 minutes. It’s more of a lean now.' },
    { tilt: 0, flip: -1, prop: true, say: '4 minutes. Propped up on a stick.' },
    { tilt: 0, flip: -1, prop: true, wave: true, say: '5 minutes. Waving now. Dignity optional.' }
  ];

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

  function initTiredHand(root) {
    if (!root || root.__miTdh) return;
    root.__miTdh = true;
    evenLines(root);
    var btn = root.querySelector('.tdh-btn'), label = btn.querySelector('span'), status = root.querySelector('.tdh-status');
    var clock = root.querySelector('.tdh-clock'), start = status.textContent;
    var stage = 0, timer = 0, tick = 0, secs = 0, up = false;

    function show(i) {
      var s = STAGES[i];
      root.style.setProperty('--tdh-tilt', s.tilt + 'deg');
      root.style.setProperty('--tdh-flip', s.flip);
      root.classList.toggle('is-propped', !!s.prop);
      root.classList.toggle('is-waving', !!s.wave);
      status.textContent = s.say;
    }
    // Any phrases after the text stay whole: each moves to the next line as one piece, never split mid-phrase
    function lower(text, whole) {
      up = false; clearTimeout(timer); clearInterval(tick);
      root.classList.remove('is-up', 'is-propped', 'is-waving');
      root.style.setProperty('--tdh-tilt', '0deg'); root.style.setProperty('--tdh-flip', 1);
      clock.hidden = true;
      label.textContent = 'Raise Hand'; btn.classList.remove('is-secondary');
      status.textContent = text;
      (whole || []).forEach(function (w) {
        var s = document.createElement('span'); s.className = 'tdh-whole'; s.textContent = w;
        status.append(' ', s);
      });
    }
    function next() {
      stage++;
      if (stage < STAGES.length) { show(stage); timer = setTimeout(next, STEP); return; }
      lower('“Did someone have a question?”', ['Noticed after 5\u00a0minutes.', 'The question: forgotten.']);
    }

    btn.addEventListener('click', function () {
      if (up) return lower('Hand lowered. The question lives on in your heart.');
      up = true; stage = 0; secs = 0;
      root.classList.add('is-up');
      clock.hidden = false; clock.textContent = '0:00';
      // The clock runs at meeting speed: 30 seconds for every real second
      tick = setInterval(function () { secs += 15; clock.textContent = Math.floor(secs / 60) + ':' + ('0' + secs % 60).slice(-2); }, 500);
      label.textContent = 'Lower Hand'; btn.classList.add('is-secondary');
      show(0);
      timer = setTimeout(next, STEP);
    });

    // The button keeps one width for Raise Hand and Lower Hand
    function sizeBtn() {
      var keep = label.textContent, w = 0;
      btn.style.minWidth = '';
      ['Raise Hand', 'Lower Hand'].forEach(function (s) { label.textContent = s; w = Math.max(w, btn.getBoundingClientRect().width); });
      label.textContent = keep; btn.style.minWidth = Math.ceil(w) + 'px';
    }
    sizeBtn();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeBtn);
    status.textContent = start;
  }

  window.initTiredHand = initTiredHand;
  function boot() { document.querySelectorAll('[data-mi="tired-hand"]').forEach(initTiredHand); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
