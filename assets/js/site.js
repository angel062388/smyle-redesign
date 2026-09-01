/* ==========================================================================
   Smyle Dental — site behaviour
   Shared by every page: sticky header, mobile drawer, FAQ accordion,
   review constellation, treatment picker, booking dialog.
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------- sticky header -- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------- mobile drawer -- */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('drawerScrim');

  function setDrawer(open) {
    if (!drawer || !toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
    if (open) {
      drawer.setAttribute('data-open', '');
      if (scrim) scrim.setAttribute('data-open', '');
    } else {
      drawer.removeAttribute('data-open');
      if (scrim) scrim.removeAttribute('data-open');
    }
  }

  if (toggle) toggle.addEventListener('click', function () {
    setDrawer(toggle.getAttribute('aria-expanded') !== 'true');
  });
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });

  if (drawer) {
    drawer.addEventListener('click', function (e) {
      var sub = e.target.closest('.sub-toggle');
      if (sub) {
        var panel = document.getElementById(sub.getAttribute('aria-controls'));
        var open = sub.getAttribute('aria-expanded') === 'true';
        sub.setAttribute('aria-expanded', String(!open));
        if (panel) {
          if (open) panel.removeAttribute('data-open');
          else panel.setAttribute('data-open', '');
        }
        return;
      }
      if (e.target.closest('.drawer-close')) { setDrawer(false); return; }
      if (e.target.closest('a[href]')) setDrawer(false);
    });
  }

  /* ------------------------------------------------------- FAQ accordion -- */
  /* One answer open at a time, across every FAQ list on the page. */
  document.querySelectorAll('.faqlist').forEach(function (list) {
    var items = list.querySelectorAll('details.fq');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (other) { if (other !== d) other.open = false; });
      });
    });
  });

  /* ------------------------------------------------ review constellation -- */
  var cloud = document.getElementById('reviewCloud');
  if (cloud) {
    var featText = document.getElementById('testiText');
    var featWho = document.getElementById('testiWho');
    var featAvi = document.getElementById('testiAvatar');

    cloud.addEventListener('click', function (e) {
      var face = e.target.closest('.face');
      if (!face) return;
      cloud.querySelectorAll('.face').forEach(function (f) { f.classList.toggle('on', f === face); });

      var name = face.dataset.name || '';
      var city = face.dataset.city || '';
      var text = face.dataset.text || '';
      var avatar = face.dataset.avatar || '';

      if (featText) featText.textContent = text;
      if (featWho) {
        featWho.innerHTML = '';
        var b = document.createElement('b');
        b.textContent = name;
        var s = document.createElement('small');
        s.textContent = city + ', Google review';
        featWho.appendChild(b);
        featWho.appendChild(s);
      }
      if (featAvi) {
        featAvi.innerHTML = '';
        if (avatar) {
          var img = document.createElement('img');
          img.src = avatar;
          img.alt = '';
          img.width = 288;
          img.height = 288;
          featAvi.appendChild(img);
        } else {
          var sp = document.createElement('span');
          sp.textContent = name.charAt(0);
          featAvi.appendChild(sp);
        }
      }
    });
  }

  /* ---------------------------------------------------- treatment picker -- */
  var picker = document.getElementById('treatments');
  if (picker) {
    var officesEl = document.getElementById('officesData');
    var OFFICES = officesEl ? JSON.parse(officesEl.textContent) : {};
    var office = picker.dataset.office || Object.keys(OFFICES)[0];

    var prevImg = document.getElementById('svcPrevImg');
    var prevName = document.getElementById('svcPrevName');
    var prevDesc = document.getElementById('svcPrevDesc');
    var prevWhere = document.getElementById('svcPrevWhere');
    var prevGo = document.getElementById('svcPrevGo');

    function sync() {
      var on = picker.querySelector('.index button.on') || picker.querySelector('.index button');
      var L = OFFICES[office];
      if (!on || !L) return;

      if (prevImg) { prevImg.src = on.dataset.img; prevImg.alt = on.dataset.name; }
      if (prevName) prevName.textContent = on.dataset.name + ' in ' + L.name;
      if (prevDesc) prevDesc.textContent = on.dataset.desc;
      if (prevWhere) {
        prevWhere.innerHTML = '';
        var b = document.createElement('b');
        b.textContent = L.gname;
        prevWhere.appendChild(b);
        prevWhere.appendChild(document.createTextNode(L.addr + ', ' + L.city));
        prevWhere.appendChild(document.createElement('br'));
        var a = document.createElement('a');
        a.href = L.href;
        a.textContent = L.tel;
        prevWhere.appendChild(a);
      }
      if (prevGo) {
        /* Only the pages that exist are linked; the rest stay inert until built. */
        var map = on.dataset.pages ? JSON.parse(on.dataset.pages) : null;
        var href = map && map[office] ? map[office] : '';
        if (href) {
          prevGo.href = href;
          prevGo.removeAttribute('aria-disabled');
        } else {
          prevGo.href = '#';
          prevGo.setAttribute('aria-disabled', 'true');
        }
        prevGo.setAttribute('aria-label', 'Learn more about ' + on.dataset.name + ' in ' + L.name);
      }
    }

    picker.addEventListener('click', function (e) {
      var pill = e.target.closest('[data-office-pill]');
      if (pill) {
        office = pill.dataset.officePill;
        picker.dataset.office = office;
        pill.parentElement.querySelectorAll('[data-office-pill]').forEach(function (x) {
          x.classList.toggle('on', x === pill);
          x.setAttribute('aria-pressed', String(x === pill));
        });
        sync();
        return;
      }
      var item = e.target.closest('.index button');
      if (item) {
        picker.querySelectorAll('.index button').forEach(function (x) {
          x.classList.toggle('on', x === item);
          x.setAttribute('aria-pressed', String(x === item));
        });
        sync();
      }
    });
  }

  /* ------------------------------------------------------ booking dialog -- */
  var mask = document.getElementById('bkMask');
  if (mask) {
    var body = document.getElementById('bkBody');
    var initialHtml = body.innerHTML;
    var lastTrigger = null;

    function focusables() {
      return mask.querySelectorAll('a[href], button:not([disabled]), input, select, textarea');
    }

    function openDialog(trigger) {
      lastTrigger = trigger || null;
      body.innerHTML = initialHtml;
      var office = trigger && trigger.dataset.bookOffice;
      if (office) {
        var sel = document.getElementById('bkLoc');
        if (sel) sel.value = office;
      }
      mask.setAttribute('data-open', '');
      document.body.classList.add('nav-open');
      window.setTimeout(function () {
        var first = document.getElementById('bkFirst');
        if (first) first.focus();
      }, 60);
    }

    function closeDialog() {
      mask.removeAttribute('data-open');
      document.body.classList.remove('nav-open');
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-book]');
      if (t) { e.preventDefault(); setDrawer(false); openDialog(t); return; }
      if (e.target === mask || e.target.closest('#bkX')) closeDialog();
    });

    document.addEventListener('keydown', function (e) {
      if (!mask.hasAttribute('data-open')) {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setDrawer(false);
        return;
      }
      if (e.key === 'Escape') { closeDialog(); return; }
      if (e.key !== 'Tab') return;
      var list = focusables();
      if (!list.length) return;
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    mask.addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target;
      var first = document.getElementById('bkFirst');
      var phone = document.getElementById('bkPhone');
      var email = document.getElementById('bkEmail');
      var email2 = document.getElementById('bkEmail2');
      var agree = document.getElementById('bkOk');
      var errors = [];

      if (!first.value.trim()) errors.push('your first name');
      if (!phone.value.trim()) errors.push('a phone number');
      if (!email.value.trim()) errors.push('an email address');
      if (email.value.trim() && email2.value.trim() && email.value.trim() !== email2.value.trim()) {
        errors.push('matching email addresses');
      }
      if (!agree.checked) errors.push('your agreement to the privacy policy');

      var slot = document.getElementById('bkErrors');
      if (errors.length) {
        if (slot) slot.textContent = 'Please add ' + errors.join(', ') + '.';
        return;
      }
      if (slot) slot.textContent = '';

      /* TODO: post to the practice's booking endpoint before showing this. */
      var who = first.value.trim();
      var locSel = document.getElementById('bkLoc');
      var loc = locSel.options[locSel.selectedIndex].dataset.label || locSel.value;

      body.innerHTML =
        '<div class="done">' +
        '<div class="tick">&#10003;</div>' +
        '<h3>Thanks, ' + who.replace(/[<>&]/g, '') + '</h3>' +
        '<p class="sub">Your request is on its way to the <b>' + loc + '</b> front desk. ' +
        'They will call you back to confirm a time, usually the same working day.</p>' +
        '<button class="go" id="bkClose2" type="button">Close</button>' +
        '</div>';
      document.getElementById('bkClose2').addEventListener('click', closeDialog);
      form.reset();
    });
  }

  /* Expose the reduced-motion flag for the homepage script. */
  window.SMYLE = { reduced: REDUCED };
})();
