/* Anxious Typing Dots — vanilla JS. Auto-initializes every [data-mi="anxious-dots"].
   Plays a scripted typing session when it first comes into view; Replay plays it again.
   In a real chat, drive data-stage from how long the other person has been typing.
   Call window.initAnxiousDots(el) for elements added later. */
(function () {
  'use strict';
  // at: demo time in ms. clock: how long they've "really" been typing, in seconds.
  function script(n) {
    return [
      { at: 0, stage: 1, caption: n + ' is typing…', clock: 3 },
      { at: 1800, stage: 2, caption: n + ' is typing a lot…', clock: 41 },
      { at: 3600, stage: 3, caption: 'This is a paragraph now.', clock: 96 },
      { at: 5400, stage: 4, caption: n + ' is writing you a novel.', clock: 178 },
      { at: 7400, stage: 5, caption: n + ' stopped typing.', clock: 200, timer: 'Paused at ' },
      { at: 8600, stage: 4, caption: n + ' is typing again…', clock: 204 },
      { at: 9900, stage: 6, caption: n + ' deleted all of it.', clock: 242, timer: 'Deleted after ' },
      { at: 11300, stage: 7, caption: '4 minutes of typing. 3 letters.', clock: 249, timer: 'Total: ', end: true }
    ];
  }
  function mmss(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

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

  function initAnxiousDots(root) {
    if (!root || root.__miDots) return;
    root.__miDots = true;
    evenLines(root);
    var name = root.getAttribute('data-name') || 'They';
    var steps = script(name);
    var caption = root.querySelector('.ax-caption');
    var timer = root.querySelector('.ax-timer');
    var reply = root.querySelector('.ax-msg--them');
    var presence = root.querySelector('.ax-presence');
    var replay = root.querySelector('.ax-replay');
    var t0 = 0, raf = 0, idx = -1;

    function frame(now) {
      var t = Math.max(0, now - t0); // the first frame can be stamped just before t0
      while (idx + 1 < steps.length && t >= steps[idx + 1].at) {
        idx++;
        var s = steps[idx];
        root.setAttribute('data-stage', s.stage);
        caption.textContent = s.caption;
        if (s.end) {
          reply.hidden = false;
          presence.textContent = 'Active now';
        } else if (s.stage === 6) presence.textContent = 'Active now';
        else presence.textContent = 'Typing…';
      }
      var cur = steps[idx], nxt = steps[idx + 1];
      // The timer runs between the scripted clock values, so it visibly races.
      var secs = cur.clock;
      if (nxt && !cur.timer) secs = cur.clock + (nxt.clock - cur.clock) * Math.min(1, (t - cur.at) / (nxt.at - cur.at));
      timer.textContent = (cur.timer || 'Typing for ') + mmss(secs);
      if (nxt) raf = requestAnimationFrame(frame);
    }

    function play() {
      cancelAnimationFrame(raf);
      reply.hidden = true;
      idx = -1;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }

    replay.addEventListener('click', play);
    root.setAttribute('data-stage', '1');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); play(); }
      }, { threshold: 0.5 });
      io.observe(root);
    } else play();
    root.replay = play;
  }

  window.initAnxiousDots = initAnxiousDots;
  function boot() { document.querySelectorAll('[data-mi="anxious-dots"]').forEach(initAnxiousDots); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
