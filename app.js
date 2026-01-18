/* ===============================
   Modern 360 Tour (Pannellum)
   ✅ Desktop: hover icon -> dropdown
   ✅ Mobile: hamburger abre iconbar + click abre dropdown
   ✅ Scene title top-left
   ✅ Intro zoom-out 5s + skip
   ✅ Map modal + pins
   ✅ Map + Gyro só aparecem após intro
   ✅ Hotspots: StreetView style (ring + preview bubble)
   ✅ Timeline: só dots centrados, sem box
   ✅ ALT + clique: Hotspot picker (pitch/yaw)
   ✅ Hover-look: sem clicar, mover rato mexe lentamente (desktop)
================================ */

const INTRO_DURATION_MS = 5000;

// Hover-look (parallax) desktop
const HOVER_DELAY_MS = 600;     // começa rápido (podes subir p/ 2000 se quiseres)
const STRENGTH_YAW   = 6;       // quanto mexe lateral
const STRENGTH_PITCH = 3.5;     // quanto mexe vertical
const SMOOTH         = 0.10;    // suavidade

// FOV
const MIN_HFOV = 40;
const MAX_HFOV = 120;

// Desktop começa aberto
const START_HFOV_DESKTOP = MAX_HFOV;
// Mobile começa igual
const START_HFOV_MOBILE  = MAX_HFOV;

/* ===============================
   CATEGORIAS
================================ */
const categories = {
  igreja: {
    label: "Igrejas",
    items: [
      { name: "Igreja de S. Gião", sceneId: "saogiao", meta: "Famalicão" },
      { name: "Paróquia de Nossa Senhora da Vitória de Famalicão", sceneId: "paroquia", meta: "Famalicão" }
    ]
  },
  monumento: {
    label: "Monumentos",
    items: [
      { name: "Monumento Almirante Tamandaré", sceneId: "almirante", meta: "Famalicão" }
    ]
  },
  comboio: {
    label: "Estação",
    items: [
      { name: "Estação Ferroviária de Famalicão", sceneId: "estacao", meta: "Famalicão" }
    ]
  },
  camara: {
    label: "Junta",
    items: [
      { name: "Junta de Freguesia de Famalicão", sceneId: "junta", meta: "Famalicão" }
    ]
  },
  praia: {
    label: "Praias",
    items: [
      { name: "Praia do Salgado", sceneId: "salgado", meta: "Serra da Pescaria" }
    ]
  }
};

const sceneTitles = {
  saogiao: "São Gião",
  paroquia: "Paróquia de Nossa Senhora da Vitória de Famalicão",
  almirante: "Monumento Almirante Tamandaré",
  estacao: "Estação Ferroviária de Famalicão",
  junta: "Junta de Freguesia de Famalicão",
  salgado: "Praia do Salgado"
};

/* ===============================
   THUMBS (hotspots)
================================ */
const sceneThumbs = {
  paroquia: "images/thumbs/paroquia.jpg",
  saogiao: "images/thumbs/saogiao.jpg",
  almirante: "images/thumbs/almirante.jpg",
  estacao: "images/thumbs/estacao.jpg",
  junta: "images/thumbs/junta.jpg",
  salgado: "images/thumbs/salgado.jpg"
};

/* ===============================
   ORDEM DA TOUR (timeline dots)
================================ */
const tourOrder = [
  "paroquia",
  "saogiao",
  "almirante",
  "estacao",
  "junta",
  "salgado"
];

/* ===============================
   Helpers UI
================================ */
function setSceneTitle(sceneId) {
  const el = document.getElementById("sceneTitle");
  if (!el) return;
  el.textContent = sceneTitles[sceneId] || "Famalicão 360 Tour";
}

