/* ===== LENS COMPARISON TOOL – COMPACT, COMPLETE ===== */
if (window.innerWidth < 768) document.body.classList.add("mobile-mode");

/* === SENSOR DATA (mm) – Venice 6K 3:2 is baseline === */
const cameras = {
  "ARRI Alexa Mini LF": {
    "Open Gate": { w: 36.696, h: 25.542, label: "Open Gate" },
    "2.39:1": { w: 36.696, h: 15.312, label: "2.39:1" },
    "4.3K LF 16:9": { w: 35.640, h: 20.047, label: "4.3K LF 16:9" },
    "16:9": { w: 31.680, h: 17.820, label: "16:9" },
    "3.4K S35": { w: 28.248, h: 18.166, label: "3:2" },
    "3.2K S35 16:9": { w: 26.400, h: 14.850, label: "16:9" },
    "2.8K LF 1:1": { w: 23.760, h: 23.760, label: "1:1" },
    "2.8K S35 4:3": { w: 23.760, h: 17.820, label: "4:3" },
    "2.8K S35 16:9": { w: 23.760, h: 13.365, label: "16:9" }
  },
  "Arri Alexa Mini": {
    "Open Gate": { w: 28.248, h: 18.166, label: "Open Gate" },
    "3.2K": { w: 26.400, h: 14.850, label: "3.2K (16:9)" },
    "4K UHD": { w: 26.400, h: 14.850, label: "4K UHD (16:9)" },
    "4:3 2.8K": { w: 23.760, h: 17.820, label: "4:3 2.8K" },
    "HD": { w: 23.760, h: 13.365, label: "HD (16:9)" },
    "2K": { w: 23.661, h: 13.299, label: "2K (16:9)" },
    "2.39:1 2K Ana": { w: 42.240, h: 17.696, label: "2.39:1 2K Ana" },
    "HD Ana": { w: 31.680, h: 17.820, label: "HD Ana (16:9)" },
    "S16 HD": { w: 13.200, h: 7.425, label: "S16 HD (16:9)" }
  },
  "ARRI Alexa 35": {
    "4.6K 3:2 Open Gate": { w: 27.994, h: 19.221, label: "4.6K 3:2 Open Gate" },
    "4.6K 16:9": { w: 27.994, h: 15.746, label: "4.6K 16:9" },
    "4K 16:9": { w: 24.883, h: 13.997, label: "4K 16:9" },
    "4K 2:1": { w: 24.883, h: 12.442, label: "4K 2:1" },
    "3.3K 6:5": { w: 20.218, h: 16.949, label: "3.3K 6:5" },
    "3K 1:1": { w: 18.662, h: 18.662, label: "3K 1:1" },
    "2.7K 8:9": { w: 16.664, h: 18.747, label: "2.7K 8:9" },
    "2K 16:9 S16": { w: 12.442, h: 6.998, label: "2K 16:9 S16" }
  },
  "Sony Venice": {
    "6K 3:2": { w: 36.167, h: 24.111, label: "6K 3:2" },
    "6K 1.85:1": { w: 36.203, h: 19.567, label: "6K 1.85:1" },
    "6K 17:9": { w: 36.203, h: 19.088, label: "6K 17:9" },
    "6K 2.39:1": { w: 36.167, h: 15.153, label: "6K 2.39:1" },
    "5.7K 16:9": { w: 33.907, h: 19.076, label: "5.7K 16:9" },
    "4K 6:5": { w: 24.494, h: 20.523, label: "4K 6:5" },
    "4K 4:3": { w: 24.494, h: 18.084, label: "4K 4:3" },
    "4K 17:9": { w: 24.494, h: 12.917, label: "4K 17:9" },
    "4K 2.39:1": { w: 24.494, h: 10.262, label: "4K 2.39:1" },
    "3.8K 16:9": { w: 22.963, h: 12.917, label: "3.8K 16:9" }
  },
  "Sony FX6": { "4K DCI": { w: 35.616, h: 18.858, label: "4K DCI" } },
  "Sony FX9": {
    "4K 17:9 (6K FF Imager Mode)": { w: 35.688, h: 18.818, label: "4K 17:9 (6K FF Imager Mode)" },
    "4K 16:9 (5.6K FF Imager Mode)": { w: 33.454, h: 18.818, label: "4K 16:9 (5.6K FF Imager Mode)" },
    "Full-HD (6K FF Imager Mode)": { w: 33.454, h: 18.818, label: "Full-HD (6K FF Imager Mode)" },
    "4K 17:9 (5K Crop Mode)": { w: 29.748, h: 15.682, label: "4K 17:9 (5K Crop Mode)" },
    "4K 17:9 (S35 Imager Mode)": { w: 24.330, h: 12.830, label: "4K 17:9 (S35 Imager Mode)" },
    "3.8K 16:9 (S35 Imager mode)": { w: 22.810, h: 12.830, label: "3.8K 16:9 (S35 Imager Mode)" },
    "Full-HD (4K S35 Imager Mode)": { w: 22.810, h: 12.830, label: "Full-HD (4K S35 Imager Mode)" },
    "S16 2K": { w: 12.165, h: 6.415, label: "S16 2K" }
  },
  "DJI Ronin 4D 6K": {
    "6K FF 17:9": { w: 35.688, h: 18.818, label: "6K FF 17:9" },
    "6K FF 2.39:1": { w: 35.688, h: 14.921, label: "6K FF 2.39:1" },
    "4K S35 17:9": { w: 24.330, h: 12.830, label: "4K S35 17:9" },
    "4K S35 2.39:1": { w: 24.330, h: 10.169, label: "4K S35 2.39:1" }
  },
  "DJI Ronin 4D 8K": {
    "8K FF 17:9": { w: 36.045, h: 19.008, label: "8K FF 17:9" },
    "8K FF 2.39:1": { w: 36.045, h: 15.066, label: "8K FF 2.39:1" },
    "5.5K S35 17:9": { w: 24.499, h: 12.989, label: "5.5K S35 17:9" }
  },
  "RED Komodo-X": {
    "6K 17:9": { w: 27.034, h: 14.256, label: "6K 17:9" },
    "6K 2.4:1": { w: 27.034, h: 11.405, label: "6K 2.4:1" },
    "6K 16:9": { w: 25.344, h: 14.256, label: "6K 16:9" },
    "5K 17:9": { w: 22.528, h: 11.880, label: "5K 17:9" },
    "6K 3:2": { w: 21.384, h: 14.256, label: "6K 3:2" },
    "6K 4:3": { w: 19.008, h: 14.256, label: "6K 4:3" },
    "4K 17:9": { w: 18.022, h: 9.504, label: "4K 17:9" },
    "6K 6:5": { w: 17.107, h: 14.256, label: "6K 6:5" },
    "4K 16:9": { w: 16.896, h: 9.504, label: "4K 16:9" },
    "2K 17:9": { w: 9.011, h: 4.752, label: "2K 17:9" }
  },
  "RED Komodo 6K": {
    "6K 17:9": { w: 27.034, h: 14.256, label: "6K 17:9" },
    "6K 2.4:1": { w: 27.034, h: 11.405, label: "6K 2.4:1" },
    "6K 16:9": { w: 25.344, h: 14.256, label: "6K 16:9" },
    "5K 17:9": { w: 22.528, h: 11.880, label: "5K 17:9" },
    "6K 3:2": { w: 21.384, h: 14.256, label: "6K 3:2" },
    "6K 4:3": { w: 19.008, h: 14.256, label: "6K 4:3" },
    "4K 17:9": { w: 18.022, h: 9.504, label: "4K 17:9" },
    "6K 6:5": { w: 17.107, h: 14.256, label: "6K 6:5" },
    "4K 16:9": { w: 16.896, h: 9.504, label: "4K 16:9" },
    "2K 17:9": { w: 9.011, h: 4.752, label: "2K 17:9" }
  },
  "RED V-Raptor XL 8K VV": {
    "8K 17:9": { w: 40.960, h: 21.600, label: "8K 17:9" },
    "8K 2:1": { w: 40.960, h: 20.480, label: "8K 2:1" },
    "8K 2.4:1": { w: 40.960, h: 17.280, label: "8K 2.4:1" },
    "8K 16:9": { w: 38.400, h: 21.600, label: "8K 16:9" },
    "7K 17:9": { w: 35.840, h: 18.900, label: "7K 17:9" },
    "7K 2:1": { w: 35.840, h: 17.920, label: "7K 2:1" },
    "7K 2.4:1": { w: 35.840, h: 15.010, label: "7K 2.4:1" },
    "7K 16:9": { w: 33.600, h: 18.900, label: "7K 16:9" },
    "8K 3:2": { w: 32.400, h: 21.600, label: "8K 3:2" },
    "6K 17:9": { w: 30.720, h: 16.200, label: "6K 17:9" },
    "6K 2:1": { w: 30.720, h: 15.360, label: "6K 2:1" },
    "6K 2.4:1": { w: 30.720, h: 12.960, label: "6K 2.4:1" },
    "8K 4:3": { w: 28.800, h: 21.600, label: "8K 4:3" },
    "6K 16:9": { w: 28.800, h: 16.200, label: "6K 16:9" },
    "7K 3:2": { w: 28.350, h: 18.900, label: "7K 3:2" },
    "8K 6:5": { w: 25.920, h: 21.600, label: "8K 6:5" },
    "5K 17:9": { w: 25.600, h: 13.500, label: "5K 17:9" },
    "5K 2:1": { w: 25.600, h: 12.800, label: "5K 2:1" },
    "5K 2.4:1": { w: 25.600, h: 10.800, label: "5K 2.4:1" },
    "7K 4:3": { w: 25.200, h: 18.900, label: "7K 4:3" },
    "5K 16:9": { w: 24.000, h: 13.500, label: "5K 16:9" },
    "7K 6:5": { w: 22.680, h: 18.900, label: "7K 6:5" },
    "8K 1:1": { w: 21.600, h: 21.600, label: "8K 1:1" },
    "4K 17:9": { w: 20.480, h: 10.800, label: "4K 17:9" },
    "4K 2:1": { w: 20.480, h: 10.240, label: "4K 2:1" },
    "4K 2.4:1": { w: 20.480, h: 8.640, label: "4K 2.4:1" },
    "4K 16:9": { w: 19.200, h: 10.800, label: "4K 16:9" },
    "7K 1:1": { w: 18.900, h: 18.900, label: "7K 1:1" },
    "6K 1:1": { w: 16.200, h: 16.200, label: "6K 1:1" },
    "3K 17:9": { w: 15.360, h: 8.100, label: "3K 17:9" },
    "3K 2:1": { w: 15.360, h: 7.680, label: "3K 2:1" },
    "3K 2.4:1": { w: 15.360, h: 6.480, label: "3K 2.4:1" },
    "5K 1:1": { w: 13.500, h: 13.500, label: "5K 1:1" },
    "4K 1:1": { w: 10.800, h: 10.800, label: "4K 1:1" },
    "2K 17:9": { w: 10.240, h: 5.400, label: "2K 17:9" },
    "2K 2:1": { w: 10.240, h: 5.120, label: "2K 2:1" },
    "2K 2.4:1": { w: 10.240, h: 4.320, label: "2K 2.4:1" },
    "2K 16:9": { w: 9.600, h: 5.400, label: "2K 16:9" },
    "3K 16:9": { w: 9.400, h: 8.100, label: "3K 16:9" },
    "3K 1:1": { w: 8.100, h: 8.100, label: "3K 1:1" },
    "2K 1:1": { w: 5.400, h: 5.400, label: "2K 1:1" }
  },
  "RED V-Raptor 8K VV": {
    "8K 17:9": { w: 40.960, h: 21.600, label: "8K 17:9" },
    "8K 2:1": { w: 40.960, h: 20.480, label: "8K 2:1" },
    "8K 2.4:1": { w: 40.960, h: 17.280, label: "8K 2.4:1" },
    "8K 16:9": { w: 38.400, h: 21.600, label: "8K 16:9" },
    "7K 17:9": { w: 35.840, h: 18.900, label: "7K 17:9" },
    "7K 2:1": { w: 35.840, h: 17.920, label: "7K 2:1" },
    "7K 2.4:1": { w: 35.840, h: 15.010, label: "7K 2.4:1" },
    "7K 16:9": { w: 33.600, h: 18.900, label: "7K 16:9" },
    "8K 3:2": { w: 32.400, h: 21.600, label: "8K 3:2" },
    "6K 17:9": { w: 30.720, h: 16.200, label: "6K 17:9" },
    "6K 2:1": { w: 30.720, h: 15.360, label: "6K 2:1" },
    "6K 2.4:1": { w: 30.720, h: 12.960, label: "6K 2.4:1" },
    "8K 4:3": { w: 28.800, h: 21.600, label: "8K 4:3" },
    "6K 16:9": { w: 28.800, h: 16.200, label: "6K 16:9" },
    "7K 3:2": { w: 28.350, h: 18.900, label: "7K 3:2" },
    "8K 6:5": { w: 25.920, h: 21.600, label: "8K 6:5" },
    "5K 17:9": { w: 25.600, h: 13.500, label: "5K 17:9" },
    "5K 2:1": { w: 25.600, h: 12.800, label: "5K 2:1" },
    "5K 2.4:1": { w: 25.600, h: 10.800, label: "5K 2.4:1" },
    "7K 4:3": { w: 25.200, h: 18.900, label: "7K 4:3" },
    "5K 16:9": { w: 24.000, h: 13.500, label: "5K 16:9" },
    "7K 6:5": { w: 22.680, h: 18.900, label: "7K 6:5" },
    "8K 1:1": { w: 21.600, h: 21.600, label: "8K 1:1" },
    "4K 17:9": { w: 20.480, h: 10.800, label: "4K 17:9" },
    "4K 2:1": { w: 20.480, h: 10.240, label: "4K 2:1" },
    "4K 2.4:1": { w: 20.480, h: 8.640, label: "4K 2.4:1" },
    "4K 16:9": { w: 19.200, h: 10.800, label: "4K 16:9" },
    "7K 1:1": { w: 18.900, h: 18.900, label: "7K 1:1" },
    "6K 1:1": { w: 16.200, h: 16.200, label: "6K 1:1" },
    "3K 17:9": { w: 15.360, h: 8.100, label: "3K 17:9" },
    "3K 2:1": { w: 15.360, h: 7.680, label: "3K 2:1" },
    "3K 2.4:1": { w: 15.360, h: 6.480, label: "3K 2.4:1" },
    "5K 1:1": { w: 13.500, h: 13.500, label: "5K 1:1" },
    "4K 1:1": { w: 10.800, h: 10.800, label: "4K 1:1" },
    "2K 17:9": { w: 10.240, h: 5.400, label: "2K 17:9" },
    "2K 2:1": { w: 10.240, h: 5.120, label: "2K 2:1" },
    "2K 2.4:1": { w: 10.240, h: 4.320, label: "2K 2.4:1" },
    "2K 16:9": { w: 9.600, h: 5.400, label: "2K 16:9" },
    "3K 16:9": { w: 9.400, h: 8.100, label: "3K 16:9" },
    "3K 1:1": { w: 8.100, h: 8.100, label: "3K 1:1" },
    "2K 1:1": { w: 5.400, h: 5.400, label: "2K 1:1" }
  },
  "Blackmagic URSA Cine 12K LF": {
    "12K Open Gate": { w: 35.635, h: 23.316, label: "12K Open Gate" },
    "12K 16:9": { w: 35.635, h: 18.792, label: "12K 16:9" },
    "12K 17:9": { w: 35.635, h: 18.792, label: "12K 17:9" },
    "12K 2.4:1": { w: 35.635, h: 14.825, label: "12K 2.4:1" },
    "12K 6:5": { w: 27.979, h: 23.316, label: "12K 6:5" },
    "9K 3:2": { w: 27.283, h: 18.166, label: "9K 3:2" },
    "9K 17:9": { w: 27.005, h: 14.198, label: "9K 17:9" },
    "9K 2.4:1": { w: 27.005, h: 11.206, label: "9K 2.4:1" },
    "9K 16:9": { w: 25.195, h: 14.198, label: "9K 16:9" },
    "9K 6:5": { w: 22.272, h: 18.583, label: "9K 6:5" }
  }
};

