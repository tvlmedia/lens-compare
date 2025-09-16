// ===== LENS COMPARISON TOOL – CLEANED =====

// --- globals/flags (vóór gebruik) ---
let sbsActive = false;
let isExportingPdf = false;

// --- helpers ---
const byId = (id) => document.getElementById(id);
const isMobile = () => window.innerWidth < 768;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

if (isMobile()) document.body.classList.add("mobile-mode");

// === SENSOR DATA (mm) ===
const cameras = { /* … laat jouw camera object hier ongewijzigd … */ };

// --- DOM refs (met guards) ---
const cameraSelect        = byId("cameraSelect");
const sensorFormatSelect  = byId("sensorFormatSelect");
const comparisonWrapper   = byId("comparisonWrapper");
const leftSelect          = byId("leftLens");
const rightSelect         = byId("rightLens");
const tStopLeftSelect     = byId("tStopLeftSelect");
const tStopRightSelect    = byId("tStopRightSelect");
const focalLengthSelect   = byId("focalLength");
const beforeImgTag        = byId("beforeImgTag");
const afterImgTag         = byId("afterImgTag");
const afterWrapper        = byId("afterWrapper");
const slider              = byId("slider");
const leftLabel           = byId("leftLabel");
const rightLabel          = byId("rightLabel");
const downloadLeftRawBtn  = byId("downloadLeftRawButton");
const downloadRightRawBtn = byId("downloadRightRawButton");
const flareToggle         = byId("flareToggle");
const detailOverlay       = byId("detailOverlay");
const leftDetail          = byId("leftDetail");
const rightDetail         = byId("rightDetail");
const leftDetailImg       = leftDetail?.querySelector("img");
const rightDetailImg      = rightDetail?.querySelector("img");
const detailToggleButton  = byId("detailViewToggle");

// --- constants/config ---
const BASE_SENSOR = cameras["Sony Venice"]["6K 3:2"];
const IMG_BASE = "https://tvlmedia.github.io/lens-compare/images/";
const RAW_BASE = IMG_BASE + "raw/";
const DEFAULT_T_STOPS = ["2.8", "5.6"];
const CONFIG = {
  PDF: { TOP_BAR: 40, BOTTOM_BAR: 80, PAGE_MARGIN: 24, EXPORT_SCALE: 8 },
  ZOOM_BOX: { ZOOM: 3.2, SIZE: 260 },
  SCALE: { MIN: 100, MAX: 130 }
};

// --- lens data (ongewijzigd waar mogelijk, maar opgeschoond) ---
const lenses = [
  "IronGlass Red P","IronGlass MKII","IronGlass Zeiss Jena",
  "DZO Vespid","DZO Arles","Cooke Panchro FF","Lomo Standard Speed"
];

const notes = { /* … jouw notes … */ };

// Alleen bestandsnamen (zonder pad)
const rawFileMap = {
  "ironglass_red_p_35mm_t2_8": "RedP_37mm_T2.8_RAW.tif",
  "ironglass_zeiss_jena_35mm_t2_8": "ZeissJena_35mm_T2.8_RAW.tif",
  "ironglass_red_p_50mm_t2_8": "RedP_58mm_T2.8_RAW.tif",
  "ironglass_zeiss_jena_50mm_t2_8": "ZeissJena_50mm_T2.8_RAW.tif",
  "cooke_panchro_ff_50mm_t2_8": "CookeFF_50mm_T2.8_RAW.tif"
};

// Alleen expliciete uitzonderingen hier; standaardnaamgeving fallbackt in resolveImagePath()
const lensImageMap = {
  "ironglass_red_p_35mm_t2_8":   "red_p_37mm_t2_8.jpg",
  "ironglass_red_p_50mm_t2_8":   "red_p_58mm_t2_8.jpg",
  "ironglass_red_p_75mm_t2_8":   "red_p_85mm_t2_8.jpg",
  "ironglass_mkii_35mm_t2_8":    "mkii_37mm_t2_8.jpg",
  "ironglass_mkii_50mm_t2_8":    "mkii_50mm_t2_8.jpg",
  "ironglass_mkii_75mm_t2_8":    "mkii_85mm_t2_8.jpg",
  "ironglass_zeiss_jena_75mm_t2_8": "jena_80mm_t2_8.jpg",
};

