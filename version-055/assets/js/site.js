(function () {
    var menuButton = document.querySelector('.menu-toggle');

    if (menuButton) {
        menuButton.addEventListener('click', function () {
            document.body.classList.toggle('menu-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;
    var sliderTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        sliderTimer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            window.clearInterval(sliderTimer);
            showSlide(Number(dot.getAttribute('data-slide-target')) || 0);
            startSlider();
        });
    });

    startSlider();

    var filterInput = document.querySelector('.filter-input');
    var filterType = document.querySelector('.filter-type');
    var filterYear = document.querySelector('.filter-year');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-results .movie-card'));

    function applyFilters() {
        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var type = filterType ? filterType.value : '';
        var year = filterYear ? filterYear.value : '';

        filterCards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-genre') || ''
            ].join(' ').toLowerCase();
            var okQuery = !query || text.indexOf(query) !== -1;
            var okType = !type || (card.getAttribute('data-type') || '') === type;
            var okYear = !year || (card.getAttribute('data-year') || '') === year;
            card.style.display = okQuery && okType && okYear ? '' : 'none';
        });
    }

    [filterInput, filterType, filterYear].forEach(function (field) {
        if (field) {
            field.addEventListener('input', applyFilters);
            field.addEventListener('change', applyFilters);
        }
    });

    var searchForm = document.querySelector('.search-page-form');
    var searchInput = document.querySelector('.search-page-input');
    var searchResults = document.querySelector('.search-results');
    var searchSummary = document.querySelector('.search-summary');

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card">' +
            '<a href="' + movie.href + '" class="movie-poster" aria-label="观看' + escapeHtml(movie.title) + '">' +
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="poster-shade"></span>' +
                '<span class="play-chip">播放</span>' +
            '</a>' +
            '<div class="movie-info">' +
                '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                '<h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>' +
                '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
                '<div class="tag-list">' + tags + '</div>' +
            '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function renderSearch() {
        if (!searchResults || !window.SEARCH_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (searchInput && searchInput.value ? searchInput.value : params.get('q') || '').trim();

        if (searchInput) {
            searchInput.value = query;
        }

        var lower = query.toLowerCase();
        var results = window.SEARCH_MOVIES.filter(function (movie) {
            if (!lower) {
                return true;
            }

            return [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase().indexOf(lower) !== -1;
        }).slice(0, 120);

        searchResults.innerHTML = results.map(movieCard).join('');

        if (searchSummary) {
            searchSummary.textContent = query ? '与“' + query + '”相关的影片' : '精选影片';
        }
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = searchInput ? searchInput.value.trim() : '';
            var url = new URL(window.location.href);
            if (query) {
                url.searchParams.set('q', query);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState(null, '', url.toString());
            renderSearch();
        });

        renderSearch();
    }
})();
