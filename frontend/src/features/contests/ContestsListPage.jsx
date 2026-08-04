import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Chip, Stack, Button, Skeleton } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import contestService from '@/services/contestService';

const STATUS_STYLE = {
  LIVE: { label: 'Live now', color: '#34D399' },
  UPCOMING: { label: 'Upcoming', color: '#38BDF8' },
  ENDED: { label: 'Ended', color: '#8C9AAE' },
};

const formatContestTiming = (contest) => {
  if (!contest.startTime) return 'Scheduled';
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  if (now > end || contest.status === 'ENDED') {
    return 'Ended';
  }
  if (now >= start && now <= end || contest.status === 'LIVE') {
    return 'Live now';
  }
  const diffHours = Math.floor((start - now) / 3600000);
  if (diffHours < 24) {
    return `Starts in ${diffHours <= 1 ? 'less than an hour' : `${diffHours} hours`}`;
  }
  const days = Math.floor(diffHours / 24);
  return `Starts in ${days} day${days > 1 ? 's' : ''}`;
};

const ContestsListPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    contestService
      .list()
      .then((res) => setContests(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load contests.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = (id) => {
    contestService
      .register(id)
      .then(() => {
        // Refresh contests list
        contestService.list().then((res) => setContests(res.data || []));
      })
      .catch(() => {});
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>Contests</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>Compete live, or catch up on past rounds.</Typography>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : contests.length > 0 ? (
        <Grid container spacing={2.5}>
          {contests.map((c) => {
            const statusKey = c.status || 'UPCOMING';
            const style = STATUS_STYLE[statusKey] || STATUS_STYLE.UPCOMING;
            return (
              <Grid item xs={12} md={6} key={c.id}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1.05rem', mb: 0.5 }}>{c.title}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <ScheduleRoundedIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption">{formatContestTiming(c)}</Typography>
                      </Stack>
                    </Box>
                    <Chip
                      size="small"
                      label={style.label}
                      sx={{ color: style.color, bgcolor: `${style.color}1F`, fontWeight: 600 }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ my: 2, color: 'text.secondary' }}>
                    <Typography variant="caption">{c.problemCount || 0} problems</Typography>
                    <Typography variant="caption">{c.participantCount || 0} participants</Typography>
                  </Stack>

                  <Button
                    fullWidth
                    variant={statusKey === 'LIVE' ? 'contained' : 'outlined'}
                    color={statusKey === 'LIVE' ? 'primary' : 'inherit'}
                    startIcon={<EmojiEventsRoundedIcon />}
                    sx={statusKey !== 'LIVE' ? { borderColor: 'divider' } : {}}
                    disabled={statusKey === 'ENDED'}
                    onClick={() => {
                      if (statusKey === 'UPCOMING') {
                        handleRegister(c.id);
                      }
                    }}
                  >
                    {statusKey === 'LIVE' ? 'Enter contest' : statusKey === 'UPCOMING' ? 'Register' : 'View results'}
                  </Button>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No contests currently available. Check back soon!
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ContestsListPage;
