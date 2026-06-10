(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }
    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-video-url");
      var hls = null;
      if (!video || !source) {
        return;
      }
      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }
      function attachSource() {
        if (video.getAttribute("data-source-ready") === "true") {
          return;
        }
        setStatus("正在加载视频");
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.setAttribute("data-source-ready", "true");
            setStatus("");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus("网络连接不稳定，正在重试");
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus("视频解码异常，正在恢复");
              hls.recoverMediaError();
            } else {
              setStatus("视频暂时无法播放，请稍后重试");
              hls.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.setAttribute("data-source-ready", "true");
          setStatus("");
        } else {
          setStatus("当前浏览器不支持该播放格式");
        }
      }
      function playVideo() {
        attachSource();
        player.classList.add("player-active");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("player-active");
          });
        }
      }
      if (button) {
        button.addEventListener("click", playVideo);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("player-active");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          return;
        }
        player.classList.remove("player-active");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-shell\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('image-missing')\">" +
      "<span class=\"corner-badge\">" + escapeHtml(movie.year) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<a class=\"movie-title\" href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>" +
      "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!input || !results || !data.length) {
      return;
    }
    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }
    function render(items) {
      results.innerHTML = items.slice(0, 80).map(renderSearchCard).join("");
    }
    function update() {
      var query = normalize(input.value);
      if (!query) {
        render(data.slice(0, 24));
        return;
      }
      var words = query.split(/\s+/).filter(Boolean);
      var matched = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" "));
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      });
      render(matched);
    }
    input.addEventListener("input", update);
    render(data.slice(0, 24));
  }

  ready(function () {
    initMenu();
    initHero();
    initPlayer();
    initSearch();
  });
})();
