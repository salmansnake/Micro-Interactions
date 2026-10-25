/* Snooze Slide — vanilla JS. Auto-initializes every [data-mi="snooze-slide"].
   Call window.initSnoozeSlide(el) for elements added later. */
(function () {
  'use strict';
  var STEP = 64;          // px of drag per snooze option
  var MAX_DRAG = STEP * 4 + 24;

  function nextAt(hour, addDays, weekday) {
    var d = new Date();
    if (weekday != null) { var diff = (weekday + 7 - d.getDay()) % 7 || 7; d.setDate(d.getDate() + diff); }
    else d.setDate(d.getDate() + (addDays || 0));
    d.setHours(hour, 0, 0, 0);
    return d;
  }
  function options() {
    var now = new Date();
    var inHour = new Date(now.getTime() + 3600000);
    var evening = nextAt(18, now.getHours() >= 17 ? 1 : 0);
    return [
      { label: 'In 1 Hour', at: inHour },
      { label: now.getHours() >= 17 ? 'Tomorrow Evening' : 'This Evening', at: evening },
      { label: 'Tomorrow', at: nextAt(9, 1) },
      { label: 'Next Week', at: nextAt(9, 0, 1) }
    ];
  }
  function fmt(d) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var day = new Date(d); day.setHours(0, 0, 0, 0);
    var diff = Math.round((day - today) / 86400000);
    var time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diff === 0) return 'Today at ' + time;
    if (diff === 1) return 'Tomorrow at ' + time;
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + ' at ' + time;
  }
  var CLOCK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.4"/></svg>';

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

  function initSnoozeSlide(root) {
    if (!root || root.__miSnooze) return;
    root.__miSnooze = true;
    evenLines(root);
    var snoozed = root.querySelector('.sn-snoozed');

    root.querySelectorAll('.sn-item').forEach(function (item) {
      var card = item.querySelector('.sn-card');
      var track = item.querySelector('.sn-track');
      var when = item.querySelector('.sn-when');
      var time = item.querySelector('.sn-time');
      var opts = options();
      var x = 0, startX = 0, dragging = false, step = -1;

      function setX(v, settle) {
        x = Math.max(0, Math.min(MAX_DRAG, v));
        card.classList.toggle('is-settling', !!settle);
        card.style.setProperty('--sn-x', x + 'px');
        var s = x < STEP * 0.75 ? -1 : Math.min(3, Math.floor((x - STEP * 0.75) / STEP));
        if (s !== step) {
          step = s;
          opts = options();
          track.style.setProperty('--sn-step', Math.max(0, s));
          if (s >= 0) {
            when.textContent = opts[s].label;
            time.textContent = fmt(opts[s].at);
            when.classList.remove('is-pop');
            void when.offsetWidth;
            when.classList.add('is-pop');
            if (navigator.vibrate && dragging) { try { navigator.vibrate(8); } catch (e) {} }
          } else { when.textContent = 'Snooze'; time.textContent = 'Keep dragging'; }
        }
      }

      function commit() {
        if (step < 0) { setX(0, true); return; }
        var choice = opts[step];
        card.classList.add('is-settling');
        card.style.setProperty('--sn-x', '110%');
        setTimeout(function () { item.style.height = item.offsetHeight + 'px'; void item.offsetWidth; item.classList.add('is-gone'); }, 220);
        setTimeout(function () {
          item.hidden = true;
          item.classList.remove('is-gone');
          var pill = document.createElement('div');
          pill.className = 'sn-pill';
          pill.innerHTML = CLOCK;
          var text = document.createElement('span');
          text.textContent = 'Snoozed until ' + fmt(choice.at);
          var undo = document.createElement('button');
          undo.type = 'button';
          undo.textContent = 'Undo';
          undo.addEventListener('click', function () {
            pill.remove();
            item.hidden = false;
            item.style.height = '';
            setX(0, false);
            card.focus();
          });
          pill.append(text, undo);
          snoozed.appendChild(pill);
          undo.focus({ preventScroll: true });
        }, 640);
      }

      card.addEventListener('pointerdown', function (e) {
        dragging = true;
        startX = e.clientX - x;
        try { card.setPointerCapture(e.pointerId); } catch (err) {}
        card.classList.remove('is-settling');
      });
      card.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var raw = e.clientX - startX;
        // rubber band past the last option
        setX(raw > MAX_DRAG - 24 ? MAX_DRAG - 24 + (raw - (MAX_DRAG - 24)) * 0.25 : raw);
      });
      function end() { if (!dragging) return; dragging = false; commit(); }
      card.addEventListener('pointerup', end);
      card.addEventListener('pointercancel', function () { dragging = false; setX(0, true); });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); setX(Math.min(STEP * 3 + STEP * 0.75 + 4, (step < 0 ? STEP * 0.75 + 4 : x + STEP)), true); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); setX(step <= 0 ? 0 : x - STEP, true); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (step >= 0) commit(); }
        else if (e.key === 'Escape') setX(0, true);
      });
      card.addEventListener('blur', function () { if (!dragging && step >= 0 && !item.hidden && card.style.getPropertyValue('--sn-x') !== '110%') setX(0, true); });
      when.textContent = 'Snooze';
      time.textContent = 'Keep dragging';
    });
  }

  window.initSnoozeSlide = initSnoozeSlide;
  function boot() { document.querySelectorAll('[data-mi="snooze-slide"]').forEach(initSnoozeSlide); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
