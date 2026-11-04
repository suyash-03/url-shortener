import { Router } from "express";
import { nanoid } from "nanoid";
import { stmts } from "../db.js";

const router = Router();

/**
 * POST /api/shorten
 * Body: { "url": "https://example.com/very/long/path" }
 * Returns: { "shortCode", "shortUrl", "originalUrl" }
 */
router.post("/shorten", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  const shortCode = nanoid(7);

  try {
    stmts.insert.run(shortCode, url);
  } catch (err) {
    // Extremely unlikely nanoid collision — retry once
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      const retry = nanoid(7);
      stmts.insert.run(retry, url);
      const baseUrl =
        process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      return res.status(201).json({
        shortCode: retry,
        shortUrl: `${baseUrl}/${retry}`,
        originalUrl: url,
      });
    }
    throw err;
  }

  const baseUrl =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  res.status(201).json({
    shortCode,
    shortUrl: `${baseUrl}/${shortCode}`,
    originalUrl: url,
  });
});

/**
 * GET /api/urls
 * Returns all shortened URLs with stats
 */
router.get("/urls", (_req, res) => {
  const urls = stmts.findAll.all();
  res.json(urls);
});

/**
 * GET /api/urls/:shortCode
 * Returns stats for a single short URL
 */
router.get("/urls/:shortCode", (req, res) => {
  const url = stmts.findByCode.get(req.params.shortCode);

  if (!url) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  res.json(url);
});

/**
 * DELETE /api/urls/:shortCode
 * Deletes a short URL
 */
router.delete("/urls/:shortCode", (req, res) => {
  const result = stmts.deleteByCode.run(req.params.shortCode);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  res.status(204).end();
});

export default router;
