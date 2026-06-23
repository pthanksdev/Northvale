import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { users, otpCodes } from "../db/schema.js";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword, verifyPassword, signToken, generateOtp } from "../lib/auth.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/email.js";
import { getEnv } from "../lib/env.js";
import { OAuth2Client } from "google-auth-library";

const env = getEnv();
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkLockout(email: string) {
  const attempt = loginAttempts.get(email);
  if (!attempt) return false;
  if (attempt.lockedUntil > Date.now()) return true;
  if (attempt.lockedUntil <= Date.now()) {
    loginAttempts.delete(email);
  }
  return false;
}

function recordFailedLogin(email: string) {
  const attempt = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= 5) {
    attempt.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins
  }
  loginAttempts.set(email, attempt);
}

function clearLoginAttempts(email: string) {
  loginAttempts.delete(email);
}

export async function register(req: Request, res: Response) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(2).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, password, displayName } = parsed.data;

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
        displayName: displayName || email.split("@")[0],
      })
      .returning();

    const otp = generateOtp();
    await db.insert(otpCodes).values({
      email,
      code: otp,
      purpose: "verify_email",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });
    await sendVerificationEmail(email, otp);

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
  } catch (err) {
    console.error("Register error", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const schema = z.object({
    code: z.string().length(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid code format" });
  const { code } = parsed.data;

  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, req.user.email),
          eq(otpCodes.code, code),
          eq(otpCodes.purpose, "verify_email"),
          gt(otpCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!otp || otp.usedAt) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, otp.id));
    await db.update(users).set({ emailVerified: true }).where(eq(users.id, req.user.id));

    res.json({ ok: true });
  } catch (err) {
    console.error("Verify email error", err);
    res.status(500).json({ error: "Verification failed" });
  }
}

export async function resendOtp(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.emailVerified) return res.status(400).json({ error: "Email already verified" });

  try {
    const otp = generateOtp();
    await db.insert(otpCodes).values({
      email: req.user.email,
      code: otp,
      purpose: "verify_email",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    await sendVerificationEmail(req.user.email, otp);
    res.json({ ok: true });
  } catch (err) {
    console.error("Resend OTP error", err);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
}

export async function login(req: Request, res: Response) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, password } = parsed.data;

  if (checkLockout(email)) {
    return res.status(429).json({ error: "Account temporarily locked. Try again later." });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      recordFailedLogin(email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      recordFailedLogin(email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    clearLoginAttempts(email);
    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, avatarUrl: user.avatarUrl } });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function googleAuth(req: Request, res: Response) {
  const schema = z.object({
    token: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid token" });
  
  if (!env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "Google Auth is not configured on the server" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google token payload" });
    }

    const email = payload.email;
    const displayName = payload.name || email.split("@")[0];
    const avatarUrl = payload.picture;

    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      // Auto-register
      const hashedPassword = await hashPassword(Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)); // random password
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          passwordHash: hashedPassword,
          displayName,
          avatarUrl,
          emailVerified: true, // Google verified it
        })
        .returning();
      user = newUser;
    }

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, avatarUrl: user.avatarUrl } });
  } catch (err) {
    console.error("Google Auth error", err);
    res.status(401).json({ error: "Google authentication failed" });
  }
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const u = req.user;
  res.json({ id: u.id, email: u.email, displayName: u.displayName, role: u.role, avatarUrl: u.avatarUrl, emailVerified: u.emailVerified });
}

export async function updateMe(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const schema = z.object({
    displayName: z.string().min(2).optional(),
    avatarUrl: z.string().url().optional().nullable(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  try {
    const [updated] = await db
      .update(users)
      .set({
        ...(parsed.data.displayName && { displayName: parsed.data.displayName }),
        ...(parsed.data.avatarUrl !== undefined && { avatarUrl: parsed.data.avatarUrl }),
      })
      .where(eq(users.id, req.user.id))
      .returning();

    res.json({ id: updated.id, email: updated.email, displayName: updated.displayName, role: updated.role, avatarUrl: updated.avatarUrl });
  } catch (err) {
    console.error("Update me error", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

export async function changePassword(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  try {
    const isValid = await verifyPassword(parsed.data.currentPassword, req.user.passwordHash);
    if (!isValid) return res.status(400).json({ error: "Incorrect current password" });

    const newHash = await hashPassword(parsed.data.newPassword);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, req.user.id));
    res.json({ ok: true });
  } catch (err) {
    console.error("Change password error", err);
    res.status(500).json({ error: "Failed to change password" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const schema = z.object({
    email: z.string().email(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid email" });
  const { email } = parsed.data;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user) {
      const otp = generateOtp();
      await db.insert(otpCodes).values({
        email,
        code: otp,
        purpose: "reset_password",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
      await sendPasswordResetEmail(email, otp);
    }
    // Always return success to prevent email enumeration
    res.json({ ok: true });
  } catch (err) {
    console.error("Forgot password error", err);
    res.status(500).json({ error: "Failed to process request" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const schema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(8),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, code, newPassword } = parsed.data;

  try {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, email),
          eq(otpCodes.code, code),
          eq(otpCodes.purpose, "reset_password"),
          gt(otpCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!otp || otp.usedAt) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) return res.status(400).json({ error: "Invalid request" });

    const newHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
    await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, otp.id));

    res.json({ ok: true });
  } catch (err) {
    console.error("Reset password error", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
}
