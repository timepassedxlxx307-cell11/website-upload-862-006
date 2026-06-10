(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (header) {
            var syncHeader = function () {
                if (window.scrollY > 18) {
                    header.classList.add("is-scrolled");
                } else {
                    header.classList.remove("is-scrolled");
                }
            };
            syncHeader();
            window.addEventListener("scroll", syncHeader, { passive: true });
        }

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                var open = nav.classList.toggle("is-open");
                toggle.classList.toggle("is-open", open);
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }
    }

    function setupHeroSliders() {
        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var previous = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            if (!slides.length) {
                return;
            }

            function activate(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    activate(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    activate(dotIndex);
                    start();
                });
            });

            if (previous) {
                previous.addEventListener("click", function () {
                    activate(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    activate(index + 1);
                    start();
                });
            }

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            activate(0);
            start();
        });
    }

    function setupCategoryTabs() {
        document.querySelectorAll("[data-index-category-tabs]").forEach(function (scope) {
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-index-category-button]"));
            var panels = Array.prototype.slice.call(scope.querySelectorAll("[data-index-category-panel]"));

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var key = button.getAttribute("data-index-category-button");
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    panels.forEach(function (panel) {
                        panel.classList.toggle("active", panel.getAttribute("data-index-category-panel") === key);
                    });
                });
            });
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".filterable-card"));
            var empty = scope.querySelector("[data-filter-empty]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
            var redirect = scope.querySelector("[data-filter-redirect]");

            function normalize(value) {
                return (value || "").toString().trim().toLowerCase();
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var active = 0;
                cards.forEach(function (card) {
                    var visible = true;
                    var searchText = normalize(card.getAttribute("data-search"));
                    if (query && searchText.indexOf(query) === -1) {
                        visible = false;
                    }
                    selects.forEach(function (select) {
                        var key = select.getAttribute("data-filter-select");
                        var value = normalize(select.value);
                        if (value && normalize(card.getAttribute("data-" + key)) !== value) {
                            visible = false;
                        }
                    });
                    card.classList.toggle("hidden-by-filter", !visible);
                    if (visible) {
                        active += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", active === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                if (query) {
                    input.value = query;
                }
            }

            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });

            if (redirect) {
                redirect.addEventListener("change", function () {
                    if (redirect.value) {
                        window.location.href = "./category-" + redirect.value + ".html";
                    }
                });
            }

            apply();
        });
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-toggle]");
            var error = player.querySelector("[data-player-error]");
            var src = player.getAttribute("data-src");
            var hlsInstance = null;

            function showError(message) {
                if (error) {
                    error.textContent = message;
                    error.classList.add("is-visible");
                }
            }

            function hideError() {
                if (error) {
                    error.textContent = "";
                    error.classList.remove("is-visible");
                }
            }

            if (!video || !src) {
                showError("视频暂时无法播放");
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError("视频暂时无法播放");
                    }
                });
            } else {
                showError("此浏览器暂无法播放该视频");
            }

            function playOrPause() {
                hideError();
                if (video.paused) {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            showError("点击后再次播放");
                        });
                    }
                } else {
                    video.pause();
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.stopPropagation();
                    playOrPause();
                });
            }

            player.addEventListener("click", function (event) {
                if (event.target && event.target.closest("button")) {
                    return;
                }
                playOrPause();
            });

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });

            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupHeader();
        setupHeroSliders();
        setupCategoryTabs();
        setupFilters();
        setupPlayers();
    });
})();
