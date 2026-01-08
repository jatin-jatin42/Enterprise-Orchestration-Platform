import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface DeleteConfirmationProps {
  projectId: string;
  onConfirm: (id: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function DeleteConfirmation({
  projectId,
  onConfirm,
  onClose,
  isLoading,
}: DeleteConfirmationProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gray-800 text-white rounded-lg shadow-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-900 border border-red-700 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-2">
            Delete Project?
          </h2>
          <p className="text-gray-400 text-center text-sm mb-6">
            Are you sure you want to delete (deactivate) this project? This
            action cannot be undone.
          </p>
        </div>

        <div className=" px-6 py-4 flex justify-between gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onConfirm(projectId)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-red-400 flex items-center min-w-[100px] justify-center"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Yes, Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}