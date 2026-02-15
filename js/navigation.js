(() => {
  "use strict";

  const STORAGE_KEY = "plantHunterState";

  const defaultState = {
    currentPage: "01-cover",
    pageHistory: [],
    visitedPages: [],
    completedScenes: [],
    audioEnabled: true,
    volume: 0.5,
    lastVisitTime: null
  };

  const gameState = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...defaultState };
      }
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed };
    } catch (err) {
      console.warn("读取存档失败，使用默认状态", err);
      return { ...defaultState };
    }
  }

  function saveState() {
    try {
      const payload = { ...gameState, lastVisitTime: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("保存存档失败", err);
    }
  }

  function recordVisit(pageId) {
    if (!gameState.visitedPages.includes(pageId)) {
      gameState.visitedPages.push(pageId);
    }
  }

  function navigateTo(pageId, animation = "fade") {
    if (!pageId) return;

    gameState.pageHistory.push(gameState.currentPage);
    gameState.currentPage = pageId;
    recordVisit(pageId);

    const event = new CustomEvent("plant-hunter:navigate", {
      detail: { pageId, animation }
    });
    document.dispatchEvent(event);
    saveState();
  }

  function navigateBack() {
    const previous = gameState.pageHistory.pop();
    if (!previous) return;

    gameState.currentPage = previous;
    const event = new CustomEvent("plant-hunter:navigate", {
      detail: { pageId: previous, animation: "backward" }
    });
    document.dispatchEvent(event);
    saveState();
  }

  function resetToHome() {
    gameState.pageHistory = [];
    navigateTo("02-nav-main", "fade");
  }

  function setAudioEnabled(enabled) {
    gameState.audioEnabled = enabled;
    saveState();
  }

  function setVolume(volume) {
    gameState.volume = volume;
    saveState();
  }

  window.PlantHunterNavigation = {
    gameState,
    navigateTo,
    navigateBack,
    resetToHome,
    saveState,
    setAudioEnabled,
    setVolume
  };
})();
