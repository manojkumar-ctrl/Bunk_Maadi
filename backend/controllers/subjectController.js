// backend/controllers/subjectController.js
const Subject = require('../models/Subject');

// @desc    Get all subjects for a user
// @route   GET /api/subjects
// @access  Private (requires user ID)
const getSubjects = async (req, res) => {
  try {
    // In a real auth system, userId would come from req.user.id
    const userId = req.query.userId || 'mockUserId'; // For now, use query param or mock
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
  const { name, totalClasses, attendedClasses, minAttendance } = req.body;
  // In a real auth system, userId would come from req.user.id
  const userId = req.body.userId || 'mockUserId'; // For now, use body param or mock

  if (!name || !totalClasses || !attendedClasses || minAttendance === undefined) { // Check for undefined minAttendance
    return res.status(400).json({ message: 'Please enter all required fields: name, totalClasses, attendedClasses, minAttendance' });
  }

  try {
    const newSubject = new Subject({
      user: userId,
      name,
      totalClasses,
      attendedClasses,
      minAttendance,
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
  const { name, totalClasses, attendedClasses, minAttendance, totalBunks, bunkHistory } = req.body;
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      // In a real auth system, check if subject.user === req.user.id
      subject.name = name !== undefined ? name : subject.name;
      subject.totalClasses = totalClasses !== undefined ? totalClasses : subject.totalClasses;
      subject.attendedClasses = attendedClasses !== undefined ? attendedClasses : subject.attendedClasses;
      subject.minAttendance = minAttendance !== undefined ? minAttendance : subject.minAttendance;
      subject.totalBunks = totalBunks !== undefined ? totalBunks : subject.totalBunks;
      subject.bunkHistory = bunkHistory !== undefined ? bunkHistory : subject.bunkHistory;

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
      // In a real auth system, check if subject.user === req.user.id
      await subject.deleteOne(); // Use deleteOne() for Mongoose 6+
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
