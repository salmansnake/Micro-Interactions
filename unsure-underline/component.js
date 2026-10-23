/* Unsure Underline — vanilla JS. Auto-initializes every [data-mi="unsure-underline"].
   Mark words as <span class="uu-w" data-c="0.42" data-alts="a,b">word</span> (c = model confidence 0–1).
   Call window.initUnsureUnderline(el) for elements added later. */
(function () {
  'use strict';

  function initUnsureUnderline(root) {
    if (!root || root.__miUnsure) return;
    root.__miUnsure = true;
    var words = Array.prototype.slice.call(root.querySelectorAll('.uu-w'));
    var pop = root.querySelector('.uu-pop');
    var confText = root.querySelector('.uu-conf-text');
    var meter = root.querySelector('.uu-meter');
    var alts = root.querySelector('.uu-alts');
    var toggle = root.querySelector('.uu-on');
    var status = root.querySelector('.uu-status');
    var openWord = null;

    function unsureLeft() { return words.filter(function (w) { return !w.classList.contains('is-sure'); }).length; }
    function say() {
      var n = unsureLeft();
      status.textContent = n ? n + (n === 1 ? ' word to check. ' : ' words to check. ') + 'Darker underlines are less certain.' : 'Every word checked. Ready to send.';
    }

    words.forEach(function (w) {
      var c = Number(w.getAttribute('data-c'));
      w.style.setProperty('--u', (1 - c).toFixed(2));
      w.tabIndex = 0;
      w.setAttribute('role', 'button');
      w.setAttribute('aria-haspopup', 'dialog');
      w.setAttribute('aria-label', w.textContent + ', ' + Math.round(c * 100) + '% sure. Show alternatives.');
    });

    function close() {
      if (!openWord) return;
      openWord.classList.remove('is-open');
      pop.hidden = true;
      var w = openWord; openWord = null;
      return w;
    }

    function settle(w, text) {
      var changed = text !== w.textContent;
      w.textContent = text;
      w.classList.add('is-sure');
      w.setAttribute('data-c', '1');
      w.removeAttribute('role'); w.removeAttribute('aria-haspopup'); w.removeAttribute('aria-label');
      w.tabIndex = -1;
      w.classList.remove('is-swap', 'is-fixed'); void w.offsetWidth;
      if (changed) w.classList.add('is-swap');
      setTimeout(function () { w.classList.add('is-fixed'); }, changed ? 300 : 0);
      say();
      var next = words.filter(function (x) { return !x.classList.contains('is-sure'); })[0];
      if (next) next.focus({ preventScroll: true });
    }

    function open(w) {
      if (root.classList.contains('is-hidden') || w.classList.contains('is-sure')) return;
      close();
      openWord = w;
      w.classList.add('is-open');
      var c = Number(w.getAttribute('data-c'));
      confText.textContent = Math.round(c * 100) + '% sure';
      meter.style.setProperty('--c', c);
      alts.replaceChildren();
      var keep = document.createElement('button');
      keep.type = 'button'; keep.className = 'is-keep'; keep.textContent = 'Keep “' + w.textContent + '”';
      keep.addEventListener('click', function () { close(); settle(w, w.textContent); });
      alts.appendChild(keep);
      w.getAttribute('data-alts').split(',').forEach(function (a) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = a.trim();
        b.addEventListener('click', function () { close(); settle(w, a.trim()); });
        alts.appendChild(b);
      });
      pop.hidden = false;
      var o = root.getBoundingClientRect(), r = w.getBoundingClientRect();
      var left = Math.max(12, Math.min(o.width - pop.offsetWidth - 12, r.left - o.left + r.width / 2 - pop.offsetWidth / 2));
      var top = r.top - o.top - pop.offsetHeight - 8;
      if (top < 8) top = r.bottom - o.top + 8;
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      keep.focus({ preventScroll: true });
    }

    root.addEventListener('click', function (e) {
      var w = e.target.closest('.uu-w');
      if (w) { openWord === w ? close() : open(w); }
    });
    root.addEventListener('keydown', function (e) {
      var w = e.target.closest('.uu-w');
      if (w && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(w); }
      if (e.key === 'Escape' && openWord) { var back = close(); back.focus(); }
    });
    document.addEventListener('pointerdown', function (e) {
      if (openWord && !pop.contains(e.target) && !openWord.contains(e.target)) close();
    });
    toggle.addEventListener('change', function () {
      root.classList.toggle('is-hidden', !toggle.checked);
      close();
      words.forEach(function (w) { if (!w.classList.contains('is-sure')) w.tabIndex = toggle.checked ? 0 : -1; });
      status.textContent = toggle.checked ? '' : 'Confidence hidden.';
      if (toggle.checked) say();
    });
    say();
  }

  window.initUnsureUnderline = initUnsureUnderline;
  function boot() { document.querySelectorAll('[data-mi="unsure-underline"]').forEach(initUnsureUnderline); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
