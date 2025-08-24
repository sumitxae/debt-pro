import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.104:3000/api/v1' 
  : 'https://api.debtfree.com/api/v1';

const API_TIMEOUT = 10000;

// Storage Keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  monthlyIncome: number;
  preferences: {
    currency: string;
    notifications: boolean;
    defaultStrategy: 'snowball' | 'avalanche';
    theme: 'light' | 'dark';
  };
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // Get stored access token
  private async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Store tokens
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  // Clear stored tokens
  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Make API request
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }



    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);



      if (!response.ok) {
        if (response.status === 401) {
          console.log('Received 401 error, attempting token refresh...');
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            console.log('Token refresh successful, retrying original request');
            // Retry the original request
            return this.makeRequest(endpoint, options);
          } else {
            console.log('Token refresh failed, clearing tokens');
            // Refresh failed, clear tokens
            await this.clearTokens();
            throw new Error('Authentication failed');
          }
        }

        const errorData = await response.json().catch(() => ({}));
        console.log('API error response:', errorData);
        const errorMessage = Array.isArray(errorData.message) 
          ? errorData.message[0] 
          : errorData.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Refresh token
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        console.log('No refresh token found');
        return false;
      }

      console.log('Attempting to refresh token...');
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      console.log('Refresh response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Refresh successful, storing new tokens');
        
        // The backend wraps responses in { success: true, data: {...}, timestamp: ... }
        const tokens = responseData.data;
        await this.storeTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Refresh failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    console.log('ApiClient: Making login request');
    
    const response = await this.makeRequest<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    console.log('ApiClient: Login response received:', response.success);
    console.log('ApiClient: Login response data:', response.data);

    // The backend wraps responses in { success: true, data: {...}, timestamp: ... }
    const loginData = response.data;
    const tokens = {
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
    };

    await this.storeTokens(tokens);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(loginData.user));

    console.log('ApiClient: Tokens stored, returning user data');

    return {
      user: loginData.user,
      tokens,
    };
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    monthlyIncome?: number;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.makeRequest<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );

    // The backend wraps responses in { success: true, data: {...}, timestamp: ... }
    const registerData = response.data;
    const tokens = {
      accessToken: registerData.accessToken,
      refreshToken: registerData.refreshToken,
    };

    await this.storeTokens(tokens);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(registerData.user));

    return {
      user: registerData.user,
      tokens,
    };
  }

  async logout(): Promise<void> {
    await this.clearTokens();
  }

  // Get stored user data
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Generic API methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse, AuthTokens, User }; 