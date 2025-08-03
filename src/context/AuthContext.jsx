import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        // First check if token exists
        const isAuthenticated = authService.isAuthenticated();

        if (isAuthenticated) {
          console.log('🔍 Token found, fetching current user from API...');

          // Fetch fresh user data from API
          const user = await authService.getCurrentUser();

          if (user) {
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: user,
            });
            console.log('✅ User authenticated and data loaded from API');
          } else {
            console.log('❌ Failed to fetch user data, logging out');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          console.log('🔓 No token found, user not authenticated');
          dispatch({
            type: AUTH_ACTIONS.SET_LOADING,
            payload: false,
          });
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: false,
        });

        // If error is 401, logout user
        if (error.status === 401) {
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authService.login(credentials);

      console.log('response', response);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response,
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authService.register(userData);

      // After successful registration, user might need to verify email
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Registration failed',
      });
      throw error;
    }
  };

  // Google login function
  const googleLogin = async (googleToken, navigate) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authService.googleLogin(googleToken);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response,
      });

      // Check user role and navigate accordingly
      if (response.user && response.user.role === 'dao_member' && navigate) {
        console.log('🎯 DAO member detected via Google login, navigating to /dao-dashboard');
        navigate('/dao-dashboard');
      }

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Google login failed',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      await authService.logout();

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user function (called after profile updates, avatar uploads, etc.)
  const updateUser = async (userData) => {
    try {
      console.log('🔄 Updating user data:', userData);

      // Update cache first
      authService.updateUserCache(userData);

      // Update context state
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData,
      });

      // Optionally fetch fresh data from API to ensure sync
      try {
        const freshUserData = await authService.getCurrentUser();
        if (freshUserData) {
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: freshUserData,
          });
          console.log('✅ User data refreshed from API');
        }
      } catch (error) {
        console.warn('⚠️ Failed to refresh user data from API:', error);
        // Continue with local update if API fails
      }
    } catch (error) {
      console.error('❌ Failed to update user:', error);
    }
  };

  // Refresh user data from API
  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data from API...');
      const user = await authService.getCurrentUser();

      if (user) {
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: user,
        });
        console.log('✅ User data refreshed successfully');
        return user;
      } else {
        console.log('❌ Failed to refresh user data');
        return null;
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      if (error.status === 401) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authService.forgotPassword(email);

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Forgot password failed',
      });
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authService.resetPassword(token, newPassword);

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Reset password failed',
      });
      throw error;
    }
  };

  // Send phone verification
  const sendPhoneVerification = async (phoneNumber) => {
    try {
      const response = await authService.sendPhoneVerification(phoneNumber);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Verify phone
  const verifyPhone = async (phoneNumber, code) => {
    try {
      const response = await authService.verifyPhone(phoneNumber, code);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    forgotPassword,
    resetPassword,
    sendPhoneVerification,
    verifyPhone,
    clearError,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
