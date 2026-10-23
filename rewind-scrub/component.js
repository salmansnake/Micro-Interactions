/* Rewind Scrub — vanilla JS. Auto-initializes every [data-mi="rewind-scrub"].
   Pass real history with root.setVersions([{ text, who, color, ago, what }]). Call window.initRewindScrub(el) for later elements. */
(function () {
  'use strict';
  var VERSIONS = [
    { text: 'Launch notes', who: 'You', color: 'var(--chart-1)', ago: '2 hours ago', what: 'created the page' },
    { text: 'Launch notes\nWe ship billing on Monday.', who: 'You', color: 'var(--chart-1)', ago: '2 hours ago', what: 'added the first line' },
    { text: 'Launch notes\nWe ship the new billing page on Monday.', who: 'Mira', color: 'var(--chart-2)', ago: '1 hour ago', what: 'clarified what ships' },
    { text: 'Launch notes\nWe ship the new billing page on Monday. Annual plans show savings up front.', who: 'Mira', color: 'var(--chart-2)', ago: '48 minutes ago', what: 'added the pricing line' },
    { text: 'Launch notes\nWe ship the new billing page on Monday. Annual plans now show their savings up front.', who: 'You', color: 'var(--chart-1)', ago: '31 minutes ago', what: 'tightened the wording' },
    { text: 'Launch notes\nWe ship the new billing page on Monday. Annual plans now show their savings up front.\nSupport has the FAQ ready.', who: 'Sam', color: 'var(--chart-4)', ago: '20 minutes ago', what: 'added a support note' },
    { text: 'Launch notes\nWe ship the new billing page on Monday. Annual plans now show their savings up front.\nSupport is drafting the FAQ.', who: 'Mira', color: 'var(--chart-2)', ago: '9 minutes ago', what: 'corrected the FAQ status' },
    { text: 'Billing launch notes\nWe ship the new billing page on Monday. Annual plans now show their savings up front.\nSupport is drafting the FAQ.', who: 'You', color: 'var(--chart-1)', ago: 'Just now', what: 'renamed the page' }
  ];

  // Word-level diff (LCS). Returns [{t:'same'|'ins'|'del', s:string}]
  function diff(a, b) {
    var A = a.split(/(\s+)/), B = b.split(/(\s+)/), n = A.length, m = B.length, L = [];
    for (var i = 0; i <= n; i++) { L.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var out = []; i = 0; j = 0;
    function push(t, s) { if (out.length && out[out.length - 1].t === t) out[out.length - 1].s += s; else out.push({ t: t, s: s }); }
    while (i < n && j < m) {
      if (A[i] === B[j]) { push('same', A[i]); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) { push('del', A[i]); i++; }
      else { push('ins', B[j]); j++; }
    }
    while (i < n) push('del', A[i++]);
    while (j < m) push('ins', B[j++]);
    return out;
  }

  function initRewindScrub(root) {
    if (!root || root.__miRewind) return;
    root.__miRewind = true;
    var versions = VERSIONS.slice();
    var doc = root.querySelector('.rw-doc');
    var avatar = root.querySelector('.rw-avatar');
    var what = root.querySelector('.rw-what');
    var range = root.querySelector('.rw-range');
    var ticks = root.querySelector('.rw-ticks');
    var bubble = root.querySelector('.rw-bubble');
    var restore = root.querySelector('.rw-restore');
    var live = root.querySelector('.rw-live');
    var shown = -1;

    function buildTicks() {
      ticks.replaceChildren();
      versions.forEach(function () { ticks.appendChild(document.createElement('i')); });
      range.max = versions.length - 1;
    }

    // Render a version, showing what that edit changed relative to the one before it.
    function show(v) {
      if (v === shown) return;
      shown = v;
      var cur = versions[v], prev = v > 0 ? versions[v - 1].text : '';
      var parts = diff(prev, cur.text);
      doc.replaceChildren();
      var firstLine = true;
      parts.forEach(function (p) {
        var lines = p.s.split('\n');
        lines.forEach(function (chunk, k) {
          if (k > 0) { doc.appendChild(document.createTextNode('\n')); firstLine = false; }
          if (!chunk) return;
          var el;
          if (p.t === 'same') el = document.createTextNode(chunk);
          else { el = document.createElement('span'); el.className = p.t === 'ins' ? 'rw-ins' : 'rw-del'; el.textContent = chunk; }
          if (firstLine) { var h = document.createElement('span'); h.className = 'rw-h'; h.appendChild(el); el = h; }
          doc.appendChild(el);
        });
      });
      avatar.textContent = cur.who[0];
      avatar.style.background = cur.color;
      var b = document.createElement('b'); b.textContent = cur.who;
      what.replaceChildren(b, document.createTextNode(' ' + cur.what + ' · ' + cur.ago));
      var last = versions.length - 1;
      root.classList.toggle('is-past', v < last);
      live.textContent = v < last ? 'Viewing Version ' + (v + 1) : 'Live';
      restore.hidden = v === last;
      Array.prototype.forEach.call(ticks.children, function (t, i) { t.classList.toggle('is-past', i < v); t.classList.toggle('is-on', i === v); });
      bubble.textContent = cur.ago;
      var pct = v / last;
      bubble.style.setProperty('--x', 'calc(' + (pct * 100) + '% + ' + (11 - pct * 22) + 'px)');
      range.setAttribute('aria-valuetext', 'Version ' + (v + 1) + ' of ' + versions.length + ', ' + cur.who + ' ' + cur.what + ', ' + cur.ago);
    }

    range.addEventListener('input', function () { show(Number(range.value)); });
    restore.addEventListener('click', function () {
      var v = Number(range.value), picked = versions[v];
      versions.push({ text: picked.text, who: 'You', color: 'var(--chart-1)', ago: 'Just now', what: 'restored version ' + (v + 1) });
      buildTicks();
      range.value = versions.length - 1;
      shown = -1;
      show(versions.length - 1);
      range.focus();
    });
    root.setVersions = function (list) { versions = list.slice(); buildTicks(); range.value = versions.length - 1; shown = -1; show(versions.length - 1); };
    buildTicks();
    show(versions.length - 1);
  }

  window.initRewindScrub = initRewindScrub;
  function boot() { document.querySelectorAll('[data-mi="rewind-scrub"]').forEach(initRewindScrub); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
