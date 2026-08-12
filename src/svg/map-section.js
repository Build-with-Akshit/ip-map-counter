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
 * Helper to calculate dot size, colors, and glow tier based on visitor count.
 */
function getDotStyle(count, maxCount) {
  if (count <= 0) return null;
  const ratio = Math.max(0.01, count / maxCount);
  
  if (ratio > 0.4 || count >= 5000) {
    // High Intensity: Large bright yellow-green neon glowing dot
    const radius = Math.max(10, Math.min(16, 10 + ratio * 6));
    return {
      radius,
      glowRadius: radius * 3.6,
      dotColor: "#d4ff00",
      coreColor: "#ffffff",
      glowId: "highGlow",
      filterId: "blurHigh",
    };
  } else if (ratio > 0.05 || count >= 50) {
    // Medium Intensity: Vibrant bright green glowing dot
    const radius = Math.max(6, Math.min(9.5, 6 + ratio * 8));
    return {
      radius,
      glowRadius: radius * 3.2,
      dotColor: "#39d353",
      coreColor: "#ffffff",
      glowId: "medGlow",
      filterId: "blurMed",
    };
  } else {
    // Low Intensity: Small green dot with subtle glow
    const radius = Math.max(3.5, Math.min(5.5, 3.5 + ratio * 10));
    return {
      radius,
      glowRadius: radius * 2.8,
      dotColor: "#26a641",
      coreColor: "#a3f7b5",
      glowId: "lowGlow",
      filterId: "blurLow",
    };
  }
}

/**
 * Render the world map with high-contrast slate-gray land polygons and soft glowing green location nodes.
 */
