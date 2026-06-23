import "dotenv/config";
import express from "express";
import cors from "cors";

import fs from "node:fs";
import path from "node:path";

import * as Sentry from "@sentry/node";
import helmet from "helmet";
import morgan from "morgan";

import { getEnv } from "./lib/env.js";
import keepAliveCron from "./lib/cron.js";

import productRouter from "./routes/productRouter.js";
import streamRouter from "./routes/streamRouter.js";
import chekoutRouter from "./routes/chekoutRouter.js";
import adminRouter from "./routes/adminRouter.js";
import orderRouter from "./routes/orderRouter.js";
import { authRouter } from "./routes/authRouter.js";
import wishlistRouter from "./routes/wishlistRouter.js";

import { stripeWebhookHandler } from "./webhooks/stripe.js";
import { optionalAuth } from "./middleware/authMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { pool } from "./db/index.js";

import { sentryUserMiddleware } from "./middleware/sentryUser.js";

const env = getEnv();
const app = express();

const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.use(helmet());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// it's important that you don't parse the webhook event data, it should be in the raw format
app.post("/webhooks/stripe", rawJson, (req, res) => {
  void stripeWebhookHandler(req, res);
});

app.use(express.json());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(optionalAuth);
app.use(sentryUserMiddleware);
app.use("/api", apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);
app.use("/api/checkout", chekoutRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);
app.use("/api/wishlist", wishlistRouter);

const publicDir = path.join(process.cwd(), "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    if (req.path.startsWith("/api") || req.path.startsWith("/webhooks")) {
      next();
      return;
    }

    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

// sentry will be attached to the response object
Sentry.setupExpressErrorHandler(app);

app.use(
  (_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const sentryId = (res as express.Response & { sentry?: string }).sentry;

    res.status(500).json({
      error: "Internal server error",
      ...(sentryId !== undefined && { sentryId }),
    });
  },
);

const server = app.listen(env.PORT, () => {
  console.log("Listening on port:", env.PORT);
  if (env.NODE_ENV === "production") {
    keepAliveCron.start();
  }
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close();
  await pool.end(); // close DB connections
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close();
  await pool.end(); // close DB connections
  process.exit(0);
});
