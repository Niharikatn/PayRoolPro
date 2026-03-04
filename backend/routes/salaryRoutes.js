const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { calculateSalary, sendPayslip, getMySalaries } = require("../controllers/salaryController");

router.post("/calculate", protect, calculateSalary);
router.post("/send-payslip", protect, sendPayslip);  // ✅ NEW
router.get("/me", protect, getMySalaries);

module.exports = router;