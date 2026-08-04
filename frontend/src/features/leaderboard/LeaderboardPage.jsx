import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Skeleton } from '@mui/material';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import leaderboardService from '@/services/leaderboardService';

const RANK_COLOR = { 1: '#FFB020', 2: '#C7CEDA', 3: '#B87333' };

const LeaderboardPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    leaderboardService
      .getLeaderboard()
      .then((res) => setEntries(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="h4" sx={{ fontSize: '1.6rem' }}>Leaderboard</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <CircleRoundedIcon sx={{ fontSize: 9, color: 'success.main' }} />
          <Typography variant="caption" color="text.secondary">Global standings</Typography>
        </Stack>
      </Stack>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>Ranked by problems solved, total score, and execution time.</Typography>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : loading ? (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={64}>Rank</TableCell>
                <TableCell>Participant</TableCell>
                <TableCell>College</TableCell>
                <TableCell align="center">Solved</TableCell>
                <TableCell align="right">Runtime</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length > 0 ? (
                entries.map((r) => (
                  <TableRow key={r.userId || r.rank} sx={{ '& td': { borderColor: 'divider' } }}>
                    <TableCell>
                      <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: RANK_COLOR[r.rank] || 'text.secondary' }}>
                        #{r.rank}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                          {r.name ? r.name[0] : 'U'}
                        </Avatar>
                        <Typography variant="body2">{r.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{r.college || 'N/A'}</Typography></TableCell>
                    <TableCell align="center">{r.solved}</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary', fontFamily: "'JetBrains Mono', monospace" }}>
                      {r.totalRuntimeMs ? `${r.totalRuntimeMs} ms` : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{r.score}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No leaderboard standings yet. Be the first to solve a problem!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default LeaderboardPage;
