/* Access Ladder — vanilla JS. Auto-initializes every [data-mi="access-ladder"].
   Rungs are [data-level] buttons from most private (0) up. Call window.initAccessLadder(el) for later elements. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var COUNTS = [1, 4, 49, Infinity];
  var PALETTE = ['var(--chart-2)', 'var(--success-text)', 'var(--warning-text)', 'var(--chart-6)', 'var(--chart-1)', 'var(--chart-7)', 'var(--chart-5)'];
  var GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/></svg>';

  function initAccessLadder(root) {
    if (!root || root.__miLadder) return;
    root.__miLadder = true;
    var rungs = Array.prototype.slice.call(root.querySelectorAll('.al-rung'));
    var crowd = root.querySelector('.al-crowd');
    var reach = root.querySelector('.al-reach');
    var warn = root.querySelector('.al-warn');
    var copy = root.querySelector('.al-copy');
    var link = root.querySelector('.al-link');
    var level = -1;
    var gen = 0;

    // Few people: one row beside You, centered vertically (You spans 2 columns and 2 rows)
    function fit(n) {
      var cols = Math.floor((crowd.clientWidth - 24 + 4) / 18);
      crowd.classList.toggle('is-few', n > 1 && n - 1 <= cols - 2);
    }
    if (window.ResizeObserver) new ResizeObserver(function () { fit(crowd.querySelectorAll('.al-p:not(.is-out)').length); }).observe(crowd);

    function people(n) {
      var have = crowd.querySelectorAll('.al-p:not(.is-out)');
      var g = crowd.querySelector('.al-globe');
      if (g) g.remove();
      if (n === Infinity) {
        crowd.querySelectorAll('.al-p').forEach(function (p) { p.remove(); });
        var gl = document.createElement('span'); gl.className = 'al-globe'; gl.innerHTML = GLOBE; crowd.appendChild(gl);
        return;
      }
      if (!have.length) {
        var you = document.createElement('span'); you.className = 'al-p is-you'; you.textContent = 'You'; you.style.setProperty('--c', 'var(--chart-1)');
        crowd.appendChild(you);
        have = [you];
      }
      var cur = have.length;
      for (var i = cur; i < n; i++) {
        var p = document.createElement('span'); p.className = 'al-p';
        p.style.setProperty('--c', PALETTE[i % PALETTE.length]);
        p.style.animationDelay = Math.min((i - cur) * 12, 400) + 'ms';
        crowd.appendChild(p);
      }
      gen++;
      if (n >= cur) { fit(n); return; }
      // Leaving: the last dots shrink away first, mirroring how they arrived. Their cells are held until
      // the last one is gone, then the ones that stay glide to their new spots instead of jumping.
      var quick = reduce.matches;
      var wait = quick ? 0 : 260 + Math.min((cur - 1 - n) * 6, 200) + 30;
      for (var j = cur - 1; j >= n; j--) {
        var el = have[j];
        el.style.animationDelay = Math.min((cur - 1 - j) * 6, 200) + 'ms';
        el.classList.add('is-out');
      }
      var mine = gen;
      function settle() {
        if (mine !== gen) return;
        crowd.querySelectorAll('.al-p.is-out').forEach(function (o) { o.remove(); });
        var keep = Array.prototype.slice.call(crowd.querySelectorAll('.al-p'));
        var first = keep.map(function (k) { return k.getBoundingClientRect(); });
        fit(n);
        if (quick) return;
        keep.forEach(function (k, i) {
          var r = k.getBoundingClientRect();
          var dx = first[i].left - r.left, dy = first[i].top - r.top;
          if (dx || dy) k.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
        });
      }
      if (quick) settle(); else setTimeout(settle, wait);
    }

    function set(l, focus) {
      if (l === level) return;
      level = l;
      root.setAttribute('data-level', l);
      root.style.setProperty('--al-level', l);
      rungs.forEach(function (r) {
        var rl = Number(r.getAttribute('data-level'));
        r.setAttribute('aria-checked', rl === l ? 'true' : 'false');
        r.tabIndex = rl === l ? 0 : -1;
        r.classList.toggle('is-reached', rl <= l);
      });
      people(COUNTS[l]);
      var b = document.createElement('b');
      b.textContent = COUNTS[l] === Infinity ? 'Anyone' : COUNTS[l] === 1 ? 'Only you' : COUNTS[l] + ' people';
      reach.replaceChildren(b, document.createTextNode(COUNTS[l] === Infinity ? ' with the link can open it.' : COUNTS[l] === 1 ? ' can open it.' : ' can open it.'));
      warn.hidden = l !== 3;
      copy.disabled = l === 0;
      link.style.opacity = l === 0 ? 0.4 : 1;
      if (focus) rungs.filter(function (r) { return Number(r.getAttribute('data-level')) === l; })[0].focus();
    }

    rungs.forEach(function (r) {
      r.addEventListener('click', function () { set(Number(r.getAttribute('data-level'))); });
      r.addEventListener('keydown', function (e) {
        var d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
        if (d == null) return;
        e.preventDefault();
        set(Math.max(0, Math.min(rungs.length - 1, level + d)), true);
      });
    });
    copy.addEventListener('click', function () {
      try { navigator.clipboard.writeText('https://' + link.textContent).catch(function () {}); } catch (e) {}
      copy.textContent = 'Copied'; copy.classList.add('is-done');
      setTimeout(function () { copy.textContent = 'Copy Link'; copy.classList.remove('is-done'); }, 1400);
    });
    set(Number((root.querySelector('[aria-checked="true"]') || rungs[0]).getAttribute('data-level')));
  }

  window.initAccessLadder = initAccessLadder;
  function boot() { document.querySelectorAll('[data-mi="access-ladder"]').forEach(initAccessLadder); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
