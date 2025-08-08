// ====== LENS COMPARISON TOOL SCRIPT (GEOPTIMALISEERD) ======
if (window.innerWidth < 768) document.body.classList.add("mobile-mode");

window.addEventListener("resize", () => {
  document.body.classList.toggle("mobile-mode", window.innerWidth < 768);
});

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
  "ironglass_red_p_50mm": "58mm",
  "ironglass_zeiss_jena_50mm": "50mm",
  "cooke_panchro_ff_25mm": "32mm",
  "cooke_panchro_ff_50mm": "50mm"
};

const lensImageMap = {
  "ironglass_red_p_35mm_t2_8": "red_p_37mm_t2_8.jpg",
  "ironglass_zeiss_jena_35mm_t2_8": "zeiss_jena_35mm_t2_8.jpg",
  "ironglass_red_p_50mm_t2_8": "red_p_58mm_t2_8.jpg",
  "ironglass_zeiss_jena_50mm_t2_8": "zeiss_jena_50mm_t2_8.jpg",
  "cooke_panchro_ff_50mm_t2_8": "cooke_panchro_ff_50mm_t2_8.jpg"
};

const lensDescriptions = {
  "IronGlass Red P": {
    text: "De IronGlass RED P set is een zeldzame vondst: bestaande uit de alleroudste series Sovjet-lenzen met single coating en maximale karakterweergave. Geen tweaks, geen trucjes – puur vintage glasoptiek.",
    url: "https://tvlrental.nl/ironglassredp/"
  },
  "IronGlass Zeiss Jena": {
    text: "De Zeiss Jena’s zijn een uitstekende keuze voor cinematografen die zoeken naar een zachte vintage signatuur zonder zware distortie of gekke flares. Ze voegen karakter toe, maar laten de huid spreken.",
    url: "https://tvlrental.nl/ironglasszeissjena/"
  },
  "Cooke Panchro FF": {
    text: "Karakteristieke full frame lenzenset met een klassieke Cooke-look. Subtiele glow en zachte roll-off, perfect voor een romantische of authentieke sfeer.",
    url: "https://tvlrental.nl/cookepanchro/"
  },
  "DZO Arles": {
    text: "Scherpe en cleane full-frame cine primes met zachte bokeh en moderne flarecontrole. Ideaal voor commercials en high-end narratieve projecten.",
    url: "https://tvlrental.nl/dzoarles/"
  },
  "DZO Vespid": {
    text: "Betaalbare maar serieuze cine-lenzen met consistente look, lichte vintage feel en goede optische prestaties. Full frame coverage.",
    url: "https://tvlrental.nl/dzovespid/"
  },
  "Lomo Standard Speed": {
    text: "Zachte vintage lenzen met unieke glow en flare. Niet voor elk project, maar heerlijk voor rauwe of experimentele looks.",
    url: "https://tvlrental.nl/lomostandardspeed/"
  }
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

// === Detail View Elements ===
const detailToggleBtn = document.getElementById("detailViewToggle");
const detailOverlay = document.getElementById("detailOverlay");
const leftDetail = document.getElementById("leftDetail");
const rightDetail = document.getElementById("rightDetail");
const leftDetailImg = leftDetail.querySelector("img");
const rightDetailImg = rightDetail.querySelector("img");

let isDragging = false;
let detailModeActive = false;

function updateLensInfo() {
  const left = leftSelect.value;
  const right = rightSelect.value;
  const leftDesc = lensDescriptions[left]?.text || "";
  const rightDesc = lensDescriptions[right]?.text || "";
  document.getElementById("lensInfo").innerHTML = `
    <p><strong>${left}:</strong> ${leftDesc}</p>
    <p><strong>${right}:</strong> ${rightDesc}</p>
  `;
}

function updateImages() {
  const leftLens = leftSelect.value.toLowerCase().replace(/\s+/g, "_");
  const rightLens = rightSelect.value.toLowerCase().replace(/\s+/g, "_");
  const tStop = tStopSelect.value.replace(".", "_");
  const focalLength = focalLengthSelect.value;

  const leftKey = `${leftLens}_${focalLength}_t${tStop}`;
  const rightKey = `${rightLens}_${focalLength}_t${tStop}`;

  afterImgTag.src = `images/${lensImageMap[leftKey] || leftKey + ".jpg"}`;
  beforeImgTag.src = `images/${lensImageMap[rightKey] || rightKey + ".jpg"}`;

  const tStopFormatted = `T${tStopSelect.value}`;
  const leftBaseKey = `${leftLens}_${focalLength}`;
  const rightBaseKey = `${rightLens}_${focalLength}`;
  leftLabel.textContent = `Lens: ${leftSelect.value} ${notes[leftBaseKey] || focalLength} ${tStopFormatted}`;
  rightLabel.textContent = `Lens: ${rightSelect.value} ${notes[rightBaseKey] || focalLength} ${tStopFormatted}`;
}

lenses.forEach(lens => {
  leftSelect.add(new Option(lens, lens));
  rightSelect.add(new Option(lens, lens));
});

[leftSelect, rightSelect, tStopSelect, focalLengthSelect].forEach(el => {
  el.addEventListener("change", () => {
    updateLensInfo();
    updateImages();
  });
});

document.getElementById("toggleButton").addEventListener("click", () => {
  const left = leftSelect.value;
  leftSelect.value = rightSelect.value;
  rightSelect.value = left;
  updateImages();
  updateLensInfo();
});

document.getElementById("fullscreenButton")?.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    comparisonWrapper.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// === SLIDER ===
slider.addEventListener("mousedown", () => isDragging = true);
window.addEventListener("mouseup", () => isDragging = false);
window.addEventListener("mousemove", e => isDragging && updateSlider(e.clientX));

slider.addEventListener("touchstart", e => { e.preventDefault(); isDragging = true; }, { passive: false });
window.addEventListener("touchend", () => isDragging = false);
window.addEventListener("touchmove", e => {
  if (isDragging && e.touches.length === 1) {
    e.preventDefault();
    updateSlider(e.touches[0].clientX);
  }
}, { passive: false });

function updateSlider(clientX) {
  const rect = comparisonWrapper.getBoundingClientRect();
  const offset = Math.max(0, Math.min(clientX - rect.left, rect.width));
  const percent = (offset / rect.width) * 100;
  afterWrapper.style.width = `${percent}%`;
  slider.style.left = `${percent}%`;
}

// === DETAIL VIEW ===
detailToggleBtn.addEventListener("click", () => {
  detailModeActive = !detailModeActive;
  detailOverlay.classList.toggle("active", detailModeActive);
  if (detailModeActive) {
    leftDetailImg.src = afterImgTag.src;
    rightDetailImg.src = beforeImgTag.src;
  }
});

comparisonWrapper.addEventListener("mousemove", (e) => {
  if (!detailModeActive) return;

  const rect = comparisonWrapper.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const boxSize = 200;
  const offset = 10;

  leftDetail.style.left = `${x - boxSize - offset}px`;
  rightDetail.style.left = `${x + offset}px`;
  leftDetail.style.top = rightDetail.style.top = `${y - boxSize / 2}px`;

  const scale = 2;
  const imgX = -((x) * scale - boxSize / 2);
  const imgY = -((y) * scale - boxSize / 2);

  leftDetailImg.style.transform = `scale(${scale}) translate(${imgX / scale}px, ${imgY / scale}px)`;
  rightDetailImg.style.transform = `scale(${scale}) translate(${imgX / scale}px, ${imgY / scale}px)`;
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && detailModeActive) {
    detailOverlay.classList.remove("active");
    detailModeActive = false;
  }
});

// === INIT ===
leftSelect.value = "IronGlass Red P";
rightSelect.value = "IronGlass Zeiss Jena";
tStopSelect.value = "2.8";
focalLengthSelect.value = "35mm";
updateLensInfo();
updateImages();
setTimeout(updateImages, 50);
