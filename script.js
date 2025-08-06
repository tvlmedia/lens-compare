const lenses = [
  "IronGlass Red P",
  "IronGlass Zeiss Jena",
  "DZO Vespid",
  "DZO Arles",
  "Cooke Panchro FF",
  "Lomo Standard Speed"
];

const customFilenames = {
  "ironglass_red_p_35mm_t2_8": "red_p_37mm_t2_8.jpg",
  "ironglass_zeiss_jena_35mm_t2_8": "zeiss_jena_35mm_t2_8.jpg",
  "ironglass_red_p_50mm_t2_8": "red_p_58mm_t2_8.jpg",
  "ironglass_zeiss_jena_50mm_t2_8": "zeiss_jena_50mm_t2_8.jpg"
};

const lensNotes = {
  "ironglass_red_p_35mm": "37mm",
  "ironglass_zeiss_jena_35mm": "35mm",
  "cooke_panchro_ff_25mm": "32mm"
};

// Elements
const leftSelect = document.getElementById("leftLens");
const rightSelect = document.getElementById("rightLens");
const tStopSelect = document.getElementById("tStop");
const focalSelect = document.getElementById("focalLength");
const beforeImg = document.getElementById("beforeImgTag");
const afterImg = document.getElementById("afterImgTag");
const slider = document.getElementById("slider");
const afterWrapper = document.getElementById("afterWrapper");
const wrapper = document.getElementById("comparisonWrapper");
const leftLabel = document.getElementById("leftLabel");
const rightLabel = document.getElementById("rightLabel");

lenses.forEach(lens => {
  leftSelect.add(new Option(lens, lens));
  rightSelect.add(new Option(lens, lens));
});

function updateComparison() {
  const left = leftSelect.value.toLowerCase().replaceAll(" ", "_");
  const right = rightSelect.value.toLowerCase().replaceAll(" ", "_");
  const tStop = tStopSelect.value.replace(".", "_");
  const focal = focalSelect.value;

  const leftKey = `${left}_${focal}_t${tStop}`;
  const rightKey = `${right}_${focal}_t${tStop}`;

  afterImg.src = `images/${customFilenames[leftKey] || leftKey + ".jpg"}`;
  beforeImg.src = `images/${customFilenames[rightKey] || rightKey + ".jpg"}`;

  const tText = `T${tStopSelect.value}`;
  leftLabel.textContent = `Lens: ${leftSelect.value} ${lensNotes[`${left}_${focal}`] || focal} ${tText}`;
  rightLabel.textContent = `Lens: ${rightSelect.value} ${lensNotes[`${right}_${focal}`] || focal} ${tText}`;

  afterWrapper.style.width = "50%";
  slider.style.left = "50%";
}

// Init
leftSelect.value = lenses[0];
rightSelect.value = lenses[1];
tStopSelect.value = "2.8";
focalSelect.value = "35mm";
updateComparison();
[leftSelect, rightSelect, tStopSelect, focalSelect].forEach(el =>
  el.addEventListener("change", updateComparison)
);

// Slider drag
let dragging = false;
slider.addEventListener("mousedown", () => dragging = true);
window.addEventListener("mouseup", () => dragging = false);
window.addEventListener("mousemove", e => {
  if (!dragging) return;
  const rect = wrapper.getBoundingClientRect();
  const pos = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
  const percent = (pos / rect.width) * 100;
  afterWrapper.style.width = `${percent}%`;
  slider.style.left = `${percent}%`;
});
slider.addEventListener("touchstart", (e) => {
  dragging = true;
  e.preventDefault();
}, { passive: false });
window.addEventListener("touchend", () => dragging = false);
window.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  const rect = wrapper.getBoundingClientRect();
  const pos = Math.min(Math.max(0, e.touches[0].clientX - rect.left), rect.width);
  const percent = (pos / rect.width) * 100;
  afterWrapper.style.width = `${percent}%`;
  slider.style.left = `${percent}%`;
}, { passive: false });

// Flip
document.getElementById("toggleButton").addEventListener("click", () => {
  const l = leftSelect.value;
  leftSelect.value = rightSelect.value;
  rightSelect.value = l;
  updateComparison();
});

// Fullscreen
document.getElementById("fullscreenButton").addEventListener("click", () => {
  if (wrapper.requestFullscreen) wrapper.requestFullscreen();
  else if (wrapper.webkitRequestFullscreen) wrapper.webkitRequestFullscreen();
});

// PDF
document.getElementById("downloadPdfButton").addEventListener("click", async () => {
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF || !html2canvas) {
    alert("PDF tools niet geladen.");
    return;
  }

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [960, 540] });

  try {
    const beforeCanvas = await html2canvas(beforeImg, { useCORS: true });
    const afterCanvas = await html2canvas(afterImg, { useCORS: true });

    const combined = document.createElement("canvas");
    combined.width = 960;
    combined.height = 540;
    const ctx = combined.getContext("2d");
    ctx.drawImage(beforeCanvas, 0, 0, 480, 540);
    ctx.drawImage(afterCanvas, 480, 0, 480, 540);

    pdf.addImage(combined.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, 960, 540);

    const addLensPage = async (img, title, desc, link) => {
      pdf.addPage([960, 540], "landscape");
      const canvas = await html2canvas(img, { useCORS: true });
      const dataURL = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(dataURL, "JPEG", 0, 0, 960, 400);

      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 400, 960, 140, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text(title, 40, 430);
      pdf.setFontSize(12);
      pdf.text(desc, 40, 460);

      pdf.setTextColor(100, 180, 255);
      pdf.textWithLink("Klik hier voor meer info", 40, 490, { url: link });

      const logo = new Image();
      logo.src = "images/Logo PDF.png";
      await new Promise(resolve => logo.onload = resolve);
      pdf.addImage(logo, "PNG", 840, 410, 80, 80);
    };

    const left = leftSelect.value;
    const right = rightSelect.value;
    const focal = focalSelect.value;
    const t = tStopSelect.value;

    await addLensPage(afterImg, `${left} - ${focal} T${t}`, "Beschrijving lens", `https://tvlrental.nl/${left.toLowerCase().replaceAll(" ", "")}`);
    await addLensPage(beforeImg, `${right} - ${focal} T${t}`, "Beschrijving lens", `https://tvlrental.nl/${right.toLowerCase().replaceAll(" ", "")}`);

    pdf.save("lens_comparison.pdf");
  } catch (err) {
    console.error("PDF error:", err);
    alert("Fout bij genereren PDF.");
  }
});
