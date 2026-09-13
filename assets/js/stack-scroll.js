// Progressive enhancement: native document scrolling remains the source of truth.
(function () {
  "use strict";
  var body = document.body;
  var main = document.querySelector(".homepage main");
  if (!main) return;
  var header = document.querySelector(".site-header");
  var panels = Array.from(main.children);
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktop = window.matchMedia("(min-width: 960px) and (min-height: 600px)");
  var frame = 0;
  var needsMeasure = true;
  var keyboard = false;
  var active = false;
  var headerHeight = 79;
  var viewport = 0;
  var geometry = [];
  var story = document.getElementById("site-band");
  var stage = document.getElementById("site-stage");
  var storyIndex = panels.indexOf(story);
  var clamp = function (value) { return Math.max(0, Math.min(1, value)); };

  panels.forEach(function (panel, index) {
    panel.classList.add("stack-panel");
    panel.style.setProperty("--layer", index + 1);
  });

  function measure() {
    active = desktop.matches && !motion.matches && !keyboard;
    body.classList.toggle("stack-enabled", active);
    headerHeight = header.getBoundingClientRect().height;
    body.style.setProperty("--stack-header", headerHeight + "px");
    viewport = Math.max(1, window.innerHeight - headerHeight);
    // Temporarily release sticky positioning, but preserve panel dimensions.
    // Read all geometry together; scrolling itself never recalculates layout.
    body.classList.add("stack-measuring");
    geometry = panels.map(function (panel) {
      var rect = panel.getBoundingClientRect();
      return { start: rect.top + window.scrollY, height: rect.height };
    });
    panels.forEach(function (panel, index) {
      // Oversized content scrolls completely before its bottom edge pins.
      panel.style.setProperty("--stack-top", (headerHeight - Math.max(0, geometry[index].height - viewport)) + "px");
    });
    body.classList.remove("stack-measuring");
  }

  function render() {
    frame = 0;
    if (needsMeasure) {
      needsMeasure = false;
      measure();
    }
    var scroll = window.scrollY;
    panels.forEach(function (panel, index) {
      var next = geometry[index + 1];
      var cover = active && next ? clamp((scroll + window.innerHeight - next.start) / viewport) : 0;
      panel.style.setProperty("--stack-shade", (cover * 0.13).toFixed(4));
    });
    if (stage && storyIndex >= 0) {
      // Six chapters, driven by one 0..1 progress value, read the same way
      // on every screen size: how far we've scrolled through .site-band's
      // own tall wrapper (see the CSS — it's tall everywhere now, with the
      // scene held in place by its own nested sticky pin, independent of
      // the page-wide stacking that still handles panel-to-panel cover
      // transitions). That's what gives the story real scroll room instead
      // of racing through in one viewport-height on desktop. Reduced-motion
      // users just get the finished scene, no scroll-tied motion.
      var bandGeo = geometry[storyIndex];
      var progress;
      if (motion.matches) {
        progress = 1;
      } else {
        // Mirrors the sticky panel's own height: calc(100svh - header).
        progress = clamp((scroll - bandGeo.start) / Math.max(1, bandGeo.height - viewport));
      }
      // 1) plant settles  2) truck arrives  3) office (+ sign) settles
      // 4) truck leaves  5) office fades back out  6) — once the stage is
      // clear — the engineer and plant owner shake on it. A 7th "chapter"
      // is just the page moving on to the next section afterwards.
      stage.style.setProperty("--plant-progress", clamp(progress / 0.16).toFixed(4));
      stage.style.setProperty("--truck-in-progress", clamp((progress - 0.14) / 0.18).toFixed(4));
      stage.style.setProperty("--office-progress", clamp((progress - 0.3) / 0.16).toFixed(4));
      stage.style.setProperty("--truck-out-progress", clamp((progress - 0.44) / 0.16).toFixed(4));
      stage.style.setProperty("--office-out-progress", clamp((progress - 0.58) / 0.16).toFixed(4));
      stage.style.setProperty("--handshake-progress", clamp((progress - 0.72) / 0.28).toFixed(4));
      stage.classList.toggle("stage-1", progress < 0.16);
      stage.classList.toggle("stage-2", progress >= 0.16 && progress < 0.32);
      stage.classList.toggle("stage-3", progress >= 0.32 && progress < 0.48);
      stage.classList.toggle("stage-4", progress >= 0.48 && progress < 0.62);
      stage.classList.toggle("stage-5", progress >= 0.62 && progress < 0.76);
      stage.classList.toggle("stage-6", progress >= 0.76);
    }
  }

  function schedule(remeasure) {
    if (remeasure === true) needsMeasure = true;
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  function alignAnchor() {
    if (!window.location.hash) return;
    var target;
    try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); }
    catch (_) { return; }
    if (!target || !main.contains(target)) return;
    // Resolve against normal flow, including anchors nested within a tall panel.
    body.classList.add("stack-measuring");
    var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    body.classList.remove("stack-measuring");
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    schedule();
  }

  function resize() { schedule(true); }
  function onScroll() { schedule(); }
  function onHash() { measure(); alignAnchor(); schedule(); }
  function onReady() { measure(); alignAnchor(); schedule(); }
  function onKey(event) {
    // A keyboard user must never tab into a link concealed behind another layer.
    // Keep the ordinary document layout for the remainder of this page visit.
    if (event.key === "Tab" && !keyboard) {
      keyboard = true;
      measure();
      schedule();
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);
  window.addEventListener("hashchange", onHash);
  window.addEventListener("pageshow", onReady);
  window.addEventListener("load", onReady);
  document.addEventListener("keydown", onKey);
  motion.addEventListener("change", resize);
  desktop.addEventListener("change", resize);
  var observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  if (observer) {
    observer.observe(header);
    panels.forEach(function (panel) { observer.observe(panel); });
  }
  if (document.fonts) document.fonts.ready.then(resize);
  render();
})();
