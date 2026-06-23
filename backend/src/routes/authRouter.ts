import { Router } from "express";
import { register, login, googleAuth, verifyEmail, resendOtp, getMe, updateMe, changePassword, forgotPassword, resetPassword } from "../controllers/authController.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, register);
authRouter.post("/login", authLimiter, login);
authRouter.post("/google", authLimiter, googleAuth);

authRouter.post("/verify-email", requireAuth, otpLimiter, verifyEmail);
authRouter.post("/resend-otp", requireAuth, otpLimiter, resendOtp);

authRouter.post("/forgot-password", authLimiter, forgotPassword);
authRouter.post("/reset-password", authLimiter, resetPassword);

authRouter.get("/me", requireAuth, getMe);
authRouter.put("/me", requireAuth, updateMe);
authRouter.post("/me/change-password", requireAuth, changePassword);
