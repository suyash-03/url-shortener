import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/api.js";
import redirectRoutes from "./routes/redirect.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Trust reverse proxy headers (Render, Railway, etc.)
app.set("trust proxy", true);

// --- Middleware ---
app.use(express.json());

// --- Static files (UI) ---
app.use(express.static(join(__dirname, "..", "public")));

// --- API routes ---
app.use("/api", apiRoutes);

// --- Redirect routes (must come after API and static) ---
app.use(redirectRoutes);

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
