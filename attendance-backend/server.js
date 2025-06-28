require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT ?? 5000;

// ✅ Load .env variables
const { MONGO_URI, TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = process.env;

if (!MONGO_URI || !TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

// ✅ Initialize Twilio client directly
const twilio = require('twilio');
const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

// ✅ Export Twilio from global place (optional but safe)
app.locals.twilioClient = twilioClient;
app.locals.twilioPhone = TWILIO_PHONE;

// ✅ CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://attendence-tracker-1.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
app.use('/attendance', require('./routes/attendanceRoutes'));
app.use('/export', require('./routes/exportRoutes'));

// ✅ Student Routes
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

app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Attendance by Date
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

// ✅ Delete Student and Attendance
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

// ✅ Optional: Test SMS route
const { sendSMS } = require('./utils/sms');
app.get('/test-sms', async (req, res) => {
  try {
    await sendSMS('+91YOUR_PHONE_NUMBER', 'Test message from attendance app');
    res.send('✅ SMS sent');
  } catch (err) {
    res.status(500).send('❌ SMS failed: ' + err.message);
  }
});

// ✅ Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
