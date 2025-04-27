import express from "express"
import Staff from "../models/Staff.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Get all staff
router.get("/", auth, async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 })
    res.json(staff)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get staff by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" })
    }
    res.json(staff)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new staff
router.post("/", auth, async (req, res) => {
  try {
    const { name, phoneNumber, email, address, position, salary, joiningDate, notes } = req.body

    // Create new staff
    const newStaff = new Staff({
      name,
      phoneNumber,
      email,
      address,
      position,
      salary,
      joiningDate,
      notes,
    })

    await newStaff.save()
    res.status(201).json(newStaff)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update staff
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, phoneNumber, email, address, position, salary, joiningDate, notes } = req.body

    // Find and update staff
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, email, address, position, salary, joiningDate, notes },
      { new: true },
    )

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found" })
    }

    res.json(updatedStaff)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete staff
router.delete("/:id", auth, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" })
    }

    await staff.deleteOne()
    res.json({ message: "Staff removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
