import THEME from "./theme.js";
import WORLD_MAP_PATHS from "../world-map.js";
import {
  getCountryName,
  getCountryFlag,
  COUNTRY_CENTERS,
  CITY_CENTERS,
  latLngToSvg,
} from "../geo.js";

/**
 * Format a number with commas.
 */
function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



/**
 * Render the world map with high-contrast slate-gray land polygons and soft glowing green location nodes.
 */
function renderWorldMap(data, mapX, mapY, mapWidth, mapHeight) {
  const countryMap = data.countryMap || {};
  const maxCount = Math.max(...Object.values(countryMap), 1);

  // 1. Render country land polygons — clean, accurate shapes with crisp borders
  // Skip Antarctica (AQ) as standard in web analytics dashboards to keep map focused on populated continents
  let paths = "";
  for (const [code, pathData] of Object.entries(WORLD_MAP_PATHS)) {
    if (code === "AQ") continue; // Skip Antarctica

    const isVisited = (countryMap[code] || 0) > 0;
    const fillColor = isVisited ? "#1a3a2a" : "#1c2333";
    const strokeColor = isVisited ? "#2ea043" : "#2d3748";
    const strokeWidth = isVisited ? "0.7" : "0.4";

    paths += `<path id="country-${code}" d="${pathData}" 
      fill="${fillColor}" 
      stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
`;
  }

  // 2. Render glowing location nodes (dots with soft, seamless radial glow)
  let dots = "";
  const renderedCoords = new Set();

  // Render dots for top cities if available
  if (data.topCities && data.topCities.length > 0) {
    const cityMax = Math.max(...data.topCities.map(c => c.count), 1);
    for (const city of data.topCities) {
      const coords = CITY_CENTERS[city.name] || COUNTRY_CENTERS[city.name.split(", ")[1]];
      if (!coords) continue;

      const { x, y } = latLngToSvg(coords[0], coords[1]);
      renderedCoords.add(`${Math.round(x)},${Math.round(y)}`);

      const ratio = city.count / cityMax;
      const radius = Math.max(5, Math.min(16, ratio * 20));

      dots += `
        <!-- Soft seamless radial glow aura (no hard borders) -->
        <circle cx="${x}" cy="${y}" r="${radius * 3.5}" fill="url(#neonGlow)" filter="url(#blurGlow)"/>
        <!-- Crisp central glowing dot -->
        <circle cx="${x}" cy="${y}" r="${radius}" fill="#39d353"/>
        <circle cx="${x}" cy="${y}" r="${Math.max(1.5, radius * 0.4)}" fill="#ffffff"/>\n`;
    }
  }

  // Render dots for any remaining visited countries
  for (const [code, count] of Object.entries(countryMap)) {
    if (count <= 0) continue;
    const coords = COUNTRY_CENTERS[code];
    if (!coords) continue;

    const { x, y } = latLngToSvg(coords[0], coords[1]);
    const coordKey = `${Math.round(x)},${Math.round(y)}`;
    if (renderedCoords.has(coordKey)) continue;
    renderedCoords.add(coordKey);

    const ratio = count / maxCount;
    const radius = Math.max(5, Math.min(18, ratio * 22));

    dots += `
      <!-- Soft seamless radial glow aura (no hard borders) -->
      <circle cx="${x}" cy="${y}" r="${radius * 3.5}" fill="url(#neonGlow)" filter="url(#blurGlow)"/>
      <!-- Crisp central glowing dot -->
      <circle cx="${x}" cy="${y}" r="${radius}" fill="#39d353"/>
      <circle cx="${x}" cy="${y}" r="${Math.max(1.5, radius * 0.4)}" fill="#ffffff"/>\n`;
  }

  // Only show dots for actually visited locations (no ambient/fake dots)

  // Defs for smooth, borderless radial glow
  const defs = `
    <defs>
      <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#39d353" stop-opacity="0.85"/>
        <stop offset="25%" stop-color="#39d353" stop-opacity="0.5"/>
        <stop offset="60%" stop-color="#2ea043" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#39d353" stop-opacity="0"/>
      </radialGradient>
      <filter id="blurGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
      </filter>
    </defs>`;

  // Map legend
  const legend = `
    <g transform="translate(${mapX + 15},${mapY + mapHeight - 25})">
      <text x="0" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">
        Fewer visitors</text>
      <circle cx="70" cy="7" r="4" fill="${THEME.greenScale[0]}"/>
      <circle cx="82" cy="7" r="4" fill="${THEME.greenScale[1]}"/>
      <circle cx="94" cy="7" r="4" fill="${THEME.greenScale[2]}"/>
      <circle cx="106" cy="7" r="4" fill="${THEME.greenScale[3]}"/>
      <text x="116" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">
        More visitors</text>
    </g>`;

  // Zoom buttons (decorative)
  const zoomBtns = `
    <g transform="translate(${mapX + 15},${mapY + mapHeight - 85})">
      <rect x="0" y="0" width="24" height="24" rx="6" fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      <text x="12" y="16" fill="${THEME.textMuted}" font-size="16" font-family="${THEME.fontFamily}" text-anchor="middle">+</text>
      <rect x="0" y="28" width="24" height="24" rx="6" fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      <text x="12" y="45" fill="${THEME.textMuted}" font-size="16" font-family="${THEME.fontFamily}" text-anchor="middle">−</text>
    </g>`;

  return `
    <g transform="translate(${mapX},${mapY})">
      <svg viewBox="0 15 1000 425" width="${mapWidth}" height="${mapHeight}" 
        preserveAspectRatio="xMidYMid meet">
        ${defs}
        ${paths}
        ${dots}
      </svg>
    </g>
    ${legend}
    ${zoomBtns}`;
}

