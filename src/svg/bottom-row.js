import THEME from "./theme.js";
import { getCountryName, getCountryFlag } from "../geo.js";

/**
 * Format a number with commas.
 */
function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Render a single country flag badge pill: "[IN] IN: 39"
 * Uses text country codes instead of emoji flags for cross-platform SVG compatibility.
 */
function renderFlagBadge(code, count, x, y) {
  const cc = code.toUpperCase();
  const label = `${cc}: ${formatNumber(count)}`;
  const badgeW = 120;
  const badgeH = 24;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${badgeW}" height="${badgeH}" rx="6"
        fill="#21262d" stroke="#30363d" stroke-width="0.5"/>
      <rect x="4" y="4" width="22" height="16" rx="3" fill="#1a1e24" stroke="#30363d" stroke-width="0.5"/>
      <text x="15" y="16" fill="#58a6ff" font-size="8" font-weight="700"
        font-family="${THEME.fontFamily}" text-anchor="middle">${cc}</text>
      <text x="30" y="16" fill="#c9d1d9" font-size="11" font-weight="500"
        font-family="${THEME.fontFamily}">${label}</text>
    </g>`;
}

/**
 * Render the "Visitor Distribution by Country" section.
 * Dynamically adjusts sizing based on country count:
 * - 1 to 4 countries: Large cards spanning the full width of the section
 * - 5 to 8 countries: Medium cards in 2 balanced rows
 * - 9+ countries: Compact grid badge pills
 */
function renderVisitorDistribution(countries, x, y, width, height, totalViews) {
  const count = countries.length;
  const total = totalViews || countries.reduce((sum, c) => sum + c.count, 0) || 1;
  let badges = "";

  if (count > 0 && count <= 4) {
    // Mode 1: Large prominent cards spanning full section width
    const gap = 12;
    const cardW = Math.floor((width - 24 - (count - 1) * gap) / count);
    const cardH = 48;

    countries.slice(0, 4).forEach((c, i) => {
      const cx = 12 + i * (cardW + gap);
      const cy = 34;
      const cc = c.code.toUpperCase();
      const name = getCountryName(cc);
      const pct = ((c.count / total) * 100).toFixed(1);
      const progressW = Math.max(8, (c.count / total) * (cardW - 20));

      badges += `
        <g transform="translate(${cx},${cy})">
          <!-- Card Background -->
          <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="8"
            fill="#161b22" stroke="#30363d" stroke-width="1"/>
          
          <!-- Country code badge -->
          <rect x="10" y="9" width="34" height="22" rx="4" fill="#0d2818" stroke="#2ea043" stroke-width="0.8"/>
          <text x="27" y="24" fill="#39d353" font-size="11" font-weight="700"
            font-family="${THEME.fontFamily}" text-anchor="middle">${cc}</text>
          
          <!-- Country Name + View count -->
          <text x="52" y="22" fill="${THEME.text}" font-size="13.5" font-weight="700"
            font-family="${THEME.fontFamily}">${name}</text>
          <text x="52" y="37" fill="${THEME.textSecondary}" font-size="11.5" font-weight="500"
            font-family="${THEME.fontFamily}">${formatNumber(c.count)} views (${pct}%)</text>
          
          <!-- Progress bar -->
          <rect x="10" y="${cardH - 5}" width="${cardW - 20}" height="3" rx="1.5" fill="#21262d"/>
          <rect x="10" y="${cardH - 5}" width="${progressW}" height="3" rx="1.5" fill="#39d353"/>
        </g>`;
    });

  } else if (count > 4 && count <= 8) {
    // Mode 2: Medium cards in 2 rows
    const cols = Math.min(count, 4);
    const gap = 10;
    const cardW = Math.floor((width - 24 - (cols - 1) * gap) / cols);
    const cardH = 36;

    countries.slice(0, 8).forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = 12 + col * (cardW + gap);
      const cy = 34 + row * (cardH + 8);
      const cc = c.code.toUpperCase();
      const pct = ((c.count / total) * 100).toFixed(1);
      const progressW = Math.max(6, (c.count / total) * (cardW - 12));

      badges += `
        <g transform="translate(${cx},${cy})">
          <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="6"
            fill="#161b22" stroke="#30363d" stroke-width="1"/>
          <rect x="6" y="6" width="28" height="18" rx="3" fill="#1a1e24" stroke="#30363d" stroke-width="0.5"/>
          <text x="20" y="19" fill="#58a6ff" font-size="10" font-weight="700"
            font-family="${THEME.fontFamily}" text-anchor="middle">${cc}</text>
          <text x="40" y="18" fill="${THEME.text}" font-size="12" font-weight="600"
            font-family="${THEME.fontFamily}">${cc}: ${formatNumber(c.count)}</text>
          <text x="${cardW - 8}" y="18" fill="${THEME.textSecondary}" font-size="11" font-weight="500"
            font-family="${THEME.fontFamily}" text-anchor="end">${pct}%</text>
          <rect x="6" y="${cardH - 4}" width="${cardW - 12}" height="2" rx="1" fill="#21262d"/>
          <rect x="6" y="${cardH - 4}" width="${progressW}" height="2" rx="1" fill="#39d353"/>
        </g>`;
    });

  } else {
    // Mode 3: Compact Badge Grid for 9+ countries
    const badgeW = 124;
    const badgeH = 28;
    const cols = Math.floor((width - 24) / badgeW);
    const maxBadges = Math.min(countries.length, cols * 5); // up to 5 rows

    for (let i = 0; i < maxBadges; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = 12 + col * badgeW;
      const by = 38 + row * badgeH;
      badges += renderFlagBadge(countries[i].code, countries[i].count, bx, by);
    }
  }

  // "See full detailed list" link if truncated
  const seeAllLink = count > 8 ? `
    <text x="${width - 20}" y="${height - 12}"
      fill="${THEME.green}" font-size="11" font-weight="600"
      font-family="${THEME.fontFamily}" text-anchor="end">See full detailed list</text>` : "";

  // "FLAG counter" branding (bottom-right, subtle)
  const branding = `
    <g transform="translate(${width - 110}, ${height - 22})">
      <text x="0" y="12" fill="${THEME.textMuted}" font-size="10" font-style="italic"
        font-family="${THEME.fontFamily}">🏳️ FLAG</text>
      <text x="38" y="12" fill="#8b949e" font-size="10" font-style="italic"
        font-family="${THEME.fontFamily}">counter</text>
    </g>`;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Header -->
      <text x="12" y="24" fill="${THEME.text}" font-size="16" font-weight="700"
        font-family="${THEME.fontFamily}">Visitor Distribution by Country</text>
      
      ${badges}
      ${seeAllLink}
      ${branding}
    </g>`;
}

