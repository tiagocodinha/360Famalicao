/* ===============================
   Modern City 360 Tour (Pannellum)
   ✅ Top icon menu (PNG) — HOVER abre dropdown (desktop)
   ✅ Mobile: click
   ✅ Scene title top-left
   ✅ Ground hotspots
   ✅ Intro zoom-out 5s + skip
   ✅ Hover-look delay 2s
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

function hsFocus(label, pitch, yaw, icon = "⦿") {
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

function buildDropdown(catKey) {
  const dd = document.getElementById("dropdown");
  const ddTitle = document.getElementById("dropdownTitle");
  const ddList = document.getElementById("dropdownList");
  const cat = categories[catKey];

  if (!dd || !ddTitle || !ddList || !cat) return;

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

function openDropdown(catKey, btnToActivate) {
  const dd = document.getElementById("dropdown");
  if (!dd) return;

  buildDropdown(catKey);
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
   INIT
================================ */
window.addEventListener("load", () => {
  const panoEl = document.getElementById("panorama");
  if (!panoEl || typeof pannellum === "undefined") return;

  const isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);

  // Viewer
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
          { ...hsNav("museu", "Seguir", "➜"), pitch: -9, yaw: 70 },
          { ...hsFocus("Ver detalhe", 8, 110, "⦿"), pitch: -6, yaw: 110 }
        ]
      },
      museu: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { ...hsNav("ponte", "Seguir", "➜"), pitch: -9, yaw: -120 },
          { ...hsNav("praca", "Voltar", "←"), pitch: -9, yaw: 35 },
          { ...hsFocus("Ver fachada", 5, 60, "⦿"), pitch: -6, yaw: 60 }
        ]
      },
      ponte: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { ...hsNav("miradouro", "Seguir", "➜"), pitch: -9, yaw: 175 },
          { ...hsFocus("Ver rio", 0, -90, "⦿"), pitch: -6, yaw: -90 }
        ]
      },
      miradouro: {
        type: "equirectangular",
        panorama: "images/img4.jpg",
        hfov: START_HFOV,
        hotSpots: [
          { ...hsNav("ponte", "Voltar", "←"), pitch: -9, yaw: 0 },
          { ...hsFocus("Ver skyline", 6, -140, "⦿"), pitch: -6, yaw: -140 }
        ]
      }
    }
  });

  // título inicial + fechar dropdown ao mudar de cena
  setSceneTitle("praca");
  viewer.on("scenechange", (sceneId) => {
    setSceneTitle(sceneId);
    closeDropdown();
  });

  /* ===============================
     MENU: HOVER (desktop) / CLICK (mobile)
  ================================ */
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
      // DESKTOP: abre em hover
      iconbar.querySelectorAll(".iconbtn").forEach(btn => {
        btn.addEventListener("mouseenter", () => {
          cancelClose();
          openDropdown(btn.dataset.cat, btn);
        });
      });

      // se sair da barra, fecha com delay
      iconbar.addEventListener("mouseleave", scheduleClose);

      // se entrar no dropdown, não fecha
      if (dropdown) {
        dropdown.addEventListener("mouseenter", cancelClose);
        dropdown.addEventListener("mouseleave", scheduleClose);
      }
    } else {
      // MOBILE: click
      iconbar.addEventListener("click", (e) => {
        const btn = e.target.closest(".iconbtn");
        if (!btn) return;

        const ddOpen = dropdown?.classList.contains("is-open");
        const sameActive = btn.classList.contains("is-active");

        if (ddOpen && sameActive) {
          closeDropdown();
        } else {
          openDropdown(btn.dataset.cat, btn);
        }
      });
    }
  }

  // clicar fora fecha (desktop e mobile)
  document.addEventListener("click", (e) => {
    const inside = e.target.closest(".iconbar") || e.target.closest("#dropdown");
    if (!inside && dropdown?.classList.contains("is-open")) closeDropdown();
  });

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
  }

  if (skipBtn) skipBtn.addEventListener("click", startTour);
  setTimeout(startTour, INTRO_DURATION_MS);

  /* ===============================
     HOVER LOOK (parallax) — desktop only
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
