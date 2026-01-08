import { api } from './api';
import type { User } from '../types/auth';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  data?: unknown;
}

export const userService = {
  /**
   * Get all users (for admin/manager selection)
   */
  getAllUsers: async (): Promise<User[]> => {
    try {
      const { data } = await api.get('/users');
      // Returns the list of users from the backend
      return data.data as User[];
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || 'Failed to fetch users'
      );
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    try {
      const { data } = await api.get(`/users/${id}`);
      return data.data as User;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || 'Failed to fetch user'
      );
    }
  },
};
