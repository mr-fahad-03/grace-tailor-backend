import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User.js"
import Customer from "./models/Customer.js"
import Order from "./models/Order.js"
import Staff from "./models/Staff.js"
import Transaction from "./models/Transaction.js"
import StaffPayment from "./models/StaffPayment.js"

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
    await StaffPayment.deleteMany({})

    console.log("Previous data cleared")

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123", // This will be hashed by the pre-save hook
      role: "admin",
    })

    await admin.save()
    console.log("Admin user created with email: admin@example.com and password: admin123")

    // Create staff members
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

    const savedStaff = await Staff.insertMany(staff)
    console.log("Staff created")

    // Create customers with detailed measurements
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
        detailedMeasurements: [
          {
            measurementNumber: "M1001",
            length: "28",
            arm: "24",
            teera: "16",
            chest: "40",
            neck: "16",
            waist: "34",
            pant: "38",
            pancha: "22",
            frontPocket: "yes",
            sidePocket: "single",
            patti: "yes",
            collar: "yes",
            bain: "no",
            kuff: "yes",
            ghera: "no",
            zip: "no",
            notes: "Prefers slim fit suits",
            date: new Date(),
          },
        ],
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
        detailedMeasurements: [
          {
            measurementNumber: "M2001",
            length: "26",
            arm: "22",
            teera: "15",
            chest: "36",
            neck: "14",
            waist: "28",
            pant: "36",
            pancha: "20",
            frontPocket: "no",
            sidePocket: "double",
            patti: "no",
            collar: "no",
            bain: "yes",
            kuff: "no",
            ghera: "yes",
            zip: "yes",
            notes: "Allergic to wool",
            date: new Date(),
          },
        ],
        notes: "Allergic to wool",
      },
      {
        name: "Ardeep Singh",
        phoneNumber: "0829789427942",
        email: "ardeep@example.com",
        address: "Dajal",
        measurements: {
          chest: "111",
          waist: "11",
          hips: "",
          inseam: "",
          shoulder: "",
          sleeve: "",
          neck: "11",
        },
        detailedMeasurements: [
          {
            measurementNumber: "123",
            length: "11",
            arm: "11",
            teera: "111",
            chest: "111",
            neck: "11",
            waist: "11",
            pant: "111",
            pancha: "11",
            frontPocket: "yes",
            sidePocket: "single",
            patti: "yes",
            collar: "no",
            bain: "no",
            kuff: "yes",
            ghera: "no",
            zip: "yes",
            notes: "1.5 inch Bain + Fancy Button",
            date: new Date(),
          },
        ],
        notes: "Regular customer",
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
      {
        customerName: savedCustomers[2].name,
        phoneNumber: savedCustomers[2].phoneNumber,
        comment: "Traditional outfit with custom embroidery",
        price: 350,
        status: "pending",
        customer: savedCustomers[2]._id,
      },
    ]

    const savedOrders = await Order.insertMany(orders)
    console.log("Orders created")

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
        description: `Order #${savedOrders[2]._id}`,
        amount: savedOrders[2].price,
        date: new Date(),
        type: "income",
        category: "orders",
        notes: `Order from ${savedCustomers[2].name}`,
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

    // Create staff payments
    const staffPayments = [
      {
        staff: savedStaff[0]._id,
        amount: 1750,
        date: new Date(new Date().setDate(15)), // 15th of current month
        hoursWorked: 80,
        notes: "Mid-month payment",
      },
      {
        staff: savedStaff[1]._id,
        amount: 1250,
        date: new Date(new Date().setDate(15)), // 15th of current month
        hoursWorked: 80,
        notes: "Mid-month payment",
      },
    ]

    await StaffPayment.insertMany(staffPayments)
    console.log("Staff payments created")

    // Create expense transactions for staff payments
    const staffPaymentTransactions = [
      {
        description: `Payment to ${savedStaff[0].name}`,
        amount: 1750,
        date: new Date(new Date().setDate(15)),
        type: "expense",
        category: "salary",
        notes: `Payment to ${savedStaff[0].name} for 80 hours worked`,
      },
      {
        description: `Payment to ${savedStaff[1].name}`,
        amount: 1250,
        date: new Date(new Date().setDate(15)),
        type: "expense",
        category: "salary",
        notes: `Payment to ${savedStaff[1].name} for 80 hours worked`,
      },
    ]

    await Transaction.insertMany(staffPaymentTransactions)
    console.log("Staff payment transactions created")

    console.log("Database seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