/* === Lens lijsten, alias-focals, files en teksten === */
const lenses = ["IronGlass Red P","IronGlass MKII","IronGlass Zeiss Jena","DZO Vespid","DZO Arles","Cooke Panchro FF","Lomo Standard Speed"];

const notes = {
  "ironglass_red_p_35mm":"37mm","ironglass_red_p_50mm":"58mm","ironglass_mkii_35mm":"37mm","ironglass_zeiss_jena_50mm":"50mm","cooke_panchro_ff_35mm":"32mm","cooke_panchro_ff_50mm":"50mm",
  "dzo_vespid_80mm":"75mm","dzo_vespid_85mm":"75mm","dzo_arles_80mm":"75mm","dzo_arles_85mm":"75mm","lomo_standard_speed_80mm":"75mm","lomo_standard_speed_85mm":"75mm",
  "cooke_panchro_ff_80mm":"75mm","cooke_panchro_ff_85mm":"75mm","ironglass_zeiss_jena_80mm":"75mm","ironglass_zeiss_jena_85mm":"75mm","ironglass_red_p_80mm":"75mm",
  "ironglass_red_p_85mm":"75mm","ironglass_mkii_80mm":"75mm","ironglass_mkii_85mm":"75mm","ironglass_red_p_75mm":"85mm","ironglass_mkii_75mm":"85mm","ironglass_zeiss_jena_75mm":"80mm",
};