/**
 * Render the "Top Countries" sidebar list.
 */
function renderTopCountries(countries, totalViews, x, y, width, height) {
  const maxCount = countries.length > 0 ? countries[0].count : 1;
  const barMaxWidth = 70;

  let items = "";
  countries.slice(0, 8).forEach((c, i) => {
    const itemY = i * 36;
    const name = getCountryName(c.code);
    const flag = getCountryFlag(c.code);
    const pct = totalViews > 0 ? ((c.count / totalViews) * 100).toFixed(1) : "0.0";
    const barWidth = Math.max(4, (c.count / maxCount) * barMaxWidth);

    items += `
      <g transform="translate(0,${itemY})">
        <text x="0" y="14" font-size="13" font-family="${THEME.fontFamily}">${flag}</text>
        <text x="24" y="14" fill="${THEME.text}" font-size="12" font-family="${THEME.fontFamily}">
          ${name}</text>
        <text x="${width - 125}" y="14" fill="${THEME.textSecondary}" font-size="11" 
          font-family="${THEME.fontFamily}" text-anchor="end">${formatNumber(c.count)}</text>
        <rect x="${width - 120}" y="4" width="${barWidth}" height="12" rx="3" 
          fill="${THEME.green}" opacity="0.85"/>
        <text x="${width - 5}" y="14" fill="${THEME.textMuted}" font-size="10" 
          font-family="${THEME.fontFamily}" text-anchor="end">${pct}%</text>
      </g>`;
  });

  // Tab buttons (decorative, nicely positioned)
  const tabs = `
    <g transform="translate(${width - 165}, 0)">
      <rect x="0" y="0" width="48" height="20" rx="5" fill="${THEME.green}" opacity="0.2"/>
      <text x="24" y="14" fill="${THEME.green}" font-size="9" font-weight="600" font-family="${THEME.fontFamily}" 
        text-anchor="middle">World</text>
      <text x="75" y="14" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}" 
        text-anchor="middle">Countries</text>
      <text x="130" y="14" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}" 
        text-anchor="middle">Cities</text>
    </g>`;

  return `
    <g transform="translate(${x},${y})">
      <!-- Header -->
      <text x="0" y="16" fill="${THEME.text}" font-size="14" font-weight="600" 
        font-family="${THEME.fontFamily}">Top Countries</text>
      <text x="${width - 5}" y="32" fill="${THEME.green}" font-size="10" 
        font-family="${THEME.fontFamily}" text-anchor="end">View all →</text>
      ${tabs}
      
      <!-- Country list -->
      <g transform="translate(0,45)">
        ${items}
      </g>
    </g>`;
}

/**
 * Render the entire map section (map + top countries sidebar).
 */
export function renderMapSection(data, startX, startY, totalWidth) {
  const sectionHeight = 380;
  const sidebarWidth = 330;
  const mapWidth = totalWidth - sidebarWidth - THEME.gap;

  // Section card background
  const bg = `
    <rect x="${startX}" y="${startY}" width="${totalWidth}" height="${sectionHeight}" 
      rx="${THEME.cardRadius}" fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>`;

  // Section header
  const header = `
    <g transform="translate(${startX + 20},${startY + 15})">
      <circle cx="10" cy="10" r="10" fill="none" stroke="${THEME.green}" stroke-width="1.5"/>
      <text x="10" y="14" fill="${THEME.green}" font-size="11" font-family="${THEME.fontFamily}" 
        text-anchor="middle">⊕</text>
      <text x="28" y="10" fill="${THEME.text}" font-size="14" font-weight="600" 
        font-family="${THEME.fontFamily}">Visitors by Location</text>
      <text x="28" y="25" fill="${THEME.textMuted}" font-size="10" 
        font-family="${THEME.fontFamily}">See where your visitors are coming from</text>
    </g>`;

  // World map
  const map = renderWorldMap(
    data,
    startX + 10,
    startY + 45,
    mapWidth - 10,
    sectionHeight - 65,
  );

  // Top countries sidebar
  const sidebar = renderTopCountries(
    data.topCountries,
    data.totalViews,
    startX + mapWidth + THEME.gap,
    startY + 15,
    sidebarWidth - THEME.gap - 10,
    sectionHeight - 30,
  );

  return `${bg}\n${header}\n${map}\n${sidebar}`;
}
