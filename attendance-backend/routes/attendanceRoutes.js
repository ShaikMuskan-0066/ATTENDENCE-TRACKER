const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { sendSMS } = require('../utils/sms');

// POST /attendance
router.post('/', async (req, res) => {
  try {
    const records = req.body;

    // ✅ Validate input
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "Expected a non-empty array of attendance records" });
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dateStart = new Date(dateStr);
    const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000); // Next day

    for (const record of records) {
      const { student, name, rollNo, parentMobile, status } = record;

      if (!student || !status) {
        console.warn("⚠️ Skipping incomplete record:", record);
        continue;
      }

      // ✅ Prevent duplicate entries
      const exists = await Attendance.findOne({
        student,
        date: { $gte: dateStart, $lt: dateEnd }
      });

      if (exists) {
        console.log(`⏩ Duplicate: ${name} (${rollNo}) already marked on ${dateStr}`);
        continue;
      }

      const newAttendance = new Attendance({
        student,
        name,
        rollNo,
        parentMobile,
        status,
        date: today
      });

      await newAttendance.save();

      // ✅ Send SMS if Absent
      if (status === 'Absent' && parentMobile) {
        const formatted = parentMobile.startsWith('+') ? parentMobile : `+91${parentMobile}`;
        console.log(`⏳ Sending SMS to ${formatted}`);

        try {
          const smsResult = await sendSMS(
            formatted,
            `Your child ${name} was absent on ${dateStr}.`
          );
          if (smsResult && smsResult.sid) {
            console.log(`✅ SMS sent: SID ${smsResult.sid}`);
          } else {
            console.warn("⚠️ SMS did not return SID");
          }
        } catch (smsErr) {
          console.error("❌ SMS failed:", smsErr.message);
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
