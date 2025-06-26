const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

router.get('/excel', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');

    // Header Row
    sheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Roll Number', key: 'roll', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Fetch Attendance
    const records = await Attendance.find().populate('student');

    // Add rows
    records.forEach((rec) => {
      sheet.addRow({
        name: rec.student.name,
        roll: rec.student.rollNumber,
        date: rec.date.toISOString().split('T')[0],
        status: rec.status
      });
    });

    // Set headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Attendance_Report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to export Excel', details: err.message });
  }
});

module.exports = router;
