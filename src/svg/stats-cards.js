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
 * Render a crisp SVG flag badge for a country code.
 */
function renderSvgFlag(code, x, y, w = 44, h = 30) {
  const c = (code || "US").toUpperCase();
  const rx = 5;

  if (c === "US") {
    // US Flag: 7 stripes + blue canton
    const stripeH = h / 7;
    return `
      <g transform="translate(${x},${y})">
        <rect width="${w}" height="${h}" rx="${rx}" fill="#b22234"/>
        <clipPath id="flagClipUS"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
        <g clip-path="url(#flagClipUS)">
          <rect y="${stripeH}" width="${w}" height="${stripeH}" fill="#ffffff"/>
          <rect y="${stripeH * 3}" width="${w}" height="${stripeH}" fill="#ffffff"/>
          <rect y="${stripeH * 5}" width="${w}" height="${stripeH}" fill="#ffffff"/>
          <rect width="${w * 0.45}" height="${stripeH * 4}" fill="#3c3b6e"/>
          <circle cx="${w * 0.12}" cy="${stripeH * 1.2}" r="1.2" fill="#ffffff"/>
          <circle cx="${w * 0.23}" cy="${stripeH * 1.2}" r="1.2" fill="#ffffff"/>
          <circle cx="${w * 0.34}" cy="${stripeH * 1.2}" r="1.2" fill="#ffffff"/>
          <circle cx="${w * 0.17}" cy="${stripeH * 2.8}" r="1.2" fill="#ffffff"/>
          <circle cx="${w * 0.28}" cy="${stripeH * 2.8}" r="1.2" fill="#ffffff"/>
        </g>
        <rect width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1"/>
      </g>`;
  }

  if (c === "IN") {
    // India Flag: Saffron, White, Green + Ashoka Chakra
    const stripeH = h / 3;
    return `
      <g transform="translate(${x},${y})">
        <clipPath id="flagClipIN"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
        <g clip-path="url(#flagClipIN)">
          <rect width="${w}" height="${stripeH}" fill="#ff9933"/>
          <rect y="${stripeH}" width="${w}" height="${stripeH}" fill="#ffffff"/>
          <rect y="${stripeH * 2}" width="${w}" height="${stripeH}" fill="#138808"/>
          <circle cx="${w / 2}" cy="${h / 2}" r="${stripeH * 0.38}" fill="none" stroke="#000080" stroke-width="1"/>
          <circle cx="${w / 2}" cy="${h / 2}" r="1" fill="#000080"/>
        </g>
        <rect width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1"/>
      </g>`;
  }

  if (c === "GB") {
    // UK Flag: Union Jack
    return `
      <g transform="translate(${x},${y})">
        <clipPath id="flagClipGB"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
        <g clip-path="url(#flagClipGB)">
          <rect width="${w}" height="${h}" fill="#012169"/>
          <path d="M0,0 L${w},${h} M${w},0 L0,${h}" stroke="#ffffff" stroke-width="5"/>
          <path d="M0,0 L${w},${h} M${w},0 L0,${h}" stroke="#c8102e" stroke-width="2"/>
          <path d="M${w / 2},0 V${h} M0,${h / 2} H${w}" stroke="#ffffff" stroke-width="7"/>
          <path d="M${w / 2},0 V${h} M0,${h / 2} H${w}" stroke="#c8102e" stroke-width="4"/>
        </g>
        <rect width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1"/>
      </g>`;
  }

  if (c === "DE") {
    // Germany Flag: Black, Red, Gold
    const stripeH = h / 3;
    return `
      <g transform="translate(${x},${y})">
        <clipPath id="flagClipDE"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
        <g clip-path="url(#flagClipDE)">
          <rect width="${w}" height="${stripeH}" fill="#000000"/>
          <rect y="${stripeH}" width="${w}" height="${stripeH}" fill="#dd0000"/>
          <rect y="${stripeH * 2}" width="${w}" height="${stripeH}" fill="#ffcc00"/>
        </g>
        <rect width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1"/>
      </g>`;
  }

  if (c === "FR") {
    // France Flag: Blue, White, Red
    const stripeW = w / 3;
    return `
      <g transform="translate(${x},${y})">
        <clipPath id="flagClipFR"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
        <g clip-path="url(#flagClipFR)">
          <rect width="${stripeW}" height="${h}" fill="#002395"/>
          <rect x="${stripeW}" width="${stripeW}" height="${h}" fill="#ffffff"/>
          <rect x="${stripeW * 2}" width="${stripeW}" height="${h}" fill="#ed2939"/>
        </g>
        <rect width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1"/>
      </g>`;
  }

  if (c === "JP") {
    // Japan Flag: White with Red circle
    return `
      <g transform="translate(${x},${y})">
        <clipPath id="flagClipJP"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
        <g clip-path="url(#flagClipJP)">
          <rect width="${w}" height="${h}" fill="#ffffff"/>
          <circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.32}" fill="#bc002d"/>
        </g>
        <rect width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#000000" stroke-opacity="0.15" stroke-width="1"/>
      </g>`;
  }

  if (c === "CN") {
    // China Flag: Red with yellow star
    return `
      <g transform="translate(${x},${y})">
        <clipPath id="flagClipCN"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
        <g clip-path="url(#flagClipCN)">
          <rect width="${w}" height="${h}" fill="#ee1c25"/>
          <polygon points="${w*0.2},${h*0.18} ${w*0.24},${h*0.35} ${w*0.36},${h*0.35} ${w*0.26},${h*0.44} ${w*0.3},${h*0.6} ${w*0.2},${h*0.49} ${w*0.1},${h*0.6} ${w*0.14},${h*0.44} ${w*0.04},${h*0.35} ${w*0.16},${h*0.35}" fill="#ffde00"/>
        </g>
        <rect width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1"/>
      </g>`;
  }

  if (c === "CA") {
    // Canada Flag: Red, White, Red
    const stripeW = w * 0.28;
    return `
      <g transform="translate(${x},${y})">
        <clipPath id="flagClipCA"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
        <g clip-path="url(#flagClipCA)">
          <rect width="${stripeW}" height="${h}" fill="#ff0000"/>
          <rect x="${stripeW}" width="${w - stripeW * 2}" height="${h}" fill="#ffffff"/>
          <rect x="${w - stripeW}" width="${stripeW}" height="${h}" fill="#ff0000"/>
          <circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.2}" fill="#ff0000"/>
        </g>
        <rect width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1"/>
      </g>`;
  }

  // Default fallback flag badge for any other country
  return `
    <g transform="translate(${x},${y})">
      <rect width="${w}" height="${h}" rx="${rx}" fill="#21262d" stroke="#30363d" stroke-width="1"/>
      <text x="${w / 2}" y="${h / 2 + 4}" fill="#58a6ff" font-weight="700" font-size="12" font-family="-apple-system, sans-serif" text-anchor="middle">${c}</text>
    </g>`;
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
        <text x="0" y="49" fill="#c9d1d9" font-size="13" font-weight="600"
          font-family="${THEME.fontFamily}">Total Pageviews</text>
        <text x="0" y="66" fill="#8b949e" font-size="11" font-weight="500"
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
  const codeName = top ? top.code.toUpperCase() : "US";
  const count = top ? top.count : 0;
  const mainText = hasViews ? `${codeName}: ${formatNumber(count)}` : "N/A";

  const flagBadge = hasViews
    ? renderSvgFlag(codeName, 14, 26, 44, 30)
    : `<g transform="translate(14,26)">
        <rect width="44" height="30" rx="5" fill="#21262d" stroke="#30363d" stroke-width="1"/>
        <text x="22" y="19" fill="#8b949e" font-weight="700" font-size="12" font-family="${THEME.fontFamily}" text-anchor="middle">N/A</text>
      </g>`;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Left Flag Badge -->
      ${flagBadge}

      <!-- Right Details -->
      <g transform="translate(70,0)">
        <text x="0" y="24" fill="#c9d1d9" font-size="13" font-weight="600"
          font-family="${THEME.fontFamily}">Top Location</text>
        <text x="0" y="48" fill="#f0f6fc" font-size="19" font-weight="700"
          font-family="${THEME.fontFamily}">${mainText}</text>
        <text x="0" y="66" fill="#8b949e" font-size="11" font-weight="500"
          font-family="${THEME.fontFamily}">${hasViews ? 'Largest contribution' : 'No visits recorded'}</text>
      </g>
    </g>`;
}

/**
 * Card 3: Unique Nations
 */
function renderCardUniqueNations(x, y, width, height, uniqueCountries, totalViews) {
  const count = totalViews > 0 ? (uniqueCountries || 1) : 0;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Big Globe icon -->
      <g transform="translate(14, 16)">
        <rect width="44" height="44" rx="8" fill="#0d2818" stroke="${THEME.green}" stroke-width="1" stroke-opacity="0.4"/>
        <g transform="translate(8, 8)">
          <circle cx="14" cy="14" r="13" fill="none" stroke="${THEME.green}" stroke-width="1.5"/>
          <ellipse cx="14" cy="14" rx="6" ry="13" fill="none" stroke="${THEME.green}" stroke-width="1.1"/>
          <line x1="1" y1="14" x2="27" y2="14" stroke="${THEME.green}" stroke-width="1.1"/>
          <ellipse cx="14" cy="7" rx="11" ry="2.5" fill="none" stroke="${THEME.green}" stroke-width="0.8"/>
          <ellipse cx="14" cy="21" rx="11" ry="2.5" fill="none" stroke="${THEME.green}" stroke-width="0.8"/>
        </g>
      </g>

      <!-- Right Details -->
      <g transform="translate(70,0)">
        <text x="0" y="24" fill="#c9d1d9" font-size="13" font-weight="600"
          font-family="${THEME.fontFamily}">Unique Nations</text>
        <text x="0" y="48" fill="#f0f6fc" font-size="24" font-weight="700"
          font-family="${THEME.fontFamily}">${formatNumber(count)}</text>
        <text x="0" y="66" fill="#8b949e" font-size="11" font-weight="500"
          font-family="${THEME.fontFamily}">${totalViews > 0 ? 'Across the globe' : 'No visits recorded'}</text>
      </g>
    </g>`;
}

