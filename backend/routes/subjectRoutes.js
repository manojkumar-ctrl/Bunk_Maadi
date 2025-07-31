// backend/routes/subjectRoutes.js
const express = require('express');
const {
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const router = express.Router();

router.route('/').get(getSubjects).post(addSubject);
router.route('/:id').put(updateSubject).delete(deleteSubject);

module.exports = router;
