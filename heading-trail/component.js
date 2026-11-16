/* Heading Trail — vanilla JS. Auto-initializes every [data-mi="heading-trail"].
   A heading counts as passed once it scrolls above the top of the page area. Passed headings fly up into the trail
   as buttons; clicking one scrolls back to it, and the sections after it leave the trail as they come back into view.
   Call window.initHeadingTrail(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>';

  function initHeadingTrail(root) {
    if (!root || root.__miHtr) return;
    root.__miHtr = true;
    var scroll = root.querySelector('.htr-scroll'), trail = root.querySelector('.htr-trail'), crumbs = root.querySelector('.htr-crumbs');
    var top = root.querySelector('.htr-top');
    var heads = Array.prototype.slice.call(scroll.querySelectorAll('h3'));
    var shown = [];

    function passed() {
      var y = scroll.scrollTop + 8;
      return heads.filter(function (h) { return h.offsetTop < y; });
    }

    function fly(h, btn) {
      if (reduce.matches) return;
      var rb = root.getBoundingClientRect(), from = h.getBoundingClientRect(), to = btn.getBoundingClientRect();
      var g = document.createElement('p');
      g.className = 'htr-ghost'; g.textContent = h.textContent; g.setAttribute('aria-hidden', 'true');
      root.appendChild(g);
      // Start where the heading is (clamped to the top of the page area, which it has just crossed), end on the button's label
      var sy = Math.max(from.top, scroll.getBoundingClientRect().top) - rb.top, sx = from.left - rb.left;
      var scale = 13 / 17, ex = to.left - rb.left + 12, ey = to.top - rb.top + (to.height - 24 * scale) / 2;
      g.style.transform = 'translate(' + sx + 'px, ' + sy + 'px)';
      btn.classList.add('is-landing');
      void g.offsetWidth;
      g.style.transform = 'translate(' + ex + 'px, ' + ey + 'px) scale(' + scale + ')';
      var end = function () { g.remove(); btn.classList.remove('is-landing'); };
      g.addEventListener('transitionend', end, { once: true });
      setTimeout(end, 700);
    }

    function render() {
      var now = passed();
      // Leave: headings back in view
      while (shown.length > now.length) {
        var gone = shown.pop(), li = gone.li;
        li.classList.add('is-out');
        setTimeout(function (el) { return function () { el.remove(); }; }(li), 140);
      }
      // Arrive: newly passed headings, each with a button that jumps back to it
      now.forEach(function (h, i) {
        if (shown[i]) return;
        var li = document.createElement('li'), b = document.createElement('button');
        b.type = 'button'; b.className = 'htr-crumb'; b.textContent = h.textContent;
        b.addEventListener('click', function () { scroll.scrollTop = h.offsetTop - 4; });
        li.innerHTML = CHEVRON; li.appendChild(b); crumbs.appendChild(li);
        shown.push({ h: h, li: li, b: b });
        trail.scrollLeft = trail.scrollWidth;
        fly(h, b);
      });
      shown.forEach(function (s, i) { if (i === shown.length - 1) s.b.setAttribute('aria-current', 'location'); else s.b.removeAttribute('aria-current'); });
      trail.scrollLeft = trail.scrollWidth;
      trail.classList.toggle('is-scrolled', trail.scrollLeft > 0);
    }

    var queued = false;
    scroll.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; render(); }); } }, { passive: true });
    trail.addEventListener('scroll', function () { trail.classList.toggle('is-scrolled', trail.scrollLeft > 0); }, { passive: true });
    top.addEventListener('click', function () { scroll.scrollTop = 0; });
    render();
  }

  window.initHeadingTrail = initHeadingTrail;
  function boot() { document.querySelectorAll('[data-mi="heading-trail"]').forEach(initHeadingTrail); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
