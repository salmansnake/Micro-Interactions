/* Approval Stamp — vanilla JS. Auto-initializes every [data-mi="approval-stamp"].
   data-approver names who stamps. Call window.initApprovalStamp(el) for elements added later. */
(function () {
  'use strict';
  var UNDO_MS = 6000;

  function initApprovalStamp(root) {
    if (!root || root.__miStamp) return;
    root.__miStamp = true;
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
