/* Blast Radius — vanilla JS. Auto-initializes every [data-mi="blast-radius"].
   Call window.initBlastRadius(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  function initBlastRadius(root) {
    if (!root || root.__miBlast) return;
    root.__miBlast = true;
    evenLines(root);
    root.querySelectorAll('[data-blast-trigger]').forEach(function (btn) { wire(root, btn); });
  }

  function wire(root, btn) {
    var key = btn.getAttribute('data-blast-trigger');
    var label = btn.querySelector('.br-btn-label');
    var count = btn.querySelector('.br-btn-count');
    var toast = root.querySelector('.br-toast');
    var undo = root.querySelector('.br-undo');
    var note = root.querySelector('.br-zone-note');
    var idleText = label.textContent;
    var idleNote = note ? note.textContent : '';
    var armed = false;
    var previewing = false;
    var timer = 0;
    var removed = [];
    var removedGroups = [];

    function list(attr) {
      return Array.prototype.slice
        .call(root.querySelectorAll('[' + attr + '="' + key + '"]'))
        .filter(function (el) { return !el.hidden; });
    }
    function plural(n) { return n + (n === 1 ? ' item' : ' items'); }

    // Ripple: delay grows with distance from the button.
    function delayFor(el) {
      if (reduce.matches) return 0;
      var b = btn.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      var d = Math.hypot(r.left + r.width / 2 - (b.left + b.width / 2), r.top + r.height / 2 - (b.top + b.height / 2));
      return Math.min(Math.round(d * 0.35), 320);
    }

    function setPreview(on) {
      if (on === previewing) return;
      previewing = on;
      var doomed = list('data-blast-member');
      count.textContent = plural(doomed.length);
      btn.classList.toggle('is-preview', on);
      doomed.forEach(function (el) {
        el.style.setProperty('--br-delay', (on ? delayFor(el) : 0) + 'ms');
        el.classList.toggle('br-doomed', on);
      });
      list('data-blast-keep').forEach(function (el) {
        el.style.setProperty('--br-delay', (on ? delayFor(el) + 60 : 0) + 'ms');
        el.classList.toggle('br-safe', on);
      });
    }

    function disarm() {
      armed = false;
      clearTimeout(timer);
      btn.classList.remove('is-armed');
      label.textContent = idleText;
      if (note) note.textContent = idleNote;
    }

    function arm() {
      armed = true;
      btn.classList.add('is-armed');
      var n = list('data-blast-member').length;
      label.textContent = 'Delete ' + n + (n === 1 ? ' Item' : ' Items');
      if (note) note.textContent = 'Click again within 3 seconds to confirm.';
      timer = setTimeout(function () {
        disarm();
        if (!btn.matches(':hover') && document.activeElement !== btn) setPreview(false);
      }, 3000);
    }

    function gapOf(el) { return parseFloat(getComputedStyle(el.parentElement).rowGap) || 0; }

    // Sections whose every row is deleted collapse as a whole, label included.
    function emptiedGroups(doomed) {
      var groups = [];
      doomed.forEach(function (el) {
        var g = el.closest('.br-group');
        if (!g || groups.indexOf(g) > -1) return;
        var rows = Array.prototype.slice.call(g.querySelectorAll('.br-row'));
        if (rows.every(function (r) { return doomed.indexOf(r) > -1; })) groups.push(g);
      });
      return groups;
    }

    function swapAfterText(on) {
      root.querySelectorAll('[data-blast-after]').forEach(function (el) {
        if (on) { el.__brBefore = el.textContent; el.textContent = el.getAttribute('data-blast-after'); }
        else if (el.__brBefore != null) el.textContent = el.__brBefore;
      });
      root.classList.toggle('is-deleted', on);
    }

    function execute() {
      var doomed = list('data-blast-member');
      var groups = emptiedGroups(doomed);
      var longest = 0;
      list('data-blast-keep').forEach(function (el) { el.classList.remove('br-safe'); });
      btn.classList.remove('is-preview');
      previewing = false;
      btn.disabled = true;
      label.textContent = 'Deleted';
      removed = doomed;
      removedGroups = groups;

      function finish() {
        doomed.forEach(function (el) { el.hidden = true; el.classList.remove('br-doomed'); });
        groups.forEach(function (g) { g.hidden = true; });
        swapAfterText(true);
        // Next frame, so the banner rises in from its closed pose.
        if (toast) requestAnimationFrame(function () { requestAnimationFrame(function () { toast.classList.add('is-open'); }); });
      }

      if (reduce.matches || !btn.animate) { finish(); return; }

      var rowAnims = doomed.map(function (el) {
        var delay = delayFor(el);
        var inGroup = groups.indexOf(el.closest('.br-group')) > -1;
        var cs = getComputedStyle(el);
        var open = { height: el.offsetHeight + 'px', paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, marginTop: cs.marginTop, marginBottom: cs.marginBottom };
        var shut = { height: '0px', paddingTop: '0px', paddingBottom: '0px', marginTop: '0px', marginBottom: '0px' };
        el.style.overflow = 'hidden';
        longest = Math.max(longest, delay + 460);
        // Rows in a section that empties only fade; the section collapses after.
        var frames = inGroup
          ? [{ opacity: 0.85, transform: 'scale(0.985)' }, { opacity: 0, transform: 'scale(0.92)' }]
          : [Object.assign({ opacity: 0.85, transform: 'scale(0.985)' }, open), Object.assign({ opacity: 0, transform: 'scale(0.92)', offset: 0.55 }, open), Object.assign({ opacity: 0, transform: 'scale(0.92)' }, shut)];
        return el.animate(frames, { duration: inGroup ? 260 : 460, delay: delay, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      });

      Promise.all(rowAnims.map(function (a) { return a.finished; })).then(function () {
        var groupAnims = groups.map(function (g) {
          g.style.overflow = 'hidden';
          return g.animate([
            { height: g.offsetHeight + 'px', marginTop: '0px', opacity: 1 },
            { height: '0px', marginTop: -gapOf(g) + 'px', opacity: 0 }
          ], { duration: 280, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
        });
        return Promise.all(groupAnims.map(function (a) { return a.finished; })).then(function () {
          finish();
          rowAnims.concat(groupAnims).forEach(function (a) { a.cancel(); });
          groups.forEach(function (g) { g.style.overflow = ''; });
        });
      }).catch(function () {});
    }

    btn.addEventListener('pointerenter', function () { if (!btn.disabled) setPreview(true); });
    btn.addEventListener('pointerleave', function () { if (!armed) setPreview(false); });
    btn.addEventListener('focus', function () { if (!btn.disabled) setPreview(true); });
    btn.addEventListener('blur', function () { disarm(); setPreview(false); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { disarm(); setPreview(false); }
    });
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      if (!armed) { setPreview(true); arm(); }
      else { disarm(); execute(); }
    });

    if (undo) {
      undo.addEventListener('click', function () {
        toast.classList.remove('is-open');
        swapAfterText(false);
        var motion = !reduce.matches && !!btn.animate;
        removedGroups.forEach(function (g) {
          g.hidden = false;
          if (!motion) return;
          g.style.overflow = 'hidden';
          g.animate([
            { height: '0px', marginTop: -gapOf(g) + 'px', opacity: 0 },
            { height: g.offsetHeight + 'px', marginTop: '0px', opacity: 1 }
          ], { duration: 300, easing: 'cubic-bezier(.2,0,0,1)' }).finished.then(function () { g.style.overflow = ''; }).catch(function () {});
        });
        removed.forEach(function (el, i) {
          el.hidden = false;
          el.style.overflow = '';
          if (motion) {
            el.animate(
              [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }],
              { duration: 260, delay: 120 + i * 40, easing: 'ease-out', fill: 'backwards' }
            );
          }
        });
        removed = [];
        removedGroups = [];
        btn.disabled = false;
        label.textContent = idleText;
      });
    }
  }

  window.initBlastRadius = initBlastRadius;
  function boot() { document.querySelectorAll('[data-mi="blast-radius"]').forEach(initBlastRadius); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
