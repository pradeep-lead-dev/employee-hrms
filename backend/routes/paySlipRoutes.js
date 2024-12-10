const express = require("express");
const PaySlip = require("../models/PaySlip");

const router = express.Router();

// Upload Pay Slip
router.post("/", async (req, res) => {
  try {
    const { empId, empName, month, year, url } = req.body;
    const newPaySlip = new PaySlip({ empId, empName, month, year, url });
    await newPaySlip.save();
    res.status(201).json({ message: "Pay slip uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading pay slip", error });
  }
});

// Fetch All Pay Slips
router.get("/", async (req, res) => {
  try {
    const paySlips = await PaySlip.find();
    res.status(200).json(paySlips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pay slips", error });
  }
});

module.exports = router;
