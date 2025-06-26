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

module.exports = router;
