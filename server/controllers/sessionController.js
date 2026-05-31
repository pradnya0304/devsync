const Session = require('../models/Session');

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
const createSession = async (req, res) => {
  try {
    const { title, language } = req.body;

    const session = await Session.create({
      title,
      language,
      createdBy: req.user._id,
      participants: [req.user._id]
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/sessions
// @desc    Get all sessions for logged in user
// @access  Private
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { createdBy: req.user._id },
        { participants: req.user._id }
      ]
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/sessions/:id
// @desc    Get single session by ID
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/sessions/:id
// @desc    Delete a session
// @access  Private
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only creator can delete
    if (session.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/sessions/:id/code
// @desc    Update session code
// @access  Private
const updateSessionCode = async (req, res) => {
  try {
    const { code } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { code },
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createSession, 
  getMySessions, 
  getSessionById, 
  deleteSession,
  updateSessionCode
};