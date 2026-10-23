/* Preview Palette — vanilla JS. Auto-initializes every [data-mi="preview-palette"].
   Highlighting a command previews it on .pv-app; Enter commits, Escape reverts. ⌘K / Ctrl+K opens it while focus is inside.
   Call window.initPreviewPalette(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var COMMANDS = [
    { group: 'Appearance', label: 'Dark Mode', key: 'scheme', value: 'dark', sw: 'var(--black)' },
    { group: 'Appearance', label: 'Light Mode', key: 'scheme', value: 'light', sw: 'var(--on-color)' },
    { group: 'Accent', label: 'Aqua', key: 'accent', value: 'aqua', sw: 'var(--aqua)' },
    { group: 'Accent', label: 'Sage', key: 'accent', value: 'sage', sw: 'var(--sage)' },
    { group: 'Accent', label: 'Orange', key: 'accent', value: 'orange', sw: 'var(--orange)' },
    { group: 'Accent', label: 'Olive', key: 'accent', value: 'olive', sw: 'var(--olive)' },
    { group: 'Density', label: 'Compact', key: 'density', value: 'compact' },
    { group: 'Density', label: 'Comfortable', key: 'density', value: 'comfortable' },
    { group: 'Sort Pages', label: 'By Name', key: 'sort', value: 'name' },
    { group: 'Sort Pages', label: 'By Most Recent', key: 'sort', value: 'recent' }
  ];

  function initPreviewPalette(root) {
    if (!root || root.__miPalette) return;
    root.__miPalette = true;
    var app = root.querySelector('.pv-app');
    var palette = root.querySelector('.pv-palette');
    var input = root.querySelector('.pv-input');
    var list = root.querySelector('.pv-list');
    var status = root.querySelector('.pv-status');
    var opener = root.querySelector('.pv-open');
    var items = root.querySelector('.pv-items');
    // The mini app starts in the page's theme and follows it until someone picks a scheme.
    function pageDark() { var t = document.documentElement.getAttribute('data-theme'); return t === 'dark' || (t !== 'light' && !!window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
    var committed = { scheme: pageDark() ? 'dark' : 'light', accent: 'aqua', density: 'comfortable', sort: 'recent' }, pickedScheme = false;
    function followPage() { if (pickedScheme) return; committed.scheme = pageDark() ? 'dark' : 'light'; if (!root.querySelector('.pv-app.is-previewing')) apply(committed); }
    new MutationObserver(followPage).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', followPage);
    var shown = [], active = -1;

    // Reorder rows with FLIP so sorting is visible.
    function sortRows(by) {
      var rows = Array.prototype.slice.call(items.children);
      var before = rows.map(function (r) { return r.getBoundingClientRect().top; });
      rows.slice().sort(function (a, b) {
        return by === 'name' ? a.getAttribute('data-name').localeCompare(b.getAttribute('data-name')) : a.getAttribute('data-recent') - b.getAttribute('data-recent');
      }).forEach(function (r) { items.appendChild(r); });
      if (reduce.matches) return;
      rows.forEach(function (r, i) {
        var dy = before[i] - r.getBoundingClientRect().top;
        if (dy) r.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 460, easing: 'cubic-bezier(.2,.9,.25,1.05)' });
      });
    }
    function apply(state) {
      app.setAttribute('data-scheme', state.scheme);
      app.setAttribute('data-accent', state.accent);
      app.setAttribute('data-density', state.density);
      if (app.getAttribute('data-sort') !== state.sort) { app.setAttribute('data-sort', state.sort); sortRows(state.sort); }
    }
    function previewOf(cmd) { var s = Object.assign({}, committed); if (cmd) s[cmd.key] = cmd.value; return s; }

    function render() {
      var q = input.value.trim().toLowerCase();
      shown = COMMANDS.filter(function (c) { return !q || (c.group + ' ' + c.label).toLowerCase().indexOf(q) > -1; });
      list.replaceChildren();
      var lastGroup = '';
      shown.forEach(function (c, i) {
        if (c.group !== lastGroup) {
          var g = document.createElement('li'); g.className = 'pv-group'; g.setAttribute('role', 'presentation'); g.textContent = c.group; list.appendChild(g);
          lastGroup = c.group;
        }
        var li = document.createElement('li');
        li.className = 'pv-opt'; li.id = 'pv-opt-' + i; li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', i === active ? 'true' : 'false');
        if (c.sw) { var sw = document.createElement('span'); sw.className = 'pv-sw'; sw.style.background = c.sw; li.appendChild(sw); }
        li.appendChild(document.createTextNode(c.label));
        if (committed[c.key] === c.value) { var cur = document.createElement('span'); cur.className = 'pv-cur'; cur.textContent = 'Current'; li.appendChild(cur); }
        li.addEventListener('pointerenter', function () { highlight(i); });
        li.addEventListener('click', function () { highlight(i); commit(); });
        list.appendChild(li);
      });
      if (active >= shown.length) active = shown.length - 1;
    }
    function highlight(i) {
      active = i;
      list.querySelectorAll('.pv-opt').forEach(function (o, k) { o.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      var cmd = shown[i];
      if (cmd) {
        input.setAttribute('aria-activedescendant', 'pv-opt-' + i);
        var el = list.querySelector('#pv-opt-' + i); if (el) el.scrollIntoView({ block: 'nearest' });
      }
      apply(previewOf(cmd));
      app.classList.toggle('is-previewing', !!cmd && committed[cmd.key] !== cmd.value);
    }
    function open() {
      palette.hidden = false;
      opener.setAttribute('aria-expanded', 'true');
      input.value = '';
      active = -1;
      render();
      input.focus();
    }
    function close(revert) {
      if (palette.hidden) return;
      palette.hidden = true;
      opener.setAttribute('aria-expanded', 'false');
      app.classList.remove('is-previewing');
      if (revert) { apply(committed); status.textContent = 'Preview cleared.'; }
      opener.focus({ preventScroll: true });
    }
    function commit() {
      var cmd = shown[active];
      if (!cmd) return;
      committed[cmd.key] = cmd.value;
      if (cmd.key === 'scheme') pickedScheme = true;
      apply(committed);
      status.textContent = cmd.group + ' set to ' + cmd.label + '.';
      close(false);
    }

    opener.addEventListener('click', function () { palette.hidden ? open() : close(true); });
    input.addEventListener('input', function () { active = shown.length ? 0 : -1; render(); highlight(shown.length ? 0 : -1); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); highlight(Math.min(shown.length - 1, active + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(Math.max(0, active - 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
    });
    list.addEventListener('pointerleave', function () { if (!palette.hidden) { active = -1; highlight(-1); } });
    root.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.hidden ? open() : close(true); }
    });
    document.addEventListener('pointerdown', function (e) { if (!palette.hidden && !palette.contains(e.target) && !opener.contains(e.target)) close(true); });
    followPage();
  }

  window.initPreviewPalette = initPreviewPalette;
  function boot() { document.querySelectorAll('[data-mi="preview-palette"]').forEach(initPreviewPalette); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
