/* ===========================================
   LENS COMPARISON TOOL — COMPLETE SCRIPT.JS
   =========================================== */

// -- 0) BASIS: mobile-mode class
if (window.innerWidth < 768) document.body.classList.add("mobile-mode");

// ===== 1) SENSOR DATA (mm) – Venice is de basis (6K 3:2) =====
const cameras = {
  "Sony Venice": {
    "6K 3:2":     { w: 36.167, h: 24.111, label: "6K 3:2" },
    "6K 1.85:1":  { w: 36.203, h: 19.567, label: "6K 1.85:1" },
    "6K 17:9":    { w: 36.203, h: 19.088, label: "6K 17:9" },
    "6K 2.39:1":  { w: 36.167, h: 15.153, label: "6K 2.39:1" },
    "5.7K 16:9":  { w: 33.907, h: 19.076, label: "5.7K 16:9" },
    "4K 6:5":     { w: 24.494, h: 20.523, label: "4K 6:5" },
    "4K 4:3":     { w: 24.494, h: 18.084, label: "4K 4:3" },
    "4K 17:9":    { w: 24.494, h: 12.917, label: "4K 17:9" },
    "4K 2.39:1":  { w: 24.494, h: 10.262, label: "4K 2.39:1" },
    "3.8K 16:9":  { w: 22.963, h: 12.917, label: "3.8K 16:9" },
  },
  "Arri Alexa Mini": {
    "Open Gate":       { w: 28.248, h: 18.166, label: "Open Gate" },
    "3.2K":            { w: 26.400, h: 14.850, label: "3.2K (16:9)" },
    "4K UHD":          { w: 26.400, h: 14.850, label: "4K UHD (16:9)" },
    "4:3 2.8K":        { w: 23.760, h: 17.820, label: "4:3 2.8K" },
    "HD":              { w: 23.760, h: 13.365, label: "HD (16:9)" },
    "2K":              { w: 23.661, h: 13.299, label: "2K (16:9)" },
    "2.39:1 2K Ana":   { w: 42.240, h: 17.696, label: "2.39:1 2K Ana" }, // anamorf tab
    "HD Ana":          { w: 31.680, h: 17.820, label: "HD Ana (16:9)" },
    "S16 HD":          { w: 13.200, h: 7.425,  label: "S16 HD (16:9)" },
  },
};

// ===== 2) ELEMENTEN =====
const cameraSelect         = document.getElementById("cameraSelect");
const sensorFormatSelect   = document.getElementById("sensorFormatSelect");
const comparisonWrapper    = document.getElementById("comparisonWrapper");
const beforeImgTag         = document.getElementById("beforeImgTag");
const afterImgTag          = document.getElementById("afterImgTag");
const afterWrapper         = document.getElementById("afterWrapper");
const slider               = document.getElementById("slider");

const leftSelect           = document.getElementById("leftLens");
const rightSelect          = document.getElementById("rightLens");
const tStopSelect          = document.getElementById("tStop");
const focalLengthSelect    = document.getElementById("focalLength");
const leftLabel            = document.getElementById("leftLabel");
const rightLabel           = document.getElementById("rightLabel");
const lensInfoDiv          = document.getElementById("lensInfo");
const downloadLeftRawBtn   = document.getElementById("downloadLeftRawButton");
const downloadRightRawBtn  = document.getElementById("downloadRightRawButton");

const toggleButton         = document.getElementById("toggleButton");
const fullscreenButton     = document.getElementById("fullscreenButton");
const downloadPdfButton    = document.getElementById("downloadPdfButton");

const detailOverlay        = document.getElementById("detailOverlay");
const leftDetail           = document.getElementById("leftDetail");
const rightDetail          = document.getElementById("rightDetail");
const leftDetailImg        = leftDetail?.querySelector("img");
const rightDetailImg       = rightDetail?.querySelector("img");
const detailToggleButton   = document.getElementById("detailViewToggle");

