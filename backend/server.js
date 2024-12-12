const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes=require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');
const dotenv = require('dotenv').config()
const bcrypt = require('bcryptjs');
require('./models/db')
const jwt = require('jsonwebtoken');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/data/',formRoutes)
app.use('/api/auth/',authRoutes)





const moment=require('moment');
const LeaveApplication = require("./models/LeaveApplication");
const Timesheet = require('./models/Timesheet');
const PaySlip = require("./models/PaySlip");
const User = require('./models/User');
const Role = require("./models/Role"); 
 const Employee = require('./models/Employee');
 const authMiddleware=require('./middleware/Authmiddleware');





  



//// new code///
app.post('/apply-leave', async (req, res) => {
  const { employee_id, leaveType, startDate, endDate, leaveReason, daysRequested } = req.body;

  if (!employee_id || !leaveType || !startDate || !endDate || !leaveReason || !daysRequested) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Fetch existing leave application for the employee
    const leaveApplication = await LeaveApplication.findOne({ employeeId: employee_id });

    // Check if leave duration exceeds the limit
    const totalLeaveDays = leaveApplication ? leaveApplication.totalLeaveDays : 0;
    const remainingLeaveDays = 21 - totalLeaveDays;

    if (daysRequested > remainingLeaveDays) {
      return res.status(400).json({ error: `Insufficient leave balance. You have only ${remainingLeaveDays} days remaining.` });
    }

    // Create a new leave application or add to existing
    const newLeaveRequest = {
      leaveType,
      startDate,
      endDate,
      leaveReason,
      daysRequested,
      status: 'Pending',
    };

    if (leaveApplication) {
      leaveApplication.leaveHistory.push(newLeaveRequest);
      leaveApplication.totalLeaveDays += daysRequested;
      await leaveApplication.save();
    } else {
      const newLeaveApplication = new LeaveApplication({
        employeeId: employee_id,
        leaveHistory: [newLeaveRequest],
        totalLeaveDays: daysRequested,
      });
      await newLeaveApplication.save();
    }

    res.status(201).json({ message: 'Leave request submitted successfully!' });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ error: 'Failed to apply for leave.' });
  }
});

// View leave history
app.get('/leave-summary/:employeeId', async (req, res) => {
  const { employeeId } = req.params;

  try {
    const leaveApplication = await LeaveApplication.findOne({ employeeId });

    if (!leaveApplication) {
      return res.status(404).json({ error: 'No leave data found for this employee.' });
    }

    const totalDaysUsed = leaveApplication.totalLeaveDays;
    const remainingDays = 21 - totalDaysUsed;

    res.status(200).json({
      remainingDays,
      totalDaysUsed,
      leaveHistory: leaveApplication.leaveHistory,
    });
  } catch (error) {
    console.error('Error fetching leave summary:', error);
    res.status(500).json({ error: 'Failed to fetch leave summary.' });
  }
});


////timesheet
app.post('/save-timesheet', authMiddleware, async (req, res) => {
  const { workingHours } = req.body;
 
 
  if (!workingHours || !Array.isArray(workingHours)) {
      return res.status(400).json({ error: 'Invalid working hours data.' });
  }
 
  try {
     
      const totalWeeklyHours = workingHours.reduce((sum, entry) => sum + (entry.dailyHours || 0), 0);
      let timesheet = await Timesheet.findOne({ employeeId: req.employeeId });
 
      if (timesheet) {
         
          const updatedWorkingHours = [...timesheet.workingHours];
 
          workingHours.forEach((newEntry) => {
              const existingEntryIndex = updatedWorkingHours.findIndex(
                  (entry) => entry.date === newEntry.date
              );
 
              if (existingEntryIndex !== -1) {
                 
                  updatedWorkingHours[existingEntryIndex].dailyHours = newEntry.dailyHours;
              } else {
                 
                  updatedWorkingHours.push(newEntry);
              }
          });
 
          timesheet.workingHours = updatedWorkingHours;
          timesheet.totalWeeklyHours = updatedWorkingHours.reduce(
              (sum, entry) => sum + (entry.dailyHours || 0),
              0
          );
          timesheet.updatedAt = Date.now();
          await timesheet.save();
 
          return res.status(200).json({ message: 'Timesheet updated successfully!' });
      }
      
      
      timesheet = new Timesheet({
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        workingHours,
        totalWeeklyHours,
      });
 
      await timesheet.save();
      res.status(201).json({ message: 'Timesheet saved successfully!' });
  } catch (error) {
      console.error('Error saving timesheet:', error);
      res.status(500).json({ error: 'Failed to save timesheet.' });
  }
});

