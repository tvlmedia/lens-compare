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
// PDF export functie met nette layout en logo + beschrijvingen

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

  // Lens links en beschrijvingen
  const lensDescriptions = {
    "IronGlass Zeiss Jena": {
      text: "De Zeiss Jena’s zijn een uitstekende keuze voor cinematografen die zoeken naar een zachte vintage signatuur zonder zware distortie of gekke flares. Ze voegen karakter toe, maar laten de huid spreken.",
      url: "https://tvlrental.nl/ironglasszeissjena/"
    },
    "IronGlass Red P": {
      text: "De IronGlass RED P set is een zeldzame vondst: bestaande uit de alleroudste series van Sovjet-lenzen (Helios, Mir, Jupiter) met single coating en maximale karakterweergave. Geen tweaks, geen trucjes – dit zijn de lenzen zoals ze vroeger werden gebouwd, met alle optische imperfecties, flare-gevoeligheid en ziel die je mag verwachten van pure vintage glasoptiek.",
      url: "https://tvlrental.nl/ironglassredp/"
    }
  };

  // Helpers
  async function loadImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.src = url;
    });
  }

  function fillBlack() {
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
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

  const logo = await loadImage(logoUrl);
  const splitCanvas = await html2canvas(comparison, { scale: 2, useCORS: true });
  const splitImg = splitCanvas.toDataURL("image/jpeg", 1.0);
  const leftImgData = await renderImageData(leftImg);
  const rightImgData = await renderImageData(rightImg);

  function drawLogo() {
    const logoWidth = 120 * 3;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    pdf.addImage(logo, "PNG", pageWidth - logoWidth - 20, pageHeight - logoHeight - 20, logoWidth, logoHeight);
  }

  function drawTextBlock(text, link, yStart) {
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(text, pageWidth - 80);
    pdf.text(lines, pageWidth / 2, yStart, { align: "center" });
    pdf.setTextColor(100, 150, 255);
    pdf.textWithLink(link, pageWidth / 2, yStart + lines.length * 12 + 8, { url: link, align: "center" });
  }

  // Pagina 1 – split
  fillBlack();
  pdf.addImage(splitImg, "JPEG", 0, 60, pageWidth, pageHeight - 140);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(leftLabel, 40, 40);
  pdf.text(rightLabel, pageWidth - 40 - pdf.getTextWidth(rightLabel), 40);
  drawLogo();
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text("tvlrental.nl", pageWidth / 2, pageHeight - 10, { align: "center" });

  // Pagina 2 – left only
  pdf.addPage();
  fillBlack();
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(leftLabel, pageWidth / 2, 40, { align: "center" });
  pdf.addImage(leftImgData, "JPEG", 0, 60, pageWidth, pageHeight - 160);
  drawTextBlock(lensDescriptions[leftLabel.split(": ")[1]]?.text || "", lensDescriptions[leftLabel.split(": ")[1]]?.url || "", pageHeight - 90);
  drawLogo();

  // Pagina 3 – right only
  pdf.addPage();
  fillBlack();
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(rightLabel, pageWidth / 2, 40, { align: "center" });
  pdf.addImage(rightImgData, "JPEG", 0, 60, pageWidth, pageHeight - 160);
  drawTextBlock(lensDescriptions[rightLabel.split(": ")[1]]?.text || "", lensDescriptions[rightLabel.split(": ")[1]]?.url || "", pageHeight - 90);
  drawLogo();

  const filename = `lens-comparison-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
});
