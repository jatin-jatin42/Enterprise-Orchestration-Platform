import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  responsive?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className,
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon: Icon,
    children,
    disabled,
    fullWidth = false,
    responsive = true,
    ...props 
  }, ref) => {
    
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 dark:active:bg-blue-500 shadow-sm hover:shadow-md',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500 shadow-sm hover:shadow-md',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 shadow-sm hover:shadow-md',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800 dark:bg-red-700 dark:hover:bg-red-600 dark:active:bg-red-500 shadow-sm hover:shadow-md',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    };

    const responsiveSizes = {
      sm: 'px-3 py-1.5 text-xs sm:text-sm gap-1.5',
      md: 'px-3 py-2 text-sm sm:px-4 sm:py-2 gap-2',
      lg: 'px-4 py-3 text-sm sm:px-6 sm:py-3 sm:text-base gap-2.5',
    };

    const iconSizes = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    const responsiveIconSizes = {
      sm: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
      md: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
      lg: 'w-4 h-4 sm:w-5 sm:h-5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          responsive ? responsiveSizes[size] : sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className={cn(
              'animate-spin',
              responsive ? responsiveIconSizes[size] : iconSizes[size]
            )} 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
            />
          </svg>
        )}
        {Icon && !loading && (
          <Icon className={cn(
            responsive ? responsiveIconSizes[size] : iconSizes[size]
          )} />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';