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

  afterWrapper.style.width = "50%";
  slider.style.left = "50%";
}

leftSelect.value = lenses[0];
rightSelect.value = lenses[1];
tStopSelect.value = "2.8";
focalSelect.value = "35mm";
updateComparison();

[leftSelect, rightSelect, tStopSelect, focalSelect].forEach(el => el.addEventListener("change", updateComparison));

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

const flipBtn = document.getElementById("toggleButton");
flipBtn.addEventListener("click", () => {
  const l = leftSelect.value;
  leftSelect.value = rightSelect.value;
  rightSelect.value = l;
  updateComparison();
});

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

if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) {
  fullscreenBtn.style.display = "none";
}

function checkMobileClass() {
  const isMobile = window.innerWidth <= 768;
  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
  document.body.classList.toggle("mobile-mode", isMobile && !isFullscreen);
}

window.addEventListener("resize", checkMobileClass);
document.addEventListener("fullscreenchange", checkMobileClass);
checkMobileClass();

document.getElementById("downloadPdfButton").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const beforeCanvas = await html2canvas(beforeImg, { useCORS: true });
  const afterCanvas = await html2canvas(afterImg, { useCORS: true });
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [960, 540]
