/* Spill Counter — vanilla JS. Auto-initializes every [data-mi="spill-counter"].
   Call window.initSpillCounter(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var RING = 56.55; // 2πr for r = 9
  var MORE = ' and inside every invoice we send to customers each month';

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

  function initSpillCounter(root) {
    if (!root || root.__miSpill) return;
    root.__miSpill = true;
    evenLines(root);

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
        status.textContent = 'Trimmed to ' + limit + (limit === 1 ? ' character.' : ' characters.');
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
