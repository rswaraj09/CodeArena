import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import Visibility from '@mui/icons-material/VisibilityRounded';
import VisibilityOff from '@mui/icons-material/VisibilityOffRounded';
import { useAppDispatch, useAuth } from '@/app/hooks';
import { login, clearAuthError } from '@/features/auth/authSlice';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      const dest = location.state?.from?.pathname
        || (result.payload.role === 'ADMIN' ? '/admin' : result.payload.role === 'TRAINER' ? '/trainer' : '/student');
      navigate(dest, { replace: true });
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 8, md: 12 } }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h4" sx={{ fontSize: '1.5rem', mb: 0.5 }}>Sign in</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Enter the arena and pick up where you left off.
        </Typography>

        {location.state?.registered && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Account created successfully! Please sign in.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={form.email}
              onChange={handleChange('email')}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label="Toggle password visibility">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormControlLabel
                control={<Checkbox size="small" checked={form.rememberMe} onChange={handleChange('rememberMe')} />}
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Stack>
            <Button type="submit" variant="contained" size="large" disabled={status === 'loading'}>
              {status === 'loading' ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>or continue with</Typography>
        </Divider>

        <Stack direction="row" spacing={1.5}>
          <Button fullWidth variant="outlined" color="inherit" startIcon={<GoogleIcon />} sx={{ borderColor: 'divider' }}>
            Google
          </Button>
          <Button fullWidth variant="outlined" color="inherit" startIcon={<GitHubIcon />} sx={{ borderColor: 'divider' }}>
            GitHub
          </Button>
        </Stack>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          New to CodeArena?{' '}
          <Link component={RouterLink} to="/register">Create an account</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;
