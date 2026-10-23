/* final_FINAL_v3 — vanilla JS. Auto-initializes every [data-mi="final-final"].
   Each save (button, or ⌘S / Ctrl+S inside the component) backspaces and retypes the name to its next stage.
   Call window.initFinalFinal(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var SUFFIXES = ['', ' final', ' final_v2', ' FINAL', ' FINAL_final', ' FINAL_final_v3', ' FINAL_final_v3 (use this one)',
    ' FINAL_final_v3 (use this one) (1)', ' FINAL_final_v3 (use this one) (1) EDITED', ''];
  var NOTES = { 3: 'Confident.', 5: 'Very confident.', 6: 'This is the one.', 7: 'This is also the one.', 8: 'Nine files. One deck. Nobody knows which is real.', 9: 'Full circle. It’s just “Pitch Deck” again.' };

  function initFinalFinal(root) {
    if (!root || root.__miFinal) return;
    root.__miFinal = true;
    var base = root.getAttribute('data-base') || 'Untitled';
    var ext = root.getAttribute('data-ext') || '';
    var typed = root.querySelector('.fn-typed'), meta = root.querySelector('.fn-meta');
    var save = root.querySelector('.fn-save'), folder = root.querySelector('.fn-folder'), list = root.querySelector('.fn-list');
    var status = root.querySelector('.fn-status');
    var stage = 0, busy = false, files = [];

    function type(from, to, done) {
      if (reduce.matches) { typed.textContent = to; done(); return; }
      var keep = 0;
      while (keep < from.length && keep < to.length && from[keep] === to[keep]) keep++;
      var cur = from, typing = false;
      root.classList.add('is-typing');
      (function step() {
        if (!typing && cur.length > keep) { cur = cur.slice(0, -1); typed.textContent = cur; setTimeout(step, 22); return; }
        typing = true; // backspacing is done, now type forward
        if (cur.length < to.length) { cur = to.slice(0, cur.length + 1); typed.textContent = cur; setTimeout(step, 38); return; }
        root.classList.remove('is-typing');
        done();
      })();
    }

    function renderFolder() {
      list.replaceChildren();
      var shown = files.slice(-3).reverse();
      shown.forEach(function (f) { var li = document.createElement('li'); li.textContent = f + ext; list.appendChild(li); });
      if (files.length > 3) { var m = document.createElement('li'); m.className = 'fn-more'; m.textContent = 'and ' + (files.length - 3) + ' more'; list.appendChild(m); }
      folder.hidden = files.length === 0;
    }

    function doSave() {
      if (busy) return;
      busy = true;
      var oldName = base + SUFFIXES[stage];
      if (stage < SUFFIXES.length - 1 && files.indexOf(oldName) < 0) files.push(oldName);
      stage = (stage + 1) % SUFFIXES.length;
      var newName = base + SUFFIXES[stage];
      meta.textContent = '24 pages · Saving…';
      status.textContent = '';
      type(oldName, newName, function () {
        busy = false;
        meta.textContent = '24 pages · Saved just now';
        status.textContent = NOTES[stage] || '';
        if (stage === SUFFIXES.length - 1) { stage = 0; files = []; }
        renderFolder();
      });
    }

    save.addEventListener('click', doSave);
    root.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(); }
    });
    typed.textContent = base;
  }

  window.initFinalFinal = initFinalFinal;
  function boot() { document.querySelectorAll('[data-mi="final-final"]').forEach(initFinalFinal); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
