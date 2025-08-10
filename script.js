// ====== LENS COMPARISON TOOL SCRIPT (WERKEND MET PDF LOGO) ======
if (window.innerWidth < 768) {
  document.body.classList.add("mobile-mode");
}
// === SENSOR DATA (mm) – Venice is je basis (6K 3:2) ===
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
    "2.39:1 2K Ana":   { w: 42.240, h: 17.696, label: "2.39:1 2K Ana" }, // anamorf tabje
    "HD Ana":          { w: 31.680, h: 17.820, label: "HD Ana (16:9)" },
    "S16 HD":          { w: 13.200, h: 7.425, label: "S16 HD (16:9)" },
  },
  // …later meer camera’s toevoegen
};

// Pak de elementen
const cameraSelect = document.getElementById("cameraSelect");
const BASE_SENSOR = cameras["Sony Venice"]["6K 3:2"]; // jouw referentie
const sensorFormatSelect = document.getElementById("sensorFormatSelect");
const comparisonWrapper = document.getElementById("comparisonWrapper"); // ← verplaatst naar boven

function isWrapperFullscreen() {
  const fe = document.fullscreenElement || document.webkitFullscreenElement;
  return fe === comparisonWrapper;
}
async function enterWrapperFullscreen() {
  if (comparisonWrapper.requestFullscreen) return comparisonWrapper.requestFullscreen();
  if (comparisonWrapper.webkitRequestFullscreen) return comparisonWrapper.webkitRequestFullscreen();
}
async function exitAnyFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
}
function setWrapperSizeByAR(w, h) {
  if (isWrapperFullscreen()) return; // in fullscreen geen inline heights forceren
  const width  = comparisonWrapper.getBoundingClientRect().width;
  const height = Math.round(width * (h / w)); // puur AR

  comparisonWrapper.style.removeProperty('aspect-ratio');
  comparisonWrapper.style.setProperty('height',     `${height}px`, 'important');
  comparisonWrapper.style.setProperty('min-height', `${height}px`, 'important');
  comparisonWrapper.style.setProperty('max-height', `${height}px`, 'important');
}
function clearInlineHeights() {
  comparisonWrapper.style.removeProperty('height');
  comparisonWrapper.style.removeProperty('min-height');
  comparisonWrapper.style.removeProperty('max-height');
}

 // Geeft de width/height van het huidige sensor-formaat terug
function getCurrentWH() {
  const cam = cameraSelect.value;
  const fmt = sensorFormatSelect.value;
  if (!cam || !fmt) return { w: BASE_SENSOR.w, h: BASE_SENSOR.h };
  return cameras[cam][fmt];
}

// Zet CSS-variabelen met de benodigde letter-/pillarbox in px
function updateFullscreenBars() {
  // Niet fullscreen? Geen balken.
  if (!isWrapperFullscreen()) {
    comparisonWrapper.style.setProperty('--lb-top', '0px');
    comparisonWrapper.style.setProperty('--lb-bottom', '0px');
    comparisonWrapper.style.setProperty('--lb-left', '0px');
    comparisonWrapper.style.setProperty('--lb-right', '0px');
    return;
  }

  // 1) Neem ALTIJD het echte rect van de wrapper
  const rect = comparisonWrapper.getBoundingClientRect();
  const viewW = Math.max(1, Math.round(rect.width));
  const viewH = Math.max(1, Math.round(rect.height));

  // 2) Doelformaat (mm) → aspect ratio
  const { w, h } = getCurrentWH();
  const targetAR = w / h;
  const viewAR   = viewW / viewH;

  let top = 0, bottom = 0, left = 0, right = 0;

  if (viewAR > targetAR) {
    // breder scherm → pillarbox links/rechts
    const usedW = Math.round(viewH * targetAR);
    const side  = Math.max(0, Math.floor((viewW - usedW) / 2));
    left = right = side;
  } else {
    // hoger scherm → letterbox boven/onder
    const usedH = Math.round(viewW / targetAR);
    const bar   = Math.max(0, Math.floor((viewH - usedH) / 2));
    top = bottom = bar;
  }

  // 3) Zet CSS-variabelen (integers om subpixel-clip artefacts te vermijden)
  comparisonWrapper.style.setProperty('--lb-top',    `${top}px`);
  comparisonWrapper.style.setProperty('--lb-bottom', `${bottom}px`);
  comparisonWrapper.style.setProperty('--lb-left',   `${left}px`);
  comparisonWrapper.style.setProperty('--lb-right',  `${right}px`);
}
// --- helpers voor fullscreen-balken + reset midden ---
function getLbOffsets() {
  const cs = getComputedStyle(comparisonWrapper);
  const n = v => parseInt(v || '0', 10) || 0;
  return {
    left:   n(cs.getPropertyValue('--lb-left')),
    right:  n(cs.getPropertyValue('--lb-right')),
    top:    n(cs.getPropertyValue('--lb-top')),
    bottom: n(cs.getPropertyValue('--lb-bottom')),
  };
}

