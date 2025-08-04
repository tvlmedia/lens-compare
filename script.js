
const lenses = [
    "IronGlass Red P",
    "IronGlass Zeiss Jena",
    "DZO Vespid",
    "DZO Arles",
    "Cooke Panchro FF",
    "Lomo Standard Speed"
];

const notes = {
    "red_p_35mm": "Red P = 37mm (gematcht op 35mm)",
    "zeiss_jena_35mm": "Zeiss Jena = echte 35mm",
    "cooke_panchro_ff_25mm": "Cooke Panchro = 32mm gematcht op 25mm"
};

const leftSelect = document.getElementById("leftLens");
const rightSelect = document.getElementById("rightLens");
const tStopSelect = document.getElementById("tStop");
const focalLengthSelect = document.getElementById("focalLength");
const beforeImage = document.getElementById("beforeImage");
const afterImage = document.getElementById("afterImage");
const afterWrapper = document.getElementById("afterWrapper");
const slider = document.getElementById("slider");
const infoText = document.getElementById("infoText");
const comparisonWrapper = document.getElementById("comparisonWrapper");

lenses.forEach(lens => {
    const opt1 = new Option(lens, lens);
    const opt2 = new Option(lens, lens);
    leftSelect.add(opt1);
    rightSelect.add(opt2);
});

function updateImages() {
    const leftLens = leftSelect.value.toLowerCase().replace(/\s+/g, "_");
    const rightLens = rightSelect.value.toLowerCase().replace(/\s+/g, "_");
    const tStop = tStopSelect.value.replace(".", "_");
    const focalLength = focalLengthSelect.value;

    const imgLeft = `images/${leftLens}_${focalLength}_t${tStop}.jpg`;
    const imgRight = `images/${rightLens}_${focalLength}_t${tStop}.jpg`;

    beforeImage.style.backgroundImage = `url('${imgLeft}')`;
    afterImage.style.backgroundImage = `url('${imgRight}')`;

    const leftKey = `${leftLens}_${focalLength}`;
    const rightKey = `${rightLens}_${focalLength}`;
    const leftNote = notes[leftKey] ? ` (${notes[leftKey]})` : "";
    const rightNote = notes[rightKey] ? ` (${notes[rightKey]})` : "";

    infoText.textContent = `${leftSelect.value} @ ${focalLength} – T${tStop}${leftNote} | ${rightSelect.value} @ ${focalLength} – T${tStop}${rightNote}`;
}

[leftSelect, rightSelect, tStopSelect, focalLengthSelect].forEach(el => {
    el.addEventListener("change", updateImages);
});

let isDragging = false;

slider.addEventListener("mousedown", () => isDragging = true);
window.addEventListener("mouseup", () => isDragging = false);
window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const rect = comparisonWrapper.getBoundingClientRect();
    let offset = e.clientX - rect.left;
    offset = Math.max(0, Math.min(offset, rect.width));
    const percent = (offset / rect.width) * 100;
    afterWrapper.style.width = `${percent}%`;
    slider.style.left = `${percent}%`;
});

updateImages();
