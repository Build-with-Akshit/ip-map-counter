/**
 * Country code → full name mapping (ISO 3166-1 alpha-2).
 * Covers 100+ countries most likely to appear in analytics.
 */
export const COUNTRY_NAMES = {
  US: "United States",
  CN: "China",
  IN: "India",
  HK: "Hong Kong",
  SG: "Singapore",
  JP: "Japan",
  TW: "Taiwan",
  BR: "Brazil",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  CA: "Canada",
  AU: "Australia",
  KR: "South Korea",
  RU: "Russia",
  NL: "Netherlands",
  ID: "Indonesia",
  TR: "Turkey",
  PK: "Pakistan",
  VN: "Vietnam",
  BY: "Belarus",
  BD: "Bangladesh",
  DO: "Dominican Republic",
  IT: "Italy",
  ES: "Spain",
  MX: "Mexico",
  PH: "Philippines",
  CO: "Colombia",
  PL: "Poland",
  TH: "Thailand",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  EG: "Egypt",
  IL: "Israel",
  SE: "Sweden",
  CH: "Switzerland",
  AT: "Austria",
  BE: "Belgium",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IE: "Ireland",
  PT: "Portugal",
  CZ: "Czech Republic",
  NZ: "New Zealand",
  AR: "Argentina",
  CL: "Chile",
  ZA: "South Africa",
  NG: "Nigeria",
  KE: "Kenya",
  GH: "Ghana",
  ET: "Ethiopia",
  MA: "Morocco",
  UA: "Ukraine",
  RO: "Romania",
  HU: "Hungary",
  GR: "Greece",
  BG: "Bulgaria",
  RS: "Serbia",
  HR: "Croatia",
  SK: "Slovakia",
  LT: "Lithuania",
  LV: "Latvia",
  EE: "Estonia",
  SI: "Slovenia",
  MY: "Malaysia",
  PE: "Peru",
  EC: "Ecuador",
  UY: "Uruguay",
  PY: "Paraguay",
  BO: "Bolivia",
  VE: "Venezuela",
  CU: "Cuba",
  CR: "Costa Rica",
  PA: "Panama",
  JO: "Jordan",
  LB: "Lebanon",
  IQ: "Iraq",
  IR: "Iran",
  QA: "Qatar",
  KW: "Kuwait",
  BH: "Bahrain",
  OM: "Oman",
  LK: "Sri Lanka",
  NP: "Nepal",
  MM: "Myanmar",
  KH: "Cambodia",
  LA: "Laos",
  MN: "Mongolia",
  KZ: "Kazakhstan",
  UZ: "Uzbekistan",
  AZ: "Azerbaijan",
  GE: "Georgia",
  AM: "Armenia",
  AF: "Afghanistan",
  CM: "Cameroon",
  SN: "Senegal",
  CI: "Ivory Coast",
  TZ: "Tanzania",
  UG: "Uganda",
  RW: "Rwanda",
  MG: "Madagascar",
  MU: "Mauritius",
  TN: "Tunisia",
  DZ: "Algeria",
  LY: "Libya",
  SD: "Sudan",
  CD: "DR Congo",
  AO: "Angola",
  MZ: "Mozambique",
  ZW: "Zimbabwe",
  BW: "Botswana",
  NA: "Namibia",
  SC: "Seychelles",
  GP: "Guadeloupe",
  HT: "Haiti",
  JM: "Jamaica",
  TT: "Trinidad and Tobago",
  PR: "Puerto Rico",
  IS: "Iceland",
  LU: "Luxembourg",
  MT: "Malta",
  CY: "Cyprus",
  MD: "Moldova",
  BA: "Bosnia",
  MK: "North Macedonia",
  AL: "Albania",
  ME: "Montenegro",
  XK: "Kosovo",
  CV: "Cape Verde",
};

/**
 * Country code → flag emoji.
 * Regional indicator symbols: each letter is offset by 0x1F1A5.
 */
export function getCountryFlag(code) {
  if (!code || code.length !== 2) return "🏳️";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...[...upper].map((c) => c.charCodeAt(0) + 0x1f1a5),
  );
}

