const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } = require("../controllers/leaveController");

// Employee routes
router.post("/apply", protect, applyLeave);
router.get("/my", protect, getMyLeaves);

// Admin routes
router.get("/all", protect, getAllLeaves);
router.put("/:id/status", protect, updateLeaveStatus);

module.exports = router;