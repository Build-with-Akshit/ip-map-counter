import THEME from "./theme.js";

/**
 * Format a number with commas (e.g., 352043 → "352,043").
 */
function formatNumber(n) {
  if (n === undefined || n === null) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format a date string nicely (e.g., "2022-05-08" → "May 8, 2022").
 */
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr + "T00:00:00Z");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Format a peak window range string (e.g. "May 19 - May 22").
 */
function formatPeakWindow(dateStr, totalViews) {
  if (!dateStr || totalViews === 0) return "N/A";
  const d = new Date(dateStr + "T00:00:00Z");
  const d2 = new Date(d);
  d2.setDate(d2.getDate() + 3);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const m1 = months[d.getUTCMonth()];
  const m2 = months[d2.getUTCMonth()];

  if (m1 === m2) {
    return `${m1} ${d.getUTCDate()} - ${d2.getUTCDate()}`;
  }
  return `${m1} ${d.getUTCDate()} - ${m2} ${d2.getUTCDate()}`;
}

/**
 * Card 1: Total Pageviews (with circular ring)
 */
function renderCardTotalPageviews(x, y, width, height, totalViews, firstSeen) {
  const cx = 35;
  const cy = height / 2;
  const r = 20;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Left circular progress ring -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="${THEME.borderLight}" stroke-width="4"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="${THEME.green}" stroke-width="4"
        stroke-dasharray="${totalViews > 0 ? '100 126' : '0 126'}"
        stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})"/>
      
      <!-- Right text details -->
      <g transform="translate(68,0)">
        <text x="0" y="32" fill="#f0f6fc" font-size="24" font-weight="700"
          font-family="${THEME.fontFamily}">${formatNumber(totalViews)}</text>
        <text x="0" y="49" fill="#8b949e" font-size="11" font-weight="600"
          font-family="${THEME.fontFamily}">Total Pageviews</text>
        <text x="0" y="65" fill="#8b949e" font-size="9"
          font-family="${THEME.fontFamily}">counting started from ${formatDate(firstSeen)}</text>
      </g>
    </g>`;
}

/**
 * Card 2: Top Location
 */
function renderCardTopLocation(x, y, width, height, topCountries, totalViews) {
  const hasViews = totalViews > 0 && topCountries && topCountries.length > 0;
  const top = hasViews ? topCountries[0] : null;
  const codeName = top ? top.code.toUpperCase() : "N/A";
  const count = top ? top.count : 0;
  const mainText = hasViews ? `${codeName}: ${formatNumber(count)}` : "N/A";

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Left Flag/Country Badge -->
      <g transform="translate(16, 26)">
        <rect x="0" y="0" width="40" height="26" rx="5" fill="#21262d" stroke="#30363d" stroke-width="1"/>
        <text x="20" y="17" fill="#58a6ff" font-weight="700" font-size="12" font-family="${THEME.fontFamily}" text-anchor="middle">${codeName}</text>
      </g>

      <!-- Right Details -->
      <g transform="translate(68,0)">
        <text x="0" y="24" fill="#8b949e" font-size="11" font-weight="500"
          font-family="${THEME.fontFamily}">Top Location</text>
        <text x="0" y="48" fill="#f0f6fc" font-size="18" font-weight="700"
          font-family="${THEME.fontFamily}">${mainText}</text>
        <text x="0" y="64" fill="#8b949e" font-size="9"
          font-family="${THEME.fontFamily}">${hasViews ? 'Largest contribution' : 'No visits recorded'}</text>
      </g>
    </g>`;
}

/**
 * Card 3: Unique Nations
 */
function renderCardUniqueNations(x, y, width, height, uniqueCountries, totalViews) {
  const count = totalViews > 0 ? (uniqueCountries || 1) : 0;
  const cx = width / 2;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <text x="${cx}" y="24" fill="#8b949e" font-size="11" font-weight="500"
        font-family="${THEME.fontFamily}" text-anchor="middle">Unique Nations</text>
      <text x="${cx}" y="50" fill="#f0f6fc" font-size="26" font-weight="700"
        font-family="${THEME.fontFamily}" text-anchor="middle">${formatNumber(count)}</text>
      <text x="${cx}" y="65" fill="#8b949e" font-size="9"
        font-family="${THEME.fontFamily}" text-anchor="middle">${totalViews > 0 ? 'Across the globe' : 'No visits recorded'}</text>
    </g>`;
}

/**
 * Card 4: Peak Visit Window
 */
function renderCardPeakVisitWindow(x, y, width, height, highestDailyDate, totalViews) {
  const peakWindow = formatPeakWindow(highestDailyDate, totalViews);
  const cx = width / 2;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <text x="${cx}" y="24" fill="#8b949e" font-size="11" font-weight="500"
        font-family="${THEME.fontFamily}" text-anchor="middle">Peak Visit Window</text>
      <text x="${cx}" y="48" fill="#f0f6fc" font-size="16" font-weight="700"
        font-family="${THEME.fontFamily}" text-anchor="middle">${peakWindow}</text>
      <text x="${cx}" y="64" fill="#8b949e" font-size="9"
        font-family="${THEME.fontFamily}" text-anchor="middle">${totalViews > 0 ? `Highest activity period` : 'No visits recorded'}</text>
    </g>`;
}

/**
 * Render all 4 stat cards in a row matching the target design.
 */
export function renderStatsCards(data, startX, startY, totalWidth) {
  const gap = THEME.gap;
  const cardWidth = (totalWidth - gap * 3) / 4;
  const cardHeight = 82;
  const totalViews = data.pageViews || data.totalViews || 0;

  const cards = [];

  // Card 1: Total Pageviews
  cards.push(
    renderCardTotalPageviews(
      startX,
      startY,
      cardWidth,
      cardHeight,
      totalViews,
      data.firstSeen,
    ),
  );

  // Card 2: Top Location
  cards.push(
    renderCardTopLocation(
      startX + cardWidth + gap,
      startY,
      cardWidth,
      cardHeight,
      data.topCountries,
      totalViews,
    ),
  );

  // Card 3: Unique Nations
  cards.push(
    renderCardUniqueNations(
      startX + (cardWidth + gap) * 2,
      startY,
      cardWidth,
      cardHeight,
      data.uniqueCountries,
      totalViews,
    ),
  );

  // Card 4: Peak Visit Window
  cards.push(
    renderCardPeakVisitWindow(
      startX + (cardWidth + gap) * 3,
      startY,
      cardWidth,
      cardHeight,
      data.highestDailyDate || data.firstSeen,
      totalViews,
    ),
  );

  return cards.join("\n");
}
