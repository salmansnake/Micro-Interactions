
(function () {
  // Where ideas are sent: "formEndpoint" in site.json (a Formspree form). Formspree saves each idea in its dashboard
  // and emails it on, so the destination address never appears on the site. Empty = preview mode: the form shows
  // success but sends nothing.
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
  function reset() { form.reset(); [name, desc, email].forEach(function (f) { f.removeAttribute('aria-invalid'); }); ['idea-name-err', 'idea-desc-err', 'idea-email-err', 'idea-form-err'].forEach(function (i) { err(i, ''); }); count.textContent = '0'; form.hidden = false; done.hidden = true; setBusy(false); }
  // While sending, the button is disabled (not just dimmed) and reads "Sending…"
  function setBusy(on) { sendBtn.disabled = on; sendBtn.classList.toggle('idea-send-busy', on); sendBtn.textContent = on ? 'Sending…' : 'Send idea'; }
  // Swap the form for the thank-you. The dialog eases from the form's size to the thank-you's on the panel spring
  // (both width and height, measured before and after), and the thank-you fades in as it moves, so the dialog is never empty.
  // With Reduce Motion it simply swaps.
  function showDone() {
    var before = getComputedStyle(dlg), w0 = before.width, h0 = before.height;
    form.hidden = true; done.hidden = false;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && dlg.animate) {
      var after = getComputedStyle(dlg);
      var dur = parseFloat(after.getPropertyValue('--spring-panel-duration')) || 530;
      var ease = after.getPropertyValue('--spring-panel').trim() || 'ease-out';
      dlg.classList.add('idea-resizing');
      var size = dlg.animate([{ width: w0, height: h0 }, { width: after.width, height: after.height }], { duration: dur, easing: ease });
      var tidy = function () { dlg.classList.remove('idea-resizing'); };
      size.finished.then(tidy, tidy);
      done.animate([{ opacity: 0.3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: dur * 0.55, easing: 'ease-out' });
    }
    done.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-idea-open]').forEach(function (b) { b.addEventListener('click', function () { opener = b; reset(); dlg.showModal(); name.focus(); }); });
  dlg.addEventListener('click', function (e) { if (e.target.closest('[data-idea-close]') || e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  desc.addEventListener('input', function () { count.textContent = desc.value.length; if (desc.value.trim().length >= 20) err('idea-desc-err', '', desc); });
  name.addEventListener('input', function () { if (name.value.trim()) err('idea-name-err', '', name); });
  email.addEventListener('input', function () { err('idea-email-err', '', email); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = validate(); if (bad) { bad.focus(); return; }
    // Honeypot: people never see _gotcha, so a value there is a bot. Show the thank-you without sending anything.
    if (form.elements._gotcha.value) { showDone(); return; }
    setBusy(true); err('idea-form-err', '');
    // Every field goes by its name attribute, _gotcha included, so Formspree can filter spam on its side too
    var data = new FormData(form);
    data.append('_subject', 'New micro interaction idea: ' + name.value.trim());
    var req = FORM_ENDPOINT
      ? fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } }).then(function (r) { if (!r.ok) throw new Error('bad status'); })
      : new Promise(function (res) { setTimeout(res, 500); });
    req.then(function () {
      // Sent: show the thank-you panel and clear the form behind it
      form.reset(); count.textContent = '0'; setBusy(false);
      showDone();
    }, function () {
      // Not sent: keep what they typed, explain, and let them try again
      setBusy(false);
      err('idea-form-err', 'Couldn\u2019t send that. Check your connection and try again.');
    });
  });
})();
