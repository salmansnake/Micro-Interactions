/* Offline Queue — vanilla JS. Auto-initializes every [data-mi="offline-queue"].
   The demo's Online switch stands in for navigator.onLine; wire the real 'online'/'offline' events in production.
   Call window.initOfflineQueue(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Even line breaks: text that wraps to two or three lines is narrowed until its lines are close in length,
  // with the first line the longest, so no line runs long while the next holds a word or two.
  function evenLines(root) {
    var SEL = 'p, li, dd, dt, small, label, figcaption, h1, h2, h3, h4';
    function widths(el) {
      var range = document.createRange(), rows = [];
      range.selectNodeContents(el);
      Array.prototype.forEach.call(range.getClientRects(), function (b) {
        if (!b.width) return;
        var row = rows.filter(function (x) { return Math.abs(x.t - b.top) < b.height / 2; })[0];
        if (row) { row.l = Math.min(row.l, b.left); row.r = Math.max(row.r, b.right); } else rows.push({ t: b.top, l: b.left, r: b.right });
      });
      return rows.sort(function (a, b) { return a.t - b.t; }).map(function (x) { return x.r - x.l; });
    }
    function fit(el) {
      el.style.maxWidth = ''; el.style.textWrap = '';
      var cs = getComputedStyle(el), full = el.getBoundingClientRect().width;
      if (!full || cs.whiteSpace === 'nowrap' || /flex|grid/.test(cs.display)) return;
      if (Array.prototype.some.call(el.children, function (c) { return !/^inline/.test(getComputedStyle(c).display); })) return;
      el.style.textWrap = 'wrap';
      var n = widths(el).length, lo = 0, hi = full, w, L;
      if (n < 2 || n > 3) { el.style.textWrap = ''; return; }
      while (hi - lo > 1) { w = (lo + hi) / 2; el.style.maxWidth = w + 'px'; if (widths(el).length > n) lo = w; else hi = w; }
      var best = 0, gap = Infinity;
      for (w = Math.ceil(hi); w <= full; w += 2) {
        el.style.maxWidth = w + 'px'; L = widths(el);
        // Each line no longer than the one above (within 10%, which reads as equal). Keep the most even width,
        // and prefer the first line longer: a last line longer than the first costs three times its overhang
        var score = Math.max.apply(null, L) - Math.min.apply(null, L) + Math.max(0, L[n - 1] - L[0]) * 3;
        if (L.length === n && L.every(function (x, i) { return !i || x <= L[i - 1] * 1.1 + 1; }) && score < gap) { gap = score; best = w; }
      }
      if (!best) { el.style.maxWidth = ''; el.style.textWrap = ''; return; }
      el.style.maxWidth = best + 'px';
      if (cs.textAlign === 'center' && cs.display === 'block') { el.style.marginLeft = 'auto'; el.style.marginRight = 'auto'; }
    }
    var queued = false, lastW = 0;
    function run() { queued = false; Array.prototype.forEach.call(root.querySelectorAll(SEL), fit); }
    function later() { if (!queued) { queued = true; requestAnimationFrame(run); } }
    later();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    if (window.ResizeObserver) new ResizeObserver(function () { var w = root.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; later(); } }).observe(root);
    if (window.MutationObserver) new MutationObserver(later).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
  }

  function initOfflineQueue(root) {
    if (!root || root.__miQueue) return;
    root.__miQueue = true;
    evenLines(root);
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
