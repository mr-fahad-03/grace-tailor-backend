import mongoose from "mongoose"

// Define a separate schema for detailed measurements
const detailedMeasurementSchema = new mongoose.Schema(
  {
    measurementNumber: String,
    length: String,
    arm: String,
    teera: String,
    chest: String,
    neck: String,
    waist: String,
    pant: String,
    pancha: String,
    frontPocket: {
      type: String,
      default: "no",
    },
    sidePocket: {
      type: String,
      default: "single",
    },
    patti: {
      type: String,
      default: "no",
    },
    collar: {
      type: String,
      default: "no",
    },
    bain: {
      type: String,
      default: "no",
    },
    kuff: {
      type: String,
      default: "no",
    },
    ghera: {
      type: String,
      default: "no",
    },
    zip: {
      type: String,
      default: "no",
    },
    notes: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
)

// Original basic measurements schema (for backward compatibility)
const measurementSchema = new mongoose.Schema(
  {
    chest: String,
    waist: String,
    hips: String,
    inseam: String,
    shoulder: String,
    sleeve: String,
    neck: String,
  },
  { _id: false },
)

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    // Keep the original measurements field for backward compatibility
    measurements: measurementSchema,
    // Add a new field for detailed measurements
    detailedMeasurements: [detailedMeasurementSchema],
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

const Customer = mongoose.model("Customer", customerSchema)

export default Customer
