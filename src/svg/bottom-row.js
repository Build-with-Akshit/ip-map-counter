import THEME from "./theme.js";
import { getCountryName, getCountryFlag } from "../geo.js";

/**
 * Format a number with commas.
 */
function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Render the "Top Cities" panel.
 */
function renderTopCities(cities, totalViews, x, y, width, height) {
  const maxCount = cities.length > 0 ? cities[0].count : 1;
  const barMaxWidth = 60;

  let items = "";
  cities.slice(0, 5).forEach((c, i) => {
    const itemY = 28 + i * 28;
    const pct = totalViews > 0 ? ((c.count / totalViews) * 100).toFixed(1) : "0.0";
    const barWidth = Math.max(4, (c.count / maxCount) * barMaxWidth);

    // Extract country code from "City, CC"
    const parts = c.name.split(", ");
    const cityName = parts[0] || c.name;
    const countryCode = parts[1] || "";
    const flag = countryCode ? getCountryFlag(countryCode) : "📍";

    items += `
      <g transform="translate(0,${itemY})">
        <text x="8" y="12" fill="${THEME.textMuted}" font-size="10" font-family="${THEME.fontFamily}">${i + 1}</text>
        <text x="20" y="12" font-size="11" font-family="${THEME.fontFamily}">${flag}</text>
        <text x="38" y="12" fill="${THEME.text}" font-size="11" font-family="${THEME.fontFamily}">
          ${cityName}${countryCode ? `, ${countryCode}` : ""}</text>
        <text x="${width - 95}" y="12" fill="${THEME.textSecondary}" font-size="11" 
          font-family="${THEME.fontFamily}" text-anchor="end">${formatNumber(c.count)}</text>
        <rect x="${width - 90}" y="2" width="${barWidth}" height="12" rx="3" 
          fill="${THEME.green}" opacity="0.85"/>
        <text x="${width - 8}" y="12" fill="${THEME.textMuted}" font-size="10" 
          font-family="${THEME.fontFamily}" text-anchor="end">${pct}%</text>
      </g>`;
  });


  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Header -->
      <g transform="translate(12,14)">
        <circle cx="6" cy="4" r="5" fill="none" stroke="${THEME.green}" stroke-width="1.5"/>
        <circle cx="6" cy="4" r="2" fill="${THEME.green}"/>
        <text x="18" y="8" fill="${THEME.text}" font-size="13" font-weight="600" 
          font-family="${THEME.fontFamily}">Top Cities</text>
        <text x="${width - 32}" y="8" fill="${THEME.green}" font-size="10" 
          font-family="${THEME.fontFamily}" text-anchor="end">View all →</text>
      </g>
      
      ${items}
    </g>`;
}

/**
 * Render the "Visitors Over Time" heatmap/contribution graph.
 * Similar to GitHub's contribution graph.
 */
function renderVisitorsOverTime(dailyHistory, x, y, width, height) {
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
  let monthLabels = "";
  let lastMonth = -1;
  const graphStartX = 12;
  const graphStartY = 40;

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

  // Legend
  const legend = `
    <g transform="translate(${width / 2 - 60},${height - 20})">
      <text x="0" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">Less</text>
      <rect x="25" y="2" width="10" height="10" rx="2" fill="${THEME.borderLight}"/>
      <rect x="38" y="2" width="10" height="10" rx="2" fill="${THEME.greenScale[0]}"/>
      <rect x="51" y="2" width="10" height="10" rx="2" fill="${THEME.greenScale[1]}"/>
      <rect x="64" y="2" width="10" height="10" rx="2" fill="${THEME.greenScale[2]}"/>
      <rect x="77" y="2" width="10" height="10" rx="2" fill="${THEME.greenScale[3]}"/>
      <text x="95" y="10" fill="${THEME.textMuted}" font-size="9" font-family="${THEME.fontFamily}">More</text>
    </g>`;

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Header -->
      <g transform="translate(12,14)">
        <text x="0" y="8" fill="${THEME.green}" font-size="12" font-family="${THEME.fontFamily}">📊</text>
        <text x="18" y="8" fill="${THEME.text}" font-size="13" font-weight="600" 
          font-family="${THEME.fontFamily}">Visitors Over Time</text>
      </g>
      
      ${monthLabels}
      ${cells}
      ${legend}
    </g>`;
}

/**
 * Render the "Quick Stats" panel.
 */
function renderQuickStats(data, x, y, width, height) {
  const stats = [
    { icon: "🌍", label: "Countries", value: data.uniqueCountries },
    { icon: "🏙️", label: "Cities", value: data.uniqueCities },
    { icon: "📊", label: "Today", value: data.todayViews },
    { icon: "🔥", label: "Streak", value: `${data.streak}d` },
  ];

  let items = "";
  stats.forEach((s, i) => {
    const itemY = 28 + i * 35;
    items += `
      <g transform="translate(12,${itemY})">
        <text x="0" y="14" font-size="14" font-family="${THEME.fontFamily}">${s.icon}</text>
        <text x="24" y="14" fill="${THEME.textMuted}" font-size="12" 
          font-family="${THEME.fontFamily}">${s.label}</text>
        <text x="${width - 20}" y="14" fill="${THEME.text}" font-size="14" font-weight="700" 
          font-family="${THEME.fontFamily}" text-anchor="end">${s.value}</text>
      </g>`;
  });

  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${THEME.cardRadius}"
        fill="${THEME.cardBg}" stroke="${THEME.border}" stroke-width="1"/>
      
      <!-- Header -->
      <text x="12" y="20" fill="${THEME.text}" font-size="13" font-weight="600" 
        font-family="${THEME.fontFamily}">Quick Stats</text>
      
      ${items}
    </g>`;
}

/**
 * Render the entire bottom row: Top Cities | Visitors Over Time | Quick Stats.
 */
export function renderBottomRow(data, startX, startY, totalWidth) {
  const gap = THEME.gap;
  const rowHeight = 190;

  // Column widths
  const citiesWidth = Math.floor(totalWidth * 0.28);
  const timelineWidth = Math.floor(totalWidth * 0.46);
  const statsWidth = totalWidth - citiesWidth - timelineWidth - gap * 2;

  const cities = renderTopCities(
    data.topCities,
    data.totalViews,
    startX,
    startY,
    citiesWidth,
    rowHeight,
  );

  const timeline = renderVisitorsOverTime(
    data.dailyHistory,
    startX + citiesWidth + gap,
    startY,
    timelineWidth,
    rowHeight,
  );

  const stats = renderQuickStats(
    data,
    startX + citiesWidth + timelineWidth + gap * 2,
    startY,
    statsWidth,
    rowHeight,
  );

  return `${cities}\n${timeline}\n${stats}`;
}
