
const comparisonWrapper = document.getElementById("comparisonWrapper");
const detailToggle = document.getElementById("detailViewToggle");
const detailOverlay = document.getElementById("detailOverlay");
const leftDetail = document.getElementById("leftDetail");
const rightDetail = document.getElementById("rightDetail");
const leftDetailImg = leftDetail.querySelector("img");
const rightDetailImg = rightDetail.querySelector("img");
const afterImgTag = document.getElementById("afterImgTag");
const beforeImgTag = document.getElementById("beforeImgTag");

let detailViewActive = false;

detailToggle.addEventListener("click", () => {
  detailViewActive = !detailViewActive;
  detailOverlay.classList.toggle("active", detailViewActive);
  if (detailViewActive) {
    leftDetailImg.src = afterImgTag.src;
    rightDetailImg.src = beforeImgTag.src;
  }
});

comparisonWrapper.addEventListener("mousemove", (e) => {
  if (!detailViewActive) return;

  const rect = comparisonWrapper.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const boxSize = 200;
  const offset = 10;

  const leftX = Math.max(0, Math.min(x - boxSize - offset, rect.width - boxSize));
  const rightX = Math.max(0, Math.min(x + offset, rect.width - boxSize));
  const topY = Math.max(0, Math.min(y - boxSize / 2, rect.height - boxSize));

  leftDetail.style.left = `${leftX}px`;
  leftDetail.style.top = `${topY}px`;

  rightDetail.style.left = `${rightX}px`;
  rightDetail.style.top = `${topY}px`;

  const scale = 3;
  const imgX = -((x) * scale - boxSize / 2);
  const imgY = -((y) * scale - boxSize / 2);

  leftDetailImg.style.transform = `scale(${scale}) translate(${imgX / scale}px, ${imgY / scale}px)`;
  rightDetailImg.style.transform = `scale(${scale}) translate(${imgX / scale}px, ${imgY / scale}px)`;
});
