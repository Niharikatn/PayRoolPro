const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  employeeName: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  type: { type: String, enum: ["Sick Leave", "Casual Leave", "Emergency Leave", "Other"], default: "Casual Leave" },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  adminNote: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);