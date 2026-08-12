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
export function renderDashboard(data, username, options = {}) {
  const showContributePill = options.showContributePill !== false;
  const W = THEME.dashboardWidth;
  const P = THEME.padding;
  const contentWidth = W - P * 2;

  // Calculate dynamic height based on content
  const headerHeight = showContributePill ? 92 : 45;
  const statsY = P + headerHeight;
  const mapY = statsY + 82 + THEME.gap;
  const bottomY = mapY + 520 + THEME.gap;
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

      <!-- Pill gradient for contribute button -->
      <linearGradient id="pillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#0b2917"/>
        <stop offset="100%" style="stop-color:#124424"/>
      </linearGradient>
    </defs>`;

  // Embedded styles
  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap');
      
      .dashboard-title {
        font-family: 'Inter', ${THEME.fontFamily};
        font-weight: 700;
        font-size: 20px;
        fill: ${THEME.text};
      }
      .dashboard-subtitle {
        font-family: 'Inter', ${THEME.fontFamily};
        font-weight: 500;
        font-size: 13px;
        fill: ${THEME.textSecondary};
      }
      .date-badge {
        font-family: 'Inter', ${THEME.fontFamily};
        font-weight: 500;
        font-size: 12px;
        fill: ${THEME.textSecondary};
      }
    </style>`;

  // Dashboard background
  const background = `
    <rect x="0" y="0" width="${W}" height="${H}" rx="16" 
      fill="${THEME.bg}" stroke="${THEME.border}" stroke-width="1"/>`;

  let header = "";

  if (showContributePill) {
    // README Header: Top Centered Banner + Main Title Underneath
    const pillWidth = 560;
    const pillX = (contentWidth - pillWidth) / 2;

    header = `
      <g transform="translate(${P},${P})">
        <!-- Top Centered Contribute Banner -->
        <g transform="translate(${pillX}, -4)">
          <rect x="0" y="0" width="${pillWidth}" height="42" rx="12" 
            fill="url(#pillGradient)" stroke="#39d353" stroke-width="1.5"/>
          <circle cx="26" cy="21" r="11" fill="#39d353" opacity="0.35"/>
          <circle cx="26" cy="21" r="8.5" fill="none" stroke="#39d353" stroke-width="1.2"/>
          <circle cx="26" cy="21" r="5" fill="#39d353"/>
          <text x="48" y="26" fill="${THEME.text}" font-size="14.5" font-weight="600" font-family="'Inter', ${THEME.fontFamily}">
            👉 Please <tspan font-weight="900" fill="#56d364" font-size="15" text-decoration="underline">CLICK HERE</tspan> to contribute a view in my profile 🌐
          </text>
        </g>

        <!-- Main Title Header Underneath Banner -->
        <g transform="translate(0, 52)">
          <g transform="translate(0,2)">
            <rect x="0" y="4" width="4" height="14" rx="2" fill="${THEME.green}"/>
            <rect x="7" y="0" width="4" height="22" rx="2" fill="${THEME.green}"/>
            <rect x="14" y="8" width="4" height="10" rx="2" fill="${THEME.green}"/>
          </g>
          <text x="26" y="16" class="dashboard-title">${username}'s Website Analytics</text>
        </g>
      </g>`;
  } else {
    // Vercel Web App Header: Title + Inline Subtitle
    header = `
      <g transform="translate(${P},${P})">
        <g transform="translate(0,2)">
          <rect x="0" y="4" width="4" height="14" rx="2" fill="${THEME.green}"/>
          <rect x="7" y="0" width="4" height="22" rx="2" fill="${THEME.green}"/>
          <rect x="14" y="8" width="4" height="10" rx="2" fill="${THEME.green}"/>
        </g>
        <text x="26" y="20" class="dashboard-title">${username}'s Website Analytics<tspan dx="14" font-size="13" font-weight="500" fill="#8b949e">— Know your audience. Build better.</tspan></text>
      </g>`;
  }

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
