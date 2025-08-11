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



  





function applyCurrentFormat() {
  const cam = cameraSelect.value;
  const fmt = sensorFormatSelect.value;
  if (!cam || !fmt) return;

  const { w, h } = cameras[cam][fmt];

  // reset schaal var
  comparisonWrapper.style.removeProperty("--sensor-scale");

  // Altijd exact naar gekozen formaat schalen
  setWrapperSizeByAR(w, h);
  requestAnimationFrame(() => setWrapperSizeByAR(w, h));

  document.body.classList.add("sensor-mode");

  // Schaal t.o.v. Venice
  let scale = BASE_SENSOR.w / w;
  if (Math.abs(BASE_SENSOR.w - w) < 0.1) scale = 1;
  comparisonWrapper.style.setProperty("--sensor-scale", scale.toFixed(4));

  // Bars/slider opnieuw positioneren
  updateFullscreenBars();
  resetSplitToMiddle();
}
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
    // In fullscreen: nooit inline heights
    clearInlineHeights();

    // stabiel her-meten zolang de browserbalk in- en uitfadet
    pulseFsBars({ duration: 1400 });
  } else {
    // UIT fullscreen: direct de juiste hoogte terugzetten
    const { w, h } = getCurrentWH();
    comparisonWrapper.style.setProperty('aspect-ratio', 'auto'); // vangnet
    setWrapperSizeByAR(w, h);
    requestAnimationFrame(() => setWrapperSizeByAR(w, h));

    // FS-balk variabelen resetten
    comparisonWrapper.style.setProperty('--lb-top', '0px');
    comparisonWrapper.style.setProperty('--lb-bottom', '0px');
    comparisonWrapper.style.setProperty('--lb-left', '0px');
    comparisonWrapper.style.setProperty('--lb-right', '0px');

    // Slider meteen terug op volle hoogte buiten fullscreen
    slider.style.top = '0px';
    slider.style.height = '100%';
    slider.style.bottom = '0';
  }

  // Balken + slider opnieuw
  updateFullscreenBars();
  requestAnimationFrame(() => {
    updateFullscreenBars();
    resetSplitToMiddle();
  });

  // Extra vangnet tegen 'mini' state
  requestAnimationFrame(() => {
    if (!isWrapperFullscreen()) {
      const { w, h } = getCurrentWH();
      setWrapperSizeByAR(w, h);
    }
  });
}

// Luister naar fullscreen wissels (buiten de functie!)
document.addEventListener('fullscreenchange', onFsChange);
document.addEventListener('webkitfullscreenchange', onFsChange); // Safari

