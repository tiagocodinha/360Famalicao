/* ===============================
   Modern City 360 Tour (Pannellum)
   ✅ Top icon menu hover abre dropdown (desktop)
   ✅ Mobile: click
   ✅ Scene title top-left
   ✅ Ground hotspots
   ✅ Intro zoom-out 5s + skip
   ✅ Hover-look delay 2s
   ✅ Map modal + pins
   ✅ Map button só aparece após a intro
================================ */

const INTRO_DURATION_MS = 5000;
const HOVER_DELAY_MS = 2000;

// FOV (maior = mais zoom out)
const MIN_HFOV = 50;
const MAX_HFOV = 120;
const START_HFOV = MAX_HFOV;

// Hover-look (parallax)
const STRENGTH_YAW = 6;
const STRENGTH_PITCH = 3.5;
const SMOOTH = 0.12;

/* ===============================
   CENAS + CATEGORIAS (menu)
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

// Títulos por cena (top-left)
const sceneTitles = {
  praca: "Praça Central",
  museu: "Museu Municipal",
  ponte: "Ponte Histórica",
  miradouro: "Miradouro"
};

/* ===============================
   Ground hotspot helpers
================================ */
function createGroundHotspot(div, { icon = "➜", label = "Ir", variant = "nav" } = {}) {
  div.classList.add("ground", variant);

  const ico = document.createElement("div");
  ico.className = "g-ico";
  ico.textContent = icon;

  const lab = document.createElement("div");
  lab.className = "g-label";
  lab.textContent = label;

  div.appendChild(ico);
  div.appendChild(lab);
}

function hsNav(sceneId, label, icon = "➜") {
  return {
    type: "scene",
    sceneId,
    text: label,
    cssClass: "ground nav",
    createTooltipFunc: (div) => createGroundHotspot(div, { icon, label, variant: "nav" })
  };
}

function hsFocus(viewer, label, pitch, yaw, icon = "⦿") {
  return {
    type: "info",
    text: label,
    cssClass: "ground info",
    createTooltipFunc: (div) => createGroundHotspot(div, { icon, label, variant: "info" }),
    clickHandlerFunc: () => viewer.lookAt(pitch, yaw, viewer.getHfov(), 900)
  };
}

/* ===============================
   TOP MENU (dropdown)
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

/* ===============================
   MAP BUTTON — show/hide
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
   INIT
================================ */
window.addEventListener("load", () => {
  const panoEl = document.getElementById("panorama");
  if (!panoEl || typeof pannellum === "undefined") return;

  const isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);

  // ❗ garantir que o mapa começa escondido
  hideMapButton();

  // Viewer (aqui crias o viewer e guardas globalmente)
  window.viewer = pannellum.viewer("panorama", {
    default: {
      firstScene: "praca",
      autoLoad: true,
      hfov: START_HFOV,
      minHfov: MIN_HFOV,
      maxHfov: MAX_HFOV,
      sceneFadeDuration: 900,
      showControls: false
    },

    scenes: {
      praca: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { ...hsNav("museu", "Seguir", "➜"), pitch: -9, yaw: 70 }
        ]
      },
      museu: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { ...hsNav("ponte", "Seguir", "➜"), pitch: -9, yaw: -120 },
          { ...hsNav("praca", "Voltar", "←"), pitch: -9, yaw: 35 }
        ]
      },
      ponte: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { ...hsNav("miradouro", "Seguir", "➜"), pitch: -9, yaw: 175 }
        ]
      },
      miradouro: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { ...hsNav("ponte", "Voltar", "←"), pitch: -9, yaw: 0 }
        ]
      }
    }
  });

  const viewer = window.viewer;

  // ✅ exemplo de hotspot "focus" adicionado depois (usa addHotSpot)
  viewer.addHotSpot(hsFocus(viewer, "Ver detalhe", 8, 110, "⦿"), "praca");

  // título inicial
  setSceneTitle("praca");

  viewer.on("scenechange", (sceneId) => {
    setSceneTitle(sceneId);
    closeDropdown();
  });

  /* MENU HOVER/CLICK */
  const iconbar = document.getElementById("iconbar");
  const closeBtn = document.getElementById("dropdownClose");
  const dropdown = document.getElementById("dropdown");

  let closeTimer = null;

  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => closeDropdown(), 180);
  }

  function cancelClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = null;
  }

  if (closeBtn) closeBtn.addEventListener("click", closeDropdown);

  if (iconbar) {
    if (!isTouch) {
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
    } else {
      iconbar.addEventListener("click", (e) => {
        const btn = e.target.closest(".iconbtn");
        if (!btn) return;

        const ddOpen = dropdown?.classList.contains("is-open");
        const sameActive = btn.classList.contains("is-active");

        if (ddOpen && sameActive) closeDropdown();
        else openDropdown(btn.dataset.cat, btn, viewer);
      });
    }
  }

  document.addEventListener("click", (e) => {
    const inside = e.target.closest(".iconbar") || e.target.closest("#dropdown");
    if (!inside && dropdown?.classList.contains("is-open")) closeDropdown();
  });

  /* MAP MODAL */
  initMapModal(viewer);

  /* INTRO */
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

    // ✅ Só quando entra no 360 é que aparece o botão mapa
    showMapButton();
  }

  if (skipBtn) skipBtn.addEventListener("click", startTour);
  setTimeout(startTour, INTRO_DURATION_MS);

  /* HOVER LOOK (desktop only) */
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
