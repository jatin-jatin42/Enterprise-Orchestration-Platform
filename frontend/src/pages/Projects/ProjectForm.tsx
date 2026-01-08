import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useProjectStore } from '../../stores/ProjectStore';
import { type Project, type CreateProjectData } from '../../types/projects';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const projectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['Planning', 'In Progress', 'Completed', 'On Hold']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  repositoryUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  technologies: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  editingProject: Project | null;
  onClose: () => void;
}

export default function ProjectForm({
  editingProject,
  onClose,
}: ProjectFormProps) {
  const { createProject, updateProject, status, error, clearError } =
    useProjectStore();
  const isLoading = status === 'loading';
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: editingProject?.projectName || '',
      description: editingProject?.description || '',
      status: editingProject?.status || 'Planning',
      startDate: editingProject?.startDate
        ? new Date(editingProject.startDate).toISOString().split('T')[0]
        : '',
      endDate: editingProject?.endDate
        ? new Date(editingProject.endDate).toISOString().split('T')[0]
        : '',
      projectUrl: editingProject?.projectUrl || '',
      repositoryUrl: editingProject?.repositoryUrl || '',
      technologies: editingProject?.technologies?.join(', ') || '',
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const submitData = {
        ...data,
        technologies: data.technologies
          ? data.technologies.split(',').map((t) => t.trim())
          : [],
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      };

      if (editingProject) {
        await updateProject(editingProject._id, submitData, selectedFiles);
        toast.success('Project updated successfully');
      } else {
        await createProject(submitData as CreateProjectData, selectedFiles);
        toast.success('Project created successfully');
      }
      onClose();
    } catch (e) {
      console.error('Failed to save project', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-gray-800 text-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Project Name
                </label>
                <input
                  id="projectName"
                  {...register('projectName')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.projectName && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.projectName.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              {/* Technologies */}
              <div>
                <label
                  htmlFor="technologies"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Technologies (comma-separated)
                </label>
                <input
                  id="technologies"
                  {...register('technologies')}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Start Date */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Project URL */}
              <div className="md:col-span-2">
                <label
                  htmlFor="projectUrl"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Project URL
                </label>
                <input
                  id="projectUrl"
                  {...register('projectUrl')}
                  placeholder="https://your-project.com"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.projectUrl && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.projectUrl.message}
                  </p>
                )}
              </div>

              {/* Repository URL */}
              <div className="md:col-span-2">
                <label
                  htmlFor="repositoryUrl"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Repository URL
                </label>
                <input
                  id="repositoryUrl"
                  {...register('repositoryUrl')}
                  placeholder="https://github.com/user/repo"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.repositoryUrl && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.repositoryUrl.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Document Upload Section */}
              <div className="md:col-span-2 border-t border-gray-700 pt-4 mt-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Documents (PDF, DOCX)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-600 file:text-white
                    hover:file:bg-indigo-700 file:cursor-pointer
                  "
                />
                {selectedFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-700 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting || isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}