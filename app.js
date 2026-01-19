/* ===============================
   Modern 360 Tour (Pannellum)
   - Timeline só aparece após intro
   - Hotspots: Círculo limpo
   - Animação "Junta": Bloqueio de interação + Descida forçada
================================ */

const INTRO_DURATION_MS = 5000;

// Hover-look (parallax) desktop
const HOVER_DELAY_MS = 600;
const STRENGTH_YAW   = 6;
const STRENGTH_PITCH = 3.5;
const SMOOTH         = 0.10;

// FOV
const MIN_HFOV = 40;
const MAX_HFOV = 120;
const START_HFOV_DESKTOP = MAX_HFOV;
const START_HFOV_MOBILE  = MAX_HFOV;

/* ===============================
   DADOS / CONFIGURAÇÃO
================================ */
const categories = {
  igreja: {
    label: "Igrejas",
    items: [
      { name: "Paróquia de Nossa Senhora da Vitória", sceneId: "igreja", meta: "Famalicão" },
      { name: "Igreja de S. Gião", sceneId: "saogiao", meta: "Famalicão" } 
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
      { name: "Estação Ferroviária", sceneId: "estacao", meta: "Famalicão" }
    ]
  },
  junta: {
    label: "Institucional",
    items: [
      { name: "Junta de Freguesia", sceneId: "junta", meta: "Famalicão" },
      { name: "Centro Social da Freguesia de Famalicão", sceneId: "centro", meta: "Famalicão" },
      { name: "Cemitério de Famalicão", sceneId: "cemiterio", meta: "Famalicão" }
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
  saogiao: "Igreja de São Gião",
  saogiao1: "Igreja de São Gião",
  igreja: "Paróquia de Nossa Senhora da Vitória de Famalicão",
  almirante: "Monumento Almirante Tamandaré",
  almirante1: "Monumento Almirante Tamandaré",
  centro: "Centro Social da Freguesia de Famalicão",
  cemiterio: "Cemitério de Famalicão",
  estacao: "Estação Ferroviária de Famalicão",
  junta: "Junta de Freguesia de Famalicão",
  salgado: "Praia do Salgado",
  salgado1: "Praia do Salgado"
};

const tourOrder = [
  "junta", "centro", "almirante", "cemiterio", "estacao", "igreja", "salgado", "saogiao"
];

/* ===============================
   UI HELPERS
================================ */
function setSceneTitle(sceneId) {
  const el = document.getElementById("sceneTitle");
  if (!el) return;
  el.textContent = sceneTitles[sceneId] || "Famalicão 360 Tour";
}

/* ===============================
   HOTSPOT: APENAS CÍRCULO SIMPLES
================================ */
function createStreetViewHotspot(hotSpotDiv, args) {
  const { sceneId, viewer } = args || {};
  hotSpotDiv.classList.add("hs-sv");
  const dot = document.createElement("div");
  dot.className = "hs-sv-dot";
  hotSpotDiv.appendChild(dot);

  hotSpotDiv.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    if (viewer && sceneId) {
      viewer.loadScene(sceneId);
    }
  });
}

/* ===============================
   TIMELINE
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

  // --- MAPA DE ASSOCIAÇÕES ---
  // Aqui dizes: "Se estiver na scene X, ativa a bolinha Y"
  const aliases = {
    "almirante1": "almirante",
    "salgado1": "salgado",
    "saogiao1": "saogiao"
    // Podes adicionar mais aqui, ex: "igreja_traseiras": "igreja"
  };

  // Se a cena atual tiver um "pai" definido no mapa, usa o pai.
  // Caso contrário, usa o próprio ID da cena.
  const targetId = aliases[sceneId] || sceneId;

  root.querySelectorAll(".tdot").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.scene === targetId);
  });
}

/* ===============================
   MENUS & DROPDOWN
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
    row.innerHTML = `<div class="dropname">${item.name}</div><div class="dropmeta">${item.meta||""}</div>`;
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

function setMobileMenuOpen(isOpen){
  const iconbar = document.getElementById("iconbar");
  if (!iconbar) return;
  iconbar.classList.toggle("is-open", !!isOpen);
}

/* ===============================
   UI VISIBILITY
================================ */
function showMapButton() { document.getElementById("mapBtn")?.classList.remove("is-hidden"); }
function hideMapButton() { document.getElementById("mapBtn")?.classList.add("is-hidden"); }
function showGyroButton() { document.getElementById("gyroBtn")?.classList.remove("is-hidden"); }
function hideGyroButton() { document.getElementById("gyroBtn")?.classList.add("is-hidden"); }