window.addEventListener('resize', () => {
  if (isWrapperFullscreen()) {
    updateFullscreenBars();
    resetSplitToMiddle();
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

// Direct bij pageload 1x runnen
onFsChange();

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
resetSplitToMiddle();   
if (isWrapperFullscreen()) clearInlineHeights();// <<< nieuw



// Force update to fix initial load issue
setTimeout(() => updateImages(), 50);

let isDragging = false;





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

 function toggleFullscreen() {
  (async () => {
    if (isWrapperFullscreen()) {
      await exitAnyFullscreen();
      const { w, h } = getCurrentWH();
      comparisonWrapper.style.setProperty('aspect-ratio', 'auto');
      setWrapperSizeByAR(w, h);
      requestAnimationFrame(() => setWrapperSizeByAR(w, h));
      comparisonWrapper.style.setProperty('--lb-top', '0px');
      comparisonWrapper.style.setProperty('--lb-bottom', '0px');
      comparisonWrapper.style.setProperty('--lb-left', '0px');
      comparisonWrapper.style.setProperty('--lb-right', '0px');
    } else {
      clearInlineHeights();
      await enterWrapperFullscreen();
      pulseFsBars({ duration: 1400 });
    }

    updateFullscreenBars();
    requestAnimationFrame(() => {
      updateFullscreenBars();
      resetSplitToMiddle();
    });
  })();
}

document.getElementById("fullscreenButton")?.addEventListener("click", toggleFullscreen);

// ==== PDF helpers: sensor-canvas + contain placement ====
function loadHTMLImage(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

function fitContain(srcW, srcH, boxW, boxH) {
  const srcAR = srcW / srcH, boxAR = boxW / boxH;
  let w, h;
  if (srcAR > boxAR) { w = boxW; h = Math.round(w / srcAR); }
  else { h = boxH; w = Math.round(h * srcAR); }
  const x = Math.round((boxW - w) / 2);
  const y = Math.round((boxH - h) / 2);
  return { w, h, x, y };
}

// Render naar exacte SENSOR-AR op gewenste hoogte, met extra crop/zoom via `scale`
async function renderToSensorAR(imgOrURL, targetAR, outH, scale = 1) {
  const img = typeof imgOrURL === "string" ? await loadHTMLImage(imgOrURL) : imgOrURL;
  const H = outH;
  const W = Math.round(H * targetAR);

  const cvs = document.createElement("canvas");
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext("2d", { alpha:false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // cover-fit naar (W,H)
  const srcAR = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
  let drawW, drawH, offX, offY;
  if (srcAR < targetAR) {        // te “smal” → vul breedte
    drawW = W; 
    drawH = W / srcAR; 
    offX = 0; 
    offY = (H - drawH) / 2;
  } else {                       // te “breed” → vul hoogte
    drawH = H; 
    drawW = H * srcAR; 
    offY = 0; 
    offX = (W - drawW) / 2;
  }

  // Extra crop/zoom (alleen PDF): vergroot de getekende bron, centreer
  if (scale !== 1) {
    const oldW = drawW, oldH = drawH;
    drawW = oldW * scale;
    drawH = oldH * scale;
    offX -= (drawW - oldW) / 2;
    offY -= (drawH - oldH) / 2;
  }

  ctx.drawImage(img, Math.round(offX), Math.round(offY), Math.round(drawW), Math.round(drawH));
  return { dataURL: cvs.toDataURL("image/jpeg", 1.0), W, H };
}

// Plaats een (W,H) image contain in PDF-box
async function placeContain(pdf, dataURL, box) {
  const im = await loadHTMLImage(dataURL);
  const fit = fitContain(im.naturalWidth || im.width, im.naturalHeight || im.height, box.w, box.h);
  pdf.addImage(dataURL, "JPEG", box.x + fit.x, box.y + fit.y, fit.w, fit.h);
}
// Zelfde als placeContain maar geeft de werkelijke plaatsing terug (x,y,w,h)
async function placeContainWithBox(pdf, dataURL, box) {
  const im = await loadHTMLImage(dataURL);
  const fit = fitContain(im.naturalWidth || im.width, im.naturalHeight || im.height, box.w, box.h);
  const x = box.x + fit.x, y = box.y + fit.y, w = fit.w, h = fit.h;
  pdf.addImage(dataURL, "JPEG", x, y, w, h);
  return { x, y, w, h };
}
// --- helper: cover-fit (laat staan als je 'm al hebt) ---
function fitCover(srcW, srcH, boxW, boxH) {
  const srcAR = srcW / srcH, boxAR = boxW / boxH;
  let w,h;
  if (srcAR < boxAR) { h = boxH; w = Math.round(h * srcAR); }
  else               { w = boxW; h = Math.round(w / srcAR); }
  const x = Math.round((boxW - w)/2), y = Math.round((boxH - h)/2);
  return { w,h,x,y };
}
async function placeCoverWithBox(pdf, dataURL, box) {
  const im  = await loadHTMLImage(dataURL);
  const fit = fitCover(im.naturalWidth || im.width, im.naturalHeight || im.height, box.w, box.h);
  const x = box.x + fit.x, y = box.y + fit.y, w = fit.w, h = fit.h;
  pdf.addImage(dataURL, "JPEG", x, y, w, h);
  return { x, y, w, h };
}

async function screenshotActiveImage() {
  updateFullscreenBars();
  const el = document.getElementById("comparisonWrapper");
  const scale = 2;

  // html2canvas doet de capture
  const big = await html2canvas(el, { scale, useCORS: true, backgroundColor: "#000" });

  // Gebruik je berekende letterbox/pillarbox waarden
  const lbL = el._lbLeft || 0;
  const lbR = el._lbRight || 0;
  const lbT = el._lbTop || 0;
  const lbB = el._lbBottom || 0;

  // Crop exact het bruikbare beeld zonder squeeze
  const usableW = el._usableW || (el.getBoundingClientRect().width - lbL - lbR);
  const usableH = el.getBoundingClientRect().height - lbT - lbB;

  const sx = Math.round(lbL * scale);
  const sy = Math.round(lbT * scale);
  const sw = Math.round(usableW * scale);
  const sh = Math.round(usableH * scale);

  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const ctx = out.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(big, sx, sy, sw, sh, 0, 0, sw, sh);

  return out.toDataURL("image/jpeg", 1.0);
}
// Maak een nette CTA-"knop" met klikbare link
function drawCtaButton({ pdf, x, y, w, h, label, url }) {
  // zwarte achtergrond
  pdf.setDrawColor(0, 0, 0);
  pdf.setFillColor(0, 0, 0);
  pdf.roundedRect(x, y, w, h, 6, 6, "F");
  // witte tekst
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.text(label, x + w / 2, y + Math.round(h / 2) + 4, { align: "center", baseline: "middle" });
  // klikbare zone
  pdf.link(x, y, w, h, { url });
}

async function screenshotTool() {
  const DPR   = window.devicePixelRatio || 1;
  const SCALE = DPR; // hou canvas en crop 1:1 met device pixels

  const big = await html2canvas(document.body, {
    scale: SCALE,
    useCORS: true,
    backgroundColor: "#000"
  });

  const parts = [".controls", "#comparisonWrapper", "#infoContainer"]
    .map(s => document.querySelector(s))
    .filter(Boolean);

  if (!parts.length) {
    const r = document.getElementById("comparisonWrapper").getBoundingClientRect();
    return cropFromCanvas(big, r.left + window.scrollX, r.top + window.scrollY, r.width, r.height, SCALE);
  }

  const rects  = parts.map(el => el.getBoundingClientRect());
  const left   = Math.min(...rects.map(r => r.left));
  const right  = Math.max(...rects.map(r => r.right));
  const top    = Math.min(...rects.map(r => r.top));
  const bottom = Math.max(...rects.map(r => r.bottom));

  const PAD = 12;
  return cropFromCanvas(
    big,
    Math.max(0, left   - PAD) + window.scrollX,
    Math.max(0, top    - PAD) + window.scrollY,
    (right - left) + PAD * 2,
    (bottom - top) + PAD * 2,
    SCALE
  );
}

// helper: crop uit html2canvas resultaat (rekening houdend met scale:2)
function cropFromCanvas(sourceCanvas, sx, sy, sw, sh, SCALE = window.devicePixelRatio || 1) {
  const out = document.createElement("canvas");
  out.width  = Math.max(1, Math.round(sw * SCALE));
  out.height = Math.max(1, Math.round(sh * SCALE));
  const ctx = out.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    sourceCanvas,
    Math.round(sx * SCALE), Math.round(sy * SCALE),
    Math.round(sw * SCALE), Math.round(sh * SCALE),
    0, 0, out.width, out.height
  );
  return out.toDataURL("image/jpeg", 1.0);
}
function getCurrentSplitFraction() {
  const wrapperRect = comparisonWrapper.getBoundingClientRect();
  const lbLeft  = comparisonWrapper._lbLeft  || 0;
  const lbRight = comparisonWrapper._lbRight || 0;
  const usableW = Math.max(1, Math.round(wrapperRect.width - lbLeft - lbRight));

  const sliderRect = slider.getBoundingClientRect();
  const xInUsable = (sliderRect.left + sliderRect.width / 2) - wrapperRect.left - lbLeft;

  return Math.min(1, Math.max(0, xInUsable / usableW));
}

// Bouw split uit twee sensor‑canvassen (zelfde W,H) + witte middenlijn
// Bouw split uit twee sensor‑canvassen (zelfde W,H) en neem de actuele viewer‑split over
async function buildSplitFromSensor(leftURL, rightURL, W, H) {
  const L = await loadHTMLImage(leftURL);
  const R = await loadHTMLImage(rightURL);

  const cvs = document.createElement("canvas");
  cvs.width = W;
  cvs.height = H;

  const ctx = cvs.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Gebruik de echte slider-positie uit de viewer (gecorrigeerd voor pillar/letterbox)
  const frac = getCurrentSplitFraction();   // 0..1
  const splitX = Math.round(W * frac);      // px in de sensor-canvas

  // Links tot split
  if (splitX > 0) {
    ctx.drawImage(L, 0, 0, splitX, H, 0, 0, splitX, H);
  }

  // Rechts vanaf split
  if (splitX < W) {
    const wRight = W - splitX;
    ctx.drawImage(R, splitX, 0, wRight, H, splitX, 0, wRight, H);
  }

  // Middenlijn
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(Math.max(0, splitX - 1), 0, 2, H);

  return cvs.toDataURL("image/jpeg", 1.0);
}
function getSensorText() {
  const cam = cameraSelect.value;
  const fmt = sensorFormatSelect.value;
  const label = cameras[cam]?.[fmt]?.label || "";
  return `${cam} – ${label}`;
}
async function captureViewerOnly() {
  const viewerEl = document.getElementById("comparisonWrapper");
  if (!viewerEl) {
    console.error("Viewer element niet gevonden!");
    return null;
  }

  const sliderEl = document.getElementById("slider");
  const prevVis = sliderEl?.style.visibility;

  try {
    if (sliderEl) sliderEl.style.visibility = "hidden";

    const canvas = await html2canvas(viewerEl, {
      scale: 2,
      backgroundColor: "#000"
    });

    return canvas.toDataURL("image/jpeg", 0.95);
  } finally {
    if (sliderEl) sliderEl.style.visibility = prevVis || "";
  }
}
document.getElementById("downloadPdfButton")?.addEventListener("click", async () => {
  
  const { jsPDF } = window.jspdf; // ← belangrijk
  // Zorg dat de cache (pillar/letterbox + slider) up-to-date is
updateFullscreenBars();

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });

  // Layout constants
  const TOP_BAR = 40;
  const BOTTOM_BAR = 80;
  const PAGE_MARGIN = 24;

  function getContentBox(pageW, pageH) {
    const x = PAGE_MARGIN;
    const y = TOP_BAR + PAGE_MARGIN;
    const w = pageW - PAGE_MARGIN * 2;
    const h = pageH - TOP_BAR - BOTTOM_BAR - PAGE_MARGIN * 2;
    return { x, y, w, h };
  }

  
  function drawTopBar(text) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const barHeight = TOP_BAR;
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, barHeight, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(text, pageWidth / 2, Math.round(barHeight / 2) + 2, {
      align: "center",
      baseline: "middle"
    });
  }
  function drawBottomBar({ text = "", link = "", logo = null, ctaLabel = "", ctaUrl = "" }) {
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const barHeight  = BOTTOM_BAR;

  // zwarte balk
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");

  // linkertekst (beschrijving)
  if (text) {
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text(text, 20, pageHeight - barHeight + 25, { maxWidth: pageWidth - 120 });
  }

  // optionele link onder de tekst
  if (link) {
    const displayText = "Klik hier voor alle info over deze lens";
    pdf.setFontSize(10);
    pdf.setTextColor(0, 102, 255);
    pdf.textWithLink(displayText, 20, pageHeight - barHeight + 55, { url: link });
  }

  // logo rechts
  if (logo) {
    const targetHeight = 50;
    const ratio = logo.width / logo.height;
    const targetWidth = targetHeight * ratio;
    const xLogo = pageWidth - targetWidth - 12;
    const yLogo = pageHeight - targetHeight - 12;
    pdf.addImage(logo, "PNG", xLogo, yLogo, targetWidth, targetHeight);
  }

  // gecentreerde CTA-knop in de balk
  if (ctaLabel && ctaUrl) {
    const btnW = Math.min(320, pageWidth - 2 * PAGE_MARGIN);
    const btnH = 32;
    const btnX = Math.round((pageWidth - btnW) / 2);
    const btnY = Math.round(pageHeight - (barHeight / 2) - (btnH / 2));

    pdf.setDrawColor(0, 0, 0);
    pdf.setFillColor(0, 0, 0);
    pdf.roundedRect(btnX, btnY, btnW, btnH, 4, 4, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text(ctaLabel, btnX + btnW / 2, btnY + btnH / 2 + 3, { align: "center", baseline: "middle" });

    pdf.link(btnX, btnY, btnW, btnH, { url: ctaUrl });
  }
}
  function drawBottomBarPage1(logo, sensorText) {
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const barHeight  = BOTTOM_BAR;

  // zwarte balk
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");

  // regel 1: sensor mode (bovenin de balk)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);                 // pas evt. aan (14–18)
  const ySensor = pageHeight - barHeight + 48;
  pdf.text(`Camera/Sensor mode: ${sensorText}`, pageWidth / 2, ySensor, {
    align: "center",
    baseline: "middle"
  });

  // regel 2: CTA (onderin de balk)
  const cta = "Benieuwd naar alle lenzen? Klik hier";
  pdf.setFontSize(16);
  const yCta = pageHeight - 18;        // afstand boven onderrand
  pdf.text(cta, pageWidth / 2, yCta, { align: "center", baseline: "middle" });

  // klikbare link over de CTA-tekst
  const textWidth = pdf.getTextWidth(cta);
  const linkX = (pageWidth - textWidth) / 2;
  const linkY = yCta - 10;             // kleine marge
  const linkH = 20;
  pdf.link(linkX, linkY, textWidth, linkH, { url: "https://tvlrental.nl/lenses/" });

  // logo rechts
  if (logo) {
    const targetHeight = 50;
    const ratio = logo.width / logo.height;
    const targetWidth = targetHeight * ratio;
    const xLogo = pageWidth - targetWidth - 12;
    const yLogo = pageHeight - targetHeight - 12;
    pdf.addImage(logo, "PNG", xLogo, yLogo, targetWidth, targetHeight);
  }
}
  function fillBlack() {
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pw, ph, "F");
  }

  // Data uit UI
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const box   = getContentBox(pageW, pageH);

// Sensor‑AR uit de huidige selectie (exact zoals de viewer)
const { w: sW, h: sH } = getCurrentWH();
const targetAR = sW / sH;

// Export-resolutie (scherpte).  ~300 DPI benadering op A4 landscape content-box
const exportScale = 8; // 2.5–3 is meestal top; 3 geeft veel detail
const exportH = Math.round(box.h * exportScale);

  // Zoom/crop factor tov Venice breedte: nooit “uitzoomen”, alleen extra crop als kleiner is
const zoom = Math.max(1, BASE_SENSOR.w / sW);
// Wil je minder agressief? Neem bv: const zoom = 1 + 0.6 * (Math.max(1, BASE_SENSOR.w / sW) - 1);
  
  

  
  const leftText  = leftLabel.textContent;
  const rightText = rightLabel.textContent;
  const leftName  = leftSelect.value;
  const rightName = rightSelect.value;
  const focal     = focalLengthSelect.value;
  const t         = tStopSelect.value;

  const logoUrl = "https://tvlmedia.github.io/lens-compare/LOGOVOORPDF.png";
const logo = await loadHTMLImage(logoUrl);
const sensorText = getSensorText(); // bv. "Sony Venice – 6K 3:2"
  

  // === Sensor-canvas render (1:1 met viewer) ===
const li = await loadHTMLImage(afterImgTag.src);   // left = after
const ri = await loadHTMLImage(beforeImgTag.src);  // right = before

const leftSensor  = await renderToSensorAR(li, targetAR, exportH, zoom);
const rightSensor = await renderToSensorAR(ri, targetAR, exportH, zoom);

// Split canvas met dezelfde (W,H) als sensor-canvassen
const splitData = await buildSplitFromSensor(leftSensor.dataURL, rightSensor.dataURL, leftSensor.W, leftSensor.H);

// Voor losse pagina's gebruiken we de sensor-canvassen zelf
const leftData  = leftSensor.dataURL;
const rightData = rightSensor.dataURL;

  // === PDF render ===
  fillBlack();
drawTopBar(`${leftText} vs ${rightText}`);
  const fullBox = { x: 0, y: TOP_BAR, w: pageW, h: pageH - TOP_BAR - BOTTOM_BAR };
await placeContain(pdf, splitData, fullBox);
// Sensor‑tekst net boven de bottombar

drawBottomBarPage1(logo, sensorText);
  
  // --- Pagina 2: LINKER beeld ---
pdf.addPage();
fillBlack();
drawTopBar(`${leftText} – ${sensorText}`);
await placeContain(pdf, leftData, fullBox);
drawBottomBar({
  text: lensDescriptions[leftName]?.text || "",
  link: lensDescriptions[leftName]?.url || "",
  logo
});

// --- Pagina 3: RECHTER beeld ---
pdf.addPage();
fillBlack();
drawTopBar(`${rightText} – ${sensorText}`);
await placeContain(pdf, rightData, fullBox);
drawBottomBar({
  text: lensDescriptions[rightName]?.text || "",
  link: lensDescriptions[rightName]?.url || "",
  logo
});

  // --- Pagina 4: CTA + viewer-only screenshot ---
pdf.addPage();
fillBlack();

const pageWidth  = pdf.internal.pageSize.getWidth();
const pageHeight = pdf.internal.pageSize.getHeight();

const toolURL = "https://tvlrental.nl/lens-comparison/";

// Met UI/labels
const shotData = await screenshotTool();
// Plaats zonder squeeze (cover)
const shotBox = {
  x: PAGE_MARGIN,
  y: PAGE_MARGIN,
  w: pageWidth  - PAGE_MARGIN * 2,
  h: pageHeight - BOTTOM_BAR - PAGE_MARGIN * 2
};

// Nog steeds geen vervorming: contain i.p.v. cover
const shotData = await screenshotTool(); // Hele viewer
const placed   = await placeContainWithBox(pdf, shotData, shotBox);
// CTA-knop in zwarte bottombar
drawBottomBar({
  text: "",
  link: "",
  logo,
  ctaLabel: "Open de interactieve Lens Comparison Tool",
  ctaUrl: toolURL
});

const safeLeft  = leftName.replace(/\s+/g, "");
const safeRight = rightName.replace(/\s+/g, "");
const filename = `TVL_Rental_Lens_Comparison_${safeLeft}_${safeRight}_${focal}_T${t}.pdf`;
pdf.save(filename);
}); // ← sluit de addEventListener("click", async () => { ... })
 


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
  // ✅ Alleen letter/pillarbox berekenen in fullscreen
  if (!isWrapperFullscreen()) {
    comparisonWrapper.style.setProperty('--lb-top', '0px');
    comparisonWrapper.style.setProperty('--lb-bottom', '0px');
    comparisonWrapper.style.setProperty('--lb-left', '0px');
    comparisonWrapper.style.setProperty('--lb-right', '0px');
    // Zorg dat interne helpers niet met oude waarden werken:
   comparisonWrapper._lbLeft  = 0;
comparisonWrapper._lbRight = 0;
comparisonWrapper._lbTop    = 0; // ✅ toevoegen
comparisonWrapper._lbBottom = 0; // ✅ toevoegen
comparisonWrapper._usableW = comparisonWrapper.getBoundingClientRect().width;
return;
  }

  const rect  = comparisonWrapper.getBoundingClientRect();
  const hostW = Math.max(1, Math.round(rect.width));
  const hostH = Math.max(1, Math.round(rect.height));

  const { w, h } = getCurrentWH();
  const targetAR = w / h;
  const hostAR   = hostW / hostH;

  let usedW, usedH;
  let lbLeft = 0, lbRight = 0, lbTop = 0, lbBottom = 0;

  if (hostAR > targetAR) {
    usedH = hostH;
    usedW = Math.round(usedH * targetAR);
    const side = Math.floor((hostW - usedW) / 2);
    lbLeft = lbRight = side;
  } else {
    usedW = hostW;
    usedH = Math.round(usedW / targetAR);
    const bar = Math.floor((hostH - usedH) / 2);
    lbTop = lbBottom = bar;
  }

  comparisonWrapper.style.setProperty('--lb-top',    lbTop + 'px');
  comparisonWrapper.style.setProperty('--lb-bottom', lbBottom + 'px');
  comparisonWrapper.style.setProperty('--lb-left',   lbLeft + 'px');
  comparisonWrapper.style.setProperty('--lb-right',  lbRight + 'px');

 comparisonWrapper._lbLeft  = lbLeft;
comparisonWrapper._lbRight = lbRight;
comparisonWrapper._lbTop    = lbTop;    // ✅ toevoegen
comparisonWrapper._lbBottom = lbBottom; // ✅ toevoegen
comparisonWrapper._usableW = usedW;
}

// VERVANGT resetSplitToMiddle()
function resetSplitToMiddle() {
  const rect    = comparisonWrapper.getBoundingClientRect();
  const lbLeft  = comparisonWrapper._lbLeft  || 0;
  const lbRight = comparisonWrapper._lbRight || 0;
  const usable  = Math.max(1, Math.round(rect.width - lbLeft - lbRight));

  const mid = Math.round(usable / 2);

  // clip aan beide kanten: links = lbLeft, rechts = lbRight + rest
  const leftInsetPx  = lbLeft;
  const rightInsetPx = lbRight + (usable - mid);

  const inset = `inset(0 ${rightInsetPx}px 0 ${leftInsetPx}px)`;
  afterWrapper.style.clipPath = inset;
  afterWrapper.style.webkitClipPath = inset;

  // lijn precies midden in bruikbare beeldvlak
  slider.style.left = (lbLeft + mid) + 'px';

// ✅ lijn alleen over bruikbare hoogte
const lbTop    = comparisonWrapper._lbTop    || 0;
const lbBottom = comparisonWrapper._lbBottom || 0;
const usableHeight = Math.max(1, Math.round(rect.height - lbTop - lbBottom));

slider.style.top    = lbTop + 'px';
slider.style.height = usableHeight + 'px';
slider.style.bottom = 'auto';
}

// VERVANGT updateSliderPosition()
function updateSliderPosition(clientX) {
  const rect    = comparisonWrapper.getBoundingClientRect();
  const lbLeft  = comparisonWrapper._lbLeft  || 0;
  const lbRight = comparisonWrapper._lbRight || 0;
  const usable  = Math.max(1, Math.round(rect.width - lbLeft - lbRight));

  // cursorpositie binnen het bruikbare beeld (tussen de pillarboxen)
  const xInUsable = clientX - rect.left - lbLeft;
  const clamped   = Math.max(0, Math.min(Math.round(xInUsable), usable));

  // clip aan beide kanten: links vast = lbLeft, rechts = lbRight + rest
  const leftInsetPx  = lbLeft;
  const rightInsetPx = lbRight + (usable - clamped);

  const inset = `inset(0 ${rightInsetPx}px 0 ${leftInsetPx}px)`;
  afterWrapper.style.clipPath = inset;
  afterWrapper.style.webkitClipPath = inset;

  // lijn op exact dezelfde X als de overgang
  slider.style.left = (lbLeft + clamped) + 'px';

// ✅ lijn alleen over bruikbare hoogte
const lbTop    = comparisonWrapper._lbTop    || 0;
const lbBottom = comparisonWrapper._lbBottom || 0;
const usableHeight = Math.max(1, Math.round(rect.height - lbTop - lbBottom));

slider.style.top    = lbTop + 'px';
slider.style.height = usableHeight + 'px';
slider.style.bottom = 'auto';
}
function pulseFsBars({ duration = 1400 } = {}) {
  const start = performance.now();
  (function tick(now) {
    if (!isWrapperFullscreen()) return;
    updateFullscreenBars();
    resetSplitToMiddle();
    if (now - start < duration) requestAnimationFrame(tick);
  })(start);
}
// === Keyboard shortcuts ===
function onGlobalKeydown(e) {
  // voorkom conflict met browser/OS sneltoetsen
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const tag = (document.activeElement?.tagName || "").toUpperCase();
  if (["INPUT", "TEXTAREA"].includes(tag)) return; // SELECT laten we door

  const k = (e.key || "").toLowerCase();
  if (k === "f") {
    e.preventDefault();
    toggleFullscreen();
  }
  if (k === "d") {
    e.preventDefault();
    document.getElementById("detailViewToggle")?.click();
  }
}
window.addEventListener("keydown", onGlobalKeydown, { capture: true });
