import THEME from "./theme.js";

/**
 * Format a number with commas (e.g., 352043 → "352,043").
 */
function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format a date string nicely (e.g., "2022-05-08" → "May 8, 2022").
 */
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr + "T00:00:00Z");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * SVG icon: people/visitors
 */
function iconVisitors(x, y) {
  return `<g transform="translate(${x},${y}) scale(0.9)" fill="${THEME.green}">
    <circle cx="8" cy="6" r="4"/>
    <path d="M0 18c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
    <circle cx="20" cy="8" r="3" opacity="0.6"/>
    <path d="M17 18c0-3.3 1.3-5.5 3-7" opacity="0.6"/>
  </g>`;
}

/**
 * SVG icon: eye/page views
 */
function iconPageViews(x, y) {
  return `<g transform="translate(${x},${y}) scale(0.9)" fill="none" stroke="${THEME.green}" stroke-width="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3" fill="${THEME.green}"/>
  </g>`;
}

/**
 * SVG icon: streak/fire
 */
function iconStreak(x, y) {
  return `<g transform="translate(${x},${y}) scale(0.9)" fill="${THEME.green}">
    <path d="M12 2C10 6 6 8 6 13a6 6 0 0012 0c0-3-2-5.5-3-7l-1.5 2C12.5 10 11 10 11 8c0-1.5 1-3 1-6z"/>
  </g>`;
}

/**
 * SVG icon: bar chart/highest
 */
function iconHighest(x, y) {
  return `<g transform="translate(${x},${y}) scale(0.9)" fill="${THEME.green}">
    <rect x="2" y="12" width="4" height="10" rx="1"/>
    <rect x="9" y="6" width="4" height="16" rx="1"/>
    <rect x="16" y="2" width="4" height="20" rx="1"/>
  </g>`;
}

/**
 * Render a single stat card.
 */
function renderStatCard(x, y, width, height, icon, label, value, subtext) {
  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      ${icon}
      <text x="50" y="28" fill="${THEME.textMuted}" font-size="11"
        font-family="${THEME.fontFamily}">${label}</text>
      <text x="50" y="55" fill="${THEME.text}" font-size="26" font-weight="700"
        font-family="${THEME.fontFamily}">${value}</text>
      ${
        subtext
          ? `<text x="50" y="72" fill="${THEME.textMuted}" font-size="10"
        font-family="${THEME.fontFamily}">${subtext}</text>`
          : ""
      }
    </g>`;
}

/**
 * Render the streak card with a circular progress indicator.
 */
function renderStreakCard(x, y, width, height, streak, todayViews) {
  const isActive = todayViews > 0;
  const statusText = isActive ? "Active today" : "Inactive";
  const statusColor = isActive ? THEME.green : THEME.textMuted;

  // Circular ring
  const cx = width / 2;
  const cy = 48;
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const progress = isActive ? circumference : 0;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      <text x="${cx}" y="20" fill="${THEME.textMuted}" font-size="11"
        font-family="${THEME.fontFamily}" text-anchor="middle">Current Streak</text>
      
      <!-- Circular ring -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="${THEME.borderLight}" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="${statusColor}" stroke-width="3"
        stroke-dasharray="${progress} ${circumference}"
        stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})"/>
      
      <text x="${cx}" y="${cy + 5}" fill="${THEME.text}" font-size="22" font-weight="700"
        font-family="${THEME.fontFamily}" text-anchor="middle">${streak}</text>
      
      <text x="${cx}" y="${cy + 26}" fill="${statusColor}" font-size="10"
        font-family="${THEME.fontFamily}" text-anchor="middle">${statusText}</text>
    </g>`;
}

/**
 * Render all 4 stat cards in a row.
 */
export function renderStatsCards(data, startX, startY, totalWidth) {
  const gap = THEME.gap;
  const cardWidth = (totalWidth - gap * 3) / 4;
  const cardHeight = 82;

  const cards = [];

  // Card 1: Total Visitors
  cards.push(
    renderStatCard(
      startX,
      startY,
      cardWidth,
      cardHeight,
      iconVisitors(16, 18),
      "Total Visitors",
      formatNumber(data.totalViews),
      "",
    ),
  );

  // Card 2: Page Views
  cards.push(
    renderStatCard(
      startX + cardWidth + gap,
      startY,
      cardWidth,
      cardHeight,
      iconPageViews(16, 18),
      "Page Views",
      formatNumber(data.pageViews),
      "",
    ),
  );

  // Card 3: Current Streak
  cards.push(
    renderStreakCard(
      startX + (cardWidth + gap) * 2,
      startY,
      cardWidth,
      cardHeight,
      data.streak,
      data.todayViews,
    ),
  );

  // Card 4: Highest Daily Visitors
  cards.push(
    renderStatCard(
      startX + (cardWidth + gap) * 3,
      startY,
      cardWidth,
      cardHeight,
      iconHighest(16, 18),
      "Highest Daily Visitors",
      formatNumber(data.highestDailyCount),
      data.highestDailyDate ? formatDate(data.highestDailyDate) : "",
    ),
  );

  return cards.join("\n");
}