const lensDescriptions = { /* … jouw teksten/urls … */ };

// --- SBS wrapper ---
const sbsWrapper = document.createElement("div");
sbsWrapper.id = "sbsWrapper";
sbsWrapper.innerHTML = `
  <div class="pane"><img id="sbsLeftImg"  alt=""></div>
  <div class="pane"><img id="sbsRightImg" alt=""></div>
`;
comparisonWrapper?.appendChild(sbsWrapper);
sbsWrapper.style.display = "none";
const sbsLeftImg  = sbsWrapper.querySelector("#sbsLeftImg");
const sbsRightImg = sbsWrapper.querySelector("#sbsRightImg");

// --- utils fullscreen/size ---
const isWrapperFullscreen = () => {
  const fe = document.fullscreenElement || document.webkitFullscreenElement;
  return fe === comparisonWrapper;
};
const enterWrapperFullscreen = async () =>
  comparisonWrapper?.requestFullscreen?.() || comparisonWrapper?.webkitRequestFullscreen?.();
const exitAnyFullscreen = async () =>
  document.exitFullscreen?.() || document.webkitExitFullscreen?.();

function clearInlineHeights() {
  ["height","min-height","max-height"].forEach(prop =>
    comparisonWrapper?.style.removeProperty(prop)
  );
}
function setWrapperSizeByAR(w, h) {
  if (!comparisonWrapper || isWrapperFullscreen()) return;
  const width = comparisonWrapper.getBoundingClientRect().width;
  const arWidth = sbsActive ? (w * 2) : w;
  const height = Math.round(width * (h / arWidth));
  comparisonWrapper.style.removeProperty("aspect-ratio");
  comparisonWrapper.style.setProperty("height",     `${height}px`, "important");
  comparisonWrapper.style.setProperty("min-height", `${height}px`, "important");
  comparisonWrapper.style.setProperty("max-height", `${height}px`, "important");
}
const getCurrentWH = () => {
  const cam = cameraSelect?.value;
  const fmt = sensorFormatSelect?.value;
  if (!cam || !fmt) return { w: BASE_SENSOR.w, h: BASE_SENSOR.h };
  return cameras[cam][fmt];
};
const getTargetAR = () => {
  const { w, h } = getCurrentWH();
  return sbsActive ? (2 * w) / h : w / h;
};