function resetSplitToMiddle() {
  const rect = comparisonWrapper.getBoundingClientRect();
  const { left: lbLeft, right: lbRight } = getLbOffsets();
  const usableWidth = Math.max(1, rect.width - lbLeft - lbRight);

  // 50/50 split in het bruikbare vlak
  afterWrapper.style.clipPath = 'inset(0 50% 0 0)';
  afterWrapper.style.webkitClipPath = 'inset(0 50% 0 0)';
  slider.style.left = (lbLeft + usableWidth / 2) + 'px';
}


 function applyCurrentFormat() {
  const cam = cameraSelect.value;
  const fmt = sensorFormatSelect.value;
  if (!cam || !fmt) return;

  const { w, h } = cameras[cam][fmt];

 updateFullscreenBars();



// (laat je bestaande updateFullscreenBars() calls staan;
//   in fullscreen wint de fs-* CSS en is padding toch 0)
  
 // reset schaal var
comparisonWrapper.style.removeProperty("--sensor-scale");

// Altijd exact naar gekozen formaat schalen
setWrapperSizeByAR(w, h);
// vangnet: nog een keer in de volgende frame
requestAnimationFrame(() => setWrapperSizeByAR(w, h));

 // sensor-mode aan
document.body.classList.add("sensor-mode");

// Schaal puur op horizontale breedte t.o.v. Venice 6K 3:2
// - smallere sensor => scale > 1 (inzoomen, bv. S16)
// - bredere sensor  => scale < 1 (uitzoomen, bv. Alexa 2K Ana)
let scale = BASE_SENSOR.w / w;

  // mini-verschillen rond Venice afronden naar 1 om micro-zoom te voorkomen
  if (Math.abs(BASE_SENSOR.w - w) < 0.1) scale = 1;

    comparisonWrapper.style.setProperty("--sensor-scale", scale.toFixed(4));

  updateFullscreenBars();
  resetSplitToMiddle();     // <<< nieuw
} // einde applyCurrentFormat
// Vul camera dropdown
Object.keys(cameras).forEach(cam => {
  cameraSelect.add(new Option(cam, cam));
});

// Vul formats wanneer camera verandert
cameraSelect.addEventListener("change", () => {
  sensorFormatSelect.innerHTML = "";
  const cam = cameraSelect.value;
 if (!cam) {
  sensorFormatSelect.disabled = true;
  document.body.classList.remove("sensor-mode");
  comparisonWrapper.style.removeProperty('height');      // geen geforceerde hoogte
  comparisonWrapper.style.setProperty('aspect-ratio', 'auto');
  return;
}
 
  
  const formats = cameras[cam];
  Object.keys(formats).forEach(fmt => {
    sensorFormatSelect.add(new Option(formats[fmt].label, fmt));
  });
  sensorFormatSelect.disabled = false;
  // default: eerste optie meteen toepassen
  sensorFormatSelect.dispatchEvent(new Event("change"));
});





sensorFormatSelect.addEventListener("change", applyCurrentFormat);
function onFsChange() {
  if (isWrapperFullscreen()) {
    clearInlineHeights();                     // nooit inline heights in fullscreen
  }
  updateFullscreenBars();                     // 1e pass
  requestAnimationFrame(() => {
    updateFullscreenBars();                   // 2e pass na layout
    resetSplitToMiddle();                     // <<< nieuw
  });
}
document.addEventListener('fullscreenchange', onFsChange);
document.addEventListener('webkitfullscreenchange', onFsChange);