app.get('/get-timesheet', authMiddleware, async (req, res) => {
  try {
      const timesheet = await Timesheet.findOne({ employeeId: req.employeeId });
 
      if (!timesheet) {
          return res.status(404).json({ message: 'Timesheet not found.' });
      }
 
      res.status(200).json(timesheet);
  } catch (error) {
      console.error('Error fetching timesheet:', error);
      res.status(500).json({ error: 'Failed to fetch timesheet.' });
  }
});

app.get('/view-timesheet', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token missing.' });
  }
 
  try {
    console.log(token);
    
    const decodedToken = jwt.verify(token, 'D0ts1t012345!');
    const { _id: employeeId } = decodedToken;
 
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end parameters are required.' });
    }
 
    const startDate = moment(start, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'], true);
    const endDate = moment(end, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'], true);
 
   
    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD, DD-MM-YYYY, or MM-DD-YYYY.' });
    }
 
    const timesheet = await Timesheet.findOne({ employeeId });
    if (!timesheet) {
      return res.status(404).json({ error: 'No timesheet found for the employee.' });
    }
 
    const filteredData = timesheet.workingHours.filter((entry) =>
      moment(entry.date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'], true).isBetween(startDate, endDate, 'days', '[]')
    );
 
    res.status(200).json({ timesheet: filteredData });
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    res.status(500).json({ error: 'An error occurred while fetching timesheet data.' });
  }
});
 
 
app.post('/update-timesheet', async (req, res) => {
  const { employeeId, workingHours } = req.body;
 
  if (!employeeId || !workingHours) {
      return res.status(400).json({ error: 'Employee ID and working hours are required.' });
  }
 
  try {
      const totalWeeklyHours = workingHours.reduce((sum, entry) => sum + (entry.dailyHours || 0), 0);
 
      const existingTimesheet = await Timesheet.findOne({ employeeId });
 
      if (!existingTimesheet) {
          return res.status(404).json({ error: 'Timesheet not found for the employee.' });
      }
 
      existingTimesheet.workingHours = workingHours;
      existingTimesheet.totalWeeklyHours = totalWeeklyHours;
      existingTimesheet.totalMonthlyHours += totalWeeklyHours; // Update monthly hours
      existingTimesheet.updatedAt = Date.now();
      await existingTimesheet.save();
 
      res.status(200).json({ message: 'Timesheet updated successfully!' });
  } catch (error) {
      console.error('Error updating timesheet:', error);
      res.status(500).json({ error: 'Failed to update timesheet.' });
  }
});
 

 


// Upload pay slips for the Users
app.post("/payslip", async (req, res) => {
  try {
    const { empId, empName, month, year, url } = req.body;
    const newPaySlip = new PaySlip({ empId, empName, month, year, url });
    await newPaySlip.save();
 
    res.status(201).json({ message: "Pay slip uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading pay slip", error });
  }
});

