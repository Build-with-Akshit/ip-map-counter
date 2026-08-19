# 🌍 IP Map Counter

> Real-time visitor location map & analytics dashboard for your GitHub README, portfolio, or website.

[![Contribute View](https://ip-map-counter.vercel.app/api/badge?username=Build-with-Akshit)](https://ip-map-counter.vercel.app/?username=Build-with-Akshit)
[![Website Analytics](https://ip-map-counter.vercel.app/api/dashboard?username=Build-with-Akshit)](https://ip-map-counter.vercel.app/?username=Build-with-Akshit)

## ✨ Features
- 📊 **Real-time visitor analytics** — Total views, page views, streaks, and daily records
- 🗺️ **World map visualization** — See exactly which countries your visitors come from
- 🏙️ **Top cities tracking** — Know your audience at the city level
- 📈 **GitHub-style contribution heatmap** — Visitors over time, just like GitHub's contribution graph
- 🌙 **Pure GitHub dark theme** — Matches perfectly with dark-mode READMEs
- ⚡ **Serverless** — Runs on Vercel with Upstash Redis, zero maintenance
- 🔓 **Open for everyone** — Any GitHub user can use this API

---

## 🚀 Quick Start

Add to your **GitHub Profile `README.md`** or project markdown (replace `YOUR_GITHUB_USERNAME` with your username):

### 1. Full Analytics Dashboard (Recommended)

```markdown
[![Visitor Analytics](https://ip-map-counter.vercel.app/api/dashboard?username=YOUR_GITHUB_USERNAME)](https://ip-map-counter.vercel.app/?username=YOUR_GITHUB_USERNAME)
```

### 2. Compact Glowing Badge

```markdown
[![Contribute View](https://ip-map-counter.vercel.app/api/badge?username=YOUR_GITHUB_USERNAME)](https://ip-map-counter.vercel.app/?username=YOUR_GITHUB_USERNAME)
```

### 3. Website / Portfolio Tracking

```html
<!-- Invisible tracking pixel for your website/blog -->
<img src="https://ip-map-counter.vercel.app/api/track?username=YOUR_GITHUB_USERNAME" alt="" style="display:none;" />
```

```javascript
// Or track via JavaScript
fetch('https://ip-map-counter.vercel.app/api/track?username=YOUR_GITHUB_USERNAME&format=json');
```

---

## 📡 API Endpoints

| Endpoint | Output | Usage |
|---|---|---|
| `/api/dashboard?username=YOUR_USERNAME` | Dynamic SVG Dashboard | Embed in Markdown / HTML |
| `/api/badge?username=YOUR_USERNAME` | Glowing Button SVG | Embed as CTA button in README |
| `/api/track?username=YOUR_USERNAME` | 1×1 GIF / JSON | Track website & portfolio visits |
| `/api/data?username=YOUR_USERNAME` | Raw JSON | Build custom analytics UIs |

---

## 🛠️ Self-Hosting (Optional)

Deploy your own instance for free with **Vercel** + **Upstash Redis**:

1. **Clone repo**:
   ```bash
   git clone https://github.com/Build-with-Akshit/ip-map-counter.git
   cd ip-map-counter && npm install
   ```
2. **Create free Redis DB** on [Upstash](https://upstash.com) and copy `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`.
3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```
   Add the 2 environment variables in **Vercel Settings → Environment Variables**.

---

## 📄 License

[MIT](LICENSE) © [Build-with-Akshit](https://github.com/Build-with-Akshit)
