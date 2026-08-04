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
  Link,
} from '@mui/material';
import { useAppDispatch, useAuth } from '@/app/hooks';
import { verifyOtp, clearAuthError } from '@/features/auth/authSlice';
import authService from '@/services/authService';

const VerifyOtpPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useAuth();

  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    setSuccessMsg('');
    setResendStatus('');

    const result = await dispatch(verifyOtp({ email, code }));
    if (verifyOtp.fulfilled.match(result)) {
      setSuccessMsg('Email verified successfully! Redirecting to sign in…');
      setTimeout(() => {
        navigate('/login', { state: { emailVerified: true } });
      }, 2000);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setResendStatus('Sending new verification code…');
      await authService.forgotPassword(email);
      setResendStatus('New verification code sent! Check your inbox.');
    } catch (err) {
      setResendStatus('Failed to send verification code. Please check the email address.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 8, md: 12 } }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h4" sx={{ fontSize: '1.5rem', mb: 0.5 }}>Verify your email</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Enter the 6-digit OTP verification code sent to your email address.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
        {resendStatus && <Alert severity="info" sx={{ mb: 2 }}>{resendStatus}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              label="Verification Code (OTP)"
              required
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              placeholder="e.g. 123456"
              inputProps={{ maxLength: 6, style: { letterSpacing: 4, fontSize: '1.2rem', textAlign: 'center' } }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={status === 'loading' || !email || !code}
            >
              {status === 'loading' ? 'Verifying…' : 'Verify Email'}
            </Button>
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
          <Link component="button" type="button" variant="body2" onClick={handleResend} underline="hover">
            Resend Code
          </Link>
          <Link component={RouterLink} to="/login" variant="body2" underline="hover">
            Back to Sign in
          </Link>
        </Stack>
      </Paper>
    </Container>
  );
};

export default VerifyOtpPage;
