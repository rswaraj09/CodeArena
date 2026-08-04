import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Skeleton,
} from '@mui/material';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '@/services/quizService';

const QuizAttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active attempt state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setLoading(true);
    quizService
      .getDetail(id)
      .then((res) => {
        const quizData = res.data;
        setQuiz(quizData);

        if (quizData.attempted) {
          // Fetch existing attempt results
          return quizService.getResult(id).then((rRes) => setResult(rRes.data));
        } else {
          // Initialize countdown timer (duration or until endTime, whichever is smaller)
          const nowMs = Date.now();
          const endMs = new Date(quizData.endTime).getTime();
          const durationMs = quizData.durationMinutes * 60 * 1000;
          const targetMs = Math.min(nowMs + durationMs, endMs);
          const remainingSecs = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
          setTimeLeft(remainingSecs);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load test.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    if (result || timeLeft === null || quiz?.attempted) return;

    if (timeLeft <= 0) {
      handleFinalSubmit(); // Auto-submit when time expires
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result, quiz]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Number(optionIndex),
    }));
  };

  const handleFinalSubmit = () => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirm(false);

    quizService
      .submit(id, { answers })
      .then((res) => {
        setResult(res.data);
      })
      .catch((err) => alert(err.response?.data?.message || 'Failed to submit test.'))
      .finally(() => setSubmitting(false));
  };

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/quizzes')} sx={{ mb: 2 }}>
          Back to Quizzes
        </Button>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // ---- VIEW 1: TEST COMPLETED & SCORE RESULT ----
  if (result) {
    return (
      <Box sx={{ maxWidth: 850, mx: 'auto' }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/quizzes')} sx={{ mb: 3 }}>
          Back to Quizzes
        </Button>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, textAlign: 'center', mb: 3 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 56, color: 'success.main', mb: 1 }} />
          <Typography variant="h4" sx={{ fontSize: '1.8rem', mb: 1 }}>
            Test Completed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {result.quizTitle}
          </Typography>

          <Stack direction="row" justifyContent="center" spacing={4} sx={{ my: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                YOUR SCORE
              </Typography>
              <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2.2rem', fontWeight: 700, color: 'primary.main' }}>
                {result.score} / {result.totalMarks}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                PERCENTAGE
              </Typography>
              <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2.2rem', fontWeight: 700 }}>
                {result.percentage}%
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 2 }}>
          Detailed Answer Breakdown
        </Typography>

        <Stack spacing={2}>
          {result.questionResults.map((q, index) => (
            <Paper key={q.questionId || index} elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Q{index + 1}. {q.questionText}
                </Typography>
                <Chip
                  size="small"
                  icon={q.isCorrect ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
                  label={q.isCorrect ? `+${q.pointsEarned} pts` : `0 / ${q.maxPoints} pts`}
                  color={q.isCorrect ? 'success' : 'error'}
                />
              </Stack>

              <Stack spacing={1} sx={{ mt: 2 }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = q.selectedOptionIndex === oIdx;
                  const isCorrectOpt = q.correctOptionIndex === oIdx;

                  let borderColor = 'divider';
                  let bgcolor = 'transparent';
                  if (isCorrectOpt) {
                    borderColor = 'success.main';
                    bgcolor = 'rgba(52,211,153,0.08)';
                  } else if (isSelected && !q.isCorrect) {
                    borderColor = 'error.main';
                    bgcolor = 'rgba(251,100,103,0.08)';
                  }

                  return (
                    <Box
                      key={oIdx}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor,
                        bgcolor,
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: isCorrectOpt || isSelected ? 600 : 400 }}>
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </Typography>
                      {isCorrectOpt && (
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                          Correct Answer
                        </Typography>
                      )}
                      {isSelected && !isCorrectOpt && (
                        <Typography variant="caption" color="error.main" fontWeight={600}>
                          Your Selection
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  }

  // ---- VIEW 2: ACTIVE TEST ATTEMPT ----
  const currentQ = quiz.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Top Header Bar with Timer & Title */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
              {quiz.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Question {currentQuestionIndex + 1} of {quiz.questions.length} ({answeredCount} answered)
            </Typography>
          </Box>
          <Chip
            icon={<TimerRoundedIcon />}
            label={formatTime(timeLeft)}
            color={timeLeft < 180 ? 'error' : 'secondary'}
            sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.95rem', px: 1 }}
          />
        </Stack>
        <LinearProgress variant="determinate" value={progressPercent} sx={{ mt: 2, height: 6, borderRadius: 3 }} />
      </Paper>

      {/* Question Card */}
      {currentQ && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.15rem' }}>
              Q{currentQuestionIndex + 1}. {currentQ.questionText}
            </Typography>
            <Chip size="small" label={`${currentQ.points} Pts`} variant="outlined" />
          </Stack>

          <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
            <RadioGroup
              value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : ''}
              onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
            >
              <Stack spacing={1.5}>
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = answers[currentQ.id] === oIdx;
                  return (
                    <Paper
                      key={oIdx}
                      variant="outlined"
                      onClick={() => handleSelectOption(currentQ.id, oIdx)}
                      sx={{
                        p: 1.5,
                        px: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'rgba(124,92,255,0.08)' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <FormControlLabel
                        value={oIdx}
                        control={<Radio size="small" />}
                        label={`${String.fromCharCode(65 + oIdx)}. ${opt}`}
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  );
                })}
              </Stack>
            </RadioGroup>
          </FormControl>
        </Paper>
      )}

      {/* Footer Navigation Buttons */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
        >
          Previous
        </Button>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <Button
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
          >
            Next Question
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={() => setShowConfirm(true)}
          >
            Submit Test
          </Button>
        )}
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle>Submit Test?</DialogTitle>
        <DialogContent display="block">
          <Typography variant="body2" sx={{ mb: 1 }}>
            You have answered {answeredCount} out of {quiz.questions.length} questions.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Once submitted, your answers will be automatically graded and cannot be changed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowConfirm(false)}>Continue Test</Button>
          <Button variant="contained" color="success" onClick={handleFinalSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Confirm Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizAttemptPage;