const lensImageMap = {
  "ironglass_red_p_35mm_t2_8":"red_p_37mm_t2_8.jpg",
  "ironglass_red_p_50mm_t2_8":"red_p_58mm_t2_8.jpg",
  "ironglass_red_p_75mm_t2_8":"red_p_85mm_t2_8.jpg",
  "ironglass_mkii_35mm_t2_8":"mkii_37mm_t2_8.jpg",
  "ironglass_mkii_50mm_t2_8":"mkii_50mm_t2_8.jpg",
  "ironglass_mkii_75mm_t2_8":"mkii_85mm_t2_8.jpg",
  "ironglass_zeiss_jena_75mm_t2_8":"jena_80mm_t2_8.jpg",
};

const lensDescriptions = {
  "IronGlass Red P": { text:"De IronGlass RED P set is een zeldzame vondst: bestaande uit de alleroudste series Sovjet-lenzen met single coating en maximale karakterweergave. Geen tweaks, geen trucjes – puur vintage glasoptiek.", url:"https://tvlrental.nl/ironglassredp/" },
  "IronGlass Zeiss Jena": { text:"De Zeiss Jena’s zijn een uitstekende keuze voor cinematografen die zoeken naar een zachte vintage signatuur zonder zware distortie of gekke flares. Ze voegen karakter toe, maar laten de huid spreken.", url:"https://tvlrental.nl/ironglasszeissjena/" },
  "IronGlass MKII": { text:"De IronGlass MKII Sovjet set is na de RED P de heftigste variant: zwaar getweakte oude Sovjet-lenzen met extreem karakter, flare en vervorming. Ideaal voor een rauwe, experimentele look.", url:"https://tvlrental.nl/ironglassmkii/" },
  "Cooke Panchro FF": { text:"Karakteristieke full frame lenzenset met een klassieke Cooke-look. Subtiele glow en zachte roll-off, perfect voor een romantische of authentieke sfeer.", url:"https://tvlrental.nl/cookepanchro/" },
  "DZO Arles": { text:"Scherpe en cleane full-frame cine primes met zachte bokeh en moderne flarecontrole. Ideaal voor commercials en high-end narratieve projecten.", url:"https://tvlrental.nl/dzoarles/" },
  "DZO Vespid": { text:"Betaalbare maar serieuze cine-lenzen met consistente look, lichte vintage feel en goede optische prestaties. Full frame coverage.", url:"https://tvlrental.nl/dzovespid/" },
  "Lomo Standard Speed": { text:"Zachte vintage lenzen met unieke glow en flare. Niet voor elk project, maar heerlijk voor rauwe of experimentele looks.", url:"https://tvlrental.nl/lomostandardspeed/" }
};

/* === DOM refs === */
const q = id => document.getElementById(id);
const cameraSelect=q("cameraSelect"), sensorFormatSelect=q("sensorFormatSelect"), comparisonWrapper=q("comparisonWrapper");
const leftSelect=q("leftLens"), rightSelect=q("rightLens"), tStopLeftSelect=q("tStopLeftSelect"), tStopRightSelect=q("tStopRightSelect");
const focalLengthSelect=q("focalLength"), beforeImgTag=q("beforeImgTag"), afterImgTag=q("afterImgTag"), afterWrapper=q("afterWrapper"), slider=q("slider");
const leftLabel=q("leftLabel"), rightLabel=q("rightLabel"), downloadLeftRawButton=q("downloadLeftRawButton"), downloadRightRawButton=q("downloadRightRawButton");
const flareToggle=q("flareToggle"), scaleSlider=q("scaleSlider"), scaleVal=q("scaleVal"), lensInfoDiv=q("lensInfo");
const fullscreenBtn=q("fullscreenButton"), sbsBtn=q("sbsToggle"), toggleBtn=q("toggleButton"), infoContainer=q("infoContainer");
const detailOverlay=q("detailOverlay"), leftDetail=q("leftDetail"), rightDetail=q("rightDetail"), detailToggleButton=q("detailViewToggle");
const IMG_BASE="https://tvlmedia.github.io/lens-compare/images/", RAW_BASE=IMG_BASE+"raw/";
const { jsPDF } = window.jspdf || {};
const BASE_SENSOR = cameras["Sony Venice"]["6K 3:2"];
let sbsActive=false, isExportingPdf=false, userScale=1;

/* === Helpers === */
const isWrapperFullscreen=()=> (document.fullscreenElement||document.webkitFullscreenElement)===comparisonWrapper;
const enterWrapperFullscreen=()=> comparisonWrapper.requestFullscreen?.()||comparisonWrapper.webkitRequestFullscreen?.();
const exitAnyFullscreen=()=> document.exitFullscreen?.()||document.webkitExitFullscreen?.();
function setWrapperSizeByAR(w,h){ if(isWrapperFullscreen())return; const width=comparisonWrapper.getBoundingClientRect().width, arWidth=sbsActive?(w*2):w, height=Math.round(width*(h/arWidth)); ["height","min-height","max-height"].forEach(p=>comparisonWrapper.style.setProperty(p,`${height}px`,"important")); comparisonWrapper.style.removeProperty("aspect-ratio"); }
function clearInlineHeights(){ ["height","min-height","max-height"].forEach(p=>comparisonWrapper.style.removeProperty(p)); }
function getCurrentWH(){ const cam=cameraSelect.value, fmt=sensorFormatSelect.value; return cam&&fmt?cameras[cam][fmt]:BASE_SENSOR; }
function getTargetAR(){ const {w,h}=getCurrentWH(); return sbsActive?(2*w)/h:w/h; }
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

