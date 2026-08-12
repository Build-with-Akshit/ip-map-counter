/**
 * GET /api/badge?username=XXX
 *
 * Renders a full-width (1200x54px) glowing background banner SVG image button
 * matching the main dashboard width for GitHub README embeds.
 */
export default function handler(req, res) {
  const username = req.query.username || "Build-with-Akshit";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="54" viewBox="0 0 1200 54" role="img" aria-label="Contribute View Banner">
    <defs>
      <linearGradient id="pillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0b2917"/>
        <stop offset="50%" stop-color="#124424"/>
        <stop offset="100%" stop-color="#0b2917"/>
      </linearGradient>

      <filter id="neonPulse" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800;900&amp;display=swap');
      .badge-text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 19px;
        font-weight: 700;
        fill: #f0f6fc;
      }
      .highlight {
        fill: #56d364;
        font-weight: 900;
        font-size: 21px;
        text-decoration: underline;
      }
    </style>

    <!-- Full-Width Background Banner Container -->
    <rect x="1" y="1" width="1198" height="52" rx="12" fill="url(#pillGradient)" stroke="#39d353" stroke-width="1.5"/>

    <!-- Centered Content Group -->
    <g transform="translate(600, 0)">
      <g transform="translate(-315, 0)">
        <circle cx="0" cy="27" r="11" fill="#39d353" opacity="0.35"/>
        <circle cx="0" cy="27" r="8.5" fill="none" stroke="#39d353" stroke-width="1.2"/>
        <circle cx="0" cy="27" r="5" fill="#39d353" filter="url(#neonPulse)"/>
        <text x="24" y="33" class="badge-text">
          👉 Please <tspan class="highlight">CLICK HERE</tspan> to contribute a view in my profile 🌐
        </text>
      </g>
    </g>
  </svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  return res.status(200).send(svg);
}
