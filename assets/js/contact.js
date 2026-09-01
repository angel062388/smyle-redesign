/* ==========================================================================
   Smyle Dental — contact page
   Inline booking form. Same fields and rules as the booking dialog in
   site.js; separate ids so both can live on one page.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('ctForm');
  var card = document.getElementById('ctCard');
  if (!form || !card) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var first = document.getElementById('ctFirst');
    var phone = document.getElementById('ctPhone');
    var email = document.getElementById('ctEmail');
    var email2 = document.getElementById('ctEmail2');
    var agree = document.getElementById('ctOk');
    var slot = document.getElementById('ctErrors');
    var errors = [];

    if (!first.value.trim()) errors.push('your first name');
    if (!phone.value.trim()) errors.push('a phone number');
    if (!email.value.trim()) errors.push('an email address');
    if (email.value.trim() && email2.value.trim() && email.value.trim() !== email2.value.trim()) {
      errors.push('matching email addresses');
    }
    if (!agree.checked) errors.push('your agreement to the privacy policy');

    if (errors.length) {
      if (slot) slot.textContent = 'Please add ' + errors.join(', ') + '.';
      return;
    }
    if (slot) slot.textContent = '';

    /* TODO: post to the practice's booking endpoint (Gravity Forms / CRM)
       before this goes live; the confirmation below is client-side only. */
    var who = first.value.trim().replace(/[<>&]/g, '');
    var sel = document.getElementById('ctLoc');
    var loc = sel.options[sel.selectedIndex].dataset.label || sel.value;

    card.innerHTML =
      '<div class="done">' +
      '<div class="tick">&#10003;</div>' +
      '<h3>Thanks, ' + who + '</h3>' +
      '<p class="sub">Your request is on its way to the <b>' + loc + '</b> front desk. ' +
      'They will call you back to confirm a time, usually the same working day.</p>' +
      '</div>';
    card.scrollIntoView({ block: 'center' });
  });
})();
