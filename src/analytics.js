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
 * Calculate the current consecutive-day visit streak.
 */
async function calculateStreak(username) {
  const redis = getRedis();
  const today = new Date();
  let streak = 0;

  // Check backwards from today
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = await redis.get(key(username, `daily:${dateStr}`));
    if (count && parseInt(count, 10) > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get daily visit data for the past N months (for the heatmap/timeline).
 * Returns an array of { date, count } objects.
 */
async function getDailyHistory(username, months = 12) {
  const redis = getRedis();
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);

  const days = [];
  const pipe = redis.pipeline();
  const dateKeys = [];

  const current = new Date(startDate);
  while (current <= today) {
    const dateStr = current.toISOString().slice(0, 10);
    dateKeys.push(dateStr);
    pipe.get(key(username, `daily:${dateStr}`));
    current.setDate(current.getDate() + 1);
  }

  const results = await pipe.exec();

  for (let i = 0; i < dateKeys.length; i++) {
    days.push({
      date: dateKeys[i],
      count: parseInt(results[i], 10) || 0,
    });
  }

  return days;
}

/**
 * Fetch all analytics data for a username.
 * Called by the /api/dashboard endpoint.
 *
 * @param {string} username - GitHub username
 * @returns {object} Complete analytics object for SVG rendering
 */
export async function getAnalytics(username) {
  const redis = getRedis();

  // Fetch core metrics
  const [totalViews, pageViews, firstSeen, highestDaily] = await Promise.all([
    redis.get(key(username, "total_views")),
    redis.get(key(username, "page_views")),
    redis.get(key(username, "first_seen")),
    redis.get(key(username, "highest_daily")),
  ]);

  // Fetch top countries (sorted set, descending)
  const topCountries = await redis.zrange(key(username, "countries"), 0, 9, {
    rev: true,
    withScores: true,
  });

  // Fetch top cities (sorted set, descending)
  const topCities = await redis.zrange(key(username, "cities"), 0, 4, {
    rev: true,
    withScores: true,
  });

  // Fetch unique counts
  const [uniqueCountries, uniqueCities] = await Promise.all([
    redis.scard(key(username, "unique_countries")),
    redis.scard(key(username, "unique_cities")),
  ]);

  // Fetch all country codes for the map highlighting
  const allCountries = await redis.zrange(key(username, "countries"), 0, -1, {
    rev: true,
    withScores: true,
  });

  // Calculate streak
  const streak = await calculateStreak(username);

  // Get daily history for the heatmap
  const dailyHistory = await getDailyHistory(username, 12);

  // Get today's views
  const today = todayStr();
  const todayViews =
    (await redis.get(key(username, `daily:${today}`))) || 0;

  // Parse highest daily
  let highestDailyCount = 0;
  let highestDailyDate = "";
  if (highestDaily) {
    const parts = highestDaily.split("|");
    highestDailyCount = parseInt(parts[0], 10) || 0;
    highestDailyDate = parts[1] || "";
  }

  // Parse countries into a cleaner format
  // topCountries from zrange with withScores returns [member, score, member, score, ...]
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
