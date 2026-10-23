/* Overtime Fuse — vanilla JS. Auto-initializes every [data-mi="overtime-fuse"].
   The range is a pretend clock in minutes since the start; in a real call, call root.setMinutes(n) every second.
   The fuse is data-fuse minutes long. Call window.initOvertimeFuse(el) for elements added later. */
(function () {
  'use strict';

  function initOvertimeFuse(root) {
    if (!root || root.__miFuse) return;
    root.__miFuse = true;
    var length = Number(root.getAttribute('data-length')) || 30;
    var people = Number(root.getAttribute('data-people')) || 6;
    var fuse = Number(root.getAttribute('data-fuse')) || 15;
    var clock = root.querySelector('.of-clock'), line = root.querySelector('.of-line');
    var range = root.querySelector('.of-range'), end = root.querySelector('.of-end');
    var ended = false;

    function mmss(min) { var s = Math.round(min * 60); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function mins(n) { n = Math.round(n); return n + (n === 1 ? ' minute' : ' minutes'); }

    function setMinutes(m) {
      if (ended) return;
      var over = m - length;
      clock.textContent = mmss(m);
      root.style.setProperty('--of-p', Math.min(1, m / length).toFixed(4));
      root.classList.toggle('is-over', over > 0);
      root.classList.toggle('is-late', over >= 5);
      if (over <= 0) {
        var left = -over;
        line.textContent = left < 1 ? 'On time. Less than a minute left.' : 'On time. ' + mins(left) + ' left.';
        return;
      }
      var left2 = Math.max(0, 1 - over / fuse);
      root.style.setProperty('--of-left', left2.toFixed(4));
      root.style.setProperty('--of-heat', (1 + (1 - left2) * 0.7).toFixed(2));
      if (left2 === 0) line.textContent = mins(over) + ' over. The fuse is out. Everyone is still here, physically.';
      else line.textContent = mins(over) + ' over · ' + people + ' people · ' + Math.round(over * people) + ' person-minutes';
    }

    range.addEventListener('input', function () { setMinutes(Number(range.value)); });
    end.addEventListener('click', function () {
      var over = Number(range.value) - length;
      ended = true;
      root.classList.remove('is-over', 'is-late');
      line.textContent = over > 0 ? 'Meeting ended. ' + people + ' people just got their afternoon back.' : 'Meeting ended early. A legend.';
      end.textContent = 'Ended';
      end.disabled = true;
    });
    root.setMinutes = setMinutes;
    setMinutes(Number(range.value));
  }

  window.initOvertimeFuse = initOvertimeFuse;
  function boot() { document.querySelectorAll('[data-mi="overtime-fuse"]').forEach(initOvertimeFuse); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
