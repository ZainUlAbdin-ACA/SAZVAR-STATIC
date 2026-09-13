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

  // Note: the plant/truck/office scroll story (assemble, truck arrives,
  // office appears, truck leaves) is entirely driven by stack-scroll.js,
  // on every screen size — see the --plant-progress/--truck-in-progress/
  // --office-progress/--truck-out-progress custom properties it sets on
  // #site-stage each scroll frame.

  // Contact form: posts to contact.php, which emails info@sazvar.com
  // directly (see that file). Falls back to a mailto draft if the request
  // itself fails (e.g. offline, or PHP unavailable) so an enquiry is never
  // silently lost.
  var form = document.getElementById("contact-form");
  if (form) {
    var submitBtn = document.getElementById("form-submit");
    var note = document.getElementById("form-status");

    function setNote(text, state) {
      if (!note) return;
      note.textContent = text;
      note.classList.remove("is-error", "is-success");
      if (state) note.classList.add(state);
    }

    function mailtoFallback() {
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
      setNote("Couldn't reach the server, so we opened your email client instead — please review and hit send there.");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submitBtn) submitBtn.disabled = true;
      setNote("Sending…");

      fetch("contact.php", {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" },
      })
        .then(function (response) {
          return response.json().catch(function () { return null; }).then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (submitBtn) submitBtn.disabled = false;
          if (result.ok && result.data && result.data.ok) {
            form.reset();
            setNote("Thanks — your enquiry has been sent. We'll get back to you within 1 business day.", "is-success");
          } else {
            var message = (result.data && result.data.error) || "Something went wrong sending that.";
            setNote(message, "is-error");
          }
        })
        .catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          mailtoFallback();
        });
    });
  }
});
