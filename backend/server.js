const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const leaveRoutes = require("./routes/leaveRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/leave", leaveRoutes);

app.use("/api/admin", require("./routes/adminRoutes"));

// ✅ FIX: Changed from /api/employees to /api/employee
// so frontend call to /api/employee/login works correctly
app.use("/api/employee", require("./routes/employeeRoutes"));

app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/salary", require("./routes/salaryRoutes"));

app.get("/", (req, res) => {
  res.send("PayrollPro API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});