function renderWorldMap(data, mapX, mapY, mapWidth, mapHeight) {
  const countryMap = data.countryMap || {};
  const maxCount = Math.max(...Object.values(countryMap), 1);

  // 1. Render all country land polygons — clean, accurate shapes with crisp borders
  let paths = "";
  for (const [code, pathData] of Object.entries(WORLD_MAP_PATHS)) {
    const isVisited = (countryMap[code] || 0) > 0;
    const fillColor = isVisited ? "#102b1c" : "#1c2333";
    const strokeColor = isVisited ? "#2ea043" : "#2d3748";
    const strokeWidth = isVisited ? "0.8" : "0.4";

    paths += `<path id="country-${code}" d="${pathData}" 
      fill="${fillColor}" 
      stroke="${strokeColor}" stroke-width="${strokeWidth}"/>\n`;
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

      const style = getDotStyle(city.count, cityMax);
      if (!style) continue;

      dots += `
        <!-- Soft radial glow aura -->
        <circle cx="${x}" cy="${y}" r="${style.glowRadius}" fill="url(#${style.glowId})" filter="url(#${style.filterId})"/>
        <!-- Central glowing dot -->
        <circle cx="${x}" cy="${y}" r="${style.radius}" fill="${style.dotColor}"/>
        <circle cx="${x}" cy="${y}" r="${Math.max(1.5, style.radius * 0.45)}" fill="${style.coreColor}"/>\n`;
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

    const style = getDotStyle(count, maxCount);
    if (!style) continue;

    dots += `
      <!-- Soft radial glow aura -->
      <circle cx="${x}" cy="${y}" r="${style.glowRadius}" fill="url(#${style.glowId})" filter="url(#${style.filterId})"/>
      <!-- Central glowing dot -->
      <circle cx="${x}" cy="${y}" r="${style.radius}" fill="${style.dotColor}"/>
      <circle cx="${x}" cy="${y}" r="${Math.max(1.5, style.radius * 0.45)}" fill="${style.coreColor}"/>\n`;
  }

  // Defs for smooth, borderless radial glow for Low, Medium, and High intensities
  const defs = `
    <defs>
      <!-- High Intensity: Lime-Yellow Glow -->
      <radialGradient id="highGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d4ff00" stop-opacity="0.95"/>
        <stop offset="30%" stop-color="#39d353" stop-opacity="0.6"/>
        <stop offset="70%" stop-color="#2ea043" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#39d353" stop-opacity="0"/>
      </radialGradient>

      <!-- Medium Intensity: Bright Emerald Glow -->
      <radialGradient id="medGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#39d353" stop-opacity="0.85"/>
        <stop offset="40%" stop-color="#2ea043" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#39d353" stop-opacity="0"/>
      </radialGradient>

      <!-- Low Intensity: Soft Green Glow -->
      <radialGradient id="lowGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#26a641" stop-opacity="0.75"/>
        <stop offset="50%" stop-color="#0e4429" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#26a641" stop-opacity="0"/>
      </radialGradient>

      <filter id="blurHigh" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
      </filter>
      <filter id="blurMed" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
      </filter>
      <filter id="blurLow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
      </filter>
    </defs>`;

  // Map legend with 4 intensity levels
  const legend = `
    <g transform="translate(${mapX + 15},${mapY + mapHeight - 25})">
      <text x="0" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">
        Fewer visitors</text>
      <circle cx="70" cy="7" r="3" fill="#26a641"/>
      <circle cx="83" cy="7" r="4.5" fill="#39d353"/>
      <circle cx="97" cy="7" r="6" fill="#56d364"/>
      <circle cx="113" cy="7" r="8" fill="#d4ff00"/>
      <text x="126" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">
        More visitors</text>
    </g>`;

  // Decorative zoom buttons
  const zoomBtns = `
    <g transform="translate(${mapX + 15},${mapY + mapHeight - 85})">
      <rect x="0" y="0" width="24" height="24" rx="6" fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      <text x="12" y="16" fill="${THEME.textMuted}" font-size="16" font-family="${THEME.fontFamily}" text-anchor="middle">+</text>
      <rect x="0" y="28" width="24" height="24" rx="6" fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      <text x="12" y="45" fill="${THEME.textMuted}" font-size="16" font-family="${THEME.fontFamily}" text-anchor="middle">−</text>
    </g>`;

  return `
    <g transform="translate(${mapX},${mapY})">
      <svg viewBox="0 0 1000 500" width="${mapWidth}" height="${mapHeight}" 
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
 * Render the entire map section (full-width World Map).
 */
export function renderMapSection(data, startX, startY, totalWidth) {
  const sectionHeight = 380;
  const mapWidth = totalWidth - 40;

  // Section card background
  const bg = `
    <rect x="${startX}" y="${startY}" width="${totalWidth}" height="${sectionHeight}" 
      rx="${THEME.cardRadius}" fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>`;

  // Section header
  const header = `
    <g transform="translate(${startX + 20},${startY + 15})">
      <!-- Globe icon -->
      <g transform="translate(0,0)">
        <!-- Outer circle -->
        <circle cx="10" cy="10" r="9.5" fill="none" stroke="${THEME.green}" stroke-width="1.3"/>
        <!-- Vertical ellipse (central meridian) -->
        <ellipse cx="10" cy="10" rx="4.5" ry="9.5" fill="none" stroke="${THEME.green}" stroke-width="1.1"/>
        <!-- Horizontal equator line -->
        <line x1="0.5" y1="10" x2="19.5" y2="10" stroke="${THEME.green}" stroke-width="1.1"/>
        <!-- Upper latitude line -->
        <ellipse cx="10" cy="5.5" rx="8" ry="1.8" fill="none" stroke="${THEME.green}" stroke-width="0.9"/>
        <!-- Lower latitude line -->
        <ellipse cx="10" cy="14.5" rx="8" ry="1.8" fill="none" stroke="${THEME.green}" stroke-width="0.9"/>
      </g>
      <text x="28" y="10" fill="${THEME.text}" font-size="14" font-weight="600" 
        font-family="${THEME.fontFamily}">Visitors by Location</text>
      <text x="28" y="25" fill="${THEME.textMuted}" font-size="10" 
        font-family="${THEME.fontFamily}">See where your visitors are coming from</text>
    </g>`;

  // World map - expanded to full card width
  const map = renderWorldMap(
    data,
    startX + 20,
    startY + 45,
    mapWidth,
    sectionHeight - 55,
  );

  return `${bg}\n${header}\n${map}`;
}