/**
 * Card 4: Peak Visit Window
 */
function renderCardPeakVisitWindow(x, y, width, height, highestDailyDate, highestDailyCount, totalViews) {
  const hasViews = totalViews > 0 && highestDailyDate;
  const dateText = hasViews ? formatDate(highestDailyDate) : "N/A";
  const subText = hasViews 
    ? (highestDailyCount ? `${formatNumber(highestDailyCount)} visits in a day` : "Peak traffic record")
    : "No visits recorded";

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Big Fire/Trending icon -->
      <g transform="translate(14, 16)">
        <rect width="44" height="44" rx="8" fill="#0d2818" stroke="${THEME.green}" stroke-width="1" stroke-opacity="0.4"/>
        <g transform="translate(10, 6)">
          <path d="M12,28 C5,28 2,22 2,17 C2,12 5,8 8,5 C8,9 10,11 12,11 C11,8 12,3 16,0 C15,5 18,8 20,11 C22,14 22,17 22,19 C22,24 18,28 12,28 Z" 
            fill="${THEME.green}" opacity="0.85"/>
          <path d="M12,28 C8,28 6,24 6,21 C6,18 8,15 10,14 C10,16 11,17 12,17 C11.5,15.5 12,13 14,12 C13.5,14 15,16 16,17 C17,18 17,20 17,21 C17,25 15,28 12,28 Z" 
            fill="#7ee787" opacity="0.6"/>
        </g>
      </g>

      <!-- Right Details -->
      <g transform="translate(70,0)">
        <text x="0" y="24" fill="#c9d1d9" font-size="13" font-weight="600"
          font-family="${THEME.fontFamily}">Peak Visit Window</text>
        <text x="0" y="48" fill="#f0f6fc" font-size="17" font-weight="700"
          font-family="${THEME.fontFamily}">${dateText}</text>
        <text x="0" y="66" fill="#8b949e" font-size="11" font-weight="500"
          font-family="${THEME.fontFamily}">${subText}</text>
      </g>
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
      data.highestDailyCount,
      totalViews,
    ),
  );

  return cards.join("\n");
}