// ===== 3) CONSTANTEN =====
const BASE_SENSOR = cameras["Sony Venice"]["6K 3:2"];

// ===== 4) HULPFUNCTIES (SENSOR / FULLSCREEN) =====
function clearInlineHeights() {
  comparisonWrapper.style.removeProperty('height');
  comparisonWrapper.style.removeProperty('min-height');
  comparisonWrapper.style.removeProperty('max-height');
}

function setWrapperSizeByAR(w, h) {
  // In fullscreen geen inline heights forceren — AR + letterbox via CSS/JS
  if (document.fullscreenElement === comparisonWrapper) return;

  const width  = comparisonWrapper.getBoundingClientRect().width;
  const height = Math.round(width * (h / w));
  comparisonWrapper.style.removeProperty('aspect-ratio');
  comparisonWrapper.style.setProperty('height',     `${height}px`, 'important');
  comparisonWrapper.style.setProperty('min-height', `${height}px`, 'important');
  comparisonWrapper.style.setProperty('max-height', `${height}px`, 'important');
}

function getCurrentWH() {
  const cam = cameraSelect?.value;
  const fmt = sensorFormatSelect?.value;
  if (!cam || !fmt) return { w: BASE_SENSOR.w, h: BASE_SENSOR.h };
  return cameras[cam][fmt];
}

function setFullscreenARClass(fmtLabel) {
  document.body.classList.remove(
    "fs-3-2","fs-185","fs-17-9","fs-239","fs-16-9","fs-6-5","fs-4-3","fs-155"
  );
  const f = (fmtLabel || "").toLowerCase();
  if (f.includes("open gate"))   return document.body.classList.add("fs-155");  // ~1.55:1
  if (f.includes("3:2"))         return document.body.classList.add("fs-3-2");
  if (f.includes("1.85:1"))      return document.body.classList.add("fs-185");
  if (f.includes("17:9"))        return document.body.classList.add("fs-17-9");
  if (f.includes("2.39:1"))      return document.body.classList.add("fs-239");
  if (f.includes("16:9"))        return document.body.classList.add("fs-16-9");
  if (f.includes("6:5"))         return document.body.classList.add("fs-6-5");
  if (f.includes("4:3"))         return document.body.classList.add("fs-4-3");
}

function updateFullscreenBars() {
  // reset als niet FS of een ander element FS is
  if (document.fullscreenElement !== comparisonWrapper) {
    comparisonWrapper.style.setProperty('--lb-top', '0px');
    comparisonWrapper.style.setProperty('--lb-bottom', '0px');
    comparisonWrapper.style.setProperty('--lb-left', '0px');
    comparisonWrapper.style.setProperty('--lb-right', '0px');
    return;
  }

  const { w, h } = getCurrentWH();
  const targetAR = w / h;
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const viewAR = viewW / viewH;

  let top = 0, bottom = 0, left = 0, right = 0;

  if (viewAR > targetAR) {
    // Pillarbox links/rechts
    const usedW = Math.round(viewH * targetAR);
    const side  = Math.max(0, Math.floor((viewW - usedW) / 2));
    left = right = side;
  } else {
    // Letterbox boven/onder
    const usedH = Math.round(viewW / targetAR);
    const bar   = Math.max(0, Math.floor((viewH - usedH) / 2));
    top = bottom = bar;
  }

  comparisonWrapper.style.setProperty('--lb-top',    `${top}px`);
  comparisonWrapper.style.setProperty('--lb-bottom', `${bottom}px`);
  comparisonWrapper.style.setProperty('--lb-left',   `${left}px`);
  comparisonWrapper.style.setProperty('--lb-right',  `${right}px`);
}

