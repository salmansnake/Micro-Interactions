/* Refill Timer — vanilla JS. Auto-initializes every [data-mi="refill-timer"].
   data-max = credits, data-refill = ms per credit. Call window.initRefillTimer(el) for later elements. */
(function () {
  'use strict';
  var IDEAS = [
    'Yearly billing, with the savings up front',
    'Delete with confidence',
    'Your plan, at a glance',
    'Every change, saved',
    'Shortcuts you will actually use',
    'Pricing that explains itself',
    'Errors that point at the problem',
    'Uploads that know what you dropped'
  ];

  function initRefillTimer(root) {
    if (!root || root.__miRefill) return;
    root.__miRefill = true;

    var max = Number(root.getAttribute('data-max')) || 5;
    var refill = Number(root.getAttribute('data-refill')) || 3000;
    var dotsBox = root.querySelector('.rt-dots');
    var left = root.querySelector('.rt-left');
    var out = root.querySelector('.rt-out');
    var btn = root.querySelector('.rt-btn');
    var label = root.querySelector('.rt-label');
    var credits = max;
    var last = 0;
    var raf = 0;
    var ideaIx = 0;
    var shownWhole = max;

    var dots = [];
    for (var i = 0; i < max; i++) {
      var d = document.createElement('span');
      d.className = 'rt-dot';
      d.appendChild(document.createElement('i'));
      dotsBox.appendChild(d);
      dots.push(d);
    }

    function bump(elm, cls) {
      elm.classList.remove(cls);
      void elm.offsetWidth;
      elm.classList.add(cls);
    }

    function render() {
      var whole = Math.floor(credits + 1e-6);
      dots.forEach(function (d, i) {
        var f = Math.max(0, Math.min(1, credits - i));
        d.style.setProperty('--rt-f', f.toFixed(3));
      });
      left.textContent = whole + ' of ' + max;
      var empty = whole < 1;
      root.classList.toggle('is-empty', empty);
      btn.setAttribute('aria-disabled', empty ? 'true' : 'false');
      if (empty) {
        var frac = credits - whole;
        var secs = Math.ceil(((1 - frac) * refill) / 1000);
        label.textContent = 'Next in ' + secs + 's';
        btn.style.setProperty('--rt-p', frac.toFixed(3));
      } else {
        label.textContent = 'Generate';
      }
      if (whole > shownWhole) {
        bump(dots[whole - 1], 'is-ready');
        if (shownWhole === 0) bump(btn, 'is-ready');
      }
      shownWhole = whole;
    }

    function tick(now) {
      raf = 0;
      if (last) credits = Math.min(max, credits + (now - last) / refill);
      last = now;
      render();
      if (credits < max) raf = requestAnimationFrame(tick);
      else last = 0;
    }
    function start() { if (!raf && credits < max) { last = 0; raf = requestAnimationFrame(tick); } }

    btn.addEventListener('click', function () {
      if (credits < 1) return;
      var spent = Math.floor(credits + 1e-6) - 1;
      credits -= 1;
      shownWhole = Math.floor(credits + 1e-6);
      bump(dots[spent], 'is-spent');
      var empty = out.querySelector('.rt-empty');
      if (empty) empty.remove();
      var li = document.createElement('li');
      li.textContent = IDEAS[ideaIx++ % IDEAS.length];
      out.insertBefore(li, out.firstChild);
      while (out.children.length > 3) out.lastChild.remove();
      render();
      start();
    });

    render();
  }

  window.initRefillTimer = initRefillTimer;
  function boot() { document.querySelectorAll('[data-mi="refill-timer"]').forEach(initRefillTimer); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
