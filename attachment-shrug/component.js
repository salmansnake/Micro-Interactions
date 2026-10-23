/* Attachment Shrug — vanilla JS. Auto-initializes every [data-mi="attachment-shrug"].
   If the message mentions an attachment and none is attached, the paperclip looks around while you type and
   Send shrugs instead of sending. Call window.initAttachmentShrug(el) for elements added later. */
(function () {
  'use strict';
  var MENTION = /\b(attach(ed|ment|ments|ing)?|enclosed|see the file|i('|’)ve included)\b/i;

  function initAttachmentShrug(root) {
    if (!root || root.__miShrug) return;
    root.__miShrug = true;
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
      var rm = document.createElement('button'); rm.type = 'button'; rm.className = 'at-remove'; rm.setAttribute('aria-label', 'Remove ' + name); rm.textContent = '×';
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
