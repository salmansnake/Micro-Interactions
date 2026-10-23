/* Coin Drop — vanilla JS. Auto-initializes every [data-mi="coin-drop"].
   Call window.initCoinDrop(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initCoinDrop(root) {
    if (!root || root.__miCoin) return;
    root.__miCoin = true;

    var toggle = root.querySelector('.cd-toggle');
    var buttons = Array.prototype.slice.call(toggle.querySelectorAll('[data-period]'));
    var origin = root.querySelector('.cd-pct') || buttons[1];
    var layer = root.querySelector('.cd-layer');
    var live = root.querySelector('.cd-sr');
    var gen = 0;
    var flying = [];

    var plans = Array.prototype.slice.call(root.querySelectorAll('.cd-plan')).map(function (el) {
      var m = Number(el.getAttribute('data-monthly'));
      var y = Number(el.getAttribute('data-yearly'));
      return {
        el: el, m: m, y: y, save: (m - y) * 12, shown: m, kept: 0,
        amt: el.querySelector('.cd-amt'), billed: el.querySelector('.cd-billed'),
        tray: el.querySelector('.cd-tray'), slot: el.querySelector('.cd-slot'),
        pre: el.querySelector('.cd-tray-pre'), num: el.querySelector('.cd-tray b'), post: el.querySelector('.cd-tray-post')
      };
    });

    function yearly() { return root.getAttribute('data-period') === 'yearly'; }

    function renderTray(p) {
      if (yearly()) { p.pre.textContent = 'You keep $'; p.num.textContent = p.kept; p.post.textContent = '/yr'; }
      else { p.pre.textContent = 'Yearly saves $'; p.num.textContent = p.save; p.post.textContent = ''; }
    }

    function center(el) {
      var r = el.getBoundingClientRect();
      var o = root.getBoundingClientRect();
      return { x: r.left + r.width / 2 - o.left, y: r.top + r.height / 2 - o.top };
    }

    function tweenPrice(p, to, token) {
      var from = p.shown;
      if (reduce.matches || from === to) { p.shown = to; p.amt.textContent = to; return; }
      var t0 = performance.now();
      function step(now) {
        if (token !== gen) return;
        var k = Math.min(1, (now - t0) / 520);
        var e = 1 - Math.pow(1 - k, 3);
        p.shown = Math.round(from + (to - from) * e);
        p.amt.textContent = p.shown;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // One coin on a parabolic arc from a to b.
    function fly(a, b, delay, intoSlot, token, onLand) {
      var coin = document.createElement('span');
      coin.className = 'cd-coin';
      layer.appendChild(coin);
      var lift = 50 + Math.random() * 40;
      var spin = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 240);
      var sway = (Math.random() - 0.5) * 14;
      var frames = [];
      var N = 16;
      for (var i = 0; i <= N; i++) {
        var t = i / N;
        var x = a.x + (b.x - a.x) * t + Math.sin(t * Math.PI) * sway;
        var y = a.y + (b.y - a.y) * t - 4 * lift * t * (1 - t);
        var s = 1;
        var o = Math.min(1, t / 0.08);
        if (intoSlot) {
          if (t < 0.12) s = 0.6 + (t / 0.12) * 0.4;
          if (t > 0.85) { var k = (t - 0.85) / 0.15; s = 1 - 0.65 * k; o = 1 - k; }
        } else {
          if (t < 0.15) s = 0.35 + (t / 0.15) * 0.65;
          if (t > 0.88) o = (1 - t) / 0.12;
        }
        var flip = 0.35 + 0.65 * Math.abs(Math.cos(t * Math.PI * 2.5));
        frames.push({
          transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (spin * t).toFixed(0) + 'deg) scale(' + s.toFixed(3) + ') scaleX(' + flip.toFixed(3) + ')',
          opacity: o
        });
      }
      var anim = coin.animate(frames, {
        duration: 720 + Math.random() * 160,
        delay: delay,
        easing: 'cubic-bezier(.35,.1,.55,1)',
        fill: 'both'
      });
      flying.push(anim);
      anim.finished.then(function () {
        coin.remove();
        if (token === gen && onLand) onLand();
      }).catch(function () { coin.remove(); });
    }

    function land(p, n) {
      p.landed += 1; // coins land out of order, so count arrivals
      p.kept = Math.round(p.save * Math.min(p.landed, n) / n);
      renderTray(p);
      if (!p.tray.animate) return;
      p.tray.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
      var ring = getComputedStyle(root).getPropertyValue('--olive').trim() || 'currentColor'; // Outcraft Olive
      p.slot.animate([
        { boxShadow: '0 0 0 0 color-mix(in srgb, ' + ring + ' 60%, transparent)' },
        { boxShadow: '0 0 0 5px color-mix(in srgb, ' + ring + ' 0%, transparent)' }
      ], { duration: 320, easing: 'ease-out' });
    }

    function select(period) {
      if (root.getAttribute('data-period') === period) return;
      root.setAttribute('data-period', period);
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-period') === period;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });

      var token = ++gen;
      flying.forEach(function (a) { a.cancel(); });
      flying = [];
      layer.replaceChildren();
      var toYearly = yearly();
      var most = 0;

      plans.forEach(function (p, pi) {
        most = Math.max(most, p.save);
        tweenPrice(p, toYearly ? p.y : p.m, token);
        p.billed.textContent = toYearly ? 'Billed yearly · $' + (p.y * 12).toLocaleString() : 'Billed monthly';
        p.kept = 0;
        p.landed = 0;
        if (reduce.matches) { if (toYearly) p.kept = p.save; renderTray(p); return; }
        renderTray(p);
        var n = Math.max(3, Math.min(8, Math.round(p.save / 24) + 2));
        var chip = center(origin);
        var slot = center(p.slot);
        for (var i = 0; i < n; i++) {
          var delay = pi * 120 + i * 85;
          if (toYearly) {
            fly(chip, slot, delay, true, token, land.bind(null, p, n));
          } else {
            fly(slot, chip, delay, false, token, null);
          }
        }
      });

      if (live) {
        live.textContent = toYearly
          ? 'Yearly billing selected. You save up to $' + most + ' a year.'
          : 'Monthly billing selected.';
      }
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { select(b.getAttribute('data-period')); });
    });
    toggle.addEventListener('keydown', function (e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) === -1) return;
      e.preventDefault();
      var next = yearly() ? 'monthly' : 'yearly';
      select(next);
      toggle.querySelector('[data-period="' + next + '"]').focus();
    });

    plans.forEach(renderTray);
  }

  window.initCoinDrop = initCoinDrop;
  function boot() { document.querySelectorAll('[data-mi="coin-drop"]').forEach(initCoinDrop); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
