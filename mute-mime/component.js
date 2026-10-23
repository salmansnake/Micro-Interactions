/* Mute Mime — vanilla JS. Auto-initializes every [data-mi="mute-mime"].
   The demo talks while you hold "Hold to Talk". In a real call, call root.talking(true/false) from your
   voice-activity detector. Call window.initMuteMime(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initMuteMime(root) {
    if (!root || root.__miMime) return;
    root.__miMime = true;
    var tile = root.querySelector('.mm-tile'), box = root.querySelector('.mm-box'), waves = root.querySelector('.mm-waves');
    var toast = root.querySelector('.mm-toast'), secsEl = root.querySelector('.mm-secs'), inline = root.querySelector('.mm-unmute-inline');
    var mute = root.querySelector('.mm-mute'), muteLabel = root.querySelector('.mm-mute-label'), talk = root.querySelector('.mm-talk');
    var muted = true, speaking = false, spawn = 0, started = 0, clock = 0;

    function wave() {
      var i = document.createElement('i');
      if (muted) {
        // Grow until the ring meets the box's top and bottom edges, then flash the glass.
        var stop = (tile.clientHeight - 28) / 80;
        i.style.setProperty('--mm-stop', stop.toFixed(2));
        i.className = 'is-boxed';
        setTimeout(function () { box.classList.remove('is-hit'); void box.offsetWidth; box.classList.add('is-hit'); }, reduce.matches ? 0 : 560);
        setTimeout(function () { i.remove(); }, 800);
      } else {
        i.className = 'is-free';
        setTimeout(function () { i.remove(); }, 1250);
      }
      waves.appendChild(i);
    }

    function tickClock() {
      var s = Math.floor((performance.now() - started) / 1000);
      secsEl.textContent = s;
      if (muted && performance.now() - started > 1400) toast.hidden = false;
    }

    function talking(on) {
      if (on === speaking) return;
      speaking = on;
      root.classList.toggle('is-talking', on);
      clearInterval(spawn); clearInterval(clock);
      if (on) {
        started = performance.now();
        wave();
        spawn = setInterval(wave, 420);
        clock = setInterval(tickClock, 250);
      }
    }

    function setMuted(m) {
      muted = m;
      mute.setAttribute('aria-pressed', m ? 'true' : 'false');
      muteLabel.textContent = m ? 'Unmute' : 'Mute';
      root.classList.toggle('is-live', !m);
      if (!m) toast.hidden = true;
    }

    talk.addEventListener('pointerdown', function (e) { if (e.button === 0) { talk.setPointerCapture && talk.setPointerCapture(e.pointerId); talking(true); } });
    talk.addEventListener('pointerup', function () { talking(false); });
    talk.addEventListener('pointercancel', function () { talking(false); });
    talk.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); talking(true); } });
    talk.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); talking(false); } });
    mute.addEventListener('click', function () { setMuted(!muted); });
    inline.addEventListener('click', function () { setMuted(false); talk.focus(); });

    root.talking = talking;
    root.setMuted = setMuted;
    setMuted(true);
  }

  window.initMuteMime = initMuteMime;
  function boot() { document.querySelectorAll('[data-mi="mute-mime"]').forEach(initMuteMime); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
