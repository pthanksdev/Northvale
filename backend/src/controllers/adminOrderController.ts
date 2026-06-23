import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { orders, orderItems, products, users } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export async function listAllOrders(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await db
      .select({
        id: orders.id,
        status: orders.status,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userEmail: users.email,
        userDisplayName: users.displayName,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    res.json({ orders: rows });
  } catch (e) {
    next(e);
  }
}

export async function getOrderDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const idParsed = z.string().uuid().safeParse(req.params.id);
    if (!idParsed.success) {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }
    const id = idParsed.data;

    const [order] = await db
      .select({
        id: orders.id,
        status: orders.status,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userId: orders.userId,
        stripeSessionId: orders.stripeSessionId,
        stripePaymentIntentId: orders.stripePaymentIntentId,
        userEmail: users.email,
        userDisplayName: users.displayName,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const items = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        unitPriceCents: orderItems.unitPriceCents,
        productName: products.name,
        productSlug: products.slug,
        productImageUrl: products.imageUrl,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    res.json({ order, items });
  } catch (e) {
    next(e);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const idParsed = z.string().uuid().safeParse(req.params.id);
    if (!idParsed.success) {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }

    const schema = z.object({
      status: z.enum(["pending", "paid", "failed"]),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const [updated] = await db
      .update(orders)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(orders.id, idParsed.data))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({ order: updated });
  } catch (e) {
    next(e);
  }
}
