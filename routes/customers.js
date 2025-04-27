import express from "express"
import Customer from "../models/Customer.js"
import Order from "../models/Order.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Get all customers
router.get("/", auth, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 })

    // Get order count for each customer
    const customersWithOrderCount = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({
          $or: [{ customer: customer._id }, { phoneNumber: customer.phoneNumber }],
        })

        return {
          ...customer.toObject(),
          orderCount,
        }
      }),
    )

    res.json(customersWithOrderCount)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get customer by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Get customer orders
    const orders = await Order.find({
      $or: [{ customer: customer._id }, { phoneNumber: customer.phoneNumber }],
    }).sort({ createdAt: -1 })

    res.json({
      ...customer.toObject(),
      orders,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new customer
router.post("/", auth, async (req, res) => {
  try {
    const { name, phoneNumber, email, address, measurements, detailedMeasurements, notes } = req.body

    // Check if customer already exists
    let customer = await Customer.findOne({ phoneNumber })
    if (customer) {
      return res.status(400).json({ message: "Customer with this phone number already exists" })
    }

    // Create new customer
    customer = new Customer({
      name,
      phoneNumber,
      email,
      address,
      measurements,
      detailedMeasurements,
      notes,
    })

    await customer.save()
    res.status(201).json(customer)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update customer
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, phoneNumber, email, address, measurements, detailedMeasurements, notes } = req.body

    // Find and update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, email, address, measurements, detailedMeasurements, notes },
      { new: true },
    )

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.json(updatedCustomer)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add a new measurement to a customer
router.post("/:id/measurements", auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Initialize detailedMeasurements array if it doesn't exist
    if (!customer.detailedMeasurements) {
      customer.detailedMeasurements = []
    }

    // Add the new measurement
    customer.detailedMeasurements.push(req.body)

    // Save the customer
    await customer.save()

    res.status(201).json(customer)
  } catch (error) {
    console.error("Error adding measurement:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete customer
router.delete("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Check if customer has orders
    const orderCount = await Order.countDocuments({ customer: req.params.id })
    if (orderCount > 0) {
      return res.status(400).json({
        message: "Cannot delete customer with existing orders. Update the orders first.",
      })
    }

    await customer.deleteOne()
    res.json({ message: "Customer removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