/* ===============================
   HOTSPOT STREET VIEW STYLE
   - Desktop: hover mostra bolha, click navega
   - Mobile: 1º toque abre bolha, 2º toque navega
   args: { title, thumb, sceneId, viewer }
================================ */
function createStreetViewHotspot(hotSpotDiv, args){
  const { title, thumb, sceneId, viewer } = args || {};
  if (!viewer || !sceneId) return;

  hotSpotDiv.classList.add("hs-sv");

  const dot = document.createElement("div");
  dot.className = "hs-sv-dot";
  hotSpotDiv.appendChild(dot);

  const bubble = document.createElement("div");
  bubble.className = "hs-sv-bubble";
  const thumbEl = document.createElement("div");
  thumbEl.className = "hs-sv-thumb";
  thumbEl.style.backgroundImage = thumb ? `url("${thumb}")` : "none";
  bubble.appendChild(thumbEl);
  hotSpotDiv.appendChild(bubble);

  const label = document.createElement("div");
  label.className = "hs-sv-label";
  label.textContent = title || "";
  hotSpotDiv.appendChild(label);

  let armed = false;
  let armTimer = null;

  const open = () => {
    hotSpotDiv.classList.add("is-open");
  };
  const close = () => {
    hotSpotDiv.classList.remove("is-open");
    armed = false;
    if (armTimer) clearTimeout(armTimer);
    armTimer = null;
  };
  const go = () => {
    close();
    viewer.loadScene(sceneId);
  };

  // Desktop hover
  hotSpotDiv.addEventListener("mouseenter", open);
  hotSpotDiv.addEventListener("mouseleave", close);

  // Click desktop
  hotSpotDiv.addEventListener("pointerdown", (e) => {
    // evita que o drag da câmara "roube" o clique
    e.preventDefault();
    e.stopPropagation();
    // Em touch queremos 2 passos (arma + executa)
    if (e.pointerType === "touch") return;
    go();
  }, { capture: true });

  // Touch: 1º toque abre, 2º toca navega
  hotSpotDiv.addEventListener("touchstart", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!armed) {
      armed = true;
      open();
      armTimer = setTimeout(() => close(), 2500);
    } else {
      go();
    }
  }, { passive: false });

  // Se clicares noutra zona, fecha os que estão abertos
  document.addEventListener("pointerdown", (e) => {
    if (!hotSpotDiv.isConnected) return;
    const inside = e.target && (e.target === hotSpotDiv || hotSpotDiv.contains(e.target));
    if (!inside) close();
  }, true);
}

/* ===============================
   TIMELINE (só dots, centrada)
================================ */
function buildTimeline(viewer){
  const root = document.getElementById("timeline");
  if (!root) return;

  root.innerHTML = "";

  const track = document.createElement("div");
  track.className = "timeline-track";
  root.appendChild(track);

  tourOrder.forEach((sceneId) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "tdot";
    dot.dataset.scene = sceneId;

    const tip = document.createElement("div");
    tip.className = "ttip";
    tip.textContent = sceneTitles[sceneId] || sceneId;
    dot.appendChild(tip);

    dot.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      viewer.loadScene(sceneId);
    });

    track.appendChild(dot);
  });
}

function setTimelineActive(sceneId){
  const root = document.getElementById("timeline");
  if (!root) return;

  root.querySelectorAll(".tdot").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.scene === sceneId);
  });
}

/* ===============================
   DROPDOWN
================================ */
function buildDropdown(catKey, viewer) {
  const ddTitle = document.getElementById("dropdownTitle");
  const ddList = document.getElementById("dropdownList");
  const cat = categories[catKey];

  if (!ddTitle || !ddList || !cat) return;

  ddTitle.textContent = cat.label;
  ddList.innerHTML = "";

  cat.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "dropitem";
    row.innerHTML = `
      <div class="dropname">${item.name}</div>
      <div class="dropmeta">${item.meta || ""}</div>
    `;

    row.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      closeDropdown();
      viewer.loadScene(item.sceneId);
    });

    ddList.appendChild(row);
  });
}

function openDropdown(catKey, btnToActivate, viewer) {
  const dd = document.getElementById("dropdown");
  if (!dd) return;

  buildDropdown(catKey, viewer);
  dd.classList.add("is-open");
  dd.setAttribute("aria-hidden", "false");

  document.querySelectorAll(".iconbtn.is-active").forEach(b => b.classList.remove("is-active"));
  if (btnToActivate) btnToActivate.classList.add("is-active");
}