function applyCurrentFormat() {
  const cam = cameraSelect.value;
  const fmt = sensorFormatSelect.value;
  if (!cam || !fmt) return;

  const { w, h } = cameras[cam][fmt];

  // Klasse voor AR in fullscreen
  const fmtLabel = cameras[cam][fmt].label || fmt;
  setFullscreenARClass(fmtLabel);

  // Niet fullscreen → hoogte forceren op ratio
  setWrapperSizeByAR(w, h);
  requestAnimationFrame(() => setWrapperSizeByAR(w, h));

  // Sensor-mode aan
  document.body.classList.add("sensor-mode");

  // Schaalfactor: horizontale vergelijking tegen Venice 6K 3:2
  let scale = BASE_SENSOR.w / w;
  if (Math.abs(BASE_SENSOR.w - w) < 0.1) scale = 1; // micro‑verschillen dempen
  comparisonWrapper.style.setProperty("--sensor-scale", scale.toFixed(4));

  // Letter-/pillarbox in fullscreen
  updateFullscreenBars();
}

// ===== 5) LENS DATA =====
const lenses = [
  "IronGlass Red P",
  "IronGlass Zeiss Jena",
  "DZO Vespid",
  "DZO Arles",
  "Cooke Panchro FF",
  "Lomo Standard Speed"
];

const notes = {
  "ironglass_red_p_35mm": "37mm",
  "ironglass_zeiss_jena_35mm": "35mm",
  "ironglass_red_p_50mm": "58mm",
  "ironglass_zeiss_jena_50mm": "50mm",
  "cooke_panchro_ff_25mm": "32mm",
  "cooke_panchro_ff_50mm": "50mm"
};

const lensImageMap = {
  "ironglass_red_p_35mm_t2_8": "red_p_37mm_t2_8.jpg",
  "ironglass_zeiss_jena_35mm_t2_8": "zeiss_jena_35mm_t2_8.jpg",
  "ironglass_red_p_50mm_t2_8": "red_p_58mm_t2_8.jpg",
  "ironglass_zeiss_jena_50mm_t2_8": "zeiss_jena_50mm_t2_8.jpg",
  "cooke_panchro_ff_50mm_t2_8": "cooke_panchro_ff_50mm_t2_8.jpg"
};

const lensDescriptions = {
  "IronGlass Red P": {
    text: "De IronGlass RED P set is een zeldzame vondst: bestaande uit de alleroudste series Sovjet-lenzen met single coating en maximale karakterweergave. Geen tweaks, geen trucjes – puur vintage glasoptiek.",
    url: "https://tvlrental.nl/ironglassredp/"
  },
  "IronGlass Zeiss Jena": {
    text: "De Zeiss Jena’s zijn een uitstekende keuze voor cinematografen die zoeken naar een zachte vintage signatuur zonder zware distortie of gekke flares. Ze voegen karakter toe, maar laten de huid spreken.",
    url: "https://tvlrental.nl/ironglasszeissjena/"
  },
  "Cooke Panchro FF": {
    text: "Karakteristieke full frame lenzenset met een klassieke Cooke-look. Subtiele glow en zachte roll-off, perfect voor een romantische of authentieke sfeer.",
    url: "https://tvlrental.nl/cookepanchro/"
  },
  "DZO Arles": {
    text: "Scherpe en cleane full-frame cine primes met zachte bokeh en moderne flarecontrole. Ideaal voor commercials en high-end narratieve projecten.",
    url: "https://tvlrental.nl/dzoarles/"
  },
  "DZO Vespid": {
    text: "Betaalbare maar serieuze cine-lenzen met consistente look, lichte vintage feel en goede optische prestaties. Full frame coverage.",
    url: "https://tvlrental.nl/dzovespid/"
  },
  "Lomo Standard Speed": {
    text: "Zachte vintage lenzen met unieke glow en flare. Niet voor elk project, maar heerlijk voor rauwe of experimentele looks.",
    url: "https://tvlrental.nl/lomostandardspeed/"
  }
};

// ===== 6) LENS UI INIT =====
function updateLensInfo() {
  const left  = leftSelect.value;
  const right = rightSelect.value;
  const leftDesc  = lensDescriptions[left]?.text  || "";
  const rightDesc = lensDescriptions[right]?.text || "";
  lensInfoDiv.innerHTML = `
    <p><strong>${left}:</strong> ${leftDesc}</p>
    <p><strong>${right}:</strong> ${rightDesc}</p>
  `;
}

