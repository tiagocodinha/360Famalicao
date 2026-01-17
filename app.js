/* ===============================
   Modern City 360 Tour (Pannellum)
   ✅ Desktop: hover icon -> dropdown
   ✅ Mobile: botão abre iconbar + click abre dropdown
   ✅ Scene title top-left
   ✅ Intro zoom-out 5s + skip
   ✅ Hover-look delay 2s (desktop)
   ✅ Map modal + pins
   ✅ Map + Gyro só aparecem após intro
================================ */

const INTRO_DURATION_MS = 5000;
const HOVER_DELAY_MS = 2000;

const MIN_HFOV = 50;
const MAX_HFOV = 120;
const START_HFOV = MAX_HFOV;

const STRENGTH_YAW = 6;
const STRENGTH_PITCH = 3.5;
const SMOOTH = 0.12;

/* ===============================
   CATEGORIAS
================================ */
const categories = {
  igreja: {
    label: "Igrejas",
    items: [
      { name: "Igreja Matriz", sceneId: "praca", meta: "Centro" },
      { name: "Capela Histórica", sceneId: "museu", meta: "Zona velha" }
    ]
  },
  monumento: {
    label: "Monumentos",
    items: [
      { name: "Monumento Principal", sceneId: "ponte", meta: "Ribeira" }
    ]
  },
  comboio: {
    label: "Comboio",
    items: [
      { name: "Estação", sceneId: "museu", meta: "Transportes" }
    ]
  },
  camara: {
    label: "Câmara Municipal",
    items: [
      { name: "Paços do Concelho", sceneId: "praca", meta: "Institucional" }
    ]
  },
  praia: {
    label: "Praias",
    items: [
      { name: "Praia Central", sceneId: "miradouro", meta: "Mar" }
    ]
  }
};

const sceneTitles = {
  praca: "Praça Central",
  museu: "Museu Municipal",
  ponte: "Ponte Histórica",
  miradouro: "Miradouro"
};

