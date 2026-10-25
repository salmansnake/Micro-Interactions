/* Exclamation Budget — vanilla JS. Auto-initializes every [data-mi="exclamation-budget"].
   The first data-budget "!" in the message are kept; any after that become "." in place (deleting one refunds it).
   Call window.initExclamationBudget(el) for elements added later. */
(function () {
  'use strict';

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

  function initExclamationBudget(root) {
    if (!root || root.__miBang) return;
    root.__miBang = true;
    evenLines(root);
    var budget = Number(root.getAttribute('data-budget')) || 3;
    var to = root.getAttribute('data-to') || 'They';
    var input = root.querySelector('.eb-input'), wallet = root.querySelector('.eb-wallet');
    var coins = Array.prototype.slice.call(wallet.querySelectorAll('i'));
    var bangs = root.querySelectorAll('.eb-chips button[data-ins="!"], .eb-chips button[data-ins="!!!"]');
    var bought = 0, joked = false; // joked: the period joke has played for the current budget
    var status = root.querySelector('.eb-status'), shop = root.querySelector('.eb-shop');
    var buy = root.querySelector('.eb-buy'), send = root.querySelector('.eb-send');
    var shopText = root.querySelector('.eb-shop-text');
    var used = 0, converted = 0;

    function enforce() {
      var seen = 0, changed = false;
      var caret = input.selectionStart;
      var out = input.value.replace(/!/g, function () { seen++; if (seen > budget) { changed = true; return '.'; } return '!'; });
      if (changed) {
        input.value = out;
        input.setSelectionRange(caret, caret);
        converted++;
        input.classList.remove('is-shrug'); void input.offsetWidth; input.classList.add('is-shrug');
      }
      return changed;
    }

    function render(justConverted) {
      var n = Math.min(budget, (input.value.match(/!/g) || []).length);
      coins.forEach(function (c, i) {
        var spent = i >= budget - n;
        if (spent && !c.classList.contains('is-spent')) { c.classList.add('is-pop'); setTimeout(function () { c.classList.remove('is-pop'); }, 520); }
        c.classList.toggle('is-spent', spent);
      });
      var left = budget - n;
      wallet.setAttribute('aria-label', left + ' exclamation marks left');
      root.classList.toggle('is-broke', justConverted);
      status.textContent = justConverted ? 'Budget spent. That one’s a period now.' : left === 0 ? 'No exclamation marks left. Choose your words carefully.' : left + (left === 1 ? ' exclamation mark' : ' exclamation marks') + ' left today.';
      if (justConverted) joked = true;
      if (left > 0) joked = false;
      // The joke lands once per budget: after one "!" has turned into a period, the "!" chips stop working (instead of
      // piling up periods) and the shop offers more
      Array.prototype.forEach.call(bangs, function (b) { b.disabled = left === 0 && joked; });
      shop.hidden = !(left === 0 && joked);
      // One top-up per message: after that the shop is sold out, and offers nothing it can't give
      buy.hidden = bought > 0;
      shopText.textContent = bought > 0 ? 'Sold out. One top-up per message.' : 'Need more enthusiasm?';
      used = n;
    }

    input.addEventListener('input', function () { render(enforce()); });
    root.querySelectorAll('.eb-chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        var ins = b.getAttribute('data-ins');
        var s = input.selectionStart != null && document.activeElement === input ? input.selectionStart : input.value.length;
        input.value = input.value.slice(0, s) + ins + input.value.slice(s);
        input.focus();
        input.setSelectionRange(s + ins.length, s + ins.length);
        render(enforce());
      });
    });
    // The shop really sells them (the charge is pretend): three new coins join the wallet and the "!" chips come back
    buy.addEventListener('click', function () {
      if (bought) return;
      budget += 3;
      bought++;
      joked = false;
      for (var k = 0; k < 3; k++) {
        var c = document.createElement('i');
        c.className = 'is-new';
        wallet.insertBefore(c, wallet.firstChild);
        coins.unshift(c);
        setTimeout(function (el) { el.classList.remove('is-new'); }.bind(null, c), 700);
      }
      render(false);
      status.textContent = 'Charged $0.99. Three fresh exclamation marks. Spend them wisely.';
      input.focus();
    });
    send.addEventListener('click', function () {
      status.textContent = used === 0 ? 'Sent. Calm, measured, slightly suspicious.'
        : used >= budget ? 'Sent with all ' + budget + ' exclamation marks. ' + to + ' can tell you mean it.'
        : 'Sent with ' + used + (used === 1 ? ' exclamation mark' : ' exclamation marks') + '. Tasteful.';
    });
    render(false);
  }

  window.initExclamationBudget = initExclamationBudget;
  function boot() { document.querySelectorAll('[data-mi="exclamation-budget"]').forEach(initExclamationBudget); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
