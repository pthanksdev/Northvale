import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const conditions = [eq(products.active, true)];

    if (cat) {
      conditions.push(eq(products.category, cat));
    }

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )!
      );
    }

    const rows = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));

    res.json({ products: rows });
  } catch (e) {
    next(e);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await db
      .select({ category: products.category })
      .from(products)
      .where(eq(products.active, true));

    const categories = [...new Set(rows.map((r) => r.category))].sort((a, b) => a.localeCompare(b));

    res.json({ categories });
  } catch (e) {
    next(e);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.slug, req.params.slug as string))
      .limit(1);

    if (!row || !row.active) return res.status(404).json({ error: "Not found" });

    res.json({ product: row });
  } catch (e) {
    next(e);
  }
}