/* ===============================
   Helpers UI
================================ */
function setSceneTitle(sceneId) {
  const el = document.getElementById("sceneTitle");
  if (!el) return;
  el.textContent = sceneTitles[sceneId] || "City 360 Tour";
}

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
    row.addEventListener("click", () => {
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
  if (isOpen) iconbar.classList.add("is-open");
  else iconbar.classList.remove("is-open");
}

/* ===============================
   Map show/hide
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

  mapBtn.addEventListener("click", openMap);
  mapClose.addEventListener("click", closeMap);

  mapModal.addEventListener("click", (e) => {
    if (e.target === mapModal) closeMap();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMap();
  });

  mapModal.querySelectorAll(".pin").forEach(pin => {
    pin.addEventListener("click", () => {
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

  const isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
  if (!isTouch) return;

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

  gyroBtn.addEventListener("click", async () => {
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
  });
}

/* ===============================
   INIT
================================ */
window.addEventListener("load", () => {
  const panoEl = document.getElementById("panorama");
  if (!panoEl || typeof pannellum === "undefined") return;

  const isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);

  hideMapButton();
  hideGyroButton();
  setMobileMenuOpen(false);

  window.viewer = pannellum.viewer("panorama", {
    default: {
      firstScene: "praca",
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
      praca: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { pitch: -9, yaw: 70, type: "scene", text: "Seguir", sceneId: "museu" }
        ]
      },
      museu: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { pitch: -9, yaw: -120, type: "scene", text: "Seguir", sceneId: "ponte" },
          { pitch: -9, yaw: 35, type: "scene", text: "Voltar", sceneId: "praca" }
        ]
      },
      ponte: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { pitch: -9, yaw: 175, type: "scene", text: "Seguir", sceneId: "miradouro" }
        ]
      },
      miradouro: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { pitch: -9, yaw: 0, type: "scene", text: "Voltar", sceneId: "ponte" }
        ]
      }
    }
  });

  const viewer = window.viewer;

  setSceneTitle("praca");
  viewer.on("scenechange", (sceneId) => {
    setSceneTitle(sceneId);
    closeDropdown();
    if (isTouch) setMobileMenuOpen(false);
  });

  /* ===============================
     MENU: desktop hover / mobile click + hamburger
  ================================ */
  const iconbar = document.getElementById("iconbar");
  const dropdown = document.getElementById("dropdown");
  const closeBtn = document.getElementById("dropdownClose");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");

  if (closeBtn) closeBtn.addEventListener("click", closeDropdown);

  if (isTouch) {
    // mobile: botão abre/fecha iconbar
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", () => {
        const openNow = iconbar?.classList.contains("is-open");
        closeDropdown();
        setMobileMenuOpen(!openNow);
      });
    }

    // mobile: click no icon abre dropdown
    if (iconbar) {
      iconbar.addEventListener("click", (e) => {
        const btn = e.target.closest(".iconbtn");
        if (!btn) return;

        const ddOpen = dropdown?.classList.contains("is-open");
        const sameActive = btn.classList.contains("is-active");

        if (ddOpen && sameActive) closeDropdown();
        else openDropdown(btn.dataset.cat, btn, viewer);
      });
    }
  } else {
    // desktop: hover abre dropdown
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
  document.addEventListener("click", (e) => {
    const inside =
      e.target.closest(".iconbar") ||
      e.target.closest("#dropdown") ||
      e.target.closest("#mobileMenuBtn");

    if (!inside) {
      if (dropdown?.classList.contains("is-open")) closeDropdown();
      if (isTouch) setMobileMenuOpen(false);
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
    if (isTouch) showGyroButton();
  }

  if (skipBtn) skipBtn.addEventListener("click", startTour);
  setTimeout(startTour, INTRO_DURATION_MS);

  /* ===============================
     MOBILE GYRO
  ================================ */
  initMobileGyroToggle(viewer);

  /* ===============================
     HOVER LOOK (desktop only)
  ================================ */
  if (isTouch) return;

  let baseYaw = 0, basePitch = 0;
  let targetYaw = 0, targetPitch = 0;
  let mouseInside = false;
  let isDragging = false;
  let hoverEnabled = true;
  let t = null;

  function setBase() {
    baseYaw = viewer.getYaw();
    basePitch = viewer.getPitch();
    targetYaw = baseYaw;
    targetPitch = basePitch;
  }

  function disableHoverTemporarily() {
    hoverEnabled = false;
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      hoverEnabled = true;
      setBase();
    }, HOVER_DELAY_MS);
  }

  setTimeout(setBase, 500);
  viewer.on("scenechange", () => setTimeout(setBase, 250));

  panoEl.addEventListener("mousedown", () => {
    isDragging = true;
    hoverEnabled = false;
    if (t) clearTimeout(t);
    setBase();
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    setBase();
    disableHoverTemporarily();
  });

  panoEl.addEventListener("wheel", () => {
    disableHoverTemporarily();
  }, { passive: true });

  document.addEventListener("mousemove", (e) => {
    const rect = panoEl.getBoundingClientRect();
    mouseInside =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;

    if (!mouseInside) return;

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const nx = (x - 0.5) * 2;
    const ny = (y - 0.5) * 2;

    targetYaw = baseYaw + nx * STRENGTH_YAW;
    targetPitch = basePitch + (-ny) * STRENGTH_PITCH;
  }, true);

  function tick() {
    if (mouseInside && !isDragging && hoverEnabled) {
      const curYaw = viewer.getYaw();
      const curPitch = viewer.getPitch();

      const newYaw = curYaw + (targetYaw - curYaw) * SMOOTH;
      const newPitch = curPitch + (targetPitch - curPitch) * SMOOTH;

      viewer.lookAt(newPitch, newYaw, viewer.getHfov(), 0);
    }
    requestAnimationFrame(tick);
  }

  tick();
});
