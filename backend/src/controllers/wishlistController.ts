import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { wishlists, products } from "../db/schema.js";
import { and, eq, desc } from "drizzle-orm";

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        category: products.category,
        priceCents: products.priceCents,
        currency: products.currency,
        imageUrl: products.imageUrl,
        addedAt: wishlists.createdAt,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, req.userId))
      .orderBy(desc(wishlists.createdAt));

    res.json({ wishlist: rows });
  } catch (e) {
    next(e);
  }
}

export async function toggleWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Missing productId" });
    }

    const [existing] = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, req.userId),
          eq(wishlists.productId, productId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .delete(wishlists)
        .where(
          and(
            eq(wishlists.userId, req.userId),
            eq(wishlists.productId, productId)
          )
        );
      res.json({ status: "removed" });
    } else {
      await db.insert(wishlists).values({
        userId: req.userId,
        productId,
      });
      res.json({ status: "added" });
    }
  } catch (e) {
    next(e);
  }
}
