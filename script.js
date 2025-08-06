// ====== LENS COMPARISON TOOL SCRIPT (vanaf 0) ======

const lenses = [
  "IronGlass Red P",
  "IronGlass Zeiss Jena",
  "DZO Vespid",
  "DZO Arles",
  "Cooke Panchro FF",
  "Lomo Standard Speed"
];

const lensNotes = {
  "ironglass_red_p_35mm": "37mm",
  "ironglass_zeiss_jena_35mm": "35mm",
  "cooke_panchro_ff_25mm": "32mm"
};

const customFilenames = {
  "ironglass_red_p_35mm_t2_8": "red_p_37mm_t2_8.jpg",
  "ironglass_zeiss_jena_35mm_t2_8": "zeiss_jena_35mm_t2_8.jpg",

  "ironglass_red_p_50mm_t2_8": "red_p_58mm_t2_8.jpg",
  "ironglass_zeiss_jena_50mm_t2_8": "zeiss_jena_50mm_t2_8.jpg"
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

// Populate selects
lenses.forEach(lens => {
  leftSelect.add(new Option(lens, lens));
  rightSelect.add(new Option(lens, lens));
});

// Main update function
function updateComparison() {
  const left = leftSelect.value.toLowerCase().replaceAll(" ", "_");
  const right = rightSelect.value.toLowerCase().replaceAll(" ", "_");
  const tStop = tStopSelect.value.replace(".", "_");
  const focal = focalSelect.value;

  const lKey = `${left}_${focal}_t${tStop}`;
  const rKey = `${right}_${focal}_t${tStop}`;

  const lPath = `images/${customFilenames[lKey] || lKey + ".jpg"}`;
  const rPath = `images/${customFilenames[rKey] || rKey + ".jpg"}`;

  afterImg.src = lPath;
  beforeImg.src = rPath;

  const tStopText = `T${tStopSelect.value}`;
  leftLabel.textContent = `Lens: ${leftSelect.value} ${lensNotes[`${left}_${focal}`] || focal} ${tStopText}`;
  rightLabel.textContent = `Lens: ${rightSelect.value} ${lensNotes[`${right}_${focal}`] || focal} ${tStopText}`;

  // Reset slider
  afterWrapper.style.width = "50%";
  slider.style.left = "50%";
}

// Initial state
leftSelect.value = lenses[0];
rightSelect.value = lenses[1];
tStopSelect.value = "2.8";
focalSelect.value = "35mm";
updateComparison();

// Change listeners
[leftSelect, rightSelect, tStopSelect, focalSelect].forEach(el => el.addEventListener("change", updateComparison));

// Slider drag logic
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

// Touch support (werkt ook fullscreen op mobiel)
slider.addEventListener("touchstart", (e) => {
  dragging = true;
  e.preventDefault();
}, { passive: false });

window.addEventListener("touchend", () => {
  dragging = false;
});

window.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  const rect = wrapper.getBoundingClientRect();
  const pos = Math.min(Math.max(0, e.touches[0].clientX - rect.left), rect.width);
  const percent = (pos / rect.width) * 100;
  afterWrapper.style.width = `${percent}%`;
  slider.style.left = `${percent}%`;
}, { passive: false });

// Flip
const flipBtn = document.getElementById("toggleButton");
flipBtn.addEventListener("click", () => {
  const l = leftSelect.value;
  leftSelect.value = rightSelect.value;
  rightSelect.value = l;
  updateComparison();
});

// Fullscreen
const fullscreenBtn = document.getElementById("fullscreenButton");
fullscreenBtn.addEventListener("click", () => {
  const el = wrapper;
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else {
    alert("Fullscreen wordt niet ondersteund op dit apparaat.");
  }
});

// Verberg fullscreen knop als niet ondersteund
if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) {
  fullscreenBtn.style.display = "none";
}

// Mobile check
function checkMobileClass() {
  const isMobile = window.innerWidth <= 768;
  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
  document.body.classList.toggle("mobile-mode", isMobile && !isFullscreen);
}

window.addEventListener("resize", checkMobileClass);
document.addEventListener("fullscreenchange", checkMobileClass);
checkMobileClass();

// Download PDF knop
document.getElementById("downloadPdfButton").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;

  // 1. Capture beide beelden via canvas
  const beforeCanvas = await html2canvas(beforeImg, { useCORS: true });
  const afterCanvas = await html2canvas(afterImg, { useCORS: true });

  // 2. Maak nieuwe PDF
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [960, 540] });

  // 3. Voeg split-image toe op pagina 1
  const combinedCanvas = document.createElement("canvas");
  combinedCanvas.width = 960;
  combinedCanvas.height = 540;
  const ctx = combinedCanvas.getContext("2d");
  ctx.drawImage(beforeCanvas, 0, 0, 480, 540);
  ctx.drawImage(afterCanvas, 480, 0, 480, 540);

  pdf.addImage(combinedCanvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, 960, 540);

  // 4. Functie om losse pagina's toe te voegen
  const addLensPage = async (img, title, description, link) => {
    pdf.addPage([960, 540], "landscape");
    const imgCanvas = await html2canvas(img, { useCORS: true });
    const imgData = imgCanvas.toDataURL("image/jpeg", 1.0);
    pdf.addImage(imgData, "JPEG", 0, 0, 960, 400);

    // Zwarte balk
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 400, 960, 140, "F");

    // Witte tekst
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.text(title, 40, 430);
    pdf.setFontSize(12);
    pdf.text(description, 40, 460);

    // Link
    pdf.setTextColor(100, 180, 255);
    pdf.textWithLink("Klik hier voor meer info", 40, 490, { url: link });

    // Logo rechtsboven
    const logo = new Image();
    logo.src = "/images/logo_tvlrental.png"; // Pas aan naar jouw pad
    await new Promise(resolve => logo.onload = resolve);
    pdf.addImage(logo, "PNG", 840, 410, 80, 80);
  };

  // 5. Voeg lenspagina’s toe
  const leftLens = leftSelect.value;
  const rightLens = rightSelect.value;
  const tStop = tStopSelect.value;
  const focal = focalSelect.value;

  await addLensPage(afterImg, `${leftLens} - ${focal} T${tStop}`, "Beschrijving lens", `https://tvlrental.nl/${leftLens.toLowerCase().replaceAll(" ", "")}`);
  await addLensPage(beforeImg, `${rightLens} - ${focal} T${tStop}`, "Beschrijving lens", `https://tvlrental.nl/${rightLens.toLowerCase().replaceAll(" ", "")}`);

  // 6. Download PDF
  pdf.save("lens_comparison.pdf");
});
