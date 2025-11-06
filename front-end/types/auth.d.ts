export interface AuthUser {
  id: string;
  email: string;
  designation?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  designation: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: AuthError | null;
}