function closeDropdown() {
  const dd = document.getElementById("dropdown");
  if (!dd) return;

  dd.classList.remove("is-open");
  dd.setAttribute("aria-hidden", "true");
  document.querySelectorAll(".iconbtn.is-active").forEach(b => b.classList.remove("is-active"));
}

/* iconbar mobile open/close */
function setMobileMenuOpen(isOpen){
  const iconbar = document.getElementById("iconbar");
  if (!iconbar) return;
  iconbar.classList.toggle("is-open", !!isOpen);
}

/* ===============================
   Map/Gyro show/hide
================================ */
function showMapButton() {
  const mapBtn = document.getElementById("mapBtn");
  if (!mapBtn) return;
  mapBtn.classList.remove("is-hidden");
}
function hideMapButton() {
  const mapBtn = document.getElementById("mapBtn");
  if (!mapBtn) return;
  mapBtn.classList.add("is-hidden");
}

function showGyroButton() {
  const gyroBtn = document.getElementById("gyroBtn");
  if (!gyroBtn) return;
  gyroBtn.classList.remove("is-hidden");
}
function hideGyroButton() {
  const gyroBtn = document.getElementById("gyroBtn");
  if (!gyroBtn) return;
  gyroBtn.classList.add("is-hidden");
}

/* ===============================
   MAP MODAL
================================ */
function initMapModal(viewer) {
  const mapBtn = document.getElementById("mapBtn");
  const mapModal = document.getElementById("mapModal");
  const mapClose = document.getElementById("mapClose");
  if (!mapBtn || !mapModal || !mapClose) return;

  function openMap() {
    mapModal.classList.add("is-open");
    mapModal.setAttribute("aria-hidden", "false");
    closeDropdown();
    setMobileMenuOpen(false);
  }

  function closeMap() {
    mapModal.classList.remove("is-open");
    mapModal.setAttribute("aria-hidden", "true");
  }

  mapBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    openMap();
  });

  mapClose.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    closeMap();
  });

  mapModal.addEventListener("pointerdown", (e) => {
    if (e.target === mapModal) closeMap();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMap();
  });

  mapModal.querySelectorAll(".pin").forEach(pin => {
    pin.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const scene = pin.dataset.scene;
      if (!scene) return;
      viewer.loadScene(scene);
      closeMap();
    });
  });
}

/* ===============================
   MOBILE GYRO
================================ */
function initMobileGyroToggle(viewer){
  const gyroBtn = document.getElementById("gyroBtn");
  if (!gyroBtn) return;

  const isMobileWidth = window.matchMedia("(max-width: 900px)").matches;
  if (!isMobileWidth) return;

  let enabled = false;

  async function requestIOSPermissionIfNeeded(){
    const needs =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function";

    if (!needs) return true;

    try{
      const res = await DeviceOrientationEvent.requestPermission();
      return res === "granted";
    }catch(e){
      return false;
    }
  }

  function applyGyro(on){
    if (on && typeof viewer.startOrientation === "function") viewer.startOrientation();
    if (!on && typeof viewer.stopOrientation === "function") viewer.stopOrientation();
    if (typeof viewer.setOrientation === "function") viewer.setOrientation(on);
  }

  gyroBtn.addEventListener("pointerdown", async (e) => {
    e.preventDefault();

    if (!enabled){
      const ok = await requestIOSPermissionIfNeeded();
      if (!ok){
        console.warn("Permissão de movimento não concedida no iOS.");
        return;
      }
    }

    enabled = !enabled;
    applyGyro(enabled);

    gyroBtn.style.transform = enabled ? "translateY(-2px) scale(1.06)" : "";
    gyroBtn.style.opacity = enabled ? "1" : "0.92";
  });
}

