import THEME from "./theme.js";
import { getCountryFlag } from "../geo.js";

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
function formatPeakWindow(dateStr) {
  if (!dateStr) return "N/A";
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
  const cx = 40;
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
        stroke-dasharray="100 126"
        stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})"/>
      
      <!-- Right text details -->
      <g transform="translate(75,0)">
        <text x="0" y="32" fill="${THEME.text}" font-size="24" font-weight="700"
          font-family="${THEME.fontFamily}">${formatNumber(totalViews)}</text>
        <text x="0" y="49" fill="${THEME.textMuted}" font-size="11" font-weight="600"
          font-family="${THEME.fontFamily}">Total Pageviews</text>
        <text x="0" y="65" fill="${THEME.textMuted}" font-size="9"
          font-family="${THEME.fontFamily}">counting started from ${formatDate(firstSeen)}</text>
      </g>
    </g>`;
}

/**
 * Card 2: Top Location
 */
function renderCardTopLocation(x, y, width, height, topCountries, totalViews) {
  const top = topCountries && topCountries.length > 0 ? topCountries[0] : { code: "US", count: totalViews || 0 };
  const flag = getCountryFlag(top.code);
  const codeName = top.code.toUpperCase();
  const count = top.count;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Left Flag Badge -->
      <g transform="translate(18, 22)">
        <rect x="0" y="0" width="42" height="30" rx="4" fill="${THEME.cardBg}" stroke="${THEME.borderLight}" stroke-width="1"/>
        <text x="21" y="22" font-size="22" font-family="${THEME.fontFamily}" text-anchor="middle">${flag}</text>
      </g>

      <!-- Right Details -->
      <g transform="translate(72,0)">
        <text x="0" y="24" fill="${THEME.textMuted}" font-size="11"
          font-family="${THEME.fontFamily}">Top Location</text>
        <text x="0" y="49" fill="${THEME.text}" font-size="20" font-weight="700"
          font-family="${THEME.fontFamily}">${codeName}: ${formatNumber(count)}</text>
        <text x="0" y="65" fill="${THEME.textMuted}" font-size="9"
          font-family="${THEME.fontFamily}">Largest contribution</text>
      </g>
    </g>`;
}

/**
 * Card 3: Unique Nations
 */
function renderCardUniqueNations(x, y, width, height, uniqueCountries) {
  const count = uniqueCountries > 0 ? uniqueCountries : 1;
  const cx = width / 2;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <text x="${cx}" y="24" fill="${THEME.textMuted}" font-size="11"
        font-family="${THEME.fontFamily}" text-anchor="middle">Unique Nations</text>
      <text x="${cx}" y="52" fill="${THEME.text}" font-size="26" font-weight="700"
        font-family="${THEME.fontFamily}" text-anchor="middle">${formatNumber(count)}</text>
      <text x="${cx}" y="67" fill="${THEME.textMuted}" font-size="9"
        font-family="${THEME.fontFamily}" text-anchor="middle">Across the globe</text>
    </g>`;
}

/**
 * Card 4: Peak Visit Window
 */
function renderCardPeakVisitWindow(x, y, width, height, highestDailyDate) {
  const peakWindow = formatPeakWindow(highestDailyDate);
  const cx = width / 2;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <text x="${cx}" y="24" fill="${THEME.textMuted}" font-size="11"
        font-family="${THEME.fontFamily}" text-anchor="middle">Peak Visit Window</text>
      <text x="${cx}" y="49" fill="${THEME.text}" font-size="16" font-weight="700"
        font-family="${THEME.fontFamily}" text-anchor="middle">${peakWindow}</text>
      <text x="${cx}" y="65" fill="${THEME.textMuted}" font-size="9"
        font-family="${THEME.fontFamily}" text-anchor="middle">e.g. ${peakWindow}</text>
    </g>`;
}

/**
 * Render all 4 stat cards in a row matching the target design.
 */
export function renderStatsCards(data, startX, startY, totalWidth) {
  const gap = THEME.gap;
  const cardWidth = (totalWidth - gap * 3) / 4;
  const cardHeight = 82;

  const cards = [];

  // Card 1: Total Pageviews
  cards.push(
    renderCardTotalPageviews(
      startX,
      startY,
      cardWidth,
      cardHeight,
      data.pageViews || data.totalViews,
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
      data.pageViews || data.totalViews,
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
    ),
  );

  return cards.join("\n");
}
