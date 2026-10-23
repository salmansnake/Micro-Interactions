/* Offline Queue — vanilla JS. Auto-initializes every [data-mi="offline-queue"].
   The demo's Online switch stands in for navigator.onLine; wire the real 'online'/'offline' events in production.
   Call window.initOfflineQueue(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initOfflineQueue(root) {
    if (!root || root.__miQueue) return;
    root.__miQueue = true;
    var list = root.querySelector('.oq-list');
    var online = root.querySelector('.oq-online');
    var stateText = root.querySelector('.oq-state-text');
    var cloud = root.querySelector('.oq-cloud');
    var queueEl = root.querySelector('.oq-queue');
    var chips = root.querySelector('.oq-chips');
    var queueText = root.querySelector('.oq-queue-text');
    var form = root.querySelector('.oq-add');
    var input = root.querySelector('.oq-input');
    var queue = []; // rows with an unsynced change, in order
    var flushing = false;

    function plural(n) { return n + (n === 1 ? ' change' : ' changes'); }
    function renderQueue() {
      queueEl.hidden = queue.length === 0;
      queueText.textContent = plural(queue.length) + ' waiting to sync';
      while (chips.children.length < Math.min(queue.length, 4)) { var c = document.createElement('span'); c.className = 'oq-chip'; chips.appendChild(c); }
      while (chips.children.length > Math.min(queue.length, 4)) chips.lastChild.remove();
    }
    function setState() {
      var on = online.checked;
      root.classList.toggle('is-offline', !on);
      stateText.textContent = on
        ? (queue.length ? 'Back online · Syncing' : 'Online · All changes saved')
        : 'Offline · Changes save on this device';
    }

    function flashSynced(row) {
      row.classList.remove('is-pending');
      row.classList.add('is-synced');
      setTimeout(function () { row.classList.remove('is-synced'); }, 1400);
    }

    function changed(row) {
      if (online.checked) { flashSynced(row); return; }
      if (queue.indexOf(row) === -1) queue.push(row);
      row.classList.remove('is-synced');
      row.classList.add('is-pending');
      renderQueue();
      setState();
    }

    function flyTo(fromEl, toEl, done) {
      if (reduce.matches) { done(); return; }
      var o = root.getBoundingClientRect(), a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      var f = document.createElement('span'); f.className = 'oq-fly'; root.appendChild(f);
      var x0 = a.left - o.left + a.width / 2 - 9, y0 = a.top - o.top + a.height / 2 - 11;
      var x1 = b.left - o.left + b.width / 2 - 9, y1 = b.top - o.top + b.height / 2 - 11;
      var frames = [];
      for (var k = 0; k <= 10; k++) {
        var t = k / 10;
        frames.push({ transform: 'translate(' + (x0 + (x1 - x0) * t) + 'px,' + (y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 40) + 'px) rotate(' + (t * -20) + 'deg) scale(' + (1 - t * 0.5) + ')', opacity: t > 0.85 ? (1 - t) / 0.15 : 1 });
      }
      f.animate(frames, { duration: 520, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }).finished.then(function () { f.remove(); done(); });
    }

    function flush() {
      if (flushing || !queue.length || !online.checked) { setState(); return; }
      flushing = true;
      setState();
      (function next() {
        if (!queue.length || !online.checked) { flushing = false; setState(); return; }
        var row = queue.shift();
        var from = chips.lastChild || queueEl;
        flyTo(from, cloud, function () {
          cloud.classList.remove('is-hit'); void cloud.offsetWidth; cloud.classList.add('is-hit');
          flashSynced(row);
          renderQueue();
          setTimeout(next, 160);
        });
      })();
    }

    list.addEventListener('click', function (e) {
      var b = e.target.closest('.oq-check');
      if (!b) return;
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var text = b.nextElementSibling.textContent;
      b.setAttribute('aria-label', text + (on ? ', done' : ''));
      changed(b.closest('.oq-row'));
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      var li = document.createElement('li');
      li.className = 'oq-row is-new';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'oq-check'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', v);
      var t = document.createElement('span'); t.className = 'oq-text'; t.textContent = v;
      var badge = document.createElement('span'); badge.className = 'oq-badge'; badge.setAttribute('aria-hidden', 'true');
      li.append(b, t, badge);
      list.appendChild(li);
      input.value = '';
      changed(li);
    });
    online.addEventListener('change', function () {
      online.setAttribute('aria-label', online.checked ? 'Online' : 'Offline');
      setState();
      if (online.checked) setTimeout(flush, 300);
    });
    renderQueue();
    setState();
  }

  window.initOfflineQueue = initOfflineQueue;
  function boot() { document.querySelectorAll('[data-mi="offline-queue"]').forEach(initOfflineQueue); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
