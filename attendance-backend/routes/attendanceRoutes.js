const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { sendSMS } = require('../utils/sms');

router.post('/', async (req, res) => {
  try {
    const records = req.body;

    // ✅ Validate incoming data
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "Expected a non-empty array of attendance records" });
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dateStart = new Date(dateStr);
    const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

    for (const r of records) {
      const { student, status } = r;

      if (!student || !status) {
        console.warn("⚠️ Skipping invalid record:", r);
        continue;
      }

      // ✅ Avoid duplicate attendance for the same day
      const exists = await Attendance.findOne({
        student,
        date: { $gte: dateStart, $lt: dateEnd }
      });

      if (exists) {
        console.log(`⏩ Already marked: ${student} for ${dateStr}`);
        continue;
      }

      await Attendance.create({
        student,
        status,
        date: today
      });

      // ✅ Send SMS if Absent
      if (status === 'Absent') {
        const studentDoc = await Student.findById(student);
        if (studentDoc?.parentMobile) {
          const phone = studentDoc.parentMobile.startsWith('+')
            ? studentDoc.parentMobile
            : `+91${studentDoc.parentMobile}`;
          try {
            await sendSMS(phone, `Your child ${studentDoc.name} was absent on ${dateStr}.`);
            console.log(`✅ SMS sent to ${phone}`);
          } catch (err) {
            console.warn(`⚠️ Failed to send SMS to ${phone}: ${err.message}`);
          }
        }
      }
    }

    res.status(201).json({ message: '✅ Attendance saved and SMS sent (if Absent)' });

  } catch (error) {
    console.error("❌ Error in attendance POST:", error.message);
    res.status(500).json({ error: 'Error saving attendance', details: error.message });
  }
});

module.exports = router;
