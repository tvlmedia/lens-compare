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

  const lensDescriptions = {
    "IronGlass Red P": {
      url: "https://tvlrental.nl/ironglassredp/",
      desc: "De IronGlass RED P set is een zeldzame vondst: bestaande uit de alleroudste series Sovjet-lenzen. Single coating, pure karakter, flaregevoelig, imperfectie met ziel."
    },
    "IronGlass Zeiss Jena": {
      url: "https://tvlrental.nl/ironglasszeissjena/",
      desc: "De Zeiss Jena’s zijn ideaal voor cinematografen die zoeken naar een zachte vintage signatuur zonder gekke distortie of flares."
    }
  };

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const logoUrl = "logo.png"; // Zorg dat deze in je map staat

  function fillBlackBackground() {
    pdf.setFillColor(0, 0, 0); // Echte zwart
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
  }

  async function drawLogo(y = pageHeight - 60) {
    try {
      const img = new Image();
      img.src = logoUrl;
      await img.decode();
      const logoWidth = 60;
      const logoHeight = 60;
      pdf.addImage(logoUrl, "PNG", pageWidth / 2 - logoWidth / 2, y, logoWidth, logoHeight);
    } catch (e) {
      console.warn("Logo kon niet worden geladen.");
    }
  }

  // Pagina 1: Split
  const splitCanvas = await html2canvas(comparison, { scale: 2, useCORS: true });
  const splitImg = splitCanvas.toDataURL("image/jpeg", 1.0);
  fillBlackBackground();
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(leftLabel, 40, 40);
  pdf.text(rightLabel, pageWidth - 40 - pdf.getTextWidth(rightLabel), 40);
  pdf.addImage(splitImg, "JPEG", 0, 60, pageWidth, pageHeight - 130);
  pdf.setFontSize(10);
  pdf.text("tvlrental.nl", pageWidth / 2, pageHeight - 20, { align: "center" });
  await drawLogo();

  // Pagina 2: Left only
  const leftImgData = await renderSingleImageCanvas(leftImg);
  pdf.addPage("a4", "landscape");
  fillBlackBackground();
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(leftLabel, pageWidth / 2, 40, { align: "center" });
  pdf.addImage(leftImgData, "JPEG", 0, 60, pageWidth, pageHeight - 160);

  const leftName = leftLabel.split(" ")[1];
  const leftInfo = lensDescriptions[leftLabel.split(" ").slice(1, 3).join(" ")] || {};
  if (leftInfo.desc) {
    pdf.setFontSize(12);
    pdf.textWithLink(leftInfo.desc, 40, pageHeight - 60, { url: leftInfo.url });
  }

  pdf.setFontSize(10);
  pdf.text("tvlrental.nl", pageWidth / 2, pageHeight - 20, { align: "center" });
  await drawLogo();

  // Pagina 3: Right only
  const rightImgData = await renderSingleImageCanvas(rightImg);
  pdf.addPage("a4", "landscape");
  fillBlackBackground();
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(rightLabel, pageWidth / 2, 40, { align: "center" });
  pdf.addImage(rightImgData, "JPEG", 0, 60, pageWidth, pageHeight - 160);

  const rightInfo = lensDescriptions[rightLabel.split(" ").slice(1, 3).join(" ")] || {};
  if (rightInfo.desc) {
    pdf.setFontSize(12);
    pdf.textWithLink(rightInfo.desc, 40, pageHeight - 60, { url: rightInfo.url });
  }

  pdf.setFontSize(10);
  pdf.text("tvlrental.nl", pageWidth / 2, pageHeight - 20, { align: "center" });
  await drawLogo();

  const filename = `lens-comparison-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
});

async function renderSingleImageCanvas(imgElement) {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");
    canvas.width = imgElement.naturalWidth || 1920;
    canvas.height = imgElement.naturalHeight || 1080;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 1.0));
    };
    img.src = imgElement.src;
  });
}
