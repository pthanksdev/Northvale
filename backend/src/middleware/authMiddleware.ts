import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: typeof users.$inferSelect;
    }
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload || !payload.sub) {
    return next();
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub));
    if (user) {
      req.userId = user.id;
      req.user = user;
    }
  } catch (err) {
    console.error("Auth db error", err);
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.userId || !req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
