import User from "../models/user.model.js"
import { sendOtpMail } from "../utils/mail.js"
import { rateLimit } from "../utils/rateLimit.js"
export const getCurrentUser=async (req,res) => {
    try {
        const userId=req.userId
        if(!userId){
            return res.status(400).json({message:"userId is not found"})
        }
        const user=await User.findById(userId)
        if(!user){
               return res.status(400).json({message:"user is not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`get current user error ${error}`})
    }
}

export const updateUserLocation=async (req,res) => {
    try {
        const {lat,lon}=req.body
        const user=await User.findByIdAndUpdate(req.userId,{
            location:{
                type:'Point',
                coordinates:[lon,lat]
            }
        },{new:true})
         if(!user){
               return res.status(400).json({message:"user is not found"})
        }
        
        return res.status(200).json({message:'location updated'})
    } catch (error) {
           return res.status(500).json({message:`update location user error ${error}`})
    }
}


// OTP Generation and Verification
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        // Rate limiting
        const { isRateLimited } = await rateLimit(req, 'signup-otp', 5, 60 * 60 * 1000)
        if (isRateLimited) {
            return res.status(429).json({ message: "Too many OTP requests. Please try again later." })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000)
        
        user.signupOtp = otp
        user.signupOtpExpires = otpExpires
        user.isSignupOtpVerified = false
        await user.save()

        await sendOtpMail(email, otp)
        return res.status(200).json({ message: "OTP sent to email" })
    } catch (error) {
        return res.status(500).json({ message: `OTP generation error: ${error.message}` })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        if (user.signupOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }

        if (user.signupOtpExpires < new Date()) {
            return res.status(400).json({ message: "OTP has expired" })
        }

        user.isSignupOtpVerified = true
        await user.save()

        return res.status(200).json({ message: "OTP verified successfully" })
    } catch (error) {
        return res.status(500).json({ message: `OTP verification error: ${error.message}` })
    }
}