lenses.forEach(lens => {
  leftSelect?.add(new Option(lens, lens));
  rightSelect?.add(new Option(lens, lens));
});

// RAW file map
const rawFileMap = {
  "ironglass_red_p_35mm_t2_8": "images/raw/RedP_37mm_T2.8_RAW.tif",
  "ironglass_zeiss_jena_35mm_t2_8": "images/raw/ZeissJena_35mm_T2.8_RAW.tif",
  "ironglass_red_p_50mm_t2_8": "images/raw/RedP_58mm_T2.8_RAW.tif",
  "ironglass_zeiss_jena_50mm_t2_8": "images/raw/ZeissJena_50mm_T2.8_RAW.tif",
  "cooke_panchro_ff_50mm_t2_8": "images/raw/CookeFF_50mm_T2.8_RAW.tif"
};

function setDownloadButton(buttonEl, key) {
  if (!buttonEl) return;
  const file = rawFileMap[key];
  if (file) {
    buttonEl.disabled = false;
    buttonEl.title = "Download RAW";
    buttonEl.onclick = () => {
      const url = new URL(file, location.href);
      const sameOrigin = url.origin === location.origin;
      if (sameOrigin) {
        const a = document.createElement("a");
        a.href = url.href;
        a.download = url.pathname.split("/").pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        window.open(url.href, "_blank", "noopener,noreferrer");
      }
    };
  } else {
    buttonEl.disabled = true;
    buttonEl.title = "RAW download (coming soon)";
    buttonEl.onclick = null;
  }
}

function updateImages() {
  const leftLens   = leftSelect.value.toLowerCase().replace(/\s+/g, "_");
  const rightLens  = rightSelect.value.toLowerCase().replace(/\s+/g, "_");
  const tStop      = tStopSelect.value.replace(".", "_");
  const focal      = focalLengthSelect.value;

  const leftBaseKey  = `${leftLens}_${focal}`;
  const rightBaseKey = `${rightLens}_${focal}`;
  const leftKey      = `${leftLens}_${focal}_t${tStop}`;
  const rightKey     = `${rightLens}_${focal}_t${tStop}`;

  const imgLeft  = `images/${lensImageMap[leftKey]  || leftKey  + ".jpg"}`;
  const imgRight = `images/${lensImageMap[rightKey] || rightKey + ".jpg"}`;

  // rechts (before) en links (after) zoals jij het gebruikt
  beforeImgTag.src = imgRight;
  afterImgTag.src  = imgLeft;

  const tStopFormatted = `T${tStopSelect.value}`;
  const leftUrl  = lensDescriptions[leftSelect.value]?.url  || "#";
  const rightUrl = lensDescriptions[rightSelect.value]?.url || "#";

  // Beginstand slider 50/50
  afterWrapper.style.clipPath      = 'inset(0 50% 0 0)';
  afterWrapper.style.webkitClipPath= 'inset(0 50% 0 0)';
  slider.style.left = '50%';

  // RAW buttons
  setDownloadButton(downloadLeftRawBtn,  leftKey);
  setDownloadButton(downloadRightRawBtn, rightKey);

  // Labels + link
  leftLabel.innerHTML  = `Lens: <a href="${leftUrl}" target="_blank" rel="noopener noreferrer">${leftSelect.value} ${notes[leftBaseKey] || focal} ${tStopFormatted}</a>`;
  rightLabel.innerHTML = `Lens: <a href="${rightUrl}" target="_blank" rel="noopener noreferrer">${rightSelect.value} ${notes[rightBaseKey] || focal} ${tStopFormatted}</a>`;
}

// ===== 7) SLIDER (clip-path) =====
let isDragging = false;

