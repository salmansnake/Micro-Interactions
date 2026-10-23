/* Commit Mood Ring — vanilla JS. Auto-initializes every [data-mi="commit-mood"].
   Each message gets a despair score from its words; the mood is the sum over the last four commits.
   Call window.initCommitMood(el) for elements added later. */
(function () {
  'use strict';
  var RULES = [
    [/\bfix(e[sd])?\b/i, 1], [/\b(again|another|more)\b/i, 2], [/\b(final|actually|for real|real)\b/i, 2],
    [/\b(pls|plz|please)\b/i, 3], [/\b(why|how|wtf)\b|\?{2,}/i, 3], [/\brevert\b/i, 2], [/!{2,}/, 1], [/\b(work|works|working)\b/i, 1]
  ];
  // Mood scale from calm to accepting fate. Colors are system colors, blended in order.
  var MOODS = [
    [0, 'Calm', 'aqua'], [2, 'Focused', 'sage'], [4, 'Concerned', 'pink'],
    [6, 'Frustrated', 'orange'], [8, 'Bargaining', 'danger'], [11, 'Acceptance', 'stone']
  ];
  function score(msg) {
    var s = 0;
    RULES.forEach(function (r) { if (r[0].test(msg)) s += r[1]; });
    var words = msg.trim().split(/\s+/).length;
    if (words >= 4 && /^[A-Z]/.test(msg) && s < 2) s -= 2; // a real sentence calms things down
    else if (msg.trim().length < 10) s += 1;
    return s;
  }
  function hex() { return Math.random().toString(16).slice(2, 9).padEnd(7, '0'); }

  function initCommitMood(root) {
    if (!root || root.__miMood) return;
    root.__miMood = true;
    var log = root.querySelector('.cm-log'), form = root.querySelector('.cm-form'), input = root.querySelector('.cm-input');
    var moodEl = root.querySelector('.cm-mood'), care = root.querySelector('.cm-care'), careText = root.querySelector('.cm-care-text');
    var brk = root.querySelector('.cm-break');
    var recent = [], minutes = 121, fixes = 0, last = 'Calm', since = 0;

    function clock(m) { var h = Math.floor(m / 60) % 12 || 12; return h + ':' + String(m % 60).padStart(2, '0') + ' PM'; }

    function render() {
      var total = Math.max(0, recent.slice(-4).reduce(function (a, b) { return a + b; }, 0));
      var mood = MOODS[0];
      MOODS.forEach(function (m) { if (total >= m[0]) mood = m; });
      root.style.setProperty('--cm-mood', 'var(--' + mood[2] + ')');
      if (mood[1] !== last) {
        moodEl.textContent = mood[1];
        root.classList.remove('is-shift'); void root.offsetWidth; root.classList.add('is-shift');
        last = mood[1];
      }
      var low = total >= 8;
      care.hidden = !low;
      if (low) careText.textContent = 'That’s ' + fixes + ' “fix” commits in ' + (minutes - since) + ' minutes. The bug will still be there after a glass of water.';
    }

    function commit(msg) {
      msg = msg.trim();
      if (!msg) return;
      minutes += 1 + Math.floor(Math.random() * 3);
      if (/\bfix/i.test(msg)) fixes++;
      recent.push(score(msg));
      var li = document.createElement('li');
      var c = document.createElement('code'); c.textContent = hex();
      var s = document.createElement('span'); s.className = 'cm-msg'; s.textContent = msg;
      var t = document.createElement('time'); t.textContent = clock(minutes);
      li.append(c, s, t);
      log.appendChild(li);
      while (log.children.length > 5) log.removeChild(log.firstElementChild);
      render();
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); commit(input.value); input.value = ''; input.focus(); });
    root.querySelectorAll('.cm-chips button').forEach(function (b) { b.addEventListener('click', function () { commit(b.textContent); }); });
    brk.addEventListener('click', function () {
      recent = []; fixes = 0; minutes += 10; since = minutes;
      var li = document.createElement('li'); li.className = 'cm-pause'; li.textContent = '10 minute break · water consumed';
      log.appendChild(li);
      while (log.children.length > 5) log.removeChild(log.firstElementChild);
      render();
      input.focus();
    });
    since = minutes;
    render();
  }

  window.initCommitMood = initCommitMood;
  function boot() { document.querySelectorAll('[data-mi="commit-mood"]').forEach(initCommitMood); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
