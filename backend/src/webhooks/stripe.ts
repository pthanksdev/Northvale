import type { Request, Response } from "express";
import { getEnv } from "../lib/env.js";
import { stripe } from "../lib/stripe.js";
import { db } from "../db/index.js";
import { checkoutSessions, orderItems, orders } from "../db/schema.js";
import { eq } from "drizzle-orm";

const env = getEnv();

async function alreadyPaid(paymentIntentId?: string, checkoutId?: string) {
  if (paymentIntentId) {
    const existingByOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .limit(1);
    if (existingByOrder.length > 0) return true;
  }

  if (checkoutId) {
    const existingByCheckout = await db
      .select()
      .from(orders)
      .where(eq(orders.stripeSessionId, checkoutId))
      .limit(1);
    if (existingByCheckout.length > 0) return true;
  }
  return false;
}

async function fulfillCheckoutSession(
  sessionId: string,
  paymentIntentId: string | undefined,
  checkoutId: string
) {
  const [session] = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.id, sessionId))
    .limit(1);

  if (!session) {
    console.error("No checkout session found for id", sessionId);
    return false;
  }

  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        userId: session.userId,
        status: "paid",
        totalCents: session.totalCents,
        stripeSessionId: checkoutId,
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
      })
      .returning();

    if (session.lines.length > 0) {
      await tx.insert(orderItems).values(
        session.lines.map((line) => ({
          orderId: order.id,
          productId: line.productId,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
        }))
      );
    }
  });

  return true;
}

export async function stripeWebhookHandler(req: Request, res: Response) {
  try {
    const sig = req.headers["stripe-signature"];

    if (!env.STRIPE_WEBHOOK_SECRET) {
      res.status(503).send("Stripe webhooks not configured");
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body, // Assuming express.raw() has preserved the raw body
        sig as string,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed.`, err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      
      const sessionId = session.metadata?.checkout_session_id;
      const checkoutId = session.id;
      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : undefined;

      if (!sessionId) {
        console.error("Missing checkout_session_id metadata on stripe session", session.id);
        res.status(400).send("Missing metadata");
        return;
      }

      if (await alreadyPaid(paymentIntentId, checkoutId)) {
        res.json({ ok: true, note: "Already processed" });
        return;
      }

      try {
        const ok = await fulfillCheckoutSession(sessionId, paymentIntentId, checkoutId);
        if (!ok) {
          res.status(404).send("Checkout session not found in DB");
          return;
        }

        // Check again to avoid race conditions
        if (await alreadyPaid(paymentIntentId, checkoutId)) {
          console.log("Fulfillment succeeded.");
        } else {
          console.error("Order.paid failed transaction silently?");
        }
      } catch (err) {
        console.error("Stripe order.paid: could not fulfill checkout session", {
          checkoutId,
          paymentIntentId,
          err,
        });
        res.status(500).send("Internal fulfillment error");
        return;
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Stripe webhook error", err);
    res.status(500).json({ error: "Internal error processing webhook" });
  }
}
