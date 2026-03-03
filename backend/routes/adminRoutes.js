const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");

// ✅ Clean - no duplicate code, no dead code after module.exports
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

module.exports = router;










