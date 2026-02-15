(() => {
  "use strict";

  const { navigateTo, navigateBack, resetToHome, gameState, setVolume } = window.PlantHunterNavigation;
  const { playBackground, switchAmbient, playSFX, toggleAudio, playNarrationForPage, syncMusicVolume, resumeAudioByUserGesture } = window.PlantHunterAudio;

  const pageContent = document.getElementById("pageContent");
  const body = document.body;
  const loader = document.getElementById("loader");
  const sceneMenu = document.getElementById("sceneMenu");
  const sceneMenuGrid = document.getElementById("sceneMenuGrid");
  const navVolume = document.getElementById("navVolume");
  const debugPanel = document.getElementById("debugPanel");
  const debugPageSelect = document.getElementById("debugPageSelect");
  const debugHotspotSelect = document.getElementById("debugHotspotSelect");
  const debugPickButton = document.getElementById("debugPick");
  const debugWidthInput = document.getElementById("debugWidth");
  const debugHeightInput = document.getElementById("debugHeight");
  const debugLabelInput = document.getElementById("debugLabel");
  const debugCopyButton = document.getElementById("debugCopy");
  const debugClearButton = document.getElementById("debugClear");
  const debugExportButton = document.getElementById("debugExport");
  const debugOutput = document.getElementById("debugOutput");
  const debugToast = document.getElementById("debugToast");

  const pages = {
    "01-cover": { image: "assets/images/01-cover.png", title: "封面" },
    "02-nav-main": { image: "assets/images/02-nav-main.png", title: "主导航" },
    "03-background-info": { image: "assets/images/03-background-info.png", title: "背景资料" },
    "04-map-detail": { image: "assets/images/04-map-detail.png", title: "地图详情" },
    "05-forest-intro": { image: "assets/images/05-forest-intro.png", title: "森之境介绍" },
    "05-forest-detail": { image: "assets/images/05-forest-detail.png", title: "森之境详情" },
    "06-grass-intro": { image: "assets/images/06-grass-intro.png", title: "草之境介绍" },
    "06-grass-detail": { image: "assets/images/06-grass-detail.png", title: "草之境详情" },
    "07-water-intro": { image: "assets/images/07-water-intro.png", title: "水之境介绍" },
    "07-water-detail": { image: "assets/images/07-water-detail.png", title: "水之境详情" },
    "08-sand-intro": { image: "assets/images/08-sand-intro.png", title: "沙之境介绍" },
    "08-sand-detail": { image: "assets/images/08-sand-detail.png", title: "沙之境详情" },
    "09-shop-system": { image: "assets/images/09-shop-system.png", title: "积分商城" }
  };

  const sceneOrder = ["forest", "grass", "water", "sand"];
  const HOTSPOT_STORAGE_KEY = "plantHunterHotspots";
  const DEBUG_ENABLED = isDebugEnabled();
  const DEFAULT_VISIBLE_LABEL_IDS = new Set([
    "BACKGROUND_BACK",
    "MAP_FOREST",
    "MAP_GRASS",
    "MAP_WATER",
    "MAP_SAND",
    "MAP_BACK",
    "FOREST_INTRO_BACK",
    "FOREST_NEXT",
    "FOREST_DETAIL_BACK",
    "FOREST_DETAIL_HOME",
    "FOREST_DETAIL_NEXT",
    "GRASS_INTRO_BACK",
    "GRASS_NEXT",
    "GRASS_DETAIL_BACK",
    "GRASS_DETAIL_HOME",
    "GRASS_DETAIL_NEXT",
    "WATER_INTRO_BACK",
    "WATER_NEXT",
    "WATER_DETAIL_BACK",
    "WATER_DETAIL_HOME",
    "WATER_DETAIL_NEXT",
    "SAND_INTRO_BACK",
    "SAND_NEXT",
    "SAND_DETAIL_BACK",
    "SAND_DETAIL_HOME",
    "SAND_DETAIL_NEXT",
    "SHOP_BACK"
  ]);
  const hotspotCatalog = buildHotspotCatalog();
  const hotspotOverrides = loadHotspotOverrides();

  const hotspotsConfig = {
    "01-cover": [
      createHotspot("COVER_START", "开始游戏", 40, 78, 20, 12, () => navigateTo("02-nav-main", "fade"))
    ],
    "02-nav-main": [
      createHotspot("NAV_BACKGROUND", "背景资料", 6, 12, 16, 12, () => navigateTo("03-background-info", "slideLeft")),
      createHotspot("NAV_MAP", "地图", 27, 12, 16, 12, () => navigateTo("04-map-detail", "slideLeft")),
      createHotspot("NAV_SCENES", "场景", 49, 12, 16, 12, () => showSceneMenu()),
      createHotspot("NAV_SHOP", "商城", 70, 12, 16, 12, () => navigateTo("09-shop-system", "slideLeft"))
    ],
    "03-background-info": [
      createHotspot("BACKGROUND_BACK", "返回主导航", 4, 8, 10, 10, () => navigateTo("02-nav-main", "backward"))
    ],
    "04-map-detail": [
      createHotspot("MAP_FOREST", "森林区域", 18, 25, 20, 20, () => navigateTo("05-forest-intro", "zoom")),
      createHotspot("MAP_GRASS", "草原区域", 40, 28, 20, 20, () => navigateTo("06-grass-intro", "zoom")),
      createHotspot("MAP_WATER", "水域区域", 58, 40, 22, 22, () => navigateTo("07-water-intro", "zoom")),
      createHotspot("MAP_SAND", "沙漠区域", 28, 55, 24, 22, () => navigateTo("08-sand-intro", "zoom")),
      createHotspot("MAP_BACK", "返回主导航", 4, 8, 10, 10, () => navigateTo("02-nav-main", "backward"))
    ],
    "09-shop-system": [
      createHotspot("SHOP_BACK", "返回主导航", 4, 8, 10, 10, () => navigateTo("02-nav-main", "backward"))
    ]
  };

  function createSceneHotspots(sceneKey) {
    const introId = `0${sceneOrder.indexOf(sceneKey) + 5}-${sceneKey}-intro`;
    const detailId = `0${sceneOrder.indexOf(sceneKey) + 5}-${sceneKey}-detail`;
    const nextSceneKey = sceneOrder[sceneOrder.indexOf(sceneKey) + 1];
    const nextIntro = nextSceneKey ? `0${sceneOrder.indexOf(nextSceneKey) + 5}-${nextSceneKey}-intro` : "02-nav-main";

    hotspotsConfig[introId] = [
      createHotspot(`${sceneKey.toUpperCase()}_DETAIL`, "查看详情", 68, 42, 20, 14, () => navigateTo(detailId, "slideLeft")),
      createHotspot(`${sceneKey.toUpperCase()}_INTRO_BACK`, "返回主导航", 4, 8, 10, 10, () => navigateTo("02-nav-main", "backward")),
      createHotspot(`${sceneKey.toUpperCase()}_NEXT`, "下一场景", 72, 78, 18, 12, () => navigateTo(nextIntro, "slideLeft"))
    ];

    hotspotsConfig[detailId] = [
      createHotspot(`${sceneKey.toUpperCase()}_DETAIL_BACK`, "返回介绍", 4, 8, 12, 10, () => navigateTo(introId, "backward")),
      createHotspot(`${sceneKey.toUpperCase()}_DETAIL_HOME`, "返回主导航", 6, 80, 16, 12, () => navigateTo("02-nav-main", "backward")),
      createHotspot(`${sceneKey.toUpperCase()}_DETAIL_NEXT`, "下一场景", 72, 78, 18, 12, () => navigateTo(nextIntro, "slideLeft"))
    ];
  }

  sceneOrder.forEach(createSceneHotspots);

  function createHotspot(id, label, x, y, width, height, action, hidden = false, showLabel) {
    return { id, label, x, y, width, height, action, hidden, showLabel };
  }

  function preloadImages(list) {
    return Promise.all(
      list.map((src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`加载失败: ${src}`));
          img.src = src;
        })
      )
    );
  }

  function showLoader() {
    loader.classList.add("show");
  }

  function hideLoader() {
    loader.classList.remove("show");
  }

  let currentWrapper = null;

  function renderPage(pageId, animation) {
    const page = pages[pageId];
    if (!page) {
      console.warn("未知页面", pageId);
      return;
    }

    pageContent.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "page-wrapper";

    const img = document.createElement("img");
    img.src = page.image;
    img.alt = page.title;
    img.className = `page-image ${getTransitionClass(animation)}`;

    wrapper.appendChild(img);
    pageContent.appendChild(wrapper);

    currentWrapper = wrapper;
    wrapper.addEventListener("click", handleDebugClick);

    setupHotspots(pageId, wrapper);
    updateNavBar();
    updateSceneProgress(pageId);
    playNarrationForPage(pageId);
  }

  function setupHotspots(pageId, wrapper) {
    const hotspots = applyHotspotOverrides(pageId, hotspotsConfig[pageId] || []);
    hotspots.forEach((spot) => {
      const div = document.createElement("button");
      div.type = "button";
      div.className = `hotspot ${spot.hidden ? "hidden" : ""}`;
      div.style.left = `${spot.x}%`;
      div.style.top = `${spot.y}%`;
      div.style.width = `${spot.width}%`;
      div.style.height = `${spot.height}%`;
      div.setAttribute("aria-label", spot.label);
      if (spot.showLabel) {
        div.classList.add("has-label");
        div.textContent = spot.label;
      }

      div.addEventListener("click", (event) => {
        event.preventDefault();
        playSFX("click");
        spot.action();
      });

      div.addEventListener("mouseenter", () => playSFX("hover"));
      wrapper.appendChild(div);
    });
  }

  function getTransitionClass(animation) {
    if (animation === "forward" || animation === "slideLeft") {
      return "transition-slide-left";
    }
    if (animation === "backward" || animation === "slideRight") {
      return "transition-slide-right";
    }
    if (animation === "zoom") {
      return "transition-zoom";
    }
    return "transition-fade";
  }

  function updateNavBar() {
    const btnAudio = document.querySelector(".btn-audio");
    btnAudio.textContent = gameState.audioEnabled ? "🔊" : "🔇";
    if (navVolume) {
      navVolume.value = String(Math.round((gameState.volume ?? 0.5) * 100));
    }
  }

  function updateSceneProgress(pageId) {
    const match = pageId.match(/(forest|grass|water|sand)/);
    if (!match) {
      switchAmbient(null);
      return;
    }
    const sceneKey = match[1];
    if (!gameState.completedScenes.includes(sceneKey)) {
      gameState.completedScenes.push(sceneKey);
    }
    switchAmbient(sceneKey);
  }

  function showSceneMenu() {
    sceneMenu.classList.add("show");
    sceneMenu.setAttribute("aria-hidden", "false");
  }

  function hideSceneMenu() {
    sceneMenu.classList.remove("show");
    sceneMenu.setAttribute("aria-hidden", "true");
  }

  function buildSceneMenu() {
    const items = [
      { label: "背景资料", page: "03-background-info" },
      { label: "地图详情", page: "04-map-detail" },
      { label: "森之境", page: "05-forest-intro" },
      { label: "草之境", page: "06-grass-intro" },
      { label: "水之境", page: "07-water-intro" },
      { label: "沙之境", page: "08-sand-intro" },
      { label: "积分商城", page: "09-shop-system" }
    ];

    sceneMenuGrid.innerHTML = "";
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "button";
      btn.textContent = item.label;
      btn.addEventListener("click", () => {
        hideSceneMenu();
        navigateTo(item.page, "slideLeft");
      });
      sceneMenuGrid.appendChild(btn);
    });
  }

  function bindNavButtons() {
    document.querySelector(".btn-back").addEventListener("click", () => {
      navigateBack();
    });

    document.querySelector(".btn-home").addEventListener("click", () => {
      resetToHome();
    });

    document.querySelector(".btn-menu").addEventListener("click", () => {
      showSceneMenu();
    });

    document.querySelector(".btn-audio").addEventListener("click", () => {
      const enabled = toggleAudio();
      document.querySelector(".btn-audio").textContent = enabled ? "🔊" : "🔇";
    });

    if (navVolume) {
      navVolume.addEventListener("input", () => {
        const value = Math.min(100, Math.max(0, Number(navVolume.value) || 0));
        setVolume(value / 100);
        syncMusicVolume();
      });
    }

    const unlock = () => {
      resumeAudioByUserGesture();
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);

    sceneMenu.addEventListener("click", (event) => {
      if (event.target === sceneMenu) {
        hideSceneMenu();
      }
    });

    document.querySelector(".scene-menu-close").addEventListener("click", hideSceneMenu);
  }

  function initNavigationListener() {
    document.addEventListener("plant-hunter:navigate", (event) => {
      const { pageId, animation } = event.detail;
      renderPage(pageId, animation);
    });
  }

  let debugMode = false;
  let debugTarget = null;
  let dragState = null;
  let pendingHotspot = null;
  let suppressClickUntil = 0;
  let panelDragState = null;

  function handleDebugClick(event) {
    if (!debugMode) return;
    if (Date.now() < suppressClickUntil) return;
    if (!(event.target instanceof HTMLElement)) return;
    const wrapper = currentWrapper || event.currentTarget;
    if (!(wrapper instanceof HTMLElement)) return;
    if (!wrapper.classList.contains("page-wrapper")) return;

    if (event.target.classList.contains("resize-handle")) return;
    if (event.target.classList.contains("hotspot") && !event.target.classList.contains("debug-target")) return;
    if (!pendingHotspot) {
      debugOutput.textContent = "请先在调试面板选择热区逻辑。";
      return;
    }

    const rect = wrapper.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const width = clamp(parseFloat(debugWidthInput.value) || pendingHotspot.width || 16, 1, 100);
    const height = clamp(parseFloat(debugHeightInput.value) || pendingHotspot.height || 12, 1, 100);

    createOrMoveDebugTarget(wrapper, x, y, width, height);
    updateDebugOutput(parseFloat(debugTarget.style.left), parseFloat(debugTarget.style.top), width, height);
  }

  function createOrMoveDebugTarget(wrapper, centerX, centerY, width, height) {
    if (!debugTarget) {
      debugTarget = document.createElement("div");
      debugTarget.className = "hotspot debug-target";
      debugTarget.setAttribute("data-debug", "true");
      addResizeHandles(debugTarget);
      debugTarget.addEventListener("mousedown", (event) => startDrag(event, "move"));
      wrapper.appendChild(debugTarget);
    }
    const left = clamp(centerX - width / 2, 0, 100 - width);
    const top = clamp(centerY - height / 2, 0, 100 - height);
    applyTargetPosition(left, top, width, height);
  }

  function addResizeHandles(target) {
    const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
    handles.forEach((pos) => {
      const handle = document.createElement("span");
      handle.className = `resize-handle ${pos}`;
      handle.addEventListener("mousedown", (event) => startDrag(event, pos));
      target.appendChild(handle);
    });
  }

  function startDrag(event, mode) {
    event.preventDefault();
    event.stopPropagation();
    if (!debugTarget) return;
    const wrapper = debugTarget.parentElement;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    dragState = {
      mode,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      left: parseFloat(debugTarget.style.left) || 0,
      top: parseFloat(debugTarget.style.top) || 0,
      width: parseFloat(debugTarget.style.width) || 10,
      height: parseFloat(debugTarget.style.height) || 10
    };
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
  }

  function handleDrag(event) {
    if (!dragState || !debugTarget) return;
    const dx = ((event.clientX - dragState.startX) / dragState.rect.width) * 100;
    const dy = ((event.clientY - dragState.startY) / dragState.rect.height) * 100;

    let { left, top, width, height } = dragState;

    if (dragState.mode === "move") {
      left = clamp(left + dx, 0, 100 - width);
      top = clamp(top + dy, 0, 100 - height);
    } else {
      if (dragState.mode.includes("e")) {
        width = clamp(width + dx, 1, 100 - left);
      }
      if (dragState.mode.includes("s")) {
        height = clamp(height + dy, 1, 100 - top);
      }
      if (dragState.mode.includes("w")) {
        const newLeft = clamp(left + dx, 0, left + width - 1);
        width = clamp(width - dx, 1, 100 - newLeft);
        left = newLeft;
      }
      if (dragState.mode.includes("n")) {
        const newTop = clamp(top + dy, 0, top + height - 1);
        height = clamp(height - dy, 1, 100 - newTop);
        top = newTop;
      }
    }

    applyTargetPosition(left, top, width, height);
  }

  function stopDrag() {
    dragState = null;
    suppressClickUntil = Date.now() + 200;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  }

  function applyTargetPosition(left, top, width, height) {
    if (!debugTarget) return;
    debugTarget.style.left = `${left}%`;
    debugTarget.style.top = `${top}%`;
    debugTarget.style.width = `${width}%`;
    debugTarget.style.height = `${height}%`;
    updateDebugOutput(left, top, width, height);
  }

  function updateDebugOutput(left, top, width, height) {
    const label = debugLabelInput.value || pendingHotspot?.label || "按钮";
    const pageId = debugPageSelect.value || gameState.currentPage || "01-cover";
    const id = pendingHotspot?.id || "HOTSPOT";
    const output = `// ${id}\ncreateHotspot(\"${id}\", \"${label}\", ${left.toFixed(1)}, ${top.toFixed(1)}, ${width.toFixed(1)}, ${height.toFixed(1)}, () => {}) // ${pageId}`;
    debugOutput.textContent = output;
  }

  function toggleDebugMode() {
    if (!DEBUG_ENABLED) return;
    debugMode = !debugMode;
    debugPanel.classList.toggle("hidden", !debugMode);
    debugPanel.setAttribute("aria-hidden", debugMode ? "false" : "true");
    body.classList.toggle("debug-mode", debugMode);
    if (!debugMode && debugTarget) {
      debugTarget.remove();
      debugTarget = null;
    }
  }

  function clearDebugTarget() {
    if (debugTarget) {
      debugTarget.remove();
      debugTarget = null;
    }
    debugOutput.textContent = "按 D 开关调试。先选热区逻辑，再点击图片放置。";
  }

  function copyDebugOutput() {
    const text = debugOutput.textContent;
    if (!text) return;
    if (debugTarget && pendingHotspot) {
      const pageId = debugPageSelect.value || gameState.currentPage;
      const left = parseFloat(debugTarget.style.left) || 0;
      const top = parseFloat(debugTarget.style.top) || 0;
      const width = parseFloat(debugTarget.style.width) || 10;
      const height = parseFloat(debugTarget.style.height) || 10;
      const label = debugLabelInput.value || pendingHotspot.label;
      saveHotspotOverride(pageId, pendingHotspot.id, {
        x: left,
        y: top,
        width,
        height,
        label
      });
    }

    navigator.clipboard
      .writeText(text)
      .then(() => showToast("已保存并复制"))
      .catch(() => showToast("保存成功，复制失败"));
  }

  function bindDebugControls() {
    if (!DEBUG_ENABLED) return;

    document.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "d") {
        toggleDebugMode();
      }
    });

    debugPanel.addEventListener("mousedown", (event) => {
      if (!debugMode) return;
      if (event.target.closest(".debug-row") || event.target.closest(".debug-actions") || event.target.closest(".debug-output")) {
        return;
      }
      startPanelDrag(event);
    });

    debugPickButton.addEventListener("click", () => {
      const page = debugPageSelect.value;
      const hotspotId = debugHotspotSelect.value;
      pendingHotspot = hotspotCatalog.find((item) => item.id === hotspotId && item.page === page) || null;
      clearDebugTarget();
      if (pendingHotspot) {
        debugLabelInput.value = pendingHotspot.label;
        if (pendingHotspot.width) debugWidthInput.value = pendingHotspot.width;
        if (pendingHotspot.height) debugHeightInput.value = pendingHotspot.height;
        debugOutput.textContent = `已选择：${pendingHotspot.id}，点击图片放置热区。`;
      } else {
        debugOutput.textContent = "请选择热区逻辑。";
      }
    });

    debugHotspotSelect.addEventListener("change", () => {
      const page = debugPageSelect.value;
      const hotspotId = debugHotspotSelect.value;
      pendingHotspot = hotspotCatalog.find((item) => item.id === hotspotId && item.page === page) || null;
      clearDebugTarget();
      if (pendingHotspot) {
        debugLabelInput.value = pendingHotspot.label;
        if (pendingHotspot.width) debugWidthInput.value = pendingHotspot.width;
        if (pendingHotspot.height) debugHeightInput.value = pendingHotspot.height;
        debugOutput.textContent = `已选择：${pendingHotspot.id}，点击图片放置热区。`;
      }
    });

    debugCopyButton.addEventListener("click", copyDebugOutput);
    debugClearButton.addEventListener("click", clearDebugTarget);
    if (debugExportButton) {
      debugExportButton.addEventListener("click", exportHotspotOverridesTemplate);
    }
  }

  let toastTimer = null;
  function showToast(message) {
    if (!debugToast) return;
    debugToast.textContent = message;
    debugToast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      debugToast.classList.remove("show");
    }, 1600);
  }

  function startPanelDrag(event) {
    if (!debugPanel) return;
    event.preventDefault();
    const rect = debugPanel.getBoundingClientRect();
    panelDragState = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    debugPanel.classList.add("dragging");
    document.addEventListener("mousemove", handlePanelDrag);
    document.addEventListener("mouseup", stopPanelDrag);
  }

  function handlePanelDrag(event) {
    if (!panelDragState || !debugPanel) return;
    const panelWidth = debugPanel.offsetWidth;
    const panelHeight = debugPanel.offsetHeight;
    const maxX = window.innerWidth - panelWidth - 8;
    const maxY = window.innerHeight - panelHeight - 8;
    const left = clamp(event.clientX - panelDragState.offsetX, 8, maxX);
    const top = clamp(event.clientY - panelDragState.offsetY, 8, maxY);
    debugPanel.style.left = `${left}px`;
    debugPanel.style.top = `${top}px`;
    debugPanel.style.right = "auto";
    debugPanel.style.bottom = "auto";
  }

  function stopPanelDrag() {
    panelDragState = null;
    debugPanel.classList.remove("dragging");
    document.removeEventListener("mousemove", handlePanelDrag);
    document.removeEventListener("mouseup", stopPanelDrag);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function startGame() {
    buildSceneMenu();
    bindNavButtons();
    updateNavBar();
    if (DEBUG_ENABLED) {
      bindDebugControls();
      buildDebugCatalog();
    } else if (debugPanel) {
      debugPanel.classList.add("hidden");
      debugPanel.setAttribute("aria-hidden", "true");
    }
    initNavigationListener();

    renderPage("01-cover", "fade");
    playBackground();
  }

  function init() {
    showLoader();
    const imageList = Object.values(pages).map((page) => page.image);
    preloadImages(imageList)
      .then(() => {
        hideLoader();
        startGame();
      })
      .catch((err) => {
        console.warn("图片预加载失败", err);
        hideLoader();
        startGame();
      });
  }

  init();

  function loadHotspotOverrides() {
    const baseOverrides = getDefaultHotspotOverrides();
    try {
      const raw = localStorage.getItem(HOTSPOT_STORAGE_KEY);
      if (!raw) return baseOverrides;
      const localOverrides = JSON.parse(raw);
      return mergeHotspotOverrides(baseOverrides, localOverrides);
    } catch (err) {
      console.warn("读取热区覆盖失败", err);
      return baseOverrides;
    }
  }

  function getDefaultHotspotOverrides() {
    const source = window.PLANT_HUNTER_HOTSPOT_OVERRIDES;
    if (!source || typeof source !== "object") return {};
    return mergeHotspotOverrides({}, source);
  }

  function isDebugEnabled() {
    const host = window.location.hostname;
    const localHosts = host === "localhost" || host === "127.0.0.1" || host === "";
    const forceDebug = new URLSearchParams(window.location.search).has("debug");
    return localHosts || forceDebug;
  }

  function mergeHotspotOverrides(base, incoming) {
    const result = { ...base };
    if (!incoming || typeof incoming !== "object") return result;

    Object.keys(incoming).forEach((pageId) => {
      const pageData = incoming[pageId];
      if (!pageData || typeof pageData !== "object") return;
      result[pageId] = { ...(result[pageId] || {}), ...pageData };
    });

    return result;
  }

  function saveHotspotOverride(pageId, hotspotId, data) {
    if (!pageId || !hotspotId) return;
    if (!hotspotOverrides[pageId]) hotspotOverrides[pageId] = {};
    hotspotOverrides[pageId][hotspotId] = data;
    localStorage.setItem(HOTSPOT_STORAGE_KEY, JSON.stringify(hotspotOverrides));
    renderPage(gameState.currentPage, "fade");
  }

  function applyHotspotOverrides(pageId, hotspots) {
    const pageOverrides = hotspotOverrides[pageId] || {};
    return hotspots.map((spot) => {
      const override = pageOverrides[spot.id];
      if (!override) return spot;
      return {
        ...spot,
        label: override.label || spot.label,
        x: override.x ?? spot.x,
        y: override.y ?? spot.y,
        width: override.width ?? spot.width,
        height: override.height ?? spot.height,
        showLabel: override.showLabel ?? (spot.showLabel !== undefined ? spot.showLabel : DEFAULT_VISIBLE_LABEL_IDS.has(spot.id))
      };
    });
  }

  function buildHotspotCatalog() {
    return [
      { id: "COVER_START", label: "开始游戏", page: "01-cover", width: 20, height: 12 },
      { id: "NAV_BACKGROUND", label: "背景资料", page: "02-nav-main", width: 16, height: 12 },
      { id: "NAV_MAP", label: "地图", page: "02-nav-main", width: 16, height: 12 },
      { id: "NAV_SCENES", label: "场景", page: "02-nav-main", width: 16, height: 12 },
      { id: "NAV_SHOP", label: "商城", page: "02-nav-main", width: 16, height: 12 },
      { id: "BACKGROUND_BACK", label: "返回主导航", page: "03-background-info", width: 10, height: 10 },
      { id: "MAP_FOREST", label: "森林区域", page: "04-map-detail", width: 20, height: 20 },
      { id: "MAP_GRASS", label: "草原区域", page: "04-map-detail", width: 20, height: 20 },
      { id: "MAP_WATER", label: "水域区域", page: "04-map-detail", width: 22, height: 22 },
      { id: "MAP_SAND", label: "沙漠区域", page: "04-map-detail", width: 24, height: 22 },
      { id: "MAP_BACK", label: "返回主导航", page: "04-map-detail", width: 10, height: 10 },
      { id: "FOREST_DETAIL", label: "查看详情", page: "05-forest-intro", width: 20, height: 14 },
      { id: "FOREST_INTRO_BACK", label: "返回主导航", page: "05-forest-intro", width: 10, height: 10 },
      { id: "FOREST_NEXT", label: "下一场景", page: "05-forest-intro", width: 18, height: 12 },
      { id: "FOREST_DETAIL_BACK", label: "返回介绍", page: "05-forest-detail", width: 12, height: 10 },
      { id: "FOREST_DETAIL_HOME", label: "返回主导航", page: "05-forest-detail", width: 16, height: 12 },
      { id: "FOREST_DETAIL_NEXT", label: "下一场景", page: "05-forest-detail", width: 18, height: 12 },
      { id: "GRASS_DETAIL", label: "查看详情", page: "06-grass-intro", width: 20, height: 14 },
      { id: "GRASS_INTRO_BACK", label: "返回主导航", page: "06-grass-intro", width: 10, height: 10 },
      { id: "GRASS_NEXT", label: "下一场景", page: "06-grass-intro", width: 18, height: 12 },
      { id: "GRASS_DETAIL_BACK", label: "返回介绍", page: "06-grass-detail", width: 12, height: 10 },
      { id: "GRASS_DETAIL_HOME", label: "返回主导航", page: "06-grass-detail", width: 16, height: 12 },
      { id: "GRASS_DETAIL_NEXT", label: "下一场景", page: "06-grass-detail", width: 18, height: 12 },
      { id: "WATER_DETAIL", label: "查看详情", page: "07-water-intro", width: 20, height: 14 },
      { id: "WATER_INTRO_BACK", label: "返回主导航", page: "07-water-intro", width: 10, height: 10 },
      { id: "WATER_NEXT", label: "下一场景", page: "07-water-intro", width: 18, height: 12 },
      { id: "WATER_DETAIL_BACK", label: "返回介绍", page: "07-water-detail", width: 12, height: 10 },
      { id: "WATER_DETAIL_HOME", label: "返回主导航", page: "07-water-detail", width: 16, height: 12 },
      { id: "WATER_DETAIL_NEXT", label: "下一场景", page: "07-water-detail", width: 18, height: 12 },
      { id: "SAND_DETAIL", label: "查看详情", page: "08-sand-intro", width: 20, height: 14 },
      { id: "SAND_INTRO_BACK", label: "返回主导航", page: "08-sand-intro", width: 10, height: 10 },
      { id: "SAND_NEXT", label: "下一场景", page: "08-sand-intro", width: 18, height: 12 },
      { id: "SAND_DETAIL_BACK", label: "返回介绍", page: "08-sand-detail", width: 12, height: 10 },
      { id: "SAND_DETAIL_HOME", label: "返回主导航", page: "08-sand-detail", width: 16, height: 12 },
      { id: "SAND_DETAIL_NEXT", label: "下一场景", page: "08-sand-detail", width: 18, height: 12 },
      { id: "SHOP_BACK", label: "返回主导航", page: "09-shop-system", width: 10, height: 10 }
    ];
  }

  function exportHotspotOverridesTemplate() {
    const effectiveOverrides = buildEffectiveHotspotOverrides();
    const content = [
      "// 热区位置覆盖模板",
      "// 由调试面板“导出模板”自动生成。",
      "// 优先级：localStorage(调试保存) > 本文件默认值 > main.js 内置坐标。",
      "",
      `window.PLANT_HUNTER_HOTSPOT_OVERRIDES = ${JSON.stringify(effectiveOverrides, null, 2)};`,
      ""
    ].join("\n");

    const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hotspot-overrides.template.js";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    navigator.clipboard
      .writeText(content)
      .then(() => showToast("已导出模板并复制"))
      .catch(() => showToast("已导出模板"));
  }

  function buildEffectiveHotspotOverrides() {
    const result = {};
    Object.keys(pages).forEach((pageId) => {
      const hotspots = applyHotspotOverrides(pageId, hotspotsConfig[pageId] || []);
      if (!hotspots.length) return;
      result[pageId] = {};
      hotspots.forEach((spot) => {
        result[pageId][spot.id] = {
          x: Number(spot.x.toFixed(1)),
          y: Number(spot.y.toFixed(1)),
          width: Number(spot.width.toFixed(1)),
          height: Number(spot.height.toFixed(1)),
          label: spot.label,
          showLabel: !!spot.showLabel
        };
      });
    });
    return result;
  }

  function buildDebugCatalog() {
    const pagesList = Object.keys(pages);
    debugPageSelect.innerHTML = "";
    pagesList.forEach((pageId) => {
      const option = document.createElement("option");
      option.value = pageId;
      option.textContent = `${pageId} - ${pages[pageId].title}`;
      debugPageSelect.appendChild(option);
    });

    debugPageSelect.value = gameState.currentPage || "01-cover";
    rebuildHotspotOptions();

    debugPageSelect.addEventListener("change", () => {
      rebuildHotspotOptions();
    });
  }

  function rebuildHotspotOptions() {
    const pageId = debugPageSelect.value;
    const list = hotspotCatalog.filter((item) => item.page === pageId);
    debugHotspotSelect.innerHTML = "";
    list.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.id} - ${item.label}`;
      debugHotspotSelect.appendChild(option);
    });
    pendingHotspot = list[0] || null;
    clearDebugTarget();
  }
})();
