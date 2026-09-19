(function () {
  'use strict';

  var stage = document.getElementById('stage');
  var env = document.getElementById('env');
  var cover = document.getElementById('cover');
  var voice = document.getElementById('voice');
  var playBtn = document.getElementById('playBtn');
  var icoPlay = document.getElementById('icoPlay');
  var icoPause = document.getElementById('icoPause');
  var icoReplay = document.getElementById('icoReplay');
  var voiceStatus = document.getElementById('voiceStatus');
  var voiceTime = document.getElementById('voiceTime');
  var audioNote = document.getElementById('audioNote');
  var row = document.querySelector('.voice-row');

  var PHOTOS = ['photo/photo.jpg'];

  var reduced = false;
  try {
    reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { reduced = false; }

  var opened = false;

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
      setTimeout(function () {
        cover.style.display = 'none';
      }, 700);
    }, delay);
  }

  env.addEventListener('click', tearOpen);
  env.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && !opened) tearOpen();
  });

  var carousel = document.getElementById('carousel');
  var dotsBox = document.getElementById('dots');
  var prevPhoto = document.getElementById('prevPhoto');
  var nextPhoto = document.getElementById('nextPhoto');
  var modal = document.getElementById('photoModal');
  var modalImg = document.getElementById('modalImg');
  var modalClose = document.getElementById('modalClose');
  var modalPrev = document.getElementById('modalPrev');
  var modalNext = document.getElementById('modalNext');

  var cur = 0;
  var many = PHOTOS.length > 1;
  var timer = null;
  var modalOpen = false;

  function buildCarousel() {
    PHOTOS.forEach(function (src, i) {
      var d = document.createElement('div');
      d.className = 'slide' + (i === 0 ? ' on' : '');
      var img = document.createElement('img');
      img.src = src;
      img.alt = 'صورة ' + (i + 1);
      img.addEventListener('error', function () {
        d.innerHTML = '<div class="photo-ph heart"></div>';
      });
      d.appendChild(img);
      d.addEventListener('click', function () {
        showModal(i);
      });
      carousel.appendChild(d);

      if (many) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'صورة ' + (i + 1));
        if (i === 0) b.className = 'on';
        b.addEventListener('click', function () {
          go(i, true);
        });
        dotsBox.appendChild(b);
      }
    });
    prevPhoto.classList.toggle('show', many);
    nextPhoto.classList.toggle('show', many);
  }

  function go(i, restart) {
    var slides = carousel.querySelectorAll('.slide');
    var dots = dotsBox.querySelectorAll('button');
    var n = PHOTOS.length;
    var last = cur;
    cur = (((i % n) + n) % n);
    slides[last].classList.remove('on');
    slides[cur].classList.add('on');
    for (var j = 0; j < dots.length; j++) {
      dots[j].classList.toggle('on', j === cur);
    }
    if (restart && many) {
      stopAuto();
      startAuto();
    }
  }

  function startAuto() {
    if (!many || modalOpen) return;
    stopAuto();
    timer = setInterval(function () {
      go(cur + 1, false);
    }, 5000);
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function showModal(i) {
    go(i, false);
    modalImg.src = PHOTOS[cur];
    modal.classList.add('open');
    modalOpen = true;
    stopAuto();
    modalPrev.classList.toggle('hide', !many);
    modalNext.classList.toggle('hide', !many);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modalOpen = false;
    document.body.style.overflow = '';
    if (many) startAuto();
  }

  modalPrev.addEventListener('click', function (e) {
    e.stopPropagation();
    showModal(cur - 1);
  });
  modalNext.addEventListener('click', function (e) {
    e.stopPropagation();
    showModal(cur + 1);
  });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  prevPhoto.addEventListener('click', function () {
    go(cur - 1, true);
  });
  nextPhoto.addEventListener('click', function () {
    go(cur + 1, true);
  });

  buildCarousel();
  if (many) startAuto();

  var audioDuration = 0;

  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var s = Math.round(t);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function setState(st) {
    icoPlay.hidden = !(st === 'idle' || st === 'paused');
    icoPause.hidden = st !== 'playing';
    icoReplay.hidden = st !== 'ended';
    row.classList.toggle('js-playing', st === 'playing');
    if (st === 'idle') {
      voiceStatus.textContent = 'تشغيل';
      voiceTime.textContent = fmt(audioDuration);
    } else if (st === 'paused') {
      voiceStatus.textContent = 'استمرار';
      voiceTime.textContent = fmt(voice.currentTime);
    } else if (st === 'ended') {
      voiceStatus.textContent = 'إعادة تشغيل';
      voiceTime.textContent = fmt(audioDuration);
    }
  }

  function onMeta() {
    if (isFinite(voice.duration)) audioDuration = voice.duration;
    if (voice.paused) setState('idle');
  }

  voice.addEventListener('loadedmetadata', onMeta);
  voice.addEventListener('durationchange', onMeta);
  voice.addEventListener('play', function () {
    setState('playing');
  });
  voice.addEventListener('pause', function () {
    if (voice.ended) setState('ended');
    else setState('paused');
  });
  voice.addEventListener('ended', function () {
    setState('ended');
  });
  voice.addEventListener('timeupdate', function () {
    if (!voice.paused) voiceTime.textContent = fmt(voice.currentTime);
  });
  voice.addEventListener('error', showAudioNote, false);

  playBtn.addEventListener('click', toggleAudio);

  function toggleAudio() {
    if (voice.error) { showAudioNote(); return; }
    if (voice.ended) voice.currentTime = 0;
    if (voice.paused) {
      var p = voice.play();
      if (p && p.catch) {
        p['catch'](function () {
          voice.load();
          var q = voice.play();
          if (q && q.catch) {
            q['catch'](function () { showAudioNote(); });
          }
        });
      }
    } else {
      voice.pause();
    }
  }

  function showAudioNote() {
    voiceStatus.textContent = 'خطأ';
    audioNote.style.display = 'block';
  }

  setState('idle');
})();