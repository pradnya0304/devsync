const express = require('express');
const router = express.Router();
const {
  createSession,
  getMySessions,
  getSessionById,
  deleteSession,
  updateSessionCode
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/', protect, getMySessions);
router.get('/:id', protect, getSessionById);
router.put('/:id/code', protect, updateSessionCode);
router.delete('/:id', protect, deleteSession);

module.exports = router;