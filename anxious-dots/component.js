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

  function initAnxiousDots(root) {
    if (!root || root.__miDots) return;
    root.__miDots = true;
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