function updateSliderPosition(clientX) {
  const rect = comparisonWrapper.getBoundingClientRect();
  const offset = Math.max(0, Math.min(clientX - rect.left, rect.width));
  const percent = (offset / rect.width) * 100;
  const rightInset = 100 - percent; // deel dat we rechts "dicht" houden

  afterWrapper.style.clipPath       = `inset(0 ${rightInset}% 0 0)`;
  afterWrapper.style.webkitClipPath = `inset(0 ${rightInset}% 0 0)`;
  slider.style.left = `${percent}%`;
}

slider.addEventListener("mousedown", () => {
  isDragging = true;
  document.body.classList.add("dragging");
});
window.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.classList.remove("dragging");
});
window.addEventListener("mousemove", e => {
  if (isDragging) updateSliderPosition(e.clientX);
});
slider.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isDragging = true;
  document.body.classList.add("dragging");
}, { passive: false });
window.addEventListener("touchend", () => {
  isDragging = false;
  document.body.classList.remove("dragging");
});
window.addEventListener("touchmove", (e) => {
  if (!isDragging || e.touches.length !== 1) return;
  e.preventDefault();
  updateSliderPosition(e.touches[0].clientX);
}, { passive: false });

// ===== 8) KNOPPEN =====
toggleButton?.addEventListener("click", () => {
  const left  = leftSelect.value;
  const right = rightSelect.value;
  leftSelect.value  = right;
  rightSelect.value = left;
  updateLensInfo();
  updateImages();
});

fullscreenButton?.addEventListener("click", async () => {
  if (document.fullscreenElement === comparisonWrapper) {
    await document.exitFullscreen();
  } else {
    clearInlineHeights(); // laat fullscreen AR/balken hun werk doen
    await comparisonWrapper.requestFullscreen();
  }
  requestAnimationFrame(() => {
    clearInlineHeights();
    updateFullscreenBars();
  });
});

