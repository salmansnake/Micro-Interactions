
(function () {
  // Where ideas are sent: set "formEndpoint" in site.json (e.g. a Formspree URL). The destination email lives in
  // that service, so visitors never see it. Empty = preview mode: the form shows success but sends nothing.
  var FORM_ENDPOINT = (window.MI_CONFIG && window.MI_CONFIG.formEndpoint) || '';
  var dlg = document.getElementById('idea-dialog');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var form = dlg.querySelector('form'), done = dlg.querySelector('.idea-done');
  var name = form.elements.name, desc = form.elements.description, email = form.elements.email;
  var sendBtn = form.querySelector('[data-idea-send]'), count = document.getElementById('idea-count'), opener = null;
  function err(id, msg, field) {
    document.getElementById(id).textContent = msg || '';
    if (field) { if (msg) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid'); }
  }
  function validate() {
    var bad = null;
    err('idea-name-err', name.value.trim() ? '' : 'Give your idea a short name.', name); if (!name.value.trim()) bad = bad || name;
    var d = desc.value.trim().length;
    err('idea-desc-err', d >= 20 ? '' : 'Describe it in at least a sentence (20 characters).', desc); if (d < 20) bad = bad || desc;
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    err('idea-email-err', ok ? '' : 'Enter a valid email so I can send you the link.', email); if (!ok) bad = bad || email;
    return bad;
  }
  function reset() { form.reset(); [name, desc, email].forEach(function (f) { f.removeAttribute('aria-invalid'); }); ['idea-name-err', 'idea-desc-err', 'idea-email-err', 'idea-form-err'].forEach(function (i) { err(i, ''); }); count.textContent = '0'; form.hidden = false; done.hidden = true; sendBtn.classList.remove('idea-send-busy'); sendBtn.textContent = 'Send idea'; }
  document.querySelectorAll('[data-idea-open]').forEach(function (b) { b.addEventListener('click', function () { opener = b; reset(); dlg.showModal(); name.focus(); }); });
  dlg.addEventListener('click', function (e) { if (e.target.closest('[data-idea-close]') || e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  desc.addEventListener('input', function () { count.textContent = desc.value.length; if (desc.value.trim().length >= 20) err('idea-desc-err', '', desc); });
  name.addEventListener('input', function () { if (name.value.trim()) err('idea-name-err', '', name); });
  email.addEventListener('input', function () { err('idea-email-err', '', email); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = validate(); if (bad) { bad.focus(); return; }
    if (form.elements._gotcha.value) return;
    sendBtn.classList.add('idea-send-busy'); sendBtn.textContent = 'Sending…'; err('idea-form-err', '');
    var data = new FormData(form); data.delete('_gotcha');
    data.append('_subject', 'New micro interaction idea: ' + name.value.trim());
    var req = FORM_ENDPOINT
      ? fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } }).then(function (r) { if (!r.ok) throw new Error('bad status'); })
      : new Promise(function (res) { setTimeout(res, 500); });
    req.then(function () { form.hidden = true; done.hidden = false; done.focus(); }, function () {
      sendBtn.classList.remove('idea-send-busy'); sendBtn.textContent = 'Send idea';
      err('idea-form-err', 'Couldn\u2019t send that. Check your connection and try again.');
    });
  });
})();
