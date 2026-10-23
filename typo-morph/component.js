/* Typo Morph — vanilla JS. Auto-initializes every [data-mi="typo-morph"].
   Pass your own index with root.setIndex([{ name, path, color }]). Call window.initTypoMorph(el) for later elements. */
(function () {
  'use strict';
  var ITEMS = [
    ['Billing', 'Settings', 'var(--chart-4)'], ['Invoices', 'Billing', 'var(--chart-4)'], ['Plans', 'Billing', 'var(--chart-4)'],
    ['Usage', 'Billing', 'var(--chart-4)'], ['Members', 'Workspace', 'var(--chart-1)'], ['Teams', 'Workspace', 'var(--chart-1)'],
    ['Roles', 'Workspace', 'var(--chart-1)'], ['Integrations', 'Apps', 'var(--chart-4)'], ['Webhooks', 'Developers', 'var(--chart-4)'],
    ['API Keys', 'Developers', 'var(--chart-4)'], ['Notifications', 'Account', 'var(--chart-3)'], ['Profile', 'Account', 'var(--chart-3)'],
    ['Security', 'Account', 'var(--chart-3)'], ['Single Sign-On', 'Security', 'var(--chart-3)'], ['Audit Log', 'Security', 'var(--chart-3)'],
    ['Domains', 'Workspace', 'var(--chart-1)'], ['Branding', 'Workspace', 'var(--chart-1)'], ['Exports', 'Data', 'var(--chart-5)'],
    ['Imports', 'Data', 'var(--chart-5)'], ['Templates', 'Content', 'var(--chart-2)']
  ].map(function (r) { return { name: r[0], path: r[1], color: r[2] }; });

  // Levenshtein with a traceback: returns the edit steps from a to b.
  function align(a, b) {
    var n = a.length, m = b.length, D = [];
    for (var i = 0; i <= n; i++) { D.push([i]); for (var j = 1; j <= m; j++) D[i].push(i === 0 ? j : 0); }
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    var ops = []; i = n; j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
        ops.unshift({ t: a[i - 1] === b[j - 1] ? 'keep' : 'sub', a: a[i - 1], b: b[j - 1] }); i--; j--;
      } else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { ops.unshift({ t: 'del', a: a[i - 1] }); i--; }
      else { ops.unshift({ t: 'ins', b: b[j - 1] }); j--; }
    }
    return { dist: D[n][m], ops: ops };
  }

  function initTypoMorph(root) {
    if (!root || root.__miTypo) return;
    root.__miTypo = true;
    var items = ITEMS;
    var input = root.querySelector('.tm-input');
    var fix = root.querySelector('.tm-fix');
    var list = root.querySelector('.tm-results');
    var timer = 0;
    var suggestion = null;

    function search(q) {
      q = q.trim().toLowerCase();
      if (!q) return [];
      return items.filter(function (it) { return it.name.toLowerCase().indexOf(q) > -1 || it.path.toLowerCase().indexOf(q) > -1; });
    }
    function closest(q) {
      q = q.trim().toLowerCase();
      var best = null;
      items.forEach(function (it) {
        var name = it.name.toLowerCase();
        var r = align(q, name);
        var score = r.dist / Math.max(q.length, name.length);
        if (!best || score < best.score) best = { score: score, term: name, ops: r.ops };
      });
      return best && best.score <= 0.45 ? best : null;
    }

    function showResults(found, q) {
      list.replaceChildren();
      found.slice(0, 5).forEach(function (it, k) {
        var li = document.createElement('li');
        li.style.animationDelay = (k * 40) + 'ms';
        var icon = document.createElement('i'); icon.textContent = it.name[0]; icon.style.background = it.color;
        var b = document.createElement('b');
        var name = it.name, ix = name.toLowerCase().indexOf(q);
        if (q && ix > -1) {
          b.appendChild(document.createTextNode(name.slice(0, ix)));
          var mk = document.createElement('mark'); mk.textContent = name.slice(ix, ix + q.length); b.appendChild(mk);
          b.appendChild(document.createTextNode(name.slice(ix + q.length)));
        } else b.textContent = name;
        var small = document.createElement('small'); small.textContent = it.path;
        li.appendChild(icon); li.appendChild(b); li.appendChild(small);
        list.appendChild(li);
      });
    }

    function morph(q, best) {
      suggestion = best.term;
      fix.replaceChildren();
      var none = document.createElement('p'); none.className = 'tm-none';
      none.textContent = 'No results for “' + q.trim() + '”. Showing results for';
      var word = document.createElement('button'); word.type = 'button'; word.className = 'tm-word';
      word.setAttribute('aria-label', 'Search for ' + best.term);
      var step = 0;
      best.ops.forEach(function (op) {
        var s = document.createElement('span');
        s.className = 'tm-ch';
        if (op.t === 'keep') s.textContent = op.b;
        else {
          s.classList.add(op.t === 'del' ? 'is-del' : op.t === 'ins' ? 'is-ins' : 'is-sub');
          s.textContent = op.t === 'del' ? op.a : op.b;
          s.style.setProperty('--d', (250 + step++ * 120) + 'ms');
        }
        word.appendChild(s);
      });
      word.addEventListener('click', accept);
      var hint = document.createElement('p'); hint.className = 'tm-hint';
      var kbd = document.createElement('kbd'); kbd.textContent = 'Tab';
      hint.append('Press ', kbd, ' to search for it instead.');
      fix.append(none, word, hint);
      var found = search(best.term);
      setTimeout(function () { if (suggestion === best.term) showResults(found, best.term); }, 250 + step * 120);
    }

    function run() {
      var q = input.value;
      suggestion = null;
      var found = search(q);
      if (found.length || q.trim().length < 3) { fix.replaceChildren(); showResults(found, q.trim().toLowerCase()); return; }
      var best = closest(q);
      list.replaceChildren();
      if (best) morph(q, best);
      else { fix.replaceChildren(); var p = document.createElement('p'); p.className = 'tm-none'; p.textContent = 'No results for “' + q.trim() + '”.'; fix.appendChild(p); }
    }

    function accept() {
      if (!suggestion) return;
      var item = items.filter(function (it) { return it.name.toLowerCase() === suggestion; })[0];
      input.value = item ? item.name : suggestion;
      input.focus();
      run();
    }

    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 280); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && suggestion && !e.shiftKey) { e.preventDefault(); accept(); }
      if (e.key === 'Enter') { clearTimeout(timer); run(); }
    });
    root.querySelectorAll('[data-try]').forEach(function (b) {
      b.addEventListener('click', function () { input.value = b.getAttribute('data-try'); run(); });
    });
    root.setIndex = function (arr) { items = arr; run(); };
  }

  window.initTypoMorph = initTypoMorph;
  function boot() { document.querySelectorAll('[data-mi="typo-morph"]').forEach(initTypoMorph); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
