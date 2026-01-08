// frontend/src/pages/Dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Settings,
  Users,
  Clock,
  Plus,
  BarChart3
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardData } from '../../types/dashboard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stats = await dashboardService.getStats();
        setData(stats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Fallback values if data is null
  const counts = data?.counts || {
    learningResources: 0,
    tools: 0,
    activeInterns: 0,
    projects: 0
  };

  const activities = data?.recentActivities || [];

  return (
    <main className="main-content bg-gray-900 p-6 h-full overflow-hidden">
      {/* Dashboard Overview */}
      <section className="content-section h-full flex flex-col">
        <div className="section-header mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
          <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 shrink-0">

          {/* Learning Resources Stat */}
          <div className="stat-card bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center space-x-4">
            <div className="stat-icon w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div className="stat-content">
              <h3 className="text-2xl font-bold text-white">{counts.learningResources}</h3>
              <p className="text-gray-400 text-sm">Learning Resources</p>
            </div>
          </div>

          {/* Tools Stat */}
          <div className="stat-card bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center space-x-4">
            <div className="stat-icon w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="stat-content">
              <h3 className="text-2xl font-bold text-white">{counts.tools}</h3>
              <p className="text-gray-400 text-sm">Tools & Tech</p>
            </div>
          </div>

          {/* Interns Stat */}
          <div className="stat-card bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center space-x-4">
            <div className="stat-icon w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div className="stat-content">
              <h3 className="text-2xl font-bold text-white">{counts.activeInterns}</h3>
              <p className="text-gray-400 text-sm">Active Interns</p>
            </div>
          </div>

          {/* Projects/Activity Stat */}
          <div className="stat-card bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center space-x-4">
            <div className="stat-icon w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-red-400" />
            </div>
            <div className="stat-content">
              <h3 className="text-2xl font-bold text-white">{counts.projects}</h3>
              <p className="text-gray-400 text-sm">Active Projects</p>
            </div>
          </div>
        </div>

        <div className="overview-content grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">

          {/* Recent Activity Feed */}
          <div className="recent-activity card bg-gray-800 border border-gray-700 rounded-lg flex flex-col min-h-0">
            <div className="card__header border-b border-gray-700 p-4 shrink-0">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="card__body p-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="activity-feed space-y-4">
                {activities.length > 0 ? (
                  activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="activity-item p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-gray-300 text-sm">{activity.description}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500 text-xs">
                          {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {activity.user}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions card bg-gray-800 border border-gray-700 rounded-lg flex flex-col min-h-0">
            <div className="card__header border-b border-gray-700 p-4 shrink-0">
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="card__body p-4 flex-1 overflow-y-auto">
              <div className="quick-action-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/dashboard/learning')}
                  className="quick-action-btn bg-gray-700 hover:bg-gray-600 text-gray-300 p-3 rounded-lg flex items-center space-x-3 transition-colors"
                >
                  <Plus className="w-5 h-5 text-green-400" />
                  <span>Manage Resources</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/toolstech')}
                  className="quick-action-btn bg-gray-700 hover:bg-gray-600 text-gray-300 p-3 rounded-lg flex items-center space-x-3 transition-colors"
                >
                  <Plus className="w-5 h-5 text-yellow-400" />
                  <span>Manage Tools</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/interns')}
                  className="quick-action-btn bg-gray-700 hover:bg-gray-600 text-gray-300 p-3 rounded-lg flex items-center space-x-3 transition-colors"
                >
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Manage Interns</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/projects')}
                  className="quick-action-btn bg-gray-700 hover:bg-gray-600 text-gray-300 p-3 rounded-lg flex items-center space-x-3 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span>View Projects</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;