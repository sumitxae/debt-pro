import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, LoginCredentials, RegisterData, AuthState as ServiceAuthState } from '../../src/services/authService';
import { User, AuthTokens } from '../../src/utils/apiClient';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  savedCredentials: { email: string; password: string } | null;
  credentialsSaved: boolean;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  savedCredentials: null,
  credentialsSaved: false,
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (): Promise<ServiceAuthState> => {
    return await authService.initialize();
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials): Promise<ServiceAuthState> => {
    return await authService.login(credentials);
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData): Promise<ServiceAuthState> => {
    return await authService.register(userData);
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (): Promise<ServiceAuthState> => {
    return await authService.logout();
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updateData: Partial<User>): Promise<ServiceAuthState> => {
    return await authService.updateProfile(updateData);
  }
);

export const updateUserPreferences = createAsyncThunk(
  'auth/updatePreferences',
  async (preferences: Partial<User['preferences']>): Promise<ServiceAuthState> => {
    return await authService.updatePreferences(preferences);
  }
);

export const saveCredentials = createAsyncThunk(
  'auth/saveCredentials',
  async ({ email, password }: { email: string; password: string }): Promise<void> => {
    await authService.saveCredentials(email, password);
  }
);

export const getSavedCredentials = createAsyncThunk(
  'auth/getSavedCredentials',
  async (): Promise<{ email: string; password: string } | null> => {
    return await authService.getSavedCredentials();
  }
);

export const clearSavedCredentials = createAsyncThunk(
  'auth/clearSavedCredentials',
  async (): Promise<void> => {
    await authService.clearSavedCredentials();
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSavedCredentials: (state, action: PayloadAction<{ email: string; password: string } | null>) => {
      state.savedCredentials = action.payload;
      state.credentialsSaved = action.payload !== null;
    },
  },
  extraReducers: (builder) => {
    // Initialize
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isLoading = action.payload.isLoading;
        state.error = action.payload.error;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to initialize authentication';
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isLoading = action.payload.isLoading;
        state.error = action.payload.error;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isLoading = action.payload.isLoading;
        state.error = action.payload.error;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear the state
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isLoading = action.payload.isLoading;
        state.error = action.payload.error;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Profile update failed';
      });

    // Update Preferences
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isLoading = action.payload.isLoading;
        state.error = action.payload.error;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Preferences update failed';
      });

    // Force Logout (for 401 errors)
    builder
      .addCase(forceLogout.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });

    // Save Credentials
    builder
      .addCase(saveCredentials.fulfilled, (state) => {
        state.credentialsSaved = true;
      });

    // Get Saved Credentials
    builder
      .addCase(getSavedCredentials.fulfilled, (state, action) => {
        state.savedCredentials = action.payload;
        state.credentialsSaved = action.payload !== null;
      });

    // Clear Saved Credentials
    builder
      .addCase(clearSavedCredentials.fulfilled, (state) => {
        state.savedCredentials = null;
        state.credentialsSaved = false;
      });
  },
});

export const { clearError, setLoading, setSavedCredentials } = authSlice.actions;

// Action to force logout (for handling 401 errors)
export const forceLogout = createAsyncThunk(
  'auth/forceLogout',
  async (): Promise<void> => {
    // Clear any stored tokens
    await authService.logout();
  }
);
export default authSlice.reducer;