/**
 * Render the "Visit Heatmap" — full-width GitHub contribution-style heatmap.
 */
function renderVisitHeatmap(dailyHistory, x, y, width, height) {
  const availableWidth = width - 40;
  // Group days into weeks
  const weeks = [];
  let currentWeek = [];
  for (const day of dailyHistory) {
    const d = new Date(day.date + "T00:00:00Z");
    const dow = d.getUTCDay(); // 0=Sun, 6=Sat

    if (dow === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const numWeeks = Math.max(weeks.length, 1);
  const totalCellSize = Math.max(12, Math.floor(availableWidth / numWeeks));
  const cellGap = 3;
  const cellSize = totalCellSize - cellGap;

  // Find max count for color scaling
  const maxCount = Math.max(...dailyHistory.map((d) => d.count), 1);

  // Get color for a count value
  function getCellColor(count) {
    if (!count || count === 0) return THEME.borderLight;
    const ratio = count / maxCount;
    if (ratio > 0.75) return THEME.greenScale[3];
    if (ratio > 0.5) return THEME.greenScale[2];
    if (ratio > 0.25) return THEME.greenScale[1];
    return THEME.greenScale[0];
  }

  // Month labels
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  let monthLabels = "";
  let lastMonth = -1;
  const graphStartX = 20;
  const graphStartY = 45;

  // Render cells
  let cells = "";
  for (let wi = 0; wi < weeks.length; wi++) {
    const week = weeks[wi];
    const colX = graphStartX + wi * totalCellSize;

    for (const day of week) {
      const d = new Date(day.date + "T00:00:00Z");
      const dow = d.getUTCDay();
      const cellY = graphStartY + dow * totalCellSize;

      cells += `<rect x="${colX}" y="${cellY}" width="${cellSize}" height="${cellSize}" 
        rx="3" fill="${getCellColor(day.count)}"/>`;

      // Add month label when month changes
      const month = d.getUTCMonth();
      if (month !== lastMonth) {
        monthLabels += `<text x="${colX}" y="${graphStartY - 8}" fill="${THEME.textSecondary}" 
          font-size="11.5" font-weight="500" font-family="${THEME.fontFamily}">${months[month]}</text>`;
        lastMonth = month;
      }
    }
  }

  // Legend (bottom-right)
  const legend = `
    <g transform="translate(${width - 160},${height - 24})">
      <text x="0" y="10" fill="${THEME.textSecondary}" font-size="11.5" font-weight="500" font-family="${THEME.fontFamily}">Less</text>
      <text x="32" y="10" fill="${THEME.textSecondary}" font-size="11.5" font-family="${THEME.fontFamily}">...</text>
      <rect x="48" y="1" width="12" height="12" rx="3" fill="${THEME.greenScale[0]}"/>
      <rect x="63" y="1" width="12" height="12" rx="3" fill="${THEME.greenScale[1]}"/>
      <rect x="78" y="1" width="12" height="12" rx="3" fill="${THEME.greenScale[2]}"/>
      <rect x="93" y="1" width="12" height="12" rx="3" fill="${THEME.greenScale[3]}"/>
      <text x="114" y="10" fill="${THEME.textSecondary}" font-size="11.5" font-weight="500" font-family="${THEME.fontFamily}">More</text>
    </g>`;

  // Subtitle text
  const subtitle = `
    <text x="${width - 20}" y="24" fill="${THEME.textSecondary}" font-size="12.5" font-weight="500"
      font-family="${THEME.fontFamily}" text-anchor="end">Daily visitor activity over time</text>`;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Header -->
      <text x="20" y="24" fill="${THEME.text}" font-size="16" font-weight="700"
        font-family="${THEME.fontFamily}">Visit Heatmap</text>

      ${subtitle}
      ${monthLabels}
      ${cells}
      ${legend}
    </g>`;
}

/**
 * Render the entire bottom row:
 *   Row 1: Visitor Distribution by Country (full width)
 *   Row 2: Visit Heatmap (full width)
 */
export function renderBottomRow(data, startX, startY, totalWidth) {
  const gap = THEME.gap;

  // Row 1: Visitor Distribution by Country
  const distroRows = Math.min(5, Math.ceil((data.topCountries?.length || 0) / Math.floor((totalWidth - 24) / 124)));
  const distroHeight = Math.max(80, 44 + distroRows * 28 + 30);

  const distro = renderVisitorDistribution(
    data.topCountries || [],
    startX,
    startY,
    totalWidth,
    distroHeight,
  );

  // Row 2: Visit Heatmap
  const heatmapY = startY + distroHeight + gap;
  const heatmapHeight = 220;

  const heatmap = renderVisitHeatmap(
    data.dailyHistory || [],
    startX,
    heatmapY,
    totalWidth,
    heatmapHeight,
  );

  return `${distro}\n${heatmap}`;
}
