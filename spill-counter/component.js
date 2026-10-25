/* Spill Counter — vanilla JS. Auto-initializes every [data-mi="spill-counter"].
   Call window.initSpillCounter(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var RING = 56.55; // 2πr for r = 9
  var MORE = ' and inside every invoice we send to customers each month';

  function initSpillCounter(root) {
    if (!root || root.__miSpill) return;
    root.__miSpill = true;

    var limit = Number(root.getAttribute('data-limit')) || 80;
    var input = root.querySelector('.sc-input');
    var mirror = root.querySelector('.sc-mirror');
    var ring = root.querySelector('.sc-ring');
    var count = root.querySelector('.sc-count');
    var status = root.querySelector('.sc-status');
    var trim = root.querySelector('.sc-trim');
    var post = root.querySelector('.sc-post');
    var auto = root.querySelector('.sc-auto');
    var lastLen = input.value.length;
    var trimming = false;
    var typing = 0;

    function grow() {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    }

    // Rebuild the mirror. Characters from `fresh` onwards drop in.
    function render(fresh) {
      var v = input.value;
      mirror.textContent = '';
      mirror.appendChild(document.createTextNode(v.slice(0, limit)));
      var extra = v.slice(limit);
      for (var i = 0; i < extra.length; i++) {
        var s = document.createElement('span');
        s.className = 'sc-x';
        s.textContent = extra[i];
        if (!reduce.matches && limit + i >= fresh) s.classList.add('is-new');
        mirror.appendChild(s);
      }
      mirror.appendChild(document.createTextNode('​')); // keeps a trailing newline's height
      grow();
      slope();
      update(v.length);
    }

    // Every line of spilled characters slopes down, from 1px where it starts to 9px at the right edge,
    // so each new line keeps spilling instead of going flat. Measure at rest, then offset.
    function slope() {
      var spans = mirror.querySelectorAll('.sc-x');
      if (!spans.length) return;
      var cs = getComputedStyle(mirror);
      var right = mirror.clientWidth - parseFloat(cs.paddingRight);
      var pos = [];
      spans.forEach(function (s) { s.style.top = '0px'; });
      spans.forEach(function (s) { pos.push([s.offsetTop, s.offsetLeft]); });
      var lineTop = null, start = 0;
      spans.forEach(function (s, i) {
        if (pos[i][0] !== lineTop) { lineTop = pos[i][0]; start = pos[i][1]; }
        var t = right > start ? (pos[i][1] - start) / (right - start) : 0;
        s.style.top = (1 + 8 * Math.max(0, Math.min(1, t))).toFixed(2) + 'px';
      });
    }

    function update(len) {
      var left = limit - len;
      var over = left < 0;
      root.classList.toggle('is-over', over);
      root.classList.toggle('is-warn', !over && left <= 10);
      ring.style.strokeDashoffset = (RING * (1 - Math.min(len / limit, 1))).toFixed(2);
      count.textContent = left <= 20 ? String(left) : '';
      trim.hidden = !over;
      if (over) trim.textContent = 'Trim ' + -left + (left === -1 ? ' Character' : ' Characters');
      post.disabled = over || len === 0 || trimming;
      if (over) status.textContent = -left + (left === -1 ? ' character' : ' characters') + ' over the limit.';
      else if (left <= 10) status.textContent = left + (left === 1 ? ' character' : ' characters') + ' left.';
      else status.textContent = '';
    }

    input.addEventListener('input', function () {
      var len = input.value.length;
      render(len > lastLen ? Math.max(limit, input.selectionStart - (len - lastLen)) : Infinity);
      lastLen = len;
    });

    trim.addEventListener('click', function () {
      if (trimming) return;
      var spans = mirror.querySelectorAll('.sc-x');
      var finish = function () {
        input.value = input.value.slice(0, limit);
        lastLen = input.value.length;
        trimming = false;
        render(Infinity);
        status.textContent = 'Trimmed to ' + limit + ' characters.';
        input.focus();
        input.setSelectionRange(limit, limit);
      };
      if (reduce.matches || !spans.length) { finish(); return; }
      trimming = true;
      post.disabled = true;
      Array.prototype.forEach.call(spans, function (s, i) {
        s.classList.remove('is-new');
        s.style.setProperty('--sc-d', Math.min((spans.length - 1 - i) * 14, 320) + 'ms');
        s.classList.add('is-falling');
      });
      setTimeout(finish, Math.min((spans.length - 1) * 14, 320) + 440);
    });

    post.addEventListener('click', function () {
      if (post.disabled) return;
      status.textContent = 'Posted.';
    });

    if (auto) {
      auto.addEventListener('click', function () {
        if (typing) return;
        var i = 0;
        auto.disabled = true;
        typing = setInterval(function () {
          if (i >= MORE.length) { clearInterval(typing); typing = 0; auto.disabled = false; return; }
          input.value += MORE[i++];
          var len = input.value.length;
          render(len - 1);
          lastLen = len;
        }, reduce.matches ? 5 : 40);
      });
    }

    if (window.ResizeObserver) new ResizeObserver(function () { grow(); slope(); }).observe(root);
    render(Infinity);
  }

  window.initSpillCounter = initSpillCounter;
  function boot() { document.querySelectorAll('[data-mi="spill-counter"]').forEach(initSpillCounter); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
