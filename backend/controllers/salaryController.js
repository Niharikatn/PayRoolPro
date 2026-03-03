const Attendance = require("../models/Attendance");
const Salary = require("../models/Salary");
const Employee = require("../models/Employee");

exports.calculateSalary = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Total days in that month
    const monthNames = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"];
    const monthIndex = monthNames.indexOf(month);
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();

    // Count each attendance type
    const presentDays = await Attendance.countDocuments({ employeeId, status: "Present" });
    const halfDays    = await Attendance.countDocuments({ employeeId, status: "Half Day" });
    const absentDays  = await Attendance.countDocuments({ employeeId, status: "Absent" });

    // Half day counts as 0.5
    const effectiveDays = presentDays + (halfDays * 0.5);
    const totalSalary = effectiveDays * employee.salaryPerDay;

    // Save to DB
    await Salary.create({
      employeeId,
      month,
      year: Number(year),
      totalDays,
      presentDays,
      halfDays,
      absentDays,
      salaryPerDay: employee.salaryPerDay,
      totalSalary,
    });

    res.json({
      employeeName: employee.name,
      month,
      year,
      totalDays,
      presentDays,
      halfDays,
      absentDays,
      salaryPerDay: employee.salaryPerDay,
      totalSalary,
    });

  } catch (err) {
    console.error("Salary calculation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get My Salary Slips (employee)
exports.getMySalaries = async (req, res) => {
  try {
    const salaries = await Salary.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};