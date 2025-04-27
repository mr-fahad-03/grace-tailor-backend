import express from "express"
import Transaction from "../models/Transaction.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Get all transactions
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 })
    res.json(transactions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get transaction by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }
    res.json(transaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new transaction
router.post("/", auth, async (req, res) => {
  try {
    const { description, amount, date, type, category, notes } = req.body

    // Create new transaction
    const newTransaction = new Transaction({
      description,
      amount,
      date,
      type,
      category,
      notes,
    })

    await newTransaction.save()
    res.status(201).json(newTransaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update transaction
router.put("/:id", auth, async (req, res) => {
  try {
    const { description, amount, date, type, category, notes } = req.body

    // Find and update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { description, amount, date, type, category, notes },
      { new: true },
    )

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    res.json(updatedTransaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete transaction
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    await transaction.deleteOne()
    res.json({ message: "Transaction removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get financial summary
router.get("/stats/summary", auth, async (req, res) => {
  try {
    const totalIncome = await Transaction.aggregate([
      { $match: { type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const totalExpense = await Transaction.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    // Get monthly data for the current year
    const currentYear = new Date().getFullYear()
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ])

    // Format monthly data
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    const formattedMonthlyData = months.map((month) => {
      const income = monthlyData.find((d) => d._id.month === month && d._id.type === "income")
      const expense = monthlyData.find((d) => d._id.month === month && d._id.type === "expense")

      return {
        month,
        income: income ? income.total : 0,
        expense: expense ? expense.total : 0,
      }
    })

    res.json({
      totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
      totalExpense: totalExpense.length > 0 ? totalExpense[0].total : 0,
      netIncome:
        (totalIncome.length > 0 ? totalIncome[0].total : 0) - (totalExpense.length > 0 ? totalExpense[0].total : 0),
      monthlyData: formattedMonthlyData,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
