# ✂️ Snip — URL Shortener

A minimal, self-hosted URL shortener with click analytics and a modern dark UI.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- ⚡ **Instant shortening** — paste a URL, get a 7-character short link
- 📊 **Click tracking** — every redirect increments a counter
- 🎨 **Modern UI** — dark theme with Inter + JetBrains Mono, violet accents
- 🗄️ **Zero-config database** — SQLite, no external DB to install
- 🧪 **Tested** — 11 tests covering all API endpoints
- 📱 **Responsive** — works on mobile down to 320px

## Quick Start

```bash
# Clone the repo
git clone https://github.com/suyash-03/url-shortener.git
cd url-shortener

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

## API Reference

### Shorten a URL

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://example.com/very/long/path"}'
```

```json
{
  "shortCode": "y2dBLQo",
  "shortUrl": "http://localhost:3000/y2dBLQo",
  "originalUrl": "https://example.com/very/long/path"
}
```

### All Endpoints

| Method   | Endpoint              | Description                        |
| -------- | --------------------- | ---------------------------------- |
| `POST`   | `/api/shorten`        | Create short URL `{ "url": "…" }`  |
| `GET`    | `/api/urls`           | List all URLs with click counts    |
| `GET`    | `/api/urls/:code`     | Get stats for a specific URL       |
| `DELETE` | `/api/urls/:code`     | Delete a short URL                 |
| `GET`    | `/:code`              | Redirect to original URL           |

## Testing

```bash
npm test
```

Runs 11 tests covering creation, validation, redirect, click tracking, and deletion.

## Project Structure

```
├── src/
│   ├── index.js            # Server entry point
│   ├── app.js              # Express app & middleware
│   ├── db.js               # SQLite setup & prepared statements
│   └── routes/
│       ├── api.js          # REST API (CRUD)
│       └── redirect.js     # Short code redirect handler
├── public/
│   ├── index.html          # Single-page UI
│   ├── style.css           # Dark theme styles
│   └── script.js           # Client-side logic
├── tests/
│   └── api.test.js         # API test suite
└── data/                   # SQLite DB (gitignored)
```

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Runtime       | Node.js (ES Modules)                            |
| Framework     | Express.js                                      |
| Database      | SQLite via `better-sqlite3`                     |
| Short IDs     | `nanoid` (URL-safe, collision-resistant)         |
| Frontend      | Vanilla HTML/CSS/JS (no build step)             |
| Testing       | Vitest + Supertest                              |

## Deployment

> **Note:** This app requires a Node.js server (Express + SQLite). It **cannot** be deployed on static hosts like GitHub Pages.

### Recommended platforms

| Platform | Deploy |
|----------|--------|
| **[Railway](https://railway.app)** | One-click from GitHub |
| **[Render](https://render.com)** | Free tier available |
| **[Fly.io](https://fly.io)** | Edge deployment with persistent volumes |
| **[Vercel](https://vercel.com)** | Serverless (would need DB swap to Turso/Neon) |

## License

MIT
