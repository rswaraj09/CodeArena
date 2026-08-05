import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Skeleton } from '@mui/material';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import leaderboardService from '@/services/leaderboardService';

const RANK_COLOR = { 1: '#FFB020', 2: '#C7CEDA', 3: '#B87333' };

const DEMO_ENTRIES = [
  { rank: 1, userId: 'demo-1', name: 'Aarav Verma', college: 'IIT Delhi', solved: 9, score: 980, totalRuntimeMs: 142 },
  { rank: 2, userId: 'demo-2', name: 'Sneha Iyer', college: 'NIT Trichy', solved: 8, score: 940, totalRuntimeMs: 198 },
  { rank: 3, userId: 'demo-3', name: 'Rohan Khan', college: 'BITS Pilani', solved: 7, score: 915, totalRuntimeMs: 210 },
  { rank: 4, userId: 'demo-4', name: 'Meera Chen', college: 'IIIT Hyderabad', solved: 6, score: 890, totalRuntimeMs: 280 },
  { rank: 5, userId: 'demo-5', name: 'Priya Das', college: 'DTU Delhi', solved: 5, score: 865, totalRuntimeMs: 310 },
  { rank: 6, userId: 'demo-6', name: 'Kiran Rao', college: 'VIT Vellore', solved: 4, score: 840, totalRuntimeMs: 420 },
];

const LeaderboardPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    leaderboardService
      .getLeaderboard()
      .then((res) => {
        let raw = res.data || [];
        if (!Array.isArray(raw) || raw.length === 0) {
          raw = DEMO_ENTRIES;
        }
        const sorted = [...raw].sort(
          (a, b) => (b.score - a.score) || (b.solved - a.solved) || ((a.totalRuntimeMs || 0) - (b.totalRuntimeMs || 0))
        );
        const ranked = sorted.map((item, idx) => ({ ...item, rank: idx + 1 }));
        setEntries(ranked);
      })
      .catch(() => {
        // Fallback to DEMO_ENTRIES on API load error as well
        setEntries(DEMO_ENTRIES);
      })
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
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        Ranked by total marks secured (highest at top, lowest at bottom), items solved, and execution time.
      </Typography>

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
