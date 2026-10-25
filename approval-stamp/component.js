/* Approval Stamp — vanilla JS. Auto-initializes every [data-mi="approval-stamp"].
   data-approver names who stamps. Call window.initApprovalStamp(el) for elements added later. */
(function () {
  'use strict';
  var UNDO_MS = 6000;

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

  function initApprovalStamp(root) {
    if (!root || root.__miStamp) return;
    root.__miStamp = true;
    evenLines(root);
    var approver = root.getAttribute('data-approver') || 'You';
    var card = root.querySelector('.as-card');
    var word = root.querySelector('.as-stamp-word');
    var meta = root.querySelector('.as-stamp-meta');
    var approve = root.querySelector('.as-approve');
    var decline = root.querySelector('.as-decline');
    var reasonBox = root.querySelector('.as-reason');
    var reason = root.querySelector('.as-reason-input');
    var status = root.querySelector('.as-status');
    var undoTimer = 0;

    function stamp(kind) {
      var now = new Date();
      var initials = approver.split(/\s+/).map(function (p) { return p[0]; }).join('').toUpperCase();
      root.classList.remove('is-lifting');
      root.classList.toggle('is-declined', kind === 'declined');
      word.textContent = kind === 'approved' ? 'Approved' : 'Declined';
      meta.textContent = initials + ' · ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      root.classList.remove('is-stamped'); void root.offsetWidth; root.classList.add('is-stamped');
      // the card takes the hit just as the stamp lands
      setTimeout(function () { card.classList.remove('is-hit'); void card.offsetWidth; card.classList.add('is-hit'); }, 200);
      approve.disabled = decline.disabled = true;
      reasonBox.hidden = true;
      var msg = document.createElement('span');
      msg.textContent = kind === 'approved'
        ? 'Approved. Sam will be reimbursed in the next payout.'
        : 'Declined' + (reason.value.trim() ? ': ' + reason.value.trim() : '') + '. Sam has been told why.';
      var undo = document.createElement('button');
      undo.type = 'button';
      undo.textContent = 'Undo';
      undo.addEventListener('click', lift);
      status.replaceChildren(msg, undo);
      clearTimeout(undoTimer);
      undoTimer = setTimeout(function () { if (undo.isConnected) undo.remove(); }, UNDO_MS);
      undo.focus({ preventScroll: true });
    }

    function lift() {
      clearTimeout(undoTimer);
      root.classList.add('is-lifting');
      setTimeout(function () {
        root.classList.remove('is-stamped', 'is-lifting', 'is-declined');
        approve.disabled = decline.disabled = false;
        decline.classList.remove('is-armed');
        reason.value = '';
        status.replaceChildren();
        approve.focus({ preventScroll: true });
      }, 400);
    }

    approve.addEventListener('click', function () { stamp('approved'); });
    decline.addEventListener('click', function () {
      // First press asks for a reason; the second stamps.
      if (reasonBox.hidden) {
        reasonBox.hidden = false;
        decline.classList.add('is-armed');   // the label stays "Decline"; solid red says the next press sends it
        reason.focus();
        return;
      }
      stamp('declined');
    });
    reason.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); stamp('declined'); } if (e.key === 'Escape') { reasonBox.hidden = true; decline.classList.remove('is-armed'); decline.focus(); } });
  }

  window.initApprovalStamp = initApprovalStamp;
  function boot() { document.querySelectorAll('[data-mi="approval-stamp"]').forEach(initApprovalStamp); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
