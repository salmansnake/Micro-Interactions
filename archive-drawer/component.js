/* Archive Drawer — vanilla JS. Auto-initializes every [data-mi="archive-drawer"].
   Call window.initArchiveDrawer(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initArchiveDrawer(root) {
    if (!root || root.__miDrawer) return;
    root.__miDrawer = true;
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
