/* Exclamation Budget — vanilla JS. Auto-initializes every [data-mi="exclamation-budget"].
   The first data-budget "!" in the message are kept; any after that become "." in place (deleting one refunds it).
   Call window.initExclamationBudget(el) for elements added later. */
(function () {
  'use strict';

  function initExclamationBudget(root) {
    if (!root || root.__miBang) return;
    root.__miBang = true;
    var budget = Number(root.getAttribute('data-budget')) || 3;
    var to = root.getAttribute('data-to') || 'They';
    var input = root.querySelector('.eb-input'), wallet = root.querySelector('.eb-wallet');
    var coins = Array.prototype.slice.call(wallet.querySelectorAll('i'));
    var status = root.querySelector('.eb-status'), shop = root.querySelector('.eb-shop');
    var buy = root.querySelector('.eb-buy'), send = root.querySelector('.eb-send');
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
      if (justConverted) shop.hidden = false;
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
    buy.addEventListener('click', function () {
      shop.hidden = true;
      status.textContent = 'Just kidding. Try sounding excited with words. “This is genuinely great news” works.';
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
