// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   employee_id: {
//     type: String,
//     required: true,
//     unique: true
//   }
// }, { timestamps: true });

// module.exports = mongoose.models.User || mongoose.model('User', userSchema);



// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: {
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
//     required: true
//   },
//   roles: {
//     type: [String],
//     // required: true,
//   },
//   permissions:{
//     type:[String]
//   },
//   managersList: [ObjectId]
// });

// module.exports = mongoose.model('EmployeeUser', userSchema);
// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// // Define the schema for EmployeeUser
// const userSchema = new Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true, // Ensure email is lowercase
//     trim: true // Remove leading/trailing whitespace
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6 // Enforce minimum length for security
//   },
//   roles: {
//     type: [String], 
//     default: [] 
//   },
//   permissions: {
//     type: [String], 
//     default: [] 
//   },
//   managersList: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'EmployeeUser' 
//   }],
// }, { timestamps: true }); 

// // Export the model
// module.exports = mongoose.model('EmployeeUser', userSchema);
const mongoose = require('mongoose'); 
const { Schema } = mongoose; 


const userSchema = new Schema({
  name: {
    type: String,
    // required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, 
    trim: true 
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Enforce minimum length for security
  },
  // roles: {
  //   type: [String], 
  //   default: [] 
  // },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }],
  permissions: {
    type: [String], 
    default: [] 
  },
  managersList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeUser' 
  }],
}, { timestamps: true }); 


module.exports = mongoose.model('EmployeeUser', userSchema);
