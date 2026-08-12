import { recordVisit } from "../src/analytics.js";

/**
 * 1x1 transparent GIF pixel (43 bytes).
 * This is the smallest valid GIF file.
 */
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

/**
 * GET /api/track?username=XXX
 *
 * Tracking pixel endpoint. Records a visit and returns a 1x1 transparent GIF.
 * Users embed this as an <img> tag in their README or website.
 *
 * Vercel automatically provides geolocation headers:
 *   - x-vercel-ip-country: ISO country code
 *   - x-vercel-ip-city: City name
 *
 * Note: When loaded through GitHub's Camo proxy, the IP will be GitHub's
 * (US-based). For accurate location tracking, users should embed this on
 * their own website where the request comes directly from the visitor's browser.
 */
export default async function handler(req, res) {
  try {
    const { username } = req.query;

    if (!username) {
      res.setHeader("Content-Type", "image/gif");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return res.status(200).send(TRANSPARENT_GIF);
    }

    // Read Vercel's geolocation headers
    const country = req.headers["x-vercel-ip-country"] || "XX";
    const city = req.headers["x-vercel-ip-city"] || "";

    // Record the visit asynchronously
    await recordVisit(username, country, city);

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    if (req.query.format === "json") {
      return res.status(200).json({ success: true, username, country, city });
    }

    // Return transparent 1x1 GIF
    res.setHeader("Content-Type", "image/gif");
    return res.status(200).send(TRANSPARENT_GIF);
  } catch (err) {
    // Even on error, return the GIF so the page doesn't break
    console.error("Track error:", err);
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).send(TRANSPARENT_GIF);
  }
}