/* ===============================
   HOVER-LOOK (desktop only)
   Move lentamente com o rato sem clicar
================================ */
function initHoverLook(viewer, panoEl){
  const isMobileWidth = window.matchMedia("(max-width: 900px)").matches;
  const supportsHover = window.matchMedia("(hover: hover)").matches;
  if (isMobileWidth || !supportsHover) return;

  let enabled = false;
  let hoverReadyTimer = null;

  let isInteracting = false;
  let baseYaw = 0;
  let basePitch = 0;

  let targetYawOffset = 0;
  let targetPitchOffset = 0;

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function wrap180(a){
    let x = a;
    while (x > 180) x -= 360;
    while (x < -180) x += 360;
    return x;
  }
  function shortestAngleDiff(from, to){
    return wrap180(to - from);
  }

  function syncBase(){
    if (typeof viewer.getYaw === "function") baseYaw = viewer.getYaw();
    if (typeof viewer.getPitch === "function") basePitch = viewer.getPitch();
  }

  function setOffsetsFromEvent(e){
    const r = panoEl.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    const nx = (e.clientX - cx) / (r.width / 2);  // -1..1
    const ny = (e.clientY - cy) / (r.height / 2); // -1..1

    targetYawOffset   = clamp(nx, -1, 1) * STRENGTH_YAW;
    targetPitchOffset = clamp(ny, -1, 1) * STRENGTH_PITCH * -1;
  }

  function enableAfterDelay(){
    if (hoverReadyTimer) clearTimeout(hoverReadyTimer);
    hoverReadyTimer = setTimeout(() => {
      enabled = true;
      syncBase();
    }, HOVER_DELAY_MS);
  }

  function disable(){
    enabled = false;
    targetYawOffset = 0;
    targetPitchOffset = 0;
    if (hoverReadyTimer) clearTimeout(hoverReadyTimer);
    hoverReadyTimer = null;
  }

  // Interação do utilizador: se está a arrastar, não mexemos
  panoEl.addEventListener("pointerdown", () => { isInteracting = true; disable(); }, true);
  window.addEventListener("pointerup", () => {
    if (!isInteracting) return;
    isInteracting = false;
    syncBase();
    enableAfterDelay();
  }, true);

  // se fizer scroll/zoom, também “reseta”
  panoEl.addEventListener("wheel", () => { disable(); syncBase(); enableAfterDelay(); }, { passive: true });

  // mouse move
  panoEl.addEventListener("mousemove", (e) => {
    if (isInteracting) return;
    if (!enabled) enableAfterDelay();
    setOffsetsFromEvent(e);
  });

  panoEl.addEventListener("mouseenter", () => {
    if (isInteracting) return;
    enableAfterDelay();
  });

  panoEl.addEventListener("mouseleave", () => {
    disable();
    syncBase();
  });

  // quando muda cena, re-baseia
  viewer.on("scenechange", () => {
    disable();
    syncBase();
    enableAfterDelay();
  });

  // loop suave
  function tick(){
    if (enabled && !isInteracting){
      const curYaw = viewer.getYaw();
      const curPitch = viewer.getPitch();

      const desiredYaw = baseYaw + targetYawOffset;
      const desiredPitch = clamp(basePitch + targetPitchOffset, -85, 85);

      const dy = shortestAngleDiff(curYaw, desiredYaw);
      const dp = desiredPitch - curPitch;

      const nextYaw = curYaw + dy * SMOOTH;
      const nextPitch = curPitch + dp * SMOOTH;

      viewer.lookAt(nextPitch, nextYaw, viewer.getHfov(), false);
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // arranca
  syncBase();
  enableAfterDelay();
}

/* ===============================
   INIT
================================ */
window.addEventListener("load", () => {
  const panoEl = document.getElementById("panorama");
  if (!panoEl || typeof pannellum === "undefined") return;

  const isMobileWidth = window.matchMedia("(max-width: 900px)").matches;
  const START_HFOV = isMobileWidth ? START_HFOV_MOBILE : START_HFOV_DESKTOP;

  hideMapButton();
  hideGyroButton();
  setMobileMenuOpen(false);

  // Viewer
  window.viewer = pannellum.viewer("panorama", {
    default: {
      firstScene: "paroquia",
      autoLoad: true,
      hfov: START_HFOV,
      minHfov: MIN_HFOV,
      maxHfov: MAX_HFOV,
      sceneFadeDuration: 900,
      showControls: false,
      orientationOnByDefault: false,
      autoRotate: false
    },

    scenes: {
      paroquia: {
        type: "equirectangular",
        panorama: "images/igreja1.jpg",
        hfov: START_HFOV,
        hotSpots: [
          {
            pitch: -9,
            yaw: 70,
            type: "scene",
            sceneId: "saogiao",
            createTooltipFunc: createStreetViewHotspot,
            createTooltipArgs: {
              title: sceneTitles.saogiao,
              thumb: sceneThumbs.saogiao,
              sceneId: "saogiao",
              viewer: null // injetamos abaixo
            }
          }
        ]
      },

      saogiao: {
        type: "equirectangular",
        panorama: "images/sgiao1.jpg",
        hfov: MAX_HFOV,
        yaw: 0,
        pitch: 0,
        hotSpots: [
          {
            pitch: -4.35,
            yaw: 36.49,
            type: "scene",
            sceneId: "almirante",
            createTooltipFunc: createStreetViewHotspot,
            createTooltipArgs: {
              title: sceneTitles.almirante,
              thumb: sceneThumbs.almirante,
              sceneId: "almirante",
              viewer: null
            }
          }
        ]
      },

      almirante: {
        type: "equirectangular",
        panorama: "images/patrimonio1.jpg",
        hfov: START_HFOV,
        hotSpots: [
          {
            pitch: -9,
            yaw: 70,
            type: "scene",
            sceneId: "estacao",
            createTooltipFunc: createStreetViewHotspot,
            createTooltipArgs: {
              title: sceneTitles.estacao,
              thumb: sceneThumbs.estacao,
              sceneId: "estacao",
              viewer: null
            }
          }
        ]
      },

      estacao: {
        type: "equirectangular",
        panorama: "images/estacao1.jpg",
        hfov: START_HFOV,
        hotSpots: [
          {
            pitch: -9,
            yaw: 70,
            type: "scene",
            sceneId: "junta",
            createTooltipFunc: createStreetViewHotspot,
            createTooltipArgs: {
              title: sceneTitles.junta,
              thumb: sceneThumbs.junta,
              sceneId: "junta",
              viewer: null
            }
          }
        ]
      },

      junta: {
        type: "equirectangular",
        panorama: "images/junta.jpg",
        hfov: START_HFOV,
        hotSpots: [
          {
            pitch: -9,
            yaw: -120,
            type: "scene",
            sceneId: "salgado",
            createTooltipFunc: createStreetViewHotspot,
            createTooltipArgs: {
              title: sceneTitles.salgado,
              thumb: sceneThumbs.salgado,
              sceneId: "salgado",
              viewer: null
            }
          },
          {
            pitch: -9,
            yaw: 35,
            type: "scene",
            sceneId: "paroquia",
            createTooltipFunc: createStreetViewHotspot,
            createTooltipArgs: {
              title: sceneTitles.paroquia,
              thumb: sceneThumbs.paroquia,
              sceneId: "paroquia",
              viewer: null
            }
          }
        ]
      },

      salgado: {
        type: "equirectangular",
        panorama: "images/salgado2.jpg",
        hfov: START_HFOV,
        hotSpots: [
          {
            pitch: -9,
            yaw: 70,
            type: "scene",
            sceneId: "paroquia",
            createTooltipFunc: createStreetViewHotspot,
            createTooltipArgs: {
              title: sceneTitles.paroquia,
              thumb: sceneThumbs.paroquia,
              sceneId: "paroquia",
              viewer: null
            }
          }
        ]
      }
    }
  });

  const viewer = window.viewer;

  // Inject viewer nas createTooltipArgs (para funcionar dentro da função do hotspot)
  // Pannellum chama createTooltipFunc com args fixos, por isso colocamos viewer ali.
  Object.keys(viewer.getConfig().scenes).forEach((sid) => {
    const sc = viewer.getConfig().scenes[sid];
    if (!sc || !Array.isArray(sc.hotSpots)) return;
    sc.hotSpots.forEach((hs) => {
      if (hs && hs.createTooltipArgs && typeof hs.createTooltipArgs === "object") {
        hs.createTooltipArgs.viewer = viewer;
      }
    });
  });

  // Título inicial
  setSceneTitle("paroquia");

  // Timeline dots
  buildTimeline(viewer);
  setTimelineActive(viewer.getScene());

  viewer.on("scenechange", (sceneId) => {
    setSceneTitle(sceneId);
    setTimelineActive(sceneId);
    closeDropdown();
    if (isMobileWidth) setMobileMenuOpen(false);
  });

  /* ===============================
     HOTSPOT PICKER (ALT+CLICK)
  ================================ */
  panoEl.addEventListener("pointerdown", (e) => {
    if (!e.altKey) return;
    e.preventDefault();

    if (typeof viewer.mouseEventToCoords !== "function") {
      console.warn("viewer.mouseEventToCoords não existe nesta versão do Pannellum.");
      return;
    }

    const [pitch, yaw] = viewer.mouseEventToCoords(e);
    const sceneId = viewer.getScene();

    console.log("=== HOTSPOT PICKER ===");
    console.log("scene:", sceneId);
    console.log("pitch:", Number(pitch.toFixed(2)));
    console.log("yaw:", Number(yaw.toFixed(2)));
  }, true);

  /* ===============================
     MENU: desktop hover / mobile click + hamburger
  ================================ */
  const iconbar = document.getElementById("iconbar");
  const dropdown = document.getElementById("dropdown");
  const closeBtn = document.getElementById("dropdownClose");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");

  if (closeBtn) {
    closeBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      closeDropdown();
    });
  }

  if (isMobileWidth) {
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        const openNow = iconbar?.classList.contains("is-open");
        closeDropdown();
        setMobileMenuOpen(!openNow);
      });
    }

    if (iconbar) {
      iconbar.addEventListener("pointerdown", (e) => {
        const btn = e.target.closest(".iconbtn");
        if (!btn) return;

        e.preventDefault();

        const ddOpen = dropdown?.classList.contains("is-open");
        const sameActive = btn.classList.contains("is-active");

        if (ddOpen && sameActive) closeDropdown();
        else openDropdown(btn.dataset.cat, btn, viewer);
      });
    }
  } else {
    let closeTimer = null;

    const scheduleClose = () => {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(() => closeDropdown(), 180);
    };
    const cancelClose = () => {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = null;
    };

    if (iconbar) {
      iconbar.querySelectorAll(".iconbtn").forEach(btn => {
        btn.addEventListener("mouseenter", () => {
          cancelClose();
          openDropdown(btn.dataset.cat, btn, viewer);
        });
      });

      iconbar.addEventListener("mouseleave", scheduleClose);

      if (dropdown) {
        dropdown.addEventListener("mouseenter", cancelClose);
        dropdown.addEventListener("mouseleave", scheduleClose);
      }
    }
  }

  // click fora fecha dropdown e iconbar (mobile)
  document.addEventListener("pointerdown", (e) => {
    const inside =
      e.target.closest(".iconbar") ||
      e.target.closest("#dropdown") ||
      e.target.closest("#mobileMenuBtn");

    if (!inside) {
      if (dropdown?.classList.contains("is-open")) closeDropdown();
      if (isMobileWidth) setMobileMenuOpen(false);
    }
  });

  /* ===============================
     MAP
  ================================ */
  initMapModal(viewer);

  /* ===============================
     INTRO
  ================================ */
  const overlay = document.getElementById("introOverlay");
  const skipBtn = document.getElementById("skipIntro");
  let done = false;

  function startTour() {
    if (done) return;
    done = true;

    if (overlay) {
      overlay.classList.add("is-hiding");
      setTimeout(() => overlay.remove(), 380);
    }

    showMapButton();
    if (isMobileWidth) showGyroButton();
    else hideGyroButton();
  }

  if (skipBtn) {
    skipBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      startTour();
    });
  }
  setTimeout(startTour, INTRO_DURATION_MS);

  /* ===============================
     MOBILE GYRO
  ================================ */
  initMobileGyroToggle(viewer);

  /* ===============================
     HOVER LOOK (desktop only)
  ================================ */
  initHoverLook(viewer, panoEl);
});
