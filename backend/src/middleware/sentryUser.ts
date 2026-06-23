import type { RequestHandler } from "express";
import * as Sentry from "@sentry/node";

/** attach user id to the request isolation scope so errors include who was signed in */
export const sentryUserMiddleware: RequestHandler = (req, _res, next) => {
  const userId = req.userId;
  Sentry.getIsolationScope().setUser(userId ? { id: userId } : null);
  next();
};