// --- letterbox/pillarbox berekening + slider helpers ---
function updateFullscreenBars() {
  if (!comparisonWrapper) return;

  if (sbsActive) {
    ["--lb-top","--lb-bottom","--lb-left","--lb-right"].forEach(v =>
      comparisonWrapper.style.setProperty(v, "0px")
    );
    comparisonWrapper._lbLeft = comparisonWrapper._lbRight =
    comparisonWrapper._lbTop  = comparisonWrapper._lbBottom = 0;
    comparisonWrapper._usableW = comparisonWrapper.getBoundingClientRect().width;
    return;
  }
  const rect = comparisonWrapper.getBoundingClientRect();
  const hostW = Math.max(1, Math.round(rect.width));
  const hostH = Math.max(1, Math.round(rect.height));
  const targetAR = getTargetAR();
  const hostAR = hostW / hostH;

  let usedW, usedH, lbLeft=0, lbRight=0, lbTop=0, lbBottom=0;
  if (hostAR > targetAR) {
    usedH = hostH; usedW = Math.round(usedH * targetAR);
    lbLeft = lbRight = Math.floor((hostW - usedW) / 2);
  } else {
    usedW = hostW; usedH = Math.round(usedW / targetAR);
    lbTop = lbBottom = Math.floor((hostH - usedH) / 2);
  }
  comparisonWrapper.style.setProperty("--lb-top",    lbTop + "px");
  comparisonWrapper.style.setProperty("--lb-bottom", lbBottom + "px");
  comparisonWrapper.style.setProperty("--lb-left",   lbLeft + "px");
  comparisonWrapper.style.setProperty("--lb-right",  lbRight + "px");
  comparisonWrapper._lbLeft   = lbLeft;
  comparisonWrapper._lbRight  = lbRight;
  comparisonWrapper._lbTop    = lbTop;
  comparisonWrapper._lbBottom = lbBottom;
  comparisonWrapper._usableW  = usedW;
}
function resetSplitToMiddle() {
  if (!comparisonWrapper || !afterWrapper || !slider || sbsActive) return;
  const rect    = comparisonWrapper.getBoundingClientRect();
  const lbLeft  = comparisonWrapper._lbLeft  || 0;
  const lbRight = comparisonWrapper._lbRight || 0;
  const usable  = Math.max(1, Math.round(rect.width - lbLeft - lbRight));
  const mid     = Math.round(usable / 2);
  const inset   = `inset(0 ${lbRight + (usable - mid)}px 0 ${lbLeft}px)`;
  afterWrapper.style.clipPath = inset;
  afterWrapper.style.webkitClipPath = inset;
  slider.style.left = (lbLeft + mid) + "px";

  const lbTop = comparisonWrapper._lbTop || 0;
  const lbBottom = comparisonWrapper._lbBottom || 0;
  const usableH = Math.max(1, Math.round(rect.height - lbTop - lbBottom));
  slider.style.top = lbTop + "px";
  slider.style.height = usableH + "px";
  slider.style.bottom = "auto";
}
function updateSliderPosition(clientX) {
  if (!comparisonWrapper || !afterWrapper || !slider) return;
  const rect = comparisonWrapper.getBoundingClientRect();
  const lbLeft  = comparisonWrapper._lbLeft  || 0;
  const lbRight = comparisonWrapper._lbRight || 0;
  const usable  = Math.max(1, Math.round(rect.width - lbLeft - lbRight));
  const xInUsable = clientX - rect.left - lbLeft;
  const clamped = clamp(Math.round(xInUsable), 0, usable);

  const leftInsetPx  = lbLeft;
  const rightInsetPx = lbRight + (usable - clamped);
  const OVERLAP = 1;
  const inset = `inset(0 ${Math.max(0, rightInsetPx - OVERLAP)}px 0 ${leftInsetPx}px)`;
  afterWrapper.style.clipPath = inset;
  afterWrapper.style.webkitClipPath = inset;
  slider.style.left = (lbLeft + clamped) + "px";

  const lbTop    = comparisonWrapper._lbTop    || 0;
  const lbBottom = comparisonWrapper._lbBottom || 0;
  const usableH = Math.max(1, Math.round(rect.height - lbTop - lbBottom));
  slider.style.top = lbTop + "px";
  slider.style.height = usableH + "px";
  slider.style.bottom = "auto";
}

// --- sensor format toepassen ---
function applyCurrentFormat() {
  const cam = cameraSelect?.value;
  const fmt = sensorFormatSelect?.value;
  if (!cam || !fmt) return;
  const { w, h } = cameras[cam][fmt];

  comparisonWrapper?.style.removeProperty("--sensor-scale");
  setWrapperSizeByAR(w, h);
  document.body.classList.add("sensor-mode");

  let scale = BASE_SENSOR.w / w;
  if (Math.abs(BASE_SENSOR.w - w) < 0.1) scale = 1;
  comparisonWrapper?.style.setProperty("--sensor-scale", scale.toFixed(4));

  updateFullscreenBars();
  resetSplitToMiddle();
}

// --- dropdowns vullen ---
Object.keys(cameras).forEach(cam => cameraSelect?.add(new Option(cam, cam)));
cameraSelect?.addEventListener("change", () => {
  sensorFormatSelect.innerHTML = "";
  const cam = cameraSelect.value;
  if (!cam) {
    sensorFormatSelect.disabled = true;
    document.body.classList.remove("sensor-mode");
    comparisonWrapper?.style.removeProperty("height");
    comparisonWrapper?.style.setProperty("aspect-ratio", "auto");
    return;
  }
  Object.entries(cameras[cam]).forEach(([fmt, obj]) =>
    sensorFormatSelect.add(new Option(obj.label, fmt))
  );
  sensorFormatSelect.disabled = false;
  sensorFormatSelect.dispatchEvent(new Event("change"));
});
sensorFormatSelect?.addEventListener("change", applyCurrentFormat);

