import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import orderRoutes from "./routes/orders.js"
import customerRoutes from "./routes/customers.js"
import staffRoutes from "./routes/staff.js"
import transactionRoutes from "./routes/transactions.js"
import staffPaymentRoutes from "./routes/staffPayments.js"

dotenv.config()

const app = express()

// Middleware
app.use(
  cors({
    origin: "https://grace-tailor-shop.vercel.app", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // if your API needs to support cookies/session
  })
);
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err))

// Routes
app.get("/hello", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/staff", staffRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/staff-payments", staffPaymentRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send({ message: "Something went wrong!" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
