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

  function initQuickQuestion(root) {
    if (!root || root.__miQuick) return;
    root.__miQuick = true;
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
        verdict.textContent = 'Quick question: 47 minutes, ' + (Object.keys(people).length + 1) + ' people, 0 answers.';
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
