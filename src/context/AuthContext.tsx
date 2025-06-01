import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthState, User } from '../types'; // Assuming User type does not contain password

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SIGNUP_REQUEST' }
  | { type: 'SIGNUP_SUCCESS' } // Signup success, user might need to login after or we fetch user
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_FAILURE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'USER_LOADED'; payload: User }
  | { type: 'AUTH_ERROR' } // For when session check fails
  | { type: 'UPDATE_EMAIL_SUCCESS'; payload: string }
  | { type: 'UPDATE_AVATAR_SUCCESS'; payload: string }; // payload is new avatar_path

// API Response Type Definitions
interface UserInfoResponse {
  user?: User;
  error?: string; // Optional: if user_info.php can return an error in JSON
}

interface LoginResponse {
  user?: User;
  error?: string;
}

interface SignupResponse {
  error?: string;
  // Add other fields if register.php returns more on success/failure
}

interface LogoutResponse {
  error?: string;
}

interface UploadAvatarResponse {
  avatar_url?: string;
  error?: string;
}

interface UpdateEmailResponse {
  error?: string;
  // Add other fields if change_email.php returns more
}

interface UpdatePasswordResponse {
  error?: string;
  // Add other fields if change_password.php returns more
}

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<boolean>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  uploadAvatar: (formData: FormData) => Promise<boolean>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check auth status
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'SIGNUP_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'USER_LOADED':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'SIGNUP_SUCCESS':
      return { ...state, isLoading: false, error: null }; // User needs to login
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
    case 'LOGOUT_FAILURE':
    case 'SET_ERROR':
      localStorage.removeItem('user');
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'AUTH_ERROR': // Session check failed or other auth error
      localStorage.removeItem('user');
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      };
    case 'LOGOUT_SUCCESS':
      localStorage.removeItem('user');
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_EMAIL_SUCCESS':
      if (state.user) {
        const updatedUser = { ...state.user, email: action.payload };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { ...state, user: updatedUser, error: null };
      }
      return state;
    case 'UPDATE_AVATAR_SUCCESS':
      if (state.user) {
        const updatedUser = { ...state.user, avatar_path: action.payload };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { ...state, user: updatedUser, error: null };
      }
      return state;
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuthStatus = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/user_info.php`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data: UserInfoResponse = await response.json();
        if (data.user) {
          dispatch({ type: 'USER_LOADED', payload: data.user });
        } else {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data: LoginResponse = await response.json();
      if (response.ok && data.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: data.error || 'Login failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: (error as Error).message || 'Network error during login' });
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SIGNUP_REQUEST' });
    try {
      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data: SignupResponse = await response.json();
      if (response.status === 201) {
        dispatch({ type: 'SIGNUP_SUCCESS' });
        // Optionally, automatically log in the user here by calling login(username, password)
        // For now, we'll just mark signup as success. User can login manually.
        return true;
      } else {
        dispatch({ type: 'SIGNUP_FAILURE', payload: data.error || 'Signup failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SIGNUP_FAILURE', payload: (error as Error).message || 'Network error during signup' });
      return false;
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/logout.php`, {
        method: 'POST',
      });
      if (response.ok) {
        dispatch({ type: 'LOGOUT_SUCCESS' });
      } else {
        const data: LogoutResponse = await response.json();
        dispatch({ type: 'LOGOUT_FAILURE', payload: data.error || 'Logout failed' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT_FAILURE', payload: (error as Error).message || 'Network error during logout' });
    }
  };

  const uploadAvatar = async (formData: FormData): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/upload_avatar.php`, {
        method: 'POST',
        body: formData, // FormData sets Content-Type automatically
      });
      const data: UploadAvatarResponse = await response.json();
      if (response.ok && data.avatar_url) {
        dispatch({ type: 'UPDATE_AVATAR_SUCCESS', payload: data.avatar_url });
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Avatar upload failed' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message || 'Network error during avatar upload' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const updateEmail = async (newEmail: string): Promise<boolean> => {
    if (!state.user) {
      dispatch({ type: 'SET_ERROR', payload: 'User not authenticated' });
      return false;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/change_email.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_email: newEmail }),
      });
      const data: UpdateEmailResponse = await response.json();
      if (response.ok) {
        dispatch({ type: 'UPDATE_EMAIL_SUCCESS', payload: newEmail });
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to update email' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message || 'Network error updating email' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!state.user) {
      dispatch({ type: 'SET_ERROR', payload: 'User not authenticated' });
      return false;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/change_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      const data: UpdatePasswordResponse = await response.json();
      if (response.ok) {
        // Password changed successfully, no need to update state with new password
        dispatch({ type: 'SET_LOADING', payload: false });
        // Optionally, you might want to re-authenticate or show a success message
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to update password' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message || 'Network error updating password' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      login, 
      signup, 
      logout, 
      checkAuthStatus,
      uploadAvatar,
      updateEmail, 
      updatePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};