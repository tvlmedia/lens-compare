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
// Zorg dat je HTML een knop bevat met id="downloadPdfButton"
// en dat dit script onderaan je HTML staat (of gebruik defer)

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

  const logoUrl = "logo.png"; // Zorg dat dit logo in je map staat (zonder zwarte randen)

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

  function drawLogo(img) {
    const w = 90;
    const h = (img.height / img.width) * w;
    pdf.addImage(img, "PNG", pageWidth - w - 20, pageHeight - h - 20, w, h);
  }

  function drawTextBlock(label, url, desc, y) {
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.text(label, pageWidth / 2, y, { align: "center" });

    pdf.setFontSize(12);
    pdf.setTextColor(150, 150, 150);
    pdf.textWithLink(url, pageWidth / 2, y + 20, { url, align: "center" });

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    const split = pdf.splitTextToSize(desc, pageWidth - 160);
    pdf.text(split, pageWidth / 2, y + 40, { align: "center" });
  }

  const logo = await loadImage(logoUrl);
  const splitCanvas = await html2canvas(comparison, { scale: 2, useCORS: true });
  const splitData = splitCanvas.toDataURL("image/jpeg", 1.0);
  const leftData = await renderImageData(leftImg);
  const rightData = await renderImageData(rightImg);

  const lensInfo = {
    "IronGlass Red P": {
      url: "https://tvlrental.nl/ironglassredp/",
      desc: "De IronGlass RED P set is een zeldzame vondst: bestaande uit de alleroudste series van Sovjet-lenzen (Helios, Mir, Jupiter) met single coating en maximale karakterweergave."
    },
    "IronGlass Zeiss Jena": {
      url: "https://tvlrental.nl/ironglasszeissjena/",
      desc: "De Zeiss Jena’s zijn een uitstekende keuze voor cinematografen die zoeken naar een zachte vintage signatuur zonder zware distortie of gekke flares."
    }
  };

  // PAGE 1
  fillBlack();
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(leftLabel, 40, 40);
  pdf.text(rightLabel, pageWidth - 40 - pdf.getTextWidth(rightLabel), 40);
  pdf.addImage(splitData, "JPEG", 0, 60, pageWidth, pageHeight - 120);
  drawLogo(logo);

  // PAGE 2
  pdf.addPage();
  fillBlack();
  pdf.addImage(leftData, "JPEG", 0, 60, pageWidth, pageHeight - 120);
  drawTextBlock(leftLabel, lensInfo[leftLabel.split(": ")[1]]?.url || "https://tvlrental.nl", lensInfo[leftLabel.split(": ")[1]]?.desc || "", 30);
  drawLogo(logo);

  // PAGE 3
  pdf.addPage();
  fillBlack();
  pdf.addImage(rightData, "JPEG", 0, 60, pageWidth, pageHeight - 120);
  drawTextBlock(rightLabel, lensInfo[rightLabel.split(": ")[1]]?.url || "https://tvlrental.nl", lensInfo[rightLabel.split(": ")[1]]?.desc || "", 30);
  drawLogo(logo);

  pdf.save(`lens-comparison-${new Date().toISOString().slice(0, 10)}.pdf`);
});
