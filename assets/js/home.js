/* ==========================================================================
   Smyle Dental — homepage hero
   The headline is written into the HTML in full, so it is there with or
   without JavaScript. This script replays it as a typewriter, sweeps the
   marker strokes under the city names, and drifts a field of review cards
   past the camera behind it.
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = (window.SMYLE && window.SMYLE.reduced) ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var h1 = document.getElementById('heroHeadline');
  var field = document.getElementById('heroField');

  /* ---------------------------------------------------- marker underline -- */
  function drawMarks() {
    if (!h1) return;
    h1.querySelectorAll('.mkline path').forEach(function (path, i) {
      var len = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      void path.getBoundingClientRect();
      if (REDUCED) { path.style.strokeDashoffset = 0; return; }
      path.style.transition = 'stroke-dashoffset .62s cubic-bezier(.25,.6,.3,1) ' + (i * 0.26) + 's';
      path.style.strokeDashoffset = 0;
    });
  }

  /* -------------------------------------------------------- typewriter -- */
  function readSegments(root) {
    /* Flatten the headline into typeable characters, remembering which ones
       are inside the emphasised word and where the line breaks. */
    var chars = [];
    (function walk(node, em) {
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) {
          for (var i = 0; i < n.nodeValue.length; i++) chars.push({ ch: n.nodeValue[i], em: em });
          return;
        }
        if (n.nodeType !== 1) return;
        if (n.tagName === 'BR') { chars.push({ br: true }); return; }
        if (n.tagName === 'SVG' || n.tagName === 'svg') return;
        walk(n, em || n.tagName === 'EM');
      });
    })(root, false);
    return chars;
  }

  function typeHeadline() {
    if (!h1) return;
    var finalHtml = h1.innerHTML;

    if (REDUCED) { drawMarks(); return; }

    var chars = readSegments(h1);
    var i = 0;
    var timer = null;

    var step = function () {
      i++;
      var html = '';
      var open = false;
      for (var k = 0; k < i; k++) {
        var c = chars[k];
        if (c.br) { if (open) { html += '</em>'; open = false; } html += '<br>'; continue; }
        if (c.em && !open) { html += '<em>'; open = true; }
        if (!c.em && open) { html += '</em>'; open = false; }
        html += c.ch === '<' ? '&lt;' : c.ch === '&' ? '&amp;' : c.ch;
      }
      if (open) html += '</em>';
      h1.innerHTML = html + '<span class="caret"></span>';
      if (i < chars.length) timer = window.setTimeout(step, 34);
      else timer = window.setTimeout(function () { h1.innerHTML = finalHtml; drawMarks(); }, 900);
    };

    h1.innerHTML = '<span class="caret"></span>';
    timer = window.setTimeout(step, 340);
  }

  /* --------------------------------------------------------- card field -- */
  function seeded(n) {
    var s = n * 9301 + 49297;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function reviewData() {
    var faces = document.querySelectorAll('#reviewCloud .face');
    var out = [];
    faces.forEach(function (f) {
      out.push({ name: f.dataset.name || '', city: f.dataset.city || '', text: f.dataset.text || '' });
    });
    return out;
  }

  function buildField() {
    if (!field || REDUCED) return;

    var reviews = reviewData();
    if (!reviews.length) return;

    var photos = [];
    try { photos = JSON.parse(field.dataset.photos || '[]'); } catch (e) { photos = []; }

    var rnd = seeded(7);
    var VW = Math.max(360, window.innerWidth || 1440);
    var SX = Math.min(1560, VW * 1.02);
    var SY = Math.min(900, (window.innerHeight || 900) * 0.92);
    var frag = document.createDocumentFragment();

    for (var i = 0; i < 22; i++) {
      var x = Math.round((rnd() - .5) * SX);
      var y = Math.round((rnd() - .5) * SY);

      /* keep a clear reading zone behind the headline */
      var EX = Math.min(470, SX * 0.30);
      var EY = Math.min(260, SY * 0.29);
      if (Math.abs(x) < EX && Math.abs(y) < EY) {
        if (Math.abs(x) / EX > Math.abs(y) / EY) x = (x < 0 ? -1 : 1) * Math.round(EX + rnd() * (SX * 0.21));
        else y = (y < 0 ? -1 : 1) * Math.round(EY + rnd() * (SY * 0.28));
      }

      var style = '--x:' + x + ';--y:' + y +
        ';--rx:' + Math.round((rnd() - .5) * 46) + 'deg' +
        ';--ry:' + Math.round((rnd() - .5) * 54) + 'deg' +
        ';--rz:' + Math.round((rnd() - .5) * 26) + 'deg' +
        ';--dur:' + (16 + rnd() * 14).toFixed(1) + 's' +
        ';--delay:' + (-rnd() * 26).toFixed(1) + 's';

      var card = document.createElement('div');
      card.className = 'fcard';
      card.setAttribute('style', style);
      card.setAttribute('aria-hidden', 'true');

      if (i % 5 === 4 && photos.length) {
        card.classList.add('photo');
        var img = document.createElement('img');
        img.src = photos[i % photos.length];
        img.alt = '';
        img.loading = 'lazy';
        var cap = document.createElement('div');
        cap.className = 'cap';
        cap.textContent = 'Smyle Dental';
        card.appendChild(img);
        card.appendChild(cap);
      } else {
        var r = reviews[i % reviews.length];
        var st = document.createElement('div');
        st.className = 'st';
        st.textContent = '★★★★★';
        var q = document.createElement('q');
        q.textContent = r.text.slice(0, 92) + '…';
        var cite = document.createElement('cite');
        cite.textContent = r.name + (r.city ? ', ' + r.city : '');
        card.appendChild(st);
        card.appendChild(q);
        card.appendChild(cite);
      }
      frag.appendChild(card);
    }

    field.appendChild(frag);
    window.requestAnimationFrame(function () { field.classList.add('run'); });
  }

  typeHeadline();
  buildField();
})();
