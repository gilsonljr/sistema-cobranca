import api from './api';
import { User } from '../types/User';
import UserPasswordService from './UserPasswordService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      // Use environment variable for mock mode
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';
      console.log('Login attempt:', credentials.email, 'Mock mode:', mockMode);

      if (mockMode) {
        console.log('Mock mode is enabled, checking credentials...');

        // Use UserPasswordService to verify credentials
        const isValid = UserPasswordService.verifyPassword(credentials.email, credentials.password);

        if (!isValid) {
          console.log('Invalid credentials, password verification failed');
          throw new Error('Invalid credentials - Password verification failed');
        }

        // Get default_users to retrieve role and other user information
        const defaultUsersStr = localStorage.getItem('default_users');
        const defaultUsers = defaultUsersStr ? JSON.parse(defaultUsersStr) : {};
        const user = defaultUsers[credentials.email.toLowerCase()];

        if (!user) {
          console.log('User not found in default_users');
          throw new Error('Invalid credentials - User not found');
        }

        console.log('Valid credentials for user:', user);

        // Store user info
        localStorage.setItem('userInfo', JSON.stringify({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }));

        // Generate tokens based on user role
        const tokenPrefix = user.role === 'admin' ? 'admin' :
                            user.role === 'supervisor' ? 'supervisor' :
                            user.role === 'collector' ? 'collector' : 'seller';

        const tokens = {
          access_token: `mock-${tokenPrefix}-token-${Date.now()}`,
          refresh_token: `mock-${tokenPrefix}-refresh-token-${Date.now()}`,
          token_type: 'bearer'
        };

        localStorage.setItem('authTokens', JSON.stringify(tokens));
        return tokens;
      }

      // For production with real API
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const response = await api.post<AuthTokens>('/api/v1/auth/login', formData);

      // Store tokens
      localStorage.setItem('authTokens', JSON.stringify(response.data));

      // Get user info
      await this.fetchUserInfo();

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthTokens> {
    try {
      // Get refresh token from storage
      const authTokens = this.getAuthTokens();
      if (!authTokens || !authTokens.refresh_token) {
        throw new Error('No refresh token available');
      }

      // Use environment variable for mock mode
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        // Check if it's a mock token and return a new mock token
        if (authTokens.refresh_token.startsWith('mock-')) {
          const userInfo = this.getUserInfo();
          if (!userInfo) {
            throw new Error('No user info available');
          }

          // Create new mock tokens based on user role
          const newTokens = {
            access_token: `mock-${userInfo.role}-token-${Date.now()}`,
            refresh_token: authTokens.refresh_token,
            token_type: 'bearer'
          };

          localStorage.setItem('authTokens', JSON.stringify(newTokens));
          return newTokens;
        }

        throw new Error('Invalid refresh token');
      }

      // For production with real API
      const response = await api.post<AuthTokens>('/api/v1/auth/refresh', {
        refresh_token: authTokens.refresh_token
      });

      // Store new tokens
      localStorage.setItem('authTokens', JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout the user
      this.logout();
      throw error;
    }
  }

  /**
   * Fetch current user information
   */
  async fetchUserInfo(): Promise<UserInfo> {
    try {
      // Use environment variable for mock mode
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        // Return mock user info from localStorage
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          return JSON.parse(userInfo);
        }
        throw new Error('No user info available');
      }

      // For production with real API
      const response = await api.get<User>('/api/v1/users/me');

      // Map backend user model to frontend user info
      const userInfo: UserInfo = {
        id: response.data.id,
        email: response.data.email,
        fullName: response.data.full_name,
        role: response.data.role
      };

      // Store user info
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      return userInfo;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('authTokens');
    localStorage.removeItem('userInfo');
    // Redirect to login page
    window.location.href = '/login';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const authTokens = this.getAuthTokens();
    const isAuth = !!authTokens && !!authTokens.access_token;
    console.log('isAuthenticated check:', { authTokens, isAuth });
    return isAuth;
  }

  /**
   * Get authentication tokens from storage
   */
  getAuthTokens(): AuthTokens | null {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    const authTokens = this.getAuthTokens();
    return authTokens ? authTokens.access_token : null;
  }

  /**
   * Get user info from storage
   */
  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string | string[]): boolean {
    const userInfo = this.getUserInfo();
    if (!userInfo) return false;

    if (Array.isArray(role)) {
      return role.includes(userInfo.role);
    }

    return userInfo.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is supervisor
   */
  isSupervisor(): boolean {
    return this.hasRole(['admin', 'supervisor']);
  }

  /**
   * Check if user is collector (operador)
   */
  isCollector(): boolean {
    return this.hasRole('collector');
  }

  /**
   * Check if user is seller (vendedor)
   */
  isSeller(): boolean {
    return this.hasRole('seller');
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        // Just log the request in development mode
        console.log(`Password reset requested for: ${email}`);
        return;
      }

      // For production with real API
      await api.post('/api/v1/auth/password-reset/request', { email });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        // Just log the request in development mode
        console.log(`Password reset with token: ${token}`);
        return;
      }

      // For production with real API
      await api.post('/api/v1/auth/password-reset/confirm', {
        token,
        new_password: newPassword
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
}

export default new AuthService();
