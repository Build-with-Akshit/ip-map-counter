# Build Dynamic Analytics Dashboard API

This plan outlines the architecture and steps required to build a custom, dynamic SVG generator that creates a "Website Analytics" dashboard (similar to the provided screenshot) for your GitHub README, integrated directly into your `github-readme-stats` codebase.

## User Review Required

> [!WARNING]
> **GitHub Camo Limitation:** GitHub routes all README images through its own US-based proxy servers (Camo). As a result, when someone views your README, the Vercel API will likely see GitHub's IP address (US), not the visitor's real IP. This means your location map might predominantly show the United States unless the dashboard is used on a personal website without an image proxy.

> [!IMPORTANT]
> **Database Provisioning:** Vercel functions are stateless. To keep track of visitor counts, streaks, and locations over time, **we need a database**. We will use **Vercel KV (Redis)** because it's fast and easy to integrate, but you must provision it in your Vercel project dashboard.

## Open Questions

> [!CAUTION]
> 1. **Database setup:** Are you okay with setting up a free Vercel KV (Redis) database for this project to store the visitor counts? 
> 2. **SVG Map Complexity:** Rendering a highly detailed map with dots precisely placed via longitude/latitude inside raw SVG without frontend libraries is extremely complex. Are you okay with a slightly simplified map visualization (e.g., highlighting the entire country in green instead of glowing dots)?
> 3. **Proxy Issue:** Do you accept the GitHub Camo limitation mentioned above, or is this primarily for your personal website?

## Proposed Changes

We will introduce a new API endpoint, a new database fetcher, and a massive new SVG card renderer.

---

### Database Integration (Vercel KV)

We need to add `@vercel/kv` to track views per country/city and daily streaks.

#### [NEW] `src/fetchers/analytics.js`
- Connects to Vercel KV.
- Exposes `incrementAndGetAnalytics(req)`:
  - Reads `x-vercel-ip-country`, `x-vercel-ip-city`, and `x-forwarded-for` headers.
  - Increments total views.
  - Increments today's date for the streak/history chart.
  - Increments country and city tallies.
  - Returns the aggregated stats object.

#### [MODIFY] `package.json`
- Add `@vercel/kv` dependency.

---

### SVG Generation

This is the core visual component. We will build a complex, multi-panel SVG layout that matches the "pure GitHub dark theme" aesthetic.

#### [NEW] `src/cards/analytics-dashboard.js`
- Create `renderAnalyticsDashboard(stats, options)` function.
- **Layout:** Defines a large SVG viewBox (e.g., 1200x800).
- **Top Row:** 4 stat cards (Total Visitors, Page Views, Streak, Highest Daily) using `<rect>` and `<text>`.
- **Middle Row (Map & Top Countries):**
  - Embeds a base64-encoded SVG path of the world map.
  - Calculates and overlays colored regions based on the top countries from the DB.
  - Renders horizontal bar charts for Top Countries.
- **Bottom Row (Top Cities, Over Time, Quick Stats):**
  - Renders the activity graph (like GitHub's contribution graph) for "Visitors Over Time".
  - Renders horizontal bar charts for Top Cities.

---

### API Endpoint

The entry point that Vercel will trigger when the image is requested.

#### [NEW] `api/analytics.js`
- Receives the request.
- Calls `incrementAndGetAnalytics(req)` to update and fetch stats.
- Passes the stats to `renderAnalyticsDashboard()`.
- Sets `Cache-Control: no-store, max-age=0` to ensure the view count always updates (Note: GitHub Camo might still cache aggressively, we will try to bypass with standard headers).
- Returns the SVG with `Content-Type: image/svg+xml`.

#### [MODIFY] `README.md`
- Remove the Flag Counter snippet.
- Add the new endpoint: `![](https://build-with-akshit-beta.vercel.app/api/analytics)` (with a cache-busting query param).

## Verification Plan

### Automated Tests
- No automated tests for the SVG layout, but we can write unit tests for the KV increment logic (mocking the DB).

### Manual Verification
1. Run the local development server (if KV env vars are provided).
2. Visit `/api/analytics` in the browser and verify the SVG renders perfectly with the dark theme and dummy data.
3. You will need to deploy to Vercel and verify if it correctly tracks your visits.
