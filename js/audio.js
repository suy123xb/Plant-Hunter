(() => {
  "use strict";

  const audioConfig = {
    background: {
      file: "assets/audio/bg-music.mp3",
      loop: true,
      volume: 0.3
    },
    sceneAmbient: {
      forest: "assets/audio/forest-ambient.mp3",
      grass: "assets/audio/grass-ambient.mp3",
      water: "assets/audio/water-ambient.mp3",
      sand: "assets/audio/sand-ambient.mp3"
    },
    sfx: {
      click: "assets/audio/sfx-click.mp3",
      hover: "assets/audio/sfx-hover.mp3"
    }
  };

  let bgAudio = null;
  let ambientAudio = null;

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

  function playBackground() {
    const { audioEnabled, volume } = window.PlantHunterNavigation.gameState;
    if (!audioEnabled) return;

    const audio = ensureBackground();
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.play().catch((err) => {
      console.warn("背景音乐播放失败", err);
    });
  }

  function stopBackground() {
    if (!bgAudio) return;
    bgAudio.pause();
  }

  function switchAmbient(sceneKey) {
    if (!sceneKey) return;
    const { audioEnabled, volume } = window.PlantHunterNavigation.gameState;
    if (!audioEnabled) return;

    const src = audioConfig.sceneAmbient[sceneKey];
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

  function toggleAudio() {
    const { audioEnabled } = window.PlantHunterNavigation.gameState;
    const newValue = !audioEnabled;
    window.PlantHunterNavigation.setAudioEnabled(newValue);

    if (newValue) {
      playBackground();
    } else {
      stopBackground();
      if (ambientAudio) ambientAudio.pause();
    }
    return newValue;
  }

  window.PlantHunterAudio = {
    playBackground,
    stopBackground,
    switchAmbient,
    playSFX,
    toggleAudio
  };
})();
