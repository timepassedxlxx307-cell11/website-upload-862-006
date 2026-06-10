(function () {
    window.initMoviePlayer = function (options) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var source = options && options.source ? options.source : '';
        var attached = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                attached = true;
                return;
            }

            video.src = source;
            attached = true;
        }

        function playVideo() {
            attachSource();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