/* === Camera/format selects === */
cameraSelect.innerHTML=""; Object.keys(cameras).forEach(cam=>cameraSelect.add(new Option(cam,cam)));
cameraSelect.addEventListener("change",()=>{ sensorFormatSelect.innerHTML=""; const cam=cameraSelect.value; if(!cam){ sensorFormatSelect.disabled=true; document.body.classList.remove("sensor-mode"); clearInlineHeights(); comparisonWrapper.style.setProperty("aspect-ratio","auto"); return; } Object.entries(cameras[cam]).forEach(([k,v])=>sensorFormatSelect.add(new Option(v.label||k,k))); sensorFormatSelect.disabled=false; sensorFormatSelect.dispatchEvent(new Event("change")); });
sensorFormatSelect.addEventListener("change",applyCurrentFormat);
function applyCurrentFormat(){ const {w,h}=getCurrentWH(); comparisonWrapper.style.removeProperty("--sensor-scale"); setWrapperSizeByAR(w,h); document.body.classList.add("sensor-mode"); const scale=Math.abs(BASE_SENSOR.w-w)<0.1?1:(BASE_SENSOR.w/w); comparisonWrapper.style.setProperty("--sensor-scale",scale.toFixed(4)); updateFullscreenBars(); resetSplitToMiddle(); }

/* === Lenses dropdowns + T-stops === */
lenses.forEach(l=>{ leftSelect.add(new Option(l,l)); rightSelect.add(new Option(l,l)); });
const DEFAULT_T_STOPS=["2.8","5.6"]; function fillTStops(sel,opts=DEFAULT_T_STOPS){ sel.innerHTML=""; opts.forEach(t=>sel.add(new Option(`T${t}`,t))); }
fillTStops(tStopLeftSelect); fillTStops(tStopRightSelect); tStopLeftSelect.value="2.8"; tStopRightSelect.value="2.8";
function syncTStopsOnContextChange(){ const t=tStopLeftSelect.value||"2.8"; tStopLeftSelect.value=t; tStopRightSelect.value=t; }

/* === Flare toggle === */
flareToggle.dataset.mode = flareToggle.dataset.mode || "noflare";
flareToggle.textContent  = flareToggle.dataset.mode==="flare"?"Flare: ON":"Flare: OFF";
flareToggle.addEventListener("click",()=>{ const cur=flareToggle.dataset.mode==="flare"?"noflare":"flare"; flareToggle.dataset.mode=cur; flareToggle.textContent=cur==="flare"?"Flare: ON":"Flare: OFF"; updateImages(); });

/* === Side-by-side wrapper === */
const sbsWrapper=document.createElement("div"); sbsWrapper.id="sbsWrapper"; sbsWrapper.innerHTML=`<div class="pane"><img id="sbsLeftImg" alt=""></div><div class="pane"><img id="sbsRightImg" alt=""></div>`; comparisonWrapper.appendChild(sbsWrapper); sbsWrapper.style.display="none";
const sbsLeftImg=sbsWrapper.querySelector("#sbsLeftImg"), sbsRightImg=sbsWrapper.querySelector("#sbsRightImg");

/* === RAW map + download === */
const rawFileMap={
  "ironglass_red_p_35mm_t2_8":"images/raw/RedP_37mm_T2.8_RAW.tif",
  "ironglass_zeiss_jena_35mm_t2_8":"images/raw/ZeissJena_35mm_T2.8_RAW.tif",
  "ironglass_red_p_50mm_t2_8":"images/raw/RedP_58mm_T2.8_RAW.tif",
  "ironglass_zeiss_jena_50mm_t2_8":"images/raw/ZeissJena_50mm_T2.8_RAW.tif",
  "cooke_panchro_ff_50mm_t2_8":"images/raw/CookeFF_50mm_T2.8_RAW.tif"
};
function setDownloadButton(btn,key){
  const file=rawFileMap[key]? (RAW_BASE+rawFileMap[key].split("/").pop()):null;
  if(file){ btn.disabled=false; btn.title="Download RAW"; btn.onclick=()=>{ const url=new URL(file,location.href); url.origin===location.origin?(()=>{const a=document.createElement("a"); a.href=url.href; a.download=url.pathname.split("/").pop(); document.body.appendChild(a); a.click(); a.remove();})():window.open(url.href,"_blank","noopener,noreferrer"); }; }
  else { btn.disabled=true; btn.title="RAW download (coming soon)"; btn.onclick=null; }
}

/* === Labels + lens info === */
function updateLensInfo(){ const L=leftSelect.value,R=rightSelect.value; lensInfoDiv.innerHTML=`<p><strong>${L}:</strong> ${lensDescriptions[L]?.text||""}</p><p><strong>${R}:</strong> ${lensDescriptions[R]?.text||""}</p>`; }

/* === Image resolver === */
function aliasFor(lens, nominal){ return notes[`${lens}_${nominal}`] || nominal; }
function resolveImagePath(lens, nominalFocal, tStr, flare){
  const alias=aliasFor(lens,nominalFocal), bases= alias!==nominalFocal ? [`${lens}_${alias}_t${tStr}`,`${lens}_${nominalFocal}_t${tStr}`] : [`${lens}_${nominalFocal}_t${tStr}`];
  const list=[]; bases.forEach(b=>{ if(lensImageMap[`${b}_${flare}`]) list.push(lensImageMap[`${b}_${flare}`]); if(lensImageMap[b]) list.push(lensImageMap[b]); list.push(`${b}_${flare}.jpg`,`${b}.jpg`); });
  return IMG_BASE+list[0];
}
function updateImages(){
  const LL=leftSelect.value.toLowerCase().replace(/\s+/g,"_"), RR=rightSelect.value.toLowerCase().replace(/\s+/g,"_");
  const tL=tStopLeftSelect.value.replace(".","_"), tR=tStopRightSelect.value.replace(".","_");
  const tLRaw=tStopLeftSelect.value, tRRaw=tStopRightSelect.value;
  const focal=focalLengthSelect.value, flare=flareToggle.dataset.mode||"noflare";
  const imgLeft = resolveImagePath(LL,focal,tL,flare);
  const imgRight= resolveImagePath(RR,focal,tR,flare);
  beforeImgTag.src = imgRight; afterImgTag.src = imgLeft;

  const lf=aliasFor(LL,focal), rf=aliasFor(RR,focal);
  const lu=lensDescriptions[leftSelect.value]?.url||"#", ru=lensDescriptions[rightSelect.value]?.url||"#";
  leftLabel.innerHTML = `Lens: <a href="${lu}" target="_blank" rel="noopener noreferrer">${leftSelect.value} ${lf} T${tLRaw}</a>`;
  rightLabel.innerHTML= `Lens: <a href="${ru}" target="_blank" rel="noopener noreferrer">${rightSelect.value} ${rf} T${tRRaw}</a>`;

  setDownloadButton(downloadLeftRawButton,  `${LL}_${lf}_t${tL}`);
  setDownloadButton(downloadRightRawButton, `${RR}_${rf}_t${tR}`);

  if(sbsActive){ sbsLeftImg.src=afterImgTag.src; sbsRightImg.src=beforeImgTag.src; }
  resetSplitToMiddle();
}

/* === Init defaults === */
leftSelect.value="IronGlass Red P"; rightSelect.value="IronGlass Zeiss Jena"; focalLengthSelect.value="35mm"; tStopLeftSelect.value="2.8"; tStopRightSelect.value="2.8";
updateLensInfo(); updateImages();
cameraSelect.value="Sony Venice"; cameraSelect.dispatchEvent(new Event("change"));

