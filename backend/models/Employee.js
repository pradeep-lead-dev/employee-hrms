

// const mongoose = require('mongoose'); // Make sure mongoose is imported

// const employeeSchema = new mongoose.Schema({
//   employee_id: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   name: {
//     type: String,
//      required: true
//   },
//   gender: {
//     type: String,
//     enum: ['Male', 'Female', 'Other'],
//     required: true
//   },
//   dob: {
//     type: Date,
//     required: true
//   },
//   phone_number: {
//     type: String,
//     required: true
//   },
//   emergency_contact_number:{
//     type:String,
//     // required:true
//   },
//   address: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     // required: true,
//     minlength: 6 // Enforce minimum length for security
//   },
//   role: { type: [String], default: ['employee'] },
//   // role: {
//   //   type: String,
//   //   enum: ['employee', 'admin', 'hr', 'team_leader', 'super_admin'],
//   //   default: 'employee',
//   //   required: true
//   // }
// }, { timestamps: true });

// module.exports = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  emergency_contact_number: {
    type: String,
    // required:true
  },
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    // required: true,
    minlength: 6 // Enforce minimum length for security
  },
  role: { 
    type: [String], 
    default: ['employee'] 
  },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
