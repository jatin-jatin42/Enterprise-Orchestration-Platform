
import { api } from './api';
import type { DashboardData } from '../types/dashboard';

export const dashboardService = {
  getStats: async (): Promise<DashboardData> => {
    const response = await api.get<{ success: boolean; data: DashboardData }>('/dashboard/stats');
    return response.data.data;
  }
};