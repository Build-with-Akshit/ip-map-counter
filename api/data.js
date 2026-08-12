import { getAnalytics } from "../src/analytics.js";

/**
 * GET /api/data?username=XXX
 *
 * Returns raw JSON analytics data for a username.
 * Used by the interactive web application frontend.
 */
export default async function handler(req, res) {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Missing 'username' query parameter" });
    }

    const data = await getAnalytics(username);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

    return res.status(200).json(data);
  } catch (err) {
    console.error("Data API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
