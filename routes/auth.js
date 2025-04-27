const express = require("express")
const router = express.Router()
const User = require("../models/User")
const jwt = require("jsonwebtoken")

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    console.log("Login attempt for:", email)

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      console.log("User not found with email:", email)
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    try {
      const isMatch = await user.comparePassword(password)
      console.log("Password match result:", isMatch)

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }
    } catch (passwordError) {
      console.error("Password comparison error details:", passwordError)
      return res.status(500).json({ message: "Error verifying password" })
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error details:", error)
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

export default authRoutes;
