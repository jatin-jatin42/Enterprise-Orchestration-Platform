import React, { useEffect, useState, useCallback } from 'react';
import { useLearningResourceStore } from '../../stores/LearningResourceStore';
import { useAuthStore } from '../../stores/authStore';
import type { ResourceCategory, DifficultyLevel, CreateResourceData, LearningResource } from '../../types';
import LearningResourceForm from './LearningResourceForm';
import {
  Plus,
  Search,
  Eye,
  Heart,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Check,
  BookOpen,
  ExternalLink,
  Crown
} from 'lucide-react';
import DeleteConfirmation from './DeleteConfirmation';

const LearningResourceCompo: React.FC = () => {
  const {
    resources,
    filters,
    pagination,
    status,
    error,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    likeResource,
    viewResource, // Add this
    setFilters,
    clearError
  } = useLearningResourceStore();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  const [viewDescriptionResource, setViewDescriptionResource] = useState<LearningResource | null>(null);
  const [likingResources, setLikingResources] = useState<Set<string>>(new Set());
  const [viewingResources, setViewingResources] = useState<Set<string>>(new Set());

  // Permission check functions - memoized to prevent recreations
  const canEdit = useCallback((resource: LearningResource): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return resource.createdBy.userId === user._id;
  }, [user]);

  const canDelete = useCallback((resource: LearningResource): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return resource.createdBy.userId === user._id;
  }, [user]);

  const isOwnedByUser = useCallback((resource: LearningResource): boolean => {
    return user ? resource.createdBy.userId === user._id : false;
  }, [user]);

  const isAdmin = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user]);

  // Fetch resources only when essential filters change
  useEffect(() => {
    // const { page, category, difficulty, search } = filters;
    fetchResources();
  }, [filters.page, filters.category, filters.difficulty, filters.search]); // Removed filters.isActive

  // Initialize search input with current filter value
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Clear local error when store error changes
  useEffect(() => {
    if (error) {
      setLocalError(null);
    }
  }, [error]);

  const handleFilterChange = useCallback((key: keyof typeof filters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  }, [filters, setFilters]);

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Apply search filter with debouncing - optimized
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange('search', searchInput);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.search, handleFilterChange]);

  const handleCreate = async (data: CreateResourceData) => {
    setLocalError(null);
    try {
      if (editingResource) {
        await updateResource(editingResource._id, data);
      } else {
        await createResource(data);
      }
      setShowForm(false);
      setEditingResource(null);
      // Don't refetch - resource is already added to store optimistically
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setLocalError('You can only edit your own resources');
      } else {
        setLocalError(error?.message || 'Error saving resource');
      }
    }
  };

  const handleEdit = useCallback((resource: LearningResource) => {
    if (!canEdit(resource)) {
      setLocalError('You can only edit your own resources');
      return;
    }
    setEditingResource(resource);
    setShowForm(true);
    setLocalError(null);
  }, [canEdit]);

  // Optimized view handler with better persistent tracking
  // In your component, update the handleView function:
  const handleView = useCallback(async (resource: LearningResource) => {
    // Use the store's user instead of separate useAuthStore
    // const { user } = useLearningResourceStore.getState(); // You might need to adjust this

    // Prevent multiple view tracking for same resource
    if (viewingResources.has(resource._id)) {
      window.open(resource.url, '_blank');
      return;
    }

    // Check if user has already viewed this resource
    if (resource.hasViewed) {
      window.open(resource.url, '_blank');
      return;
    }

    setViewingResources(prev => new Set(prev).add(resource._id));

    try {
      await viewResource(resource._id);
      // The store now handles localStorage updates
    } catch (error) {
      console.error('Error tracking view:', error);
    } finally {
      window.open(resource.url, '_blank');

      // Remove from tracking set after a delay
      setTimeout(() => {
        setViewingResources(prev => {
          const newSet = new Set(prev);
          newSet.delete(resource._id);
          return newSet;
        });
      }, 3000);
    }
  }, [viewResource, viewingResources]);

  // Optimized like handler with persistent tracking
  const handleLike = useCallback(async (id: string) => {
    if (!user) {
      setLocalError('Please login to like resources');
      return;
    }

    // Prevent multiple rapid clicks
    if (likingResources.has(id)) {
      return;
    }

    setLikingResources(prev => new Set(prev).add(id));

    try {
      await likeResource(id);
      // REMOVED: The store already handles local storage updates
      // Don't try to update local storage here as it causes race conditions
    } catch (error) {
      console.error('Error liking resource:', error);
    } finally {
      setLikingResources(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [user, likeResource, likingResources]);

  const handleDelete = async (id: string) => {
    const resource = resources.find(r => r._id === id);
    if (!resource) return;

    if (!canDelete(resource)) {
      setLocalError('You can only delete your own resources');
      return;
    }

    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        // No need to refetch - store updates optimistically
      } catch (error: any) {
        if (error?.response?.status === 403) {
          setLocalError('You can only delete your own resources');
        } else {
          setLocalError('Error deleting resource');
        }
      }
    }
  };



  const handleViewDescription = useCallback((resource: LearningResource) => {
    setViewDescriptionResource(resource);
  }, []);

  const handleCloseDescription = useCallback(() => {
    setViewDescriptionResource(null);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingResource(null);
    setLocalError(null);
  }, []);

  const formatViews = useCallback((views: number | undefined): string => {
    const viewsCount = views || 0;
    if (viewsCount >= 1000000) {
      return (viewsCount / 1000000).toFixed(1) + 'M';
    }
    if (viewsCount >= 1000) {
      return (viewsCount / 1000).toFixed(1) + 'K';
    }
    return viewsCount.toString();
  }, []);

  const getResourceValue = useCallback(<T,>(value: T | undefined, defaultValue: T): T => {
    return value !== undefined ? value : defaultValue;
  }, []);

  // Loading state for initial load
  if (status === 'loading' && resources.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading learning resources...</p>
        </div>
      </div>
    );
  }

  return (
    <section id="learningSection" className="content-section active bg-gray-900 p-6">
      {/* Section Header */}
      <div className="section-header mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Learning Resources</h2>
            <p className="text-gray-400">Discover and share valuable learning materials</p>
            {isAdmin() && (
              <div className="flex items-center gap-1 mt-1">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">Admin Mode</span>
                <span className="text-gray-500 text-sm">- You can edit and delete all resources</span>
              </div>
            )}
          </div>
          <div className="section-actions flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="search-filter flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="learningSearch"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="form-control bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-full"
                  placeholder="Search resources..."
                />
              </div>
              <select
                id="learningFilter"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="form-control bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-w-[140px]"
              >
                <option value="">All Categories</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Article">Article</option>
                <option value="Video">Video</option>
                <option value="Course">Course</option>
                <option value="Documentation">Documentation</option>
              </select>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="form-control bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-w-[140px]"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <button
              id="addLearningBtn"
              onClick={() => setShowForm(true)}
              className="btn btn--primary bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(error || localError) && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <span className="text-red-400 font-medium">{error || localError}</span>
            </div>
            <button
              onClick={() => {
                clearError();
                setLocalError(null);
              }}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <div id="learningGrid" className="resource-grid grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        {resources.map((resource) => (
          <div key={resource._id} className="resource-card bg-gray-800 border border-gray-700 rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/20 hover:border-teal-500/50 hover:scale-[1.02] hover:bg-gray-750">

            {/* Resource Header */}
            <div className="resource-header p-6">
              <h3 className="resource-title text-xl font-bold text-white mb-3 line-clamp-2">
                {resource.title}
              </h3>

              <div className="resource-meta flex items-center gap-2 mb-3">
                <span className={`resource-category inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${resource.category === 'Tutorial' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  resource.category === 'Video' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    resource.category === 'Course' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      resource.category === 'Article' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                  {resource.category}
                </span>
                <span className={`resource-difficulty inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${resource.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  resource.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                  {resource.difficulty}
                </span>
              </div>

              <p className="resource-description text-gray-300 text-sm line-clamp-3 mb-4">
                {resource.description}
              </p>
            </div>

            {/* Resource Body */}
            <div className="resource-body p-6 border-t border-gray-700">

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="resource-tags flex flex-wrap gap-1.5 mb-4">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={`${resource._id}-tag-${index}`}
                      className="resource-tag inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="resource-stats flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(resource.views)} views</span>
                </div>
                <button
                  onClick={() => handleLike(resource._id)}
                  disabled={likingResources.has(resource._id)}
                  className={`flex items-center space-x-1.5 transition-colors group/like ${resource.isLiked
                    ? 'text-red-500 hover:text-red-400'
                    : 'text-gray-400 hover:text-red-400'
                    } ${likingResources.has(resource._id)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                    }`}
                >
                  <Heart
                    className="w-4 h-4 group-hover/like:scale-110 transition-transform"
                    fill={resource.isLiked ? "currentColor" : "none"}
                  />
                  <span>{getResourceValue(resource.likes, 0)}</span>
                </button>
              </div>

              {/* Actions */}
              <div className="resource-actions flex items-center justify-between gap-2">
                <button
                  onClick={() => handleView(resource)}
                  disabled={viewingResources.has(resource._id)}
                  className="btn btn--outline btn--sm flex-1 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="w-4 h-4" />
                  {viewingResources.has(resource._id)
                    ? 'Opening...'
                    : (resource.hasViewed ? 'View Again' : 'View')
                  }
                </button>

                {/* Edit Button - Show for user's own resources OR if admin */}
                {(isOwnedByUser(resource) || isAdmin()) && (
                  <button
                    onClick={() => handleEdit(resource)}
                    className="btn btn--secondary btn--sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}

                {/* Delete Button - Show for user's own resources OR if admin */}
                {(isOwnedByUser(resource) || isAdmin()) && (
                  <button
                    onClick={() => {
                      setEditingResource(resource); // Set the resource to delete
                      setShowDeleteConfirmation(true);
                    }}
                    className="btn btn--outline btn--sm bg-transparent border border-gray-600 text-gray-300 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>

              {/* Owner Indicator */}
              <div className="mt-3 pt-3 border-t border-gray-600">
                {isOwnedByUser(resource) ? (
                  isAdmin() ? (
                    <span className="text-xs text-yellow-400 font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Your Resource (Admin)
                    </span>
                  ) : (
                    <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Your Resource
                    </span>
                  )
                ) : (
                  <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Created by: {resource.createdBy.userName}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {resources.length === 0 && status === 'success' && (
        <div className="empty-state text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-gray-500 text-6xl mb-4">
            <BookOpen className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">No resources found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Try adjusting your search criteria or add a new resource.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add New Resource
          </button>
        </div>
      )}

      {/* Loading State for pagination */}
      {status === 'loading' && resources.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <LearningResourceForm
          editingResource={editingResource}
          onSubmit={handleCreate}
          onClose={handleCloseForm}
          isLoading={status === 'loading'}
          error={localError}
        />
      )}
      {showDeleteConfirmation && editingResource && (
        <DeleteConfirmation
          resourceId={editingResource._id}
          resourceTitle={editingResource.title}
          onConfirm={async (id) => {
            setIsDeleting(true);
            await deleteResource(id); // Use the existing deleteResource function
            setIsDeleting(false);
            setShowDeleteConfirmation(false);
          }}
          onClose={() => setShowDeleteConfirmation(false)}
          isLoading={isDeleting}
        />
      )}

      {/* Description View Modal */}
      {viewDescriptionResource && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {viewDescriptionResource.title}
                </h2>
                <button
                  onClick={handleCloseDescription}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${viewDescriptionResource.category === 'Tutorial' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  viewDescriptionResource.category === 'Video' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    viewDescriptionResource.category === 'Course' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      viewDescriptionResource.category === 'Article' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                  {viewDescriptionResource.category}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${viewDescriptionResource.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  viewDescriptionResource.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                  {viewDescriptionResource.difficulty}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-400">
                  Created by: {viewDescriptionResource.createdBy.userName}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {viewDescriptionResource.description}
              </p>
            </div>
            <div className="p-6 border-t border-gray-700 bg-gray-750 rounded-b-lg">
              <button
                onClick={handleCloseDescription}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

      )}

    </section>


  );
};

export default LearningResourceCompo;