const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  month: { type: String, required: true },
  year: { type: Number, required: true },       // ✅ Added year
  totalDays: { type: Number, required: true },
  presentDays: { type: Number, required: true },
  halfDays: { type: Number, default: 0 },       // ✅ Added half days
  absentDays: { type: Number, default: 0 },     // ✅ Added absent days
  salaryPerDay: { type: Number, required: true },// ✅ Added for reference
  totalSalary: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending"                           // ✅ Payment status
  }
}, { timestamps: true });

module.exports = mongoose.model("Salary", salarySchema);










