// ====== LENS COMPARISON TOOL SCRIPT (GEFIXT MET PDF LOGO, TEKST EN BESTANDSNAAM) ======

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
  "ironglass_zeiss_jena_35mm_t2_8": "zeiss_jena_35mm_t2_8.jpg",
  "ironglass_red_p_50mm_t2_8": "red_p_58mm_t2_8.jpg",
  "ironglass_zeiss_jena_50mm_t2_8": "zeiss_jena_50mm_t2_8.jpg"
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

  const tStopFormatted = `T${tStopSelect.value}`;

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
updateImages();

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

document.getElementById("toggleButton").addEventListener("click", () => {
  const left = leftSelect.value;
  const right = rightSelect.value;
  leftSelect.value = right;
  rightSelect.value = left;
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

document.getElementById("downloadPdfButton").addEventListener("click", async () => {
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

  async function drawFullWidth(imgData, yOffset = 0) {
    const img = new Image();
    img.src = imgData;
    await new Promise(resolve => img.onload = resolve);
    const aspect = img.width / img.height;
    const h = pageWidth / aspect;
    pdf.addImage(imgData, "JPEG", 0, yOffset, pageWidth, h);
    return h;
  }

  function drawLogo(x, y, logo) {
    const ratio = logo.width / logo.height;
    const w = 90;
    const h = w / ratio;
    pdf.addImage(logo, "PNG", x, y, w, h);
  }

  function drawDescription(lens) {
  const info = lensDescriptions[lens];
  if (!info) return;

  const boxHeight = 70;
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, pageHeight - boxHeight, pageWidth, boxHeight, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  const lines = pdf.splitTextToSize(info.text, pageWidth - 100);
  pdf.text(lines, 50, pageHeight - boxHeight + 20);

  pdf.setTextColor(80, 160, 255);
  pdf.textWithLink("Klik hier voor meer info", 50, pageHeight - 15, { url: info.url });
  }

  function fillBlack() {
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
  }

  const splitCanvas = await html2canvas(comparison, { scale: 2, useCORS: true });
  const splitData = splitCanvas.toDataURL("image/jpeg", 1.0);
  const leftData = await renderImage(leftImg);
  const rightData = await renderImage(rightImg);

  // Page 1
  fillBlack();
  await drawFullWidth(splitData, 40);
  drawLogo(pageWidth - 100, pageHeight - 70, logo);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(`${leftText}  vs  ${rightText}`, pageWidth / 2, 30, { align: "center" });
  pdf.text("tvlrental.nl", pageWidth / 2, pageHeight - 20, { align: "center" });

  // Page 2
  pdf.addPage();
  fillBlack();
  const hLeft = await drawFullWidth(leftData, 20);
  drawLogo(pageWidth - 100, 0, logo);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(leftText, pageWidth / 2, 30, { align: "center" });
  drawDescription(left, 40 + hLeft);

  // Page 3
  pdf.addPage();
  fillBlack();
  const hRight = await drawFullWidth(rightData, 10);
  drawLogo(pageWidth - 100, 0, logo);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(rightText, pageWidth / 2, 30, { align: "center" });
  drawDescription(right, 40 + hRight);

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