/* === Resizes + fullscreen === */
function onFsChange(){
  if(isWrapperFullscreen()){ clearInlineHeights(); pulseFsBars({duration:1400}); }
  else { const {w,h}=getCurrentWH(); comparisonWrapper.style.setProperty("aspect-ratio","auto"); setWrapperSizeByAR(w,h); requestAnimationFrame(()=>setWrapperSizeByAR(w,h));
    ["--lb-top","--lb-bottom","--lb-left","--lb-right"].forEach(v=>comparisonWrapper.style.setProperty(v,"0px"));
    slider.style.top="0px"; slider.style.height="100%"; slider.style.bottom="0";
  }
  updateFullscreenBars(); requestAnimationFrame(()=>{ updateFullscreenBars(); resetSplitToMiddle(); });
  requestAnimationFrame(()=>{ if(!isWrapperFullscreen()){ const {w,h}=getCurrentWH(); setWrapperSizeByAR(w,h); } });
}
document.addEventListener("fullscreenchange",onFsChange);
document.addEventListener("webkitfullscreenchange",onFsChange);
window.addEventListener("resize",()=>{ if(isWrapperFullscreen()){ updateFullscreenBars(); resetSplitToMiddle(); } else { const {w,h}=getCurrentWH(); setWrapperSizeByAR(w,h); } });
function toggleFullscreen(){ (async()=>{ if(isWrapperFullscreen()){ await exitAnyFullscreen(); const {w,h}=getCurrentWH(); comparisonWrapper.style.setProperty("aspect-ratio","auto"); setWrapperSizeByAR(w,h); requestAnimationFrame(()=>setWrapperSizeByAR(w,h)); ["--lb-top","--lb-bottom","--lb-left","--lb-right"].forEach(v=>comparisonWrapper.style.setProperty(v,"0px")); } else { clearInlineHeights(); await enterWrapperFullscreen(); pulseFsBars({duration:1400}); } updateFullscreenBars(); requestAnimationFrame(()=>{ updateFullscreenBars(); resetSplitToMiddle(); }); })(); }
fullscreenBtn?.addEventListener("click",toggleFullscreen);

/* === SxS toggle === */
function setSideBySide(on,{force=false}={}) {
  if(isExportingPdf && !force) return; const next=!!on; if(!force && sbsActive===next) return; sbsActive=next;
  document.body.classList.toggle("sbs-mode",sbsActive); comparisonWrapper.classList.toggle("sbs-mode",sbsActive);
  const beforeWrapper=beforeImgTag.parentElement;
  if(sbsActive){ sbsWrapper.style.display="flex"; beforeWrapper.style.display="none"; afterWrapper.style.display="none"; sbsLeftImg.src=afterImgTag.src; sbsRightImg.src=beforeImgTag.src; slider.style.display="none"; ["--lb-top","--lb-bottom","--lb-left","--lb-right"].forEach(v=>comparisonWrapper.style.setProperty(v,"0px")); if(isWrapperFullscreen()) clearInlineHeights();
  } else { sbsWrapper.style.display="none"; beforeWrapper.style.display=""; afterWrapper.style.display=""; slider.style.display=""; }
  const {w,h}=getCurrentWH(); setWrapperSizeByAR(w,h); requestAnimationFrame(()=>setWrapperSizeByAR(w,h));
  if(!sbsActive){ updateFullscreenBars(); resetSplitToMiddle(); }
}
sbsBtn?.addEventListener("click",()=>setSideBySide(!sbsActive));
toggleBtn?.addEventListener("click",()=>{ const l=leftSelect.value; leftSelect.value=rightSelect.value; rightSelect.value=l; const t=tStopLeftSelect.value; tStopLeftSelect.value=tStopRightSelect.value; tStopRightSelect.value=t; updateLensInfo(); updateImages(); });

/* === Slider drag (mouse/touch) === */
let isDragging=false;
slider.addEventListener("mousedown",()=>{ isDragging=true; document.body.classList.add("dragging"); });
window.addEventListener("mouseup",()=>{ isDragging=false; document.body.classList.remove("dragging"); });
window.addEventListener("mousemove",e=>{ if(isDragging) updateSliderPosition(e.clientX); });
slider.addEventListener("touchstart",e=>{ e.preventDefault(); isDragging=true; document.body.classList.add("dragging"); },{passive:false});
window.addEventListener("touchend",()=>{ isDragging=false; document.body.classList.remove("dragging"); });
window.addEventListener("touchmove",e=>{ if(isDragging && e.touches.length===1){ e.preventDefault(); updateSliderPosition(e.touches[0].clientX); } },{passive:false});

/* === On image load, recalc bars/slider === */
function whenImagesReadyThenReset(){
  const wait=im=> (im.complete && im.naturalWidth>0) ? Promise.resolve() : new Promise((res,rej)=>{ im.onload=res; im.onerror=rej; });
  Promise.all([wait(beforeImgTag),wait(afterImgTag)]).then(()=>{ updateFullscreenBars(); resetSplitToMiddle(); });
}
updateImages(); whenImagesReadyThenReset();
beforeImgTag.addEventListener("load",whenImagesReadyThenReset);
afterImgTag.addEventListener("load",whenImagesReadyThenReset);

/* === Scaling (UI) === */
function setUserScaleFromPct(pct){ userScale=clamp(pct/100,1.0,1.3); document.documentElement.style.setProperty("--viewer-scale",String(userScale)); if(scaleVal) scaleVal.textContent=Math.round(userScale*100)+"%"; updateFullscreenBars(); resetSplitToMiddle(); }
scaleSlider?.addEventListener("input",e=>setUserScaleFromPct(e.target.value));
setUserScaleFromPct(scaleSlider?.value||100);

/* === Keyboard shortcuts === */
function onGlobalKeydown(e){
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const tag=(document.activeElement?.tagName||"").toUpperCase(); if(["INPUT","TEXTAREA"].includes(tag)) return;
  if(isExportingPdf) return;
  const k=(e.key||"").toLowerCase();
  if(k==="p"){ e.preventDefault(); toggleFullscreen(); }
  if(k==="d"){ e.preventDefault(); detailToggleButton?.click(); }
  if(k==="s"){ e.preventDefault(); setSideBySide(!sbsActive); }
  if(k==="f"){ e.preventDefault(); flareToggle.click(); }
}
window.addEventListener("keydown",onGlobalKeydown,{capture:true});

/* === Update triggers === */
[lenses, [leftSelect,rightSelect]].flat().forEach(()=>{});
[leftSelect,rightSelect].forEach(el=>el.addEventListener("change",()=>{ syncTStopsOnContextChange(); updateLensInfo(); updateImages(); autoScaleNow(); }));
[focalLengthSelect,tStopLeftSelect,tStopRightSelect].forEach(el=>el.addEventListener("change",()=>{ if(el===focalLengthSelect) syncTStopsOnContextChange(); updateImages(); autoScaleNow(); }));

