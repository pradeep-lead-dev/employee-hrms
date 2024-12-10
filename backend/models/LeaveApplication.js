
const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    // required: true 
  },
  employeeName: { 
    type: String, 
    // required: true 
  },
  leaveHistory: [
    {
      leaveType: { 
        type: String, 
        required: true 
      },
      startDate: { 
        type: Date, 
        required: true 
      },
      endDate: { 
        type: Date, 
        required: true 
      },
      leaveReason: { 
        type: String, 
        required: true 
      },
      daysRequested: { 
        type: Number, 
        required: true 
      },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Overlapping"],
        default: "Pending"
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      },
      updatedAt: { 
        type: Date, 
        default: Date.now 
      },
    },
  ],
  totalLeaveDays: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("LeaveApplication", leaveApplicationSchema);

