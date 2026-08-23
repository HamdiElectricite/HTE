/* =========================================================================
   HTE — Hamdi Travaux Électricité
   main.js — plain vanilla JS, no dependencies
   ========================================================================= */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "21623096669";
  var CONTACT_EMAIL = "Hamdielectricite611@gmail.com";

  /* -----------------------------------------------------------------------
     Utilities
     --------------------------------------------------------------------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts || false); }

  /* -----------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  var yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -----------------------------------------------------------------------
     Sticky header + scrollspy
     --------------------------------------------------------------------- */
  var header = qs(".site-header");
  var navLinks = qsa(".nav-links a, .mobile-menu a");
  var sections = qsa("main section[id]");

  function handleScrollUI() {
    if (window.scrollY > 40) {
      header && header.classList.add("is-scrolled");
    } else {
      header && header.classList.remove("is-scrolled");
    }

    // Back-to-top visibility
    if (backToTop) {
      if (window.scrollY > 700) backToTop.classList.add("is-visible");
      else backToTop.classList.remove("is-visible");
    }
  }

  var scrollSpyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute("id");
        navLinks.forEach(function (link) {
          var match = link.getAttribute("href") === "#" + id;
          link.classList.toggle("active", match);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach(function (s) { scrollSpyObserver.observe(s); });

  on(window, "scroll", handleScrollUI, { passive: true });
  handleScrollUI();

  /* -----------------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------------- */
  var navToggle = qs(".nav-toggle");
  var mobileMenu = qs(".mobile-menu");

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    navToggle && navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function toggleMobileMenu() {
    if (!mobileMenu) return;
    var isOpen = mobileMenu.classList.toggle("is-open");
    navToggle && navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
  on(navToggle, "click", toggleMobileMenu);
  qsa(".mobile-menu a").forEach(function (a) { on(a, "click", closeMobileMenu); });
  on(document, "keydown", function (e) { if (e.key === "Escape") closeMobileMenu(); });

  /* -----------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  var revealItems = qsa("[data-reveal]");
  if ("IntersectionObserver" in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* -----------------------------------------------------------------------
     Hero background slideshow (Ken Burns crossfade)
     --------------------------------------------------------------------- */
  var heroSlides = qsa(".hero-bg img");
  if (heroSlides.length > 1) {
    var heroIndex = 0;
    setInterval(function () {
      heroSlides[heroIndex].classList.remove("is-active");
      heroIndex = (heroIndex + 1) % heroSlides.length;
      heroSlides[heroIndex].classList.add("is-active");
    }, 7000);
  }

  /* -----------------------------------------------------------------------
     Animated counters
     --------------------------------------------------------------------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var duration = 1600;
    var startTime = null;
    var done = false;

    function finish() {
      if (done) return;
      done = true;
      el.textContent = target;
    }

    function step(ts) {
      if (done) return;
      if (startTime === null) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      var value = Math.floor(eased * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
      else finish();
    }
    requestAnimationFrame(step);
    // Safety net: if the tab is backgrounded/throttled mid-count (e.g. a phone
    // locks or the user switches apps while scrolling), rAF can stall before
    // reaching progress 1, leaving the number stuck one digit short forever.
    setTimeout(finish, duration + 400);
  }

  var counters = qsa("[data-count]");
  if (counters.length) {
    var countObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (c) { countObserver.observe(c); });
  }

  /* -----------------------------------------------------------------------
     Gallery lightbox
     --------------------------------------------------------------------- */
  var galleryFigures = qsa("[data-gallery-item]");
  var lightbox = qs("#lightbox");
  var lightboxImg = qs("#lightboxImg");
  var lightboxTitle = qs("#lightboxTitle");
  var lightboxDesc = qs("#lightboxDesc");
  var lightboxCounter = qs("#lightboxCounter");
  var lightboxIndex = 0;

  function openLightbox(index) {
    if (!lightbox || !galleryFigures[index]) return;
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function updateLightbox() {
    var fig = galleryFigures[lightboxIndex];
    var img = fig.querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    lightboxTitle.textContent = fig.getAttribute("data-title") || "";
    lightboxDesc.textContent = fig.getAttribute("data-desc") || "";
    if (lightboxCounter) lightboxCounter.textContent = (lightboxIndex + 1) + " / " + galleryFigures.length;
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function nextImage() {
    lightboxIndex = (lightboxIndex + 1) % galleryFigures.length;
    updateLightbox();
  }
  function prevImage() {
    lightboxIndex = (lightboxIndex - 1 + galleryFigures.length) % galleryFigures.length;
    updateLightbox();
  }

  galleryFigures.forEach(function (fig, i) {
    on(fig, "click", function () { openLightbox(i); });
  });
  on(qs("#lightboxClose"), "click", closeLightbox);
  on(qs("#lightboxNext"), "click", nextImage);
  on(qs("#lightboxPrev"), "click", prevImage);
  on(lightbox, "click", function (e) { if (e.target === lightbox) closeLightbox(); });
  // Swipe left/right to navigate — the gallery this replaces had it, and on a
  // phone that's the natural way to flip through photos, not just tapping arrows.
  var lightboxStage = qs(".lightbox-stage");
  var touchStartX = 0, touchStartY = 0, touchActive = false;
  on(lightboxStage, "touchstart", function (e) {
    if (!e.touches || !e.touches[0]) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchActive = true;
  }, { passive: true });
  on(lightboxStage, "touchend", function (e) {
    if (!touchActive) return;
    touchActive = false;
    var touch = e.changedTouches && e.changedTouches[0];
    if (!touch) return;
    var deltaX = touch.clientX - touchStartX;
    var deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) nextImage(); else prevImage();
    }
  }, { passive: true });

  on(document, "keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  });

  /* -----------------------------------------------------------------------
     WhatsApp floating bubble + Back-to-top
     --------------------------------------------------------------------- */
  var whatsappFab = qs("#whatsappFab");
  var backToTop = qs("#backToTop");

  setTimeout(function () { whatsappFab && whatsappFab.classList.add("is-visible"); }, 900);

  on(backToTop, "click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* -----------------------------------------------------------------------
     Copy-to-clipboard on contact cards
     --------------------------------------------------------------------- */
  var toast = qs("#toast");
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.querySelector("span").textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2400);
  }

  qsa("[data-copy]").forEach(function (btn) {
    on(btn, "click", function (e) {
      e.preventDefault();
      var value = btn.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () {
          showToast("Copié : " + value);
        }).catch(function () {
          showToast(value);
        });
      } else {
        showToast(value);
      }
    });
  });

  /* -----------------------------------------------------------------------
     Contact form -> WhatsApp / Email (no backend, fully client-side)
     --------------------------------------------------------------------- */
  var form = qs("#contactForm");
  if (form) {
    var nameField = qs("#cf-name");
    var phoneField = qs("#cf-phone");
    var serviceField = qs("#cf-service");
    var messageField = qs("#cf-message");

    function validate() {
      var valid = true;
      [
        [nameField, nameField.value.trim().length >= 2],
        [phoneField, phoneField.value.trim().length >= 6],
        [messageField, messageField.value.trim().length >= 5]
      ].forEach(function (pair) {
        var field = pair[0];
        var ok = pair[1];
        var wrapper = field.closest(".field");
        if (!ok) { wrapper.classList.add("has-error"); valid = false; }
        else { wrapper.classList.remove("has-error"); }
      });
      return valid;
    }

    function buildMessage() {
      var lines = [
        "Bonjour HTE, je vous contacte via le site.",
        "",
        "Nom : " + nameField.value.trim(),
        "Téléphone : " + phoneField.value.trim(),
        "Service : " + (serviceField.value || "Non précisé"),
        "",
        "Message :",
        messageField.value.trim()
      ];
      return lines.join("\n");
    }

    on(form, "submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      var text = encodeURIComponent(buildMessage());
      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text, "_blank", "noopener");
    });

    on(qs("#sendEmailBtn"), "click", function () {
      if (!validate()) return;
      var subject = encodeURIComponent("Demande de devis — site HTE");
      var body = encodeURIComponent(buildMessage());
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    });
  }
})();
