import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { orders, orderItems, products, users } from "../db/schema.js";
import { count, sum, eq, desc, sql } from "drizzle-orm";

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [orderStats] = await db
      .select({
        totalOrders: count(),
        totalRevenue: sum(orders.totalCents),
      })
      .from(orders);

    const [productStats] = await db
      .select({
        totalProducts: count(),
      })
      .from(products);

    const [userStats] = await db
      .select({
        totalUsers: count(),
      })
      .from(users);

    const recentOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt,
        userEmail: users.email,
        userDisplayName: users.displayName,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    res.json({
      stats: {
        totalOrders: Number(orderStats.totalOrders),
        totalRevenue: Number(orderStats.totalRevenue ?? 0),
        totalProducts: Number(productStats.totalProducts),
        totalUsers: Number(userStats.totalUsers),
      },
      recentOrders,
    });
  } catch (e) {
    next(e);
  }
}
