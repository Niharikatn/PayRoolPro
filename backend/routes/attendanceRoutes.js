const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { markAttendance, getTodayAttendance, getMyAttendance } = require("../controllers/attendanceController");

router.post("/", protect, markAttendance);
router.get("/today", protect, getTodayAttendance);
router.get("/me", protect, getMyAttendance);   // ✅ employee's own attendance

module.exports = router;