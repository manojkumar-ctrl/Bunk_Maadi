// backend/routes/subjectRoutes.js
const express = require('express');
const { requireAuth } = require('@clerk/express'); // protect routes
const {
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

const router = express.Router();

// Require login for all subject routes
router.use(requireAuth());

router.route('/').get(getSubjects).post(addSubject);
router.route('/:id').put(updateSubject).delete(deleteSubject);

module.exports = router;
