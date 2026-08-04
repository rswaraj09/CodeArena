import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Stack, Avatar, LinearProgress, Skeleton } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import StatCard from '@/components/common/StatCard';
import { baseChartOptions } from '@/theme/chartSetup';
import dashboardService from '@/services/dashboardService';

const SkeletonCard = () => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
    <Skeleton variant="text" width={80} sx={{ mb: 1 }} />
    <Skeleton variant="text" width={60} height={40} />
    <Skeleton variant="text" width={100} />
  </Paper>
);

const TrainerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardService
      .getTrainerDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={260} height={40} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={360} sx={{ mb: 4 }} />
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[0, 1, 2, 3].map((i) => (
            <Grid item xs={6} md={3} key={i}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>Trainer dashboard</Typography>
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      </Box>
    );
  }

  const chartData = {
    labels: data.eventScores.map((e) => e.label),
    datasets: [
      {
        label: 'Avg. score',
        data: data.eventScores.map((e) => e.avgScore),
        backgroundColor: '#7C5CFF',
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };

  const pendingSublabel =
    data.pendingSubmissions > 0
      ? `${data.pendingSubmissions} pending grading`
      : 'All graded';

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>Trainer dashboard</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>Your cohorts, contests and assignments at a glance.</Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Students" value={data.studentCount} sublabel={`Registered on platform`} icon={GroupsRoundedIcon} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Active contests" value={data.activeContestCount} sublabel={data.activeContestSublabel} icon={EmojiEventsRoundedIcon} accent="secondary.main" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="My contests" value={data.myContestCount} sublabel={pendingSublabel} icon={AssignmentRoundedIcon} accent="success.main" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Avg. score" value={data.avgScorePercent > 0 ? `${data.avgScorePercent}%` : '—'} sublabel="Across all contests" icon={GradeRoundedIcon} accent="#FFB020" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 340 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>Average score by event</Typography>
            {data.eventScores.length > 0 ? (
              <Box sx={{ height: 260 }}>
                <Bar data={chartData} options={baseChartOptions} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 6, textAlign: 'center' }}>
                No contest data yet. Create a contest to see scores here.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 340 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>Top performers</Typography>
            {data.topPerformers.length > 0 ? (
              <Stack spacing={2}>
                {data.topPerformers.map((p, i) => (
                  <Stack key={`${p.name}-${i}`} direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: i === 0 ? 'primary.main' : 'background.paper', border: '1px solid', borderColor: 'divider', color: i === 0 ? '#12100A' : 'text.primary', fontSize: '0.8rem' }}>
                      {p.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.solved} solved</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{p.score}</Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 6, textAlign: 'center' }}>
                No submissions yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>Contest participation</Typography>
            {data.contestParticipation.length > 0 ? (
              <Stack spacing={2}>
                {data.contestParticipation.map((w) => (
                  <Box key={w.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2">{w.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{w.participationPercent}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={Math.min(w.participationPercent, 100)} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)' }} color="secondary" />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                No contests created yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainerDashboard;