// --- window events ---
document.addEventListener("fullscreenchange", onFsChange);
document.addEventListener("webkitfullscreenchange", onFsChange);
function onFsChange() {
  if (!comparisonWrapper || !slider) return;
  if (isWrapperFullscreen()) {
    clearInlineHeights();
    pulseFsBars({ duration: 1400 });
  } else {
    const { w, h } = getCurrentWH();
    comparisonWrapper.style.setProperty("aspect-ratio", "auto");
    setWrapperSizeByAR(w, h);
    comparisonWrapper.style.setProperty('--lb-top','0px');
    comparisonWrapper.style.setProperty('--lb-bottom','0px');
    comparisonWrapper.style.setProperty('--lb-left','0px');
    comparisonWrapper.style.setProperty('--lb-right','0px');
    slider.style.top = '0px';
    slider.style.height = '100%';
    slider.style.bottom = '0';
  }
  updateFullscreenBars();
  requestAnimationFrame(() => { updateFullscreenBars(); resetSplitToMiddle(); });
  requestAnimationFrame(() => { if (!isWrapperFullscreen()) setWrapperSizeByAR(...Object.values(getCurrentWH())); });
}
window.addEventListener("resize", () => {
  if (isWrapperFullscreen()) { updateFullscreenBars(); resetSplitToMiddle(); }
  else { const { w, h } = getCurrentWH(); setWrapperSizeByAR(w, h); }
});

// --- T-stops + scale ---
function fillTStops(selectEl, opts = DEFAULT_T_STOPS) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  opts.forEach(t => selectEl.add(new Option(`T${t}`, t)));
}
fillTStops(tStopLeftSelect);
fillTStops(tStopRightSelect);
tStopLeftSelect && (tStopLeftSelect.value = "2.8");
tStopRightSelect && (tStopRightSelect.value = "2.8");

const scaleSlider = byId("scaleSlider");
const scaleVal    = byId("scaleVal");
let userScale = 1;
function setUserScaleFromPct(pct) {
  userScale = clamp(pct / 100, 1.0, 1.3);
  document.documentElement.style.setProperty("--viewer-scale", String(userScale));
  if (scaleVal) scaleVal.textContent = Math.round(userScale * 100) + "%";
  updateFullscreenBars(); resetSplitToMiddle();
}
scaleSlider?.addEventListener("input", (e) => setUserScaleFromPct(e.target.value));
if (scaleSlider) setUserScaleFromPct(scaleSlider.value || 100);

// --- flare toggle (guarded) ---
if (flareToggle) {
  flareToggle.dataset.mode = flareToggle.dataset.mode || "noflare";
  flareToggle.textContent  = flareToggle.dataset.mode === "flare" ? "Flare: ON" : "Flare: OFF";
  flareToggle.addEventListener("click", () => {
    const cur = flareToggle.dataset.mode === "flare" ? "noflare" : "flare";
    flareToggle.dataset.mode = cur;
    flareToggle.textContent  = cur === "flare" ? "Flare: ON" : "Flare: OFF";
    updateImages();
  });
}

// --- lens selects ---
lenses.forEach(l => { leftSelect?.add(new Option(l, l)); rightSelect?.add(new Option(l, l)); });

function updateLensInfo() {
  const left = leftSelect?.value, right = rightSelect?.value;
  const lensInfoDiv = byId("lensInfo");
  if (!lensInfoDiv) return;
  lensInfoDiv.innerHTML = `
    <p><strong>${left}:</strong> ${lensDescriptions[left]?.text || ""}</p>
    <p><strong>${right}:</strong> ${lensDescriptions[right]?.text || ""}</p>`;
}

