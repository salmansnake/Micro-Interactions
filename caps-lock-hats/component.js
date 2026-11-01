/* Caps Lock Hats — vanilla JS. Auto-initializes every [data-mi="caps-lock-hats"].
   The password field draws its own dots. When Caps Lock is on (read from the keyboard with getModifierState, or the
   Caps Lock key button on touch screens), every dot gets a party hat, staggered, and the field says why.
   Call window.initCapsLockHats(el) for elements added later. */
(function () {
  'use strict';
  var COLORS = ['var(--pink)', 'var(--orange)', 'var(--aqua)', 'var(--sage)', 'var(--olive)'];
  var TILTS = [-10, 6, -4, 12, -8, 3, -12, 8];

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

  function initCapsLockHats(root) {
    if (!root || root.__miClh) return;
    root.__miClh = true;
    evenLines(root);
    var pass = root.querySelector('.clh-pass'), dots = root.querySelector('.clh-dots'), key = root.querySelector('.clh-key');
    var sign = root.querySelector('.clh-btn'), status = root.querySelector('.clh-status');
    var real = false, sim = false;

    function render() {
      var n = Math.min(pass.value.length, 24);
      while (dots.children.length > n) dots.lastChild.remove();
      while (dots.children.length < n) {
        var i = dots.children.length, d = document.createElement('i'), h = document.createElement('i');
        d.className = 'clh-dot'; h.className = 'clh-hat';
        h.style.setProperty('--clh-k', COLORS[i % COLORS.length]);
        h.style.setProperty('--clh-p', COLORS[(i + 2) % COLORS.length]); // the tinsel in another party color
        h.style.setProperty('--clh-r', TILTS[i % TILTS.length] + 'deg');
        h.style.transitionDelay = (i * 35) + 'ms';
        d.appendChild(h); dots.appendChild(d);
      }
    }
    function caps(on) {
      var was = root.classList.contains('is-caps');
      root.classList.toggle('is-caps', on);
      key.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && !was) status.textContent = 'Caps Lock is on. Your dots are celebrating; your password won’t be.';
      else if (!on && was) status.textContent = 'Caps Lock is off. Party’s over.';
    }
    function sync() { caps(real || sim); }

    // The keyboard's Caps Lock is read from every key and pointer event, wherever focus is, so turning it off
    // while Sign In or the page has focus still takes the hats off
    function read(e) { if (e.getModifierState) { real = e.getModifierState('CapsLock'); sync(); } }
    document.addEventListener('keydown', read);
    document.addEventListener('keyup', read);
    root.addEventListener('pointerdown', read);
    pass.addEventListener('input', function () {
      // The demo key stands in for Caps Lock on touch screens: letters typed while it's on come out capitalized
      if (sim && !real) { var s = pass.selectionStart; pass.value = pass.value.toUpperCase(); pass.setSelectionRange(s, s); }
      render();
    });
    key.addEventListener('click', function (e) {
      read(e);
      // The on-screen key can't switch off the keyboard's Caps Lock, so it says where to do it instead of seeming broken
      if (real) { sim = false; sync(); status.textContent = 'Caps Lock is on at your keyboard. Press its Caps Lock key to turn it off.'; return; }
      sim = !sim; sync(); pass.focus({ preventScroll: true });
    });
    sign.addEventListener('click', function () {
      status.textContent = root.classList.contains('is-caps') ? 'Signing in would fail: Caps Lock is on. Turn it off and try again.' : 'Signed in. No hats were harmed.';
    });
    render();
  }

  window.initCapsLockHats = initCapsLockHats;
  function boot() { document.querySelectorAll('[data-mi="caps-lock-hats"]').forEach(initCapsLockHats); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
