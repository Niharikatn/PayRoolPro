const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// Employee: Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason, type } = req.body;
    const employee = await Employee.findById(req.user.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const leave = await Leave.create({
      employeeId: req.user.id,
      employeeName: employee.name,
      fromDate, toDate, reason, type,
    });
    res.status(201).json({ message: "Leave applied successfully", leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Employee: Get my leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Approve or Reject leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = status;
    leave.adminNote = adminNote || "";
    await leave.save();
    res.json({ message: `Leave ${status}`, leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};