(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll('.scroll-row-wrap').forEach(function (wrap) {
        var row = wrap.querySelector('[data-scroll-row]');
        var left = wrap.querySelector('[data-scroll-left]');
        var right = wrap.querySelector('[data-scroll-right]');

        if (!row) {
            return;
        }

        if (left) {
            left.addEventListener('click', function () {
                row.scrollBy({ left: -420, behavior: 'smooth' });
            });
        }

        if (right) {
            right.addEventListener('click', function () {
                row.scrollBy({ left: 420, behavior: 'smooth' });
            });
        }
    });

    function filterCards(input) {
        var scope = document.querySelector('[data-filter-scope]');

        if (!scope) {
            return;
        }

        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            card.setAttribute('data-hidden', query && text.indexOf(query) === -1 ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
        input.addEventListener('input', function () {
            filterCards(input);
        });
    });

    var searchInput = document.getElementById('search-page-input');

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        searchInput.value = q;
        filterCards(searchInput);
    }
})();
