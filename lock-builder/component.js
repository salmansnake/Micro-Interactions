/* Lock Builder — vanilla JS. Auto-initializes every [data-mi="lock-builder"].
   Call window.initLockBuilder(el) for elements added later. */
(function () {
  'use strict';
  var RULES = {
    length: function (v) { return v.length >= 10; },
    case: function (v) { return /[a-z]/.test(v) && /[A-Z]/.test(v); },
    number: function (v) { return /\d/.test(v); },
    symbol: function (v) { return /[^A-Za-z0-9\s]/.test(v); }
  };
  var WORDS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  function initLockBuilder(root) {
    if (!root || root.__miLock) return;
    root.__miLock = true;
    var input = root.querySelector('.lb-input');
    var show = root.querySelector('.lb-show');
    var bolts = Array.prototype.slice.call(root.querySelectorAll('.lb-bolt'));
    var rules = Array.prototype.slice.call(root.querySelectorAll('[data-rule]'));
    var strength = root.querySelector('.lb-strength');
    var level = 0;

    function update() {
      var v = input.value;
      var met = 0;
      rules.forEach(function (li) {
        var ok = RULES[li.getAttribute('data-rule')](v);
        li.classList.toggle('is-met', ok);
        if (ok) met++;
      });
      // Bolts fill left to right, one per rule met.
      bolts.forEach(function (b, i) { b.classList.toggle('is-in', i < met); });
      if (met === 4 && level < 4) {
        root.classList.remove('is-locked');
        void root.offsetWidth;
        root.classList.add('is-locked');
      }
      level = met;
      root.setAttribute('data-level', String(met));
      if (!v) { strength.textContent = 'Each rule you meet adds a bolt.'; return; }
      var b = document.createElement('b');
      b.textContent = WORDS[met] || 'Weak';
      var rest = met === 4 ? '. Locked.' : '. ' + (4 - met) + (4 - met === 1 ? ' rule to go.' : ' rules to go.');
      strength.replaceChildren(b, document.createTextNode(rest));
    }

    input.addEventListener('input', update);
    show.addEventListener('click', function () {
      var on = input.type === 'password';
      input.type = on ? 'text' : 'password';
      show.textContent = on ? 'Hide' : 'Show';
      show.setAttribute('aria-pressed', on ? 'true' : 'false');
      input.focus();
    });
    update();
  }

  window.initLockBuilder = initLockBuilder;
  function boot() { document.querySelectorAll('[data-mi="lock-builder"]').forEach(initLockBuilder); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
