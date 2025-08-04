const lenses = {
  "Cooke Panchro FF": "images/cooke_panchro.jpg",
  "DZO Vespid": "images/dzo_vespid.jpg",
  "DZO Arles": "images/dzo_arles.jpg",
  "IronGlass Zeiss Jena": "images/zeiss_jena.jpg",
  "IronGlass Red P": "images/red_p.jpg",
  "IronGlass MKII": "images/mkii.jpg",
  "Blazar Remus": "images/remus.jpg",
  "Lomo Standard Speed": "images/lomo.jpg"
};

const lensLeft = document.getElementById("lensLeft");
const lensRight = document.getElementById("lensRight");
const tStop = document.getElementById("tStop");
const focalLength = document.getElementById("focalLength");
const imageLeft = document.getElementById("imageLeft");
const imageRight = document.getElementById("imageRight");
const slider = document.getElementById("slider");
const container = document.getElementById("compareContainer");
const infoBar = document.getElementById("infoBar");

for (let name in lenses) {
  lensLeft.add(new Option(name, lenses[name]));
  lensRight.add(new Option(name, lenses[name]));
}

lensLeft.selectedIndex = 0;
lensRight.selectedIndex = 1;
imageLeft.src = lensLeft.value;
imageRight.src = lensRight.value;

slider.style.left = "50%";
imageRight.style.clipPath = "inset(0 0 0 50%)";

const updateInfo = () => {
  const leftText = `${lensLeft.options[lensLeft.selectedIndex].text}`;
  const rightText = `${lensRight.options[lensRight.selectedIndex].text}`;
  const t = tStop.value;
  const f = focalLength.value;

  infoBar.innerText = `${leftText} @ ${f} - ${t}  |  ${rightText} @ ${f} - ${t}`;
};

lensLeft.onchange = () => {
  imageLeft.src = lensLeft.value;
  updateInfo();
};
lensRight.onchange = () => {
  imageRight.src = lensRight.value;
  updateInfo();
};
tStop.onchange = updateInfo;
focalLength.onchange = updateInfo;

let isDragging = false;

const updateSlider = (clientX) => {
  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const percent = Math.max(0, Math.min(1, x / rect.width));
  imageRight.style.clipPath = `inset(0 0 0 ${percent * 100}%)`;
  slider.style.left = `${percent * 100}%`;
};

slider.addEventListener("mousedown", () => isDragging = true);
document.addEventListener("mouseup", () => isDragging = false);
document.addEventListener("mousemove", (e) => {
  if (isDragging) updateSlider(e.clientX);
});

slider.addEventListener("touchstart", () => isDragging = true);
document.addEventListener("touchend", () => isDragging = false);
document.addEventListener("touchmove", (e) => {
  if (isDragging) updateSlider(e.touches[0].clientX);
});

updateInfo();