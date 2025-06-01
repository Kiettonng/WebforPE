import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Định nghĩa kiểu dữ liệu User, thêm avatar_path
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_path?: string | null; // Chú thích: trường avatar_path từ backend
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_AVATAR_SUCCESS'; payload: string } // Chú thích: action cập nhật avatar
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const AuthContext = createContext<{
  state: AuthState;
  login: (user: User) => void;
  logout: () => void;
  uploadAvatar: (formData: FormData) => Promise<boolean>;
  updateProfile: (user: Partial<User>) => void;
}>({
  state: initialState,
  login: () => {},
  logout: () => {},
  uploadAvatar: async () => false,
  updateProfile: () => {},
});

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'LOGOUT':
      return { ...initialState };
    case 'UPDATE_AVATAR_SUCCESS':
      // Chú thích: cập nhật avatar_path mới cho user
      return {
        ...state,
        user: state.user ? { ...state.user, avatar_path: action.payload } : null,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Ví dụ: Khi login thành công (sau khi gọi API login)
  const login = (user: User) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
  };

  // Khi logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    // Có thể gọi thêm API /logout.php nếu cần
  };

  // Hàm upload avatar
  const uploadAvatar = async (formData: FormData): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/upload_avatar.php', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.avatar_url) {
        // Chú thích: cập nhật avatar_path mới từ backend trả về
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

  // Cập nhật thông tin profile user (username, email, ...)
  const updateProfile = (user: Partial<User>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: user });
    // Có thể gọi thêm API cập nhật profile nếu cần
  };

  // Khởi tạo (có thể fetch user info từ server ở đây để tự động login lại nếu còn session)
  useEffect(() => {
    // Ví dụ: tự động lấy thông tin user nếu đã login
    // fetch('/api/user_info.php').then...
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        uploadAvatar,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}


