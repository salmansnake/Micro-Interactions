/* Clipboard Stack — vanilla JS. Auto-initializes every [data-mi="clipboard-stack"].
   Any [data-copy] button inside the root copies its value. Call window.initClipboardStack(el) for later elements. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var KEEP = 5;

  function ago(t) {
    var s = Math.round((Date.now() - t) / 1000);
    if (s < 10) return 'Just now';
    if (s < 60) return s + ' seconds ago';
    var m = Math.round(s / 60);
    return m + (m === 1 ? ' minute ago' : ' minutes ago');
  }

  function writeClipboard(text) {
    try { return navigator.clipboard.writeText(text).catch(function () {}); } catch (e) { return Promise.resolve(); }
  }

  function initClipboardStack(root) {
    if (!root || root.__miClip) return;
    root.__miClip = true;
    var dock = root.querySelector('.cs-dock');
    var badge = root.querySelector('.cs-badge');
    var pop = root.querySelector('.cs-pop');
    var list = root.querySelector('.cs-list');
    var clear = root.querySelector('.cs-clear');
    var sr = root.querySelector('.cs-sr');
    var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    var stack = []; // newest first: { text, label, t }
    var COPIED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Copied';
    // Each copy button is as wide as its "Copied" state from the start, so confirming never resizes it
    root.querySelectorAll('.cs-copy').forEach(function (b) { var keep = b.innerHTML; b.innerHTML = COPIED; var w = parseFloat(getComputedStyle(b).width); b.innerHTML = keep; if (w) b.style.minWidth = Math.ceil(w) + 'px'; });

    function render() {
      root.setAttribute('data-count', String(Math.min(stack.length, 3)));
      root.classList.toggle('has-items', stack.length > 0);
      root.classList.toggle('is-many', stack.length >= 3);
      badge.textContent = stack.length;
      dock.setAttribute('aria-label', 'Recent copies, ' + stack.length + (stack.length === 1 ? ' item' : ' items'));
      list.replaceChildren();
      stack.forEach(function (item) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cs-again';
        var code = document.createElement('code'); code.textContent = item.text;
        var small = document.createElement('small'); small.textContent = item.label + ' · ' + ago(item.t);
        b.append(code, small);
        b.addEventListener('click', function () {
          writeClipboard(item.text);
          add(item.text, item.label, null);
          var top = list.querySelector('.cs-again');
          if (top) { top.querySelector('small').textContent = item.label + ' · Copied again'; top.focus(); }
        });
        var x = document.createElement('button');
        x.type = 'button';
        x.className = 'cs-x';
        x.setAttribute('aria-label', 'Remove ' + item.label);
        x.innerHTML = X;
        x.addEventListener('click', function () { remove(item.text, li); });
        li.append(b, x);
        list.appendChild(li);
      });
    }

    // Remove one copy: the count drops by one, the rest stay.
    function remove(text, li) {
      var i = stack.findIndex(function (s) { return s.text === text; });
      if (i < 0) return;
      var label = stack[i].label;
      function finish() {
        stack.splice(i, 1);
        render();
        var rest = list.querySelectorAll('.cs-x');
        (rest[Math.min(i, rest.length - 1)] || pop).focus();
        sr.textContent = label + ' removed';
      }
      if (reduce.matches) { finish(); return; }
      li.classList.add('is-out');
      setTimeout(finish, 180);
    }

    // Clear everything: the badge goes away and the paper slips fold back in.
    clear.addEventListener('click', function () {
      stack = [];
      render();
      pop.focus();
      sr.textContent = 'All copies cleared';
    });
    function add(text, label, from) {
      stack = stack.filter(function (s) { return s.text !== text; });
      stack.unshift({ text: text, label: label, t: Date.now() });
      stack = stack.slice(0, KEEP);
      if (!from || reduce.matches) { render(); bump(); return; }
      fly(text, from, function () { render(); bump(); });
    }

    function bump() {
      dock.classList.remove('is-hit');
      void dock.offsetWidth;
      dock.classList.add('is-hit');
    }

    function fly(text, from, done) {
      var o = root.getBoundingClientRect();
      var a = from.getBoundingClientRect();
      var b = dock.getBoundingClientRect();
      var slip = document.createElement('span');
      slip.className = 'cs-slip';
      slip.textContent = text;
      root.appendChild(slip);
      var sw = slip.offsetWidth, shh = slip.offsetHeight;
      var x0 = a.left + a.width / 2 - o.left - sw / 2, y0 = a.top + a.height / 2 - o.top - shh / 2;
      var x1 = b.left + b.width / 2 - o.left - sw / 2, y1 = b.top + b.height / 2 - o.top - shh / 2;
      var frames = [];
      for (var i = 0; i <= 12; i++) {
        var t = i / 12;
        var x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 60;
        var s = t < 0.15 ? 0.8 + t / 0.15 * 0.2 : 1 - Math.max(0, t - 0.6) / 0.4 * 0.8;
        frames.push({ transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (-8 * Math.sin(t * Math.PI)).toFixed(1) + 'deg) scale(' + s.toFixed(3) + ')', opacity: t > 0.9 ? (1 - t) * 10 : 1 });
      }
      slip.animate(frames, { duration: 620, easing: 'cubic-bezier(.35,.1,.5,1)', fill: 'forwards' }).finished.then(function () { slip.remove(); done(); });
    }

    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-copy]');
      if (!btn || !root.contains(btn)) return;
      var text = btn.getAttribute('data-copy');
      var row = btn.closest('.cs-row');
      var label = row && row.querySelector('.cs-label') ? row.querySelector('.cs-label').textContent : 'Copied';
      writeClipboard(text);
      add(text, label, btn);
      var old = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', old);
      btn.innerHTML = COPIED;
      btn.classList.add('is-done');
      setTimeout(function () { btn.textContent = old; btn.classList.remove('is-done'); }, 1400);
    });

    function setOpen(on) {
      pop.hidden = !on;
      dock.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) { render(); var first = list.querySelector('.cs-again'); if (first) first.focus(); else pop.focus(); }
    }
    dock.addEventListener('click', function () { setOpen(pop.hidden); });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { setOpen(false); dock.focus(); } });
    document.addEventListener('pointerdown', function (e) {
      if (!pop.hidden && !pop.contains(e.target) && !dock.contains(e.target)) setOpen(false);
    });

    render();
  }

  window.initClipboardStack = initClipboardStack;
  function boot() { document.querySelectorAll('[data-mi="clipboard-stack"]').forEach(initClipboardStack); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
