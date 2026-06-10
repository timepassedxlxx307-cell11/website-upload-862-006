(function () {
    window.initPlayer = function (streamUrl) {
        var shell = document.querySelector('.player-shell');
        var video = document.querySelector('.site-video');
        var button = document.querySelector('.play-overlay');
        var ready = false;
        var hls = null;

        if (!shell || !video || !button || !streamUrl) {
            return;
        }

        function attachMedia() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function playVideo() {
            attachMedia();
            shell.classList.add('playing');
            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {
                    shell.classList.remove('playing');
                });
            }
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('playing');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
