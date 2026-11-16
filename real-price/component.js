/* Real Price — vanilla JS. Auto-initializes every [data-mi="real-price"].
   The headline price already includes every fee (data-base plus data-fees, each shown as a tag). Extras that arrive
   pre-ticked untick themselves a moment after load and say so. The total is the same in the button and at payment.
   Call window.initRealPrice(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function money(n) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }

  function initRealPrice(root) {
    if (!root || root.__miRpr) return;
    root.__miRpr = true;
    var base = Number(root.getAttribute('data-base')) || 80;
    var fees = (root.getAttribute('data-fees') || '').split(',').map(Number).filter(function (x) { return x > 0; });
    var each = base + fees.reduce(function (a, b) { return a + b; }, 0);
    var nEl = root.querySelector('.rpr-n'), minus = root.querySelector('.rpr-minus'), plus = root.querySelector('.rpr-plus');
    var pay = root.querySelector('.rpr-pay'), payLabel = root.querySelector('.rpr-pay-label'), status = root.querySelector('.rpr-status');
    var eachEl = root.querySelector('.rpr-each-num'), start = status.textContent;
    var addons = Array.prototype.map.call(root.querySelectorAll('.rpr-addons li'), function (li) {
      return { li: li, price: Number(li.getAttribute('data-price')), box: li.querySelector('.rpr-box'), note: li.querySelector('.rpr-note') };
    });
    var n = Number(nEl.textContent) || 2, paid = false;
    eachEl.textContent = money(each);

    function total() { return each * n + addons.reduce(function (s, a) { return s + (a.box.getAttribute('aria-checked') === 'true' ? a.price : 0); }, 0); }
    function render() {
      nEl.textContent = n;
      minus.disabled = paid || n <= 1; plus.disabled = paid || n >= 6;
      payLabel.textContent = paid ? 'Paid ' + money(total()) : 'Pay ' + money(total());
    }

    minus.addEventListener('click', function () { if (n > 1) { n--; render(); } });
    plus.addEventListener('click', function () { if (n < 6) { n++; render(); } });
    addons.forEach(function (a) {
      a.box.addEventListener('click', function () {
        if (paid) return;
        a.box.setAttribute('aria-checked', a.box.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
        a.note.hidden = true; render();
      });
    });
    pay.addEventListener('click', function () {
      if (paid) return;
      paid = true; pay.disabled = true;
      addons.forEach(function (a) { a.box.setAttribute('aria-disabled', 'true'); });
      render();
      status.textContent = 'Paid ' + money(total()) + '. Exactly what it\u00a0said.';
    });

    // The pay button keeps one width as the total changes: as wide as the largest total it can show
    function sizePay() {
      var keep = n, w = 0; pay.style.minWidth = '';
      addons.forEach(function (a) { a.was = a.box.getAttribute('aria-checked'); a.box.setAttribute('aria-checked', 'true'); });
      n = 6; payLabel.textContent = 'Paid ' + money(total()); w = pay.getBoundingClientRect().width;
      addons.forEach(function (a) { a.box.setAttribute('aria-checked', a.was); });
      n = keep; pay.style.minWidth = Math.ceil(w) + 'px'; render();
    }
    sizePay();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizePay);
    render();
    status.textContent = start;

    // Untick what was ticked for you, one at a time, and say so
    addons.forEach(function (a, i) {
      if (a.box.getAttribute('aria-checked') !== 'true') return;
      setTimeout(function () {
        if (paid || !root.isConnected) return;
        a.box.setAttribute('aria-checked', 'false'); a.note.hidden = false; render();
      }, (reduce.matches ? 200 : 900) + i * 500);
    });
  }

  window.initRealPrice = initRealPrice;
  function boot() { document.querySelectorAll('[data-mi="real-price"]').forEach(initRealPrice); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
