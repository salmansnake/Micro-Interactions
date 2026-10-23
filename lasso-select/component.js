/* Lasso Select — vanilla JS. Auto-initializes every [data-mi="lasso-select"].
   Items are [role="option"] inside .ls-grid. Call window.initLassoSelect(el) for elements added later. */
(function () {
  'use strict';

  // Ray-casting point-in-polygon test.
  function inside(x, y, pts) {
    var hit = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }

  function initLassoSelect(root) {
    if (!root || root.__miLasso) return;
    root.__miLasso = true;
    var area = root.querySelector('.ls-area');
    var items = Array.prototype.slice.call(root.querySelectorAll('[role="option"]'));
    var path = root.querySelector('.ls-path');
    var count = root.querySelector('.ls-count');
    var bar = root.querySelector('.ls-bar');
    var barText = root.querySelector('.ls-bar-text');
    var pts = [], drawing = false, base = [], lastHot = -1, raf = 0;

    function isSel(el) { return el.getAttribute('aria-selected') === 'true'; }
    function setSel(el, on) { el.setAttribute('aria-selected', on ? 'true' : 'false'); }
    function selectedCount() { return items.filter(isSel).length; }
    function updateBar() {
      var n = selectedCount();
      bar.hidden = n === 0;
      barText.textContent = n + (n === 1 ? ' Selected' : ' Selected');
    }
    function local(e) { var r = area.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function centers() {
      var r = area.getBoundingClientRect();
      return items.map(function (el) { var b = el.getBoundingClientRect(); return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2]; });
    }

    var cs = [];
    function frame() {
      raf = 0;
      if (pts.length < 2) return;
      path.setAttribute('d', 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z');
      var hot = 0;
      items.forEach(function (el, i) {
        var inLoop = pts.length > 2 && inside(cs[i][0], cs[i][1], pts);
        el.classList.toggle('is-hot', inLoop);
        if (inLoop) hot++;
      });
      var total = hot + base.filter(function (el) { return !el.classList.contains('is-hot'); }).length;
      var last = pts[pts.length - 1];
      count.style.setProperty('--x', last[0] + 'px');
      count.style.setProperty('--y', last[1] + 'px');
      count.textContent = String(total);
      count.classList.toggle('is-on', total > 0);
      if (total !== lastHot) { count.classList.remove('is-bump'); void count.offsetWidth; count.classList.add('is-bump'); lastHot = total; }
    }

    area.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drawing = true;
      try { area.setPointerCapture(e.pointerId); } catch (err) {}
      base = e.shiftKey || e.metaKey ? items.filter(isSel) : [];
      if (!e.shiftKey && !e.metaKey) items.forEach(function (el) { setSel(el, false); });
      cs = centers();
      pts = [local(e)];
      lastHot = -1;
      path.classList.remove('is-closing');
      updateBar();
    });
    area.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      var p = local(e), q = pts[pts.length - 1];
      if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 4) return;
      pts.push(p);
      if (!raf) raf = requestAnimationFrame(frame);
    });
    function end() {
      if (!drawing) return;
      drawing = false;
      if (pts.length < 3) {
        // A click, not a loop: select or clear what's under the pointer.
        var el = document.elementFromPoint(area.getBoundingClientRect().left + pts[0][0], area.getBoundingClientRect().top + pts[0][1]);
        var item = el && el.closest('[role="option"]');
        if (item) { setSel(item, true); item.focus({ preventScroll: true }); }
      } else {
        items.forEach(function (el) { if (el.classList.contains('is-hot')) setSel(el, true); el.classList.remove('is-hot'); });
      }
      path.classList.add('is-closing');
      count.classList.remove('is-on');
      pts = [];
      updateBar();
    }
    area.addEventListener('pointerup', end);
    area.addEventListener('pointercancel', end);

    // Keyboard: arrows move, Space toggles, ⌘A / Ctrl+A selects all, Escape clears.
    area.addEventListener('keydown', function (e) {
      var i = items.indexOf(document.activeElement);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); items.forEach(function (el) { setSel(el, true); }); updateBar(); return; }
      if (e.key === 'Escape') { items.forEach(function (el) { setSel(el, false); }); updateBar(); return; }
      if (i < 0) return;
      var cols = Math.max(1, Math.round(area.querySelector('.ls-grid').clientWidth / items[0].offsetWidth));
      var move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
      if (move) {
        e.preventDefault();
        var n = Math.max(0, Math.min(items.length - 1, i + move));
        items[i].tabIndex = -1; items[n].tabIndex = 0; items[n].focus();
        if (e.shiftKey) setSel(items[n], true), updateBar();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setSel(items[i], !isSel(items[i]));
        updateBar();
      }
    });
    root.querySelector('.ls-clear').addEventListener('click', function () {
      items.forEach(function (el) { setSel(el, false); });
      updateBar();
      area.querySelector('[tabindex="0"]').focus();
    });
    root.querySelectorAll('.ls-act').forEach(function (b) {
      b.addEventListener('click', function () { barText.textContent = b.textContent + ' ' + selectedCount() + ' files'; });
    });
  }

  window.initLassoSelect = initLassoSelect;
  function boot() { document.querySelectorAll('[data-mi="lasso-select"]').forEach(initLassoSelect); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
