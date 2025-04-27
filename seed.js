import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User.js"
import Customer from "./models/Customer.js"
import Order from "./models/Order.js"
import Staff from "./models/Staff.js"
import Transaction from "./models/Transaction.js"

dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({})
    await Customer.deleteMany({})
    await Order.deleteMany({})
    await Staff.deleteMany({})
    await Transaction.deleteMany({})

    console.log("Previous data cleared")

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@gmail.com",
      password: "admin", // This will be hashed by the pre-save hook
      role: "admin",
    })

    await admin.save()
    console.log("Admin user created with email: admin@example.com and password: admin123")

    // Create customers
    const customers = [
      {
        name: "John Doe",
        phoneNumber: "555-123-4567",
        email: "john@example.com",
        address: "123 Main St, Anytown",
        measurements: {
          chest: "40",
          waist: "34",
          hips: "38",
          inseam: "32",
          shoulder: "18",
          sleeve: "25",
          neck: "16",
        },
        notes: "Prefers slim fit suits",
      },
      {
        name: "Jane Smith",
        phoneNumber: "555-987-6543",
        email: "jane@example.com",
        address: "456 Oak Ave, Somewhere",
        measurements: {
          chest: "36",
          waist: "28",
          hips: "38",
          inseam: "30",
          shoulder: "16",
          sleeve: "23",
          neck: "14",
        },
        notes: "Allergic to wool",
      },
    ]

    const savedCustomers = await Customer.insertMany(customers)
    console.log("Customers created")

    // Create orders
    const orders = [
      {
        customerName: savedCustomers[0].name,
        phoneNumber: savedCustomers[0].phoneNumber,
        comment: "Blue suit with slim fit",
        price: 450,
        status: "completed",
        customer: savedCustomers[0]._id,
      },
      {
        customerName: savedCustomers[1].name,
        phoneNumber: savedCustomers[1].phoneNumber,
        comment: "Red dress with alterations",
        price: 250,
        status: "in-progress",
        customer: savedCustomers[1]._id,
      },
    ]

    const savedOrders = await Order.insertMany(orders)
    console.log("Orders created")

    // Create staff
    const staff = [
      {
        name: "Michael Brown",
        phoneNumber: "555-111-2222",
        email: "michael@example.com",
        address: "123 Tailor St, Sewville",
        position: "Senior Tailor",
        salary: 3500,
        joiningDate: new Date("2022-01-15"),
        notes: "Specializes in suits",
      },
      {
        name: "Sarah Wilson",
        phoneNumber: "555-333-4444",
        email: "sarah@example.com",
        address: "456 Stitch Ave, Fabrictown",
        position: "Assistant Tailor",
        salary: 2500,
        joiningDate: new Date("2022-03-10"),
        notes: "Specializes in dresses",
      },
    ]

    await Staff.insertMany(staff)
    console.log("Staff created")

    // Create transactions
    const transactions = [
      {
        description: `Order #${savedOrders[0]._id}`,
        amount: savedOrders[0].price,
        date: new Date(),
        type: "income",
        category: "orders",
        notes: `Order from ${savedCustomers[0].name}`,
      },
      {
        description: `Order #${savedOrders[1]._id}`,
        amount: savedOrders[1].price,
        date: new Date(),
        type: "income",
        category: "orders",
        notes: `Order from ${savedCustomers[1].name}`,
      },
      {
        description: "Fabric Purchase",
        amount: 200,
        date: new Date(),
        type: "expense",
        category: "materials",
        notes: "Premium wool fabric",
      },
      {
        description: "Rent Payment",
        amount: 800,
        date: new Date(new Date().setDate(1)), // First day of current month
        type: "expense",
        category: "rent",
        notes: "Monthly shop rent",
      },
    ]

    await Transaction.insertMany(transactions)
    console.log("Transactions created")

    console.log("Database seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
