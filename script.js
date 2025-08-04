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
// PDF DOWNLOAD MET LAYOUT FIXES — TVL RENTAL

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

document.getElementById("downloadPdfButton").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const comparison = document.getElementById("comparisonWrapper");
  const leftImg = document.getElementById("afterImgTag");
  const rightImg = document.getElementById("beforeImgTag");
  const leftLabel = document.getElementById("leftLabel").textContent;
  const rightLabel = document.getElementById("rightLabel").textContent;

  const logoUrl = "logo_pdf.png"; // recht formaat!

  const loadImage = url => new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = url;
  });

  const renderImageData = imgEl => new Promise(resolve => {
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

  const drawImageFull = (src, y = 80) => {
    const imgRatio = src.width / src.height;
    const targetWidth = pageWidth;
    const targetHeight = pageWidth / imgRatio;
    const height = Math.min(targetHeight, pageHeight - y - 60);
    pdf.addImage(src.src, "JPEG", 0, y, pageWidth, height);
    return y + height;
  };

  const drawLogoSmall = async () => {
    const logo = await loadImage(logoUrl);
    const logoWidth = 100;
    const logoHeight = logo.height * (logoWidth / logo.width);
    pdf.addImage(logo, "PNG", pageWidth - logoWidth - 20, pageHeight - logoHeight - 20, logoWidth, logoHeight);
  };

  const drawLensText = (label, descObj) => {
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.text(label, pageWidth / 2, 50, { align: "center" });

    pdf.setFontSize(12);
    const textLines = pdf.splitTextToSize(descObj.text, pageWidth - 100);
    pdf.text(textLines, 50, 70);

    pdf.setTextColor(100, 150, 255);
    pdf.textWithLink(descObj.url, 50, 80 + textLines.length * 14, { url: descObj.url });
  };

  const splitCanvas = await html2canvas(comparison, { scale: 2, useCORS: true });
  const split = await loadImage(splitCanvas.toDataURL("image/jpeg", 1.0));
  const left = await loadImage(await renderImageData(leftImg));
  const right = await loadImage(await renderImageData(rightImg));

  // PAGINA 1: SPLIT
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(leftLabel, 40, 40);
  pdf.text(rightLabel, pageWidth - 40 - pdf.getTextWidth(rightLabel), 40);
  drawImageFull(split);
  await drawLogoSmall();

  // PAGINA 2: LEFT
  pdf.addPage();
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  drawLensText(leftLabel, lensDescriptions[leftSelect.value]);
  drawImageFull(left);
  await drawLogoSmall();

  // PAGINA 3: RIGHT
  pdf.addPage();
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  drawLensText(rightLabel, lensDescriptions[rightSelect.value]);
  drawImageFull(right);
  await drawLogoSmall();

  pdf.save(`lens-comparison-${new Date().toISOString().slice(0, 10)}.pdf`);
});
