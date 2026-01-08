import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useProjectStore } from '../../stores/ProjectStore';
import { useAuthStore } from '../../stores/authStore';
import { type Project, type ProjectFilters } from '../../types/projects';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import ProjectForm from './ProjectForm';
import DeleteConfirmation from './DeleteConfirmation';
import ProjectDetailModal from './ProjectDetailModal';

export default function Projects() {
  const { user } = useAuthStore();
  const {
    projects,
    pagination,
    filters,
    status,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setFilters,
    clearError,
  } = useProjectStore();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFilterChange = (
    key: keyof ProjectFilters,
    value: string | number
  ) => {
    setFilters({ ...filters, [key]: value, page: 1 }); // Reset to page 1 on filter change
  };

  const safeProjects = useMemo(() => projects || [], [projects]);
  const isLoading = status === 'loading' && !deleteLoading;

  // Stats calculations
  const stats = useMemo(() => {
    const planning = safeProjects.filter((p) => p.status === 'Planning').length;
    const inProgress = safeProjects.filter(
      (p) => p.status === 'In Progress'
    ).length;
    const completed = safeProjects.filter(
      (p) => p.status === 'Completed'
    ).length;
    const onHold = safeProjects.filter((p) => p.status === 'On Hold').length;

    return {
      total: pagination.totalItems,
      planning,
      inProgress,
      completed,
      onHold,
    };
  }, [safeProjects, pagination.totalItems]);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    try {
      await deleteProject(id);
      toast.success('Project deleted successfully');
      setShowDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(null);
  };

  const handleViewDetails = (project: Project) => {
    setViewingProject(project);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setViewingProject(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
  ) => {
    switch (status) {
      case 'In Progress':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'On Hold':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Planning':
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 bg-gray-900 p-6 overflow-hidden no-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Project Management</h1>
          <p className="text-gray-400 text-sm">
            Track and manage all company projects
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">Total Projects</p>
          <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">Planning</p>
          <p className="text-xl font-bold text-white mt-1">{stats.planning}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">In Progress</p>
          <p className="text-xl font-bold text-white mt-1">
            {stats.inProgress}
          </p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">Completed</p>
          <p className="text-xl font-bold text-white mt-1">{stats.completed}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">On Hold</p>
          <p className="text-xl font-bold text-white mt-1">{stats.onHold}</p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="section-actions shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 justify-between items-start lg:items-center">
          <div className="search-filter flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-white placeholder-gray-400"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-white min-w-[140px]"
            >
              <option value="">All Status</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={handleCreateClick}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
              disabled={isLoading}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Project
            </button>
          )}
        </div>
      </div>

      {/* Projects Cards Grid */}
      <div className="rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-400 text-lg">
              Loading projects...
            </span>
          </div>
        ) : (
          <>
            <div className="p-1">
              {safeProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {safeProjects.map((project) => (
                    <div
                      key={project._id}
                      className="project-card bg-gray-800 border border-gray-700 rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/20 hover:border-indigo-500/50 hover:scale-[1.02] hover:bg-gray-750"
                    >
                      {/* Header */}
                      <div className="p-4 md:p-6 border-b border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                          <span
                            className={`status px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {project.teamMembers?.length || 0} Members
                          </span>
                        </div>
                        <h2
                          className="text-lg md:text-xl font-bold text-white truncate"
                          title={project.projectName}
                        >
                          {project.projectName}
                        </h2>
                        <p className="text-sm text-gray-400 h-10 mt-2 line-clamp-2">
                          {project.description || 'No description provided.'}
                        </p>
                      </div>

                      
                      {/* <div className="p-4 md:p-6">
                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                          <div>
                            <strong className="block text-xs md:text-sm text-gray-400 mb-1">
                              Manager
                            </strong>
                            <span className="text-white text-sm md:text-base truncate block">
                              
                            </span>
                          </div>
                          <div>
                            <strong className="block text-xs md:text-sm text-gray-400 mb-1">
                              Start Date
                            </strong>
                            <span className="text-white text-sm md:text-base">
                              {formatDate(project.startDate)}
                            </span>
                          </div>
                        </div>

                        
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="mb-4">
                              <strong className="block text-xs md:text-sm text-gray-400 mb-2">
                                Tech Stack
                              </strong>
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.slice(0, 4).map((tech) => (
                                  <span
                                    key={tech}
                                    className="bg-gray-700 text-gray-300 px-2.5 py-0.5 rounded-full text-xs"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {project.technologies.length > 4 && (
                                  <span className="bg-gray-600 text-gray-200 px-2.5 py-0.5 rounded-full text-xs">
                                    +{project.technologies.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          )} */}

                          {/* Body */}
                      <div className="p-4 md:p-6">
                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                          <div>
                            <strong className="block text-xs md:text-sm text-gray-400 mb-1">
                              Start Date
                            </strong>
                            <span className="text-white text-sm md:text-base">
                              {formatDate(project.startDate)}
                            </span>
                          </div>
                           <div>
                            <strong className="block text-xs md:text-sm text-gray-400 mb-1">
                              End Date
                            </strong>
                            <span className="text-white text-sm md:text-base">
                              {formatDate(project.endDate)}
                            </span>
                          </div>
                        </div>

                        {/* Tech Stack */}
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="mb-4">
                              <strong className="block text-xs md:text-sm text-gray-400 mb-2">
                                Tech Stack
                              </strong>
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.slice(0, 4).map((tech) => (
                                  <span
                                    key={tech}
                                    className="bg-gray-700 text-gray-300 px-2.5 py-0.5 rounded-full text-xs"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {project.technologies.length > 4 && (
                                  <span className="bg-gray-600 text-gray-200 px-2.5 py-0.5 rounded-full text-xs">
                                    +{project.technologies.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Actions */}
                        <div className="intern-actions pt-4 border-t border-gray-700">
                          {user?.role === 'admin' ? (
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                                onClick={() => handleViewDetails(project)}
                              >
                                View
                              </button>
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                                onClick={() => handleEdit(project)}
                                disabled={isLoading}
                              >
                                Edit
                              </button>
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                                onClick={() =>
                                  setShowDeleteConfirm(project._id)
                                }
                                disabled={
                                  isLoading || deleteLoading === project._id
                                }
                              >
                                {deleteLoading === project._id
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1">
                              <button
                                className="bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors truncate"
                                onClick={() => handleViewDetails(project)}
                              >
                                View Details
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {filters.search || filters.status
                      ? 'No matching projects found'
                      : 'No projects found'}
                  </h3>
                  <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto">
                    {filters.search || filters.status
                      ? 'No projects match your current filters. Try adjusting your search criteria.'
                      : 'Get started by adding your first project to the system.'}
                  </p>
                  {user?.role === 'admin' &&
                    !filters.search &&
                    !filters.status && (
                      <button
                        onClick={handleCreateClick}
                        className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors inline-flex items-center gap-2 text-lg font-medium"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Your First Project
                      </button>
                    )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ProjectForm
          editingProject={editingProject}
          onClose={handleCloseForm}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          projectId={showDeleteConfirm}
          onConfirm={handleDelete}
          onClose={handleCloseDeleteConfirm}
          isLoading={deleteLoading === showDeleteConfirm}
        />
      )}

      {showDetailModal && (
        <ProjectDetailModal
          project={viewingProject}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
}