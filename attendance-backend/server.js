require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ExcelJS = require('exceljs');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT ?? 5000;
const MONGO_URI = process.env.MONGO_URI;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE;

if (!MONGO_URI || !TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
app.locals.twilioClient = twilioClient;
app.locals.twilioPhone = TWILIO_PHONE;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'https://attendence-tracker-1.onrender.com',
    'https://attendence-tracer.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ✅ Connect MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

// ✅ Import models
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

// ✅ Routes
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/attendance', attendanceRoutes);

// ✅ Add Student
app.post('/students', async (req, res) => {
  try {
    const { name, rollNo, parentMobile } = req.body;
    const student = new Student({ name, rollNo, parentMobile });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Get All Students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get Attendance by Date
app.get('/attendance/:date', async (req, res) => {
  try {
    const dateParam = new Date(req.params.date);
    const nextDay = new Date(dateParam);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: dateParam, $lt: nextDay }
    }).populate('student', 'name rollNo');

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Export to Excel
app.get('/export/excel', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');

    sheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Roll No', key: 'rollNo', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    const attendanceData = await Attendance.find().populate('student');

    attendanceData.forEach(record => {
      if (record.student) {
        sheet.addRow({
          name: record.student.name,
          rollNo: record.student.rollNo,
          date: record.date.toISOString().split('T')[0],
          status: record.status
        });
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to export Excel', details: error.message });
  }
});

// ✅ Delete student + attendance
app.delete('/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await Attendance.deleteMany({ student: studentId });

    res.json({ message: 'Student and attendance deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