/* === Detail (zoom) viewer === */
let detailActive=false; const leftDetailImg=leftDetail?.querySelector("img"), rightDetailImg=rightDetail?.querySelector("img");
detailToggleButton?.addEventListener("click",()=>{ detailActive=!detailActive; detailOverlay.classList.toggle("active",detailActive); detailToggleButton.classList.toggle("active",detailActive); if(!detailActive){ leftDetail.style.display="none"; rightDetail.style.display="none"; } });
function updateZoomViewerAt(e,box,img,srcEl,{zoom=3.2,size=260}={}){
  const rect=srcEl.getBoundingClientRect?srcEl.getBoundingClientRect():srcEl, rx=(e.clientX-rect.left)/rect.width, ry=(e.clientY-rect.top)/rect.height;
  if(rx<0||rx>1||ry<0||ry>1){ box.style.display="none"; return false; }
  if(img.src!==srcEl.src) img.src=srcEl.src;
  const zw=rect.width*zoom, zh=rect.height*zoom, offX=-(rx*zw)+size/2, offY=-(ry*zh)+size/2;
  Object.assign(box.style,{left:`${e.clientX-size/2}px`,top:`${e.clientY-size/2}px`,width:`${size}px`,height:`${size}px`,display:"block"});
  Object.assign(img.style,{width:`${zw}px`,height:`${zh}px`,transform:`translate(${offX}px, ${offY}px)`});
  return true;
}
document.addEventListener("mousemove",e=>{
  if(!detailActive) return;
  if(sbsActive){
    const L=sbsLeftImg.getBoundingClientRect(), R=sbsRightImg.getBoundingClientRect();
    const inL=e.clientX>=L.left&&e.clientX<=L.right&&e.clientY>=L.top&&e.clientY<=L.bottom, inR=e.clientX>=R.left&&e.clientX<=R.right&&e.clientY>=R.top&&e.clientY<=R.bottom;
    if(!inL&&!inR){ leftDetail.style.display="none"; rightDetail.style.display="none"; return; }
    const rect=inL?L:R, rx=(e.clientX-rect.left)/rect.width, ry=(e.clientY-rect.top)/rect.height;
    const upd=(box,img,srcEl,r,rx,ry,z=3.2,s=260)=>{ if(img.src!==srcEl.src) img.src=srcEl.src; const zw=r.width*z, zh=r.height*z, ox=-(rx*zw)+s/2, oy=-(ry*zh)+s/2; Object.assign(box.style,{left:`${e.clientX-s/2}px`,top:`${e.clientY-s/2}px`,width:`${s}px`,height:`${s}px`,display:"block"}); Object.assign(img.style,{width:`${zw}px`,height:`${zh}px`,transform:`translate(${ox}px, ${oy}px)`}); };
    upd(leftDetail,leftDetailImg,sbsLeftImg,L,rx,ry); upd(rightDetail,rightDetailImg,sbsRightImg,R,rx,ry);
    return;
  }
  const showL=updateZoomViewerAt(e,leftDetail,leftDetailImg,afterImgTag), showR=updateZoomViewerAt(e,rightDetail,rightDetailImg,beforeImgTag);
  if(!showL && !showR){ leftDetail.style.display="none"; rightDetail.style.display="none"; }
});
comparisonWrapper.addEventListener("mouseleave",()=>{ leftDetail.style.display="none"; rightDetail.style.display="none"; });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&detailActive){ detailActive=false; detailOverlay.classList.remove("active"); detailToggleButton.classList.remove("active"); leftDetail.style.display="none"; rightDetail.style.display="none"; } });

/* === Letter/pillarbox berekening + slider === */
function updateFullscreenBars(){
  if(sbsActive){ ["--lb-top","--lb-bottom","--lb-left","--lb-right"].forEach(v=>comparisonWrapper.style.setProperty(v,"0px")); comparisonWrapper._lbLeft=comparisonWrapper._lbRight=comparisonWrapper._lbTop=comparisonWrapper._lbBottom=0; comparisonWrapper._usableW=comparisonWrapper.getBoundingClientRect().width; return; }
  const rect=comparisonWrapper.getBoundingClientRect(), hostW=Math.max(1,Math.round(rect.width)), hostH=Math.max(1,Math.round(rect.height)), targetAR=getTargetAR(), hostAR=hostW/hostH;
  let usedW,usedH, lbL=0,lbR=0,lbT=0,lbB=0;
  if(hostAR>targetAR){ usedH=hostH; usedW=Math.round(usedH*targetAR); const side=Math.floor((hostW-usedW)/2); lbL=lbR=side; }
  else { usedW=hostW; usedH=Math.round(usedW/targetAR); const bar=Math.floor((hostH-usedH)/2); lbT=lbB=bar; }
  [["--lb-top",lbT],["--lb-bottom",lbB],["--lb-left",lbL],["--lb-right",lbR]].forEach(([k,v])=>comparisonWrapper.style.setProperty(k,`${v}px`));
  Object.assign(comparisonWrapper,{ _lbLeft:lbL,_lbRight:lbR,_lbTop:lbT,_lbBottom:lbB,_usableW:usedW });
}
function resetSplitToMiddle(){
  if(sbsActive) return;
  const rect=comparisonWrapper.getBoundingClientRect(), lbL=comparisonWrapper._lbLeft||0, lbR=comparisonWrapper._lbRight||0, usable=Math.max(1,Math.round(rect.width-lbL-lbR));
  const mid=Math.round(usable/2), inset=`inset(0 ${lbR+(usable-mid)}px 0 ${lbL}px)`;
  afterWrapper.style.clipPath=inset; afterWrapper.style.webkitClipPath=inset;
  slider.style.left=(lbL+mid)+"px";
  const lbT=comparisonWrapper._lbTop||0, lbB=comparisonWrapper._lbBottom||0, usableH=Math.max(1,Math.round(rect.height-lbT-lbB));
  slider.style.top=lbT+"px"; slider.style.height=usableH+"px"; slider.style.bottom="auto";
}
function updateSliderPosition(clientX){
  const rect=comparisonWrapper.getBoundingClientRect(), lbL=comparisonWrapper._lbLeft||0, lbR=comparisonWrapper._lbRight||0, usable=Math.max(1,Math.round(rect.width-lbL-lbR));
  const clamped=clamp(Math.round(clientX-rect.left-lbL),0,usable), leftInset=lbL, rightInset=lbR+(usable-clamped);
  const inset=`inset(0 ${Math.max(0,rightInset-1)}px 0 ${leftInset}px)`; afterWrapper.style.clipPath=inset; afterWrapper.style.webkitClipPath=inset;
  slider.style.left=(lbL+clamped)+"px";
  const lbT=comparisonWrapper._lbTop||0, lbB=comparisonWrapper._lbBottom||0, usableH=Math.max(1,Math.round(rect.height-lbT-lbB));
  slider.style.top=lbT+"px"; slider.style.height=usableH+"px"; slider.style.bottom="auto";
}
function pulseFsBars({duration=1400}={}){ const start=performance.now(); (function tick(now){ if(!isWrapperFullscreen()) return; updateFullscreenBars(); resetSplitToMiddle(); if(now-start<duration) requestAnimationFrame(tick); })(start); }
function getCurrentSplitFraction(){ const rect=comparisonWrapper.getBoundingClientRect(), lbL=comparisonWrapper._lbLeft||0, lbR=comparisonWrapper._lbRight||0, usable=Math.max(1,Math.round(rect.width-lbL-lbR)); const s=slider.getBoundingClientRect(); const x=(s.left+s.width/2)-rect.left-lbL; return clamp(x/usable,0,1); }

