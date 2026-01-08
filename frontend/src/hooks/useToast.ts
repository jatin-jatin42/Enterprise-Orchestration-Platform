import toast from 'react-hot-toast';

export const useToast = () => {
  const showToast = {
    // Success toast
    success: (message: string, title?: string) => {
      toast.success(title ? `${title}: ${message}` : message);
    },

    // Error toast
    error: (message: string, title?: string) => {
      toast.error(title ? `${title}: ${message}` : message);
    },

    // Warning toast
    warning: (message: string) => {
      toast(message, {
        icon: '⚠️',
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b',
        },
      });
    },

    // Info toast
    info: (message: string) => {
      toast(message, {
        icon: 'ℹ️',
        style: {
          background: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #3b82f6',
        },
      });
    },

    // Loading toast
    loading: (message: string) => {
      return toast.loading(message);
    },

    // Promise toast
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promise, messages);
    },

    // Dismiss toast
    dismiss: (toastId?: string) => {
      toast.dismiss(toastId);
    },

    // Remove all toasts
    remove: () => {
      toast.remove();
    },
  };

  return showToast;
};