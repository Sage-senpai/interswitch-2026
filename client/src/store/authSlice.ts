import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../utils/storage';
import { authAPI } from '../services/api';

interface User {
  id: string;
  phone: string;
  name: string | null;
  kycStatus: string;
  language: string;
  wallet: { balance: number; currency: string } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  otpSent: boolean;
  phone: string | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  otpSent: false,
  phone: null,
  error: null,
};

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async ({ phone, isLogin }: { phone: string; isLogin: boolean }) => {
    const response = isLogin
      ? await authAPI.login(phone)
      : await authAPI.register(phone);
    return { phone, data: response.data.data };
  },
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, code, name, isLogin }: { phone: string; code: string; name?: string; isLogin: boolean }) => {
    const response = isLogin
      ? await authAPI.verifyLogin(phone, code)
      : await authAPI.verify(phone, code, name);

    const { user, token } = response.data.data;
    await storage.setItemAsync('authToken', token);
    return { user, token };
  },
);

export const loadAuth = createAsyncThunk('auth/load', async () => {
  const token = await storage.getItemAsync('authToken');
  if (!token) return null;
  return { token };
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await storage.deleteItemAsync('authToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetOTP(state) {
      state.otpSent = false;
      state.phone = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.phone = action.payload.phone;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to send OTP';
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.otpSent = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Invalid OTP';
      })
      // Load auth
      .addCase(loadAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.phone = null;
      });
  },
});

export const { clearError, resetOTP, setUser } = authSlice.actions;
export default authSlice.reducer;