window.addEventListener("resize", () => {
  // mobile-mode togglen
  if (window.innerWidth < 768) {
    document.body.classList.add("mobile-mode");
  } else {
    document.body.classList.remove("mobile-mode");
  }

  // opnieuw toepassen voor huidige keuze
  const cam = cameraSelect.value;
  const fmt = sensorFormatSelect.value;
  if (!cam || !fmt) return;

  const { w, h } = cameras[cam][fmt];

  if (isWrapperFullscreen()) {
    clearInlineHeights();
    updateFullscreenBars();
    requestAnimationFrame(() => {
      updateFullscreenBars();
      resetSplitToMiddle();                // <<< nieuw
    });
  } else {
    setWrapperSizeByAR(w, h);
    requestAnimationFrame(() => {
      setWrapperSizeByAR(w, h);
      resetSplitToMiddle();                // <<< nieuw
    });
  }
});

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

const leftSelect = document.getElementById("leftLens");
const rightSelect = document.getElementById("rightLens");
const tStopSelect = document.getElementById("tStop");
const focalLengthSelect = document.getElementById("focalLength");
const beforeImgTag = document.getElementById("beforeImgTag");
const afterImgTag = document.getElementById("afterImgTag");
const afterWrapper = document.getElementById("afterWrapper");
const slider = document.getElementById("slider");
const leftLabel = document.getElementById("leftLabel");
const rightLabel = document.getElementById("rightLabel");
const downloadLeftRawButton  = document.getElementById("downloadLeftRawButton");
const downloadRightRawButton = document.getElementById("downloadRightRawButton");

function updateLensInfo() {
  const left = leftSelect.value;
  const right = rightSelect.value;
  const leftDesc = lensDescriptions[left]?.text || "";
  const rightDesc = lensDescriptions[right]?.text || "";

  const lensInfoDiv = document.getElementById("lensInfo");
  lensInfoDiv.innerHTML = `
    <p><strong>${left}:</strong> ${leftDesc}</p>
    <p><strong>${right}:</strong> ${rightDesc}</p>
  `;
}

lenses.forEach(lens => {
  leftSelect.add(new Option(lens, lens));
  rightSelect.add(new Option(lens, lens));
});

