import { getRedis } from "./redis.js";

/**
 * Key prefix helper for per-user analytics.
 */
function key(username, suffix) {
  return `analytics:${username}:${suffix}`;
}

/**
 * Get today's date string in YYYY-MM-DD format (UTC).
 */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Record a single visit for a username.
 * Called by the /api/track endpoint.
 *
 * @param {string} username - GitHub username
 * @param {string} country  - ISO 3166-1 alpha-2 country code (from Vercel header)
 * @param {string} city     - City name (from Vercel header)
 */
export async function recordVisit(username, country, city) {
  const redis = getRedis();
  const today = todayStr();
  const cityKey = city && country ? `${city}, ${country}` : city || "Unknown";
  const countryCode = country || "XX";

  // Use a pipeline for efficiency (all commands in one round-trip)
  const pipe = redis.pipeline();

  // 1. Increment total views
  pipe.incr(key(username, "total_views"));

  // 2. Increment page views (we count page views same as total for now)
  pipe.incr(key(username, "page_views"));

  // 3. Increment country count in sorted set
  pipe.zincrby(key(username, "countries"), 1, countryCode);

  // 4. Increment city count in sorted set
  if (cityKey !== "Unknown") {
    pipe.zincrby(key(username, "cities"), 1, cityKey);
  }

  // 5. Increment today's daily count
  pipe.incr(key(username, `daily:${today}`));

  // 6. Add today to the set of active days
  pipe.sadd(key(username, "active_days"), today);

  // 7. Track unique countries
  pipe.sadd(key(username, "unique_countries"), countryCode);

  // 8. Track unique cities
  if (cityKey !== "Unknown") {
    pipe.sadd(key(username, "unique_cities"), cityKey);
  }

  // 9. Set first_seen if not already set
  pipe.setnx(key(username, "first_seen"), today);

  await pipe.exec();

  // Update highest daily record (needs read-then-write, done separately)
  await updateHighestDaily(username, today);
}

/**
 * Check if today's count exceeds the highest daily record and update if so.
 */
async function updateHighestDaily(username, today) {
  const redis = getRedis();
  const todayCount = (await redis.get(key(username, `daily:${today}`))) || 0;
  const currentHighest = await redis.get(key(username, "highest_daily"));

  let highestCount = 0;
  if (currentHighest) {
    highestCount = parseInt(currentHighest.split("|")[0], 10) || 0;
  }

  if (parseInt(todayCount, 10) > highestCount) {
    await redis.set(key(username, "highest_daily"), `${todayCount}|${today}`);
  }
}

/**
 * Fetch all analytics data for a username.
 * Called by the /api/dashboard and /api/data endpoints.
 *
 * OPTIMIZED: Uses 1 pipeline with MGET for 365 days of history,
 * reducing Redis command overhead from ~370 commands down to ~10 commands per request!
 *
 * @param {string} username - GitHub username
 * @returns {object} Complete analytics object for SVG rendering
 */
export async function getAnalytics(username) {
  const redis = getRedis();
  const today = todayStr();

  // Generate date keys for the past 12 months (~365 days)
  const dateObj = new Date();
  const startDate = new Date(dateObj);
  startDate.setMonth(startDate.getMonth() - 12);

  const dateKeys = [];
  const dateStrings = [];
  const current = new Date(startDate);
  while (current <= dateObj) {
    const dateStr = current.toISOString().slice(0, 10);
    dateStrings.push(dateStr);
    dateKeys.push(key(username, `daily:${dateStr}`));
    current.setDate(current.getDate() + 1);
  }

  // Single pipeline round-trip for ALL metrics
  const pipe = redis.pipeline();
  pipe.get(key(username, "total_views"));                                        // 0
  pipe.get(key(username, "page_views"));                                         // 1
  pipe.get(key(username, "first_seen"));                                         // 2
  pipe.get(key(username, "highest_daily"));                                     // 3
  pipe.zrange(key(username, "countries"), 0, 9, { rev: true, withScores: true }); // 4
  pipe.zrange(key(username, "cities"), 0, 4, { rev: true, withScores: true });    // 5
  pipe.scard(key(username, "unique_countries"));                                 // 6
  pipe.scard(key(username, "unique_cities"));                                    // 7
  pipe.zrange(key(username, "countries"), 0, -1, { rev: true, withScores: true });// 8
  if (dateKeys.length > 0) {
    pipe.mget(...dateKeys);                                                      // 9 (1 MGET command for 365 days)
  }

  const results = await pipe.exec();

  const totalViews = results[0];
  const pageViews = results[1];
  const firstSeen = results[2];
  const highestDaily = results[3];
  const topCountries = results[4] || [];
  const topCities = results[5] || [];
  const uniqueCountries = results[6] || 0;
  const uniqueCities = results[7] || 0;
  const allCountries = results[8] || [];
  const rawDailyCounts = dateKeys.length > 0 ? (results[9] || []) : [];

  // Build dailyHistory and index counts by date in-memory
  const dailyHistory = [];
  const countByDate = {};
  for (let i = 0; i < dateStrings.length; i++) {
    const dateStr = dateStrings[i];
    const cnt = parseInt(rawDailyCounts[i], 10) || 0;
    dailyHistory.push({ date: dateStr, count: cnt });
    countByDate[dateStr] = cnt;
  }

  // Calculate consecutive streak in-memory (0 extra Redis calls)
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(dateObj);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = countByDate[dateStr] || 0;
    if (count > 0) {
      streak++;
    } else {
      break;
    }
  }

  const todayViews = countByDate[today] || 0;

  // Parse highest daily
  let highestDailyCount = 0;
  let highestDailyDate = "";
  if (highestDaily) {
    const parts = highestDaily.split("|");
    highestDailyCount = parseInt(parts[0], 10) || 0;
    highestDailyDate = parts[1] || "";
  }

  // Parse countries into a cleaner format
  const countries = [];
  for (let i = 0; i < topCountries.length; i += 2) {
    countries.push({
      code: topCountries[i],
      count: parseInt(topCountries[i + 1], 10) || 0,
    });
  }

  const cities = [];
  for (let i = 0; i < topCities.length; i += 2) {
    cities.push({
      name: topCities[i],
      count: parseInt(topCities[i + 1], 10) || 0,
    });
  }

  // All countries for map coloring
  const countryMap = {};
  for (let i = 0; i < allCountries.length; i += 2) {
    countryMap[allCountries[i]] = parseInt(allCountries[i + 1], 10) || 0;
  }

  return {
    totalViews: parseInt(totalViews, 10) || 0,
    pageViews: parseInt(pageViews, 10) || 0,
    firstSeen: firstSeen || today,
    streak,
    todayViews: parseInt(todayViews, 10) || 0,
    highestDailyCount,
    highestDailyDate,
    topCountries: countries,
    topCities: cities,
    uniqueCountries: uniqueCountries || 0,
    uniqueCities: uniqueCities || 0,
    countryMap,
    dailyHistory,
  };
}
