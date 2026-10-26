/* The Logistika Holding — landing interactions (no dependencies) */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- UI strings per language (page copy itself is static HTML) ---------- */
  var LANG = (doc.getAttribute('lang') || 'ru').slice(0, 2);
  var I18N = {
    ru: { menu: 'Меню', close: 'Закрыть', locale: 'ru-RU',
          error: 'Не удалось отправить заявку. Позвоните нам: +998 99 523 27 05 или напишите на uz.silkroad@mail.ru' },
    uz: { menu: 'Menyu', close: 'Yopish', locale: 'uz-UZ',
          error: "Arizani yuborib bo'lmadi. Bizga qo'ng'iroq qiling: +998 99 523 27 05 yoki uz.silkroad@mail.ru manziliga yozing" },
    en: { menu: 'Menu', close: 'Close', locale: 'en-US',
          error: 'Could not send your request. Please call us at +998 99 523 27 05 or email uz.silkroad@mail.ru' }
  };
  var T = I18N[LANG] || I18N.ru;

  /* ---------- Hero entrance ---------- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.add('is-loaded'); }); });

  /* ---------- Hero photo: use assets/img/hero.jpg if it exists ---------- */
  var heroPhoto = $('[data-hero-photo]');
  if (heroPhoto && heroPhoto.dataset.src && !heroPhoto.getAttribute('src')) {
    var probe = new Image();
    probe.onload = function () { heroPhoto.src = heroPhoto.dataset.src; $('.hero').classList.add('has-photo'); };
    probe.src = heroPhoto.dataset.src;
  }

  /* ---------- Header: solid on scroll, hide on scroll down ---------- */
  var header = $('[data-header]');
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    var menuOpen = document.body.classList.contains('menu-open');
    if (!menuOpen) header.classList.toggle('is-hidden', y > 600 && y > lastY + 4);
    if (y < lastY - 4) header.classList.remove('is-hidden');
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = $('[data-menu-toggle]');
  var nav = $('[data-nav]');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__label').textContent = open ? T.close : T.menu;
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) { header.classList.remove('is-hidden'); var first = nav.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && nav.classList.contains('is-open')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- Scroll reveal (with stagger inside groups) ---------- */
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    // stagger siblings that share a parent
    var groups = new Map();
    reveals.forEach(function (el) {
      var p = el.parentElement; var i = groups.get(p) || 0;
      el.style.setProperty('--d', Math.min(i * 0.08, 0.4) + 's'); groups.set(p, i + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Counters: <span data-count="25"> animates to 25 ---------- */
  var counters = $$('[data-count]').filter(function (el) { return /^\d+$/.test(el.dataset.count || ''); });
  function runCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target.toLocaleString(T.locale); return; }
    var start = performance.now(), dur = 1600;
    (function step(now) {
      var t = Math.min((now - start) / dur, 1); var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString(T.locale);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else { counters.forEach(runCounter); }

  /* ---------- Services: tabs + expanding cards ---------- */
  var tabs = $$('[data-tab]');
  var cards = $$('[data-card]');
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  var heroLinks = $$('[data-service-link]');
  function setService(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (panels[k]) { panels[k].hidden = !on; panels[k].classList.toggle('is-active', on); }
    });
    cards.forEach(function (c, k) { c.classList.toggle('is-active', k === i); });
    heroLinks.forEach(function (a, k) { a.classList.toggle('is-active', k === i); });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setService(i); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % n;
      if (e.key === 'ArrowLeft') next = (i - 1 + n) % n;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = n - 1;
      if (next !== null) { e.preventDefault(); setService(next, true); }
    });
  });
  cards.forEach(function (c, i) {
    c.addEventListener('click', function () { setService(i); });
    c.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover) and (min-width: 960px)').matches) setService(i); });
  });
  heroLinks.forEach(function (a) { a.addEventListener('click', function () { setService(parseInt(a.dataset.serviceLink, 10)); }); });

  /* ---------- Interactive route map ---------- */
  var routeBtns = $$('[data-route]');
  var routeGroups = $$('[data-route-path]');
  var routePoints = $$('[data-route-point]');
  var infoBox = $('[data-route-info]');
  var infoTitle = $('[data-route-title]');
  var infoText = $('[data-route-text]');
  var truck = $('[data-map-truck]');
  var activeRoute = 'eu';
  var truckPath = null, truckStart = 0;

  function setRoute(key, focus) {
    activeRoute = key;
    routeBtns.forEach(function (b) {
      var on = b.dataset.route === key;
      b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    routeGroups.forEach(function (g) { g.classList.toggle('is-active', g.dataset.routePath === key); });
    routePoints.forEach(function (p) { p.classList.toggle('is-active', p.dataset.routePoint === key); });
    var btn = routeBtns.filter(function (x) { return x.dataset.route === key; })[0];
    if (infoBox && btn) {
      infoTitle.textContent = btn.dataset.title; infoText.textContent = btn.dataset.text;
      infoBox.classList.remove('is-changing'); void infoBox.offsetWidth; infoBox.classList.add('is-changing');
    }
    var g = routeGroups.filter(function (x) { return x.dataset.routePath === key; })[0];
    truckPath = g ? g.querySelector('path') : null; truckStart = performance.now();
  }
  routeBtns.forEach(function (b, i) {
    b.addEventListener('click', function () { setRoute(b.dataset.route); });
    b.addEventListener('keydown', function (e) {
      var n = routeBtns.length, next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % n;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + n) % n;
      if (next !== null) { e.preventDefault(); setRoute(routeBtns[next].dataset.route, true); }
    });
  });
  routeGroups.forEach(function (g) { g.style.cursor = 'pointer'; g.addEventListener('click', function () { setRoute(g.dataset.routePath); }); });
  routePoints.forEach(function (p) { p.style.cursor = 'pointer'; p.addEventListener('click', function () { setRoute(p.dataset.routePoint); }); });

  if (routeBtns.length) {
    setRoute(activeRoute);
    var mapEl = $('[data-map]'); var mapVisible = true;
    if ('IntersectionObserver' in window && mapEl) {
      new IntersectionObserver(function (es) { mapVisible = es[0].isIntersecting; }).observe(mapEl);
    }
    (function animateTruck(now) {
      if (truck && truckPath) {
        var len = truckPath.getTotalLength();
        var t = reduceMotion ? 0.6 : ((now - truckStart) % 6000) / 6000;
        var pt = truckPath.getPointAtLength(len * t);
        truck.setAttribute('cx', pt.x.toFixed(1)); truck.setAttribute('cy', pt.y.toFixed(1));
      }
      if (!reduceMotion && mapVisible) requestAnimationFrame(animateTruck);
      else if (!reduceMotion) setTimeout(function () { requestAnimationFrame(animateTruck); }, 400);
    })(performance.now());
  }

  /* ---------- Quote form → /api/lead (Telegram) ---------- */
  var form = $('[data-quote-form]');
  if (form) {
    var fields = $$('.field', form);
    function validate() {
      var ok = true;
      fields.forEach(function (f) {
        var input = f.querySelector('input, textarea');
        var valid = input.checkValidity() && input.value.trim().length > 0;
        f.classList.toggle('is-invalid', !valid);
        if (!valid && ok) { input.focus(); ok = false; }
      });
      return ok;
    }
    fields.forEach(function (f) {
      var input = f.querySelector('input, textarea');
      input.addEventListener('input', function () { if (f.classList.contains('is-invalid')) f.classList.toggle('is-invalid', !(input.checkValidity() && input.value.trim())); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      var btn = form.querySelector('.quote__submit');
      var oldErr = form.querySelector('.quote__error'); if (oldErr) oldErr.remove();
      btn.disabled = true; btn.classList.add('is-loading');
      var data = Object.fromEntries(new FormData(form).entries());
      data.page = location.href; data.lang = LANG;
      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function () {
          form.querySelector('.quote__success').hidden = false; form.reset();
          if (window.gtag) window.gtag('event', 'generate_lead');
        })
        .catch(function () {
          var p = document.createElement('p'); p.className = 'quote__error'; p.setAttribute('role', 'alert');
          p.textContent = T.error;
          btn.insertAdjacentElement('afterend', p);
        })
        .finally(function () { btn.disabled = false; btn.classList.remove('is-loading'); });
    });
  }

  /* ---------- Footer year ---------- */
  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
