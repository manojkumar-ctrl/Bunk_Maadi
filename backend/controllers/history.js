const Subject = require('../models/Subject');

// @desc  Get bunk history for a user
// @route GET /api/bunk-history/:userId
// @access Private
const getBunkHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const subjects = await Subject.find({ user: userId });

    // Extract and format only the bunk events from the history
    const bunkHistory = subjects.flatMap(subject =>
      subject.bunkHistory
        .filter(event => event.type === 'bunk')
        .map(bunk => ({
          subjectName: subject.name,
          bunkDate: bunk.date,
        }))
    );

    // Sort the history by date, most recent first
    bunkHistory.sort((a, b) => b.bunkDate - a.bunkDate);

    res.status(200).json(bunkHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBunkHistory,
};