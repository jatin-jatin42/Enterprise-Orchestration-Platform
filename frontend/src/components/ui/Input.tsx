import { type InputHTMLAttributes, forwardRef } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/helpers';

// Omit the native 'size' attribute since we're using it for styling
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  required?: boolean;
  icon?: LucideIcon;
  helperText?: string;
  inputSize?: 'sm' | 'md' | 'lg'; // Renamed from 'size' to avoid conflict
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    required, 
    icon: Icon, 
    id, 
    helperText,
    inputSize = 'md', // Changed from 'size' to 'inputSize'
    fullWidth = true,
    disabled,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    // Icon size classes
    const iconSizeClasses = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    // Icon position classes
    const iconPositionClasses = {
      sm: 'left-2.5',
      md: 'left-3',
      lg: 'left-3.5'
    };

    return (
      <div className={cn(
        'space-y-1.5',
        fullWidth ? 'w-full' : 'w-auto',
        className
      )}>
        {label && (
          <label 
            htmlFor={inputId} 
            className={cn(
              'block text-sm font-medium transition-colors duration-200',
              'text-gray-700 dark:text-gray-300',
              disabled && 'text-gray-500 dark:text-gray-400 cursor-not-allowed'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {Icon && (
            <div className={cn(
              'absolute inset-y-0 left-0 flex items-center pointer-events-none transition-colors duration-200',
              iconPositionClasses[inputSize]
            )}>
              <Icon className={cn(
                iconSizeClasses[inputSize],
                'transition-colors duration-200',
                error 
                  ? 'text-red-500 dark:text-red-400' 
                  : disabled
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-400 dark:text-gray-500'
              )} />
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              // Base styles
              'block rounded-lg border shadow-sm transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-white',
              
              // Size
              sizeClasses[inputSize],
              Icon ? 'pl-10' : 'pl-3',
              'pr-3',
              
              // Border states
              'border-gray-300 dark:border-gray-600',
              'focus:border-blue-500 dark:focus:border-blue-400',
              'focus:ring-blue-500/20 dark:focus:ring-blue-400/20',
              
              // Error states
              error && [
                'border-red-500 dark:border-red-400',
                'focus:border-red-500 dark:focus:border-red-400',
                'focus:ring-red-500/20 dark:focus:ring-red-400/20'
              ],
              
              // Disabled states
              disabled && [
                'bg-gray-50 dark:bg-gray-900',
                'text-gray-500 dark:text-gray-400',
                'border-gray-200 dark:border-gray-700',
                'cursor-not-allowed'
              ],
              
              // Responsive
              'w-full',
              'sm:text-sm',
              
              // Hover states (only when not disabled and not focused)
              !disabled && !error && [
                'hover:border-gray-400 dark:hover:border-gray-500'
              ]
            )}
            {...props}
          />
        </div>
        
        {/* Helper text and error message */}
        {(error || helperText) && (
          <p className={cn(
            'text-xs transition-colors duration-200',
            error 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';