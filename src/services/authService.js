// services/authService.js - Updated with API-based getCurrentUser
import api from './api';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      // Map frontend field names to backend field names
      const backendData = {
        full_name: userData.fullName,
        email: userData.email,
        phone: userData.phoneNumber,
        password: userData.password,
      };

      console.log('📤 Register payload:', backendData);

      const response = await api.post('/auth/register', backendData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Login user
  async login(credentials) {
    try {
      console.log('📤 Login attempt:', { email: credentials.email });

      const response = await api.post('/auth/login', credentials);
      console.log('📥 Login response:', response.data);

      // Backend returns { token, user }
      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('✅ Tokens stored:', {
        accessToken: token ? 'Present' : 'Missing',
        user: user ? 'Present' : 'Missing',
      });

      return {
        token,
        user,
        // For backward compatibility with components expecting these names
        accessToken: token,
      };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw this.handleError(error);
    }
  }

  // Google login - Fixed to work with backend
  async googleLogin(credential) {
    try {
      console.log('📤 Google login attempt with credential:', credential);

      // Backend expects { code } but Google gives us { credential }
      // We need to send the credential as token field based on your backend code
      const response = await api.post('/auth/google', {
        token: credential, // Send as token since your backend expects this
      });

      console.log('📥 Google login response:', response.data);

      // Backend returns { token, user } format
      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('✅ Google login successful, tokens stored');

      return { token, user, accessToken: token };
    } catch (error) {
      console.error('❌ Google login failed:', error);
      throw this.handleError(error);
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send phone verification
  async sendPhoneVerification(phoneNumber) {
    try {
      const response = await api.post('/auth/send-phone-verification', {
        phoneNumber,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify phone
  async verifyPhone(phoneNumber, code) {
    try {
      const response = await api.post('/auth/verify-phone', {
        phoneNumber,
        code,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.warn('Logout failed on server:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.log('🔄 Local storage cleared');
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { token } = response.data; // Match backend response format

      localStorage.setItem('accessToken', token);
      return { token, accessToken: token };
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw this.handleError(error);
    }
  }

  // Get current user from API (NEW - replaces localStorage approach)
  async getCurrentUser() {
    try {
      const token = this.getAccessToken();
      if (!token) {
        console.log('🔍 No access token found, user not authenticated');
        return null;
      }

      console.log('📤 Fetching current user from API...');
      const response = await api.get('/users/profile');

      console.log('✅ Current user fetched from API:', response.data);

      // Update localStorage with fresh user data
      const userData = response.data.user || response.data;
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('❌ Failed to fetch current user from API:', error);

      // If API fails, try to get from localStorage as fallback
      try {
        const user = localStorage.getItem('user');
        if (user) {
          console.log('🔄 Using cached user data from localStorage');
          return JSON.parse(user);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse cached user data:', parseError);
      }

      // If both API and localStorage fail, user is not authenticated
      if (error.response?.status === 401) {
        console.log('🔓 User token expired, clearing storage');
        this.logout();
      }

      return null;
    }
  }

  // Get current user from localStorage only (for immediate access)
  getCurrentUserFromCache() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Failed to parse cached user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    const isAuth = !!token;
    console.log('🔍 Authentication check:', {
      hasToken: isAuth,
      token: token ? `${token.substring(0, 20)}...` : 'null',
    });
    return isAuth;
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  // Update user data in localStorage (called after profile updates)
  updateUserCache(userData) {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ User cache updated:', userData);
    } catch (error) {
      console.error('❌ Failed to update user cache:', error);
    }
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      return {
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || [],
      };
    } else if (error.request) {
      // Request made but no response
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        errors: [],
      };
    } else {
      // Something else happened
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
        errors: [],
      };
    }
  }
}

export default new AuthService();
