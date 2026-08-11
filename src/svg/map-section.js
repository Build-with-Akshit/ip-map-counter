import THEME from "./theme.js";
import WORLD_MAP_PATHS from "../world-map.js";
import {
  getCountryName,
  getCountryFlag,
  COUNTRY_CENTERS,
  latLngToSvg,
} from "../geo.js";

/**
 * Format a number with commas.
 */
function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Get a green shade based on visit intensity (0.0 - 1.0).
 */
function getIntensityColor(ratio) {
  if (ratio > 0.7) return THEME.greenScale[3];
  if (ratio > 0.4) return THEME.greenScale[2];
  if (ratio > 0.15) return THEME.greenScale[1];
  return THEME.greenScale[0];
}

/**
 * Render the world map with highlighted countries.
 */
function renderWorldMap(countryMap, mapX, mapY, mapWidth, mapHeight) {
  const maxCount = Math.max(...Object.values(countryMap), 1);

  // Render all country paths
  let paths = "";
  for (const [code, pathData] of Object.entries(WORLD_MAP_PATHS)) {
    const count = countryMap[code] || 0;
    const fillColor =
      count > 0 ? getIntensityColor(count / maxCount) : "#21262d";
    const opacity = count > 0 ? 1 : 0.85;
    const strokeColor = count > 0 ? THEME.green : "#30363d";
    const strokeWidth = count > 0 ? "1" : "0.5";
    const glowFilter = count / maxCount > 0.3 ? ' filter="url(#glow)"' : "";

    paths += `<path id="country-${code}" d="${pathData}" 
      fill="${fillColor}" opacity="${opacity}" 
      stroke="${strokeColor}" stroke-width="${strokeWidth}"${glowFilter}/>\n`;
  }

  // Render glow dots for top countries
  let dots = "";
  for (const [code, count] of Object.entries(countryMap)) {
    const coords = COUNTRY_CENTERS[code];
    if (!coords) continue;

    const { x, y } = latLngToSvg(coords[0], coords[1]);
    const ratio = count / maxCount;
    const dotRadius = Math.max(4, Math.min(16, ratio * 20));
    const dotOpacity = Math.max(0.6, ratio);

    dots += `
      <circle cx="${x}" cy="${y}" r="${dotRadius * 3}" 
        fill="${THEME.green}" opacity="${dotOpacity * 0.2}" filter="url(#dotGlow)"/>
      <circle cx="${x}" cy="${y}" r="${dotRadius * 1.8}" 
        fill="${THEME.green}" opacity="${dotOpacity * 0.4}"/>
      <circle cx="${x}" cy="${y}" r="${dotRadius}" 
        fill="${THEME.green}" opacity="${dotOpacity * 0.9}"/>
      <circle cx="${x}" cy="${y}" r="${dotRadius * 0.4}" 
        fill="#ffffff" opacity="1"/>`;
  }

  // Map legend
  const legend = `
    <g transform="translate(${mapX + 15},${mapY + mapHeight - 30})">
      <text x="50" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">
        Fewer visitors</text>
      <circle cx="112" cy="7" r="4" fill="${THEME.greenScale[0]}"/>
      <circle cx="124" cy="7" r="4" fill="${THEME.greenScale[1]}"/>
      <circle cx="136" cy="7" r="4" fill="${THEME.greenScale[2]}"/>
      <circle cx="148" cy="7" r="4" fill="${THEME.greenScale[3]}"/>
      <text x="158" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">
        More visitors</text>
    </g>`;

  // Zoom buttons (decorative)
  const zoomBtns = `
    <g transform="translate(${mapX + 15},${mapY + mapHeight - 90})">
      <rect x="0" y="0" width="28" height="28" rx="6" fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      <text x="14" y="19" fill="${THEME.textMuted}" font-size="18" font-family="${THEME.fontFamily}" text-anchor="middle">+</text>
      <rect x="0" y="34" width="28" height="28" rx="6" fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      <text x="14" y="53" fill="${THEME.textMuted}" font-size="18" font-family="${THEME.fontFamily}" text-anchor="middle">−</text>
    </g>`;

  return `
    <g transform="translate(${mapX},${mapY})">
      <svg viewBox="30.767 241.591 784.077 458.627" width="${mapWidth}" height="${mapHeight}" 
        preserveAspectRatio="xMidYMid meet">
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
  const barMaxWidth = 80;

  let items = "";
  countries.slice(0, 10).forEach((c, i) => {
    const itemY = i * 32;
    const name = getCountryName(c.code);
    const pct = totalViews > 0 ? ((c.count / totalViews) * 100).toFixed(1) : 0;
    const barWidth = Math.max(4, (c.count / maxCount) * barMaxWidth);

    items += `
      <g transform="translate(0,${itemY})">
        <text x="8" y="14" fill="${THEME.text}" font-size="11" font-family="${THEME.fontFamily}">
          ${name}</text>
        <text x="${width - 120}" y="14" fill="${THEME.textSecondary}" font-size="11" 
          font-family="${THEME.fontFamily}" text-anchor="end">${formatNumber(c.count)}</text>
        <rect x="${width - 115}" y="4" width="${barWidth}" height="12" rx="3" 
          fill="${THEME.green}" opacity="0.8"/>
        <text x="${width - 8}" y="14" fill="${THEME.textMuted}" font-size="10" 
          font-family="${THEME.fontFamily}" text-anchor="end">${pct}%</text>
      </g>`;
  });

  // Tab buttons (decorative)
  const tabs = `
    <g transform="translate(${width - 200},0)">
      <rect x="0" y="0" width="55" height="22" rx="6" fill="${THEME.green}" opacity="0.15"/>
      <text x="28" y="15" fill="${THEME.green}" font-size="10" font-family="${THEME.fontFamily}" 
        text-anchor="middle">World</text>
      <text x="80" y="15" fill="${THEME.textMuted}" font-size="10" font-family="${THEME.fontFamily}" 
        text-anchor="middle">Countries</text>
      <text x="140" y="15" fill="${THEME.textMuted}" font-size="10" font-family="${THEME.fontFamily}" 
        text-anchor="middle">Cities</text>
    </g>`;

  return `
    <g transform="translate(${x},${y})">
      <!-- Header -->
      <text x="8" y="18" fill="${THEME.text}" font-size="14" font-weight="600" 
        font-family="${THEME.fontFamily}">Top Countries</text>
      <text x="${width - 8}" y="18" fill="${THEME.green}" font-size="10" 
        font-family="${THEME.fontFamily}" text-anchor="end">View all →</text>
      ${tabs}
      
      <!-- Country list -->
      <g transform="translate(0,35)">
        ${items}
      </g>
    </g>`;
}

/**
 * Render the entire map section (map + top countries sidebar).
 */
export function renderMapSection(data, startX, startY, totalWidth) {
  const sectionHeight = 380;
  const sidebarWidth = 320;
  const mapWidth = totalWidth - sidebarWidth - THEME.gap;

  // Section card background
  const bg = `
    <rect x="${startX}" y="${startY}" width="${totalWidth}" height="${sectionHeight}" 
      rx="${THEME.cardRadius}" fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>`;

  // Section header
  const header = `
    <g transform="translate(${startX + 20},${startY + 12})">
      <circle cx="10" cy="10" r="10" fill="none" stroke="${THEME.green}" stroke-width="1.5"/>
      <text x="10" y="14" fill="${THEME.green}" font-size="12" font-family="${THEME.fontFamily}" 
        text-anchor="middle">⊕</text>
      <text x="28" y="10" fill="${THEME.text}" font-size="14" font-weight="600" 
        font-family="${THEME.fontFamily}">Visitors by Location</text>
      <text x="28" y="25" fill="${THEME.textMuted}" font-size="10" 
        font-family="${THEME.fontFamily}">See where your visitors are coming from</text>
    </g>`;

  // World map
  const map = renderWorldMap(
    data.countryMap,
    startX + 10,
    startY + 45,
    mapWidth - 20,
    sectionHeight - 80,
  );

  // Top countries sidebar
  const sidebar = renderTopCountries(
    data.topCountries,
    data.totalViews,
    startX + mapWidth + THEME.gap,
    startY + 45,
    sidebarWidth - THEME.gap,
    sectionHeight - 60,
  );

  return `${bg}\n${header}\n${map}\n${sidebar}`;
}
