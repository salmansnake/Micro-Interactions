/* Autosave Appreciation — vanilla JS. Auto-initializes every [data-mi="autosave-thanks"].
   Catches ⌘S / Ctrl+S while focus is inside the component (or the keycap button) and thanks you instead of
   opening the browser's Save dialog. Call window.initAutosaveThanks(el) for elements added later. */
(function () {
  'use strict';
  // The message for the nth press; the highest threshold reached wins.
  var LINES = [[1, 'Already saved. But I appreciate the gesture.'], [2, 'Still saved. Every keystroke, actually.'], [3, 'Saved. Again. It’s fine.'],
    [5, 'We’ve got it. You can let go.'], [8, 'Muscle memory is a beautiful thing.'], [12, 'The file is now extremely safe.'], [20, 'At this point it’s a ritual. Respect.']];

  function initAutosaveThanks(root) {
    if (!root || root.__miSave) return;
    root.__miSave = true;
    var input = root.querySelector('.av-input'), savedText = root.querySelector('.av-saved-text');
    var toast = root.querySelector('.av-toast'), text = root.querySelector('.av-toast-text'), countEl = root.querySelector('.av-count');
    var keys = root.querySelector('.av-keys'), live = root.querySelector('.av-live');
    var presses = 0, hide = 0, saving = 0;

    function thank() {
      presses++;
      var line = LINES[0][1];
      LINES.forEach(function (l) { if (presses >= l[0]) line = l[1]; });
      text.textContent = line;
      countEl.textContent = presses > 1 ? '×' + presses : '';
      live.textContent = line;
      root.classList.add('is-thanked');
      toast.classList.remove('is-bump'); void toast.offsetWidth; toast.classList.add('is-bump');
      clearTimeout(hide);
      hide = setTimeout(function () { root.classList.remove('is-thanked'); }, 2600);
    }

    root.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); thank(); }
    });
    keys.addEventListener('click', thank);
    input.addEventListener('input', function () {
      root.classList.add('is-saving');
      savedText.textContent = 'Saving…';
      clearTimeout(saving);
      saving = setTimeout(function () { root.classList.remove('is-saving'); savedText.textContent = 'Saved'; }, 600);
    });
  }

  window.initAutosaveThanks = initAutosaveThanks;
  function boot() { document.querySelectorAll('[data-mi="autosave-thanks"]').forEach(initAutosaveThanks); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
