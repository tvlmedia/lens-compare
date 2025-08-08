// ====== LENS COMPARISON TOOL SCRIPT (WERKEND MET PDF LOGO) ======
if (window.innerWidth < 768) {
  document.body.classList.add("mobile-mode");
}

window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    document.body.classList.add("mobile-mode");
  } else {
    document.body.classList.remove("mobile-mode");
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
const comparisonWrapper = document.getElementById("comparisonWrapper");
const leftLabel = document.getElementById("leftLabel");
const rightLabel = document.getElementById("rightLabel");

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

  leftLabel.textContent = `Lens: ${leftSelect.value} ${notes[leftBaseKey] || focalLength} ${tStopFormatted}`;
  rightLabel.textContent = `Lens: ${rightSelect.value} ${notes[rightBaseKey] || focalLength} ${tStopFormatted}`;
}

updateLensInfo();
updateImages();

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

updateImages();
updateLensInfo();



updateImages(); // ← staat er al

// Force update to fix initial load issue
setTimeout(() => updateImages(), 50);

let isDragging = false;

function updateSliderPosition(clientX) {
  const rect = comparisonWrapper.getBoundingClientRect();
  const offset = Math.max(0, Math.min(clientX - rect.left, rect.width));
  const percent = (offset / rect.width) * 100;
  afterWrapper.style.width = `${percent}%`;
  slider.style.left = `${percent}%`;
}

// Mouse events
slider.addEventListener("mousedown", () => isDragging = true);
window.addEventListener("mouseup", () => isDragging = false);
window.addEventListener("mousemove", e => {
  if (!isDragging) return;
  updateSliderPosition(e.clientX);
});

// Touch events
slider.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isDragging = true;
}, { passive: false });

window.addEventListener("touchend", () => isDragging = false);

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

document.getElementById("fullscreenButton")?.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    comparisonWrapper.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
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
// ===== DETAIL VIEW LOGIC =====
const detailToggleBtn = document.getElementById("detailViewToggle");
const detailOverlay = document.getElementById("detailOverlay");
const leftDetail = document.getElementById("leftDetail");
const rightDetail = document.getElementById("rightDetail");
const leftDetailImg = leftDetail.querySelector("img");
const rightDetailImg = rightDetail.querySelector("img");

let detailModeActive = false;

detailToggleBtn.addEventListener("click", () => {
  detailModeActive = !detailModeActive;
  detailOverlay.classList.toggle("active", detailModeActive);
  if (detailModeActive) {
    leftDetailImg.src = afterImgTag.src;
    rightDetailImg.src = beforeImgTag.src;
  }
});

detailOverlay.addEventListener("mousemove", (e) => {
  const rect = detailOverlay.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;

  const boxSize = 200;
  const offset = 10;

  // Position both squares
  leftDetail.style.left = `${x - boxSize - offset}px`;
  leftDetail.style.top = `${y - boxSize / 2}px`;

  rightDetail.style.left = `${x + offset}px`;
  rightDetail.style.top = `${y - boxSize / 2}px`;

  // Update image position (zoom effect)
  const scale = 2; // Vergroting
  const imgX = -((x - rect.left) * scale - boxSize / 2);
  const imgY = -((y - rect.top) * scale - boxSize / 2);

  leftDetailImg.style.transform = `scale(${scale}) translate(${imgX / scale}px, ${imgY / scale}px)`;
  rightDetailImg.style.transform = `scale(${scale}) translate(${imgX / scale}px, ${imgY / scale}px)`;
});

// Sluit detail view met ESC
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && detailModeActive) {
    detailOverlay.classList.remove("active");
    detailModeActive = false;
  }
});
