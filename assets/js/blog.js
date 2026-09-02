/* ==========================================================================
   Smyle Dental — blog index
   Show the six newest articles, reveal six more per click. Without
   JavaScript every article stays visible and the button stays hidden.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('postGrid');
  var btn = document.getElementById('showMore');
  if (!grid || !btn) return;

  var BATCH = 6;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.svccard'));
  if (cards.length <= BATCH) return;

  cards.slice(BATCH).forEach(function (c) { c.classList.add('is-hidden'); });
  btn.classList.remove('is-hidden');

  btn.addEventListener('click', function () {
    var hidden = grid.querySelectorAll('.svccard.is-hidden');
    var n = Math.min(BATCH, hidden.length);
    for (var i = 0; i < n; i++) hidden[i].classList.remove('is-hidden');
    if (grid.querySelectorAll('.svccard.is-hidden').length === 0) btn.classList.add('is-hidden');
  });
})();
