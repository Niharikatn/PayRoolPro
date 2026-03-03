const Attendance = require("../models/Attendance");

// Mark Attendance
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;
    const existing = await Attendance.findOne({ employeeId, date });
    if (existing) {
      existing.status = status;
      await existing.save();
      return res.json({ message: "Attendance updated", attendance: existing });
    }
    const attendance = await Attendance.create({ employeeId, date, status });
    res.json({ message: "Attendance marked", attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Today's Present Count (admin)
exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const presentCount = await Attendance.countDocuments({
      status: "Present",
      date: { $gte: today, $lt: tomorrow },
    });
    res.json({ presentCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get My Attendance (employee)
exports.getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ employeeId: req.user.id }).sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};