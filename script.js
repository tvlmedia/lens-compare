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
const imageLeft = document.getElementById("imageLeft");
const imageRight = document.getElementById("imageRight");
const slider = document.getElementById("slider");
const container = document.getElementById("compareContainer");

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

lensLeft.onchange = () => imageLeft.src = lensLeft.value;
lensRight.onchange = () => imageRight.src = lensRight.value;

let isDragging = false;

const updateSlider = (clientX) => {
  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const percent = Math.max(0, Math.min(1, x / rect.width));
  imageRight.style.clipPath = `inset(0 0 0 ${percent * 100}%)`;
  slider.style.left = `${percent * 100}%`;
};

container.addEventListener("mousedown", () => isDragging = true);
container.addEventListener("mouseup", () => isDragging = false);
container.addEventListener("mouseleave", () => isDragging = false);
container.addEventListener("mousemove", (e) => {
  if (isDragging) updateSlider(e.clientX);
});

container.addEventListener("touchstart", () => isDragging = true);
container.addEventListener("touchend", () => isDragging = false);
container.addEventListener("touchcancel", () => isDragging = false);
container.addEventListener("touchmove", (e) => {
  if (isDragging) updateSlider(e.touches[0].clientX);
});