/**
 * Get full country name from ISO code.
 */
export function getCountryName(code) {
  return COUNTRY_NAMES[code?.toUpperCase()] || code || "Unknown";
}

/**
 * Approximate center coordinates for countries (lat, lng).
 * Used for placing glow dots on the map.
 * Map projection: Mercator-like, converted to SVG coordinates in world-map.js
 */
export const COUNTRY_CENTERS = {
  US: [39.8, -98.5],
  CN: [35.9, 104.2],
  IN: [20.6, 78.9],
  HK: [22.4, 114.1],
  SG: [1.4, 103.8],
  JP: [36.2, 138.3],
  TW: [23.7, 121.0],
  BR: [-14.2, -51.9],
  GB: [55.4, -3.4],
  DE: [51.2, 10.4],
  FR: [46.2, 2.2],
  CA: [56.1, -106.3],
  AU: [-25.3, 133.8],
  KR: [35.9, 127.8],
  RU: [61.5, 105.3],
  NL: [52.1, 5.3],
  ID: [-0.8, 113.9],
  TR: [38.9, 35.2],
  PK: [30.4, 69.3],
  VN: [14.1, 108.3],
  BY: [53.7, 27.9],
  BD: [23.7, 90.4],
  IT: [41.9, 12.6],
  ES: [40.5, -3.7],
  MX: [23.6, -102.6],
  PH: [12.9, 121.8],
  CO: [4.6, -74.3],
  PL: [51.9, 19.1],
  TH: [15.9, 100.9],
  SA: [23.9, 45.1],
  AE: [23.4, 53.8],
  EG: [26.8, 30.8],
  IL: [31.0, 34.9],
  SE: [60.1, 18.6],
  CH: [46.8, 8.2],
  AT: [47.5, 14.6],
  BE: [50.5, 4.5],
  NO: [60.5, 8.5],
  DK: [56.3, 9.5],
  FI: [61.9, 25.7],
  IE: [53.1, -8.2],
  PT: [39.4, -8.2],
  CZ: [49.8, 15.5],
  NZ: [-40.9, 174.9],
  AR: [-38.4, -63.6],
  CL: [-35.7, -71.5],
  ZA: [-30.6, 22.9],
  NG: [9.1, 8.7],
  KE: [-0.02, 37.9],
  UA: [48.4, 31.2],
  RO: [45.9, 25.0],
  MY: [4.2, 101.9],
  PE: [-9.2, -75.0],
};

/**
 * Approximate lat/lng for major global cities.
 */
export const CITY_CENTERS = {
  "Delhi, IN": [28.61, 77.21],
  "Mumbai, IN": [19.07, 72.87],
  "Bangalore, IN": [12.97, 77.59],
  "Hyderabad, IN": [17.38, 78.48],
  "Chennai, IN": [13.08, 80.27],
  "Kolkata, IN": [22.57, 88.36],
  "Pune, IN": [18.52, 73.85],
  "New York, US": [40.71, -74.0],
  "San Francisco, US": [37.77, -122.41],
  "Los Angeles, US": [34.05, -118.24],
  "Chicago, US": [41.87, -87.62],
  "London, GB": [51.5, -0.12],
  "Paris, FR": [48.85, 2.35],
  "Berlin, DE": [52.52, 13.4],
  "Tokyo, JP": [35.67, 139.65],
  "Singapore, SG": [1.35, 103.81],
  "Hong Kong, HK": [22.31, 114.16],
  "Sydney, AU": [-33.86, 151.2],
  "Toronto, CA": [43.65, -79.38],
  "Beijing, CN": [39.9, 116.4],
  "Shanghai, CN": [31.23, 121.47],
  "Shenzhen, CN": [22.54, 114.05],
  "Sao Paulo, BR": [-23.55, -46.63],
  "Rio de Janeiro, BR": [-22.9, -43.17],
};

/**
 * Convert lat/lng to SVG map coordinates matching amCharts world map (1000x500).
 * ViewBox: 0 0 1000 500
 */
export function latLngToSvg(lat, lng) {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}



