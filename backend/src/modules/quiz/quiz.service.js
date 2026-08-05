const { v4: uuidv4 } = require('uuid');
const Quiz = require('../../models/Quiz');
const QuizAttempt = require('../../models/QuizAttempt');
const { BadRequestException, ResourceNotFoundException } = require('../../common/errors');

async function create(request, creator) {
  if (request.startTime && request.endTime && !(new Date(request.endTime) > new Date(request.startTime))) {
    throw new BadRequestException('Test end time must be after the start time.');
  }

  let totalMarks = 0;
  const questions = request.questions.map((q) => {
    const points = Math.max(1, q.points || 5);
    totalMarks += points;
    return {
      id: uuidv4(),
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      points,
    };
  });

  const now = new Date();
  const startTime = request.startTime ? new Date(request.startTime) : now;
  const endTime = request.endTime ? new Date(request.endTime) : new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000); // 10 years default

  return Quiz.create({
    title: request.title,
    description: request.description || '',
    startTime,
    endTime,
    durationMinutes: request.durationMinutes || 30,
    totalMarks,
    createdById: creator.id,
    questions,
  });
}

async function list(currentUser) {
  const quizzes = await Quiz.find().sort({ createdAt: -1 });
  const userId = currentUser ? currentUser.id : null;

  return Promise.all(
    quizzes.map(async (q) => {
      let attempted = false;
      let score = null;
      if (userId) {
        const attempt = await QuizAttempt.findOne({ quizId: q.id, userId });
        if (attempt) {
          attempted = true;
          score = attempt.score;
        }
      }
      return {
        id: q.id,
        title: q.title,
        description: q.description,
        startTime: q.startTime,
        endTime: q.endTime,
        durationMinutes: q.durationMinutes,
        questionCount: q.questions.length,
        totalMarks: q.totalMarks,
        status: q.getStatus(),
        attempted,
        score,
      };
    })
  );
}

async function getDetail(quizId, currentUser) {
  const quiz = await getById(quizId);
  const userId = currentUser ? currentUser.id : null;

  let attempted = false;
  let score = null;
  if (userId) {
    const attempt = await QuizAttempt.findOne({ quizId, userId });
    if (attempt) {
      attempted = true;
      score = attempt.score;
    }
  }

  // Show answer keys only if the user created the quiz or already attempted it.
  const showAnswers = attempted || (currentUser && currentUser.id === quiz.createdById);

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    options: q.options,
    points: q.points,
    correctOptionIndex: showAnswers ? q.correctOptionIndex : null,
  }));

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    startTime: quiz.startTime,
    endTime: quiz.endTime,
    durationMinutes: quiz.durationMinutes,
    totalMarks: quiz.totalMarks,
    status: quiz.getStatus(),
    attempted,
    score,
    questions,
  };
}

async function submit(quizId, request, student) {
  const quiz = await getById(quizId);

  if (quiz.getStatus() === 'UPCOMING') {
    throw new BadRequestException('This test has not started yet.');
  }
  if (quiz.getStatus() === 'ENDED') {
    throw new BadRequestException('This test has already ended.');
  }
  if (await QuizAttempt.exists({ quizId, userId: student.id })) {
    throw new BadRequestException('You have already submitted this test.');
  }

  const userAnswers = request.answers || {};
  let totalScore = 0;
  const questionResults = quiz.questions.map((q) => {
    const selectedOpt = Object.prototype.hasOwnProperty.call(userAnswers, q.id) ? userAnswers[q.id] : null;
    const isCorrect = selectedOpt !== null && selectedOpt === q.correctOptionIndex;
    const pointsEarned = isCorrect ? q.points : 0;
    totalScore += pointsEarned;
    return {
      questionId: q.id,
      questionText: q.questionText,
      options: q.options,
      selectedOptionIndex: selectedOpt,
      correctOptionIndex: q.correctOptionIndex,
      correct: isCorrect,
      isCorrect: isCorrect,
      pointsEarned,
      maxPoints: q.points,
    };
  });

  const attempt = await QuizAttempt.create({
    quizId,
    userId: student.id,
    answers: userAnswers,
    score: totalScore,
    totalMarks: quiz.totalMarks,
    completed: true,
    submittedAt: new Date(),
  });

  try {
    const leaderboardService = require('../leaderboard/leaderboard.service');
    const { broadcastLeaderboard } = require('../../websocket/socket');
    const entries = await leaderboardService.getLeaderboard(null);
    broadcastLeaderboard(null, entries);
  } catch (_e) {
    // Ignore socket error if websocket is disabled
  }

  const percentage = quiz.totalMarks > 0 ? Math.round((totalScore / quiz.totalMarks) * 1000) / 10 : 0;

  return {
    attemptId: attempt.id,
    quizId: quiz.id,
    quizTitle: quiz.title,
    score: totalScore,
    totalMarks: quiz.totalMarks,
    percentage,
    completed: true,
    submittedAt: attempt.submittedAt,
    questionResults,
  };
}

async function getResult(quizId, student) {
  const quiz = await getById(quizId);
  const attempt = await QuizAttempt.findOne({ quizId, userId: student.id });
  if (!attempt) throw new ResourceNotFoundException('No submission found for this test.');

  const userAnswers = attempt.answers ? Object.fromEntries(attempt.answers) : {};
  const questionResults = quiz.questions.map((q) => {
    const selectedOpt = Object.prototype.hasOwnProperty.call(userAnswers, q.id) ? userAnswers[q.id] : null;
    const isCorrect = selectedOpt !== null && selectedOpt === q.correctOptionIndex;
    return {
      questionId: q.id,
      questionText: q.questionText,
      options: q.options,
      selectedOptionIndex: selectedOpt,
      correctOptionIndex: q.correctOptionIndex,
      correct: isCorrect,
      isCorrect: isCorrect,
      pointsEarned: isCorrect ? q.points : 0,
      maxPoints: q.points,
    };
  });

  const percentage = quiz.totalMarks > 0 ? Math.round((attempt.score / quiz.totalMarks) * 1000) / 10 : 0;

  return {
    attemptId: attempt.id,
    quizId: quiz.id,
    quizTitle: quiz.title,
    score: attempt.score,
    totalMarks: quiz.totalMarks,
    percentage,
    completed: attempt.completed,
    submittedAt: attempt.submittedAt,
    questionResults,
  };
}

async function getById(id) {
  const quiz = await Quiz.findById(id).catch(() => null);
  if (!quiz) throw ResourceNotFoundException.of('Test / Quiz', 'id', id);
  return quiz;
}

async function remove(quizId, user) {
  await getById(quizId);
  await Quiz.deleteOne({ _id: quizId });
  await QuizAttempt.deleteMany({ quizId });
  return true;
}

module.exports = { create, list, getDetail, submit, getResult, getById, remove };
