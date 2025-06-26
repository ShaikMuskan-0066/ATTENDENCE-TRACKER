const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { sendSMS } = require('../utils/sms');

router.post('/', async (req, res) => {
  try {
    const records = req.body.records;
    const date = new Date().toISOString().split('T')[0];

    if (!Array.isArray(records)) {
      return res.status(400).json({ error: "Expected an array of attendance records" });
    }

    for (let record of records) {
      const newAttendance = new Attendance({
        student: record.student, // ✅ correct field
        status: record.status,
        date
      });

      await newAttendance.save();

      // ✅ Send SMS to absentees
      if (record.status === 'Absent') {
        const student = await Student.findById(record.student);
        if (student?.parentMobile) {
          await sendSMS(
            student.parentMobile,
            `Your child ${student.name} was absent on ${date}.`
          );
        }
      }
    }

    res.status(201).send('✅ Attendance saved & SMS sent');
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).send('❌ Error saving attendance');
  }
});

module.exports = router;
