// userRoutes.js

const express = require('express');
const Employee = require('./models/employeeSchema');      
const Role = require('./models/roleSchema');  // Role model
const bcrypt = require('bcrypt');
const router = express.Router();

// POST route to create a new user
router.post('/register', async (req, res) => {
  try {
    const { employee_id, name, gender, dob, phone_number, emergency_contact_number, address, email, department_id, password, role } = req.body;
    
    // Check if the roles provided exist in the database
    const roles = await Role.find({ _id: { $in: role } });

    if (!roles || roles.length !== role.length) {
      return res.status(400).json({ message: 'One or more selected roles are invalid' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      employee_id,
      name,
      gender,
      dob,
      phone_number,
      emergency_contact_number,
      address,
      email,
      department_id,
      password: hashedPassword,
      role: roles,  // Assign selected roles
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update an existing user
router.put('/employees/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { employee_id, name, gender, dob, phone_number, emergency_contact_number, address, email, department_id, password, role } = req.body;
    
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the roles provided exist in the database
    const roles = await Role.find({ _id: { $in: role } });

    if (!roles || roles.length !== role.length) {
      return res.status(400).json({ message: 'One or more selected roles are invalid' });
    }

    // Update user data
    user.employee_id = employee_id || user.employee_id;
    user.name = name || user.name;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.phone_number = phone_number || user.phone_number;
    user.emergency_contact_number = emergency_contact_number || user.emergency_contact_number;
    user.address = address || user.address;
    user.email = email || user.email;
    user.department_id = department_id || user.department_id;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    user.role = roles;  // Update roles

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
