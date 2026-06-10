function ready(callback) {
    if (document.readyState !== "loading") {
        callback();
        return;
    }
    document.addEventListener("DOMContentLoaded", callback);
}

function text(value) {
    return String(value || "");
}

function escapeHtml(value) {
    return text(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setupMenu() {
    const button = document.querySelector(".menu-toggle");
    const panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
        return;
    }
    button.addEventListener("click", function () {
        const open = panel.classList.toggle("is-open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
    });
}

function setupHero() {
    const slider = document.querySelector(".hero-slider");
    if (!slider) {
        return;
    }
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    const prev = slider.querySelector(".hero-prev");
    const next = slider.querySelector(".hero-next");
    if (!slides.length) {
        return;
    }
    let index = 0;
    let timer = 0;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === index);
        });
    }

    function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    if (prev) {
        prev.addEventListener("click", function () {
            show(index - 1);
            restart();
        });
    }
    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            restart();
        });
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            show(i);
            restart();
        });
    });
    restart();
}

function setupCategoryFilter() {
    const input = document.querySelector(".category-filter");
    const list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
        return;
    }
    const cards = Array.from(list.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
        const keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
            const haystack = card.textContent.toLowerCase();
            card.style.display = !keyword || haystack.includes(keyword) ? "" : "none";
        });
    });
}

function setupPlayer() {
    const players = document.querySelectorAll(".movie-player[data-stream]");
    players.forEach(function (player) {
        const video = player.querySelector("video");
        const overlay = player.querySelector(".player-overlay");
        const streamUrl = player.getAttribute("data-stream");
        let mounted = false;
        let hls = null;

        function mount() {
            if (!video || !streamUrl) {
                return;
            }
            if (!mounted) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                mounted = true;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            const promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", mount);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!mounted) {
                    mount();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    });
}

function renderSearchCard(movie) {
    const meta = [movie.type, movie.region, movie.year].filter(Boolean).map(function (item) {
        return "<span>" + escapeHtml(item) + "</span>";
    }).join("");
    return "<a class="movie-card" href="./" + escapeHtml(movie.file) + "">" +
        "<span class="poster-frame">" +
        "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
        "<span class="poster-shade"></span>" +
        "<span class="poster-play">▶</span>" +
        "</span>" +
        "<span class="movie-card-body">" +
        "<strong>" + escapeHtml(movie.title) + "</strong>" +
        "<em>" + escapeHtml(movie.oneLine) + "</em>" +
        "<span class="movie-meta">" + meta + "</span>" +
        "</span>" +
        "</a>";
}

function setupSearchPage() {
    const results = document.getElementById("search-results");
    const heading = document.getElementById("search-heading");
    const input = document.getElementById("search-input");
    if (!results || !heading || !window.SEARCH_INDEX) {
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = text(params.get("q")).trim();
    if (input) {
        input.value = query;
    }
    const pool = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
    const keyword = query.toLowerCase();
    const matched = keyword
        ? pool.filter(function (movie) {
            return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
                .join(" ")
                .toLowerCase()
                .includes(keyword);
        })
        : pool.slice(0, 96);
    heading.textContent = keyword ? "搜索结果" : "热门推荐";
    results.innerHTML = matched.length
        ? matched.map(renderSearchCard).join("")
        : "<div class="panel-card"><h2>未找到相关影视作品</h2><p>可以尝试更换片名、地区、类型或年份关键词。</p></div>";
}

ready(function () {
    setupMenu();
    setupHero();
    setupCategoryFilter();
    setupPlayer();
    setupSearchPage();
});
