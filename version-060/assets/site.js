(function () {
  "use strict";

  function each(selector, callback) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), callback);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHeaderSearch() {
    each("[data-site-search]", function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        input.value = input.value.trim();
      });
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function normalize(text) {
    return (text || "").toString().toLowerCase().trim();
  }

  function initLocalFilter() {
    each("[data-local-filter]", function (input) {
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        var cards = document.querySelectorAll("[data-filter-card]");
        Array.prototype.forEach.call(cards, function (card) {
          var haystack = normalize(card.getAttribute("data-text") || card.textContent);
          card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function initPlayer() {
    each("[data-player]", function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var started = false;
      if (!video || !button) {
        return;
      }

      function play() {
        var stream = shell.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        shell.classList.add("is-playing");
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
          shell._hls = hls;
          return;
        }
        video.src = stream;
        video.play().catch(function () {});
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!started) {
          play();
        }
      });
    });
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"]/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[match];
    });
  }

  function resultCard(item) {
    return "" +
      "<article class=\"movie-card\" data-filter-card data-text=\"" + escapeHtml(item.search) + "\">" +
      "<a class=\"card-link\" href=\"" + escapeHtml(item.href) + "\">" +
      "<div class=\"poster-frame\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\" onerror=\"this.style.opacity='0';\">" +
      "<span class=\"region-badge\">" + escapeHtml(item.region) + "</span>" +
      "<span class=\"year-badge\">" + escapeHtml(item.year) + "</span>" +
      "<span class=\"play-hover\">▶</span>" +
      "<div class=\"card-gradient\"></div>" +
      "<div class=\"card-caption\"><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.genre) + "</p></div>" +
      "</div></a></article>";
  }

  function initSearchPage() {
    var data = window.SEARCH_DATA;
    var input = document.querySelector("[data-search-page-input]");
    var results = document.getElementById("search-results");
    if (!data || !input || !results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var q = normalize(query);
      if (!q) {
        results.innerHTML = data.slice(0, 30).map(resultCard).join("");
        return;
      }
      var matches = data.filter(function (item) {
        return normalize(item.search).indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = matches.map(resultCard).join("");
    }

    render(initialQuery);
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initLocalFilter();
    initPlayer();
    initSearchPage();
  });
})();
