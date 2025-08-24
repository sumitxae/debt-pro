import { apiClient, User, AuthTokens } from '../utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  monthlyIncome?: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private currentUser: User | null = null;
  private currentTokens: AuthTokens | null = null;

  // Initialize auth state from storage
  async initialize(): Promise<AuthState> {
    try {
      const user = await apiClient.getStoredUser();
      const token = await this.getStoredToken();
      
      if (user && token) {
        this.currentUser = user;
        this.currentTokens = { accessToken: token, refreshToken: '' }; // Refresh token handled by API client
        return {
          user,
          tokens: this.currentTokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      }
      
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error('Error initializing auth:', error);
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthState> {
    try {
      console.log('AuthService: Starting login process');
      const { user, tokens } = await apiClient.login(credentials.email, credentials.password);
      
      console.log('AuthService: Login successful, user:', user?.email);
      
      this.currentUser = user;
      this.currentTokens = tokens;
      
      return {
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error('AuthService: Login error:', error);
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  // Register user
  async register(userData: RegisterData): Promise<AuthState> {
    try {
      const { user, tokens } = await apiClient.register(userData);
      
      this.currentUser = user;
      this.currentTokens = tokens;
      
      return {
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  // Logout user
  async logout(): Promise<AuthState> {
    try {
      await apiClient.logout();
      
      this.currentUser = null;
      this.currentTokens = null;
      
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      this.currentUser = null;
      this.currentTokens = null;
      
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current tokens
  getCurrentTokens(): AuthTokens | null {
    return this.currentTokens;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentTokens !== null;
  }

  // Update user profile
  async updateProfile(updateData: Partial<User>): Promise<AuthState> {
    try {
      const response = await apiClient.put('/users/profile', updateData);
      
      if (response.success && this.currentUser) {
        this.currentUser = { ...this.currentUser, ...response.data };
        
        return {
          user: this.currentUser,
          tokens: this.currentTokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        user: this.currentUser,
        tokens: this.currentTokens,
        isAuthenticated: this.isAuthenticated(),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      };
    }
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<User['preferences']>): Promise<AuthState> {
    try {
      const response = await apiClient.put('/users/preferences', preferences);
      
      if (response.success && this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          preferences: { ...this.currentUser.preferences, ...response.data },
        };
        
        return {
          user: this.currentUser,
          tokens: this.currentTokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      }
      
      throw new Error(response.message || 'Failed to update preferences');
    } catch (error) {
      console.error('Preferences update error:', error);
      return {
        user: this.currentUser,
        tokens: this.currentTokens,
        isAuthenticated: this.isAuthenticated(),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Preferences update failed',
      };
    }
  }

  // Private method to get stored token
  private async getStoredToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return token;
    } catch (error) {
      return null;
    }
  }

  // Save credentials for auto-login
  async saveCredentials(email: string, password: string): Promise<void> {
    try {
      await AsyncStorage.setItem('saved_email', email);
      await AsyncStorage.setItem('saved_password', password);
      await AsyncStorage.setItem('credentials_saved', 'true');
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  }

  // Get saved credentials
  async getSavedCredentials(): Promise<{ email: string; password: string } | null> {
    try {
      const email = await AsyncStorage.getItem('saved_email');
      const password = await AsyncStorage.getItem('saved_password');
      const saved = await AsyncStorage.getItem('credentials_saved');
      
      if (email && password && saved === 'true') {
        return { email, password };
      }
      return null;
    } catch (error) {
      console.error('Error getting saved credentials:', error);
      return null;
    }
  }

  // Clear saved credentials
  async clearSavedCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem('saved_email');
      await AsyncStorage.removeItem('saved_password');
      await AsyncStorage.removeItem('credentials_saved');
    } catch (error) {
      console.error('Error clearing saved credentials:', error);
    }
  }

  // Check if credentials are saved
  async areCredentialsSaved(): Promise<boolean> {
    try {
      const saved = await AsyncStorage.getItem('credentials_saved');
      return saved === 'true';
    } catch (error) {
      console.error('Error checking saved credentials:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export types
export type { LoginCredentials, RegisterData, AuthState }; 