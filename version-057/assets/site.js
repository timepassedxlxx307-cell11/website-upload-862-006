(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function initFilter() {
    var input = document.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        card.classList.toggle('is-hidden', keyword.length > 0 && text.indexOf(keyword) === -1);
      });
    });
  }

  function initSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.querySelector('[data-search-page-input]');
    if (!results || !input || !window.SITE_CATALOG) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    function render(items, keyword) {
      var note = document.querySelector('[data-search-note]');
      if (note) {
        note.textContent = keyword ? '已为你匹配相关影片。' : '热门内容先行展示。';
      }
      if (!items.length) {
        results.innerHTML = '<div class="no-results">没有找到相关影片。</div>';
        return;
      }
      results.innerHTML = items.slice(0, 120).map(function (movie) {
        return [
          '<article class="movie-card">',
          '<a class="poster" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
          '<span class="poster-play">▶</span>',
          '</a>',
          '<div class="card-body">',
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '<p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
          '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }
    function match(keyword) {
      var normalized = keyword.trim().toLowerCase();
      if (!normalized) {
        return window.SITE_CATALOG.slice(0, 24);
      }
      return window.SITE_CATALOG.filter(function (movie) {
        return movie.search.indexOf(normalized) !== -1;
      });
    }
    render(match(query), query);
    input.addEventListener('input', function () {
      render(match(input.value), input.value);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
    players.forEach(function (video) {
      var panel = video.closest('.player-panel');
      var button = panel ? panel.querySelector('.player-start') : null;
      var source = video.querySelector('source');
      var url = source ? source.getAttribute('src') : '';
      if (url && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (url && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            if (panel) {
              panel.classList.add('is-playing');
            }
          }).catch(function () {
            if (panel) {
              panel.classList.remove('is-playing');
            }
          });
        } else if (panel) {
          panel.classList.add('is-playing');
        }
      }
      if (button) {
        button.addEventListener('click', playVideo);
      }
      video.addEventListener('play', function () {
        if (panel) {
          panel.classList.add('is-playing');
        }
      });
      video.addEventListener('pause', function () {
        if (panel) {
          panel.classList.remove('is-playing');
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilter();
    initSearchPage();
    initPlayers();
  });
})();
