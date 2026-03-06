const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
   password: { type: String, required: true },
  position: { type: String, required: true },
  salaryPerDay: { type: Number, default: 0 }
});

module.exports = mongoose.model("Employee", employeeSchema);