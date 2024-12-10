



 
// const mongoose = require('mongoose');

// const roleSchema = new mongoose.Schema({
//   role_name: { type: String, required: true },
//   description: { type: String,  },
//   permissions: {
//     create: { type: Boolean, default: false },
//     read: { type: Boolean, default: false },
//     update: { type: Boolean, default: false },
//     delete: { type: Boolean, default: false },
//   },
// });

// const Role = mongoose.model('Role', roleSchema);
// module.exports = Role;
// roleSchema.js

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  role_name: { type: String, required: true },
  description: { type: String },
  permissions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;


