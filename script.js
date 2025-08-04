const lenses = {
  "Cooke Panchro Ff": "images/cooke_panchro.jpg",
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

container.addEventListener("mousemove", (e) => {
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percent = Math.max(0, Math.min(1, x / rect.width));
  imageRight.style.clipPath = `inset(0 0 0 ${percent * 100}%)`;
  slider.style.left = `${percent * 100}%`;
});

container.addEventListener("touchmove", (e) => {
  const rect = container.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const percent = Math.max(0, Math.min(1, x / rect.width));
  imageRight.style.clipPath = `inset(0 0 0 ${percent * 100}%)`;
  slider.style.left = `${percent * 100}%`;
});
