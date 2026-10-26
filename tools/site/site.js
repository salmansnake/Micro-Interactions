/* Micro Interactions site: routing, list, search and filters, stage mounting, info panel, code dialog.
   Data comes from interactions.json (inlined by tools/build.py). See RULES.md before changing. */
(function () {
  'use strict';
  var DATA = JSON.parse(document.getElementById('mi-data').textContent);
  var SRC = JSON.parse(document.getElementById('mi-src').textContent);
  var ITEMS = DATA.interactions, INIT = DATA.init, BY = {};
  ITEMS.forEach(function (it, i) { it.i = i; BY[it.slug] = it; });
  // The list, Previous/Next and the default page all run A to Z by name.
  var ALPHA = ITEMS.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }); });
  var root = document.documentElement;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var home = $('#view-home'), explore = $('#view-explore');
  var list = $('.list'), meta = $('.list-meta'), chips = $('.chips'), search = $('#mi-search');
  var host = $('.stage .mi-host'), info = $('.info-scroll');
  var state = { q: '', types: [], topics: [], newOnly: false, slug: null };
  var mounted = [];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // {Label} in summaries, Try it and specs names something on screen: show it as a small chip so it never reads as part of the sentence.
  // {icon:Name} shows an icon-only control the same way, with the icon the interaction draws
  function rich(s, icons) {
    return esc(s).replace(/\{([^{}]+)\}/g, function (m, x) {
      var k = /^icon:(.+)$/.exec(x);
      if (k && icons && icons[k[1]]) return '<span class="ui-ref ui-ref--icon" role="img" aria-label="' + k[1] + '">' + icons[k[1]] + '</span>';
      return '<span class="ui-ref">' + x + '</span>';
    });
  }
  function typeClass(t) { return t === 'Pure Joke' ? 'oc-badge--pop' : t === 'Secretly Useful' ? 'oc-badge--ai' : 't-useful'; }

  /* ---------- mounting: only what's on screen runs ---------- */
  function mount(el, slug) {
    var tpl = document.getElementById('tpl-' + slug);
    el.innerHTML = tpl ? tpl.innerHTML : '';
    $$('[data-mi]', el).forEach(function (c) {
      var fn = window[INIT[c.getAttribute('data-mi')]];
      if (typeof fn === 'function') { try { fn(c); } catch (e) { console.error(e); } }
    });
    if (mounted.indexOf(el) < 0) mounted.push(el);
  }
  function unmountAll() { mounted.forEach(function (el) { el.innerHTML = ''; }); mounted = []; }

  /* ---------- list, search, filters ---------- */
  function matches(it) {
    if (state.newOnly && !it['new']) return false;
    if (state.types.length && state.types.indexOf(it.type) < 0) return false;
    if (state.topics.length && state.topics.indexOf(it.topic) < 0) return false;
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    return (it.name + ' ' + it.topic + ' ' + it.type).toLowerCase().indexOf(q) >= 0;
  }
  function visible() { return ALPHA.filter(matches); }
  function renderList() {
    var v = visible();
    if (!v.length) {
      list.innerHTML = '<li class="empty"><p>No matches.</p><button type="button" class="oc-btn oc-btn--outline oc-btn--sm" data-clear>Clear Search and Filters</button></li>';
    } else {
      list.innerHTML = v.map(function (it) {
        return '<li><a class="item" href="#/' + it.slug + '" data-slug="' + it.slug + '"' + (it.slug === state.slug ? ' aria-current="page"' : '') + '>' +
          '<span class="nm">' + esc(it.name) + '</span>' +
          (it['new'] ? '<span class="tag-new">New</span>' : '<span></span>') + '</a></li>';
      }).join('');
    }
    var filtered = state.q || state.types.length || state.topics.length;
    var scope = state.newOnly ? ITEMS.filter(function (it) { return it['new']; }).length : ITEMS.length;
    meta.textContent = filtered ? 'Showing ' + v.length + ' of ' + scope : '';
    meta.hidden = !filtered;
    var n = state.types.length + state.topics.length;
    var badge = $('.filter-count');
    badge.textContent = n; badge.hidden = !n;
    $('.filter-btn').setAttribute('aria-label', n ? 'Filters, ' + n + ' active' : 'Filters');
    chips.innerHTML = state.types.concat(state.topics).map(function (f) {
      return '<button type="button" class="chip" data-chip="' + esc(f) + '" aria-label="Remove filter ' + esc(f) + '">' + esc(f) +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';
    }).join('');
  }
  search.addEventListener('input', function () { state.q = search.value; renderList(); });
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var v = visible(); if (v.length) go(v[0].slug); }
    if (e.key === 'ArrowDown') { var a = $('.item', list); if (a) { e.preventDefault(); a.focus(); } }
  });
  function toggle(arr, v) { var i = arr.indexOf(v); if (i < 0) arr.push(v); else arr.splice(i, 1); }
  function clearAll() { state.q = ''; search.value = ''; state.types = []; state.topics = []; setScope(false); renderList(); syncPop(); }
  chips.addEventListener('click', function (e) {
    var c = e.target.closest('[data-chip]'); if (!c) return;
    var v = c.getAttribute('data-chip');
    if (state.types.indexOf(v) >= 0) toggle(state.types, v); else toggle(state.topics, v);
    renderList(); syncPop(); search.focus();
  });
  list.addEventListener('click', function (e) { if (e.target.closest('[data-clear]')) { clearAll(); search.focus(); } if (e.target.closest('.item')) closeDrawer(); });
  list.addEventListener('keydown', function (e) {
    var items = $$('.item', list), i = items.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown' && items[i + 1]) { e.preventDefault(); items[i + 1].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || search).focus(); }
  });

  // All / New toggle
  var scope = $('.scope'), scopeBtns = $$('[data-scope]', scope);
  function setScope(on) {
    state.newOnly = on;
    scope.style.setProperty('--i', on ? 1 : 0);
    scopeBtns.forEach(function (b) { var sel = (b.getAttribute('data-scope') === 'new') === on; b.setAttribute('aria-checked', sel); b.tabIndex = sel ? 0 : -1; });
  }
  scopeBtns.forEach(function (b) {
    b.addEventListener('click', function () { setScope(b.getAttribute('data-scope') === 'new'); renderList(); });
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); setScope(!state.newOnly); renderList(); $('[aria-checked="true"]', scope).focus();
    });
  });

  // Filter popover
  var pop = $('.filter-pop'), fbtn = $('.filter-btn');
  function count(key, v) { return ITEMS.filter(function (it) { return it[key] === v; }).length; }
  pop.querySelector('[data-group="type"]').innerHTML = DATA.types.map(function (t) { return '<button type="button" class="opt" data-type="' + esc(t) + '" aria-pressed="false">' + esc(t) + '<span class="n">' + count('type', t) + '</span></button>'; }).join('');
  pop.querySelector('[data-group="topic"]').innerHTML = DATA.topics.map(function (t) { return '<button type="button" class="opt" data-topic="' + esc(t) + '" aria-pressed="false">' + esc(t) + '<span class="n">' + count('topic', t) + '</span></button>'; }).join('');
  function syncPop() {
    $$('[data-type]', pop).forEach(function (b) { b.setAttribute('aria-pressed', state.types.indexOf(b.getAttribute('data-type')) >= 0); });
    $$('[data-topic]', pop).forEach(function (b) { b.setAttribute('aria-pressed', state.topics.indexOf(b.getAttribute('data-topic')) >= 0); });
  }
  function placePop() {
    var r = fbtn.getBoundingClientRect(), side = $('.side').getBoundingClientRect();
    pop.style.top = (r.bottom + 8 - side.top) + 'px';
  }
  function openPop() { pop.hidden = false; fbtn.setAttribute('aria-expanded', 'true'); placePop(); syncPop(); var f = $('.opt', pop); if (f) f.focus(); }
  function closePop(back) { if (pop.hidden) return; pop.hidden = true; fbtn.setAttribute('aria-expanded', 'false'); if (back) fbtn.focus(); }
  fbtn.addEventListener('click', function () { if (pop.hidden) openPop(); else closePop(true); });
  pop.addEventListener('click', function (e) {
    var b = e.target.closest('.opt');
    if (b) { if (b.hasAttribute('data-type')) toggle(state.types, b.getAttribute('data-type')); else toggle(state.topics, b.getAttribute('data-topic')); syncPop(); renderList(); }
    if (e.target.closest('[data-filter-clear]')) { state.types = []; state.topics = []; syncPop(); renderList(); }
    if (e.target.closest('[data-filter-done]')) closePop(true);
  });
  document.addEventListener('pointerdown', function (e) { if (!pop.hidden && !pop.contains(e.target) && !fbtn.contains(e.target)) closePop(false); });
  pop.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closePop(true); } });

  /* ---------- info panel ---------- */
  var HAND = DATA.icons.hand;
  function renderInfo(it) {
    info.innerHTML =
      '<div class="info-meta"><span class="oc-badge type-badge ' + typeClass(it.type) + '">' + esc(it.type) + '</span>' +
      (it['new'] ? '<span class="tag-new">New</span>' : '') + '</div>' +
      '<h1>' + esc(it.name) + '</h1><p class="topic">' + esc(it.topic) + '</p>' +
      '<p class="summary">' + rich(it.summary, it.refIcons) + '</p>' +
      '<div class="try">' + HAND + '<p><b>Try it</b>' + rich(it.tryit, it.refIcons) + '</p></div>' +
      '<dl class="spec">' + it.specs.map(function (s) { return '<dt>' + esc(s.label) + '</dt><dd>' + rich(s.value, it.refIcons) + '</dd>'; }).join('') + '</dl>';
  }

  /* ---------- routing ---------- */
  function go(slug) { if (location.hash !== '#/' + slug) location.hash = '#/' + slug; else route(); }
  function showHome() {
    unmountAll();
    root.classList.remove('is-explore');
    explore.hidden = true; home.hidden = false;
    $('.tb-home').hidden = true;
    $$('.hcard').forEach(function (c) { mount($('.mi-host', c), c.getAttribute('data-slug')); });
    document.title = 'Micro Interactions';
  }
  function showExplore(slug) {
    var it = BY[slug] || ALPHA[0];
    var fresh = home.hidden === false || explore.hidden;
    if (fresh) { unmountAll(); home.hidden = true; explore.hidden = false; root.classList.add('is-explore'); window.scrollTo(0, 0); }
    $('.tb-home').hidden = false;
    state.slug = it.slug;
    mount(host, it.slug);
    renderInfo(it);
    $$('.item', list).forEach(function (a) { if (a.getAttribute('data-slug') === it.slug) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    var cur = $('.item[aria-current]', list);
    if (cur) cur.scrollIntoView({ block: 'nearest' });
    document.title = it.name + ' · Micro Interactions';
    if (fresh && window.matchMedia('(max-width: 860px)').matches) window.scrollTo(0, 0);
  }
  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!h || h === '/') return showHome();
    if (h.charAt(0) !== '/') {                     // old links like #cancel-dodge
      if (BY[h]) { history.replaceState(null, '', '#/' + h); return showExplore(h); }
      return showHome();
    }
    if (h === '/new' || h === '/all') {              // hero pill (New on) and Browse (everything)
      state.q = ''; search.value = ''; state.types = []; state.topics = []; syncPop();
      setScope(h === '/new'); renderList();
      var v = visible();
      return showExplore((v[0] || ALPHA[0]).slug);
    }
    showExplore(h.slice(1) || ALPHA[0].slug);
  }
  window.addEventListener('hashchange', route);

  /* ---------- prev / next and keys ---------- */
  function step(d) {
    var v = visible(); if (!v.some(function (x) { return x.slug === state.slug; })) v = ALPHA;
    var i = v.findIndex(function (x) { return x.slug === state.slug; });
    var n = v[(i + d + v.length) % v.length]; if (n) go(n.slug);
  }
  $('.prev').addEventListener('click', function () { step(-1); });
  $('.next').addEventListener('click', function () { step(1); });
  document.addEventListener('keydown', function (e) {
    if (explore.hidden || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t.closest && (t.closest('.stage') || t.closest('dialog') || t.closest('.filter-pop'))) return;
    if (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === '/') { e.preventDefault(); openDrawer(); search.focus(); }
  });

  /* ---------- reset ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mi-reset]'); if (!b) return;
    var scope = b.closest('[data-mi-scope]'), h = scope && $('.mi-host', scope);
    var slug = scope && (scope.getAttribute('data-slug') || state.slug);
    if (!h || !slug) return;
    mount(h, slug);
    b.classList.remove('is-spin'); void b.offsetWidth; b.classList.add('is-spin');
    setTimeout(function () { b.classList.remove('is-spin'); }, 700);
    var live = $('#mi-live'); live.textContent = ''; setTimeout(function () { live.textContent = BY[slug].name + ' reset'; }, 30);
  });

  /* ---------- copy helpers ---------- */
  function done(btn, text) {
    var node = null;
    btn.childNodes.forEach(function (n) { if (n.nodeType === 3 && n.textContent.trim()) node = n; });
    if (!node) return;
    var old = btn.getAttribute('data-label') || node.textContent;
    btn.setAttribute('data-label', old);
    var held = btn.style.minWidth;
    btn.style.minWidth = btn.offsetWidth + 'px';
    node.textContent = text;
    // The copy icon becomes a check while it confirms; the button keeps its colors
    var icon = btn.querySelector('svg');
    if (icon && text === 'Copied') {
      if (!btn._icon) btn._icon = icon.innerHTML;
      icon.innerHTML = '<path d="M20 6 9 17l-5-5"/>';
    }
    btn.classList.add('is-done');
    clearTimeout(btn._doneT);
    btn._doneT = setTimeout(function () {
      node.textContent = old;
      if (icon && btn._icon) icon.innerHTML = btn._icon;
      btn.classList.remove('is-done'); btn.style.minWidth = held;
    }, 1600);
  }
  // A copy button is as wide as its "Copied" state from the start, so confirming never resizes it
  function holdWidth(btn) {
    if (!btn || btn._held || !btn.offsetWidth) return;
    var node = null; btn.childNodes.forEach(function (n) { if (n.nodeType === 3 && n.textContent.trim()) node = n; });
    if (!node) return;
    var label = node.textContent; node.textContent = 'Copied';
    var w = parseFloat(getComputedStyle(btn).width); node.textContent = label; // layout width, unaffected by the dialog's opening scale
    btn.style.minWidth = Math.ceil(w) + 'px'; btn._held = true;
  }
  function copy(text, btn, fallbackEl) {
    function fail() { if (fallbackEl) { var r = document.createRange(); r.selectNodeContents(fallbackEl); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } done(btn, 'Press Ctrl+C'); }
    try { navigator.clipboard.writeText(text).then(function () { done(btn, 'Copied'); }, fail); } catch (e) { fail(); }
  }
  $('[data-copy-prompt]').addEventListener('click', function (e) { copy(SRC[state.slug].prompt, e.currentTarget); });

  /* ---------- code dialog ---------- */
  // "One File": the whole component as a single page that works on its own (tokens, font, styles, markup, script).
  function code(slug, k) {
    var s = SRC[slug];
    if (k !== 'one') return s[k];
    return DATA.oneTpl.replace('__TITLE__', BY[slug].name).split('__CSS__').join(s.css).split('__HTML__').join(s.html).split('__JS__').join(s.js);
  }
  var box = $('#codebox'), pre = $('pre', box), panel = $('.codebox-panel', box), dl = $('[data-download]', box), tabs = $$('[role="tab"]', box), active = 'prompt', opener = null;
  var tabList = $('[role="tablist"]', box), actions = $('.codebox-actions', box);
  var HINTS = {
    prompt: 'Paste this into an AI tool like Claude or Cursor to rebuild it in your own stack. It includes the exact Outcraft colors, type and motion.',
    html: 'The markup. Paste it where the interaction should appear on your page. It needs the CSS and JS too.',
    css: 'The styles, with the Outcraft font and colors built in. Add it to your stylesheet or inside a <style> tag.',
    js: 'The behavior. Add it after the HTML, inside a <script> tag at the end of the page.',
    one: 'Everything in one file. Download it and open it in a browser, or copy it into your page. The easiest option if you are not a developer.'
  };
  function showTab(k) {
    active = k;
    $('.codebox-hint', box).textContent = HINTS[k];
    tabs.forEach(function (t) { var on = t.getAttribute('data-k') === k; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    pre.textContent = code(state.slug, k);
    pre.classList.toggle('is-prose', k === 'prompt');
    panel.setAttribute('aria-labelledby', 'cb-tab-' + k);
    dl.hidden = k !== 'one';
    if (k === 'one') { dl.href = state.slug + '/one-file.html'; dl.setAttribute('download', state.slug + '.html'); }
    pre.scrollTop = 0;
    place(false);
  }
  // The thumb takes the selected tab's own position and width, since tabs are sized to their labels on a phone.
  // The floating Copy and Download keep clear of the code's scrollbar where it takes up room (Windows).
  function place(instant) {
    var t = $('[aria-selected="true"]', tabList); if (!t || !box.open) return;
    if (instant) tabList.classList.add('is-placing');
    tabList.style.setProperty('--tx', t.offsetLeft + 'px'); tabList.style.setProperty('--tw', t.offsetWidth + 'px');
    actions.style.right = 16 + pre.offsetWidth - pre.clientWidth + 'px';
    if (instant) { tabList.offsetWidth; tabList.classList.remove('is-placing'); }
  }
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { place(true); }); tabs.concat([pre]).forEach(function (el) { ro.observe(el); }); }
  $('[data-open-code]').addEventListener('click', function (e) {
    opener = e.currentTarget;
    var it = BY[state.slug];
    $('h2', box).textContent = it.name;
    showTab('prompt'); box.showModal(); place(true); holdWidth($('[data-copy-code]', box));
    var sel = $('[aria-selected="true"]', box); if (sel) sel.focus();
  });
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showTab(t.getAttribute('data-k')); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; showTab(n.getAttribute('data-k')); n.focus();
    });
  });
  $('[data-copy-code]', box).addEventListener('click', function (e) { copy(code(state.slug, active), e.currentTarget, pre); });
  box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('[data-close-code]')) box.close(); });
  box.addEventListener('close', function () { if (opener) opener.focus(); });

  /* ---------- phone drawer ---------- */
  var side = $('.side'), scrim = null;
  function isPhone() { return window.matchMedia('(max-width: 860px)').matches; }
  function openDrawer() {
    if (!isPhone() || side.classList.contains('is-open')) return;
    side.classList.add('is-open');
    scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.addEventListener('click', closeDrawer);
    document.body.appendChild(scrim);
    setTimeout(function () { search.focus(); }, 50);
  }
  function closeDrawer() {
    if (!side.classList.contains('is-open')) return;
    side.classList.remove('is-open'); if (scrim) { scrim.remove(); scrim = null; }
  }
  $('[data-open-list]').addEventListener('click', openDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closePop(false); closeDrawer(); } });

  renderList();
  route();
})();

/* ---------- theme ---------- */
(function () {
  var root = document.documentElement, btn = document.querySelector('.theme-btn');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function current() { return root.getAttribute('data-theme') || (mq.matches ? 'dark' : 'light'); }
  function apply(t) { root.setAttribute('data-theme', t); btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); }
  try { var saved = localStorage.getItem('oc-theme'); if (saved) apply(saved); else apply(current()); } catch (e) { apply(current()); }
  btn.addEventListener('click', function () { var t = current() === 'dark' ? 'light' : 'dark'; apply(t); try { localStorage.setItem('oc-theme', t); } catch (e) {} });
})();
