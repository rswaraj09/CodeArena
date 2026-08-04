import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import authService from '@/services/authService';

const readStoredUser = () => {
  const token = localStorage.getItem('ca_access_token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) return null;
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
  } catch {
    return null;
  }
};

const initialState = {
  user: readStoredUser(),
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('ca_access_token', accessToken);
    localStorage.setItem('ca_refresh_token', refreshToken);
    return jwtDecode(accessToken);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Unable to sign in. Check your credentials.');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed.');
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (payload, { rejectWithValue }) => {
  try {
    return await authService.verifyOtp(payload);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('ca_access_token');
      localStorage.removeItem('ca_refresh_token');
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = {
          id: action.payload.sub,
          email: action.payload.email,
          role: action.payload.role,
          name: action.payload.name,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
