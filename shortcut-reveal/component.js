/* Shortcut Reveal — vanilla JS. Auto-initializes every [data-mi="shortcut-reveal"].
   Call window.initShortcutReveal(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var HOLD_MS = 320;
  var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
  var isMac = /mac|iphone|ipad|ipod/i.test(platform);
  var MOD = isMac ? '⌘' : 'Ctrl';
  var MODIFIER_KEYS = ['Shift', 'Alt', 'Control', 'Meta', 'CapsLock'];

  function parse(combo) {
    var parts = combo.toLowerCase().split('+');
    return {
      mod: parts.indexOf('mod') > -1,
      shift: parts.indexOf('shift') > -1,
      alt: parts.indexOf('alt') > -1,
      key: parts[parts.length - 1]
    };
  }

  function keycap(c) {
    var k = c.key === 'enter' ? '↵' : c.key.toUpperCase();
    if (isMac) return (c.alt ? '⌥' : '') + (c.shift ? '⇧' : '') + (c.mod ? '⌘' : '') + k;
    var bits = [];
    if (c.mod) bits.push('Ctrl');
    if (c.alt) bits.push('Alt');
    if (c.shift) bits.push('⇧');
    bits.push(k);
    return bits.join(' ');
  }

  function ariaKeys(c) {
    var k = c.key === 'enter' ? 'Enter' : c.key.toUpperCase();
    return (c.mod ? (isMac ? 'Meta+' : 'Control+') : '') + (c.alt ? 'Alt+' : '') + (c.shift ? 'Shift+' : '') + k;
  }

  function initShortcutReveal(root) {
    if (!root || root.__miShortcut) return;
    root.__miShortcut = true;

    var items = Array.prototype.slice.call(root.querySelectorAll('[data-shortcut]')).map(function (b) {
      var c = parse(b.getAttribute('data-shortcut'));
      var kbd = b.querySelector('.sr-kbd');
      kbd.textContent = keycap(c);
      b.setAttribute('aria-keyshortcuts', ariaKeys(c));
      return { b: b, c: c, kbd: kbd, action: b.getAttribute('data-action'), name: b.getAttribute('data-name') || b.textContent.trim() };
    });
    var hint = root.querySelector('.sr-hint');
    var hold = root.querySelector('.sr-hold');
    var toast = root.querySelector('.sr-toast');
    var sel = root.querySelector('.sr-sel');

    var revealed = false;
    var everRevealed = false;
    var holdTimer = 0;
    var toastTimer = 0;
    var comboUsed = false;
    var onScreen = true;
    var pointer = null;
    var learned = {};
    var history = [];

    // ---------- hint ----------
    function setHint() {
      var n = Object.keys(learned).length;
      var kbd = document.createElement('kbd');
      kbd.textContent = MOD;
      if (n > 0) hint.replaceChildren('Learned ' + n + ' of ' + items.length + ' shortcuts');
      else if (everRevealed) hint.replaceChildren('Keep holding ', kbd, ' and press a letter');
      else hint.replaceChildren('Hold ', kbd, ' to see every shortcut');
    }

    // ---------- reveal ----------
    function reveal(from) {
      if (revealed) return;
      revealed = true;
      var o = from || pointer;
      if (!o) { var r0 = items[0].b.getBoundingClientRect(); o = { x: r0.left, y: r0.top }; }
      items.forEach(function (it) {
        var r = it.b.getBoundingClientRect();
        var d = Math.hypot(r.left + r.width / 2 - o.x, r.top + r.height / 2 - o.y);
        it.kbd.style.setProperty('--sr-delay', (reduce.matches ? 0 : Math.min(260, Math.round(d * 0.6))) + 'ms');
      });
      layoutKeycaps();
      root.classList.add('is-revealed');
      if (!everRevealed) { everRevealed = true; setHint(); }
    }
    // Drop a keycap to a second row when it would collide with its neighbour.
    function layoutKeycaps() {
      var prevRight = -Infinity;
      var prevTop = null;
      var prevLow = false;
      items.forEach(function (it) {
        var r = it.b.getBoundingClientRect();
        var w = it.kbd.offsetWidth;
        var left = r.left + r.width / 2 - w / 2;
        var sameRow = prevTop !== null && Math.abs(r.top - prevTop) < 4;
        var low = sameRow && !prevLow && left < prevRight + 4;
        it.kbd.classList.toggle('is-low', low);
        if (!low) prevRight = left + w;
        prevLow = low;
        prevTop = r.top;
      });
    }
    function hide() {
      clearTimeout(holdTimer);
      if (!revealed) return;
      revealed = false;
      items.forEach(function (it) { it.kbd.style.setProperty('--sr-delay', '0ms'); });
      root.classList.remove('is-revealed');
    }

    // ---------- actions ----------
    function say(msg) {
      clearTimeout(toastTimer);
      toast.textContent = msg;
      toast.classList.add('is-open');
      toastTimer = setTimeout(function () { toast.classList.remove('is-open'); }, 1800);
    }
    function flash(b) {
      b.classList.remove('is-flash');
      void b.offsetWidth;
      b.classList.add('is-flash');
    }
    function toggleStyle(cls, action, record) {
      var on = !sel.classList.contains(cls);
      sel.classList.toggle(cls, on);
      var btn = root.querySelector('[data-action="' + action + '"]');
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (record !== false) history.push(function () { toggleStyle(cls, action, false); });
      return on;
    }
    function perform(it) {
      switch (it.action) {
        case 'bold': return toggleStyle('is-bold', 'bold') ? 'Bold on' : 'Bold off';
        case 'italic': return toggleStyle('is-italic', 'italic') ? 'Italic on' : 'Italic off';
        case 'undo':
          if (!history.length) return 'Nothing to undo';
          history.pop()();
          return 'Undone';
        case 'search': return 'Search opened';
        case 'comment': return 'Comment added';
        case 'share': return 'Share settings opened';
        case 'publish': return 'Published';
        default: return it.name;
      }
    }
    function run(it, viaKeyboard) {
      flash(it.b);
      var msg = perform(it);
      if (viaKeyboard) {
        learned[it.action] = true;
        it.b.classList.add('is-learned');
        setHint();
        say(msg);
      } else {
        say(msg + ' · ' + keycap(it.c) + ' next time');
      }
    }

    items.forEach(function (it) {
      it.b.addEventListener('click', function () { run(it, false); });
    });

    // ---------- keyboard ----------
    function isModKey(e) { return isMac ? e.key === 'Meta' : e.key === 'Control'; }
    function modHeld(e) { return isMac ? e.metaKey : e.ctrlKey; }
    function typingElsewhere() {
      var a = document.activeElement;
      if (!a || root.contains(a)) return false;
      return a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
    }

    document.addEventListener('keydown', function (e) {
      if (!onScreen || typingElsewhere()) return;
      if (isModKey(e)) {
        if (!e.repeat) {
          comboUsed = false;
          clearTimeout(holdTimer);
          holdTimer = setTimeout(function () { if (!comboUsed) reveal(); }, HOLD_MS);
        }
        return;
      }
      if (!modHeld(e) || MODIFIER_KEYS.indexOf(e.key) > -1) return;
      comboUsed = true; // a normal shortcut: don't flash the keycaps
      if (!revealed) clearTimeout(holdTimer);
      var key = e.key.toLowerCase();
      for (var i = 0; i < items.length; i++) {
        var c = items[i].c;
        if (c.mod && c.key === key && c.shift === e.shiftKey && c.alt === e.altKey) {
          e.preventDefault();
          run(items[i], true);
          return;
        }
      }
    });
    document.addEventListener('keyup', function (e) {
      if (isModKey(e) || !modHeld(e)) hide();
    });
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', function () { if (document.hidden) hide(); });

    // ---------- pointer + touch ----------
    root.addEventListener('pointermove', function (e) { pointer = { x: e.clientX, y: e.clientY }; });
    root.addEventListener('pointerleave', function () { pointer = null; });

    hold.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { hold.setPointerCapture(e.pointerId); } catch (err) {}
      reveal({ x: e.clientX, y: e.clientY });
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { hold.addEventListener(t, hide); });
    hold.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    hold.addEventListener('keydown', function (e) {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); reveal(); }
    });
    hold.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') hide(); });

    // Only listen while the toolbar is on screen.
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (!onScreen) hide();
      }, { threshold: 0.2 }).observe(root);
    }

    setHint();
  }

  window.initShortcutReveal = initShortcutReveal;
  function boot() { document.querySelectorAll('[data-mi="shortcut-reveal"]').forEach(initShortcutReveal); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
