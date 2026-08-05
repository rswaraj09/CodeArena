import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Skeleton,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import quizService from '@/services/quizService';

const STATUS_STYLE = {
  LIVE: { label: 'Live now', color: '#34D399' },
  UPCOMING: { label: 'Upcoming', color: '#38BDF8' },
  ENDED: { label: 'Ended', color: '#8C9AAE' },
};

const TrainerQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      points: 5,
    },
  ]);

  const loadQuizzes = () => {
    setLoading(true);
    quizService
      .list()
      .then((res) => setQuizzes(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 5,
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleCreateQuiz = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title,
      description,
      durationMinutes: Number(durationMinutes || 30),
      questions: questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: Number(q.correctOptionIndex),
        points: Number(q.points || 5),
      })),
    };

    quizService
      .create(payload)
      .then(() => {
        setOpenModal(false);
        resetForm();
        loadQuizzes();
      })
      .catch((err) => alert(err.response?.data?.message || 'Failed to create test.'))
      .finally(() => setSubmitting(false));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDurationMinutes(30);
    setQuestions([
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 5,
      },
    ]);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>
            Tests & Assessments
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Create auto-graded tests with MCQ answer keys and duration settings.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setOpenModal(true)}
        >
          Create New Test
        </Button>
      </Stack>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : quizzes.length > 0 ? (
        <Grid container spacing={2.5}>
          {quizzes.map((q) => {
            const style = STATUS_STYLE[q.status] || STATUS_STYLE.LIVE;
            return (
              <Grid item xs={12} md={6} key={q.id}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                        {q.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {q.description || 'No description provided.'}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={style.label}
                      sx={{ color: style.color, bgcolor: `${style.color}1F`, fontWeight: 600 }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ mt: 2, color: 'text.secondary' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <QuizRoundedIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{q.questionCount} Questions ({q.totalMarks} Marks)</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <ScheduleRoundedIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{q.durationMinutes} Mins Duration</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No tests created yet. Click "Create New Test" to get started!
          </Typography>
          <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setOpenModal(true)}>
            Create New Test
          </Button>
        </Paper>
      )}

      {/* Create Test Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleCreateQuiz}>
          <DialogTitle>Create New Auto-Graded Test</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Test Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Duration (Minutes)"
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                label="Description / Instructions"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={2}
                fullWidth
              />

              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ fontSize: '1rem' }}>Questions & Correct MCQ Answers</Typography>

              {questions.map((q, qIndex) => (
                <Paper key={qIndex} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" color="primary" fontWeight={700}>
                        Question {qIndex + 1}
                      </Typography>
                      {questions.length > 1 && (
                        <IconButton size="small" color="error" onClick={() => handleRemoveQuestion(qIndex)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={9}>
                        <TextField
                          label="Question Text"
                          value={q.questionText}
                          onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                          required
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Points / Marks"
                          type="number"
                          value={q.points}
                          onChange={(e) => handleQuestionChange(qIndex, 'points', e.target.value)}
                          required
                          fullWidth
                          size="small"
                        />
                      </Grid>
                    </Grid>

                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ fontSize: '0.85rem', mb: 1, color: 'text.primary', fontWeight: 600 }}>
                        Options — Select the radio button for the Correct Answer:
                      </FormLabel>
                      <RadioGroup
                        value={Number(q.correctOptionIndex)}
                        onChange={(e) => handleQuestionChange(qIndex, 'correctOptionIndex', Number(e.target.value))}
                      >
                        <Grid container spacing={1.5}>
                          {q.options.map((opt, oIndex) => {
                            const isCorrect = Number(q.correctOptionIndex) === oIndex;
                            return (
                              <Grid item xs={12} sm={6} key={oIndex}>
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    p: 1,
                                    px: 1.5,
                                    borderRadius: 2,
                                    borderColor: isCorrect ? 'success.main' : 'divider',
                                    bgcolor: isCorrect ? 'rgba(52,211,153,0.08)' : 'transparent',
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <FormControlLabel
                                      value={oIndex}
                                      control={<Radio size="small" color="success" />}
                                      label=""
                                      sx={{ mr: 0 }}
                                    />
                                    <TextField
                                      placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                      value={opt}
                                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                      required
                                      fullWidth
                                      size="small"
                                    />
                                    {isCorrect && (
                                      <Chip
                                        size="small"
                                        label="Correct Answer"
                                        color="success"
                                        sx={{ height: 24, fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Stack>
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </RadioGroup>
                    </FormControl>
                  </Stack>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={handleAddQuestion}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Another Question
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Test'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TrainerQuizzesPage;
