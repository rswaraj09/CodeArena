import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Chip, Stack, Button, Skeleton } from '@mui/material';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useNavigate } from 'react-router-dom';
import quizService from '@/services/quizService';

const STATUS_STYLE = {
  LIVE: { label: 'Live now', color: '#34D399' },
  UPCOMING: { label: 'Upcoming', color: '#38BDF8' },
  ENDED: { label: 'Ended', color: '#8C9AAE' },
};

const StudentQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    quizService
      .list()
      .then((res) => setQuizzes(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load quizzes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>
        Quizzes & Tests
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        Attempt scheduled tests within active window with automated scoring.
      </Typography>

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
            const statusKey = q.status || 'UPCOMING';
            const style = STATUS_STYLE[statusKey] || STATUS_STYLE.UPCOMING;
            return (
              <Grid item xs={12} md={6} key={q.id}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
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

                  <Stack direction="row" spacing={2} sx={{ my: 2, color: 'text.secondary' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <QuizRoundedIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{q.questionCount} Questions ({q.totalMarks} Marks)</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <ScheduleRoundedIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{q.durationMinutes} Mins</Typography>
                    </Stack>
                  </Stack>

                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                    Window: {q.startTime ? new Date(q.startTime).toLocaleString() : 'N/A'} — {q.endTime ? new Date(q.endTime).toLocaleString() : 'N/A'}
                  </Typography>

                  {q.attempted ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircleRoundedIcon />}
                      onClick={() => navigate(`/quizzes/${q.id}/attempt`)}
                    >
                      Completed (Score: {q.userScore} / {q.totalMarks})
                    </Button>
                  ) : statusKey === 'LIVE' ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<PlayArrowRoundedIcon />}
                      onClick={() => navigate(`/quizzes/${q.id}/attempt`)}
                    >
                      Attempt Test Now
                    </Button>
                  ) : statusKey === 'UPCOMING' ? (
                    <Button fullWidth variant="outlined" disabled>
                      Scheduled — Starts Soon
                    </Button>
                  ) : (
                    <Button fullWidth variant="outlined" disabled>
                      Test Expired
                    </Button>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No tests scheduled right now. Check back soon!
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default StudentQuizzesPage;
