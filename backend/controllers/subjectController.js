// backend/controllers/subjectController.js
const Subject = require('../models/Subject');

// GET /api/subjects
const getSubjects = async (req, res) => {
  try {
    console.log('GET /api/subjects called');
    console.log('req.auth exists?', !!req.auth);
    console.log('req.auth.userId:', req.auth?.userId);

    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: 'Not authenticated (req.auth.userId missing).' });
    }

    const userId = req.auth.userId; // <- Clerk provides this
    const subjects = await Subject.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json(subjects);
  } catch (error) {
    console.error('Error in getSubjects:', error);
    return res.status(500).json({ message: 'Server error in getSubjects', error: error.message });
  }
};

// POST /api/subjects
const addSubject = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: 'Not authenticated (req.auth.userId missing).' });
    }

    const userId = req.auth.userId;
    const { name, totalClasses, attendedClasses, minAttendance, credits } = req.body;

    if (!name) return res.status(400).json({ message: 'Subject name required' });

    const subject = new Subject({
      user: userId, // IMPORTANT: your schema uses field `user`
      name,
      totalClasses: Number(totalClasses) || 0,
      attendedClasses: Number(attendedClasses) || 0,
      minAttendance: Number(minAttendance) || 75,
      credits: Number(credits) || 1,
      totalBunks: 0,
      bunkHistory: []
    });

    const created = await subject.save();
    return res.status(201).json(created);
  } catch (error) {
    console.error('Error in addSubject:', error);
    return res.status(500).json({ message: 'Server error in addSubject', error: error.message });
  }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const userId = req.auth.userId;
    const subject = await Subject.findOne({ _id: req.params.id, user: userId });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const { name, totalClasses, attendedClasses, minAttendance, totalBunks, bunkHistory, credits } = req.body;

    subject.name = name ?? subject.name;
    subject.totalClasses = totalClasses ?? subject.totalClasses;
    subject.attendedClasses = attendedClasses ?? subject.attendedClasses;
    subject.minAttendance = minAttendance ?? subject.minAttendance;
    subject.totalBunks = totalBunks ?? subject.totalBunks;
    subject.bunkHistory = bunkHistory ?? subject.bunkHistory;
    subject.credits = credits ?? subject.credits;

    const updated = await subject.save();
    return res.json(updated);
  } catch (error) {
    console.error('Error in updateSubject:', error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const userId = req.auth.userId;
    const subject = await Subject.findOne({ _id: req.params.id, user: userId });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    await subject.deleteOne();
    return res.json({ message: 'Subject removed' });
  } catch (error) {
    console.error('Error in deleteSubject:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
};
