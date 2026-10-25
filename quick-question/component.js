/* Quick Question Stopwatch — vanilla JS. Auto-initializes every [data-mi="quick-question"].
   Sending a message that contains "quick question" starts a stopwatch; the demo then plays a scripted thread
   in time-lapse. Call window.initQuickQuestion(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  // [who, color, text, minutes after the question]
  var REPLIES = [
    ['Mira', 'var(--chart-2)', 'Depends. Which launch date?', 2],
    ['Sam', 'var(--chart-1)', 'The one we moved, or the one before that?', 6],
    ['Leo', 'var(--chart-3)', 'Wait, I thought we were launching in Q1', 13],
    ['Mira', 'var(--chart-2)', 'Looping in Priya', 19],
    ['Priya', 'var(--chart-3)', 'Can someone summarize the thread?', 31],
    ['Sam', 'var(--chart-1)', 'Is this the same launch as the other thread?', 40],
    ['Leo', 'var(--chart-3)', 'Quick question: what was the original question?', 47]
  ];
  var LEVELS = [[0, 'Still quick.'], [6, 'Getting less quick.'], [20, 'No longer quick.'], [40, 'This is a meeting now.']];

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

  function initQuickQuestion(root) {
    if (!root || root.__miQuick) return;
    root.__miQuick = true;
    evenLines(root);
    var thread = root.querySelector('.qq-thread'), watch = root.querySelector('.qq-watch'), timeEl = root.querySelector('.qq-time');
    var verdict = root.querySelector('.qq-verdict'), form = root.querySelector('.qq-form'), input = root.querySelector('.qq-input');
    var send = root.querySelector('.qq-send'), call = root.querySelector('.qq-call');
    var running = false, raf = 0, t0 = 0, idx = 0, people = {};
    var MS_PER_MIN = reduce.matches ? 120 : 260; // time-lapse speed

    function empty() { thread.replaceChildren(); var p = document.createElement('p'); p.className = 'qq-empty'; p.textContent = 'No messages yet. Ask something quick.'; thread.appendChild(p); }
    function stamp(min) { var t = 14 * 60 + 2 + min; return (Math.floor(t / 60) % 12 || 12) + ':' + String(t % 60).padStart(2, '0'); }

    function post(who, color, text, min, tag) {
      var e = thread.querySelector('.qq-empty'); if (e) e.remove();
      var m = document.createElement('div'); m.className = 'qq-msg';
      var av = document.createElement('span'); av.className = 'qq-av'; av.style.setProperty('--c', color); av.textContent = who[0];
      var w = document.createElement('p'); w.className = 'qq-who'; w.textContent = who;
      var tm = document.createElement('time'); tm.textContent = stamp(min); w.appendChild(tm);
      var tx = document.createElement('p'); tx.className = 'qq-text'; tx.textContent = text;
      if (tag) { var g = document.createElement('span'); g.className = 'qq-tag'; g.textContent = tag; tx.appendChild(g); }
      m.append(av, w, tx);
      thread.appendChild(m);
      thread.scrollTop = thread.scrollHeight;
    }

    function level(min) { var l = 0; LEVELS.forEach(function (x, i) { if (min >= x[0]) l = i; }); return l; }

    function frame(now) {
      var min = (now - t0) / MS_PER_MIN;
      while (idx < REPLIES.length && min >= REPLIES[idx][3]) {
        var r = REPLIES[idx++]; people[r[0]] = 1; post(r[0], r[1], r[2], r[3]);
      }
      var shown = Math.min(min, 47.2);
      var secs = Math.floor(shown * 60);
      timeEl.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
      var l = level(shown);
      root.setAttribute('data-level', l);
      verdict.textContent = LEVELS[l][1];
      if (idx >= REPLIES.length && min >= 47.2) {
        running = false;
        verdict.textContent = 'Quick question: 47 minutes, ' + (Object.keys(people).length + 1) + ' people, 0 answers.'; // never 1: you plus at least one reply
        call.hidden = false;
        send.disabled = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || running) return;
      if (thread.querySelector('.qq-msg') && call.hidden === false) empty();
      call.hidden = true;
      var quick = /quick question/i.test(text);
      post('You', 'var(--chart-1)', text, 0, quick ? 'Quick question' : '');
      input.value = '';
      if (!quick) { verdict.textContent = 'Nice and direct. No stopwatch needed.'; root.setAttribute('data-level', 0); return; }
      running = true; idx = 0; people = {};
      send.disabled = true;
      watch.hidden = false;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    });

    call.addEventListener('click', function () {
      verdict.textContent = 'Call started. Agenda: the quick question.';
      call.hidden = true;
      input.value = 'Quick question about the launch date';
      watch.hidden = true;
      empty();
      root.setAttribute('data-level', 0);
    });
    empty();
  }

  window.initQuickQuestion = initQuickQuestion;
  function boot() { document.querySelectorAll('[data-mi="quick-question"]').forEach(initQuickQuestion); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
