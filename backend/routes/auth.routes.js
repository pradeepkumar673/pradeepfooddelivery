import express from "express"
import { googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp } from "../controllers/auth.controllers.js"
import rateLimit from "express-rate-limit"

const authRouter=express.Router()

const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // limit each IP to 5 requests per window
  message: "Too many OTP requests. Please try again after 1 minute.",
  headers: true,
});

authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.get("/signout",signOut)
authRouter.post("/send-otp",otpRateLimiter, sendOtp)
authRouter.post("/verify-otp",otpRateLimiter, verifyOtp)
authRouter.post("/reset-password",resetPassword)
authRouter.post("/google-auth",googleAuth)

export default authRouter