import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Link } from 'react-router-dom';
import problemService from '@/services/problemService';

const DIFFICULTY_COLOR = { Easy: 'success.main', Medium: '#FFB020', Hard: 'error.main' };

const ProblemsListPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    problemService
      .list(difficulty !== 'ALL' ? { difficulty } : {})
      .then((res) => {
        // Handle Spring Page or direct array
        const content = res.data?.content || res.data || [];
        setProblems(content);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load problems.'))
      .finally(() => setLoading(false));
  }, [difficulty]);

  const filtered = useMemo(
    () =>
      problems.filter((p) => {
        const matchesQuery = p.title ? p.title.toLowerCase().includes(query.toLowerCase()) : true;
        return matchesQuery;
      }),
    [query, problems]
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>Problems</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        {loading ? 'Loading problem repository...' : `${problems.length} problem${problems.length === 1 ? '' : 's'} available.`}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search problems…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
        />
        <ToggleButtonGroup
          exclusive
          size="small"
          value={difficulty}
          onChange={(_, v) => v && setDifficulty(v)}
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 2 } }}
        >
          <ToggleButton value="ALL">All</ToggleButton>
          <ToggleButton value="EASY">Easy</ToggleButton>
          <ToggleButton value="MEDIUM">Medium</ToggleButton>
          <ToggleButton value="HARD">Hard</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

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
                <TableCell width={40} />
                <TableCell>Title</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="right">Acceptance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const diffLabel = p.difficulty ? p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase() : 'Easy';
                  return (
                    <TableRow
                      key={p.slug || p.id}
                      component={Link}
                      to={`/problems/${p.slug}`}
                      hover
                      sx={{ textDecoration: 'none', cursor: 'pointer', '& td': { border: 'none', borderTop: '1px solid', borderColor: 'divider' } }}
                    >
                      <TableCell>
                        {p.solved && <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />}
                      </TableCell>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>{p.title}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: DIFFICULTY_COLOR[diffLabel] || 'text.primary', fontWeight: 600 }}>
                          {diffLabel}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {(p.tags || []).map((t) => <Chip key={t} label={t} size="small" />)}
                        </Stack>
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary' }}>
                        {p.acceptanceRate ? `${Math.round(p.acceptanceRate)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No problems found matching your filters.
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

export default ProblemsListPage;
