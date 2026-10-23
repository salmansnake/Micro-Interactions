/* File-Aware Dropzone — vanilla JS. Auto-initializes every [data-mi="file-dropzone"].
   Call window.initFileDropzone(el) for elements added later. */
(function () {
  'use strict';
  var ICONS = {
    csv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.75"/><path d="m4 18 5-5 4 4 2.5-2.5L20 19"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h7l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M14 3.5V8h4.5"/><path d="M9 13h6M9 16.5h4"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg>'
  };
  var OVER_TEXT = { csv: 'Drop to preview rows', image: 'Drop to develop the photo', pdf: 'Drop to fan out the pages', file: 'Drop to upload' };

  function kindOf(type, name) {
    type = (type || '').toLowerCase();
    name = (name || '').toLowerCase();
    if (type === 'text/csv' || /\.csv$/.test(name) || type === 'application/vnd.ms-excel') return 'csv';
    if (type.indexOf('image/') === 0 || /\.(png|jpe?g|gif|webp|avif|heic)$/.test(name)) return 'image';
    if (type === 'application/pdf' || /\.pdf$/.test(name)) return 'pdf';
    return 'file';
  }
  function size(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
  function parseCSV(text) {
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); cell = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // ---- sample files so the demo works without anything on disk ----
  function sample(kind, host) {
    if (kind === 'csv') {
      var plans = ['Starter', 'Pro', 'Team'], lines = ['date,workspace,plan,seats,mrr'];
      for (var i = 0; i < 128; i++) {
        var p = plans[i % 3];
        lines.push('2026-' + String(1 + (i % 9)).padStart(2, '0') + '-' + String(1 + (i % 27)).padStart(2, '0') + ',' + ['Northwind', 'Atlas', 'Orbit', 'Nova'][i % 4] + ',' + p + ',' + (3 + (i * 7) % 40) + ',' + ((p === 'Team' ? 79 : p === 'Pro' ? 29 : 12) * (3 + (i * 7) % 40)));
      }
      return Promise.resolve(new File([lines.join('\n')], 'workspaces-q3.csv', { type: 'text/csv' }));
    }
    if (kind === 'image') {
      return new Promise(function (resolve) {
        var c = document.createElement('canvas'); c.width = 600; c.height = 400;
        var g = c.getContext('2d');
        // The sample picture is painted from the Outcraft palette tokens.
        var tok = function (n) { var p = document.createElement('span'); p.style.cssText = 'display:none;color:var(--' + n + ')'; (host || document.body).appendChild(p); var v = getComputedStyle(p).color; p.remove(); return v; };
        var sky = g.createLinearGradient(0, 0, 0, 400); sky.addColorStop(0, tok('orange')); sky.addColorStop(0.55, tok('pink')); sky.addColorStop(1, tok('aqua'));
        g.fillStyle = sky; g.fillRect(0, 0, 600, 400);
        g.fillStyle = tok('amber-9'); g.beginPath(); g.arc(420, 170, 54, 0, Math.PI * 2); g.fill();
        g.fillStyle = tok('sage'); g.beginPath(); g.moveTo(0, 300); g.lineTo(150, 170); g.lineTo(260, 260); g.lineTo(380, 150); g.lineTo(600, 300); g.lineTo(600, 400); g.lineTo(0, 400); g.fill();
        g.fillStyle = tok('olive'); g.beginPath(); g.moveTo(0, 340); g.lineTo(200, 250); g.lineTo(330, 320); g.lineTo(470, 240); g.lineTo(600, 330); g.lineTo(600, 400); g.lineTo(0, 400); g.fill();
        c.toBlob(function (b) { resolve(new File([b], 'sunset-ridge.png', { type: 'image/png' })); }, 'image/png');
      });
    }
    var pages = [];
    for (var n = 1; n <= 12; n++) pages.push((n + 2) + ' 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj');
    var pdf = '%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Count 12 >> endobj\n' + pages.join('\n') + '\n%%EOF';
    return Promise.resolve(new File([pdf], 'pricing-proposal.pdf', { type: 'application/pdf' }));
  }

  function initFileDropzone(root) {
    if (!root || root.__miDrop) return;
    root.__miDrop = true;

    var maxMB = Number(root.getAttribute('data-max-mb')) || 10;
    var zone = root.querySelector('.fd-zone');
    var input = root.querySelector('.fd-input');
    var overIcon = root.querySelector('.fd-over-icon');
    var overTitle = root.querySelector('.fd-over-title');
    var result = root.querySelector('.fd-result');
    var preview = root.querySelector('.fd-preview');
    var nameEl = root.querySelector('.fd-name');
    var info = root.querySelector('.fd-info');
    var error = root.querySelector('.fd-error');
    var url = null;
    var depth = 0;

    function setOver(kind) {
      root.classList.toggle('is-over', !!kind);
      if (kind) {
        root.setAttribute('data-kind', kind);
        overIcon.innerHTML = ICONS[kind];
        overTitle.textContent = OVER_TEXT[kind];
      } else if (!root.classList.contains('has-file')) {
        root.removeAttribute('data-kind');
      }
    }
    function fail(msg) {
      error.textContent = msg;
      root.classList.remove('is-error');
      void root.offsetWidth;
      root.classList.add('is-error');
    }
    function reset() {
      if (url) { URL.revokeObjectURL(url); url = null; }
      root.classList.remove('has-file');
      root.removeAttribute('data-kind');
      result.hidden = true;
      preview.replaceChildren();
      error.textContent = '';
      input.value = '';
    }

    function show(file) {
      error.textContent = '';
      if (file.size > maxMB * 1048576) { fail('That file is ' + size(file.size) + '. The limit is ' + maxMB + ' MB.'); return; }
      reset();
      var kind = kindOf(file.type, file.name);
      root.setAttribute('data-kind', kind);
      root.classList.add('has-file');
      result.hidden = false;
      nameEl.textContent = file.name;
      info.textContent = size(file.size);

      if (kind === 'csv') {
        file.slice(0, 262144).text().then(function (text) {
          var rows = parseCSV(text);
          var head = rows[0] || [], body = rows.slice(1);
          var wrap = document.createElement('div'); wrap.className = 'fd-table-wrap';
          var t = document.createElement('table'); t.className = 'fd-table';
          var th = t.createTHead().insertRow();
          head.slice(0, 5).forEach(function (h) { var c = document.createElement('th'); c.textContent = h; th.appendChild(c); });
          var tb = t.createTBody();
          body.slice(0, 4).forEach(function (r, i) {
            var tr = tb.insertRow(); tr.style.setProperty('--i', i);
            r.slice(0, 5).forEach(function (v) { tr.insertCell().textContent = v; });
          });
          wrap.appendChild(t);
          preview.replaceChildren(wrap);
          info.textContent = body.length.toLocaleString() + ' rows · ' + head.length + ' columns · ' + size(file.size);
        });
      } else if (kind === 'image') {
        url = URL.createObjectURL(file);
        var frame = document.createElement('div'); frame.className = 'fd-photo';
        var img = new Image(); img.alt = 'Preview of ' + file.name;
        img.onload = function () {
          info.textContent = img.naturalWidth + ' × ' + img.naturalHeight + ' · ' + size(file.size);
          requestAnimationFrame(function () { requestAnimationFrame(function () { frame.classList.add('is-developed'); }); });
        };
        img.onerror = function () { fail('This image could not be read.'); };
        img.src = url;
        frame.appendChild(img);
        preview.replaceChildren(frame);
      } else if (kind === 'pdf') {
        var box = document.createElement('div'); box.className = 'fd-pages';
        for (var i = 0; i < 3; i++) { var pg = document.createElement('div'); pg.className = 'fd-page'; box.appendChild(pg); }
        preview.replaceChildren(box);
        file.slice(0, 2097152).text().then(function (text) {
          var n = (text.match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
          info.textContent = (n ? n + (n === 1 ? ' page · ' : ' pages · ') : '') + size(file.size);
        });
      } else {
        var g = document.createElement('div'); g.className = 'fd-generic';
        g.textContent = (file.name.split('.').pop() || 'FILE').slice(0, 4).toUpperCase();
        preview.replaceChildren(g);
      }
    }

    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', function () { if (input.files && input.files[0]) show(input.files[0]); });

    // Drag: read the type while the file is still in the air
    zone.addEventListener('dragenter', function (e) {
      e.preventDefault();
      depth++;
      var it = e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items[0];
      setOver(it ? kindOf(it.type, '') : 'file');
    });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; });
    zone.addEventListener('dragleave', function () { depth = Math.max(0, depth - 1); if (!depth) setOver(null); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      depth = 0;
      setOver(null);
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) show(f);
    });
    // Dragging over the result swaps the file too
    result.addEventListener('dragover', function (e) { e.preventDefault(); });
    result.addEventListener('drop', function (e) {
      e.preventDefault();
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) show(f);
    });

    root.querySelector('.fd-replace').addEventListener('click', function () { input.click(); });
    root.querySelector('.fd-remove').addEventListener('click', function () { reset(); zone.focus(); });

    root.querySelectorAll('[data-sample]').forEach(function (b) {
      b.addEventListener('click', function () {
        var kind = b.getAttribute('data-sample');
        reset();
        setOver(kind);
        sample(kind, root).then(function (f) {
          setTimeout(function () { setOver(null); show(f); }, 650);
        });
      });
    });
  }

  window.initFileDropzone = initFileDropzone;
  function boot() { document.querySelectorAll('[data-mi="file-dropzone"]').forEach(initFileDropzone); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
