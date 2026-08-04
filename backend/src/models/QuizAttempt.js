const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: { type: String, required: true },
    userId: { type: String, required: true },
    answers: { type: Map, of: Number, default: {} },
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, collection: 'quiz_attempts' }
);

quizAttemptSchema.index({ quizId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
