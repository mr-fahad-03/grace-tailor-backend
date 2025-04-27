import express from "express"
import Order from "../models/Order.js"
import Customer from "../models/Customer.js"
import Transaction from "../models/Transaction.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Get all orders
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get order by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }
    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new order
router.post("/", auth, async (req, res) => {
  try {
    const { customerName, phoneNumber, comment, price } = req.body

    // Check if customer exists
    const customer = await Customer.findOne({ phoneNumber })

    // Create new order
    const newOrder = new Order({
      customerName,
      phoneNumber,
      comment,
      price,
      customer: customer ? customer._id : null,
    })

    const savedOrder = await newOrder.save()

    // Create income transaction
    const transaction = new Transaction({
      description: `Order #${savedOrder._id}`,
      amount: price,
      date: new Date(),
      type: "income",
      category: "orders",
      notes: `Order from ${customerName}`,
    })

    await transaction.save()

    res.status(201).json(savedOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update order
router.put("/:id", auth, async (req, res) => {
  try {
    const { customerName, phoneNumber, comment, price, status } = req.body

    // Find and update order
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { customerName, phoneNumber, comment, price, status },
      { new: true },
    )

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Update related transaction if price changed
    const transaction = await Transaction.findOne({
      description: `Order #${req.params.id}`,
      type: "income",
      category: "orders",
    })

    if (transaction && transaction.amount !== price) {
      transaction.amount = price
      transaction.notes = `Order from ${customerName}`
      await transaction.save()
    }

    res.json(updatedOrder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete order
router.delete("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    await order.deleteOne()

    // Delete related transaction
    await Transaction.deleteOne({
      description: `Order #${req.params.id}`,
      type: "income",
      category: "orders",
    })

    res.json({ message: "Order removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get recent orders
router.get("/stats/recent", auth, async (req, res) => {
  try {
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5)

    res.json(recentOrders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
