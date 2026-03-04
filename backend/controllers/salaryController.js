const Salary = require("../models/Salary");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const { sendPayslipEmail } = require("../utils/emailService");

// Calculate Salary
exports.calculateSalary = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Get all attendance for this employee in this month/year
    const monthIndex = ["January","February","March","April","May","June","July","August","September","October","November","December"].indexOf(month);
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);

    const records = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    });

    const presentDays = records.filter(r => r.status === "Present").length;
    const halfDays = records.filter(r => r.status === "Half Day").length;
    const absentDays = records.filter(r => r.status === "Absent").length;
    const totalDays = records.length;
    const effectiveDays = presentDays + halfDays * 0.5;
    const totalSalary = effectiveDays * employee.salaryPerDay;

    // Save or update salary record
    let salary = await Salary.findOne({ employeeId, month, year });
    if (salary) {
      salary.presentDays = presentDays;
      salary.halfDays = halfDays;
      salary.absentDays = absentDays;
      salary.totalDays = totalDays;
      salary.salaryPerDay = employee.salaryPerDay;
      salary.totalSalary = totalSalary;
      await salary.save();
    } else {
      salary = await Salary.create({
        employeeId,
        employeeName: employee.name,
        month, year,
        presentDays, halfDays, absentDays, totalDays,
        salaryPerDay: employee.salaryPerDay,
        totalSalary,
        status: "Pending",
      });
    }

    res.json({ ...salary.toObject(), employeeName: employee.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send Payslip Email
exports.sendPayslip = async (req, res) => {
  try {
    const { salaryId } = req.body;
    const salary = await Salary.findById(salaryId);
    if (!salary) return res.status(404).json({ message: "Salary record not found" });

    const employee = await Employee.findById(salary.employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await sendPayslipEmail({
      toEmail: employee.email,
      employeeName: employee.name,
      month: salary.month,
      year: salary.year,
      totalDays: salary.totalDays,
      presentDays: salary.presentDays,
      halfDays: salary.halfDays,
      absentDays: salary.absentDays,
      salaryPerDay: salary.salaryPerDay,
      totalSalary: salary.totalSalary,
    });

    // Mark as Paid
    salary.status = "Paid";
    await salary.save();

    res.json({ message: "Payslip sent successfully to " + employee.email });
  } catch (err) {
    res.status(500).json({ message: "Failed to send email: " + err.message });
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