/* ===============================
   MAPA MODAL
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

  mapBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); openMap(); });
  mapClose.addEventListener("pointerdown", (e) => { e.preventDefault(); closeMap(); });
  mapModal.addEventListener("pointerdown", (e) => { if (e.target === mapModal) closeMap(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMap(); });

  mapModal.querySelectorAll(".pin").forEach(pin => {
    pin.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const scene = pin.dataset.scene;
      if (scene) { viewer.loadScene(scene); closeMap(); }
    });
  });
}

/* ===============================
   GYRO
================================ */
function initMobileGyroToggle(viewer){
  const gyroBtn = document.getElementById("gyroBtn");
  if (!gyroBtn) return;
  const isMobileWidth = window.matchMedia("(max-width: 900px)").matches;
  if (!isMobileWidth) return;

  let enabled = false;
  async function requestIOSPermissionIfNeeded(){
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function"){
      try{ return (await DeviceOrientationEvent.requestPermission()) === "granted"; } catch(e){ return false; }
    }
    return true;
  }
  function applyGyro(on){
    if (on && viewer.startOrientation) viewer.startOrientation();
    if (!on && viewer.stopOrientation) viewer.stopOrientation();
  }
  gyroBtn.addEventListener("pointerdown", async (e) => {
    e.preventDefault();
    if (!enabled && !(await requestIOSPermissionIfNeeded())) return;
    enabled = !enabled;
    applyGyro(enabled);
    gyroBtn.style.transform = enabled ? "translateY(-2px) scale(1.06)" : "";
    gyroBtn.style.opacity = enabled ? "1" : "0.92";
  });
}

