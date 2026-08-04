import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Stack, Chip, LinearProgress, Skeleton } from '@mui/material';
import { Line } from 'react-chartjs-2';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AssignmentLateRoundedIcon from '@mui/icons-material/AssignmentLateRounded';
import StatCard from '@/components/common/StatCard';
import VerdictChip from '@/components/common/VerdictChip';
import { baseChartOptions } from '@/theme/chartSetup';
import { useAuth } from '@/app/hooks';
import dashboardService from '@/services/dashboardService';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const SkeletonCard = () => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
    <Skeleton variant="text" width={80} sx={{ mb: 1 }} />
    <Skeleton variant="text" width={60} height={40} />
    <Skeleton variant="text" width={100} />
  </Paper>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardService
      .getStudentDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load student dashboard.'))
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
        <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </Typography>
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      </Box>
    );
  }

  const activityData = {
    labels: data.weeklyActivity.map((a) => a.day),
    datasets: [
      {
        label: 'Problems solved',
        data: data.weeklyActivity.map((a) => a.count),
        borderColor: '#FFB020',
        backgroundColor: 'rgba(255,176,32,0.12)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>
        Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>Here's where you stand today.</Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Rank" value={data.rankLabel} sublabel={data.rankPercentile} icon={EmojiEventsRoundedIcon} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Solved" value={data.solvedCount} sublabel={`of ${data.totalProblemsCount} problems`} icon={CheckCircleRoundedIcon} accent="success.main" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Streak" value={`${data.streakDays} days`} sublabel={`Personal best: ${data.personalBestStreak}`} icon={LocalFireDepartmentRoundedIcon} accent="#FB6467" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Upcoming" value={data.pendingCount} sublabel="Contests & events" icon={AssignmentLateRoundedIcon} accent="secondary.main" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 340 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>This week's activity</Typography>
            <Box sx={{ height: 260 }}>
              <Line data={activityData} options={baseChartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 340, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>Upcoming</Typography>
            {data.upcomingEvents.length > 0 ? (
              <Stack spacing={2}>
                {data.upcomingEvents.map((item) => (
                  <Box key={item.id || item.title} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.when}</Typography>
                    </Box>
                    <Chip size="small" label={item.type} />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 6, textAlign: 'center' }}>
                No upcoming contests right now.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>Recent submissions</Typography>
            {data.recentSubmissions.length > 0 ? (
              <Stack spacing={1.5}>
                {data.recentSubmissions.map((s, i) => (
                  <Box key={s.id || i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: i < data.recentSubmissions.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{s.problemTitle}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.language} · {formatTimeAgo(s.createdAt)}</Typography>
                    </Box>
                    <VerdictChip verdict={s.verdict} />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                No submissions yet. Start solving problems!
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>Skill progress</Typography>
            {data.skillProgress.length > 0 ? (
              <Stack spacing={2}>
                {data.skillProgress.map((skill) => (
                  <Box key={skill.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2">{skill.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{skill.percentage}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={Math.min(skill.percentage, 100)} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)' }} />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                No skill progress yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
