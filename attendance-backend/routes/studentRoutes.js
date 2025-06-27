const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

router.post('/add', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send('Student added');
  } catch (error) {
    res.status(500).send('Error adding student');
  }
});

router.get('/', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

router.delete('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const deleted = await Student.findByIdAndDelete(studentId);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    await require('../models/Attendance').deleteMany({ student: studentId });
    res.json({ message: 'Student and their attendance deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;
