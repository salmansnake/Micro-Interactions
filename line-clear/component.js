/* Line Clear — vanilla JS. Auto-initializes every [data-mi="line-clear"].
   Blocks are hour slots 0–7 (9 AM to 5 PM). Accepting an invite drops it into its slot; when every slot is full the
   day flashes like a cleared row and offers to protect lunch. Call window.initLineClear(el) for elements added later. */
(function () {
  'use strict';
  var SLOTS = 8, LUNCH = 3;

  function initLineClear(root) {
    if (!root || root.__miLineClear) return;
    root.__miLineClear = true;
    var col = root.querySelector('.ct-col'), free = root.querySelector('.ct-free'), list = root.querySelector('.ct-list');
    var clear = root.querySelector('.ct-clear'), lunch = root.querySelector('.ct-lunch'), status = root.querySelector('.ct-status');

    function blocks() { return Array.prototype.slice.call(col.querySelectorAll('.ct-block:not(.is-out)')); }
    col.querySelectorAll('.ct-block').forEach(function (b) { b.style.setProperty('--slot', b.getAttribute('data-slot')); });

    function count() {
      var n = SLOTS - blocks().length;
      free.textContent = n === 0 ? 'No time free' : n + (n === 1 ? ' hour free' : ' hours free');
      root.classList.toggle('is-full', n === 0);
      return n;
    }

    function full() {
      blocks().forEach(function (b) { b.classList.remove('is-drop', 'is-flash'); void b.offsetWidth; b.classList.add('is-flash'); });
      setTimeout(function () { clear.hidden = false; lunch.focus(); }, 700);
    }

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var slot = btn.getAttribute('data-slot');
      var b = document.createElement('div');
      b.className = 'ct-block is-drop';
      b.setAttribute('data-slot', slot);
      b.style.setProperty('--slot', slot);
      b.style.setProperty('--c', btn.getAttribute('data-c'));
      b.textContent = btn.getAttribute('data-name');
      col.appendChild(b);
      var li = btn.closest('li'), next = li.nextElementSibling || li.previousElementSibling;
      li.remove();
      if (!list.children.length) root.querySelector('.ct-invites').hidden = true;
      if (next) next.querySelector('button').focus();
      status.textContent = '';
      if (count() === 0) setTimeout(full, 650);
    });

    lunch.addEventListener('click', function () {
      var taken = blocks().filter(function (b) { return Number(b.getAttribute('data-slot')) === LUNCH; })[0];
      var name = taken ? taken.textContent : 'that meeting';
      if (taken) { taken.classList.add('is-out'); setTimeout(function () { taken.remove(); }, 440); }
      setTimeout(function () {
        var l = document.createElement('div');
        l.className = 'ct-block is-lunch is-drop';
        l.setAttribute('data-slot', LUNCH);
        l.style.setProperty('--slot', LUNCH);
        l.textContent = 'Lunch (Protected)';
        col.appendChild(l);
        count();
        free.textContent = 'Lunch protected';
        root.classList.remove('is-full');
      }, 300);
      clear.hidden = true;
      status.textContent = 'Lunch protected. ' + name + ' moved to tomorrow, where it will also be fine.';
    });
    count();
  }

  window.initLineClear = initLineClear;
  function boot() { document.querySelectorAll('[data-mi="line-clear"]').forEach(initLineClear); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