// Welke RAW-file hoort bij welke combi (key = <lens>_<focal>_t<stop>)
// Tip: laat de key aansluiten op je bestaande keys (dus "ironglass_red_p_35mm_t2_8" die evt. mapt naar 37mm)
// Welke RAW-file hoort bij welke combi (key = <lens>_<focal>_t<stop>)
const rawFileMap = {
  "ironglass_red_p_35mm_t2_8": "images/raw/RedP_37mm_T2.8_RAW.tif",
  "ironglass_zeiss_jena_35mm_t2_8": "images/raw/ZeissJena_35mm_T2.8_RAW.tif",
  "ironglass_red_p_50mm_t2_8": "images/raw/RedP_58mm_T2.8_RAW.tif",
  "ironglass_zeiss_jena_50mm_t2_8": "images/raw/ZeissJena_50mm_T2.8_RAW.tif",
  "cooke_panchro_ff_50mm_t2_8": "images/raw/CookeFF_50mm_T2.8_RAW.tif"
};
function setDownloadButton(buttonEl, key) {
  const file = rawFileMap[key];
  if (file) {
    buttonEl.disabled = false;
    buttonEl.title = "Download RAW";

    buttonEl.onclick = () => {
      const url = new URL(file, location.href);
      const sameOrigin = url.origin === location.origin;

      if (sameOrigin) {
        // Forceer download
        const a = document.createElement("a");
        a.href = url.href;
        a.download = url.pathname.split("/").pop(); // bestandsnaam
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Cross-origin: sommige hosts negeren download-attribute
        // dan is nieuw tabblad de veiligste fallback
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
  const leftLens = leftSelect.value.toLowerCase().replace(/\s+/g, "_");
  const rightLens = rightSelect.value.toLowerCase().replace(/\s+/g, "_");
  const tStop = tStopSelect.value.replace(".", "_");
  const focalLength = focalLengthSelect.value;

  const leftBaseKey = `${leftLens}_${focalLength}`;
  const rightBaseKey = `${rightLens}_${focalLength}`;
  const leftKey = `${leftLens}_${focalLength}_t${tStop}`;
  const rightKey = `${rightLens}_${focalLength}_t${tStop}`;

  const imgLeft = `images/${lensImageMap[leftKey] || leftKey + ".jpg"}`;
  const imgRight = `images/${lensImageMap[rightKey] || rightKey + ".jpg"}`;

  beforeImgTag.src = imgRight;
  afterImgTag.src = imgLeft;

  const tStopRaw = tStopSelect.value;
  const tStopFormatted = `T${tStopRaw}`;

  // Pak de URLs uit lensDescriptions (fallback "#")
  const leftUrl  = lensDescriptions[leftSelect.value]?.url  || "#";
  const rightUrl = lensDescriptions[rightSelect.value]?.url || "#";

  
resetSplitToMiddle();

  // RAW-download knoppen updaten
setDownloadButton(downloadLeftRawButton,  leftKey);
setDownloadButton(downloadRightRawButton, rightKey);

  // Zet HTML met <a> links
  leftLabel.innerHTML  =
    `Lens: <a href="${leftUrl}" target="_blank" rel="noopener noreferrer">${leftSelect.value} ${notes[leftBaseKey] || focalLength} ${tStopFormatted}</a>`;
  rightLabel.innerHTML =
    `Lens: <a href="${rightUrl}" target="_blank" rel="noopener noreferrer">${rightSelect.value} ${notes[rightBaseKey] || focalLength} ${tStopFormatted}</a>`;
} // ← BELANGRIJK: functie hier echt sluiten


[leftSelect, rightSelect].forEach(el =>
  el.addEventListener("change", updateLensInfo)
);

[leftSelect, rightSelect, tStopSelect, focalLengthSelect].forEach(el =>
  el.addEventListener("change", updateImages)
);

leftSelect.value = "IronGlass Red P";
rightSelect.value = "IronGlass Zeiss Jena";
tStopSelect.value = "2.8";
focalLengthSelect.value = "35mm";
updateLensInfo();
updateImages();

// Init (optioneel: standaard op Venice 6K 3:2)
cameraSelect.value = "Sony Venice";
cameraSelect.dispatchEvent(new Event("change"));
// fullscreen-balken direct goedzetten (ook als je al fullscreen zit)
updateFullscreenBars();
clearInlineHeights();
resetSplitToMiddle();                 // <<< nieuw



// Force update to fix initial load issue
setTimeout(() => updateImages(), 50);

let isDragging = false;

function updateSliderPosition(clientX) {
  const rect = comparisonWrapper.getBoundingClientRect();
  const { left: lbLeft, right: lbRight } = getLbOffsets();

  // bruikbare breedte (zonder pillarbox)
  const usableWidth = Math.max(1, Math.round(rect.width - lbLeft - lbRight));

  // muispositie t.o.v. bruikbaar vlak
  const xInUsable = clientX - rect.left - lbLeft;

  // clamp + afronden naar hele px
  const clampedPx = Math.max(0, Math.min(Math.round(xInUsable), usableWidth));

  // rechter inset in PX (niet in %)
  const rightInsetPx = usableWidth - clampedPx;

  afterWrapper.style.clipPath       = `inset(0 ${rightInsetPx}px 0 0)`;
  afterWrapper.style.webkitClipPath = `inset(0 ${rightInsetPx}px 0 0)`;

  // slider exact boven bruikbare vlak
  slider.style.left = (lbLeft + clampedPx) + 'px';
}

function resetSplitToMiddle() {
  const rect = comparisonWrapper.getBoundingClientRect();
  const { left: lbLeft, right: lbRight } = getLbOffsets();
  const usableWidth = Math.max(1, Math.round(rect.width - lbLeft - lbRight));

  const midPx = Math.round(usableWidth / 2);
  const rightInsetPx = usableWidth - midPx;

  afterWrapper.style.clipPath       = `inset(0 ${rightInsetPx}px 0 0)`;
  afterWrapper.style.webkitClipPath = `inset(0 ${rightInsetPx}px 0 0)`;

  slider.style.left = (lbLeft + midPx) + 'px';
}

// Mouse events
// Mouse events
slider.addEventListener("mousedown", () => {
  isDragging = true;
  document.body.classList.add("dragging");
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.classList.remove("dragging");
});

window.addEventListener("mousemove", e => {
  if (!isDragging) return;
  updateSliderPosition(e.clientX);
});

// Touch events
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
document.getElementById("toggleButton").addEventListener("click", () => {
  const left = leftSelect.value;
  const right = rightSelect.value;
  leftSelect.value = right;
  rightSelect.value = left;
  updateImages();
});

document.getElementById("fullscreenButton")?.addEventListener("click", async () => {
  if (isWrapperFullscreen()) {
    await exitAnyFullscreen();
  } else {
    clearInlineHeights();
    await enterWrapperFullscreen();
  }
  // 1e pass direct
  updateFullscreenBars();
  // 2e pass nà layout + slider centreren
  requestAnimationFrame(() => {
    updateFullscreenBars();
    resetSplitToMiddle();
  });
});


document.getElementById("downloadPdfButton")?.addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const comparison = document.getElementById("comparisonWrapper");
  const leftImg = afterImgTag;
  const rightImg = beforeImgTag;
  const leftText = leftLabel.textContent;
  const rightText = rightLabel.textContent;
  const left = leftSelect.value;
  const right = rightSelect.value;
  const focal = focalLengthSelect.value;
  const t = tStopSelect.value;
  const barHeight = 80;

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const logoUrl = "https://tvlmedia.github.io/lens-compare/LOGOVOORPDF.png";
  const logo = await loadImage(logoUrl);

  async function renderImage(imgEl) {
    const canvas = document.createElement("canvas");
    canvas.width = imgEl.naturalWidth || 1920;
    canvas.height = imgEl.naturalHeight || 1080;
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
    await new Promise(resolve => img.onload = resolve);

    const imgAspect = img.width / img.height;
    const pageAspect = pageWidth / (pageHeight - top - bottom);

    let imgWidth, imgHeight, x, y;

    if (imgAspect > pageAspect) {
      imgHeight = pageHeight - top - bottom;
      imgWidth = imgHeight * imgAspect;
      x = (pageWidth - imgWidth) / 2;
      y = top;
    } else {
      imgWidth = pageWidth;
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

  function drawBottomBarPage1(barHeight) {
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
    pdf.link(linkX, linkY, textWidth, linkHeight, {
      url: "https://tvlrental.nl/lenses/"
    });

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
  scaledCanvas.height = 1080;
  const ctx = scaledCanvas.getContext("2d");
  ctx.drawImage(splitCanvas, 0, 0, 1920, 1080);
  const splitData = scaledCanvas.toDataURL("image/jpeg", 1.0);

  const leftData = await renderImage(leftImg);
  const rightData = await renderImage(rightImg);

  fillBlack();
  drawTopBar(`${leftText} vs ${rightText}`);
  await drawFullWidthImage(splitData, 60, 80);
  drawBottomBarPage1(barHeight);

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

  const safeLeft = left.replace(/\s+/g, "");
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
// ==== DETAIL VIEWER ====
const detailOverlay = document.getElementById("detailOverlay");
const leftDetail = document.getElementById("leftDetail");
const rightDetail = document.getElementById("rightDetail");
const leftDetailImg = leftDetail.querySelector("img");
const rightDetailImg = rightDetail.querySelector("img");
const detailToggleButton = document.getElementById("detailViewToggle");

let detailActive = false;

detailToggleButton.addEventListener("click", () => {
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

  // Alleen tonen wanneer je muis boven het beeld hangt
  const inside =
    e.clientX >= r.left && e.clientX <= r.right &&
    e.clientY >= r.top  && e.clientY <= r.bottom;

  if (!inside) {
    leftDetail.style.display = "none";
    rightDetail.style.display = "none";
    return;
  }

  // Cursorpositie RELATIEF tot het beeld (voor zoom sampling)
  const xIn = e.clientX - r.left;
  const yIn = e.clientY - r.top;

  // Vierkantjes POSITIONEREN op de echte muispositie (mag buiten vak)
  // omdat #detailOverlay nu full-screen is
  const xOut = e.clientX;
  const yOut = e.clientY;

  const zoom = 3.2;
  const size = 260;

  const updateZoomViewer = (detail, detailImg, sourceImg) => {
    if (detailImg.src !== sourceImg.src) detailImg.src = sourceImg.src;

    const imageRect = sourceImg.getBoundingClientRect();
    const relX = (e.clientX - imageRect.left) / imageRect.width;
    const relY = (e.clientY - imageRect.top) / imageRect.height;

    const zoomedWidth  = imageRect.width * zoom;
    const zoomedHeight = imageRect.height * zoom;
    const offsetX = -relX * zoomedWidth  + size / 2;
    const offsetY = -relY * zoomedHeight + size / 2;

    // Zet de viewer OP de muis (full-screen overlay → kan buiten het vak)
    detail.style.left = `${xOut - size / 2}px`;
    detail.style.top  = `${yOut - size / 2}px`;
    detail.style.display = "block";

    detailImg.style.width  = `${zoomedWidth}px`;
    detailImg.style.height = `${zoomedHeight}px`;
    detailImg.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  };

  updateZoomViewer(leftDetail,  leftDetailImg,  afterImgTag);
  updateZoomViewer(rightDetail, rightDetailImg, beforeImgTag);
});


comparisonWrapper.addEventListener("mouseleave", () => {
  leftDetail.style.display = "none";
  rightDetail.style.display = "none";
});

// ⎋ Sluit detail viewer met ESC
document.addEventListener("keydown", (e) => {
 if (e.key === "Escape" && detailActive) {
  detailActive = false;
  detailOverlay.classList.remove("active");
  detailToggleButton.classList.remove("active"); // <== DIT OOK!
  leftDetail.style.display = "none";
  rightDetail.style.display = "none";
}
});
// VERVANGT updateFullscreenBars()
function updateFullscreenBars() {
  // Bereken bruikbare viewport (px) binnen de wrapper obv gekozen sensor AR
  const rect = comparisonWrapper.getBoundingClientRect();
  const hostW = Math.max(1, Math.round(rect.width));
  const hostH = Math.max(1, Math.round(rect.height));

  const { w, h } = getCurrentWH();
  const targetAR = w / h;
  const hostAR = hostW / hostH;

  let usedW, usedH, lbLeft = 0, lbRight = 0;
  if (hostAR > targetAR) {
    // pillarbox links/rechts
    usedH = hostH;
    usedW = Math.round(usedH * targetAR);
    const side = Math.floor((hostW - usedW) / 2);
    lbLeft = side; lbRight = side;
  } else {
    // letterbox boven/onder (voor de slider niet relevant)
    usedW = hostW;
    usedH = Math.round(usedW / targetAR);
  }

  // Sla offsets op als data, we gebruiken ze in de slider/cropping
  comparisonWrapper._lbLeft = lbLeft;
  comparisonWrapper._lbRight = lbRight;
  comparisonWrapper._usableW = usedW;
}

// VERVANGT resetSplitToMiddle()
function resetSplitToMiddle() {
  const usable = Math.max(1, comparisonWrapper._usableW || comparisonWrapper.getBoundingClientRect().width);
  const lbLeft = comparisonWrapper._lbLeft || 0;
  const mid = Math.round(usable / 2);
  const rightInsetPx = usable - mid;

  afterWrapper.style.clipPath = `inset(0 ${rightInsetPx}px 0 0)`;
  afterWrapper.style.webkitClipPath = `inset(0 ${rightInsetPx}px 0 0)`;
  slider.style.left = (lbLeft + mid) + 'px';
}

// VERVANGT updateSliderPosition()
function updateSliderPosition(clientX) {
  const rect = comparisonWrapper.getBoundingClientRect();
  const lbLeft = comparisonWrapper._lbLeft || 0;
  const lbRight = comparisonWrapper._lbRight || 0;
  const usable = Math.max(1, Math.round(rect.width - lbLeft - lbRight));

  const xInUsable = clientX - rect.left - lbLeft;
  const clamped = Math.max(0, Math.min(Math.round(xInUsable), usable));
  const rightInsetPx = usable - clamped;

  afterWrapper.style.clipPath = `inset(0 ${rightInsetPx}px 0 0)`;
  afterWrapper.style.webkitClipPath = `inset(0 ${rightInsetPx}px 0 0)`;
  slider.style.left = (lbLeft + clamped) + 'px';
}
