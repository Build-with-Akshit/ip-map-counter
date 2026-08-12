export default function handler(req, res) {
  const username = req.query.username || "Build-with-Akshit";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="42" viewBox="0 0 480 42" role="img" aria-label="Contribute View Badge">
    <defs>
      <filter id="neonPulse" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800;900&amp;display=swap');
      .badge-text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 12.5px;
        font-weight: 600;
        fill: #f0f6fc;
      }
      .highlight {
        fill: #39d353;
        font-weight: 800;
        text-decoration: underline;
      }
    </style>

    <!-- Background Color Update ONLY (#0d2818 dark card with #2ea043 border) -->
    <rect x="1" y="1" width="478" height="40" rx="10" fill="#0d2818" stroke="#2ea043" stroke-width="1.2"/>

    <!-- Left Pulsing Green Icon Badge -->
    <g transform="translate(14,12)">
      <circle cx="8" cy="8" r="7" fill="#0e4429" stroke="#238636" stroke-width="1"/>
      <circle cx="8" cy="8" r="3.5" fill="#39d353" filter="url(#neonPulse)"/>
    </g>

    <!-- Text content -->
    <text x="38" y="25" class="badge-text">
      👉 Please <tspan class="highlight">CLICK HERE</tspan> to contribute a view in my profile 🌐
    </text>
  </svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  return res.status(200).send(svg);
}