// Route to fetch pay slips
app.get("/payslip", async (req, res) => {
  try {
    const paySlips = await PaySlip.find().lean();
    res.status(200).json(paySlips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pay slips", error });
  }
});






// Generate Employee ID
const generateEmployeeID = async () => {
  const lastEmployee = await Employee.findOne().sort({ employee_id: -1 });
  let newEmployeeID = 'dotsemp01'; // Default for the first employee

  if (lastEmployee) {
    const lastIDNumber = parseInt(lastEmployee.employee_id.slice(7)); // Get numeric part from ID
    const nextIDNumber = (lastIDNumber + 1).toString().padStart(2, '0');
    newEmployeeID = `dotsemp${nextIDNumber}`;
  }

  return newEmployeeID;
};

// Get Latest Employee ID
app.get('/latest-employee-id', async (req, res) => {
  try {
    const lastEmployee = await Employee.findOne().sort({ employee_id: -1 });
    const latestEmployeeID = lastEmployee ? lastEmployee.employee_id : 'dotsemp00';
    res.status(200).json({ latestEmployeeID });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest employee ID' });
  }
});

// Employee Registration
app.post('/register', async (req, res) => {
  const { email, name, gender, dob, phone_number, address, department_id, role, password ,emergency_contact_number} = req.body;

  // Check if required fields are missing
  if (!email || !name || !password || !role) {
    console.log('Received data:', req.body);
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if the employee already exists
    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    // Generate employee ID
    const employee_id = await generateEmployeeID();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new employee document
    const newEmployee = new Employee({
      employee_id,
      name,
      gender,
      dob,
      phone_number,
      address,
      email,
      department_id,
      password,
      emergency_contact_number,
      role,
    });

    await newEmployee.save(); // Save employee to the database

    // Create the user document for authentication
    const newUser = new User({
      email,
      password: hashedPassword,
      employee_id,
      role,
    });

    await newUser.save(); // Save user to the database

    res.status(201).json({ message: 'Employee registered successfully', employee: newEmployee });
  } catch (error) {
    console.error("Error during employee registration:", error.stack); // Log error stack
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an Employee by ID
// app.put('/employees/:id', async (req, res) => {
//   const { name, email, role, phone_number, address, department_id, asset_id, dob, gender } = req.body;

//   try {
//     const employee = await Employee.findById(req.params.id); // Find employee by ID
//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     // Update employee details
//     employee.name = name || employee.name;
//     employee.email = email || employee.email;
//     employee.role = role || employee.role;
//     employee.phone_number = phone_number || employee.phone_number;
//     employee.address = address || employee.address;
//     employee.department_id = department_id || employee.department_id;
//     employee.asset_id = asset_id || employee.asset_id;
//     employee.dob = dob || employee.dob;
//     employee.gender = gender || employee.gender;

//     await employee.save(); // Save updated employee

//     // Update the corresponding user if necessary
//     if (email) {
//       const user = await User.findOne({ employee_id: employee.employee_id });

//       if (user) {
//         user.email = email; // Update email in the User collection
//         await user.save();
//       }
//     }

//     res.status(200).json({ message: 'Employee updated successfully', employee });

//   } catch (error) {
//     console.error('Error updating employee:', error); // Log error
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// Backend route to update an employee by ID
app.put('/employees/:id', async (req, res) => {
  const { name,employee_id, email, role, phone_number, address, department_id, password, dob, gender,emergency_contact_number } = req.body;

  try {
    // Find the employee by ID
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update employee details if new values are provided
    employee.name = name || employee.name;
    employee.employee_id=employee_id || employee.employee_id,
    employee.email = email || employee.email;
    employee.role = role || employee.role;
    employee.phone_number = phone_number || employee.phone_number;
    employee.address = address || employee.address;
    employee.department_id = department_id || employee.department_id;
    employee.password = password || employee.password;
    employee.emergency_contact_number=emergency_contact_number || employee.emergency_contact_number
    employee.dob = dob || employee.dob;
    employee.gender = gender || employee.gender;

    // Save the updated employee
    await employee.save();

    // If email is updated, update the corresponding user document
    if (email) {
      const user = await User.findOne({ employee_id: employee.employee_id });

      if (user) {
        user.email = email; // Update email in the User collection
        await user.save();
      }
    }

    // Return the updated employee as part of the response
    res.status(200).json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    console.error('Error updating employee:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Backend route to fetch a specific employee by ID
app.get('/employees/:id', async (req, res) => {
  try {
    // Fetch employee by ID
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee); // Return the employee data
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// app.put('/employees/:id', async (req, res) => {
//   const { name, email, role, phone_number, address, department_id, password, dob, gender,emergency_contact_number } = req.body;

//   try {
//     const employee = await Employee.findById(req.params.id); // Find employee by ID
//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     // Update employee details
//     employee.name = name || employee.name;
//     employee.email = email || employee.email;
//     employee.role = role || employee.role;
//     employee.phone_number = phone_number || employee.phone_number;
//     employee.address = address || employee.address;
//     employee.department_id = department_id || employee.department_id;
//     employee.password = password || employee.password;
//     employee.emergency_contact_number=emergency_contact_number || employee.emergency_contact_number;
//     employee.dob = dob || employee.dob;
//     employee.gender = gender || employee.gender;

//     // Save updated employee
//     await employee.save();

//     res.status(200).json({ message: 'Employee updated successfully', employee });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });


// Backend route to fetch all employees
app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find(); // Fetch all employees from the database
    res.status(200).json(employees); // Return the employee data as JSON
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Delete an Employee by ID
app.delete('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete the user associated with the employee
    await User.deleteOne({ employee_id: employee.employee_id });

    res.status(200).json({ message: 'Employee deleted successfully' });

  } catch (error) {
    console.error('Error deleting employee:', error); // Log error
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});





// Create a new role
  // app.post('/roles', async (req, res) => {
  //   console.log('Request body:', req.body);
  //   const { role_name } = req.body;  // Destructure to get role_name from the request body

  //   if (!role_name) {
  //     return res.status(400).json({ message: 'Role name is required' });
  //   }

  //   // Check if the role already exists
  //   const existingRole = await Role.findOne({ role_name });
  //   if (existingRole) {
  //     return res.status(400).json({ message: 'Role already exists' });
  //   }

  //   const newRole = new Role({
  //     role_name,
  //   });

  //   try {
  //     const savedRole = await newRole.save();
  //     res.status(201).json(savedRole);  // Return the saved role
  //   } catch (error) {
  //     res.status(400).json({ message: 'Error creating role' });
  //   }
  // });

  // // Get all roles
  // app.get('/roles', async (req, res) => {
  //   try {
  //     const roles = await Role.find();
  //     res.status(200).json(roles);
  //   } catch (error) {
  //     res.status(400).json({ message: 'Error fetching roles' });
  //   }
  // });

  // // Delete a role
  // app.delete('/roles/:id', async (req, res) => {
  //   const { id } = req.params;
  //   try {
  //     const deletedRole = await Role.findByIdAndDelete(id);
  //     if (deletedRole) {
  //       res.status(200).json({ message: 'Role deleted successfully' });
  //     } else {
  //       res.status(404).json({ message: 'Role not found' });
  //     }
  //   } catch (error) {
  //     res.status(400).json({ message: 'Error deleting role' });
  //   }
  // });

  // // Example of a POST endpoint to save roles to a user's record in the database.
  // app.post('/api/saveRoles', (req, res) => {
  //   const { userId, roles } = req.body;  // userId is the user's ID and roles is the array of selected roles.

  //   // Assume you have a function to update roles in the user table.
  //   updateUserRoles(userId, roles)
  //     .then(() => {
  //       res.status(200).json({ message: 'Roles updated successfully' });
  //     })
  //     .catch((err) => {
  //       res.status(500).json({ message: 'Error updating roles', error: err });
  //     });
  // });

  // // Simulate updating user roles
  // const updateUserRoles = (userId, roles) => {
  //   // Logic to update the user record with the selected roles.
  //   return Promise.resolve();  // Simulating success
  // };

// Create a new role
app.post('/roles', async (req, res) => {
  const { role_name, description, permissions } = req.body;

  if (!role_name) {
    return res.status(400).json({ message: 'Role name is required' });
  }

  try {
    // Check if the role already exists
    const existingRole = await Role.findOne({ role_name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const newRole = new Role({
      role_name,
      description,
      permissions,
    });

    const savedRole = await newRole.save();
    res.status(201).json(savedRole); // Return the saved role
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating role' });
  }
});

// Get all roles
app.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching roles' });
  }
});

// Get a single role by ID
app.get('/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.findById(id);
    if (role) {
      res.status(200).json(role);
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching role' });
  }
});

// Delete a role by ID
app.delete('/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRole = await Role.findByIdAndDelete(id);
    if (deletedRole) {
      res.status(200).json({ message: 'Role deleted successfully' });
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting role' });
  }
});

// Update a role by ID
app.put('/roles/:id', async (req, res) => {
  const { id } = req.params;
  const { role_name, description, permissions } = req.body;

  try {
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { role_name, description, permissions },
      { new: true }
    );

    if (updatedRole) {
      res.status(200).json(updatedRole);
    } else {
      res.status(404).json({ message: 'Role not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating role' });
  }
});

// Save roles to a user's record (example)
app.post('/api/saveRoles', (req, res) => {
  const { userId, roles } = req.body;

  // Logic to update roles for the user in the database.
  updateUserRoles(userId, roles)
    .then(() => {
      res.status(200).json({ message: 'Roles updated successfully' });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Error updating roles', error: err });
    });
});

// Simulate updating user roles (for example purposes)
const updateUserRoles = (userId, roles) => {
  // Logic to update the user record with the selected roles.
  return Promise.resolve(); // Simulating success
};  



  const PORT = process.env.PORT;


 
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });