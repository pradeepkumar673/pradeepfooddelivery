import mongoose from "mongoose"

const connectDb=async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("db connect aidichi, poi ippo frontend deploy pannu")
    } catch (error) {
        console.log("db la problem")
    }
}

export default connectDb