/* Lunch Shield — vanilla JS. Auto-initializes every [data-mi="lunch-shield"].
   Accepting the invite drops the meeting toward lunch; a sandwich steps out and stops it a little above the slot,
   then asks: move it to the first free slot after lunch, or book over lunch anyway.
   Call window.initLunchShield(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initLunchShield(root) {
    if (!root || root.__miLsh) return;
    root.__miLsh = true;
    var accept = root.querySelector('.lsh-accept'), ev = root.querySelector('.lsh-new'), ask = root.querySelector('.lsh-ask');
    var move = root.querySelector('.lsh-move'), eat = root.querySelector('.lsh-eat'), status = root.querySelector('.lsh-status'), foot = root.querySelector('.lsh-foot');
    var name = ev.textContent.trim(), state = 'idle', timer = 0, msg = root.querySelector('.lsh-ask-msg');
    var INVITE = 'Jordan Lee invited you for 12:00\u00a0PM.';
    var DONE = ['Booked ' + name + ' at 1:00 PM. Lunch\u00a0survives.', 'Booked over lunch. The sandwich will wait. It always\u00a0does.'];

    // Every text line in the bottom block gets the height of the tallest one at the current width,
    // so the card keeps one height before, during and after the question
    function reserve() {
      var cs = getComputedStyle(root), w = root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), h = 0;
      var probe = status.cloneNode(false);
      probe.removeAttribute('role'); probe.removeAttribute('aria-live'); probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position: absolute; visibility: hidden; left: 0; top: 0; min-height: 0; width: ' + w + 'px';
      root.appendChild(probe);
      [INVITE].concat(DONE).forEach(function (t) { probe.textContent = t; h = Math.max(h, probe.getBoundingClientRect().height); });
      probe.style.fontWeight = '500'; probe.textContent = msg.textContent; h = Math.max(h, probe.getBoundingClientRect().height);
      root.removeChild(probe);
      status.style.minHeight = msg.style.minHeight = Math.ceil(h) + 'px';
    }

    function reset() {
      clearTimeout(timer); state = 'idle';
      root.classList.remove('is-guarding', 'is-over');
      ev.hidden = true; ev.className = 'lsh-ev lsh-new';
      ask.hidden = true; foot.hidden = false; status.textContent = INVITE;
      accept.textContent = 'Accept 12:00 PM'; accept.classList.remove('is-secondary'); accept.disabled = false;
    }

    function settle(text) {
      state = 'done'; ask.hidden = true; foot.hidden = false; status.textContent = text;
      accept.textContent = 'Undo'; accept.classList.add('is-secondary'); accept.disabled = false;
      accept.focus({ preventScroll: true });
    }

    accept.addEventListener('click', function () {
      if (state === 'done') { reset(); return; }
      if (state !== 'idle') return;
      state = 'asking'; accept.disabled = true;
      ev.hidden = false; ev.classList.add('is-dropping');
      // The sandwich steps out just before the meeting lands, and holds it above lunch
      timer = setTimeout(function () {
        root.classList.add('is-guarding');
        ev.classList.remove('is-dropping'); ev.classList.add('is-stopped');
        ask.hidden = false; foot.hidden = true;
        move.focus({ preventScroll: true });
      }, reduce.matches ? 0 : 380);
    });
    move.addEventListener('click', function () {
      ev.classList.remove('is-stopped'); ev.classList.add('is-moved');
      settle(DONE[0]);
    });
    eat.addEventListener('click', function () {
      ev.classList.remove('is-stopped');
      root.classList.add('is-over');
      settle(DONE[1]);
    });
    // Accept keeps its width when it turns into Undo
    function sizeBtn() { accept.style.minWidth = ''; accept.style.minWidth = Math.ceil(accept.getBoundingClientRect().width) + 'px'; }
    reset();
    sizeBtn();
    reserve();
    var lastW = 0;
    if (window.ResizeObserver) new ResizeObserver(function () { var w = root.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; reserve(); } }).observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (state === 'idle') sizeBtn(); reserve(); });
  }

  window.initLunchShield = initLunchShield;
  function boot() { document.querySelectorAll('[data-mi="lunch-shield"]').forEach(initLunchShield); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
