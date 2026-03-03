const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { calculateSalary, getMySalaries } = require("../controllers/salaryController");

router.post("/calculate", protect, calculateSalary);
router.get("/me", protect, getMySalaries);   // ✅ employee's own salary slips

module.exports = router;