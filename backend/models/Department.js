// // models/Department.js
// const mongoose = require("mongoose");

// const departmentSchema = new mongoose.Schema({
//   dept_id: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   dept_name: {
//     type: String,
//     required: true
//   },
//   dept_supervisor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   }
// });

// module.exports = mongoose.model("Department", departmentSchema);
