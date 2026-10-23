/* Heavy Save — vanilla JS. Auto-initializes every [data-mi="heavy-save"] form.
   Call window.initHeavySave(form) for forms added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var MAX_WEIGHT = 5;

  function initHeavySave(form) {
    if (!form || form.__miHeavy) return;
    form.__miHeavy = true;

    var controls = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'))
      .filter(function (c) { return c.name; });
    var btn = form.querySelector('.hs-btn');
    var face = form.querySelector('.hs-face');
    var label = form.querySelector('.hs-btn-label');
    var badge = form.querySelector('.hs-badge');
    var note = form.querySelector('.hs-note');
    var leave = form.querySelector('.hs-leave');
    var saved = new Map();
    var last = 0;
    var saving = false;
    var noteTimer = 0;

    function read(c) { return c.type === 'checkbox' ? c.checked : c.value; }
    function write(c, v) { if (c.type === 'checkbox') c.checked = v; else c.value = v; }
    function snapshot() { controls.forEach(function (c) { saved.set(c, read(c)); }); }

    // A change = a field whose value differs from the last saved value.
    function countChanges() {
      var n = 0;
      controls.forEach(function (c) {
        var dirty = read(c) !== saved.get(c);
        var wrap = c.closest('.hs-row');
        if (wrap) wrap.classList.toggle('is-dirty', dirty);
        if (dirty) n++;
      });
      return n;
    }

    function add(el, frames, opts) {
      if (reduce.matches || !el.animate) return;
      opts.composite = 'add'; // layers on top of the weight offset
      try { el.animate(frames, opts); } catch (e) { delete opts.composite; el.animate(frames, opts); }
    }

    function render(n) {
      form.style.setProperty('--hs-w', Math.min(n, MAX_WEIGHT));
      form.classList.toggle('is-clean', n === 0);
      btn.setAttribute('aria-disabled', n === 0 ? 'true' : 'false');
      btn.setAttribute('aria-label', n === 0 ? 'All changes saved' : 'Save ' + n + (n === 1 ? ' change' : ' changes'));
      if (!saving) label.textContent = n === 0 ? 'Saved' : 'Save';
      badge.textContent = n;
      if (n > last) {
        add(face, [
          { transform: 'scale(1, 1)' },
          { transform: 'scale(1.04, 0.9)', offset: 0.35 },
          { transform: 'scale(0.99, 1.03)', offset: 0.7 },
          { transform: 'scale(1, 1)' }
        ], { duration: 380, easing: 'ease-out' });
        if (!reduce.matches && badge.animate) {
          badge.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
        }
      }
      if (n === 0) hideNote();
      last = n;
    }

    function update() { render(countChanges()); }

    function showNote(content, warn) {
      clearTimeout(noteTimer);
      note.replaceChildren.apply(note, content);
      note.classList.toggle('is-warn', !!warn);
    }
    function hideNote() { clearTimeout(noteTimer); note.replaceChildren(); note.classList.remove('is-warn'); }

    function tug() {
      add(face, [
        { transform: 'translateX(0) scale(1)' },
        { transform: 'translateX(-7px) scale(1.06)', offset: 0.3 },
        { transform: 'translateX(3px) scale(1)', offset: 0.6 },
        { transform: 'translateX(0) scale(1)' }
      ], { duration: 480, easing: 'ease-out' });
    }

    function discard() {
      controls.forEach(function (c) { write(c, saved.get(c)); });
      update();
    }

    function flyBadge() {
      if (reduce.matches || !badge.animate) return;
      var b = badge.getBoundingClientRect();
      var r = btn.getBoundingClientRect();
      var ghost = document.createElement('span');
      ghost.className = 'hs-badge-ghost';
      ghost.textContent = badge.textContent;
      ghost.style.left = (b.left - r.left) + 'px';
      ghost.style.top = (b.top - r.top) + 'px';
      btn.appendChild(ghost);
      ghost.animate(
        [{ transform: 'translateY(0) scale(1)', opacity: 1 }, { transform: 'translateY(-28px) scale(0.6)', opacity: 0 }],
        { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }
      ).finished.then(function () { ghost.remove(); });
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);

    leave.addEventListener('click', function () {
      var n = countChanges();
      if (n === 0) {
        showNote([document.createTextNode('Billing would open now. Nothing was lost.')], false);
        noteTimer = setTimeout(hideNote, 2400);
        return;
      }
      var undoBtn = document.createElement('button');
      undoBtn.type = 'button';
      undoBtn.textContent = 'Discard';
      undoBtn.addEventListener('click', discard);
      showNote([document.createTextNode('You have ' + n + ' unsaved ' + (n === 1 ? 'change.' : 'changes.')), undoBtn], true);
      tug();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (saving || countChanges() === 0) return;
      saving = true;
      form.classList.add('is-saving');
      label.textContent = 'Saving';
      hideNote();
      setTimeout(function () {
        snapshot();
        flyBadge();
        saving = false;
        form.classList.remove('is-saving');
        render(countChanges());
        add(face, [
          { transform: 'translateY(0)' },
          { transform: 'translateY(-7px)', offset: 0.35 },
          { transform: 'translateY(0)' }
        ], { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)' });
      }, 650);
    });

    snapshot();
    update();
  }

  window.initHeavySave = initHeavySave;
  function boot() { document.querySelectorAll('[data-mi="heavy-save"]').forEach(initHeavySave); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
