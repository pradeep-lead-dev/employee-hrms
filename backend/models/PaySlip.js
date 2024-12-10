const mongoose = require("mongoose");

const paySlipSchema = new mongoose.Schema({
  empId: String,
  empName: String,
  month: String,
  year: Number,
  url: String,
});

module.exports = mongoose.model("PaySlip", paySlipSchema);
