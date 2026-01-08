import type { BaseEntity } from './index';

export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
}

export interface User extends BaseEntity {
  id: string;
  name:string;
  username: string;
  email: string;
  role: 'admin' | 'mentor' | 'user';
  profile: UserProfile;
  lastLogin?: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'mentor' | 'user';
  profile?: Partial<UserProfile>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: string | null;
}