# 🌍 IP Map Counter

> A beautiful, GitHub-dark-themed SVG analytics dashboard that tracks visitor locations for your GitHub README or website.

![Dashboard Preview](https://img.shields.io/badge/Status-Beta-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

- 📊 **Real-time visitor analytics** — Total views, page views, streaks, and daily records
- 🗺️ **World map visualization** — See exactly which countries your visitors come from
- 🏙️ **Top cities tracking** — Know your audience at the city level
- 📈 **GitHub-style contribution heatmap** — Visitors over time, just like GitHub's contribution graph
- 🌙 **Pure GitHub dark theme** — Matches perfectly with dark-mode READMEs
- ⚡ **Serverless** — Runs on Vercel with Upstash Redis, zero maintenance
- 🔓 **Open for everyone** — Any GitHub user can use this API

## 🚀 Quick Start — Use the Public API

Add this **1-click linked dashboard** to your GitHub README:

```markdown
👉 Please [**click here**](https://ip-map-counter.vercel.app/?username=YOUR_GITHUB_USERNAME) to contribute a view in my profile.

[![Website Analytics](https://ip-map-counter.vercel.app/api/dashboard?username=YOUR_GITHUB_USERNAME)](https://ip-map-counter.vercel.app/?username=YOUR_GITHUB_USERNAME)
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

> 💡 **How it works:** When someone clicks the dashboard image on your GitHub README, it opens the live interactive Web Application (`https://ip-map-counter.vercel.app/?username=YOUR_GITHUB_USERNAME`), triggers IP tracking in real-time, and lets them interactively view `World`, `Countries`, and `Cities` breakdowns!

> **Note:** Replace `ip-map-counter.vercel.app` with your own deployment URL if you're self-hosting.

## 📸 How It Works

```
Your README / Website
        │
        ├── <img> loads tracking pixel (/api/track)
        │         → Vercel reads visitor's IP location
        │         → Stores country + city in Redis
        │         → Returns invisible 1x1 GIF
        │
        └── <img> loads dashboard (/api/dashboard)
                  → Fetches all stats from Redis
                  → Generates beautiful SVG
                  → Returns the dashboard image
```

## ⚠️ IP Accuracy Note

| Embedding Location | IP Accuracy |
|---|---|
| **Your own website / GitHub Pages** | ✅ **Real visitor IP** — accurate country & city |
| **GitHub README** | ⚠️ **GitHub Camo proxy IP** — may show as US |

GitHub routes all README images through its Camo proxy servers (US-based). This means views from GitHub README will often register as "United States". **For accurate location tracking, embed the tracking pixel on your own website or GitHub Pages site.**

## 🛠️ Self-Hosting Guide

### Prerequisites

- A [Vercel](https://vercel.com) account (free)
- An [Upstash](https://upstash.com) account (free)

### Step 1: Fork & Clone

```bash
git clone https://github.com/Build-with-Akshit/ip-map-counter.git
cd ip-map-counter
npm install
```

### Step 2: Create Upstash Redis Database

1. Go to [upstash.com](https://upstash.com) → Sign up / Log in
2. Click **Create Database**
3. Choose a name (e.g., `ip-map-counter`)
4. Select a region close to your Vercel deployment
5. Copy these two values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 3: Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Follow the prompts to link your project.

### Step 4: Add Environment Variables

Go to your Vercel project → **Settings** → **Environment Variables** and add:

| Variable | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Your Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash REST token |

### Step 5: Redeploy

```bash
vercel --prod
```

### Step 6: Test

Open in your browser:
```
https://your-project.vercel.app/api/dashboard?username=your-username
```

You should see a beautiful dark-themed analytics dashboard! 🎉

## 📡 API Endpoints

### `GET /api/track`

Records a visitor and returns a 1x1 transparent GIF.

| Parameter | Required | Description |
|---|---|---|
| `username` | Yes | The GitHub username to track |

**Response:** 1x1 transparent GIF (43 bytes)

### `GET /api/dashboard`

Returns a dynamically generated SVG analytics dashboard.

| Parameter | Required | Description |
|---|---|---|
| `username` | Yes | The GitHub username to display stats for |

**Response:** SVG image (1200×820)

## 🎨 Design

The dashboard follows the **GitHub Dark theme** precisely:

| Element | Color |
|---|---|
| Background | `#0d1117` |
| Cards | `#161b22` |
| Borders | `#30363d` |
| Green accent | `#39d353` |
| Text | `#f0f6fc` |
| Muted text | `#8b949e` |

## 📄 License

MIT License — feel free to use, modify, and share.

## 🤝 Contributing

PRs welcome! If you have ideas for new features or improvements, open an issue first.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Build-with-Akshit">Build-with-Akshit</a>
</p>
