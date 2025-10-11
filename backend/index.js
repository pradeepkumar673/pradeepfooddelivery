import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"

import itemRouter from "./routes/item.routes.js"
import shopRouter from "./routes/shop.routes.js"
import orderRouter from "./routes/order.routes.js"
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js"

const app = express()
const server = http.createServer(app)

// Allow the production frontend and local dev
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://pradeepfooddelivery.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true) // SSR, curl, or same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error("Not allowed by CORS"))
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}

const io = new Server(server, { cors: corsOptions })

app.set("io", io)
const port = process.env.PORT || 5000

// Trust proxy for correct secure cookies behind proxies (Render, etc.)
app.set("trust proxy", 1)

// CORS for REST endpoints + preflight
app.use(cors(corsOptions))
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigins.includes(req.headers.origin) ? req.headers.origin : allowedOrigins[0])
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.status(200).end()
})

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter)

socketHandler(io)
server.listen(port, () => {
  connectDb()
  console.log(`server started at ${port}`)
})

