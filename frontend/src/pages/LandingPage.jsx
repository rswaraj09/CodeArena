import { Box, Container, Grid, Stack, Typography, Button, Paper, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';

const TICKER_ROWS = [
  { rank: 1, name: 'A. Verma', score: 980, lang: 'C++' },
  { rank: 2, name: 'S. Iyer', score: 940, lang: 'Python' },
  { rank: 3, name: 'R. Khan', score: 915, lang: 'Java' },
  { rank: 4, name: 'M. Chen', score: 890, lang: 'C++' },
  { rank: 5, name: 'P. Das', score: 865, lang: 'JS' },
  { rank: 6, name: 'K. Rao', score: 840, lang: 'Python' },
];

const FEATURES = [
  { icon: BoltRoundedIcon, title: 'Sandboxed judge', text: 'Every submission runs inside an isolated Docker container with strict CPU, memory and time limits — Java, Python, C, C++ and JavaScript.' },
  { icon: InsightsRoundedIcon, title: 'Live leaderboards', text: 'WebSocket-powered rankings update the instant a verdict lands, factoring in penalties and submission order.' },
  { icon: QuizRoundedIcon, title: 'Auto-graded quizzes', text: 'MCQs, true/false, fill-in-the-blank and programming questions, scored the moment a student submits.' },
  { icon: GroupsRoundedIcon, title: 'Role-based workspace', text: 'Purpose-built dashboards for students, trainers and admins — nobody wades through a screen meant for someone else.' },
  { icon: WorkspacePremiumRoundedIcon, title: 'Verified certificates', text: 'QR-verifiable PDFs for workshops, participation and wins, generated and downloadable in one click.' },
  { icon: SecurityRoundedIcon, title: 'Built to enterprise habits', text: 'JWT auth, RBAC, rate limiting, audit logs and input validation from the first commit, not bolted on later.' },
];

const LandingPage = () => {
  return (
    <Box>
      {/* Hero */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={7}>
            <Chip
              size="small"
              label="Built for classrooms, coding clubs & placement training"
              sx={{ mb: 3, fontFamily: "'JetBrains Mono', monospace", bgcolor: 'rgba(124,92,255,0.12)', color: 'secondary.main', border: '1px solid rgba(124,92,255,0.3)' }}
            />
            <Typography variant="h1" sx={{ fontSize: { xs: '2.4rem', md: '3.4rem' }, lineHeight: 1.08, mb: 3 }}>
              Where every submission
              <br />
              earns its <Box component="span" sx={{ color: 'primary.main' }}>rank</Box>.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.05rem', maxWidth: 520, mb: 4 }}>
              CodeArena runs contests, workshops, assignments and quizzes with automated
              evaluation, sandboxed execution and a leaderboard that updates the moment a
              verdict comes back.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button component={Link} to="/register" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
                Start for free
              </Button>
              <Button component={Link} to="/login" variant="outlined" size="large" color="inherit" sx={{ borderColor: 'divider' }}>
                Sign in
              </Button>
            </Stack>
          </Grid>

          {/* Signature element: live scoreboard ticker */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                position: 'relative',
              }}
            >
              <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'text.secondary', letterSpacing: '0.06em' }}>
                  LIVE — WEEKLY CONTEST #42
                </Typography>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', boxShadow: '0 0 8px #34D399' }} />
              </Box>
              <Box sx={{ height: 260, overflow: 'hidden', position: 'relative' }}>
                <Box className="ca-ticker-track" sx={{ position: 'absolute', inset: 0 }}>
                  {[...TICKER_ROWS, ...TICKER_ROWS].map((row, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ px: 2.5, py: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                      <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", width: 24, color: row.rank <= 3 ? 'primary.main' : 'text.secondary', fontWeight: 700 }}>
                        {String(row.rank).padStart(2, '0')}
                      </Typography>
                      <Typography sx={{ flex: 1, fontSize: '0.88rem' }}>{row.name}</Typography>
                      <Chip size="small" label={row.lang} sx={{ height: 20 }} />
                      <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, width: 44, textAlign: 'right' }}>
                        {row.score}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.015)' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em' }}>
            EVERYTHING THE JUDGE NEEDS
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, mb: 6, mt: 1 }}>
            One platform, three roles, zero busywork.
          </Typography>
          <Grid container spacing={3}>
            {FEATURES.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'background.paper', borderRadius: 3 }}>
                  <f.icon sx={{ color: 'primary.main', fontSize: 26, mb: 1.5 }} />
                  <Typography variant="h6" sx={{ mb: 1, fontSize: '1.02rem' }}>{f.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{f.text}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,176,32,0.08), rgba(124,92,255,0.08))',
          }}
        >
          <Typography variant="h3" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, mb: 2 }}>
            Run your first contest this week.
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, maxWidth: 480, mx: 'auto' }}>
            Set up problems, invite your class or club, and watch the leaderboard fill in real time.
          </Typography>
          <Button component={Link} to="/register" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
            Create your account
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;
