/* Reply-All Megaphone — vanilla JS. Auto-initializes every [data-mi="reply-all-megaphone"].
   Reply All to more than a few people (data-people) turns the button into a megaphone and shows the whole crowd,
   one dot each, before asking whether the sender alone would do. Call window.initReplyAllMegaphone(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

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

  function initReplyAllMegaphone(root) {
    if (!root || root.__miRam) return;
    root.__miRam = true;
    evenLines(root);
    var people = Math.max(2, Number(root.getAttribute('data-people')) || 40); // never 1: a reply-all needs a crowd
    var count = people.toLocaleString('en-US'), others = (people - 1).toLocaleString('en-US');
    var MAX_DOTS = 60; // three rows: past this the crowd is a count, so a list of thousands can't stretch the card
    var sender = root.getAttribute('data-sender') || 'Alex Rivera', first = sender.split(' ')[0];
    var crowd = root.querySelector('.ram-crowd'), dots = root.querySelector('.ram-dots'), ask = root.querySelector('.ram-ask');
    var more = root.querySelector('.ram-more'), group = root.querySelector('.ram-who small');
    var actions = root.querySelector('.ram-actions'), to = root.querySelector('.ram-to'), chip = root.querySelector('.ram-chip');
    var status = root.querySelector('.ram-status');
    var reply = root.querySelector('.ram-reply'), all = root.querySelector('.ram-replyall');
    var just = root.querySelector('.ram-just'), yes = root.querySelector('.ram-all'), discard = root.querySelector('.ram-discard');
    var timer = 0;

    group.textContent = 'to All Company · ' + count + ' people'; // never 1: people is at least 2
    ask.textContent = 'Reply to all ' + count + ' people? Only ' + first + ' asked.'; // never 1: people is at least 2
    just.textContent = 'Just ' + first; yes.textContent = 'Yes, All ' + count;

    function writeTo(everyone) {
      crowd.hidden = true; actions.hidden = true;
      to.hidden = false; to.classList.toggle('is-all', everyone);
      chip.textContent = everyone ? 'All Company (' + count + ')' : sender;
      discard.hidden = false;
      status.textContent = everyone ? 'Replying to all ' + count + '. Bold. Very bold.'
        : 'Replying to ' + first + ' only. ' + others + (people - 1 === 1 ? ' inbox thanks' : ' inboxes thank') + ' you.';
      discard.focus({ preventScroll: true });
    }

    reply.addEventListener('click', function () { writeTo(false); });
    all.addEventListener('click', function () {
      if (people <= 3) return writeTo(true);
      root.classList.add('is-blaring');
      clearTimeout(timer);
      timer = setTimeout(function () {
        root.classList.remove('is-blaring');
        actions.hidden = true;
        // One dot per person up to MAX_DOTS, the sender ringed; they spring in fast, so the crowd's size lands all at once
        dots.innerHTML = '';
        more.hidden = people <= MAX_DOTS;
        more.textContent = more.hidden ? '' : 'and ' + (people - MAX_DOTS).toLocaleString('en-US') + ' more';
        for (var i = 0; i < Math.min(people, MAX_DOTS); i++) {
          var d = document.createElement('i');
          if (i === 0) d.className = 'is-sender';
          d.style.background = COLORS[(i * 7) % 5];
          d.style.animationDelay = (reduce.matches ? 0 : i * 12) + 'ms';
          dots.appendChild(d);
        }
        crowd.hidden = false;
        just.focus({ preventScroll: true });
      }, reduce.matches ? 0 : 520);
    });
    just.addEventListener('click', function () { writeTo(false); });
    yes.addEventListener('click', function () { writeTo(true); });
    discard.addEventListener('click', function () {
      to.hidden = true; discard.hidden = true; status.textContent = '';
      actions.hidden = false; all.focus({ preventScroll: true });
    });
  }

  window.initReplyAllMegaphone = initReplyAllMegaphone;
  function boot() { document.querySelectorAll('[data-mi="reply-all-megaphone"]').forEach(initReplyAllMegaphone); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
