// Sazvar — plain vanilla JS, no build step, no framework.
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.textContent = isOpen ? "Close ✕" : "Menu ☰";
    });

    // Close the mobile menu when a nav link is clicked.
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu ☰";
      });
    });
  }

  // Services dropdown (mega-menu on desktop, accordion on mobile) — click
  // to open/close rather than hover-only, so it works with touch and
  // keyboard too.
  document.querySelectorAll(".nav-dropdown-toggle").forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      var parent = btn.closest(".nav-dropdown");
      var isOpen = parent.classList.contains("is-open");
      document.querySelectorAll(".nav-dropdown.is-open").forEach(function (el) {
        el.classList.remove("is-open");
        var t = el.querySelector(".nav-dropdown-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        parent.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".nav-dropdown.is-open").forEach(function (el) {
      el.classList.remove("is-open");
      var t = el.querySelector(".nav-dropdown-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      document.querySelectorAll(".nav-dropdown.is-open").forEach(function (el) {
        el.classList.remove("is-open");
        var t = el.querySelector(".nav-dropdown-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    }
  });

  // Stats strip: numbers count up/down and the flags fly in and settle,
  // all triggered once when the strip first scrolls into view.
  var statsSection = document.querySelector(".stats-dark");
  if (statsSection) {
    var statsGrid = statsSection.querySelector(".value-grid");
    var counters = statsSection.querySelectorAll(".count-up, .count-down");
    var statsAnimated = false;

    var easeOutExpo = function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    var animateCounter = function (el) {
      var target = parseInt(el.getAttribute("data-target"), 10);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = target;
        return;
      }
      var start = el.classList.contains("count-down")
        ? parseInt(el.getAttribute("data-start"), 10)
        : 0;
      var duration = 1400;
      var startTime = null;

      var step = function (timestamp) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          el.textContent = target;
          return;
        }
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = easeOutExpo(progress);
        var current = Math.round(start + (target - start) * eased);
        el.textContent = current;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      };
      window.requestAnimationFrame(step);
    };

    var triggerStats = function () {
      if (statsAnimated) return;
      statsAnimated = true;
      if (statsGrid) statsGrid.classList.add("in-view");
      counters.forEach(animateCounter);
    };

    if ("IntersectionObserver" in window) {
      var statsObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              triggerStats();
              statsObserver.disconnect();
            }
          });
        },
        { threshold: 0.4 },
      );
      statsObserver.observe(statsSection);
    } else {
      triggerStats();
    }
  }

  // Hero scroll-story fallback: stack-scroll.js only scrubs the plant/
  // truck/office reveal to scroll position on wide-and-tall desktop
  // windows (see its "desktop" media query — roughly 960x600+). Below
  // that, body never gets the "stack-enabled" class, so play a simple
  // one-shot "assembling" reveal instead once the scene scrolls into
  // view, rather than leaving it static.
  var siteStage = document.getElementById("site-stage");
  if (siteStage) {
    var plantRig = siteStage.querySelector(".plant-rig");
    var truckRig = siteStage.querySelector(".truck-rig");
    var officeRig = siteStage.querySelector(".office-rig");
    var rigTimers = [];

    var revealRigs = function () {
      if (document.body.classList.contains("stack-enabled")) return;
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var add = function (el, delay) {
        if (!el) return;
        if (reduced) { el.classList.add("in-view"); return; }
        rigTimers.push(window.setTimeout(function () { el.classList.add("in-view"); }, delay));
      };
      add(plantRig, 100);
      add(truckRig, 500);
      add(officeRig, 900);
    };

    if ("IntersectionObserver" in window) {
      var rigObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealRigs();
              rigObserver.disconnect();
            }
          });
        },
        { threshold: 0.3 },
      );
      rigObserver.observe(siteStage);
    } else {
      revealRigs();
    }
  }

  // Contact form: prepare a mailto draft. No backend is connected yet,
  // so this deliberately does not claim the message was sent.
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.name.value.trim();
      var org = form.organization.value.trim();
      var email = form.email.value.trim();
      var service = form.service.value;
      var details = form.details.value.trim();

      var subject = encodeURIComponent("Sazvar enquiry from " + name);
      var body = encodeURIComponent(
        "Name: " + name +
        "\nCompany/Institution: " + org +
        "\nEmail: " + email +
        "\nService: " + service +
        "\n\nRequirement:\n" + details,
      );

      window.location.href = "mailto:info@sazvar.com?subject=" + subject + "&body=" + body;

      var note = document.getElementById("form-status");
      if (note) {
        note.textContent =
          "Your email client should now open with this enquiry pre-filled. Nothing has been sent automatically — please review and hit send.";
      }
    });
  }
});
