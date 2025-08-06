const Subject = require('../models/Subject');

// @desc  Record a bunk for a subject
// @route POST /api/bunk
// @access Private
const recordBunk = async (req, res) => {
  const { subjectId, userId } = req.body;

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Increment counters for a bunk
    subject.totalClasses += 1;
    subject.totalBunks += 1;

    // Push the new bunk event into the history array
    subject.bunkHistory.push({ type: 'bunk' });

    const updatedSubject = await subject.save();

    // The TopBunker logic remains unchanged
    // ... (your existing TopBunker logic)

    res.status(200).json({
      message: 'Bunk recorded successfully',
      subject: updatedSubject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  recordBunk,
};

