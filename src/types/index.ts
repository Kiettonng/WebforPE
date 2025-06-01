export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UploadState {
  isUploading: boolean;
  error: string | null;
  success: boolean;
  file: File | null;
  preview: string | null;
}