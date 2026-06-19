(function () {
'use strict';

/* ── constants ─────────────────────────────────────── */
var W = 1920, H = 1080;

/* ── state ─────────────────────────────────────────── */
var stage, slides, total, current = 0, busy = false;

/* ── scale-to-fit ──────────────────────────────────── */
function rescale() {
  var s = Math.min(innerWidth / W, innerHeight / H);
  var x = Math.round((innerWidth  - W * s) / 2);
  var y = Math.round((innerHeight - H * s) / 2);
  stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
}

/* ── slide transition ──────────────────────────────── */
function go(idx) {
  if (idx < 0 || idx >= total || busy) return;
  busy = true;
  var prev = slides[current];
  var next = slides[idx];
  prev.classList.remove('prs-on');
  prev.classList.add('prs-out');
  next.classList.add('prs-on');
  setTimeout(function () {
    prev.classList.remove('prs-out');
    current = idx;
    busy = false;
    syncUI();
  }, 420);
}

/* ── update nav counter ────────────────────────────── */
function syncUI() {
  var ctr = document.getElementById('prs-ctr');
  if (ctr) ctr.textContent = (current + 1) + ' / ' + total;
}

/* ── fullscreen toggle ─────────────────────────────── */
function toggleFS() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(function () {});
  } else {
    document.exitFullscreen();
  }
}

/* ── keyboard ──────────────────────────────────────── */
function onKey(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch (e.key) {
    case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
      e.preventDefault(); go(current + 1); break;
    case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
      e.preventDefault(); go(current - 1); break;
    case 'Home': e.preventDefault(); go(0); break;
    case 'End':  e.preventDefault(); go(total - 1); break;
    case 'f': case 'F': toggleFS(); break;
  }
}

/* ── touch / swipe ─────────────────────────────────── */
var _tx = 0;
function onTouchStart(e) { _tx = e.touches[0].clientX; }
function onTouchEnd(e) {
  var dx = e.changedTouches[0].clientX - _tx;
  if (Math.abs(dx) > 48) { dx < 0 ? go(current + 1) : go(current - 1); }
}

/* ── nav UI ────────────────────────────────────────── */
function buildUI() {
  var s = document.createElement('style');
  s.textContent =
    '#prs-ui{position:fixed;bottom:0;left:0;right:0;z-index:9999;pointer-events:none}' +
    '@media print{#prs-ui{display:none!important}}' +
    '#prs-ctrl{display:flex;align-items:center;justify-content:space-between;padding:10px 24px;' +
      'opacity:0;transition:opacity .25s;gap:12px}' +
    '#prs-ui:hover #prs-ctrl{opacity:1;pointer-events:auto}' +
    '.pb{background:rgba(10,10,14,.65);border:1px solid rgba(255,255,255,.15);color:#fff;' +
      'border-radius:8px;padding:7px 18px;cursor:pointer;' +
      'font:600 13px/1.4 Outfit,sans-serif;letter-spacing:.1em;' +
      'transition:background .15s}' +
    '.pb:hover{background:rgba(10,10,14,.88)}' +
    '#prs-ctr{color:rgba(255,255,255,.65);font:400 13px/1 Outfit,sans-serif;' +
      'letter-spacing:.18em;min-width:64px;text-align:center}';
  document.head.appendChild(s);

  var ui = document.createElement('div');
  ui.id = 'prs-ui';
  ui.innerHTML =
    '<div id="prs-ctrl">' +
      '<button class="pb" id="pb-prev">&#8592; El&#337;z&#337;</button>' +
      '<span id="prs-ctr">1&nbsp;/&nbsp;41</span>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="pb" id="pb-next">K&#246;vetkez&#337; &#8594;</button>' +
        '<button class="pb" id="pb-fs">&#x26F6;&nbsp;Teljes k&#233;perny&#337;</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(ui);

  document.getElementById('pb-prev').addEventListener('click', function () { go(current - 1); });
  document.getElementById('pb-next').addEventListener('click', function () { go(current + 1); });
  document.getElementById('pb-fs').addEventListener('click', toggleFS);
}

/* ── init ──────────────────────────────────────────── */
function init() {
  stage  = document.querySelector('deck-stage');
  slides = Array.from(document.querySelectorAll('section.slide'));
  total  = slides.length;

  slides[0].classList.add('prs-on');

  rescale();
  window.addEventListener('resize', rescale);
  document.addEventListener('fullscreenchange', rescale);
  document.addEventListener('keydown', onKey);
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend',   onTouchEnd,   { passive: true });

  buildUI();
  syncUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
