
// ... (je bestaande script komt hier - zie eerdere versie hierboven)

document.getElementById("fullscreenButton").addEventListener("click", () => {
  const wrapper = document.getElementById("comparisonWrapper");
  if (!document.fullscreenElement) {
    wrapper.requestFullscreen().catch(err => console.error(err));
  } else {
    document.exitFullscreen();
  }
});
