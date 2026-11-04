import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("URL Shortener API", () => {
  let createdCode;

  describe("POST /api/shorten", () => {
    it("should create a short URL", async () => {
      const res = await request(app)
        .post("/api/shorten")
        .send({ url: "https://example.com/some/long/path" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("shortCode");
      expect(res.body).toHaveProperty("shortUrl");
      expect(res.body.originalUrl).toBe("https://example.com/some/long/path");

      createdCode = res.body.shortCode;
    });

    it("should reject missing URL", async () => {
      const res = await request(app).post("/api/shorten").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/i);
    });

    it("should reject invalid URL format", async () => {
      const res = await request(app)
        .post("/api/shorten")
        .send({ url: "not-a-url" });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid/i);
    });
  });

  describe("GET /api/urls", () => {
    it("should return a list of URLs", async () => {
      const res = await request(app).get("/api/urls");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /api/urls/:shortCode", () => {
    it("should return stats for a short URL", async () => {
      const res = await request(app).get(`/api/urls/${createdCode}`);
      expect(res.status).toBe(200);
      expect(res.body.short_code).toBe(createdCode);
      expect(res.body.clicks).toBe(0);
    });

    it("should 404 for unknown code", async () => {
      const res = await request(app).get("/api/urls/ZZZZZZZ");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /:shortCode (redirect)", () => {
    it("should redirect to the original URL", async () => {
      const res = await request(app).get(`/${createdCode}`);
      expect(res.status).toBe(301);
      expect(res.headers.location).toBe(
        "https://example.com/some/long/path"
      );
    });

    it("should increment click count", async () => {
      const stats = await request(app).get(`/api/urls/${createdCode}`);
      expect(stats.body.clicks).toBe(1);
    });

    it("should 404 for unknown code", async () => {
      const res = await request(app).get("/ZZZZZZZ");
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/urls/:shortCode", () => {
    it("should delete a short URL", async () => {
      const res = await request(app).delete(`/api/urls/${createdCode}`);
      expect(res.status).toBe(204);
    });

    it("should 404 after deletion", async () => {
      const res = await request(app).get(`/api/urls/${createdCode}`);
      expect(res.status).toBe(404);
    });
  });
});
