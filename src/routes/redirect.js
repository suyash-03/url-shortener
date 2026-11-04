import { Router } from "express";
import { stmts } from "../db.js";

const router = Router();

/**
 * GET /:shortCode
 * Redirects to the original URL and increments the click counter
 */
router.get("/:shortCode", (req, res) => {
  const { shortCode } = req.params;

  const url = stmts.findByCode.get(shortCode);

  if (!url) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  // Increment click count
  stmts.incrementClicks.run(shortCode);

  res.redirect(301, url.original_url);
});

export default router;