// mapping helpers
const aliasFor = (lens, nominal) => notes[`${lens}_${nominal}`] || nominal;
const resolveImagePath = (lens, nominalFocal, tStr, flare) => {
  const aliasF = aliasFor(lens, nominalFocal);
  const bases = (aliasF !== nominalFocal)
    ? [`${lens}_${aliasF}_t${tStr}`, `${lens}_${nominalFocal}_t${tStr}`]
    : [`${lens}_${nominalFocal}_t${tStr}`];

  const candidates = [];
  bases.forEach(base => {
    if (lensImageMap[`${base}_${flare}`]) candidates.push(lensImageMap[`${base}_${flare}`]);
    if (lensImageMap[base])               candidates.push(lensImageMap[base]);
    candidates.push(`${base}_${flare}.jpg`, `${base}.jpg`);
  });
  return IMG_BASE + candidates[0];
};

function setDownloadButton(buttonEl, key) {
  if (!buttonEl) return;
  const name = rawFileMap[key];
  if (!name) {
    buttonEl.disabled = true;
    buttonEl.title = "RAW download (coming soon)";
    buttonEl.onclick = null;
    return;
  }
  const file = RAW_BASE + name;
  buttonEl.disabled = false;
  buttonEl.title = "Download RAW";
  buttonEl.onclick = () => window.open(file, "_blank", "noopener,noreferrer");
}

function updateImages() {
  if (!leftSelect || !rightSelect || !beforeImgTag || !afterImgTag) return;

  const leftLens  = leftSelect.value.toLowerCase().replace(/\s+/g, "_");
  const rightLens = rightSelect.value.toLowerCase().replace(/\s+/g, "_");
  const tL = (tStopLeftSelect?.value || "2.8").replace(".", "_");
  const tR = (tStopRightSelect?.value || "2.8").replace(".", "_");
  const focalNom  = (focalLengthSelect?.value || "35mm");
  const flareMode = flareToggle?.dataset.mode || "noflare";

  const imgLeft  = resolveImagePath(leftLens,  focalNom, tL, flareMode);
  const imgRight = resolveImagePath(rightLens, focalNom, tR, flareMode);

  beforeImgTag.src = imgRight; // rechts = before
  afterImgTag.src  = imgLeft;  // links  = after

  const leftF  = aliasFor(leftLens,  focalNom);
  const rightF = aliasFor(rightLens, focalNom);
  const leftUrl  = lensDescriptions[leftSelect.value]?.url  || "#";
  const rightUrl = lensDescriptions[rightSelect.value]?.url || "#";
  if (leftLabel)  leftLabel.innerHTML  = `Lens: <a href="${leftUrl}" target="_blank" rel="noopener noreferrer">${leftSelect.value} ${leftF} T${tStopLeftSelect?.value || "2.8"}</a>`;
  if (rightLabel) rightLabel.innerHTML = `Lens: <a href="${rightUrl}" target="_blank" rel="noopener noreferrer">${rightSelect.value} ${rightF} T${tStopRightSelect?.value || "2.8"}</a>`;

  setDownloadButton(downloadLeftRawBtn,  `${leftLens}_${leftF}_t${tL}`);
  setDownloadButton(downloadRightRawBtn, `${rightLens}_${rightF}_t${tR}`);

  if (sbsActive) {
    sbsLeftImg.src  = afterImgTag.src;
    sbsRightImg.src = beforeImgTag.src;
  }
  resetSplitToMiddle();
}

// init lens info + sync T-stops
function syncTStopsOnContextChange() {
  const t = tStopLeftSelect?.value || "2.8";
  if (tStopLeftSelect)  tStopLeftSelect.value  = t;
  if (tStopRightSelect) tStopRightSelect.value = t;
}
[leftSelect, rightSelect].forEach(el => el?.addEventListener("change", updateLensInfo));
tStopLeftSelect?.addEventListener("change", updateImages);
tStopRightSelect?.addEventListener("change", updateImages);
focalLengthSelect?.addEventListener("change", () => { syncTStopsOnContextChange(); updateImages(); });
[leftSelect, rightSelect].forEach(el => el?.addEventListener("change", () => { syncTStopsOnContextChange(); updateImages(); }));

