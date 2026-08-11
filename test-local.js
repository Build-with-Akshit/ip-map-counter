/**
 * Local test script — renders the dashboard with mock data and saves to test-output.svg.
 * Run: node test-local.js
 * Then open test-output.svg in your browser to preview.
 */

import { renderDashboard } from "./src/svg/dashboard.js";
import { writeFileSync } from "fs";

// Mock analytics data (simulates what Redis would return)
const mockData = {
  totalViews: 352043,
  pageViews: 612381,
  firstSeen: "2022-05-08",
  streak: 1,
  todayViews: 47,
  highestDailyCount: 4892,
  highestDailyDate: "2024-05-19",
  topCountries: [
    { code: "US", count: 83088 },
    { code: "CN", count: 309 },
    { code: "IN", count: 48 },
    { code: "HK", count: 116 },
    { code: "SG", count: 111 },
    { code: "JP", count: 98 },
    { code: "TW", count: 67 },
    { code: "BR", count: 19 },
    { code: "GB", count: 23 },
    { code: "DE", count: 27 },
  ],
  topCities: [
    { name: "New York, US", count: 24381 },
    { name: "Delhi, IN", count: 18742 },
    { name: "Bangalore, IN", count: 12419 },
    { name: "London, GB", count: 10228 },
    { name: "Hong Kong, HK", count: 8904 },
  ],
  uniqueCountries: 92,
  uniqueCities: 431,
  countryMap: {
    US: 83088,
    CN: 309,
    IN: 48,
    HK: 116,
    SG: 111,
    JP: 98,
    TW: 67,
    BR: 19,
    GB: 23,
    DE: 27,
    FR: 24,
    CA: 16,
    AU: 9,
    KR: 7,
    RU: 10,
    NL: 3,
    ID: 8,
    TR: 13,
    PK: 8,
    VN: 11,
    IT: 2,
    ES: 3,
    MX: 2,
    PH: 4,
    TH: 1,
    SA: 2,
    EG: 9,
    ZA: 1,
    NG: 2,
    SE: 5,
    PL: 5,
    UA: 3,
    IL: 6,
    AR: 4,
    MY: 2,
  },
  dailyHistory: generateMockHistory(),
};

function generateMockHistory() {
  const days = [];
  const today = new Date();
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    // Generate somewhat realistic daily counts with some variation
    const base = Math.floor(Math.random() * 500);
    const spike = Math.random() > 0.95 ? Math.floor(Math.random() * 4000) : 0;
    days.push({ date: dateStr, count: base + spike });
  }
  return days;
}

// Render and save
const svg = renderDashboard(mockData, "Build-with-Akshit");
writeFileSync("test-output.svg", svg, "utf8");
console.log("✅ Dashboard SVG generated → test-output.svg");
console.log("   Open this file in your browser to preview!");
