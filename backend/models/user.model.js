import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
    },
    mobile:{
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true
    },
    role:{
        type:String,
        enum:["user","owner","deliveryBoy"],
        required:true
    },
    signupOtp: {
        type: String
    },
    isSignupOtpVerified: {
        type: Boolean,
        default: false
    },
    signupOtpExpires: {
        type: Date
    },
    resetOtp: {
        type: String
    },
    isResetOtpVerified: {
        type: Boolean,
        default: false
    },
    resetOtpExpires: {
        type: Date
    },
    socketId:{
     type:String,
     
    },
    isOnline:{
        type:Boolean,
        default:false
    },
   location:{
type:{type:String,enum:['Point'],default:'Point'},
coordinates:{type:[Number],default:[0,0]}
   }
  
}, { timestamps: true })

userSchema.index({location:'2dsphere'})


const User=mongoose.model("User",userSchema)
export default User