// init default selectie
if (leftSelect)  leftSelect.value  = "IronGlass Red P";
if (rightSelect) rightSelect.value = "IronGlass Zeiss Jena";
if (focalLengthSelect) focalLengthSelect.value = "35mm";
syncTStopsOnContextChange();
updateLensInfo();
updateImages();

// camera init
if (cameraSelect) {
  cameraSelect.value = "Sony Venice";
  cameraSelect.dispatchEvent(new Event("change"));
}

updateFullscreenBars();
resetSplitToMiddle();
if (isWrapperFullscreen()) clearInlineHeights();

// --- slider drag ---
let isDragging = false;
if (slider) {
  slider.addEventListener("mousedown", () => { isDragging = true; document.body.classList.add("dragging"); });
  window.addEventListener("mouseup",   () => { isDragging = false; document.body.classList.remove("dragging"); });
  window.addEventListener("mousemove", (e) => { if (isDragging) updateSliderPosition(e.clientX); });

  slider.addEventListener("touchstart", (e) => { e.preventDefault(); isDragging = true; document.body.classList.add("dragging"); }, { passive: false });
  window.addEventListener("touchend",   () => { isDragging = false; document.body.classList.remove("dragging"); });
  window.addEventListener("touchmove",  (e) => { if (isDragging && e.touches.length === 1) { e.preventDefault(); updateSliderPosition(e.touches[0].clientX);} }, { passive: false });
}

// wissel-knop
byId("toggleButton")?.addEventListener("click", () => {
  const l = leftSelect.value; leftSelect.value = rightSelect.value; rightSelect.value = l;
  const t = tStopLeftSelect.value; tStopLeftSelect.value = tStopRightSelect.value; tStopRightSelect.value = t;
  updateLensInfo(); updateImages();
});

// fullscreen toggle
async function toggleFullscreen() {
  if (!comparisonWrapper) return;
  if (isWrapperFullscreen()) {
    await exitAnyFullscreen();
    const { w, h } = getCurrentWH();
    comparisonWrapper.style.setProperty("aspect-ratio", "auto");
    setWrapperSizeByAR(w, h);
    comparisonWrapper.style.setProperty('--lb-top','0px');
    comparisonWrapper.style.setProperty('--lb-bottom','0px');
    comparisonWrapper.style.setProperty('--lb-left','0px');
    comparisonWrapper.style.setProperty('--lb-right','0px');
  } else {
    clearInlineHeights();
    await enterWrapperFullscreen();
    pulseFsBars({ duration: 1400 });
  }
  updateFullscreenBars();
  requestAnimationFrame(() => { updateFullscreenBars(); resetSplitToMiddle(); });
}
byId("fullscreenButton")?.addEventListener("click", toggleFullscreen);

// SBS toggler
function setSideBySide(on, { force=false } = {}) {
  if (!comparisonWrapper || isExportingPdf && !force) return;
  const next = !!on;
  if (!force && sbsActive === next) return;
  sbsActive = next;
  document.body.classList.toggle("sbs-mode", sbsActive);
  comparisonWrapper.classList.toggle("sbs-mode", sbsActive);

  const beforeWrapper = beforeImgTag?.parentElement;
  if (sbsActive) {
    sbsWrapper.style.display = "flex";
    if (beforeWrapper) beforeWrapper.style.display = "none";
    if (afterWrapper)  afterWrapper.style.display  = "none";
    if (slider) slider.style.display = "none";
    ["--lb-top","--lb-bottom","--lb-left","--lb-right"].forEach(v =>
      comparisonWrapper.style.setProperty(v, "0px")
    );
    comparisonWrapper._lbLeft = comparisonWrapper._lbRight = comparisonWrapper._lbTop = comparisonWrapper._lbBottom = 0;
    if (isWrapperFullscreen()) clearInlineHeights();
    sbsLeftImg.src  = afterImgTag.src;
    sbsRightImg.src = beforeImgTag.src;
  } else {
    sbsWrapper.style.display = "none";
    if (beforeWrapper) beforeWrapper.style.display = "";
    if (afterWrapper)  afterWrapper.style.display  = "";
    if (slider) slider.style.display = "";
  }
  const { w, h } = getCurrentWH();
  setWrapperSizeByAR(w, h);
  requestAnimationFrame(() => setWrapperSizeByAR(w, h));
  if (!sbsActive) { updateFullscreenBars(); resetSplitToMiddle(); }
}
byId("sbsToggle")?.addEventListener("click", () => setSideBySide(!sbsActive));

