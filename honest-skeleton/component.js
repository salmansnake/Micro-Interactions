/* Honest Skeleton — vanilla JS. Auto-initializes every [data-mi="honest-skeleton"].
   Each part loads on its own: known data renders at once, slow parts say so, failed parts offer Retry.
   Call window.initHonestSkeleton(el) for elements added later. */
(function () {
  'use strict';
  var SLOW_AFTER = 1200; // ms before a part admits it is slow

  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function sk(width, height) {
    var s = h('span', 'hk-sk');
    s.style.width = width;
    if (height) s.style.height = height;
    return s;
  }

  // Each part: its skeleton, its real content, and how it behaves in the demo.
  var PARTS = {
    meta: {
      speed: '0.9s',
      skeleton: function () { var w = h('div'); w.style.paddingTop = '6px'; w.appendChild(sk('11em')); return w; },
      real: function () { return h('p', 'hk-meta', 'Production · Updated 4 minutes ago'); }
    },
    stats: {
      speed: '1s',
      skeleton: function () {
        var f = document.createDocumentFragment();
        for (var i = 0; i < 3; i++) { var c = h('div', 'hk-stat'); c.appendChild(sk('60%', '18px')); c.appendChild(sk('80%', '10px')); f.appendChild(c); }
        return f;
      },
      real: function () {
        var f = document.createDocumentFragment();
        [['3', 'Members'], ['128', 'Deploys'], ['99.98%', 'Uptime']].forEach(function (s) {
          var c = h('div', 'hk-stat hk-real'); c.appendChild(h('b', null, s[0])); c.appendChild(h('span', null, s[1])); f.appendChild(c);
        });
        return f;
      }
    },
    activity: {
      speed: '1.6s',
      skeleton: function () {
        var ul = h('ul', 'hk-rows');
        ['70%', '58%', '64%'].forEach(function (w) { var li = h('li'); li.appendChild(h('i')); li.appendChild(sk(w)); ul.appendChild(li); });
        return ul;
      },
      real: function () {
        var ul = h('ul', 'hk-rows hk-real');
        [['M', 'var(--chart-2)', 'Mira deployed production', '2m'], ['S', 'var(--chart-4)', 'Sam updated roadmap-q4.csv', '1h'], ['Y', 'var(--chart-1)', 'You invited Alex', '3h']].forEach(function (r) {
          var li = h('li'); var i = h('i', 'hk-who', r[0]); i.style.background = r[1];
          li.appendChild(i); li.appendChild(h('span', null, r[2])); li.appendChild(h('small', null, r[3])); ul.appendChild(li);
        });
        return ul;
      }
    },
    chart: {
      speed: '1.4s',
      skeleton: function () { return sk('100%', '72px'); },
      real: function () {
        var b = h('div', 'hk-bars hk-real');
        [42, 55, 48, 61, 58, 70, 66, 74, 69, 80, 77, 85, 82, 92].forEach(function (v, i) {
          var s = h('span'); s.style.height = v + '%'; s.style.animationDelay = (i * 30) + 'ms'; b.appendChild(s);
        });
        return b;
      }
    }
  };
  // Demo timing: when each part arrives, and whether its first attempt fails.
  var PLAN = { meta: { at: 450 }, stats: { at: 800 }, activity: { at: 2300 }, chart: { at: 2600, failFirst: true } };

  function initHonestSkeleton(root) {
    if (!root || root.__miHonest) return;
    root.__miHonest = true;
    var timers = [];
    var gen = 0;

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function load(name, attempt, token) {
      var slot = root.querySelector('[data-part="' + name + '"]');
      var part = PARTS[name], plan = PLAN[name];
      slot.setAttribute('aria-busy', 'true');
      slot.style.setProperty('--hk-speed', part.speed);
      slot.replaceChildren(part.skeleton());
      var at = attempt === 0 ? plan.at : 900;
      if (at > SLOW_AFTER) {
        later(function () {
          if (token !== gen) return;
          var w = h('span', 'hk-wait', 'Still loading');
          slot.appendChild(w);
          var started = performance.now();
          var tick = setInterval(function () {
            if (!w.isConnected || token !== gen) { clearInterval(tick); return; }
            w.textContent = 'Still loading · ' + Math.round((SLOW_AFTER + performance.now() - started) / 1000) + 's';
          }, 500);
        }, SLOW_AFTER);
      }
      later(function () {
        if (token !== gen) return;
        slot.removeAttribute('aria-busy');
        if (plan.failFirst && attempt === 0) {
          var e = h('div', 'hk-error hk-real');
          e.appendChild(h('span', null, 'Usage couldn’t load. Your other data is fine.'));
          var b = h('button', null, 'Retry');
          b.type = 'button';
          b.addEventListener('click', function () { load(name, 1, token); });
          e.appendChild(b);
          slot.replaceChildren(e);
          return;
        }
        if (name === 'stats') slot.className = 'hk-part hk-stats';
        slot.replaceChildren(part.real());
      }, at);
    }

    function start() {
      timers.forEach(clearTimeout);
      timers = [];
      var token = ++gen;
      Object.keys(PLAN).forEach(function (name) { load(name, 0, token); });
    }

    root.querySelector('.hk-reload').addEventListener('click', start);

    var begun = false;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !begun) { begun = true; start(); }
      }, { threshold: 0.3 }).observe(root);
      Object.keys(PLAN).forEach(function (name) {
        var slot = root.querySelector('[data-part="' + name + '"]');
        slot.style.setProperty('--hk-speed', PARTS[name].speed);
        slot.replaceChildren(PARTS[name].skeleton());
      });
    } else start();
  }

  window.initHonestSkeleton = initHonestSkeleton;
  function boot() { document.querySelectorAll('[data-mi="honest-skeleton"]').forEach(initHonestSkeleton); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
