import THEME from "./theme.js";
import { renderStatsCards } from "./stats-cards.js";
import { renderMapSection } from "./map-section.js";
import { renderBottomRow } from "./bottom-row.js";

/**
 * Format date for display (e.g., "May 8, 2022").
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
 * Render the complete analytics dashboard as an SVG string.
 *
 * @param {object} data - Analytics data from getAnalytics()
 * @param {string} username - GitHub username for the title
 * @returns {string} Complete SVG markup
 */
export function renderDashboard(data, username) {
  const W = THEME.dashboardWidth;
  const P = THEME.padding;
  const contentWidth = W - P * 2;

  // Calculate dynamic height based on content
  const statsY = P + 45;
  const mapY = statsY + 82 + THEME.gap;
  const bottomY = mapY + 380 + THEME.gap;
  // Visitor Distribution dynamic height (Mode 1: 1-4 large cards = 96px, Mode 2: 5-8 medium cards = 124px, Mode 3: 9+ compact badges)
  const countryCount = (data.topCountries || []).length;
  let distroHeight = 96;
  if (countryCount > 4 && countryCount <= 8) {
    distroHeight = 124;
  } else if (countryCount > 8) {
    const distroRows = Math.min(5, Math.ceil(countryCount / Math.floor((contentWidth - 24) / 124)));
    distroHeight = Math.max(80, 44 + distroRows * 28 + 30);
  }
  const heatmapHeight = 220;
  const H = bottomY + distroHeight + THEME.gap + heatmapHeight + P + 10;

  // SVG definitions (gradients, filters, etc.)
  const defs = `
    <defs>
      <!-- Green glow filter for map highlights -->
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      
      <!-- Dot glow filter -->
      <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>

      <!-- Card shadow -->
      <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.3"/>
      </filter>

      <!-- Green gradient for accents -->
      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${THEME.greenDark}"/>
        <stop offset="100%" style="stop-color:${THEME.green}"/>
      </linearGradient>
    </defs>`;

  // Embedded styles
  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
      
      .dashboard-title {
        font-family: 'Inter', ${THEME.fontFamily};
        font-weight: 700;
        font-size: 18px;
        fill: ${THEME.text};
      }
      .dashboard-subtitle {
        font-family: 'Inter', ${THEME.fontFamily};
        font-weight: 400;
        font-size: 11px;
        fill: ${THEME.textMuted};
      }
      .date-badge {
        font-family: 'Inter', ${THEME.fontFamily};
        font-weight: 500;
        font-size: 11px;
        fill: ${THEME.textSecondary};
      }
    </style>`;

  // Dashboard background
  const background = `
    <rect x="0" y="0" width="${W}" height="${H}" rx="16" 
      fill="${THEME.bg}" stroke="${THEME.border}" stroke-width="1"/>`;

  // Header: Title (left) + Contribute View pill button (right)
  const header = `
    <g transform="translate(${P},${P})">
      <!-- Logo icon -->
      <g transform="translate(0,2)">
        <rect x="0" y="4" width="4" height="14" rx="2" fill="${THEME.green}"/>
        <rect x="7" y="0" width="4" height="22" rx="2" fill="${THEME.green}"/>
        <rect x="14" y="8" width="4" height="10" rx="2" fill="${THEME.green}"/>
      </g>
      
      <text x="26" y="15" class="dashboard-title">${username}'s Website Analytics</text>
      <text x="26" y="31" class="dashboard-subtitle">Know your audience. Build better.</text>
      
      <!-- Prominent Contribute View pill button (top right) -->
      <g transform="translate(${contentWidth - 430}, 0)">
        <rect x="0" y="0" width="430" height="36" rx="10" 
          fill="#0d2818" stroke="#2ea043" stroke-width="1.2"/>
        <circle cx="20" cy="18" r="9" fill="#39d353" opacity="0.25"/>
        <circle cx="20" cy="18" r="7.5" fill="none" stroke="#39d353" stroke-width="1"/>
        <circle cx="20" cy="18" r="4.5" fill="#39d353"/>
        <text x="38" y="23" fill="${THEME.text}" font-size="12.5" font-weight="600" font-family="'Inter', ${THEME.fontFamily}">
          👉 Please <tspan font-weight="800" fill="#39d353" text-decoration="underline">CLICK HERE</tspan> to contribute a view in my profile 🌐
        </text>
      </g>
    </g>`;

  // Render each section
  const statsCards = renderStatsCards(data, P, statsY, contentWidth);
  const mapSection = renderMapSection(data, P, mapY, contentWidth);
  const bottomRow = renderBottomRow(data, P, bottomY, contentWidth);

  // Assemble the complete SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" 
    width="${W}" height="${H}" 
    viewBox="0 0 ${W} ${H}"
    role="img" aria-label="${username}'s Website Analytics Dashboard">
    ${defs}
    ${styles}
    ${background}
    ${header}
    ${statsCards}
    ${mapSection}
    ${bottomRow}
  </svg>`;
}
