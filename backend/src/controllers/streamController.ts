import type { Request, Response, NextFunction } from "express";
import { getStreamChatServer, streamChatDisplayName, streamUserId } from "../lib/stream.js";
import { getEnv } from "../lib/env.js";

const env = getEnv();

export async function createStreamToken(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId || !req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const localUser = req.user;
    const server = getStreamChatServer(env);

    const name = streamChatDisplayName(
      localUser.role,
      localUser.displayName,
      localUser.email,
    );

    const image = localUser.avatarUrl || undefined;
    const sid = streamUserId(localUser.id);

    await server.upsertUser({ id: sid, name, image });

    const token = server.createToken(sid);

    res.json({ token, apiKey: env.STREAM_API_KEY, userId: sid, name });
  } catch (e) {
    next(e);
  }
}
