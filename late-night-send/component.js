/* Late-Night Send — vanilla JS. Auto-initializes every [data-mi="late-night-send"].
   The segmented control stands in for the clock. At night, Send swaps its icon for a moon, yawns, and asks to deliver
   at data-morning instead. Call window.initLateNightSend(el) for elements added later. */
(function () {
  'use strict';

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

  function initLateNightSend(root) {
    if (!root || root.__miLns) return;
    root.__miLns = true;
    evenLines(root);
    var to = (root.getAttribute('data-to') || 'Sam Rivera').split(' ')[0], morning = root.getAttribute('data-morning') || '9:00 AM';
    var segs = root.querySelectorAll('.lns-seg button'), ask = root.querySelector('.lns-ask'), askMsg = root.querySelector('.lns-ask-msg');
    var later = root.querySelector('.lns-later'), now = root.querySelector('.lns-now');
    var send = root.querySelector('.lns-send'), label = root.querySelector('.lns-send-label'), status = root.querySelector('.lns-status');
    var night = true, sent = false;

    function clock() { return root.querySelector('.lns-seg button[aria-checked="true"]').textContent; }
    function yawn() {
      if (!night || sent) return;
      send.classList.remove('is-yawning'); void send.offsetWidth; send.classList.add('is-yawning');
    }
    send.addEventListener('animationend', function () { send.classList.remove('is-yawning'); });

    function setTime(n) {
      night = n;
      segs.forEach(function (b) { var on = (b.getAttribute('data-time') === 'night') === n; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
      root.style.setProperty('--lns-x', n ? '100%' : '0%');
      root.classList.toggle('is-night', n);
      askMsg.textContent = 'It’s ' + clock() + ' for ' + to + ' too. Send it at ' + morning + ' instead?';
      later.textContent = 'Send at ' + morning;
      if (!sent) { ask.hidden = true; send.disabled = false; status.textContent = ''; }
      yawn();
    }
    segs.forEach(function (b) {
      b.addEventListener('click', function () { setTime(b.getAttribute('data-time') === 'night'); });
      b.addEventListener('keydown', function (e) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) < 0) return;
        e.preventDefault(); setTime(!night); root.querySelector('.lns-seg button[aria-checked="true"]').focus();
      });
    });

    function done(text) {
      sent = true; ask.hidden = true; send.disabled = false;
      send.classList.add('is-secondary'); label.textContent = 'Undo';
      status.textContent = text;
      send.focus({ preventScroll: true });
    }

    send.addEventListener('pointerenter', yawn);
    send.addEventListener('click', function () {
      if (sent) {
        sent = false; send.classList.remove('is-secondary'); label.textContent = 'Send'; status.textContent = '';
        return;
      }
      if (!night) return done('Sent at ' + clock() + '. A perfectly normal time.');
      ask.hidden = false; send.disabled = true;
      later.focus({ preventScroll: true });
    });
    later.addEventListener('click', function () { done('Scheduled for ' + morning + ' tomorrow. ' + to + '’s evening stays quiet.'); });
    now.addEventListener('click', function () { done('Sent at ' + clock() + '. ' + to + '’s phone just lit up the room.'); });

    // Send keeps one width whether it says Send (with an icon) or Undo
    function sizeBtn() {
      var keep = label.textContent, cls = send.className, w = 0;
      send.style.minWidth = '';
      ['Send', 'Undo'].forEach(function (s) { label.textContent = s; w = Math.max(w, send.getBoundingClientRect().width); });
      label.textContent = keep; send.className = cls; send.style.minWidth = Math.ceil(w) + 'px';
    }
    sizeBtn();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeBtn);
    setTime(true);
  }

  window.initLateNightSend = initLateNightSend;
  function boot() { document.querySelectorAll('[data-mi="late-night-send"]').forEach(initLateNightSend); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
