/* Token Taximeter — vanilla JS. Auto-initializes every [data-mi="token-taximeter"].
   Rates are per million tokens; tokens are estimated at 4 characters each. Swap estimate() for a real tokenizer.
   Call window.initTokenTaximeter(el) for elements added later. */
(function () {
  'use strict';
  var RATES = { fast: { in: 0.25, out: 1.25 }, smart: { in: 3, out: 15 } }; // $ per 1M tokens (example rates)
  var DIGIT_H = 40;

  function estimate(text) { return text.trim() ? Math.max(1, Math.ceil(text.length / 4)) : 0; }

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

  function initTokenTaximeter(root) {
    if (!root || root.__miTaxi) return;
    root.__miTaxi = true;
    evenLines(root);
    var input = root.querySelector('.tt-input');
    var fare = root.querySelector('.tt-fare');
    var meter = root.querySelector('.tt-meter');
    var flag = root.querySelector('.tt-flag');
    var tokensEl = root.querySelector('.tt-tokens');
    var used = root.querySelector('.tt-used');
    var next = root.querySelector('.tt-next');
    var budgetText = root.querySelector('.tt-budget-text');
    var budget = Number(root.getAttribute('data-budget')) || 10;
    var spent = Number(root.getAttribute('data-used')) || 0;
    var model = 'fast', outTokens = 300, last = '', idle = 0;

    // Odometer with fixed "$" and "." and rolling digit columns.
    function drawFare(str) {
      if (fare.children.length !== str.length || fare.getAttribute('data-shape') !== str.replace(/\d/g, '9')) {
        fare.replaceChildren();
        fare.setAttribute('data-shape', str.replace(/\d/g, '9'));
        for (var i = 0; i < str.length; i++) {
          if (/\d/.test(str[i])) {
            var col = document.createElement('span'); col.className = 'tt-col';
            for (var d = 0; d <= 9; d++) { var n = document.createElement('span'); n.textContent = d; col.appendChild(n); }
            fare.appendChild(col);
          } else { var f = document.createElement('span'); f.className = 'tt-fix'; f.textContent = str[i]; fare.appendChild(f); }
        }
        void fare.offsetWidth;
      }
      Array.prototype.forEach.call(fare.children, function (c, i) {
        if (c.classList.contains('tt-col')) c.style.transform = 'translateY(' + (-Number(str[i]) * DIGIT_H) + 'px)';
      });
      fare.setAttribute('aria-label', 'Estimated cost ' + str);
    }

    function update() {
      var tin = estimate(input.value);
      var r = RATES[model];
      var cost = (tin * r.in + (tin ? outTokens : 0) * r.out) / 1e6;
      var str = '$' + cost.toFixed(4);
      if (str !== last) {
        meter.classList.remove('is-tick'); void meter.offsetWidth; meter.classList.add('is-tick');
        last = str;
      }
      drawFare(str);
      tokensEl.textContent = tin.toLocaleString('en-US') + (tin === 1 ? ' token in · ' : ' tokens in · ') + (tin ? outTokens.toLocaleString('en-US') : 0) + ' out';
      used.style.width = Math.min(100, spent / budget * 100) + '%';
      next.style.width = (tin ? Math.min(100 - spent / budget * 100, Math.max(1.5, cost / budget * 100)) : 0) + '%'; // true share, with a sliver so it stays visible
      var b = document.createElement('b'); b.textContent = '$' + spent.toFixed(2);
      // The cost ends the paragraph on the second line: "than a cent." stays together, and "about $0.02." (short
      // enough to fit on the first line on a wide card) is moved down by costLine
      var c = document.createElement('span'); c.className = 'tt-cost';
      if (cost < 0.01) { budgetText.replaceChildren(b, document.createTextNode(' of $' + budget.toFixed(2) + ' used this month. This prompt adds less ')); c.textContent = 'than\u00a0a\u00a0cent.'; }
      else { budgetText.replaceChildren(b, document.createTextNode(' of $' + budget.toFixed(2) + ' used this month. This prompt adds ')); c.textContent = 'about\u00a0$' + cost.toFixed(2) + '.'; }
      budgetText.appendChild(c);
      costLine();
    }
    // When the whole line fits on one row, break before the cost so it always reads as the second line
    function costLine() {
      var br = budgetText.querySelector('br'), c = budgetText.querySelector('.tt-cost');
      if (br) br.remove();
      if (!c) return;
      var lh = parseFloat(getComputedStyle(budgetText).lineHeight) || 18;
      if (budgetText.offsetHeight < lh * 1.5) budgetText.insertBefore(document.createElement('br'), c);
    }
    if (window.ResizeObserver) { var lastBW = 0; new ResizeObserver(function () { var w = budgetText.clientWidth; if (Math.abs(w - lastBW) > 0.5) { lastBW = w; costLine(); } }).observe(budgetText); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(costLine);

    function running() {
      root.classList.add('is-running');
      flag.textContent = 'Metered';
      clearTimeout(idle);
      idle = setTimeout(function () { root.classList.remove('is-running'); flag.textContent = 'Waiting'; }, 900);
    }

    input.addEventListener('input', function () { running(); update(); });
    root.querySelectorAll('.tt-seg').forEach(function (seg) {
      var buttons = Array.prototype.slice.call(seg.querySelectorAll('button'));
      function pick(i, focus) {
        seg.style.setProperty('--i', i);
        buttons.forEach(function (b, k) { b.setAttribute('aria-checked', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
        var b = buttons[i];
        if (b.hasAttribute('data-model')) model = b.getAttribute('data-model');
        if (b.hasAttribute('data-len')) outTokens = Number(b.getAttribute('data-len'));
        if (focus) b.focus();
        running(); update();
      }
      buttons.forEach(function (b, i) {
        b.tabIndex = i === 0 ? 0 : -1;
        b.addEventListener('click', function () { pick(i); });
        b.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); pick((i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length, true); }
        });
      });
    });
    update();
  }

  window.initTokenTaximeter = initTokenTaximeter;
  function boot() { document.querySelectorAll('[data-mi="token-taximeter"]').forEach(initTokenTaximeter); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
