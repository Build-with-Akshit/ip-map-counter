import THEME from "./theme.js";

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
 * Shows a grid of country flag badges in rows, matching the target design.
 */
function renderVisitorDistribution(countries, x, y, width, height) {
  const badgeW = 124;
  const badgeH = 28;
  const cols = Math.floor((width - 24) / badgeW);

  let badges = "";
  const maxBadges = Math.min(countries.length, cols * 5); // up to 5 rows

  for (let i = 0; i < maxBadges; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx = 12 + col * badgeW;
    const by = 38 + row * badgeH;
    badges += renderFlagBadge(countries[i].code, countries[i].count, bx, by);
  }

  // "See full detailed list" link
  const seeAllLink = countries.length > maxBadges ? `
    <text x="${width - 20}" y="${38 + Math.ceil(maxBadges / cols) * badgeH + 6}"
      fill="${THEME.green}" font-size="10" font-weight="500"
      font-family="${THEME.fontFamily}" text-anchor="end">See full detailed list</text>` : "";

  // "FLAG counter" branding (bottom-right, subtle)
  const branding = `
    <g transform="translate(${width - 110}, ${height - 22})">
      <text x="0" y="12" fill="${THEME.textMuted}" font-size="9" font-style="italic"
        font-family="${THEME.fontFamily}">🏳️ FLAG</text>
      <text x="38" y="12" fill="#8b949e" font-size="9" font-style="italic"
        font-family="${THEME.fontFamily}">counter</text>
    </g>`;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Header -->
      <text x="12" y="24" fill="${THEME.text}" font-size="14" font-weight="700"
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
  const cellSize = 10;
  const cellGap = 2;
  const totalCellSize = cellSize + cellGap;

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

  // Find max count for color scaling
  const maxCount = Math.max(...dailyHistory.map((d) => d.count), 1);

  // Get color for a count value
  function getCellColor(count) {
    if (count === 0) return THEME.borderLight;
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
  const graphStartX = 12;
  const graphStartY = 42;

  // Render cells
  let cells = "";
  const maxWeeks = Math.min(weeks.length, Math.floor((width - 30) / totalCellSize));
  const startWeekIdx = Math.max(0, weeks.length - maxWeeks);

  for (let wi = startWeekIdx; wi < weeks.length; wi++) {
    const week = weeks[wi];
    const colX = graphStartX + (wi - startWeekIdx) * totalCellSize;

    for (const day of week) {
      const d = new Date(day.date + "T00:00:00Z");
      const dow = d.getUTCDay();
      const cellY = graphStartY + dow * totalCellSize;

      cells += `<rect x="${colX}" y="${cellY}" width="${cellSize}" height="${cellSize}" 
        rx="2" fill="${getCellColor(day.count)}"/>`;

      // Add month label when month changes
      const month = d.getUTCMonth();
      if (month !== lastMonth) {
        monthLabels += `<text x="${colX}" y="${graphStartY - 5}" fill="${THEME.textMuted}" 
          font-size="9" font-family="${THEME.fontFamily}">${months[month]}</text>`;
        lastMonth = month;
      }
    }
  }

  // Legend (bottom-right)
  const legend = `
    <g transform="translate(${width - 140},${height - 22})">
      <text x="0" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">Less</text>
      <text x="25" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">...</text>
      <rect x="38" y="2" width="10" height="10" rx="2" fill="${THEME.greenScale[0]}"/>
      <rect x="51" y="2" width="10" height="10" rx="2" fill="${THEME.greenScale[1]}"/>
      <rect x="64" y="2" width="10" height="10" rx="2" fill="${THEME.greenScale[2]}"/>
      <rect x="77" y="2" width="10" height="10" rx="2" fill="${THEME.greenScale[3]}"/>
      <text x="95" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">More</text>
    </g>`;

  // Footer text
  const lastDate = dailyHistory.length > 0 ? dailyHistory[dailyHistory.length - 1].date : "N/A";
  const footer = `
    <text x="12" y="${height - 8}" fill="${THEME.textMuted}" font-size="8" font-style="italic"
      font-family="${THEME.fontFamily}">Last data refresh: ${lastDate}</text>`;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Header -->
      <text x="12" y="24" fill="${THEME.text}" font-size="14" font-weight="700"
        font-family="${THEME.fontFamily}">Visit Heatmap</text>

      <!-- Subtitle -->
      <text x="12" y="${height - 8}" fill="${THEME.textMuted}" font-size="9"
        font-family="${THEME.fontFamily}">Pageview Activity Heatmap</text>
      
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
  const heatmapHeight = 140;

  const heatmap = renderVisitHeatmap(
    data.dailyHistory || [],
    startX,
    heatmapY,
    totalWidth,
    heatmapHeight,
  );

  return `${distro}\n${heatmap}`;
}
