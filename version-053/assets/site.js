(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dots button'));
  if (slides.length > 1) {
    let index = 0;
    const show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  const searchRoot = document.querySelector('[data-search-results]');
  if (searchRoot && window.MV_SEARCH) {
    const form = document.querySelector('[data-search-form]');
    const input = document.querySelector('[data-search-input]');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    const escapeHtml = function (value) {
      return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    };
    const card = function (item) {
      const img = './' + item.image + '.jpg';
      return '<article class="movie-card">' +
        '<a href="' + escapeHtml(item.url) + '" class="movie-thumb">' +
        '<div class="poster-frame"><img src="' + escapeHtml(img) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.remove()"></div>' +
        '<span class="play-badge">播放</span></a>' +
        '<div class="movie-info"><h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.one) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div>' +
        '</article>';
    };
    const render = function (query) {
      const q = String(query || '').trim().toLowerCase();
      if (!q) {
        searchRoot.innerHTML = '<p class="empty-text">输入片名、题材、地区或年份，立即查找想看的内容。</p>';
        return;
      }
      const words = q.split(/\s+/).filter(Boolean);
      const results = window.MV_SEARCH.filter(function (item) {
        const hay = [item.title, item.genre, item.tags, item.region, item.type, item.year, item.one].join(' ').toLowerCase();
        return words.every(function (word) {
          return hay.indexOf(word) !== -1;
        });
      }).slice(0, 80);
      if (!results.length) {
        searchRoot.innerHTML = '<p class="empty-text">没有找到匹配内容，换个关键词再试试。</p>';
        return;
      }
      searchRoot.innerHTML = '<div class="movie-grid">' + results.map(card).join('') + '</div>';
    };
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const value = input ? input.value : '';
        const nextUrl = value ? '?q=' + encodeURIComponent(value) : window.location.pathname;
        window.history.replaceState(null, '', nextUrl);
        render(value);
      });
    }
    render(initial);
  }
})();
