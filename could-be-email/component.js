/* Could've Been an Email — vanilla JS. Auto-initializes every [data-mi="could-be-email"].
   A meeting with fewer than three words of agenda folds into an envelope a moment after it comes into view.
   Call window.initCouldBeEmail(el) for elements added later. */
(function () {
  'use strict';
  var PX_PER_MIN = 104 / 60;
  var MIN_AGENDA_WORDS = 3;

  function words(s) { s = s.trim(); return s ? s.split(/\s+/).length : 0; }
  function span(min) {
    var h = Math.floor(min / 60), m = min % 60, out = [];
    if (h) out.push(h + (h === 1 ? ' hour' : ' hours'));
    if (m) out.push(m + (m === 1 ? ' minute' : ' minutes'));
    return out.join(' ');
  }
  function clock(start, add) {
    var p = start.split(':'), t = Number(p[0]) * 60 + Number(p[1]) + add;
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
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

  function initCouldBeEmail(root) {
    if (!root || root.__miEmail) return;
    root.__miEmail = true;
    evenLines(root);
    var $ = function (s) { return root.querySelector(s); };
    var title = $('.ce-title-input'), seg = $('.ce-seg'), agenda = $('.ce-agenda');
    var minus = $('.ce-minus'), plus = $('.ce-plus'), peopleOut = $('.ce-people');
    var event = $('.ce-event'), evTitle = $('.ce-ev-title'), evTime = $('.ce-ev-time');
    var envTo = $('.ce-env-to'), envRe = $('.ce-env-re'), free = $('.ce-free');
    var verdict = $('.ce-verdict'), vTitle = $('.ce-verdict-title'), vSub = $('.ce-verdict-sub');
    var send = $('.ce-send'), keep = $('.ce-keep'), status = $('.ce-status'), again = $('.ce-again');
    var buttons = Array.prototype.slice.call(seg.querySelectorAll('button'));
    var start = root.getAttribute('data-start') || '10:00';
    var mins = 30, people = Number(peopleOut.textContent) || 6;
    var armed = false, overridden = false, sent = false, folded = false, timer = 0;

    function pair() { return people === 2; }
    function saved() { return span(people * mins); }

    function render() {
      var end = clock(start, mins);
      var name = title.value.trim() || 'Untitled Meeting';
      event.style.setProperty('--ce-h', Math.round(mins * PX_PER_MIN) + 'px');
      evTitle.textContent = name;
      evTime.textContent = start + '–' + end + ' · ' + people + ' people'; // never 1
      envTo.textContent = 'To: ' + people + ' people'; // never 1: people stays between 2 and 40
      envRe.textContent = 'Re: ' + name;
      free.textContent = 'Free from ' + start + ' to ' + end;
      vTitle.textContent = pair() ? 'This could have been a message.' : 'This could have been an email.';
      vSub.textContent = pair() ? 'It would give the two of you ' + saved() + ' back.' : 'It would give ' + people + ' people ' + saved() + ' back.'; // never 1
      send.textContent = pair() ? 'Send as Message' : 'Send as Email';
      minus.disabled = people <= 2;
      plus.disabled = people >= 40;
      peopleOut.textContent = people;
    }

    function setFold(on) {
      if (on === folded) return;
      folded = on;
      root.classList.toggle('is-email', on);
      verdict.hidden = !on;
    }

    function evaluate() {
      setFold(armed && !sent && !overridden && words(agenda.value) < MIN_AGENDA_WORDS);
    }

    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { pick(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        pick((i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length);
        buttons[(i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length].focus();
      });
    });
    function pick(i) {
      mins = Number(buttons[i].getAttribute('data-min'));
      seg.style.setProperty('--i', i);
      buttons.forEach(function (b, k) { b.setAttribute('aria-checked', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
      render();
    }

    minus.addEventListener('click', function () { people = Math.max(2, people - 1); render(); });
    plus.addEventListener('click', function () { people = Math.min(40, people + 1); render(); });
    title.addEventListener('input', render);

    agenda.addEventListener('input', function () {
      clearTimeout(timer);
      if (words(agenda.value) >= MIN_AGENDA_WORDS) {
        if (folded) status.textContent = 'Now that’s a meeting.';
        evaluate();
      } else {
        // Give people a moment to finish typing before folding it again.
        timer = setTimeout(function () { if (!folded && !overridden) status.textContent = ''; evaluate(); }, 900);
      }
    });

    keep.addEventListener('click', function () {
      overridden = true;
      evaluate();
      status.textContent = 'Fine. Add an agenda so everyone knows why they’re there.';
      agenda.focus();
    });

    send.addEventListener('click', function () {
      sent = true;
      root.classList.add('is-sent');
      verdict.hidden = true;
      status.textContent = pair() ? 'Sent. You both got ' + saved() + ' back.' : 'Sent. ' + people + ' people just got ' + saved() + ' back.'; // never 1
      again.hidden = false;
      again.focus();
    });

    again.addEventListener('click', function () {
      sent = false; overridden = false; folded = false;
      root.classList.remove('is-sent', 'is-email');
      agenda.value = '';
      status.textContent = '';
      again.hidden = true;
      title.focus();
      clearTimeout(timer);
      timer = setTimeout(evaluate, 1100);
    });

    // Fold a beat after it first scrolls into view, so people see it happen.
    function arm() { if (armed) return; armed = true; timer = setTimeout(evaluate, 1100); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); arm(); }
      }, { threshold: 0.6 });
      io.observe(root);
    } else arm();

    buttons.forEach(function (b, k) { if (b.getAttribute('aria-checked') === 'true') pick(k); });
    render();
  }

  window.initCouldBeEmail = initCouldBeEmail;
  function boot() { document.querySelectorAll('[data-mi="could-be-email"]').forEach(initCouldBeEmail); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
