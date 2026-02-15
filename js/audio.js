(() => {
  "use strict";

  const audioConfig = {
    background: {
      file: "assets/audio/游戏整体BGM（全局播放）.mp3",
      loop: true,
      volume: 0.5
    },
    sfx: {
      click: "assets/audio/按钮（热区点击音效）.mp3"
    },
    narration: {
      "01-cover": "assets/audio/主页面打开时（AI欢迎语）.wav",
      "03-background-info": "assets/audio/背景资料页(AI简单介绍语).wav",
      "04-map-detail": "assets/audio/游戏地图页（AI引导词）.mp3",
      "05-forest-intro": "assets/audio/林之境介绍页（AI引导语）.mp3",
      "06-grass-intro": "assets/audio/草之境介绍页（AI引导语）.wav",
      "07-water-intro": "assets/audio/水之境介绍页（AI引导语）.mp3",
      "08-sand-intro": "assets/audio/沙之境介绍页（AI引导语）.wav"
    }
  };

  let bgAudio = null;
  let ambientAudio = null;
  let narrationAudio = null;
  let narrationToken = 0;
  let musicScale = 1;

  function createAudio(src, loop, volume) {
    const audio = new Audio(src);
    audio.loop = Boolean(loop);
    audio.volume = volume;
    audio.preload = "auto";
    return audio;
  }

  function ensureBackground() {
    if (!bgAudio) {
      bgAudio = createAudio(
        audioConfig.background.file,
        audioConfig.background.loop,
        audioConfig.background.volume
      );
    }
    return bgAudio;
  }

  function getBaseVolume() {
    const { volume } = window.PlantHunterNavigation.gameState;
    return Math.min(1, Math.max(0, volume));
  }

  function applyMusicVolume(scale = 1) {
    musicScale = scale;
    const finalVolume = getBaseVolume() * scale;
    if (bgAudio) bgAudio.volume = finalVolume;
    if (ambientAudio) ambientAudio.volume = finalVolume;
  }

  function playBackground() {
    const { audioEnabled } = window.PlantHunterNavigation.gameState;
    if (!audioEnabled) return;

    const audio = ensureBackground();
    applyMusicVolume(musicScale);
    audio.play().catch((err) => {
      console.warn("背景音乐播放失败", err);
    });
  }

  function stopBackground() {
    if (!bgAudio) return;
    bgAudio.pause();
  }

  function switchAmbient(sceneKey) {
    if (!sceneKey) {
      if (ambientAudio) {
        ambientAudio.pause();
        ambientAudio = null;
      }
      return;
    }
    const { audioEnabled, volume } = window.PlantHunterNavigation.gameState;
    if (!audioEnabled) return;

    // 当前版本未配置独立场景环境音，保留接口但不强制播放。
    const src = null;
    if (!src) return;

    if (ambientAudio) {
      ambientAudio.pause();
    }
    ambientAudio = createAudio(src, true, Math.min(1, Math.max(0, volume)));
    ambientAudio.play().catch((err) => {
      console.warn("环境音播放失败", err);
    });
  }

  function playSFX(type) {
    const { audioEnabled } = window.PlantHunterNavigation.gameState;
    if (!audioEnabled) return;

    const src = audioConfig.sfx[type];
    if (!src) return;

    const sfx = createAudio(src, false, 0.6);
    sfx.play().catch(() => null);
  }

  function syncMusicVolume() {
    applyMusicVolume(musicScale);
  }

  function stopNarration() {
    narrationToken += 1;
    if (narrationAudio) {
      narrationAudio.pause();
      narrationAudio = null;
    }
    applyMusicVolume(1);
  }

  function playNarrationForPage(pageId) {
    const { audioEnabled } = window.PlantHunterNavigation.gameState;
    if (!audioEnabled) return;

    const src = audioConfig.narration[pageId];
    if (!src) {
      stopNarration();
      return;
    }

    stopNarration();
    const token = narrationToken;
    const voice = createAudio(src, false, 1);
    narrationAudio = voice;
    applyMusicVolume(0.35);

    const restore = () => {
      if (token !== narrationToken) return;
      narrationAudio = null;
      applyMusicVolume(1);
    };

    voice.addEventListener("ended", restore, { once: true });
    voice.addEventListener("error", restore, { once: true });
    voice.play().catch((err) => {
      console.warn("AI语音播放失败", err);
      restore();
    });
  }

  function toggleAudio() {
    const { audioEnabled } = window.PlantHunterNavigation.gameState;
    if (audioEnabled) {
      const audio = ensureBackground();
      if (audio.paused) {
        // Autoplay may have been blocked; first click should resume instead of muting.
        playBackground();
        if (narrationAudio && narrationAudio.paused) {
          narrationAudio.play().catch(() => null);
        }
        return true;
      }
    }

    const nextValue = !audioEnabled;
    window.PlantHunterNavigation.setAudioEnabled(nextValue);

    if (nextValue) {
      playBackground();
    } else {
      stopNarration();
      stopBackground();
      if (ambientAudio) ambientAudio.pause();
    }
    return nextValue;
  }

  function resumeAudioByUserGesture() {
    const { audioEnabled } = window.PlantHunterNavigation.gameState;
    if (!audioEnabled) return;
    if (!bgAudio || bgAudio.paused) {
      playBackground();
    }
  }

  window.PlantHunterAudio = {
    playBackground,
    stopBackground,
    switchAmbient,
    playSFX,
    playNarrationForPage,
    stopNarration,
    syncMusicVolume,
    resumeAudioByUserGesture,
    toggleAudio
  };
})();