// pulse FS bars
function pulseFsBars({ duration = 1400 } = {}) {
  const start = performance.now();
  (function tick(now) {
    if (!isWrapperFullscreen()) return;
    updateFullscreenBars(); resetSplitToMiddle();
    if (now - start < duration) requestAnimationFrame(tick);
  })(start);
}

// detail viewer (guarded)
let detailActive = false;
detailToggleButton?.addEventListener("click", () => {
  detailActive = !detailActive;
  detailOverlay?.classList.toggle("active", detailActive);
  detailToggleButton.classList.toggle("active", detailActive);
  if (!detailActive) {
    if (leftDetail)  leftDetail.style.display = "none";
    if (rightDetail) rightDetail.style.display = "none";
  }
});
document.addEventListener("mousemove", (e) => {
  if (!detailActive) return;
  const Z = CONFIG.ZOOM_BOX.ZOOM, S = CONFIG.ZOOM_BOX.SIZE;

  const updateBubble = (box, img, srcEl, rect, rx, ry) => {
    if (!box || !img) return;
    if (img.src !== srcEl.src) img.src = srcEl.src;
    box.style.left = `${e.clientX - S/2}px`;
    box.style.top  = `${e.clientY - S/2}px`;
    box.style.width = box.style.height = `${S}px`;
    box.style.display = "block";
    const zoomW = rect.width*Z, zoomH = rect.height*Z;
    const offX = -(rx*zoomW) + (S/2), offY = -(ry*zoomH) + (S/2);
    img.style.width = `${zoomW}px`; img.style.height = `${zoomH}px`;
    img.style.transform = `translate(${offX}px, ${offY}px)`;
  };

  if (sbsActive && sbsLeftImg && sbsRightImg) {
    const L = sbsLeftImg.getBoundingClientRect();
    const R = sbsRightImg.getBoundingClientRect();
    const inL = e.clientX>=L.left && e.clientX<=L.right && e.clientY>=L.top && e.clientY<=L.bottom;
    const inR = e.clientX>=R.left && e.clientX<=R.right && e.clientY>=R.top && e.clientY<=R.bottom;
    if (!inL && !inR) { if (leftDetail) leftDetail.style.display="none"; if (rightDetail) rightDetail.style.display="none"; return; }
    const rect = inL ? L : R, srcEl = inL ? sbsLeftImg : sbsRightImg;
    const rx = (e.clientX - rect.left)/rect.width, ry = (e.clientY - rect.top)/rect.height;
    updateBubble(leftDetail,  leftDetailImg,  sbsLeftImg,  L, rx, ry);
    updateBubble(rightDetail, rightDetailImg, sbsRightImg, R, rx, ry);
    return;
  }
  if (afterImgTag && beforeImgTag) {
    const A = afterImgTag.getBoundingClientRect();
    const B = beforeImgTag.getBoundingClientRect();
    const inA = e.clientX>=A.left && e.clientX<=A.right && e.clientY>=A.top && e.clientY<=A.bottom;
    const inB = e.clientX>=B.left && e.clientX<=B.right && e.clientY>=B.top && e.clientY<=B.bottom;
    if (!inA && !inB) { if (leftDetail) leftDetail.style.display="none"; if (rightDetail) rightDetail.style.display="none"; return; }
    const rect = inA ? A : B, srcEl = inA ? afterImgTag : beforeImgTag;
    const rx = (e.clientX - rect.left)/rect.width, ry = (e.clientY - rect.top)/rect.height;
    const tgt = inA ? leftDetail : rightDetail, img = inA ? leftDetailImg : rightDetailImg;
    updateBubble(tgt, img, srcEl, rect, rx, ry);
  }
});
comparisonWrapper?.addEventListener("mouseleave", () => {
  if (leftDetail)  leftDetail.style.display  = "none";
  if (rightDetail) rightDetail.style.display = "none";
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && detailActive) {
    detailActive = false;
    detailOverlay?.classList.remove("active");
    detailToggleButton?.classList.remove("active");
    if (leftDetail)  leftDetail.style.display  = "none";
    if (rightDetail) rightDetail.style.display = "none";
  }
});

