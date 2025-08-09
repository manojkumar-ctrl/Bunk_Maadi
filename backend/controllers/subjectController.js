// backend/controllers/subjectController.js
const Subject = require('../models/Subject');
const Bunk = require('../models/Bunk');

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
      // initialize derived fields
      attendancePercentage: 0,
      maxBunkable: 0,
      bunkHistory: []
    });

    // compute derived fields before saving
    const total = subject.totalClasses;
    const attended = subject.attendedClasses;
    subject.attendancePercentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;
    // policy: max bunkable = credits * 2 - (classes bunked so far)
    const classesBunked = Math.max(0, total - attended);
    subject.maxBunkable = Math.max(0, (subject.credits * 2) - classesBunked);

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

    // Recalculate derived fields
    const total = Number(subject.totalClasses) || 0;
    const attended = Number(subject.attendedClasses) || 0;
    subject.attendancePercentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;
    const classesBunked = Math.max(0, total - attended);
    subject.maxBunkable = Math.max(0, (Number(subject.credits) * 2) - classesBunked);

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

    const subjectName = subject.name;

    await subject.deleteOne();

    // Also remove corresponding bunk history entries for this user/subject
    try {
      const deletionResult = await Bunk.deleteMany({ userId: userId, subject: subjectName });
      return res.json({ message: 'Subject removed', removedBunks: deletionResult.deletedCount || 0 });
    } catch (cleanupErr) {
      console.warn('Failed to cleanup bunks for deleted subject:', cleanupErr.message);
      return res.json({ message: 'Subject removed', removedBunks: 0 });
    }
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
