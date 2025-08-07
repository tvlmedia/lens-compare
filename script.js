// ====== LENS COMPARISON TOOL SCRIPT (WERKEND MET PDF LOGO) ======

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
  "cooke_panchro_ff_25mm": "32mm"
};

const lensImageMap = {
  "ironglass_red_p_35mm_t2_8": "red_p_37mm_t2_8.jpg",
  "ironglass_zeiss_jena_35mm_t2_8": "zeiss_jena_35mm_t2_8.jpg"
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

[leftSelect, rightSelect, tStopSelect, focalLengthSelect].forEach(el =>
  el.addEventListener("change", updateImages)
);
leftSelect.value = "IronGlass Red P";
rightSelect.value = "IronGlass Zeiss Jena";
tStopSelect.value = "2.8";
focalLengthSelect.value = "35mm";

let isDragging = false;
slider.addEventListener("mousedown", () => isDragging = true);
window.addEventListener("mouseup", () => isDragging = false);
window.addEventListener("mousemove", e => {
  if (!isDragging) return;
  const rect = comparisonWrapper.getBoundingClientRect();
  const offset = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const percent = (offset / rect.width) * 100;
  afterWrapper.style.width = `${percent}%`;
  slider.style.left = `${percent}%`;
});

updateImages();

document.getElementById("toggleButton").addEventListener("click", () => {
  const leftValue = leftSelect.value;
  const rightValue = rightSelect.value;
  leftSelect.value = rightValue;
  rightSelect.value = leftValue;
  updateImages();
});

document.getElementById("fullscreenButton").addEventListener("click", () => {
  const wrapper = document.getElementById("comparisonWrapper");
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (wrapper.requestFullscreen) {
      wrapper.requestFullscreen();
    } else if (wrapper.webkitRequestFullscreen) {
      wrapper.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});


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

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const logoUrl = "https://tvlmedia.github.io/lens-compare/LOGOVOORPDF.png";
  const logo = await loadImage(logoUrl);

  const lensDescriptions = {
    "IronGlass Red P": {
      text: "De IronGlass RED P set is een zeldzame vondst: bestaande uit de alleroudste series Sovjet-lenzen met single coating en maximale karakterweergave. Geen tweaks, geen trucjes – puur vintage glasoptiek.",
      url: "https://tvlrental.nl/ironglassredp/"
    },
    "IronGlass Zeiss Jena": {
      text: "De Zeiss Jena’s zijn een uitstekende keuze voor cinematografen die zoeken naar een zachte vintage signatuur zonder zware distortie of gekke flares. Ze voegen karakter toe, maar laten de huid spreken.",
      url: "https://tvlrental.nl/ironglasszeissjena/"
    }
  };

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
    // Beeld is breder dan pagina: schalen op hoogte
    imgHeight = pageHeight - top - bottom;
    imgWidth = imgHeight * imgAspect;
    x = (pageWidth - imgWidth) / 2;
    y = top;
  } else {
    // Beeld is smaller of exact passend: schalen op breedte
    imgWidth = pageWidth;
    imgHeight = imgWidth / imgAspect;
    x = 0;
    y = top - ((imgHeight - (pageHeight - top - bottom)) / 2); // centreren en croppen
  }

  pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
}

  function drawBottomBar(text, link = "") {
  const barHeight = 70;
  const margin = 20;
  const logoSpace = 150;
  const textWidth = pageWidth - margin - logoSpace;

  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");

  if (text) {
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(text, textWidth);
    pdf.text(lines, margin, pageHeight - barHeight + 20);
  }

  if (link) {
    pdf.setTextColor(80, 160, 255);
    pdf.setFontSize(10);
    pdf.textWithLink("Klik hier voor meer info", margin, pageHeight - 15, {
      url: link
    });
  }
}

  function drawBottomBarCenteredLink(link = "") {
    const barHeight = 70;

    // Zwarte balk
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");

    // Gecentreerde klikbare tekst
    if (link) {
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      const displayText = "Vergelijk meer lenzen op TVLRENTAL.NL";
      const textWidth = pdf.getTextWidth(displayText);
      const x = (pageWidth - textWidth) / 2;
      const y = pageHeight - barHeight / 2 + 5;
      pdf.textWithLink(displayText, x, y, { url: link });
    }

    // Logo rechtsonder
    const targetHeight = 50;
    const ratio = logo.width / logo.height;
    const targetWidth = targetHeight * ratio;
    const xLogo = pageWidth - targetWidth - 12;
    const yLogo = pageHeight - targetHeight - 12;
    pdf.addImage(logo, "PNG", xLogo, yLogo, targetWidth, targetHeight);
  }

  function drawBottomLogo() {
    const targetHeight = 50;
    const ratio = logo.width / logo.height;
    const targetWidth = targetHeight * ratio;
    const x = pageWidth - targetWidth - 12;
    const y = pageHeight - targetHeight - 12;
    pdf.addImage(logo, "PNG", x, y, targetWidth, targetHeight);
  }

  // ===== PAGINA 1 =====
  fillBlack();
  drawTopBar(`${leftText} vs ${rightText}`);
  await drawFullWidthImage(splitData);
  drawBottomBarCenteredLink("https://tvlrental.nl/lenses/");

  // ===== PAGINA 2 =====
  pdf.addPage();
  fillBlack();
  drawTopBar(leftText);
  await drawFullWidthImage(leftData);
  drawBottomBar(lensDescriptions[left]?.text || "", lensDescriptions[left]?.url);
  drawBottomLogo();

  // ===== PAGINA 3 =====
  pdf.addPage();
  fillBlack();
  drawTopBar(rightText);
  await drawFullWidthImage(rightData);
  drawBottomBar(lensDescriptions[right]?.text || "", lensDescriptions[right]?.url);
  drawBottomLogo();

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
