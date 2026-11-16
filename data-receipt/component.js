/* Data Receipt — vanilla JS. Auto-initializes every [data-mi="data-receipt"].
   The receipt lists what the app can read and write, plus what it will never touch. Optional lines can be removed
   (struck through) before connecting; the total and the button follow. Connecting stamps it; Disconnect undoes it.
   Call window.initDataReceipt(el) for elements added later. */
(function () {
  'use strict';

  function initDataReceipt(root) {
    if (!root || root.__miDrc) return;
    root.__miDrc = true;
    var lines = Array.prototype.slice.call(root.querySelectorAll('.drc-lines li:not(.is-never)'));
    var toggles = root.querySelectorAll('.drc-toggle'), countEl = root.querySelector('.drc-count');
    var btn = root.querySelector('.drc-btn'), label = root.querySelector('.drc-label'), status = root.querySelector('.drc-status');
    var connected = false;

    // The action column is as wide as its widest label, "Add Back", so Remove, Add Back and Needed share one center
    function sizeActions() {
      var t = toggles[0], keep = t.textContent;
      root.style.removeProperty('--drc-act');
      t.style.width = 'auto'; t.textContent = 'Add Back';
      var w = Math.ceil(t.getBoundingClientRect().width);
      t.textContent = keep; t.style.width = '';
      if (w) root.style.setProperty('--drc-act', w + 'px');
    }
    sizeActions();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeActions);

    function n() { return lines.filter(function (li) { return !li.classList.contains('is-off'); }).length; }
    function perms(k) { return k + (k === 1 ? ' permission' : ' permissions'); }
    function render() {
      var k = n();
      countEl.textContent = perms(k);
      label.textContent = connected ? 'Disconnect' : 'Connect with ' + k;
    }
    toggles.forEach(function (t) {
      t.addEventListener('click', function () {
        if (connected) return;
        var li = t.closest('li'), off = !li.classList.contains('is-off');
        li.classList.toggle('is-off', off);
        t.setAttribute('aria-pressed', off ? 'true' : 'false');
        t.textContent = off ? 'Add Back' : 'Remove';
        t.setAttribute('aria-label', (off ? 'Add back: ' : 'Remove: ') + li.querySelector('.drc-k').textContent.toLowerCase() + ' ' + li.querySelector('.drc-t').textContent.charAt(0).toLowerCase() + li.querySelector('.drc-t').textContent.slice(1));
        render();
      });
    });
    btn.addEventListener('click', function () {
      connected = !connected;
      root.classList.toggle('is-connected', connected);
      btn.classList.toggle('is-secondary', connected);
      toggles.forEach(function (t) { t.disabled = connected; });
      render();
      status.textContent = connected ? 'Connected with ' + perms(n()) + '. Change them any time in Settings.' : 'Disconnected. Atlas can’t see your calendar now.';
    });

    // The button keeps one width whatever it says
    function sizeBtn() {
      var keep = label.textContent, w = 0; btn.style.minWidth = '';
      ['Connect with 3', 'Disconnect'].forEach(function (s) { label.textContent = s; w = Math.max(w, btn.getBoundingClientRect().width); });
      label.textContent = keep; btn.style.minWidth = Math.ceil(w) + 'px';
    }
    render();
    sizeBtn();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeBtn);
  }

  window.initDataReceipt = initDataReceipt;
  function boot() { document.querySelectorAll('[data-mi="data-receipt"]').forEach(initDataReceipt); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
