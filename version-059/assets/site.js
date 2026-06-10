document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector("[data-site-header]");
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("is-open");
            menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var next = carousel.querySelector("[data-hero-next]");
        var prev = carousel.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });

        show(0);
        play();
    });

    document.querySelectorAll("[data-card-search]").forEach(function (input) {
        var section = input.closest("section") || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
        var empty = section.querySelector("[data-empty-state]");

        function filterCards() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "") + " " + card.textContent).toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        input.addEventListener("input", filterCards);
        filterCards();
    });

    document.querySelectorAll("[data-player-box]").forEach(function (box) {
        var video = box.querySelector("video[data-src]");
        var button = box.querySelector("[data-player-start]");
        var source = video ? video.getAttribute("data-src") : "";
        var initialized = false;
        var hls = null;

        function attachSource() {
            if (!video || !source || initialized) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            initialized = true;
        }

        function startVideo() {
            if (!video) {
                return;
            }
            attachSource();
            if (button) {
                button.hidden = true;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (button) {
                        button.hidden = false;
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", startVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!initialized) {
                    startVideo();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.hidden = true;
                }
            });
            video.addEventListener("pause", function () {
                if (button && video.currentTime === 0) {
                    button.hidden = false;
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    });
});