// ===== 9) PDF EXPORT =====
downloadPdfButton?.addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const left  = leftSelect.value;
  const right = rightSelect.value;
  const focal = focalLengthSelect.value;
  const t     = tStopSelect.value;

  const leftText  = leftLabel.textContent;
  const rightText = rightLabel.textContent;

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const logoUrl = "https://tvlmedia.github.io/lens-compare/LOGOVOORPDF.png";
  const logo = await loadImage(logoUrl);

  const comparison = comparisonWrapper;

  async function renderImage(imgEl) {
    const canvas = document.createElement("canvas");
    canvas.width = imgEl.naturalWidth || 1920;
    canvas.height= imgEl.naturalHeight || 1080;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgEl.src;
    await new Promise(resolve => img.onload = resolve);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 1.0);
  }

  async function drawFullWidthImage(imgData, top = 40, bottom = 70) {
    const img = new Image();
    img.src = imgData;
    await new Promise(r => img.onload = r);
    const imgAspect  = img.width / img.height;
    const pageAspect = pageWidth / (pageHeight - top - bottom);
    let imgWidth, imgHeight, x, y;
    if (imgAspect > pageAspect) {
      imgHeight = pageHeight - top - bottom;
      imgWidth  = imgHeight * imgAspect;
      x = (pageWidth - imgWidth) / 2;
      y = top;
    } else {
      imgWidth  = pageWidth;
      imgHeight = imgWidth / imgAspect;
      x = 0;
      y = top - ((imgHeight - (pageHeight - top - bottom)) / 2);
    }
    pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
  }

  function drawTopBar(text) {
    const barHeight = 40;
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, barHeight, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(text, pageWidth / 2, 20, { align: "center" });
  }

  function drawBottomBar(text = "", link = "") {
    const barHeight = 80;
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text(text, 20, pageHeight - barHeight + 25, { maxWidth: pageWidth - 120 });

    if (link) {
      const displayText = "Klik hier voor alle info over deze lens";
      const x = 20;
      const y = pageHeight - barHeight + 55;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 102, 255);
      pdf.textWithLink(displayText, x, y, { url: link });
    }

    const targetHeight = 50;
    const ratio = logo.width / logo.height;
    const targetWidth = targetHeight * ratio;
    const xLogo = pageWidth - targetWidth - 12;
    const yLogo = pageHeight - targetHeight - 12;
    pdf.addImage(logo, "PNG", xLogo, yLogo, targetWidth, targetHeight);
  }

  function drawBottomBarPage1() {
    const barHeight = 80;
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");

    const text = "Benieuwd naar alle lenzen? Klik hier";
    const fontSize = 22;
    const textY = pageHeight - barHeight / 2 + fontSize / 2 - 10;

    pdf.setFontSize(fontSize);
    pdf.setTextColor(255, 255, 255);
    pdf.text(text, pageWidth / 2, textY, { align: "center" });

    const textWidth = pdf.getTextWidth(text);
    const linkX = (pageWidth - textWidth) / 2;
    const linkY = textY - fontSize + 5 - 10;
    const linkHeight = fontSize + 6;
    pdf.link(linkX, linkY, textWidth, linkHeight, { url: "https://tvlrental.nl/lenses/" });

    const targetHeight = 50;
    const ratio = logo.width / logo.height;
    const targetWidth = targetHeight * ratio;
    const xLogo = pageWidth - targetWidth - 12;
    const yLogo = pageHeight - targetHeight - 12;
    pdf.addImage(logo, "PNG", xLogo, yLogo, targetWidth, targetHeight);
  }

  function fillBlack() {
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
  }

  const splitCanvas = await html2canvas(comparison, { scale: 2, useCORS: true });
  const scaledCanvas = document.createElement("canvas");
  scaledCanvas.width = 1920;
  scaledCanvas.height= 1080;
  const sctx = scaledCanvas.getContext("2d");
  sctx.drawImage(splitCanvas, 0, 0, 1920, 1080);
  const splitData = scaledCanvas.toDataURL("image/jpeg", 1.0);

  const leftData  = await renderImage(afterImgTag);
  const rightData = await renderImage(beforeImgTag);

  fillBlack();
  drawTopBar(`${leftText} vs ${rightText}`);
  await drawFullWidthImage(splitData, 60, 80);
  drawBottomBarPage1();

  pdf.addPage();
  fillBlack();
  drawTopBar(leftText);
  await drawFullWidthImage(leftData, 60, 80);
  drawBottomBar(lensDescriptions[left]?.text || "", lensDescriptions[left]?.url);

  pdf.addPage();
  fillBlack();
  drawTopBar(rightText);
  await drawFullWidthImage(rightData, 60, 80);
  drawBottomBar(lensDescriptions[right]?.text || "", lensDescriptions[right]?.url);

  const safeLeft  = left.replace(/\s+/g, "");
  const safeRight = right.replace(/\s+/g, "");
  const filename = `TVL_Rental_Lens_Comparison_${safeLeft}_${safeRight}_${focal}_T${t}.pdf`;
  pdf.save(filename);
});

async function loadImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = url;
  });
}

// ===== 10) DETAIL VIEWER =====
let detailActive = false;

detailToggleButton?.addEventListener("click", () => {
  detailActive = !detailActive;
  detailOverlay.classList.toggle("active", detailActive);
  detailToggleButton.classList.toggle("active", detailActive);
  if (!detailActive) {
    leftDetail.style.display = "none";
    rightDetail.style.display = "none";
  }
});

