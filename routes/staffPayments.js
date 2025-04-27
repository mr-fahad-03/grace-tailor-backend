import express from "express"
import StaffPayment from "../models/StaffPayment.js"
import Staff from "../models/Staff.js"
import Transaction from "../models/Transaction.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Get all payments for a specific staff member
router.get("/staff/:staffId", auth, async (req, res) => {
  try {
    const staffId = req.params.staffId

    // Verify staff exists
    const staff = await Staff.findById(staffId)
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" })
    }

    // Get payments sorted by date (newest first)
    const payments = await StaffPayment.find({ staff: staffId }).sort({ date: -1 })

    res.json(payments)
  } catch (error) {
    console.error("Error fetching staff payments:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new payment
router.post("/", auth, async (req, res) => {
  try {
    const { staffId, amount, date, hoursWorked, notes } = req.body

    // Verify staff exists
    const staff = await Staff.findById(staffId)
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" })
    }

    // Create new payment
    const payment = new StaffPayment({
      staff: staffId,
      amount,
      date,
      hoursWorked,
      notes,
    })

    await payment.save()

    // Create expense transaction
    const transaction = new Transaction({
      description: `Payment to ${staff.name}`,
      amount,
      date,
      type: "expense",
      category: "salary",
      notes: `Payment to ${staff.name} for ${hoursWorked || 0} hours worked`,
    })

    await transaction.save()

    res.status(201).json(payment)
  } catch (error) {
    console.error("Error creating staff payment:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update a payment
router.put("/:id", auth, async (req, res) => {
  try {
    const { amount, date, hoursWorked, notes } = req.body

    // Find and update payment
    const payment = await StaffPayment.findById(req.params.id)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Get staff info for transaction update
    const staff = await Staff.findById(payment.staff)
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" })
    }

    // Update payment
    payment.amount = amount
    payment.date = date
    payment.hoursWorked = hoursWorked
    payment.notes = notes

    await payment.save()

    // Find and update related transaction
    const transaction = await Transaction.findOne({
      description: `Payment to ${staff.name}`,
      amount: payment.amount,
      date: payment.date,
    })

    if (transaction) {
      transaction.amount = amount
      transaction.date = date
      transaction.notes = `Payment to ${staff.name} for ${hoursWorked || 0} hours worked`
      await transaction.save()
    }

    res.json(payment)
  } catch (error) {
    console.error("Error updating staff payment:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a payment
router.delete("/:id", auth, async (req, res) => {
  try {
    const payment = await StaffPayment.findById(req.params.id)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Get staff info for transaction deletion
    const staff = await Staff.findById(payment.staff)

    // Delete payment
    await payment.deleteOne()

    // Delete related transaction
    if (staff) {
      await Transaction.deleteOne({
        description: `Payment to ${staff.name}`,
        amount: payment.amount,
        date: payment.date,
      })
    }

    res.json({ message: "Payment removed" })
  } catch (error) {
    console.error("Error deleting staff payment:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
