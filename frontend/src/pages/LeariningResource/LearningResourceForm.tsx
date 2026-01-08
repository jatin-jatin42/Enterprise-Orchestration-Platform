import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ResourceCategory, DifficultyLevel, CreateResourceData } from '../../types';

const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['Tutorial', 'Documentation', 'Video', 'Course', 'Article']),
  url: z.string().url('Please enter a valid URL'),
  tags: z.array(z.string()),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  prerequisites: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  thumbnail: z.string().optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface LearningResourceFormProps {
  editingResource?: any;
  onSubmit: (data: CreateResourceData) => void;
  onClose: () => void;
  isLoading: boolean;
  error?: string | null;
}

const LearningResourceForm: React.FC<LearningResourceFormProps> = ({
  editingResource,
  onSubmit,
  onClose,
  isLoading,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      category: 'Tutorial',
      difficulty: 'Beginner',
      tags: [],
      prerequisites: [],
      learningObjectives: [],
    },
  });

  useEffect(() => {
    if (editingResource) {
      reset({
        title: editingResource.title,
        description: editingResource.description,
        category: editingResource.category,
        url: editingResource.url,
        tags: editingResource.tags || [],
        difficulty: editingResource.difficulty,
        prerequisites: editingResource.prerequisites || [],
        learningObjectives: editingResource.learningObjectives || [],
        thumbnail: editingResource.thumbnail || '',
      });
    }
  }, [editingResource, reset]);

  const handleFormSubmit = (data: ResourceFormData) => {
    onSubmit(data);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-hide">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded p-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                placeholder="Enter resource title"
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-sm"
                placeholder="Describe the learning resource..."
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                >
                  <option value="Tutorial">Tutorial</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Video">Video</option>
                  <option value="Course">Course</option>
                  <option value="Article">Article</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Difficulty *
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                URL *
              </label>
              <input
                type="url"
                {...register('url')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                placeholder="https://example.com/resource"
              />
              {errors.url && (
                <p className="text-red-400 text-xs mt-1">{errors.url.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {isLoading 
                ? 'Saving...' 
                : editingResource 
                ? 'Update' 
                : 'Create'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LearningResourceForm;