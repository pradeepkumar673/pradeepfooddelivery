import express from "express"
import { getCurrentUser, updateUserLocation } from "../controllers/user.controllers.js"
import isAuth from "../middlewares/isAuth.js"


const userRouter=express.Router()

// OTP Routes
userRouter.post('/send-otp', sendOtp)
userRouter.post('/verify-otp', verifyOtp)
userRouter.get("/current",isAuth,getCurrentUser)
userRouter.post('/update-location',isAuth,updateUserLocation)
export default userRouter