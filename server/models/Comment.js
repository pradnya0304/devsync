const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  line: {
    type: Number,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);