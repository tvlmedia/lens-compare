
/* ========== Algemene reset ========== */
* {
  -webkit-user-drag: none;
  user-select: none;
}

body {
  margin: 0;
  background: #0f0f0f;
  color: white;
  font-family: "Inter", "Helvetica Neue", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  line-height: 1.6;
}

/* ========== Controls bovenaan ========== */
.controls {
  margin: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

select, #toggleButton, #fullscreenButton, #downloadPdfButton, #detailViewToggle {
  padding: 6px 12px;
  background: #1a1a1a;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

select:hover,
#toggleButton:hover,
#fullscreenButton:hover,
#downloadPdfButton:hover,
#detailViewToggle:hover {
  background: #666;
  border-color: #666;
}

/* ========== Wrapper en sliderstructuur ========== */
#comparisonWrapper {
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  position: relative;
  background: black;
  overflow: hidden;
  margin: 0 auto;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.5);
}

#beforeImage, #afterImage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

#beforeImage img,
#afterImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  position: absolute;
  inset: 0;
  transition: opacity 0.3s ease-in-out;
}

#afterWrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
  pointer-events: none;
}

#slider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  background: white;
  cursor: ew-resize;
  z-index: 10;
  touch-action: none;
}

#slider:hover {
  background: #fff;
  box-shadow: 0 0 8px #fff;
}

/* ========== Detail View Overlay (Zoom) ========== */
#detailOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  display: none;
}

#detailOverlay.active {
  display: block;
}

.detail-view-square {
  position: absolute;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border: 2px solid white;
  background: black;
  pointer-events: none;
  z-index: 15;
}

.detail-view-square img {
  position: absolute;
  width: 300%;
  height: auto;
  object-fit: cover;
  transform-origin: top left;
  will-change: transform;
  pointer-events: none;
}