/* ===============================
   HOVER LOOK
================================ */
function initHoverLook(viewer, panoEl){
  const isMobileWidth = window.matchMedia("(max-width: 900px)").matches;
  const supportsHover = window.matchMedia("(hover: hover)").matches;
  if (isMobileWidth || !supportsHover) return;

  let enabled = false, hoverReadyTimer = null, isInteracting = false;
  let baseYaw = 0, basePitch = 0, targetYawOffset = 0, targetPitchOffset = 0;

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function wrap180(a){ let x=a; while(x>180)x-=360; while(x<-180)x+=360; return x; }
  
  function syncBase(){
    if (viewer.getYaw) baseYaw = viewer.getYaw();
    if (viewer.getPitch) basePitch = viewer.getPitch();
  }

  function setOffsets(e){
    const r = panoEl.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
    const ny = (e.clientY - (r.top + r.height/2)) / (r.height/2);
    targetYawOffset = clamp(nx, -1, 1) * STRENGTH_YAW;
    targetPitchOffset = clamp(ny, -1, 1) * STRENGTH_PITCH * -1;
  }

  function enableLater(){
    if (hoverReadyTimer) clearTimeout(hoverReadyTimer);
    hoverReadyTimer = setTimeout(() => { enabled = true; syncBase(); }, HOVER_DELAY_MS);
  }
  function disable(){
    enabled = false; targetYawOffset = 0; targetPitchOffset = 0;
    if (hoverReadyTimer) clearTimeout(hoverReadyTimer);
  }

  panoEl.addEventListener("pointerdown", () => { isInteracting = true; disable(); }, true);
  window.addEventListener("pointerup", () => { if(isInteracting){ isInteracting=false; syncBase(); enableLater(); } }, true);
  panoEl.addEventListener("wheel", () => { disable(); syncBase(); enableLater(); }, { passive: true });
  panoEl.addEventListener("mousemove", (e) => { if(isInteracting)return; if(!enabled)enableLater(); setOffsets(e); });
  panoEl.addEventListener("mouseenter", () => { if(!isInteracting)enableLater(); });
  panoEl.addEventListener("mouseleave", () => { disable(); syncBase(); });
  viewer.on("scenechange", () => { disable(); syncBase(); enableLater(); });

  function tick(){
    if(enabled && !isInteracting){
      const curYaw = viewer.getYaw(), curPitch = viewer.getPitch();
      const nextYaw = curYaw + wrap180(baseYaw + targetYawOffset - curYaw) * SMOOTH;
      const nextPitch = curPitch + (clamp(basePitch + targetPitchOffset, -85, 85) - curPitch) * SMOOTH;
      viewer.lookAt(nextPitch, nextYaw, viewer.getHfov(), false);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  syncBase(); enableLater();
}

/* ===============================
   INIT & MAIN
================================ */
window.addEventListener("load", () => {
  const panoEl = document.getElementById("panorama");
  if (!panoEl || typeof pannellum === "undefined") return;
  const isMobileWidth = window.matchMedia("(max-width: 900px)").matches;
  const START_HFOV = isMobileWidth ? START_HFOV_MOBILE : START_HFOV_DESKTOP;

  hideMapButton(); hideGyroButton(); setMobileMenuOpen(false);

  // --- LOGICA DE ANIMAÇÃO DA CÂMARA ---
  let animationRunning = false;

  function runDropAnimation() {
    if (animationRunning) return; // evita múltiplas chamadas
    animationRunning = true;

    const panoContainer = document.getElementById("panorama");
    
    // 1. Bloqueia interação
    panoContainer.classList.add("is-locked");

    // 2. Define posição inicial (topo)
    window.viewer.setPitch(78);

    // 3. Loop de animação manual (substitui lookAt nativo)
    let currentPitch = 78;
    const targetPitch = 0;
    const speed = 2.0; // Velocidade da descida

    function step() {
      // Se o utilizador mudou de cena a meio, para tudo
      if(window.viewer.getScene() !== 'junta') {
        panoContainer.classList.remove("is-locked");
        animationRunning = false;
        return;
      }

      currentPitch -= speed;

      if (currentPitch <= targetPitch) {
        // FIM DA ANIMAÇÃO
        window.viewer.setPitch(targetPitch);
        panoContainer.classList.remove("is-locked");
        animationRunning = false;
      } else {
        // CONTINUA A DESCER
        window.viewer.setPitch(currentPitch);
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // Configuração do Pannellum
  window.viewer = pannellum.viewer("panorama", {
    default: {
      firstScene: "junta",
      autoLoad: true,
      hfov: START_HFOV, minHfov: MIN_HFOV, maxHfov: MAX_HFOV,
      sceneFadeDuration: 900,
      showControls: false, orientationOnByDefault: false, autoRotate: false
    },
    scenes: {
      junta: {
        type: "equirectangular", 
        panorama: "images/junta.jpg", 
        hfov: START_HFOV,
        pitch: 78,
        yaw: -1,
        hotSpots: [{ pitch: -9, yaw: -171, type: "scene", sceneId: "centro", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "centro" } 
        }]
      },
      centro: {
        type: "equirectangular", panorama: "images/centro.jpg", hfov: START_HFOV,
        pitch: 0,
        yaw: -28,
        hotSpots: [{ pitch: -10, yaw: 79, type: "scene", sceneId: "almirante", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "almirante" } 
        }]
      },
      almirante: {
        type: "equirectangular", panorama: "images/patrimonio2.jpg", hfov: START_HFOV,
        pitch: 0,
        yaw: -2,
        hotSpots: [{ pitch: -16, yaw: -2, type: "scene", sceneId: "almirante1", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "almirante1" } 
        },
          
          { 
            pitch: -16,   
            yaw: 89, 
            type: "scene", 
            sceneId: "cemiterio", 
            createTooltipFunc: createStreetViewHotspot, 
            createTooltipArgs: { sceneId: "cemiterio" } 
          }
        ]
      },
      almirante1: {
        type: "equirectangular", panorama: "images/patrimonio1.jpg", hfov: START_HFOV,
        pitch: 20,
        yaw: -2,
        hotSpots: [
          // --- PRIMEIRO HOTSPOT ---
          { 
            pitch: -29, 
            yaw: 176, 
            type: "scene", 
            sceneId: "almirante", 
            createTooltipFunc: createStreetViewHotspot, 
            createTooltipArgs: { sceneId: "almirante" } 
          },
          
          { 
            pitch: -11,   
            yaw: 110, 
            type: "scene", 
            sceneId: "cemiterio", 
            createTooltipFunc: createStreetViewHotspot, 
            createTooltipArgs: { sceneId: "cemiterio" } 
          }
        ]
      },
      cemiterio: {
        type: "equirectangular", panorama: "images/cemiterio.jpg", hfov: START_HFOV,
        hotSpots: [{ pitch: -12, yaw: 178, type: "scene", sceneId: "estacao", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "estacao" } 
        }]
      },
      estacao: {
        type: "equirectangular", panorama: "images/estacao1.jpg", hfov: START_HFOV,
        pitch: 24,
        yaw: -4,
        hotSpots: [{ pitch: -7, yaw: -85, type: "scene", sceneId: "igreja", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "igreja" } 
        }]
      },
      igreja: {
        type: "equirectangular", panorama: "images/igreja1.jpg", hfov: START_HFOV,
        pitch: 11,
        yaw: -169,
        hotSpots: [{ pitch: -14, yaw: 4, type: "scene", sceneId: "salgado", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "salgado" } 
        }]
      },
      salgado: {
        type: "equirectangular", panorama: "images/salgado3.jpg", hfov: START_HFOV,
        pitch: -1,
        yaw: 178,
        hotSpots: [{ pitch: -15, yaw: -178, type: "scene", sceneId: "salgado1", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "salgado1" } 
        },
          
        { 
          pitch: -5,   
          yaw: -15, 
          type: "scene", 
          sceneId: "saogiao", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "saogiao" } 
        }
      ]
      },
      salgado1: {
        type: "equirectangular", panorama: "images/salgado2.jpg", hfov: START_HFOV,
        pitch: -4,
        yaw: 6,
        hotSpots: [{ pitch: -16, yaw: 86, type: "scene", sceneId: "saogiao", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "saogiao" } 
        },
          
        { 
          pitch: -30,   
          yaw: -176, 
          type: "scene", 
          sceneId: "salgado", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "salgado" } 
        }
      ]
      },
      saogiao: {
        type: "equirectangular", panorama: "images/sgiao1.jpg", hfov: MAX_HFOV,
        pitch: 14,
        yaw: -4,
        hotSpots: [{ pitch: -4.35, yaw: 36.49, type: "scene", sceneId: "saogiao1", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "saogiao1" } 
        },
          
        { 
          pitch: -12,   
          yaw: -95, 
          type: "scene", 
          sceneId: "salgado1", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "salgado1" } 
        }
      ]
      },
      saogiao1: {
        type: "equirectangular", panorama: "images/sgiao2.jpg", hfov: START_HFOV,
        pitch: 24,
        yaw: -4,
        hotSpots: [{ pitch: -19, yaw: -96, type: "scene", sceneId: "saogiao", 
          createTooltipFunc: createStreetViewHotspot, 
          createTooltipArgs: { sceneId: "saogiao" } 
        }]
      }
    }
  });

  const viewer = window.viewer;

  // Injetar viewer nos hotspots
  Object.keys(viewer.getConfig().scenes).forEach(sid => {
    const sc = viewer.getConfig().scenes[sid];
    if(sc && sc.hotSpots) sc.hotSpots.forEach(hs => {
      if(hs.createTooltipArgs) hs.createTooltipArgs.viewer = viewer;
    });
  });

  setSceneTitle("junta");
  buildTimeline(viewer);
  setTimelineActive(viewer.getScene());

  // --- Lógica Intro Variables ---
  let introDone = false;

  // EVENTO DE MUDANÇA DE CENA (Navegação normal entre hotspots)
  viewer.on("scenechange", (sid) => {
    setSceneTitle(sid); 
    setTimelineActive(sid); 
    closeDropdown();
    if (isMobileWidth) setMobileMenuOpen(false);

    // Se a navegação for para a junta E a intro já tiver acabado
    if (sid === 'junta' && introDone) {
      // Delay pequeno para garantir carregamento e depois anima
      setTimeout(runDropAnimation, 100); 
    }
  });

  // Hotspot Picker (ALT+CLICK)
  panoEl.addEventListener("pointerdown", (e) => {
    if(!e.altKey || !viewer.mouseEventToCoords) return;
    e.preventDefault();
    const [p, y] = viewer.mouseEventToCoords(e);
    console.log(`Scene: ${viewer.getScene()} | Pitch: ${p.toFixed(2)}, Yaw: ${y.toFixed(2)}`);
  }, true);

  // Menus
  const iconbar = document.getElementById("iconbar");
  const dropdown = document.getElementById("dropdown");
  const closeBtn = document.getElementById("dropdownClose");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");

  if (closeBtn) closeBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); closeDropdown(); });

  if (isMobileWidth) {
    if (mobileMenuBtn) mobileMenuBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault(); const open = iconbar?.classList.contains("is-open");
      closeDropdown(); setMobileMenuOpen(!open);
    });
    if (iconbar) iconbar.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".iconbtn");
      if(!btn) return; e.preventDefault();
      const ddOpen = dropdown?.classList.contains("is-open");
      if(ddOpen && btn.classList.contains("is-active")) closeDropdown();
      else openDropdown(btn.dataset.cat, btn, viewer);
    });
  } else {
    let timer = null;
    const schedule = () => { if(timer) clearTimeout(timer); timer = setTimeout(closeDropdown, 180); };
    const cancel = () => { if(timer) clearTimeout(timer); timer = null; };
    if (iconbar) {
      iconbar.querySelectorAll(".iconbtn").forEach(btn => {
        btn.addEventListener("mouseenter", () => { cancel(); openDropdown(btn.dataset.cat, btn, viewer); });
      });
      iconbar.addEventListener("mouseleave", schedule);
      if(dropdown) { dropdown.addEventListener("mouseenter", cancel); dropdown.addEventListener("mouseleave", schedule); }
    }
  }

  document.addEventListener("pointerdown", (e) => {
    if(!e.target.closest(".iconbar") && !e.target.closest("#dropdown") && !e.target.closest("#mobileMenuBtn")){
      if(dropdown?.classList.contains("is-open")) closeDropdown();
      if(isMobileWidth) setMobileMenuOpen(false);
    }
  });

  initMapModal(viewer);
  initMobileGyroToggle(viewer);
  initHoverLook(viewer, panoEl);

  // --- START TOUR LOGIC ---
  const overlay = document.getElementById("introOverlay");
  const skipBtn = document.getElementById("skipIntro");
  
  function startTour() {
    if(introDone) return; 
    introDone = true;

    // 1. Remove overlay
    if(overlay) { 
      overlay.classList.add("is-hiding"); 
      setTimeout(() => overlay.remove(), 380); 
    }
    
    // 2. Mostra UI
    showMapButton(); 
    if(isMobileWidth) showGyroButton();
    const timeline = document.getElementById("timeline");
    if(timeline) timeline.classList.add("is-visible");

    // 3. ANIMAÇÃO INICIAL
    if (window.viewer.getScene() === 'junta') {
      // Espera 450ms (tempo para o overlay desaparecer) antes de começar
      setTimeout(() => {
        runDropAnimation();
      }, 450);
    }
  }
  
  if(skipBtn) skipBtn.addEventListener("pointerdown", (e)=>{ 
    e.preventDefault(); 
    startTour(); 
  });
  
  // Timeout automático se ninguém clicar
  setTimeout(startTour, INTRO_DURATION_MS);
});