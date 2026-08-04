import { Box, Button, Container, Stack } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Logo from '@/components/common/Logo';

const PublicLayout = () => {
  const location = useLocation();
  const hideAuthLinks = ['/login', '/register'].includes(location.pathname);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(10,14,20,0.75)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.75 }}>
            <Link to="/">
              <Logo />
            </Link>
            {!hideAuthLinks && (
              <Stack direction="row" spacing={1.5}>
                <Button component={Link} to="/login" color="inherit">
                  Sign in
                </Button>
                <Button component={Link} to="/register" variant="contained" color="primary">
                  Get started
                </Button>
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
            <Logo size="sm" />
            <Box sx={{ color: 'text.secondary', fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace" }}>
              © {new Date().getFullYear()} CodeArena. Built for classrooms, clubs and contests.
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;
