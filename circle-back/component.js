/* Circle Back Boomerang — vanilla JS. Auto-initializes every [data-mi="circle-back"].
   Finds follow-up promises ("circle back", "follow up", "touch base", …) and a rough time ("tomorrow",
   "next week", "Monday"). Sending throws a boomerang; it returns as a reminder. Hook root.onRemind for real reminders.
   Call window.initCircleBack(el) for elements added later. */
(function () {
  'use strict';
  var PROMISE = /\b(circle back|follow up|touch base|loop back|revisit (this|it)|get back to you)\b/i;
  var DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  function when(text) {
    var d = new Date(), t = text.toLowerCase(), m;
    if (/\btomorrow\b/.test(t)) d.setDate(d.getDate() + 1);
    else if ((m = t.match(/\b(next )?(monday|tuesday|wednesday|thursday|friday)\b/))) {
      var target = DAYS.indexOf(m[2]), diff = (target - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff); // the next one coming up
    } else if (/\bin a few days\b/.test(t)) d.setDate(d.getDate() + 3);
    else d.setDate(d.getDate() + 7);
    return d;
  }
  function fmt(d) { return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }); }
  function sentence(text, re) {
    var parts = text.match(/[^.!?]+[.!?]?/g) || [text];
    for (var i = 0; i < parts.length; i++) if (re.test(parts[i])) return parts[i].trim();
    return text.trim();
  }

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

  function initCircleBack(root) {
    if (!root || root.__miCircle) return;
    root.__miCircle = true;
    evenLines(root);
    var input = root.querySelector('.cb-input'), hint = root.querySelector('.cb-hint');
    var send = root.querySelector('.cb-send'), ff = root.querySelector('.cb-ff'), status = root.querySelector('.cb-status');
    var rem = root.querySelector('.cb-reminder'), remText = root.querySelector('.cb-rem-text');
    var open = root.querySelector('.cb-open'), again = root.querySelector('.cb-again'), boom = root.querySelector('.cb-boomerang');
    var to = root.getAttribute('data-to') || 'them';
    var pending = null;

    function check() {
      var m = input.value.match(PROMISE);
      hint.replaceChildren();
      if (!m) return null;
      var i = document.createElement('i'), b = document.createElement('b');
      b.textContent = '“' + m[0] + '”';
      hint.append(i, 'Boomerang ready for ', b, '. It comes back ' + fmt(when(input.value)) + '.');
      return m;
    }

    function fly(cls, from, toEl) {
      var r = root.getBoundingClientRect();
      var a = from.getBoundingClientRect();
      root.style.setProperty('--w', r.width + 'px');
      boom.style.setProperty('--x0', (a.left - r.left + a.width / 2 - 18) + 'px');
      boom.style.setProperty('--y0', (a.top - r.top - 10) + 'px');
      if (toEl) {
        var b = toEl.getBoundingClientRect();
        boom.style.setProperty('--x1', (b.right - r.left - 50) + 'px');
        boom.style.setProperty('--y1', (b.top - r.top + 6) + 'px');
      }
      boom.classList.remove('is-out', 'is-back'); void boom.offsetWidth; boom.classList.add(cls);
    }

    function throwIt(text) {
      var d = when(text);
      pending = { text: sentence(text, PROMISE), date: d };
      fly('is-out', send);
      status.textContent = 'Sent. Reminder set for ' + fmt(d) + '. It’ll come back.';
      ff.hidden = false;
      send.hidden = true;
      if (typeof root.onRemind === 'function') root.onRemind(pending);
    }

    input.addEventListener('input', function () { status.textContent = ''; check(); });

    send.addEventListener('click', function () {
      var text = input.value.trim();
      if (!text) return;
      rem.hidden = true;
      if (check()) throwIt(text);
      else { status.textContent = 'Sent. No boomerang, so you’ll have to remember this one yourself.'; }
    });

    ff.addEventListener('click', function () {
      if (!pending) return;
      ff.hidden = true;
      remText.textContent = 'You told ' + to + ': “' + pending.text + '”';
      rem.hidden = false;
      fly('is-back', send, rem);
      status.textContent = '';
      open.focus();
    });

    open.addEventListener('click', function () {
      rem.hidden = true; pending = null;
      send.hidden = false;
      status.textContent = 'Thread opened. You’re officially circling back.';
      input.value = ''; hint.replaceChildren();
      input.focus();
    });

    again.addEventListener('click', function () {
      rem.hidden = true;
      throwIt(pending ? pending.text : input.value);
      status.textContent = 'Again? Bold. See you ' + fmt(pending.date) + '.';
    });
    check();
  }

  window.initCircleBack = initCircleBack;
  function boot() { document.querySelectorAll('[data-mi="circle-back"]').forEach(initCircleBack); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
