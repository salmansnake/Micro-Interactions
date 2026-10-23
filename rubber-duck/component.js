/* Rubber Duck Gate — vanilla JS. Auto-initializes every [data-mi="rubber-duck"].
   File Bug first summons the duck; it nods at every finished sentence. After two sentences you can
   say you figured it out, or file it anyway. Call window.initRubberDuck(el) for elements added later. */
(function () {
  'use strict';
  var NODS = ['Mm-hm.', 'Go on.', 'And then what happens?', 'Interesting.', 'Wait. Say that part again.', 'Quack. Keep going.'];

  function sentences(s) { return (s.match(/[.?!](\s|$)|\n/g) || []).length; }

  function initRubberDuck(root) {
    if (!root || root.__miDuck) return;
    root.__miDuck = true;
    var desc = root.querySelector('.rd-desc'), label = root.querySelector('.rd-desc-label');
    var row = root.querySelector('.rd-duck-row'), duck = root.querySelector('.rd-duck'), say = root.querySelector('.rd-say');
    var submit = root.querySelector('.rd-submit'), solved = root.querySelector('.rd-solved'), file = root.querySelector('.rd-file');
    var pctEl = root.querySelector('.rd-pct'), pct = Number(root.getAttribute('data-solved')) || 37;
    var ducking = false, seen = 0, n = 0;

    function play(cls) { duck.classList.remove('is-nod', 'is-joy'); void duck.offsetWidth; duck.classList.add(cls); }

    function reset() {
      ducking = false; seen = 0; n = 0;
      root.classList.remove('is-ducking', 'is-closed');
      row.hidden = true;
      desc.value = ''; desc.disabled = false;
      label.textContent = 'What happens?';
      submit.hidden = false; submit.textContent = 'File Bug';
      solved.hidden = true; file.hidden = true;
    }

    submit.addEventListener('click', function () {
      if (submit.textContent !== 'File Bug') { reset(); desc.focus(); return; }
      ducking = true;
      root.classList.add('is-ducking');
      row.hidden = false;
      say.textContent = 'Before you file it, explain it to me. Step by step.';
      label.textContent = 'Explain it to the duck';
      submit.hidden = true;
      desc.focus();
    });

    desc.addEventListener('input', function () {
      if (!ducking) return;
      var s = sentences(desc.value);
      if (s > seen) {
        seen = s;
        say.textContent = NODS[n++ % NODS.length];
        play('is-nod');
      }
      if (seen >= 2) { solved.hidden = false; file.hidden = false; }
    });

    solved.addEventListener('click', function () {
      ducking = false;
      pct = Math.min(99, pct + 1);
      pctEl.textContent = pct + '%';
      say.textContent = 'Quack. Bug closed before it existed.';
      play('is-joy');
      root.classList.add('is-closed');
      desc.disabled = true;
      solved.hidden = true; file.hidden = true;
      submit.hidden = false; submit.textContent = 'Report Another';
      submit.focus();
    });

    file.addEventListener('click', function () {
      ducking = false;
      say.textContent = 'Filed as BUG-' + (1000 + Math.floor(Math.random() * 900)) + '. The duck believes in you.';
      play('is-nod');
      root.classList.add('is-closed');
      desc.disabled = true;
      solved.hidden = true; file.hidden = true;
      submit.hidden = false; submit.textContent = 'Report Another';
      submit.focus();
    });
  }

  window.initRubberDuck = initRubberDuck;
  function boot() { document.querySelectorAll('[data-mi="rubber-duck"]').forEach(initRubberDuck); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
