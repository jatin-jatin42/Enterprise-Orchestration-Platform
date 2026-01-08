
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { authService, AuthServiceError } from '../services/authService';
import type { AuthState, User, LoginCredentials, RegisterData, ChangePasswordData } from '../types';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      status: 'idle',
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ status: 'loading', error: null });
        
        const loadingToast = toast.loading('Signing in...');
        
        try {
          const { user, token } = await authService.login(credentials);
          
          // ✅ FIX: Set token in localStorage
          authService.setToken(token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            status: 'success',
            error: null,
          });

          toast.dismiss(loadingToast);
          toast.success(`Welcome back, ${user.username}!`);
        } catch (error: unknown) {
          const errorMessage = error instanceof AuthServiceError 
            ? error.message 
            : 'Login failed. Please try again.';
          
          set({
            status: 'error',
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });

          toast.dismiss(loadingToast);
          toast.error(errorMessage);
          
          // Clear token on login failure
          authService.logout();
        }
      },

      register: async (userData: RegisterData) => {
        set({ status: 'loading', error: null });
        
        const loadingToast = toast.loading('Creating your account...');
        
        try {
          const { user, token } = await authService.register(userData);
          
          // ✅ FIX: Set token in localStorage
          authService.setToken(token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            status: 'success',
            error: null,
          });

          toast.dismiss(loadingToast);
          toast.success('Account created successfully!');
        } catch (error: unknown) {
          const errorMessage = error instanceof AuthServiceError 
            ? error.message 
            : 'Registration failed. Please try again.';
          
          set({
            status: 'error',
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });

          toast.dismiss(loadingToast);
          toast.error(errorMessage);
          
          // Clear token on registration failure
          authService.logout();
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          status: 'idle',
          error: null,
        });

        toast.success('You have been logged out successfully.');
      },

      getProfile: async () => {
        // ✅ FIX: Check if token exists first
        const token = authService.getToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        set({ status: 'loading', error: null });
        
        try {
          const user = await authService.getProfile();
          set({
            user,
            isAuthenticated: true,
            status: 'success',
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof AuthServiceError 
            ? error.message 
            : 'Failed to fetch profile';
          
          set({
            status: 'error',
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });

          toast.error(errorMessage);
          
          // If profile fetch fails, user might be logged out
          if (error instanceof AuthServiceError && error.statusCode === 401) {
            get().logout();
          }
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ status: 'loading', error: null });
        
        const loadingToast = toast.loading('Updating profile...');
        
        try {
          const user = await authService.updateProfile(data);
          set({
            user,
            status: 'success',
            error: null,
          });

          toast.dismiss(loadingToast);
          toast.success('Profile updated successfully!');
        } catch (error: unknown) {
          const errorMessage = error instanceof AuthServiceError 
            ? error.message 
            : 'Failed to update profile';
          
          set({
            status: 'error',
            error: errorMessage,
          });

          toast.dismiss(loadingToast);
          toast.error(errorMessage);
        }
      },

      changePassword: async (data: ChangePasswordData) => {
        set({ status: 'loading', error: null });
        
        const loadingToast = toast.loading('Changing password...');
        
        try {
          await authService.changePassword(data);
          set({
            status: 'success',
            error: null,
          });

          toast.dismiss(loadingToast);
          toast.success('Password changed successfully!');
        } catch (error: unknown) {
          const errorMessage = error instanceof AuthServiceError 
            ? error.message 
            : 'Failed to change password';
          
          set({
            status: 'error',
            error: errorMessage,
          });

          toast.dismiss(loadingToast);
          toast.error(errorMessage);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          status: 'idle',
          error: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
