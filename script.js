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

  // correcte volgorde:
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
document.getElementById("downloadPdfButton").addEventListener("click", async () => {
  const comparison = document.getElementById("comparisonWrapper");
  const leftImg = document.getElementById("afterImgTag");
  const rightImg = document.getElementById("beforeImgTag");
  const leftLabel = document.getElementById("leftLabel").textContent;
  const rightLabel = document.getElementById("rightLabel").textContent;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const logoUrl = "Logo PDF.png";

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

  function fillBlack() {
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
  }

  async function loadImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.src = url;
    });
  }

  async function renderImageData(imgEl) {
    return new Promise(resolve => {
      const canvas = document.createElement("canvas");
      canvas.width = imgEl.naturalWidth || 1920;
      canvas.height = imgEl.naturalHeight || 1080;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 1.0));
      };
      img.src = imgEl.src;
    });
  }

  async function drawImageFullWidth(imageData, yOffset = 0) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const targetWidth = pageWidth;
        const targetHeight = targetWidth / aspectRatio;
        pdf.addImage(imageData, "JPEG", 0, yOffset, targetWidth, targetHeight);
        resolve(yOffset + targetHeight);
      };
      img.src = imageData;
    });
  }

  function drawLogo(x, y, maxW = 90) {
    const ratio = logo.width / logo.height;
    const h = maxW / ratio;
    pdf.addImage(logo, "PNG", x, y, maxW, h);
  }

  function drawDescriptionBlock(lensName, yStart) {
    const info = lensDescriptions[lensName];
    if (!info) return;

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(info.text, pageWidth - 110);
    pdf.text(lines, 50, yStart);

    pdf.setTextColor(80, 160, 255);
    pdf.textWithLink("Klik hier voor meer info", 50, yStart + lines.length * 12 + 4, { url: info.url });
  }

  const splitCanvas = await html2canvas(comparison, { scale: 2, useCORS: true });
  const splitData = splitCanvas.toDataURL("image/jpeg", 1.0);
  const leftData = await renderImageData(leftImg);
  const rightData = await renderImageData(rightImg);
  const logo = await loadImage(logoUrl);

  // Pagina 1: splitscreen
  fillBlack();
  await drawImageFullWidth(splitData, 40);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
pdf.setFontSize(14);
pdf.text(`${leftLabel}  vs  ${rightLabel}`, pageWidth / 2, 30, { align: "center" });
  pdf.text("tvlrental.nl", pageWidth / 2, pageHeight - 20, { align: "center" });

  // Pagina 2: Left lens
  pdf.addPage();
  fillBlack();
  const yLeftEnd = await drawImageFullWidth(leftData, 40);
  drawLogo(pageWidth - 100, 0, 70);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(leftLabel, pageWidth / 2, 30, { align: "center" });
 drawDescriptionBlock(leftSelect.value, yLeftEnd + 10);

  // Pagina 3: Right lens
  pdf.addPage();
  fillBlack();
  const yRightEnd = await drawImageFullWidth(rightData, 40);
  drawLogo(pageWidth - 100, 0, 70);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(rightLabel, pageWidth / 2, 30, { align: "center" });
 drawDescriptionBlock(rightSelect.value, yRightEnd + 10);

  const filename = `lens-comparison-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
});
