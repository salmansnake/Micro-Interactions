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
    if (m) out.push(m + ' minutes');
    return out.join(' ');
  }
  function clock(start, add) {
    var p = start.split(':'), t = Number(p[0]) * 60 + Number(p[1]) + add;
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  }

  function initCouldBeEmail(root) {
    if (!root || root.__miEmail) return;
    root.__miEmail = true;
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
      evTime.textContent = start + '–' + end + ' · ' + people + ' people';
      envTo.textContent = 'To: ' + people + ' people';
      envRe.textContent = 'Re: ' + name;
      free.textContent = 'Free from ' + start + ' to ' + end;
      vTitle.textContent = pair() ? 'This could have been a message.' : 'This could have been an email.';
      vSub.textContent = pair() ? 'It would give the two of you ' + saved() + ' back.' : 'It would give ' + people + ' people ' + saved() + ' back.';
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
      status.textContent = pair() ? 'Sent. You both got ' + saved() + ' back.' : 'Sent. ' + people + ' people just got ' + saved() + ' back.';
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