/* === Autoscale per lens/focal (100–130%) === */
const LENS_SCALE_TABLE={
  "35mm":{ panchro:100,"red p":116,mkii:117,jena:112,vespid:109,arles:110,"lomo standard speed":110 },
  "75mm":{ panchro:100,"red p":118,mkii:117,jena:110,vespid:100,arles:100,"lomo standard speed":100 },
};
function normalizeLensKey(lbl=""){ const s=lbl.toLowerCase(); if(s.includes("panchro"))return"panchro"; if(s.includes("red p"))return"red p"; if(s.includes("mk ii")||s.includes("mkii")||s.includes("mk2"))return"mkii"; if(s.includes("jena"))return"jena"; if(s.includes("vespid"))return"vespid"; if(s.includes("arles"))return"arles"; if(s.includes("lomo")&&s.includes("standard"))return"lomo standard speed"; return""; }
function isScaleAllowedBySensor(){ const {w,h}=getCurrentWH(), EPS=0.001; return (w>30.720+EPS)&&(h>16.200+EPS); }
function scaleForLens(lbl, focal){ const k=normalizeLensKey(lbl), fk=String(focal).includes("75")?"75mm":"35mm"; return (LENS_SCALE_TABLE[fk]||{})[k]||100; }
function applyScalePercent(p){ const v=clamp(Math.round(p),100,130); if(scaleSlider) scaleSlider.value=String(v); setUserScaleFromPct(v); }
function autoScaleNow(){ if(!isScaleAllowedBySensor()) return applyScalePercent(100); const l=leftSelect?.value||"", r=rightSelect?.value||"", f=focalLengthSelect?.value||"35mm"; applyScalePercent(Math.max(scaleForLens(l,f),scaleForLens(r,f))); }
["change","input"].forEach(evt=>{ leftSelect?.addEventListener(evt,autoScaleNow); rightSelect?.addEventListener(evt,autoScaleNow); focalLengthSelect?.addEventListener(evt,autoScaleNow); sensorFormatSelect?.addEventListener(evt,autoScaleNow); cameraSelect?.addEventListener(evt,autoScaleNow); });
autoScaleNow();

/* === Link targets noopener/noreferrer safeguard === */
(function enforceBlankTargets(){
  const setBlank=a=>{ if(!a.target) a.target="_blank"; const rel=(a.getAttribute("rel")||"").split(/\s+/); if(!rel.includes("noopener")) rel.push("noopener"); if(!rel.includes("noreferrer")) rel.push("noreferrer"); a.setAttribute("rel",rel.join(" ").trim()); };
  document.querySelectorAll("a[href]").forEach(setBlank);
  new MutationObserver(muts=>muts.forEach(m=>m.addedNodes.forEach(n=>{ if(n.nodeType!==1) return; if(n.matches?.("a[href]")) setBlank(n); n.querySelectorAll?.("a[href]").forEach(setBlank); }))).observe(document.documentElement,{childList:true,subtree:true});
})();

