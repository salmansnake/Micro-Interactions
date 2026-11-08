/* Merge Zipper — vanilla JS. Auto-initializes every [data-mi="merge-zipper"].
   Each row holds data-l (yours) and data-r (theirs). Merge runs the pull down the rows: equal lines zip into one,
   a line that differs snags the zipper until you keep one side. Call window.initMergeZipper(el) for elements added later. */
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
      // A filled box marked data-fill spans the card from edge to edge, and its text fills it
      if (el.hasAttribute('data-fill')) return;
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

  function initMergeZipper(root) {
    if (!root || root.__miMz) return;
    root.__miMz = true;
    evenLines(root);
    var rows = Array.prototype.slice.call(root.querySelectorAll('.mz-row'));
    var pull = root.querySelector('.mz-pull'), pick = root.querySelector('.mz-pick'), pickMsg = root.querySelector('.mz-pick-msg');
    var status = root.querySelector('.mz-status'), btn = root.querySelector('.mz-btn');
    var keeps = root.querySelectorAll('.mz-keep');
    var H = 28, timer = 0, at = 0, busy = false, merged = false, settled = 0;

    rows.forEach(function (row) {
      var l = row.getAttribute('data-l'), r = row.getAttribute('data-r');
      row.innerHTML = '<span class="mz-l"></span><span class="mz-teeth" aria-hidden="true"></span><span class="mz-r"></span><span class="mz-m"></span>';
      row.querySelector('.mz-l').textContent = l; row.querySelector('.mz-r').textContent = r; row.querySelector('.mz-m').textContent = l;
    });
    var conflicts = rows.filter(function (r) { return r.getAttribute('data-l') !== r.getAttribute('data-r'); }).length;

    function speed(ms) { return reduce.matches ? Math.min(ms, 120) : ms; }
    function pullTo(y) { pull.style.transform = 'translateY(' + y + 'px)'; }
    function rowY(i) { return i * H + (H - 22) / 2; }

    function step() {
      if (at >= rows.length) return finish();
      var row = rows[at];
      pullTo(rowY(at));
      timer = setTimeout(function () {
        if (row.getAttribute('data-l') !== row.getAttribute('data-r') && !row.hasAttribute('data-kept')) return snag(row);
        row.classList.add('is-zipped'); at++; step();
      }, speed(200));
    }

    function snag(row) {
      row.classList.add('is-conflict');
      root.classList.remove('is-snagged'); void root.offsetWidth; root.classList.add('is-snagged');
      pickMsg.textContent = 'Both branches changed line ' + (at + 1) + '. Which one stays?';
      pick.hidden = false;
      status.textContent = 'Snagged on line ' + (at + 1) + '.';
      keeps[0].focus({ preventScroll: true });
    }

    keeps.forEach(function (k) {
      k.addEventListener('click', function () {
        var row = rows[at], side = k.getAttribute('data-side'), m = row.querySelector('.mz-m');
        m.textContent = row.getAttribute('data-' + side);
        m.classList.add(side === 'l' ? 'is-l' : 'is-r');
        row.setAttribute('data-kept', side);
        row.classList.remove('is-conflict'); row.classList.add('is-zipped');
        pick.hidden = true; settled++;
        status.textContent = 'Kept ' + (side === 'l' ? 'yours' : 'theirs') + '. Zipping on…';
        btn.focus({ preventScroll: true });
        at++; timer = setTimeout(step, speed(260));
      });
    });

    function finish() {
      pullTo(rows.length * H - 14);
      busy = false; merged = true; root.classList.add('is-merged');
      status.textContent = conflicts ? 'Merged into main. ' + settled + (settled === 1 ? ' conflict' : ' conflicts') + ', settled by you.' : 'Merged into main. Nothing to settle.';
      btn.textContent = 'Unzip'; btn.classList.add('is-secondary'); btn.disabled = false;
    }

    function unzip() {
      var i = rows.length - 1;
      busy = true; btn.disabled = true; root.classList.remove('is-merged');
      (function back() {
        if (i < 0) { reset(); status.textContent = 'Unzipped. Ready to merge again.'; btn.focus({ preventScroll: true }); return; }
        var row = rows[i];
        row.classList.remove('is-zipped');
        pullTo(rowY(i) - H);
        i--; timer = setTimeout(back, speed(70));
      })();
    }

    function reset() {
      clearTimeout(timer);
      rows.forEach(function (row) {
        row.classList.remove('is-zipped', 'is-conflict'); row.removeAttribute('data-kept');
        var m = row.querySelector('.mz-m'); m.className = 'mz-m'; m.textContent = row.getAttribute('data-l');
      });
      at = 0; settled = 0; busy = false; merged = false; pick.hidden = true; root.classList.remove('is-merged');
      pullTo(-14);
      btn.textContent = 'Merge'; btn.classList.remove('is-secondary'); btn.disabled = false;
    }

    btn.addEventListener('click', function () {
      if (busy) return;
      if (merged) return unzip();
      busy = true; btn.disabled = true;
      status.textContent = 'Zipping…';
      step();
    });

    // The button keeps one width whether it says Merge or Unzip
    function sizeBtn() {
      var keep = btn.textContent, w = 0;
      ['Merge', 'Unzip'].forEach(function (s) { btn.textContent = s; btn.style.minWidth = ''; w = Math.max(w, btn.getBoundingClientRect().width); });
      btn.textContent = keep; btn.style.minWidth = Math.ceil(w) + 'px';
    }
    sizeBtn();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeBtn);
    reset();
  }

  window.initMergeZipper = initMergeZipper;
  function boot() { document.querySelectorAll('[data-mi="merge-zipper"]').forEach(initMergeZipper); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
