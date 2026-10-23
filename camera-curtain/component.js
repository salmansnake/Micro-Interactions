/* Camera-Off Curtain — vanilla JS. Auto-initializes every [data-mi="camera-curtain"].
   root.setCamera(on) drives it from your real camera state. Call window.initCameraCurtain(el) for later elements. */
(function () {
  'use strict';

  function initCameraCurtain(root) {
    if (!root || root.__miCurtain) return;
    root.__miCurtain = true;
    var name = root.getAttribute('data-name') || 'You';
    var cam = root.querySelector('.cc-cam'), camLabel = root.querySelector('.cc-cam-label');
    var label = root.querySelector('.cc-label'), status = root.querySelector('.cc-status');
    var on = true, settle = 0, open = 0;

    function setCamera(v) {
      on = v;
      clearTimeout(settle); clearTimeout(open);
      root.classList.toggle('is-off', !on);
      root.classList.remove('is-settled', 'is-opening');
      cam.setAttribute('aria-pressed', on ? 'true' : 'false');
      camLabel.textContent = on ? 'Turn Camera Off' : 'Turn Camera On';
      label.textContent = on ? name : name + ' · Camera Off';
      if (on) {
        void root.offsetWidth;
        root.classList.add('is-opening');
        open = setTimeout(function () { root.classList.remove('is-opening'); }, 2100);
        status.textContent = 'Camera on. The audience is delighted.';
      } else {
        settle = setTimeout(function () { root.classList.add('is-settled'); }, 900);
        status.textContent = 'Camera off. The show will resume shortly.';
      }
    }

    cam.addEventListener('click', function () { setCamera(!on); });
    root.setCamera = setCamera;
  }

  window.initCameraCurtain = initCameraCurtain;
  function boot() { document.querySelectorAll('[data-mi="camera-curtain"]').forEach(initCameraCurtain); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
