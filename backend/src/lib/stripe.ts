import Stripe from "stripe";
import { getEnv } from "./env.js";

const env = getEnv();

export const stripe: Stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-05-27.dahlia" as any,
});