document.addEventListener("mousemove", (e) => {
  if (!detailActive) return;

  const r = comparisonWrapper.getBoundingClientRect();
  const inside =
    e.clientX >= r.left && e.clientX <= r.right &&
    e.clientY >= r.top  && e.clientY <= r.bottom;

  if (!inside) {
    leftDetail.style.display = "none";
    rightDetail.style.display = "none";
    return;
  }

  const xOut = e.clientX;
  const yOut = e.clientY;

  const zoom = 3.2;
  const size = 260;

  const updateZoomViewer = (detail, detailImg, sourceImg) => {
    if (detailImg?.src !== sourceImg.src) detailImg.src = sourceImg.src;

    const imageRect = sourceImg.getBoundingClientRect();
    const relX = (e.clientX - imageRect.left) / imageRect.width;
    const relY = (e.clientY - imageRect.top)  / imageRect.height;

    const zoomedWidth  = imageRect.width  * zoom;
    const zoomedHeight = imageRect.height * zoom;
    const offsetX = -relX * zoomedWidth  + size / 2;
    const offsetY = -relY * zoomedHeight + size / 2;

    detail.style.left = `${xOut - size / 2}px`;
    detail.style.top  = `${yOut - size / 2}px`;
    detail.style.display = "block";

    if (detailImg) {
      detailImg.style.width  = `${zoomedWidth}px`;
      detailImg.style.height = `${zoomedHeight}px`;
      detailImg.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
  };

  updateZoomViewer(leftDetail,  leftDetailImg,  afterImgTag);
  updateZoomViewer(rightDetail, rightDetailImg, beforeImgTag);
});

comparisonWrapper.addEventListener("mouseleave", () => {
  leftDetail.style.display = "none";
  rightDetail.style.display = "none";
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && detailActive) {
    detailActive = false;
    detailOverlay.classList.remove("active");
    detailToggleButton?.classList.remove("active");
    leftDetail.style.display = "none";
    rightDetail.style.display = "none";
  }
});

// ===== 11) EVENT BINDINGS (LENS UI) =====
[leftSelect, rightSelect].forEach(el => el?.addEventListener("change", updateLensInfo));
[leftSelect, rightSelect, tStopSelect, focalLengthSelect].forEach(el => el?.addEventListener("change", updateImages));

// ===== 12) EVENT BINDINGS (SENSOR UI) =====
Object.keys(cameras).forEach(cam => cameraSelect?.add(new Option(cam, cam)));

cameraSelect?.addEventListener("change", () => {
  sensorFormatSelect.innerHTML = "";
  const cam = cameraSelect.value;
  if (!cam) {
    sensorFormatSelect.disabled = true;
    document.body.classList.remove("sensor-mode");
    clearInlineHeights();
    comparisonWrapper.style.setProperty('aspect-ratio', 'auto');
    return;
  }
  const formats = cameras[cam];
  Object.keys(formats).forEach(fmt => {
    sensorFormatSelect.add(new Option(formats[fmt].label, fmt));
  });
  sensorFormatSelect.disabled = false;
  sensorFormatSelect.dispatchEvent(new Event("change"));
});

sensorFormatSelect?.addEventListener("change", applyCurrentFormat);

// Fullscreen wissel
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement === comparisonWrapper) {
    clearInlineHeights();
  }
  updateFullscreenBars();
});

// Window resize
window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    document.body.classList.add("mobile-mode");
  } else {
    document.body.classList.remove("mobile-mode");
  }

  const cam = cameraSelect.value;
  const fmt = sensorFormatSelect.value;
  if (!cam || !fmt) return;

  const { w, h } = cameras[cam][fmt];

  if (document.fullscreenElement === comparisonWrapper) {
    clearInlineHeights();
    updateFullscreenBars();
    requestAnimationFrame(updateFullscreenBars);
  } else {
    setWrapperSizeByAR(w, h);
    requestAnimationFrame(() => setWrapperSizeByAR(w, h));
  }
});

// ===== 13) INIT =====
if (leftSelect && rightSelect && tStopSelect && focalLengthSelect) {
  leftSelect.value = "IronGlass Red P";
  rightSelect.value = "IronGlass Zeiss Jena";
  tStopSelect.value = "2.8";
  focalLengthSelect.value = "35mm";
}

updateLensInfo?.();
updateImages?.();

cameraSelect.value = "Sony Venice";
cameraSelect.dispatchEvent(new Event("change"));

updateFullscreenBars();
clearInlineHeights();

// Force update (init race conditions)
setTimeout(() => {
  updateImages();
  updateFullscreenBars();
  clearInlineHeights();
}, 50);
