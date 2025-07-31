// backend/controllers/bunkController.js
const Subject = require('../models/Subject');
const TopBunker = require('../models/TopBunker');

// @desc    Record a bunk for a subject
// @route   POST /api/bunk
// @access  Private
const recordBunk = async (req, res) => {
  const { subjectId, userId } = req.body; // userId needed for TopBunker, from auth in real app

  try {
    const subject = await Subject.findById(subjectId);

    if (subject) {
      // In a real auth system, check if subject.user === req.user.id
      subject.totalBunks += 1;
      subject.attendedClasses = Math.max(0, subject.attendedClasses - 1); // Bunk means one less attended
      subject.bunkHistory.push({ date: new Date(), type: 'bunk' });

      await subject.save();

      // Update Top Bunkers
      let topBunker = await TopBunker.findOne({ subjectId: subject._id });

      if (!topBunker) {
        topBunker = new TopBunker({
          subjectId: subject._id,
          subjectName: subject.name,
          bunkers: [],
        });
      }

      const existingBunkerIndex = topBunker.bunkers.findIndex(
        (b) => b.userId === userId
      );

      if (existingBunkerIndex > -1) {
        topBunker.bunkers[existingBunkerIndex].totalBunks = subject.totalBunks;
        topBunker.bunkers[existingBunkerIndex].lastBunk = new Date();
      } else {
        topBunker.bunkers.push({
          userId: userId,
          totalBunks: subject.totalBunks,
          lastBunk: new Date(),
        });
      }

      // Sort and limit to top N (e.g., top 5)
      topBunker.bunkers.sort((a, b) => b.totalBunks - a.totalBunks);
      topBunker.bunkers = topBunker.bunkers.slice(0, 5); // Keep top 5

      await topBunker.save();

      res.json({ message: 'Bunk recorded', subject: subject });
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record attendance for a subject
// @route   POST /api/attend
// @access  Private
const recordAttendance = async (req, res) => {
  const { subjectId } = req.body;

  try {
    const subject = await Subject.findById(subjectId);

    if (subject) {
      // In a real auth system, check if subject.user === req.user.id
      subject.attendedClasses += 1;
      subject.totalClasses += 1; // Assuming attending also increases total classes
      subject.bunkHistory.push({ date: new Date(), type: 'attended' });

      await subject.save();
      res.json({ message: 'Attendance recorded', subject: subject });
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top bunkers for all or a specific subject
// @route   GET /api/leaderboard/top-bunkers
// @access  Public
const getTopBunkers = async (req, res) => {
  try {
    const topBunkers = await TopBunker.find().populate('subjectId', 'name'); // Populate subject name
    res.json(topBunkers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  recordBunk,
  recordAttendance,
  getTopBunkers,
};