/* === PDF export (4 pagina’s) === */
function loadHTMLImage(src){ return new Promise((res,rej)=>{ const im=new Image(); im.crossOrigin="anonymous"; im.onload=()=>res(im); im.onerror=rej; im.src=src; }); }
async function renderToSensorAR(imgOrURL, targetAR, outH, scale=1){
  const img=typeof imgOrURL==="string"?await loadHTMLImage(imgOrURL):imgOrURL, H=outH, W=Math.round(H*targetAR);
  const cvs=document.createElement("canvas"); cvs.width=W; cvs.height=H; const ctx=cvs.getContext("2d",{alpha:false}); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality="high";
  const srcAR=(img.naturalWidth||img.width)/(img.naturalHeight||img.height); let dW,dH,ox,oy;
  if(srcAR<targetAR){ dW=W; dH=W/srcAR; ox=0; oy=(H-dH)/2; } else { dH=H; dW=H*srcAR; oy=0; ox=(W-dW)/2; }
  if(scale!==1){ const oW=dW,oH=dH; dW=oW*scale; dH=oH*scale; ox-=(dW-oW)/2; oy-=(dH-oH)/2; }
  ctx.drawImage(img,Math.round(ox),Math.round(oy),Math.round(dW),Math.round(dH));
  return { dataURL:cvs.toDataURL("image/jpeg",1.0), W, H };
}
function fitContain(sw,sh,bw,bh){ const sAR=sw/sh, bAR=bw/bh; let w,h; if(sAR>bAR){ w=bw; h=Math.round(w/sAR); } else { h=bh; w=Math.round(h*sAR); } return { w,h,x:Math.round((bw-w)/2), y:Math.round((bh-h)/2) }; }
async function placeContain(pdf, dataURL, box){ const im=await loadHTMLImage(dataURL); const f=fitContain(im.naturalWidth||im.width,im.naturalHeight||im.height,box.w,box.h); pdf.addImage(dataURL,"JPEG",box.x+f.x,box.y+f.y,f.w,f.h); }
const ensureAbsoluteUrl=url=>!url?"":(/^https?:\/\//i.test(url)?url:new URL(url,"https://tvlrental.nl/").href);
const pdfLinkRect=(pdf,x,y,w,h,url)=>{ const abs=ensureAbsoluteUrl(url); if(abs) pdf.link(x,y,w,h,{url:abs}); };
function getSensorText(){ const cam=cameraSelect.value, fmt=sensorFormatSelect.value, label=cameras[cam]?.[fmt]?.label||""; return `${cam} – ${label}`; }
function getCurrentSplitFraction(){ const rect=comparisonWrapper.getBoundingClientRect(), lbL=comparisonWrapper._lbLeft||0, lbR=comparisonWrapper._lbRight||0, usable=Math.max(1,Math.round(rect.width-lbL-lbR)); const s=slider.getBoundingClientRect(); const x=(s.left+s.width/2)-rect.left-lbL; return clamp(x/usable,0,1); }
async function buildSplitFromSensor(leftURL,rightURL,W,H){
  const L=await loadHTMLImage(leftURL), R=await loadHTMLImage(rightURL);
  const cvs=document.createElement("canvas"); cvs.width=W; cvs.height=H; const ctx=cvs.getContext("2d",{alpha:false}); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality="high";
  const frac=getCurrentSplitFraction(), splitX=Math.round(W*frac);
  if(splitX>0) ctx.drawImage(L,0,0,splitX,H,0,0,splitX,H);
  if(splitX<W) ctx.drawImage(R,splitX,0,W-splitX,H,splitX,0,W-splitX,H);
  ctx.fillStyle="#FFF"; ctx.fillRect(Math.max(0,splitX-1),0,2,H);
  return cvs.toDataURL("image/jpeg",1.0);
}
function drawBars(pdf,TOP_BAR,BOTTOM_BAR,PAGE_MARGIN){
  return {
    top:(text)=>{ const pw=pdf.internal.pageSize.getWidth(); pdf.setFillColor(0,0,0); pdf.rect(0,0,pw,TOP_BAR,"F"); pdf.setTextColor(255,255,255); pdf.setFontSize(16); pdf.text(text,pw/2,Math.round(TOP_BAR/2)+2,{align:"center",baseline:"middle"}); },
    bottom:({ text="", link="", logo=null, ctaLabel="", ctaUrl="" })=>{
      const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight(), bh=BOTTOM_BAR;
      pdf.setFillColor(0,0,0); pdf.rect(0,ph-bh,pw,bh,"F");
      if(text){ pdf.setFontSize(12); pdf.setTextColor(255,255,255); pdf.text(text,20,ph-bh+25,{maxWidth:pw-120}); }
      if(link){ const disp="Klik hier voor alle info over deze lens"; pdf.setFontSize(10); pdf.setTextColor(0,102,255); const w=pdf.getTextWidth(disp); pdf.textWithLink(disp,20,ph-bh+55,{url:ensureAbsoluteUrl(link)}); }
      if(logo){ const th=50, ratio=logo.width/logo.height, tw=th*ratio, x=pw-tw-12, y=ph-th-12; pdf.addImage(logo,"PNG",x,y,tw,th); }
      if(ctaLabel&&ctaUrl){ const btnW=Math.min(320,pw-2*PAGE_MARGIN), btnH=32, x=Math.round((pw-btnW)/2), y=Math.round(ph-(bh/2)-(btnH/2)); pdf.setFillColor(0,0,0); pdf.roundedRect(x,y,btnW,btnH,4,4,"F"); pdf.setTextColor(255,255,255); pdf.setFontSize(18); pdf.setFont("helvetica","normal"); pdf.text(ctaLabel,x+btnW/2,y+btnH/2+6,{align:"center",baseline:"middle"}); pdfLinkRect(pdf,x,y,btnW,btnH,ctaUrl); }
    },
    bottomP1:(logo,sensorText)=>{
      const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight(), bh=BOTTOM_BAR;
      pdf.setFillColor(0,0,0); pdf.rect(0,ph-bh,pw,bh,"F");
      pdf.setTextColor(255,255,255); pdf.setFontSize(14); const yS=ph-bh+48; pdf.text(`Camera/Sensor mode: ${sensorText}`,pw/2,yS,{align:"center",baseline:"middle"});
      const cta="Benieuwd naar alle lenzen? Klik hier"; pdf.setFontSize(16); const yC=ph-18; pdf.text(cta,pw/2,yC,{align:"center",baseline:"middle"}); const w=pdf.getTextWidth(cta), x=(pw-w)/2; pdfLinkRect(pdf,x,yC-10,w,20,"https://tvlrental.nl/lenses/");
      if(logo){ const th=50, ratio=logo.width/logo.height, tw=th*ratio, xL=pw-tw-12, y=ph-th-12; pdf.addImage(logo,"PNG",xL,y,tw,th); }
    }
  };
}
q("downloadPdfButton")?.addEventListener("click",async()=>{
  const wasSBS=sbsActive; isExportingPdf=true; if(sbsBtn) sbsBtn.disabled=true;
  try{
    if(wasSBS){ setSideBySide(false,{force:true}); await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>requestAnimationFrame(r)); updateFullscreenBars(); resetSplitToMiddle(); }
    updateFullscreenBars();
    const pdf=new jsPDF({orientation:"landscape",unit:"px",format:"a4"}), TOP_BAR=40, BOTTOM_BAR=80, PAGE_MARGIN=24;
    const bars=drawBars(pdf,TOP_BAR,BOTTOM_BAR,PAGE_MARGIN), pageW=pdf.internal.pageSize.getWidth(), pageH=pdf.internal.pageSize.getHeight();
    const contentBox={x:0,y:TOP_BAR,w:pageW,h:pageH-TOP_BAR-BOTTOM_BAR};
    const targetAR=getTargetAR(), exportH=Math.round((pageH-TOP_BAR-BOTTOM_BAR)*8);
    const {w:sW}=getCurrentWH(), zoom=Math.max(1,BASE_SENSOR.w/sW);
    const leftText=leftLabel.textContent, rightText=rightLabel.textContent, leftName=leftSelect.value, rightName=rightSelect.value, focal=focalLengthSelect.value;
    const tLeft=String(tStopLeftSelect.value).replace(/\./g,"_"), tRight=String(tStopRightSelect.value).replace(/\./g,"_");
    const logo=await loadHTMLImage("https://tvlmedia.github.io/lens-compare/LOGOVOORPDF.png"), sensorText=getSensorText();
    const li=await loadHTMLImage(afterImgTag.src), ri=await loadHTMLImage(beforeImgTag.src);
    const leftSensor=await renderToSensorAR(li,targetAR,exportH,zoom*userScale), rightSensor=await renderToSensorAR(ri,targetAR,exportH,zoom*userScale);
    const splitData=await buildSplitFromSensor(leftSensor.dataURL,rightSensor.dataURL,leftSensor.W,leftSensor.H);

    // p1 split
    pdf.setFillColor(0,0,0); pdf.rect(0,0,pageW,pageH,"F"); bars.top(`${leftText} vs ${rightText}`); await placeContain(pdf,splitData,contentBox); bars.bottomP1(logo,sensorText);
    // p2 left
    pdf.addPage(); pdf.setFillColor(0,0,0); pdf.rect(0,0,pageW,pageH,"F"); bars.top(`${leftText} – ${sensorText}`); await placeContain(pdf,leftSensor.dataURL,contentBox);
    bars.bottom({ text:lensDescriptions[leftName]?.text||"", link:lensDescriptions[leftName]?.url||"", logo });
    // p3 right
    pdf.addPage(); pdf.setFillColor(0,0,0); pdf.rect(0,0,pageW,pageH,"F"); bars.top(`${rightText} – ${sensorText}`); await placeContain(pdf,rightSensor.dataURL,contentBox);
    bars.bottom({ text:lensDescriptions[rightName]?.text||"", link:lensDescriptions[rightName]?.url||"", logo });
    // p4 UI + split
    pdf.addPage(); pdf.setFillColor(0,0,0); pdf.rect(0,0,pageW,pageH,"F"); bars.top(`${leftText} vs ${rightText}`);
    const x=PAGE_MARGIN, maxW=pageW-PAGE_MARGIN*2, controlsEl=document.querySelector('#toolRoot .controls')||document.querySelector('.controls');
    const screenshotEl=async el=>{ if(!el) return null; const cvs=await html2canvas(el,{useCORS:true,backgroundColor:null,scale:window.devicePixelRatio||1}); return cvs.toDataURL("image/png"); };
    document.body.classList.add("pdf-compact"); const controlsShot=await screenshotEl(controlsEl), infoShot=await screenshotEl(infoContainer); document.body.classList.remove("pdf-compact");
    let curY=TOP_BAR+PAGE_MARGIN;
    const placeToWidth=async(dataURL, X, Y, maxW)=>{ const im=await loadHTMLImage(dataURL); const nW=im.naturalWidth||im.width, nH=im.naturalHeight||im.height, ratio=nH/nW, w=Math.min(maxW,nW), h=Math.round(w*ratio); pdf.addImage(dataURL,"PNG",X,Y,w,h); return {w,h}; };
    if(controlsShot){ const w=Math.round(maxW*0.7), cx=x+Math.round((maxW-w)/2); const placed=await placeToWidth(controlsShot,cx,curY,w); curY+=placed.h+8; }
    const fullBoxP4={x, y:curY, w:maxW, h:(pageH-BOTTOM_BAR-PAGE_MARGIN)-curY-(infoShot?12:0) }; await placeContain(pdf,splitData,fullBoxP4);
    if(infoShot){ const infoY=fullBoxP4.y+fullBoxP4.h+12; await placeToWidth(infoShot,x,infoY,maxW); }
    bars.bottom({ text:"", link:"", logo, ctaLabel:"Open de interactieve Lens Comparison Tool", ctaUrl:"https://tvlrental.nl/lens-comparison/" });

    const makeSafe=s=>String(s||"").replace(/[^\w]+/g,"");
    const cam=cameraSelect.value||"UnknownCamera", sensorLabel=(cameras[cam]?.[sensorFormatSelect.value]?.label)||sensorFormatSelect.value||"UnknownSensorMode";
    const filename=`TVLRENTAL_${makeSafe(leftName)}_${makeSafe(rightName)}_${makeSafe(focal)}_T${tLeft}vsT${tRight}_${makeSafe(cam)}_${makeSafe(sensorLabel)}.pdf`;
    pdf.save(filename);
  } finally {
    if(wasSBS) setSideBySide(true,{force:true});
    updateFullscreenBars(); resetSplitToMiddle(); if(sbsBtn) sbsBtn.disabled=false; isExportingPdf=false;
  }
});

/* === Self-check (stil, alleen console) === */
(function(){
  const missing=lenses.filter(l=>!lensDescriptions[l]); if(missing.length) console.warn("Lens zonder beschrijving:",missing);
  for(const [cam,formats] of Object.entries(cameras)){ if(!formats||!Object.keys(formats).length) console.warn("Camera zonder formats:",cam);
    for(const [k,v] of Object.entries(formats)){ if(!v?.w||!v?.h) console.warn(`Format zonder w/h bij ${cam} → ${k}`,v); if(!v?.label) console.warn(`Format zonder label bij ${cam} → ${k}`); }
  }
})();

/* === Kick first layout === */
onFsChange();
setTimeout(updateImages,50);