// --- keyboard shortcuts ---
function onGlobalKeydown(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = (document.activeElement?.tagName || "").toUpperCase();
  if (["INPUT","TEXTAREA"].includes(tag)) return;
  if (isExportingPdf) return;
  const k = (e.key || "").toLowerCase();
  if (k === "p") { e.preventDefault(); toggleFullscreen(); }
  if (k === "d") { e.preventDefault(); detailToggleButton?.click(); }
  if (k === "s") { e.preventDefault(); setSideBySide(!sbsActive); }
  if (k === "f") { e.preventDefault(); flareToggle?.click(); }
}
window.addEventListener("keydown", onGlobalKeydown, { capture: true });

// --- autoscale (ongewijzigde logica, maar compacter) ---
const LENS_SCALE_TABLE = {
  "35mm": { panchro:100,"red p":116,mkii:117,jena:112,vespid:109,arles:110,"lomo standard speed":110 },
  "75mm": { panchro:100,"red p":118,mkii:117,jena:110,vespid:100,arles:100,"lomo standard speed":100 }
};
const normalizeLensKey = (s="") => {
  s = s.toLowerCase();
  if (s.includes("panchro")) return "panchro";
  if (s.includes("red p")) return "red p";
  if (s.includes("mk ii") || s.includes("mkii") || s.includes("mk2")) return "mkii";
  if (s.includes("jena")) return "jena";
  if (s.includes("vespid")) return "vespid";
  if (s.includes("arles")) return "arles";
  if (s.includes("lomo") && s.includes("standard")) return "lomo standard speed";
  return "";
};
const isScaleAllowedBySensor = () => {
  const { w, h } = getCurrentWH(); 
  return (w > 30.721) && (h > 16.201); // kleine marge
};
const scaleForLens = (label, focal) => (LENS_SCALE_TABLE[String(focal).includes("75") ? "75mm" : "35mm"] || {})[normalizeLensKey(label)] || 100;
const applyScalePercent = (pct) => { const p = clamp(Math.round(pct), CONFIG.SCALE.MIN, CONFIG.SCALE.MAX); if (scaleSlider) scaleSlider.value = String(p); setUserScaleFromPct(p); };
function autoScaleNow() {
  if (!isScaleAllowedBySensor()) return applyScalePercent(100);
  const focal = (focalLengthSelect?.value || "35mm");
  applyScalePercent(Math.max(
    scaleForLens(leftSelect?.value || "", focal),
    scaleForLens(rightSelect?.value || "", focal)
  ));
}
["change","input"].forEach(evt => {
  leftSelect?.addEventListener(evt,  autoScaleNow);
  rightSelect?.addEventListener(evt, autoScaleNow);
  focalLengthSelect?.addEventListener(evt, autoScaleNow);
  sensorFormatSelect?.addEventListener(evt, autoScaleNow);
  cameraSelect?.addEventListener(evt, autoScaleNow);
});
autoScaleNow();

// --- veilige links (laat zoals je had) ---
(function enforceBlankTargets(){
  const setBlank = (a) => {
    if (!a.getAttribute("target")) a.setAttribute("target", "_blank");
    const rel = (a.getAttribute("rel") || "").split(/\s+/);
    if (!rel.includes("noopener")) rel.push("noopener");
    if (!rel.includes("noreferrer")) rel.push("noreferrer");
    a.setAttribute("rel", rel.join(" ").trim());
  };
  document.querySelectorAll("a[href]").forEach(setBlank);
  new MutationObserver(muts => muts.forEach(m => {
    m.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.matches?.("a[href]")) setBlank(n);
      n.querySelectorAll?.("a[href]").forEach(setBlank);
    });
  })).observe(document.documentElement, { childList: true, subtree: true });
})();
