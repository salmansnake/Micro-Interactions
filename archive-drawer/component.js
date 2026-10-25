/* Archive Drawer — vanilla JS. Auto-initializes every [data-mi="archive-drawer"].
   Call window.initArchiveDrawer(el) for elements added later. */
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

  function initArchiveDrawer(root) {
    if (!root || root.__miDrawer) return;
    root.__miDrawer = true;
    evenLines(root);
    var list = root.querySelector('.ad-list');
    var empty = root.querySelector('.ad-empty');
    var drawer = root.querySelector('.ad-drawer');
    var badge = root.querySelector('.ad-badge');
    var panel = root.querySelector('.ad-panel');
    var archived = root.querySelector('.ad-archived');
    var n = 0;

    function setCount() {
      root.style.setProperty('--ad-n', n);
      badge.textContent = n;
      drawer.setAttribute('aria-label', 'Archive, ' + n + (n === 1 ? ' item' : ' items'));
      empty.hidden = list.children.length > 0;
      if (!n && !panel.hidden) toggle(false);
    }
    function gulp() { drawer.classList.remove('is-gulp'); void drawer.offsetWidth; drawer.classList.add('is-gulp'); }

    // Fly a label card from one element to another along an arc.
    function fly(text, fromEl, toEl, shrinkTo, done) {
      if (reduce.matches) { done(); return; }
      var o = root.getBoundingClientRect(), a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      var card = document.createElement('span'); card.className = 'ad-fly'; card.textContent = text;
      root.appendChild(card);
      var w = card.offsetWidth, h = card.offsetHeight;
      var x0 = a.left - o.left + a.width / 2 - w / 2, y0 = a.top - o.top + a.height / 2 - h / 2;
      var x1 = b.left - o.left + b.width / 2 - w / 2, y1 = b.top - o.top + b.height / 2 - h / 2;
      var frames = [];
      for (var k = 0; k <= 12; k++) {
        var t = k / 12, s = shrinkTo ? 1 - t * 0.85 : 0.2 + t * 0.8;
        frames.push({ transform: 'translate(' + (x0 + (x1 - x0) * t).toFixed(1) + 'px,' + (y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 40).toFixed(1) + 'px) scale(' + s.toFixed(2) + ') rotate(' + (shrinkTo ? t * 8 : (1 - t) * -8).toFixed(1) + 'deg)', opacity: shrinkTo && t > 0.85 ? (1 - t) / 0.15 : 1 });
      }
      card.animate(frames, { duration: 560, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }).finished.then(function () { card.remove(); done(); });
    }

    function archive(row) {
      var title = row.querySelector('small').textContent;
      var h = row.offsetHeight;
      row.style.height = h + 'px';
      var anim = reduce.matches ? null : row.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' }], { duration: 360, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      fly(title, row, drawer, true, function () {
        n++;
        setCount();
        gulp();
      });
      var finish = function () {
        row.remove();
        if (anim) anim.cancel();
        row.style.height = '';
        // keep the row for restoring
        var li = document.createElement('li');
        li.className = 'ad-row';
        li.appendChild(row.querySelector('.ad-av').cloneNode(true));
        li.appendChild(row.querySelector('div').cloneNode(true));
        var restore = document.createElement('button');
        restore.type = 'button'; restore.className = 'ad-restore'; restore.textContent = 'Restore';
        restore.setAttribute('aria-label', 'Restore ' + title);
        restore.addEventListener('click', function () { unarchive(li, row); });
        li.appendChild(restore);
        archived.insertBefore(li, archived.firstChild);
        setCount();
        var next = list.querySelector('.ad-archive');
        (next || drawer).focus({ preventScroll: true });
      };
      if (anim) anim.finished.then(finish); else finish();
    }

    function unarchive(li, row) {
      var title = row.querySelector('small').textContent;
      li.remove();
      n--;
      setCount();
      gulp();
      list.appendChild(row);
      row.classList.remove('is-in'); void row.offsetWidth;
      row.style.visibility = 'hidden';
      fly(title, drawer, row, false, function () {
        row.style.visibility = '';
        row.classList.add('is-in');
        setCount();
      });
      setCount();
    }

    function toggle(open) {
      panel.hidden = !open;
      drawer.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var b = archived.querySelector('button'); if (b) b.focus({ preventScroll: true }); }
    }

    list.addEventListener('click', function (e) {
      var b = e.target.closest('.ad-archive');
      if (b) archive(b.closest('.ad-row'));
    });
    drawer.addEventListener('click', function () { if (n) toggle(panel.hidden); else gulp(); });
    setCount();
  }

  window.initArchiveDrawer = initArchiveDrawer;
  function boot() { document.querySelectorAll('[data-mi="archive-drawer"]').forEach(initArchiveDrawer); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
