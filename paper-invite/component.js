/* Paper Invite — vanilla JS. Auto-initializes every [data-mi="paper-invite"].
   data-members lists emails already in the workspace. Call window.initPaperInvite(el) for later elements. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var PLANE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.6 10.9 20.4 3.4c.8-.3 1.5.4 1.2 1.2l-7.5 17.8c-.3.8-1.5.8-1.8-.1l-2-6.4-6.4-2c-.9-.3-.9-1.5-.1-1.8Z"/></svg>';
  var SAMPLE = 'sam@northwind.co, ali@northwind.co, mira@northwind.co, jo@northwind';

  function problem(email, members) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'This address is missing its ending, like .com.';
    if (members.indexOf(email.toLowerCase()) > -1) return 'Already a member of this workspace.';
    return '';
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

  function initPaperInvite(root) {
    if (!root || root.__miInvite) return;
    root.__miInvite = true;
    evenLines(root);
    var members = (root.getAttribute('data-members') || '').toLowerCase().split(',').filter(Boolean);
    var box = root.querySelector('.pi-box');
    var input = root.querySelector('.pi-input');
    var send = root.querySelector('.pi-send');
    var status = root.querySelector('.pi-status');
    var sending = false;

    function chips() { return Array.prototype.slice.call(box.querySelectorAll('.pi-chip')); }
    function refresh() { send.disabled = sending || chips().length === 0; }

    function addChip(email, bad, why) {
      email = email.trim().replace(/[,;]+$/, '');
      if (!email) return;
      if (chips().some(function (c) { return c.getAttribute('data-email') === email.toLowerCase(); })) return;
      var c = document.createElement('span');
      c.className = 'pi-chip' + (bad ? ' is-bad is-back' : '');
      c.setAttribute('data-email', email.toLowerCase());
      var s = document.createElement('span'); s.textContent = email;
      var x = document.createElement('button'); x.type = 'button'; x.className = 'pi-x'; x.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'; x.setAttribute('aria-label', 'Remove ' + email);
      x.addEventListener('click', function () { var why = c.nextElementSibling; if (why && why.classList.contains('pi-why')) why.remove(); c.remove(); refresh(); input.focus(); });
      c.append(s, x);
      box.insertBefore(c, input);
      if (bad && why) {
        var w = document.createElement('span'); w.className = 'pi-why'; w.textContent = email + ': ' + why;
        box.insertBefore(w, input);
      }
      refresh();
    }

    function takeInput() {
      input.value.split(/[\s,;]+/).forEach(function (e) { addChip(e); });
      input.value = '';
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ',' || e.key === ' ' || e.key === 'Tab' && input.value.trim()) {
        if (input.value.trim()) { e.preventDefault(); takeInput(); }
        if (e.key === 'Enter' && !input.value.trim() && !send.disabled) send.click();
      } else if (e.key === 'Backspace' && !input.value) {
        var last = chips().pop();
        if (last) { var why = last.nextElementSibling; if (why && why.classList.contains('pi-why')) why.remove(); last.remove(); refresh(); }
      }
    });
    input.addEventListener('paste', function () { setTimeout(takeInput, 0); });
    input.addEventListener('blur', function () { if (input.value.trim()) takeInput(); });
    box.addEventListener('click', function (e) { if (e.target === box) input.focus(); });

    function fly(chip, bad) {
      return new Promise(function (resolve) {
        var o = root.getBoundingClientRect(), r = chip.getBoundingClientRect();
        var plane = document.createElement('span');
        plane.className = 'pi-plane' + (bad ? ' is-bad' : '');
        plane.innerHTML = PLANE;
        root.appendChild(plane);
        var x0 = r.left - o.left + r.width / 2 - 13, y0 = r.top - o.top + r.height / 2 - 13;
        var x1 = o.width + 40, y1 = -60;
        // The chip folds: squash to nothing while the plane appears.
        chip.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(0.2, 0.6) rotate(-12deg)', opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' });
        var frames = [];
        for (var k = 0; k <= 16; k++) {
          var t = k / 16, x, y, rot;
          if (!bad) {
            x = x0 + (x1 - x0) * t * t; y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 30;
            rot = -20 + t * 10;
          } else { // out, then a loop back home
            var q = Math.sin(t * Math.PI);
            x = x0 + q * 150; y = y0 - q * 70 - Math.sin(t * Math.PI * 2) * 20;
            rot = t < 0.5 ? -25 : 160;
          }
          frames.push({ transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot + 'deg) scale(' + (t < 0.1 ? 0.4 + t * 6 : 1) + ')', opacity: !bad && t > 0.85 ? (1 - t) / 0.15 : 1 });
        }
        plane.animate(frames, { duration: bad ? 1050 : 800, delay: 150, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'both' }).finished.then(function () { plane.remove(); resolve(); });
      });
    }

    send.addEventListener('click', function () {
      if (input.value.trim()) takeInput();
      var list = chips();
      if (!list.length || sending) return;
      sending = true;
      refresh();
      status.className = 'pi-status';
      status.textContent = 'Sending…';
      box.querySelectorAll('.pi-why').forEach(function (w) { w.remove(); });
      var sent = 0, failed = [];
      var jobs = list.map(function (chip, i) {
        var email = chip.querySelector('span').textContent;
        var why = problem(email, members);
        return new Promise(function (resolve) {
          setTimeout(function () {
            if (reduce.matches) { chip.remove(); if (why) failed.push([email, why]); else sent++; resolve(); return; }
            fly(chip, !!why).then(function () {
              chip.remove();
              if (why) failed.push([email, why]); else sent++;
              resolve();
            });
          }, i * 140);
        });
      });
      Promise.all(jobs).then(function () {
        failed.forEach(function (f) { addChip(f[0], true, f[1]); });
        sending = false;
        refresh();
        status.className = 'pi-status' + (failed.length ? '' : ' is-good');
        status.textContent = (sent ? sent + (sent === 1 ? ' invite sent.' : ' invites sent.') : 'Nothing sent.') + (failed.length ? ' ' + failed.length + (failed.length === 1 ? ' needs' : ' need') + ' attention.' : '');
      });
    });

    root.querySelector('.pi-sample').addEventListener('click', function () {
      chips().forEach(function (c) { c.remove(); });
      box.querySelectorAll('.pi-why').forEach(function (w) { w.remove(); });
      SAMPLE.split(',').forEach(function (e) { addChip(e); });
      status.className = 'pi-status';
      status.textContent = '';
    });
  }

  window.initPaperInvite = initPaperInvite;
  function boot() { document.querySelectorAll('[data-mi="paper-invite"]').forEach(initPaperInvite); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
