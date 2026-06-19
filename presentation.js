(function () {
'use strict';

/* ── constants ─────────────────────────────────────── */
var W = 1920, H = 1080;
var DIVIDERS = {1:1,4:1,9:1,12:1,25:1,39:1,41:1};

/* ── state ─────────────────────────────────────────── */
var stage, slides, total, current = 0, busy = false;
var dotEls = [];
var ctrl, hideTimer;

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

/* ── update nav counter + dots ─────────────────────── */
function syncUI() {
  var ctr = document.getElementById('prs-ctr');
  if (ctr) ctr.textContent = (current + 1) + ' / ' + total;
  dotEls.forEach(function (d, i) {
    d.classList.toggle('prs-dot-on', i === current);
  });
}

/* ── nav show / hide ───────────────────────────────── */
function showCtrl() {
  clearTimeout(hideTimer);
  if (ctrl) ctrl.style.opacity = '1';
}
function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(function () {
    if (ctrl) ctrl.style.opacity = '0';
  }, 1800);
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

/* ── drag scrub ────────────────────────────────────── */
var dragging = false;
function scrubTo(e) {
  var track = document.getElementById('prs-track');
  if (!track) return;
  var rect = track.getBoundingClientRect();
  var ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  var idx = Math.round(ratio * (total - 1));
  if (idx !== current && !busy) go(idx);
}

/* ── nav UI ────────────────────────────────────────── */
function buildUI() {
  var s = document.createElement('style');
  s.textContent =
    '#prs-ui{position:fixed;bottom:0;left:0;right:0;z-index:99999;pointer-events:none}' +
    '@media print{#prs-ui{display:none!important}}' +
    '#prs-ctrl{' +
      'display:flex;align-items:center;justify-content:space-between;' +
      'padding:10px 24px;gap:12px;' +
      'pointer-events:auto;' +        /* always clickable */
      'opacity:0;transition:opacity .25s}' +
    '.pb{background:rgba(10,10,14,.65);border:1px solid rgba(255,255,255,.15);color:#fff;' +
      'border-radius:8px;padding:7px 18px;cursor:pointer;' +
      'font:600 13px/1.4 Outfit,sans-serif;letter-spacing:.1em;' +
      'transition:background .15s}' +
    '.pb:hover{background:rgba(10,10,14,.88)}' +
    '#prs-ctr{color:rgba(255,255,255,.65);font:400 13px/1 Outfit,sans-serif;' +
      'letter-spacing:.18em;min-width:52px;text-align:center;flex-shrink:0}' +
    '#prs-track{display:flex;align-items:center;gap:5px;flex:1;justify-content:center;' +
      'padding:8px 12px;cursor:pointer;user-select:none}' +
    '.prs-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;' +
      'background:rgba(255,255,255,.28);border:1px solid rgba(255,255,255,.18);' +
      'transition:background .2s,transform .2s,border-color .2s;cursor:pointer;' +
      'pointer-events:auto}' +
    '.prs-dot:hover{background:rgba(255,255,255,.65);transform:scale(1.5)}' +
    '.prs-dot.prs-dot-on{background:#d42036;border-color:#ff6271;transform:scale(1.6);box-shadow:0 0 6px rgba(212,32,54,.7)}' +
    '.prs-dot[data-div]{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.1)}' +
    '.prs-dot[data-div].prs-dot-on{background:#ff6271;border-color:#ff6271}';
  document.head.appendChild(s);

  var ui = document.createElement('div');
  ui.id = 'prs-ui';
  ui.innerHTML =
    '<div id="prs-ctrl">' +
      '<button class="pb" id="pb-prev">&#8592; El&#337;z&#337;</button>' +
      '<div id="prs-track"></div>' +
      '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">' +
        '<span id="prs-ctr">1&nbsp;/&nbsp;41</span>' +
        '<button class="pb" id="pb-next">K&#246;vetkez&#337; &#8594;</button>' +
        '<button class="pb" id="pb-fs">&#x26F6;&nbsp;Teljes k&#233;perny&#337;</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(ui);

  ctrl = document.getElementById('prs-ctrl');

  /* show nav when mouse nears the bottom 80px of viewport */
  document.addEventListener('mousemove', function (e) {
    if (e.clientY > window.innerHeight - 80) {
      showCtrl();
    } else {
      scheduleHide();
    }
  });
  ctrl.addEventListener('mouseenter', showCtrl);
  ctrl.addEventListener('mouseleave', scheduleHide);

  /* build dots */
  var track = document.getElementById('prs-track');
  slides.forEach(function (slide, i) {
    var label = parseInt(slide.dataset.label || (i + 1), 10);
    var d = document.createElement('span');
    d.className = 'prs-dot';
    d.title = label + '. dia';
    if (DIVIDERS[label]) d.setAttribute('data-div', '');
    d.addEventListener('click', function (e) {
      e.stopPropagation();
      go(i);
    });
    track.appendChild(d);
    dotEls.push(d);
  });

  /* scroll wheel on tracker */
  track.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (e.deltaY > 0 || e.deltaX > 0) go(current + 1);
    else go(current - 1);
  }, { passive: false });

  /* drag scrub — only activate on actual drag (mousemove while down) */
  track.addEventListener('mousedown', function (e) {
    dragging = false; /* reset; set true only on move */
    e.preventDefault();
    var onMove = function (ev) {
      dragging = true;
      scrubTo(ev);
    };
    var onUp = function (ev) {
      if (!dragging) scrubTo(ev); /* treat as click if no movement */
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

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
