/* Scope Chips — vanilla JS. Auto-initializes every [data-mi="scope-chips"].
   Filters are key:value tokens. Swap DATA and KEYS for your own. Call window.initScopeChips(el) for later elements. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var KEYS = {
    from: { label: 'From', values: ['mira', 'sam', 'ali', 'stripe'] },
    in: { label: 'In', values: ['billing', 'design', 'support'] },
    is: { label: 'Is', values: ['unread', 'starred'] }
  };
  var COLORS = { mira: 'var(--chart-2)', sam: 'var(--chart-4)', ali: 'var(--chart-3)', stripe: 'var(--chart-1)' };
  var DATA = [
    { from: 'mira', in: 'design', unread: true, starred: false, title: 'Pricing page v3', text: 'New hero and the yearly savings tray' },
    { from: 'sam', in: 'billing', unread: true, starred: true, title: 'Offsite expense', text: '$2,400 for the Austin trip, receipts attached' },
    { from: 'stripe', in: 'billing', unread: false, starred: false, title: 'Payout sent', text: '$4,120 is on its way to your bank' },
    { from: 'ali', in: 'support', unread: false, starred: true, title: 'Refund question', text: 'Customer asking about annual plan refunds' },
    { from: 'mira', in: 'support', unread: false, starred: false, title: 'FAQ draft', text: 'First pass at billing questions' },
    { from: 'sam', in: 'design', unread: true, starred: false, title: 'Icon set', text: 'Exported at 1x, 2x and 3x' }
  ];
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

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
      // A filled box marked data-fill spans the card from edge to edge, and its text fills it
      if (el.hasAttribute('data-fill')) return;
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

  function initScopeChips(root) {
    if (!root || root.__miScope) return;
    root.__miScope = true;
    evenLines(root);
    var field = root.querySelector('.sx-field');
    var chipsBox = root.querySelector('.sx-chips');
    var input = root.querySelector('.sx-input');
    var suggest = root.querySelector('.sx-suggest');
    var results = root.querySelector('.sx-results');
    var filters = []; // [{key, value}]
    var options = [], active = 0;

    function chip(f) {
      var c = document.createElement('span');
      c.className = 'sx-chip';
      c.setAttribute('data-key', f.key);
      var k = document.createElement('small'); k.textContent = KEYS[f.key].label;
      var v = document.createElement('b'); v.textContent = cap(f.value);
      var x = document.createElement('button'); x.type = 'button'; x.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
      x.setAttribute('aria-label', 'Remove filter ' + KEYS[f.key].label + ' ' + cap(f.value));
      x.addEventListener('click', function () { remove(f, false); input.focus(); });
      c.append(k, v, x);
      return c;
    }
    function renderChips(animateLast) {
      chipsBox.replaceChildren();
      filters.forEach(function (f, i) {
        var c = chip(f);
        if (!animateLast || i !== filters.length - 1) c.style.animation = 'none';
        chipsBox.appendChild(c);
      });
    }
    function add(key, value) {
      filters = filters.filter(function (f) { return f.key !== key || key === 'is'; });
      if (filters.some(function (f) { return f.key === key && f.value === value; })) return;
      filters.push({ key: key, value: value });
      renderChips(true);
      run();
    }
    // Deleting into a chip melts it back into editable text.
    function remove(f, toText) {
      var i = filters.indexOf(f);
      if (i < 0) return;
      var el = chipsBox.children[i];
      var finish = function () {
        filters.splice(i, 1);
        renderChips(false);
        if (toText) { input.value = f.key + ':' + f.value; input.setSelectionRange(input.value.length, input.value.length); }
        run();
        suggestFor();
      };
      if (reduce.matches || !el) { finish(); return; }
      el.classList.add('is-melting');
      setTimeout(finish, 220);
    }

    // Turn complete tokens in the input into chips.
    function absorb(force) {
      var parts = input.value.split(/\s+/);
      var keep = [], changed = false;
      parts.forEach(function (p, i) {
        var m = /^(\w+):(\w+)$/.exec(p);
        var complete = force || i < parts.length - 1;
        if (m && KEYS[m[1].toLowerCase()] && complete) {
          var key = m[1].toLowerCase(), val = m[2].toLowerCase();
          var match = KEYS[key].values.filter(function (v) { return v.indexOf(val) === 0; })[0];
          if (match) { add(key, match); changed = true; return; }
        }
        keep.push(p);
      });
      if (changed) input.value = keep.join(' ').replace(/^\s+/, '');
    }

    function suggestFor() {
      var m = /(\w*):?(\w*)$/.exec(input.value);
      var word = input.value.split(/\s+/).pop();
      options = [];
      var km = /^(\w+):(\w*)$/.exec(word);
      if (km && KEYS[km[1].toLowerCase()]) {
        var key = km[1].toLowerCase();
        KEYS[key].values.filter(function (v) { return v.indexOf(km[2].toLowerCase()) === 0; }).forEach(function (v) { options.push({ key: key, value: v }); });
      } else if (word && word.length >= 1) {
        Object.keys(KEYS).forEach(function (k) { if (k.indexOf(word.toLowerCase()) === 0) options.push({ key: k, value: null }); });
      }
      active = 0;
      suggest.replaceChildren();
      options.forEach(function (o, i) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.id = 'sx-opt-' + i;
        li.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        var code = document.createElement('code'); code.textContent = o.key + ':' + (o.value || '');
        var small = document.createElement('small'); small.textContent = o.value ? KEYS[o.key].label + ' ' + cap(o.value) : 'Filter by ' + KEYS[o.key].label.toLowerCase();
        li.append(code, small);
        li.addEventListener('pointerdown', function (e) { e.preventDefault(); pick(i); });
        suggest.appendChild(li);
      });
      suggest.hidden = options.length === 0;
      if (options.length) input.setAttribute('aria-activedescendant', 'sx-opt-0'); else input.removeAttribute('aria-activedescendant');
    }
    function pick(i) {
      var o = options[i];
      if (!o) return;
      var words = input.value.split(/\s+/); words.pop();
      if (o.value) { input.value = words.join(' '); add(o.key, o.value); }
      else input.value = (words.length ? words.join(' ') + ' ' : '') + o.key + ':';
      suggestFor();
      input.focus();
    }

    function run() {
      var q = input.value.trim().toLowerCase();
      var list = DATA.filter(function (d) {
        return filters.every(function (f) { return f.key === 'is' ? d[f.value] : d[f.key] === f.value; }) &&
          (!q || /\w+:/.test(q) || (d.title + ' ' + d.text).toLowerCase().indexOf(q) > -1);
      });
      results.replaceChildren();
      if (!list.length) { var n = document.createElement('li'); n.className = 'sx-none'; n.textContent = 'No messages match these filters.'; results.appendChild(n); return; }
      list.forEach(function (d, k) {
        var li = document.createElement('li'); li.style.animationDelay = (k * 30) + 'ms';
        var i = document.createElement('i'); i.textContent = d.from[0].toUpperCase(); i.style.background = COLORS[d.from];
        var div = document.createElement('div');
        var b = document.createElement('b'); b.textContent = d.title;
        var s = document.createElement('span'); s.textContent = d.text;
        div.append(b, s);
        var tag = document.createElement('small'); tag.textContent = cap(d.in);
        li.append(i, div, tag);
        results.appendChild(li);
      });
    }

    input.addEventListener('input', function () { absorb(false); suggestFor(); run(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !input.value && filters.length) { e.preventDefault(); remove(filters[filters.length - 1], true); return; }
      if (!suggest.hidden && options.length) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          active = (active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
          Array.prototype.forEach.call(suggest.children, function (li, i) { li.setAttribute('aria-selected', i === active ? 'true' : 'false'); });
          input.setAttribute('aria-activedescendant', 'sx-opt-' + active);
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pick(active); return; }
        if (e.key === 'Escape') { suggest.hidden = true; return; }
      }
      if (e.key === 'Enter') { e.preventDefault(); absorb(true); run(); }
    });
    input.addEventListener('blur', function () { setTimeout(function () { suggest.hidden = true; }, 120); });
    field.addEventListener('click', function (e) { if (e.target === field || e.target === chipsBox) input.focus(); });
    run();
  }

  window.initScopeChips = initScopeChips;
  function boot() { document.querySelectorAll('[data-mi="scope-chips"]').forEach(initScopeChips); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
