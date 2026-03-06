const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  employeeName: { type: String },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  totalDays: { type: Number, required: true },
  presentDays: { type: Number, required: true },
  halfDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  salaryPerDay: { type: Number, default: 0 },
  totalSalary: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending"
  }
});

module.exports = mongoose.model("Salary", salarySchema);