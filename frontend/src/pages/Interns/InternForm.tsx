import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Intern, InternStatus } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { internSchema, type InternFormData } from './Interns';

interface InternFormProps {
  editingIntern: Intern | null;
  onSubmit: (data: InternFormData) => void;
  onClose: () => void;
}

export default function InternForm({ editingIntern, onSubmit, onClose }: InternFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setValue,
    watch,
    trigger,
    clearErrors,
  } = useForm<InternFormData>({
    resolver: zodResolver(internSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        profileImage: '',
        dateOfBirth: '',
        address: '',
      },
      internshipDetails: {
        startDate: '',
        endDate: '',
        duration: '',
        department: '',
        position: '',
        mentor: { userId: '', name: '' },
        status: 'Active' as InternStatus,
      },
    },
    mode: 'onChange',
  });

  const startDate = watch('internshipDetails.startDate');
  const endDate = watch('internshipDetails.endDate');

  // Update end date validation when start date changes
  useEffect(() => {
    if (startDate && endDate) {
      trigger('internshipDetails.endDate');
    }
  }, [startDate, endDate, trigger]);

  // Initialize form when editingIntern changes
  useEffect(() => {
    if (editingIntern) {
      // Personal Info
      setValue('personalInfo.firstName', editingIntern.personalInfo.firstName);
      setValue('personalInfo.lastName', editingIntern.personalInfo.lastName);
      setValue('personalInfo.email', editingIntern.personalInfo.email);
      setValue('personalInfo.phone', editingIntern.personalInfo.phone || '');
      setValue('personalInfo.profileImage', editingIntern.personalInfo.profileImage || '');
      setValue('personalInfo.dateOfBirth', editingIntern.personalInfo.dateOfBirth ?
        new Date(editingIntern.personalInfo.dateOfBirth).toISOString().split('T')[0] : '');
      setValue('personalInfo.address', editingIntern.personalInfo.address || '');

      // Internship Details
      setValue('internshipDetails.startDate', new Date(editingIntern.internshipDetails.startDate).toISOString().split('T')[0]);
      setValue('internshipDetails.endDate', editingIntern.internshipDetails.endDate ?
        new Date(editingIntern.internshipDetails.endDate).toISOString().split('T')[0] : '');
      setValue('internshipDetails.duration', editingIntern.internshipDetails.duration || '');
      setValue('internshipDetails.department', editingIntern.internshipDetails.department || '');
      setValue('internshipDetails.position', editingIntern.internshipDetails.position || '');

      // Handle mentor - ensure proper structure
      if (editingIntern.internshipDetails.mentor) {
        setValue('internshipDetails.mentor', {
          userId: editingIntern.internshipDetails.mentor.userId.toString(),
          name: editingIntern.internshipDetails.mentor.name
        });
      } else {
        setValue('internshipDetails.mentor', { userId: '', name: '' });
      }

      setValue('internshipDetails.status', editingIntern.internshipDetails.status);

      // Clear any existing errors when editing
      setTimeout(() => clearErrors(), 100);
    } else {
      // Reset form for new intern
      reset({
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          profileImage: '',
          dateOfBirth: '',
          address: '',
        },
        internshipDetails: {
          startDate: '',
          endDate: '',
          duration: '',
          department: '',
          position: '',
          mentor: { userId: '', name: '' },
          status: 'Active' as InternStatus,
        },
      });
      setTimeout(() => clearErrors(), 100);
    }
  }, [editingIntern, reset, setValue, clearErrors]);

  // Helper function to get nested error messages
  const getErrorMessage = (path: string) => {
    const pathParts = path.split('.');
    let currentError: any = errors;

    for (const part of pathParts) {
      if (currentError && currentError[part]) {
        currentError = currentError[part];
      } else {
        return null;
      }
    }

    return currentError?.message || null;
  };
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-3 z-50 backdrop-blur-sm"
    onClick={handleBackdropClick}>
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-bold text-white">
                {editingIntern ? 'Edit Intern' : 'Create New Intern'}
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {editingIntern ? 'Update intern information' : 'Add a new intern to the system'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors p-0.5 hover:bg-gray-700 rounded"
              disabled={isSubmitting}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information Section */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { field: 'personalInfo.firstName', label: 'First Name', type: 'text', required: true },
                  { field: 'personalInfo.lastName', label: 'Last Name', type: 'text', required: true },
                  { field: 'personalInfo.email', label: 'Email', type: 'email', required: true },
                  { field: 'personalInfo.phone', label: 'Phone', type: 'tel', required: false },
                ].map(({ field, label, type, required }) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      {label} {required && '*'}
                    </label>
                    <input
                      type={type}
                      {...register(field as any)}
                      className={`w-full bg-gray-700 border ${getErrorMessage(field) ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 transition-colors text-white placeholder-gray-400`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      disabled={isSubmitting}
                    />
                    {getErrorMessage(field) && (
                      <p className="text-red-400 text-xs mt-0.5 flex items-center gap-0.5">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {getErrorMessage(field)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Internship Details Section */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Internship Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { field: 'internshipDetails.startDate', type: 'date', label: 'Start Date', required: true },
                  { field: 'internshipDetails.endDate', type: 'date', label: 'End Date', required: false },
                  { field: 'internshipDetails.department', type: 'text', label: 'Department', required: true },
                  { field: 'internshipDetails.position', type: 'text', label: 'Position', required: true },
                ].map(({ field, type, label, required }) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      {label} {required && '*'}
                    </label>
                    <input
                      type={type}
                      {...register(field as any)}
                      className={`w-full bg-gray-700 border ${getErrorMessage(field) ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 transition-colors text-white placeholder-gray-400`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      disabled={isSubmitting}
                      min={field === 'internshipDetails.endDate' ? startDate : undefined}
                    />
                    {getErrorMessage(field) && (
                      <p className="text-red-400 text-xs mt-0.5 flex items-center gap-0.5">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {getErrorMessage(field)}
                      </p>
                    )}
                  </div>
                ))}
                
                {/* Optional Mentor Fields */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Mentor ID</label>
                  <input
                    type="text"
                    {...register('internshipDetails.mentor.userId')}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white placeholder-gray-400"
                    placeholder="Enter mentor ID (optional)"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Mentor Name</label>
                  <input
                    type="text"
                    {...register('internshipDetails.mentor.name')}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white placeholder-gray-400"
                    placeholder="Enter mentor name (optional)"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Status *</label>
                  <select
                    {...register('internshipDetails.status')}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                    disabled={isSubmitting}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors text-xs font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium flex items-center gap-1"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {editingIntern ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingIntern ? 'Update Intern' : 'Create Intern'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}