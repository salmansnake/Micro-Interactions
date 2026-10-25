/* Attachment Shrug — vanilla JS. Auto-initializes every [data-mi="attachment-shrug"].
   If the message mentions an attachment and none is attached, the paperclip looks around while you type and
   Send shrugs instead of sending. Call window.initAttachmentShrug(el) for elements added later. */
(function () {
  'use strict';
  var MENTION = /\b(attach(ed|ment|ments|ing)?|enclosed|see the file|i('|’)ve included)\b/i;

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

  function initAttachmentShrug(root) {
    if (!root || root.__miShrug) return;
    root.__miShrug = true;
    evenLines(root);
    var body = root.querySelector('.at-body'), files = root.querySelector('.at-files');
    var clip = root.querySelector('.at-clip'), send = root.querySelector('.at-send');
    var ask = root.querySelector('.at-ask'), attach = root.querySelector('.at-attach'), anyway = root.querySelector('.at-anyway');
    var status = root.querySelector('.at-status');
    var name = root.getAttribute('data-file') || 'File.pdf', size = root.getAttribute('data-size') || '';
    var hasFile = false;

    function missing() { return MENTION.test(body.value) && !hasFile; }
    function hint() { root.classList.toggle('is-hint', missing()); }
    function calm() { root.classList.remove('is-shrugging'); ask.hidden = true; }

    function addFile() {
      if (hasFile) return;
      hasFile = true;
      var f = document.createElement('div'); f.className = 'at-file';
      var ic = document.createElement('span'); ic.className = 'at-file-icon'; ic.textContent = (name.split('.').pop() || '').toUpperCase();
      var nm = document.createElement('span'); nm.className = 'at-file-name'; nm.textContent = name;
      var sm = document.createElement('small'); sm.textContent = size; nm.appendChild(sm);
      var rm = document.createElement('button'); rm.type = 'button'; rm.className = 'at-remove'; rm.setAttribute('aria-label', 'Remove ' + name); rm.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
      rm.addEventListener('click', function () { f.remove(); hasFile = false; hint(); clip.focus(); });
      f.append(ic, nm, rm);
      files.appendChild(f);
      calm(); hint();
    }

    body.addEventListener('input', function () { status.textContent = ''; hint(); if (!missing()) calm(); });
    clip.addEventListener('click', addFile);
    attach.addEventListener('click', function () { addFile(); send.focus(); });

    send.addEventListener('click', function () {
      if (missing()) {
        send.classList.remove('is-shrug'); void send.offsetWidth; send.classList.add('is-shrug');
        root.classList.add('is-shrugging');
        ask.hidden = false;
        status.textContent = '';
        return;
      }
      calm();
      status.textContent = hasFile ? 'Sent, with the attachment. Nobody has to reply “I think you forgot the file.”' : 'Sent.';
    });
    anyway.addEventListener('click', function () {
      calm();
      status.textContent = 'Sent without it. Expect a reply in about four minutes saying you forgot the file.';
      send.focus();
    });
    hint();
  }

  window.initAttachmentShrug = initAttachmentShrug;
  function boot() { document.querySelectorAll('[data-mi="attachment-shrug"]').forEach(initAttachmentShrug); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
