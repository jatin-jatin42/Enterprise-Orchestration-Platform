export interface DashboardCounts {
  activeInterns: number;
  learningResources: number;
  tools: number;
  projects: number;
}

export type ActivityType = 'intern' | 'project' | 'resource' | 'tool';

export interface DashboardActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  user: string;
}

export interface DashboardData {
  counts: DashboardCounts;
  recentActivities: DashboardActivity[];
}