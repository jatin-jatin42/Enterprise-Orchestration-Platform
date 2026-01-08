import type {  PaginationParams, PaginationResponse } from './index';
import type { User } from './auth';    

export interface UserFilters extends PaginationParams {
  role?: 'admin' |'mentor'| 'user' | '';
  isActive?: boolean | '';
  department?: string;
  search?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: 'admin' |'mentor'| 'user';
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
    position?: string;
  };
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: 'admin' |'mentor'| 'user';
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
    position?: string;
    avatar?: string;
  };
  isActive?: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  dailyDigest: boolean;
  projectUpdates: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  showEmail: boolean;
  showPhone: boolean;
}

export interface UserSettings {
  notifications: NotificationSettings;
  preferences: UserPreferences;
  privacy: PrivacySettings;
}

export interface UserState {
  users: User[];
  selectedUser: User | null;
  filters: UserFilters;
  pagination: PaginationResponse;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}