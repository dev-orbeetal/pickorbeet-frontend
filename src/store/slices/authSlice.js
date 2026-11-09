import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/lib/api';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  pendingVerification: null,
  pendingTwoFactor: null,
};

function sessionFromResponse(data) {
  if (data?.requires_2fa) {
    return {
      requiresTwoFactor: true,
      challenge: data.challenge,
      emailHint: data.email_hint || '',
    };
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
  }
  return { user: data.user };
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return sessionFromResponse(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data);
      // Don't store tokens - user needs to verify email first
      return {
        user: response.data.user,
        requires_verification: response.data.requires_verification,
        email: data.email
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Registration failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch profile');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await authAPI.logout({ refresh });
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
);

export const googleAuth = createAsyncThunk(
  'auth/googleAuth',
  async (credential, { rejectWithValue }) => {
    try {
      const response = await authAPI.googleAuth({ credential });
      return sessionFromResponse(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Google authentication failed');
    }
  }
);

export const verifyTwoFactor = createAsyncThunk(
  'auth/verifyTwoFactor',
  async ({ challenge, code }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyTwoFactor({ challenge, otp_code: code });
      return sessionFromResponse(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'That code is incorrect.');
    }
  }
);

export const resendTwoFactor = createAsyncThunk(
  'auth/resendTwoFactor',
  async (challenge, { rejectWithValue }) => {
    try {
      const response = await authAPI.resendTwoFactor({ challenge });
      return response.data?.message || 'A new code is on its way.';
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Could not resend the code.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPendingVerification: (state) => {
      state.pendingVerification = null;
    },
    clearPendingTwoFactor: (state) => {
      state.pendingTwoFactor = null;
    },
    checkAuth: (state) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      state.isAuthenticated = !!token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.requiresTwoFactor) {
          state.pendingTwoFactor = {
            challenge: action.payload.challenge,
            emailHint: action.payload.emailHint,
          };
          state.user = null;
          state.isAuthenticated = false;
          return;
        }
        state.pendingTwoFactor = null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingVerification = action.payload;
        // Don't set isAuthenticated - user needs to verify email first
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.pendingTwoFactor = null;
      })
      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.requiresTwoFactor) {
          state.pendingTwoFactor = {
            challenge: action.payload.challenge,
            emailHint: action.payload.emailHint,
          };
          state.user = null;
          state.isAuthenticated = false;
          return;
        }
        state.pendingTwoFactor = null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTwoFactor = null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearPendingVerification, clearPendingTwoFactor, checkAuth } = authSlice.actions;
export default authSlice.reducer;
