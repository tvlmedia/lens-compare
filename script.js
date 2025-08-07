
// ✅ FIXED TVL LENS TOOL: Witte gecentreerde grote tekst op pagina 1
// Alleen dit gewijzigd t.o.v. jouw versie: drawBottomBar() gesplitst + nieuwe drawBottomBarPage1()

function drawBottomBar(text = "", link = "") {
  const barHeight = 70;
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");

  // Beschrijvingstekst
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text(text, 20, pageHeight - barHeight + 25, { maxWidth: pageWidth - 120 });

  // Link
  if (link) {
    const displayText = "Klik hier voor alle info over deze lens";
    const x = 20;
    const y = pageHeight - barHeight + 55;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 102, 255);
    pdf.textWithLink(displayText, x, y, { url: link });
  }

  // Logo
  const targetHeight = 50;
  const ratio = logo.width / logo.height;
  const targetWidth = targetHeight * ratio;
  const xLogo = pageWidth - targetWidth - 12;
  const yLogo = pageHeight - targetHeight - 12;
  pdf.addImage(logo, "PNG", xLogo, yLogo, targetWidth, targetHeight);
}

function drawBottomBarPage1() {
  const barHeight = 80;
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");

  const displayText = "Benieuwd naar alle lenzen? Klik hier";
  const y = pageHeight - barHeight + 50;

  pdf.setFontSize(20); // veel groter
  pdf.setTextColor(255, 255, 255); // wit
  pdf.textWithLink(displayText, pageWidth / 2, y, {
    url: "https://tvlrental.nl/lenses/",
    align: "center"
  });

  // Logo
  const targetHeight = 50;
  const ratio = logo.width / logo.height;
  const targetWidth = targetHeight * ratio;
  const xLogo = pageWidth - targetWidth - 12;
  const yLogo = pageHeight - targetHeight - 12;
  pdf.addImage(logo, "PNG", xLogo, yLogo, targetWidth, targetHeight);
}
