const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  registerEmployee,
  loginEmployee,
  getEmployees,
  getMyProfile,
  deleteEmployee,
} = require("../controllers/employeeController");

// Public routes
router.post("/register", registerEmployee);
router.post("/login", loginEmployee);

// Protected routes
router.get("/me", protect, getMyProfile);      // ✅ employee's own profile
router.get("/", protect, getEmployees);
router.delete("/:id", protect, deleteEmployee);

module.exports = router;










