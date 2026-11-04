# 🔗 URL Shortener

A minimal, self-hosted URL shortener built with Node.js, Express, and SQLite.

## Features

- **Shorten URLs** — Generate compact 7-character short links
- **Click tracking** — Every redirect increments a counter
- **REST API** — Full CRUD for managing short URLs
- **Web UI** — Clean, dark-themed single-page interface
- **Zero config DB** — SQLite, no external database needed

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API

| Method   | Endpoint              | Description                        |
| -------- | --------------------- | ---------------------------------- |
| `POST`   | `/api/shorten`        | Create short URL `{ "url": "…" }` |
| `GET`    | `/api/urls`           | List all URLs                      |
| `GET`    | `/api/urls/:code`     | Get stats for a URL                |
| `DELETE` | `/api/urls/:code`     | Delete a short URL                 |
| `GET`    | `/:code`              | Redirect to original URL           |

## Testing

```bash
npm test
```

## Tech Stack

- **Express** — HTTP server
- **better-sqlite3** — Embedded database
- **nanoid** — Short ID generation
- **Vitest + Supertest** — Testing

## License

MIT
