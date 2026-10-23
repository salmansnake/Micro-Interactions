/* Seat Stacker — vanilla JS. Auto-initializes every [data-mi="seat-stacker"].
   Tiers come from the .ss-tier elements (data-min + their $ price). Call window.initSeatStacker(el) for later elements. */
(function () {
  'use strict';
  var PEOPLE = [['SH', 'var(--chart-1)'], ['MK', 'var(--chart-2)'], ['AL', 'var(--chart-4)'], ['SR', 'var(--chart-3)'], ['JT', 'var(--chart-5)'], ['NB', 'var(--chart-1)'], ['RP', 'var(--chart-2)'], ['DV', 'var(--chart-4)']];
  var SHOW = 6; // avatars before "+n"
  var MAX = 99;

  // Odometer: one column of 0–9 per digit, rolled with a spring.
  function odometer(el, value) {
    var s = String(value);
    if (el.children.length !== s.length) {
      el.replaceChildren();
      for (var i = 0; i < s.length; i++) {
        var col = document.createElement('span');
        col.className = 'ss-col';
        for (var d = 0; d <= 9; d++) { var n = document.createElement('span'); n.textContent = d; col.appendChild(n); }
        el.appendChild(col);
      }
      void el.offsetWidth;
    }
    Array.prototype.forEach.call(el.children, function (col, i) {
      col.style.transform = 'translateY(' + (-Number(s[i]) * 34) + 'px)';
    });
    el.setAttribute('aria-label', s);
  }

  function initSeatStacker(root) {
    if (!root || root.__miSeat) return;
    root.__miSeat = true;
    var count = root.querySelector('.ss-count');
    var avatars = root.querySelector('.ss-avatars');
    var tiers = Array.prototype.slice.call(root.querySelectorAll('.ss-tier')).map(function (t) {
      return { el: t, min: Number(t.getAttribute('data-min')), price: Number(t.querySelector('b').textContent.replace(/[^0-9.]/g, '')) };
    });
    var per = root.querySelector('[data-odo="per"]');
    var total = root.querySelector('[data-odo="total"]');
    var note = root.querySelector('.ss-note');
    var minus = root.querySelector('[data-step="-1"]');
    var plus = root.querySelector('[data-step="1"]');
    var seats = Number(root.getAttribute('data-seats')) || 3;
    var tierIx = -1;

    function tierFor(n) { var t = 0; tiers.forEach(function (x, i) { if (n >= x.min) t = i; }); return t; }

    function drawAvatars(prev) {
      var shown = Math.min(seats, SHOW);
      var more = seats - shown;
      var current = Array.prototype.slice.call(avatars.querySelectorAll('.ss-av:not(.is-leaving):not(.is-more)'));
      // remove extras with a shrink
      for (var i = current.length - 1; i >= shown; i--) {
        (function (el) { el.classList.add('is-leaving'); setTimeout(function () { el.remove(); }, 300); })(current[i]);
      }
      for (var j = current.length; j < shown; j++) {
        var p = PEOPLE[j % PEOPLE.length];
        var a = document.createElement('span');
        a.className = 'ss-av';
        a.textContent = p[0];
        a.style.background = p[1];
        var moreEl = avatars.querySelector('.is-more');
        avatars.insertBefore(a, moreEl ? moreEl.nextSibling : avatars.firstChild);
      }
      var m = avatars.querySelector('.is-more');
      if (more > 0) {
        if (!m) { m = document.createElement('span'); m.className = 'ss-av is-more'; avatars.insertBefore(m, avatars.firstChild); }
        m.textContent = '+' + more;
      } else if (m) m.remove();
    }

    function set(n, fromInput) {
      n = Math.max(1, Math.min(MAX, Math.round(n) || 1));
      var prev = seats;
      seats = n;
      if (!fromInput) count.value = n;
      minus.disabled = n <= 1;
      plus.disabled = n >= MAX;
      var t = tierFor(n);
      tiers.forEach(function (x, i) { x.el.classList.toggle('is-on', i === t); });
      odometer(per, tiers[t].price);
      odometer(total, tiers[t].price * n);
      if (tierIx !== -1 && t !== tierIx) {
        tiers[t].el.classList.remove('is-new');
        void tiers[t].el.offsetWidth;
        tiers[t].el.classList.add('is-new');
        var chip = document.createElement('span');
        chip.className = 'ss-chip';
        chip.textContent = t > tierIx
          ? 'Tier unlocked: you now pay $' + tiers[t].price + ' per seat'
          : 'Back to $' + tiers[t].price + ' per seat';
        note.replaceChildren(chip);
      } else if (tierIx !== -1 && t < tiers.length - 1) {
        var next = tiers[t + 1];
        note.textContent = '';
        if (next.min - n <= 3) {
          var c = document.createElement('span'); c.className = 'ss-chip';
          c.textContent = (next.min - n) + ' more ' + (next.min - n === 1 ? 'seat' : 'seats') + ' unlocks $' + next.price + ' per seat';
          note.replaceChildren(c);
        }
      } else if (t === tiers.length - 1 && t === tierIx) note.textContent = '';
      tierIx = t;
      drawAvatars(prev);
    }

    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-step]');
      if (b && !b.disabled) set(seats + Number(b.getAttribute('data-step')));
    });
    count.addEventListener('input', function () {
      var v = Number(count.value.replace(/\D/g, ''));
      if (v) set(v, true);
    });
    count.addEventListener('blur', function () { count.value = seats; });
    count.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); set(seats + 1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); set(seats - 1); }
    });
    set(seats);
  }

  window.initSeatStacker = initSeatStacker;
  function boot() { document.querySelectorAll('[data-mi="seat-stacker"]').forEach(initSeatStacker); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
