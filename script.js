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
  const leftLabel = document.getElementById("leftLabel").textContent.trim();
  const rightLabel = document.getElementById("rightLabel").textContent.trim();

  const leftUrl = document.getElementById("beforeImage").querySelector("img").src;
  const rightUrl = document.getElementById("afterImage").querySelector("img").src;
  const logoUrl = "TVL Rental Logo Square.png"; // Zorg dat dit pad klopt

  const lensDescriptions = {
    "IronGlass Zeiss Jena": {
      url: "https://tvlrental.nl/ironglasszeissjena/",
      text: "De Zeiss Jena’s zijn een uitstekende keuze voor cinematografen die zoeken naar een zachte vintage signatuur zonder zware distortie of gekke flares. Ze voegen karakter toe, maar laten de huid spreken."
    },
    "IronGlass Red P": {
      url: "https://tvlrental.nl/ironglassredp/",
      text: "De IronGlass RED P set is een zeldzame vondst: bestaande uit de alleroudste series van Sovjet-lenzen met single coating en maximale karakterweergave. Geen tweaks, geen trucjes – dit is puur vintage glas met ziel."
    }
  };

  const canvas = await html2canvas(comparison, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/jpeg", 1.0);

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape", "pt", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 40;

  // Achtergrond zwart + witte tekst
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "normal");

  // Logo bovenin (optioneel)
  const logo = await loadImage(logoUrl);
  pdf.addImage(logo, "PNG", pageWidth / 2 - 50, y, 100, 100);
  y += 120;

  // Titel
  pdf.setFontSize(18);
  pdf.text(`${leftLabel}  ⟷  ${rightLabel}`, pageWidth / 2, y, { align: "center" });
  y += 20;

  // Split image
  pdf.addImage(imgData, "JPEG", 40, y, pageWidth - 80, 180);
  y += 200;

  // Beide beelden los
  const leftImg = await loadImage(leftUrl);
  const rightImg = await loadImage(rightUrl);
  const imgW = (pageWidth - 120) / 2;

  pdf.addImage(leftImg, "JPEG", 40, y, imgW, 140);
  pdf.addImage(rightImg, "JPEG", 60 + imgW, y, imgW, 140);
  y += 160;

  // Lensbeschrijvingen
  pdf.setFontSize(12);
  pdf.setTextColor(255);
  [leftLabel, rightLabel].forEach((label, index) => {
    const lens = Object.values(lensDescriptions).find(d => label.includes(d.url.split("/").pop().replace("ironglass", "").replace("/", "").trim()));
    const desc = lensDescriptions[label] || null;
    if (desc) {
      const x = index === 0 ? 40 : pageWidth / 2 + 20;
      pdf.textWithLink(desc.text, x, y, { url: desc.url, maxWidth: imgW });
    }
  });
  y += 60;

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(180);
  pdf.text("tvlrental.nl", pageWidth / 2, y, { align: "center" });

  // Save
  const now = new Date();
  const filename = `lens-comparison-${now.toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
});

// Helper: afbeelding laden
function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = src;
  });
}
