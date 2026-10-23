/* Token Taximeter — vanilla JS. Auto-initializes every [data-mi="token-taximeter"].
   Rates are per million tokens; tokens are estimated at 4 characters each. Swap estimate() for a real tokenizer.
   Call window.initTokenTaximeter(el) for elements added later. */
(function () {
  'use strict';
  var RATES = { fast: { in: 0.25, out: 1.25 }, smart: { in: 3, out: 15 } }; // $ per 1M tokens (example rates)
  var DIGIT_H = 40;

  function estimate(text) { return text.trim() ? Math.max(1, Math.ceil(text.length / 4)) : 0; }

  function initTokenTaximeter(root) {
    if (!root || root.__miTaxi) return;
    root.__miTaxi = true;
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
      tokensEl.textContent = tin.toLocaleString() + ' tokens in · ' + (tin ? outTokens.toLocaleString() : 0) + ' out';
      used.style.width = Math.min(100, spent / budget * 100) + '%';
      next.style.width = (tin ? Math.min(100 - spent / budget * 100, Math.max(1.5, cost / budget * 100)) : 0) + '%'; // true share, with a sliver so it stays visible
      var b = document.createElement('b'); b.textContent = '$' + spent.toFixed(2);
      budgetText.replaceChildren(b, document.createTextNode(' of $' + budget.toFixed(2) + ' used this month. This prompt adds about ' + (cost < 0.01 ? 'less than a cent' : '$' + cost.toFixed(2)) + '.'));
    }

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
