/* Dizzy Refresh — vanilla JS. Auto-initializes every [data-mi="dizzy-refresh"].
   Drag the list down past 60px (or press the refresh button). Refreshes inside 20 seconds stack up: at 3 the
   spinner gets woozy, at 5 it's dizzy and offers to notify you instead. Replace load() with your fetch.
   Call window.initDizzyRefresh(el) for elements added later. */
(function () {
  'use strict';
  var THRESHOLD = 60, WINDOW = 20000;

  function initDizzyRefresh(root) {
    if (!root || root.__miDizzy) return;
    root.__miDizzy = true;
    var vp = root.querySelector('.dz-viewport'), spinner = root.querySelector('.dz-spinner');
    var btn = root.querySelector('.dz-refresh'), status = root.querySelector('.dz-status');
    var notify = root.querySelector('.dz-notify'), sw = root.querySelector('.dz-switch');
    var lastTime = root.getAttribute('data-last') || 'a while ago';
    var startY = null, pull = 0, loading = false, times = [], calm = 0;

    function setPull(px) {
      pull = px;
      root.style.setProperty('--dz-pull', px.toFixed(1));
      // The arc draws itself as you pull; at the threshold it is three quarters round.
      spinner.style.setProperty('--dz-arc', (Math.min(1, px / THRESHOLD) * 75).toFixed(1));
    }

    function load(done) { setTimeout(done, 900); }

    function refresh() {
      if (loading) return;
      loading = true;
      var now = Date.now();
      times = times.filter(function (t) { return now - t < WINDOW; });
      times.push(now);
      var n = times.length;
      root.classList.toggle('is-woozy', n >= 3);
      root.classList.add('is-loading');
      setPull(THRESHOLD);
      clearTimeout(calm);
      load(function () {
        loading = false;
        root.classList.remove('is-loading');
        root.classList.toggle('is-dizzy', n >= 5);
        if (n >= 5) {
          status.textContent = 'Nothing new since ' + lastTime + '. I’ll tell you when there is. Please stop.';
          notify.hidden = false;
          setTimeout(function () { setPull(0); }, 1800);
        } else {
          status.textContent = n === 1 ? 'Nothing new. Last message arrived at ' + lastTime + '.'
            : n === 2 ? 'Still nothing new since ' + lastTime + '.'
            : n === 3 ? 'Nothing. The spinner is getting woozy.'
            : 'Nothing. Again. The spinner needs a minute.';
          setPull(0);
        }
        calm = setTimeout(function () { root.classList.remove('is-woozy', 'is-dizzy'); times = []; }, 8000);
      });
    }

    vp.addEventListener('pointerdown', function (e) {
      if (loading || e.button !== 0) return;
      startY = e.clientY;
      vp.setPointerCapture && vp.setPointerCapture(e.pointerId);
      root.classList.add('is-dragging');
    });
    vp.addEventListener('pointermove', function (e) {
      if (startY == null) return;
      var dy = Math.max(0, e.clientY - startY);
      setPull(Math.min(110, dy * 0.55)); // rubber-band resistance
    });
    function end() {
      if (startY == null) return;
      startY = null;
      root.classList.remove('is-dragging');
      if (pull >= THRESHOLD) refresh(); else setPull(0);
    }
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    btn.addEventListener('click', refresh);
    sw.addEventListener('change', function () {
      status.textContent = sw.checked ? 'Okay. You’ll get a notification. You can stop pulling now.' : 'Notifications off. Pull away.';
      if (sw.checked) { root.classList.remove('is-dizzy', 'is-woozy'); times = []; }
    });
    setPull(0);
  }

  window.initDizzyRefresh = initDizzyRefresh;
  function boot() { document.querySelectorAll('[data-mi="dizzy-refresh"]').forEach(initDizzyRefresh); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
