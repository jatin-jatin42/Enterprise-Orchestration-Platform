import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface DeleteConfirmationProps {
  internId: string;
  onConfirm: (id: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function DeleteConfirmation({ 
  internId, 
  onConfirm, 
  onClose, 
  isLoading 
}: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-3 z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg w-full max-w-xs p-4 border border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-red-900/30 mb-2">
            <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Delete Intern</h3>
          <p className="text-gray-400 text-xs mb-3">
            Are you sure you want to delete this intern? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors text-xs"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(internId)}
              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors text-xs flex items-center gap-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}