# Top 5 News Headlines

Simple static web app that displays the top 5 headlines from Google News RSS and updates once per day.

How it works
- Fetches the Google News RSS feed via the AllOrigins CORS proxy.
- Parses the XML in-browser and shows the first 5 items.
- Caches results in `localStorage` keyed by date so it only fetches once per day.
- Schedules the next update for the next local midnight.

Files
- [top-news/index.html](top-news/index.html)
- [top-news/script.js](top-news/script.js)
- [top-news/style.css](top-news/style.css)

Run locally
1. Serve the repo folder (example):

```bash
cd top-news
python3 -m http.server 8000
# then open http://localhost:8000
```

Notes & alternatives
- If you prefer another source, change `FEED_URL` in `script.js` to another RSS URL (for example a country-specific Google News RSS: `https://news.google.com/rss?hl=fr-FR&gl=FR&ceid=FR:fr`).
- If AllOrigins is unavailable, you can host a tiny server-side proxy or use a news API (e.g. NewsAPI) — those typically require an API key and server-side calls.
