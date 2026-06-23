import nodemailer from "nodemailer";
import { getEnv } from "./env.js";

const env = getEnv();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(to: string, code: string) {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    console.warn("Email configuration missing, skipping verification email");
    return;
  }

  const mailOptions = {
    from: `"Northvale Supply" <${env.GMAIL_USER}>`,
    to,
    subject: "Verify your Northvale account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Welcome to Northvale Supply</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px; color: #1e293b;">${code}</h1>
        <p>This code will expire in 15 minutes.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(to: string, code: string) {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    console.warn("Email configuration missing, skipping password reset email");
    return;
  }

  const mailOptions = {
    from: `"Northvale Supply" <${env.GMAIL_USER}>`,
    to,
    subject: "Reset your Northvale password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Northvale Supply</h2>
        <p>Your password reset code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px; color: #1e293b;">${code}</h1>
        <p>This code will expire in 15 minutes. If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
