import { getAnalytics } from "../src/analytics.js";
import { renderDashboard } from "../src/svg/dashboard.js";

/**
 * GET /api/dashboard?username=XXX
 *
 * Returns a dynamically generated SVG analytics dashboard.
 * Fetches all visitor data from Redis and renders a beautiful
 * GitHub-dark-themed dashboard image.
 *
 * Usage in README:
 *   ![](https://your-project.vercel.app/api/dashboard?username=YOUR_USERNAME)
 */
export default async function handler(req, res) {
  try {
    const { username, source } = req.query;

    if (!username) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.status(400).send(renderErrorSvg("Missing 'username' query parameter"));
    }

    // Fetch analytics data from Redis
    const data = await getAnalytics(username);

    // Hide contribute pill when viewing directly on Vercel web app (source=web)
    const isWeb = source === "web";
    const svg = renderDashboard(data, username, { showContributePill: !isWeb });

    // Return SVG with no-cache headers for instant real-time updates
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.status(200).send(svg);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(500).send(renderErrorSvg(err.message || "Internal server error"));
  }
}

/**
 * Render a simple error SVG card.
 */
function renderErrorSvg(message) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120">
    <rect x="0" y="0" width="600" height="120" rx="12" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
    <text x="20" y="35" fill="#f85149" font-size="16" font-weight="700"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
      ⚠ ip-map-counter Error
    </text>
    <text x="20" y="65" fill="#f0f6fc" font-size="13"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
      ${escapeXml(message)}
    </text>
    <text x="20" y="95" fill="#8b949e" font-size="11"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
      Check your Upstash Redis environment variables in Vercel project settings.
    </text>
  </svg>`;
}

/**
 * Escape special XML characters for safe SVG embedding.
 */
function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
