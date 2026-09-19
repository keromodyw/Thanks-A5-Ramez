(function () {
  'use strict';

  var stage = document.getElementById('stage');
  var env = document.getElementById('env');
  var cover = document.getElementById('cover');
  var card = document.getElementById('card');
  var voice = document.getElementById('voice');
  var playBtn = document.getElementById('playBtn');
  var playLabel = document.getElementById('playLabel');
  var eq = document.getElementById('eq');
  var audioNote = document.getElementById('audioNote');

  var reduced = false;
  try {
    reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { reduced = false; }

  var opened = false;

  window.swapPhoto = function () {
    var f = document.getElementById('photoFrame');
    f.innerHTML = '<div class="photo-ph heart"></div>';
  };

  function tearOpen() {
    if (opened) return;
    opened = true;

    if (reduced) {
      env.classList.add('torn');
      openMessage(260);
      return;
    }

    env.classList.add('press', 'shake');
    setTimeout(function () {
      env.classList.remove('press');
      env.classList.add('torn');
      openMessage(200);
    }, 90);
  }

  function openMessage(delay) {
    setTimeout(function () {
      stage.classList.add('hidden');
      card.classList.add('show');
      setTimeout(function () {
        cover.style.display = 'none';
      }, 700);
    }, delay);
  }

  env.addEventListener('click', tearOpen);
  env.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && !opened) tearOpen();
  });

  playBtn.addEventListener('click', toggleAudio);
  voice.addEventListener('play', function () { eq.classList.add('playing'); playLabel.textContent = 'الفويس شغّال…'; });
  voice.addEventListener('pause', function () { eq.classList.remove('playing'); playLabel.textContent = 'استمع للفويس نوت'; });
  voice.addEventListener('ended', function () { eq.classList.remove('playing'); playLabel.textContent = 'استمع تاني'; });
  voice.addEventListener('error', showAudioNote, false);

  function toggleAudio() {
    if (voice.readyState === 0 && voice.error === null && !voice.currentSrc) {
      return;
    }
    if (voice.error) { showAudioNote(); return; }
    if (voice.paused) {
      var p = voice.play();
      if (p && p.catch) {
        p.catch(function () {
          voice.load();
          voice.play()['catch'](function () { showAudioNote(); });
        });
      }
    } else {
      voice.pause();
    }
  }

  function showAudioNote() {
    playLabel.textContent = 'الفويس لسه مضاف';
    audioNote.style.display = 'block';
  }
})();