const mongoose = require('mongoose');
 
const TimesheetSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: false},
    workingHours: [
        {
            date: { type: String, required: true },
            dailyHours: { type: Number, required: true, min: 0, max: 24 },
        },
    ],
    totalWeeklyHours: { type: Number, default: 0 },
    totalMonthlyHours: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
 
module.exports = mongoose.model('Timesheet', TimesheetSchema);
 