import { Box, Grid, Paper, Typography, Stack, Chip } from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import StatCard from '@/components/common/StatCard';
import { baseChartOptions } from '@/theme/chartSetup';

const userGrowth = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  datasets: [
    {
      label: 'Daily active users',
      data: [120, 180, 210, 260, 300, 340],
      borderColor: '#FFB020',
      backgroundColor: 'rgba(255,176,32,0.1)',
      tension: 0.35,
      fill: true,
    },
  ],
};

const languageUsage = {
  labels: ['Java', 'Python', 'C++', 'JavaScript', 'C'],
  datasets: [
    {
      data: [34, 28, 22, 12, 4],
      backgroundColor: ['#FFB020', '#7C5CFF', '#34D399', '#38BDF8', '#FB6467'],
      borderWidth: 0,
    },
  ],
};

const AdminDashboard = () => (
  <Box>
    <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>Platform overview</Typography>
    <Typography sx={{ color: 'text.secondary', mb: 4 }}>System-wide activity across all cohorts and trainers.</Typography>

    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      <Grid item xs={6} md={3}>
        <StatCard label="Total users" value="3,482" sublabel="+126 this week" icon={GroupsRoundedIcon} />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatCard label="Trainers" value="47" sublabel="6 pending approval" icon={SchoolRoundedIcon} accent="secondary.main" />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatCard label="Contests run" value="128" sublabel="14 this month" icon={EmojiEventsRoundedIcon} accent="success.main" />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatCard label="Judge uptime" value="99.94%" sublabel="Last 30 days" icon={StorageRoundedIcon} accent="#38BDF8" />
      </Grid>
    </Grid>

    <Grid container spacing={2.5}>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 340 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>Active users over time</Typography>
          <Box sx={{ height: 260 }}>
            <Line data={userGrowth} options={baseChartOptions} />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 340, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>Language usage</Typography>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <Doughnut data={languageUsage} options={{ ...baseChartOptions, scales: undefined, cutout: '65%' }} />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', mb: 2 }}>Pending approvals</Typography>
          <Stack spacing={1.5}>
            {[
              { label: 'Trainer signup — Priya Nair', type: 'Trainer' },
              { label: 'Workshop — "Intro to Kotlin"', type: 'Workshop' },
              { label: 'Trainer signup — Arjun Mehta', type: 'Trainer' },
            ].map((item) => (
              <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2">{item.label}</Typography>
                <Chip size="small" label={item.type} />
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

export default AdminDashboard;
