(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textOf(card, name) {
    return (card.getAttribute(name) || "").toLowerCase();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    roots.forEach(function (root) {
      var query = root.querySelector("[data-search-input]");
      var year = root.querySelector("[data-filter-year]");
      var region = root.querySelector("[data-filter-region]");
      var type = root.querySelector("[data-filter-type]");
      var category = root.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".searchable-card"));
      var empty = root.querySelector("[data-no-results]");

      function valueOf(input) {
        return input ? input.value.trim().toLowerCase() : "";
      }

      function apply() {
        var q = valueOf(query);
        var y = valueOf(year);
        var r = valueOf(region);
        var t = valueOf(type);
        var c = valueOf(category);
        var visible = 0;

        cards.forEach(function (card) {
          var combined = [
            textOf(card, "data-title"),
            textOf(card, "data-region"),
            textOf(card, "data-year"),
            textOf(card, "data-type"),
            textOf(card, "data-genre"),
            textOf(card, "data-tags"),
            textOf(card, "data-category")
          ].join(" ");

          var matched = true;
          if (q && combined.indexOf(q) === -1) {
            matched = false;
          }
          if (y && textOf(card, "data-year").indexOf(y) === -1) {
            matched = false;
          }
          if (r && textOf(card, "data-region").indexOf(r) === -1) {
            matched = false;
          }
          if (t && textOf(card, "data-type").indexOf(t) === -1) {
            matched = false;
          }
          if (c && textOf(card, "data-category").indexOf(c) === -1) {
            matched = false;
          }

          card.classList.toggle("is-filtered-out", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [query, year, region, type, category].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    var video = document.querySelector("[data-video-url]");
    var overlay = document.getElementById("playOverlay");
    if (!video || !overlay) {
      return;
    }
    var hls = null;
    var initialized = false;

    function loadAndPlay() {
      var url = video.getAttribute("data-video-url") || "";
      if (!url) {
        return;
      }

      if (!initialized) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        initialized = true;
      }

      overlay.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", loadAndPlay);
    video.addEventListener("click", function () {
      if (!initialized) {
        loadAndPlay();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
