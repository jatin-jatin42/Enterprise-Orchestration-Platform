// components/CommentModal.tsx
import { useState, useEffect } from 'react';
import { type CommentStatus, type DailyCommentAddedBy } from '../../../types';
import { useAuthStore } from '../../../stores/authStore';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    comment: string;
    taskDescription?: string;
    hoursWorked?: number;
    status?: CommentStatus;
    addedBy: DailyCommentAddedBy;
  }) => void;
  isLoading?: boolean;
  initialData?: {
    date?: string;
    comment?: string;
    taskDescription?: string;
    hoursWorked?: number;
    status?: CommentStatus;
  };
  mode?: 'add' | 'edit';
}

export default function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  mode = 'add'
}: CommentModalProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    comment: initialData?.comment || '',
    taskDescription: initialData?.taskDescription || '',
    hoursWorked: initialData?.hoursWorked || 0,
    status: initialData?.status || 'In Progress' as CommentStatus
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        comment: initialData?.comment || '',
        taskDescription: initialData?.taskDescription || '',
        hoursWorked: initialData?.hoursWorked || 0,
        status: initialData?.status || 'In Progress'
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('No user found in auth store');
      return;
    }

    const addedBy: DailyCommentAddedBy = {
      userId: user._id || user.id || 'unknown-user-id',
      userName: user.name || user.username || 'Unknown User',
      role: user.role || 'user'
    };

    onSubmit({
      ...formData,
      hoursWorked: formData.hoursWorked || 0,
      addedBy
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 to-gray-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {mode === 'add' ? 'Add Daily Comment' : 'Edit Comment'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Date */}
            <div className="form-group">
              <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                required
              />
            </div>

            {/* Comment */}
            <div className="form-group">
              <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                Comment <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleChange('comment', e.target.value)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white resize-none"
                required
                placeholder="Enter your daily comment..."
              />
            </div>

            {/* Task Description */}
            <div className="form-group">
              <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                Task Description
              </label>
              <input
                type="text"
                value={formData.taskDescription}
                onChange={(e) => handleChange('taskDescription', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                placeholder="What task are you working on?"
              />
            </div>

            {/* Hours Worked & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                  Hours Worked
                </label>
                <input
                  type="number"
                  value={formData.hoursWorked}
                  onChange={(e) => handleChange('hoursWorked', parseInt(e.target.value) || 0)}
                  min="0"
                  max="24"
                  step="0.5"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                />
              </div>

              <div className="form-group">
                <label className="form-label text-sm text-gray-300 mb-2 block font-medium">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as CommentStatus)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !formData.comment.trim() || !user}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'add' ? 'Adding...' : 'Updating...'}
                </div>
              ) : (
                mode === 'add' ? 'Add Comment' : 'Update Comment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}