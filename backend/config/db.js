
import mongoose from "mongoose"

const connectDb=async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Super Da, Database Connect Aidichi")
    } catch (error) {
        console.log("Db Connect Aagala:", error.message);
    }
}

export default connectDb