// 📄 File: backend/controllers/subjectController.js

const Subject = require('../models/Subject');

// @desc    Get all subjects for a user
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const userId = req.query.userId || 'mockUserId';
    const subjects = await Subject.find({ user: userId });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new subject
// @route   POST /api/subjects
// @access  Private
const addSubject = async (req, res) => {
  const { name, totalClasses, attendedClasses, minAttendance, credits } = req.body;
  const userId = req.body.userId || 'mockUserId';

  if (
    !name ||
    totalClasses === undefined ||
    attendedClasses === undefined ||
    minAttendance === undefined ||
    credits === undefined
  ) {
    return res.status(400).json({
      message: 'Please enter all required fields: name, totalClasses, attendedClasses, minAttendance, credits'
    });
  }

  try {
    const newSubject = new Subject({
      user: userId,
      name,
      totalClasses,
      attendedClasses,
      minAttendance,
      credits,
      totalBunks: 0,
      bunkHistory: []
    });

    const createdSubject = await newSubject.save();
    res.status(201).json(createdSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
  const { name, totalClasses, attendedClasses, minAttendance, totalBunks, bunkHistory, credits } = req.body;
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      subject.name = name !== undefined ? name : subject.name;
      subject.totalClasses = totalClasses !== undefined ? totalClasses : subject.totalClasses;
      subject.attendedClasses = attendedClasses !== undefined ? attendedClasses : subject.attendedClasses;
      subject.minAttendance = minAttendance !== undefined ? minAttendance : subject.minAttendance;
      subject.totalBunks = totalBunks !== undefined ? totalBunks : subject.totalBunks;
      subject.bunkHistory = bunkHistory !== undefined ? bunkHistory : subject.bunkHistory;
      subject.credits = credits !== undefined ? credits : subject.credits;

      const updatedSubject = await subject.save();
      res.json(updatedSubject);
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      await subject.deleteOne();
      res.json({ message: 'Subject removed' });
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
};
