const box = document.querySelector('[data-player-box]');
const video = document.querySelector('[data-video]');
const trigger = document.querySelector('[data-play-trigger]');
let engine = null;
let ready = false;

function prepare() {
  if (!video || ready) {
    return;
  }
  const source = video.getAttribute('data-stream') || '';
  if (!source) {
    return;
  }
  const H = window.HlsEngine;
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (H && H.isSupported()) {
    engine = new H({
      autoStartLoad: true,
      capLevelToPlayerSize: true
    });
    engine.loadSource(source);
    engine.attachMedia(video);
  } else {
    video.src = source;
  }
  ready = true;
}

function start() {
  prepare();
  if (box) {
    box.classList.add('is-playing');
  }
  if (video) {
    const playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }
}

if (trigger) {
  trigger.addEventListener('click', start);
}

if (video) {
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    if (box) {
      box.classList.add('is-playing');
    }
  });
}

window.addEventListener('beforeunload', function () {
  if (engine) {
    engine.destroy();
  }
});
