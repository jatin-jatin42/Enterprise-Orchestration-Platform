import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthLayout } from '../../components/auth/AuthLayout';

// Enhanced validation schema with better error messages
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .max(100, 'Email address is too long')
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password is too long'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, status, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Check for success messages from registration or password reset
  const successMessage = searchParams.get('message');
  const [showSuccess, setShowSuccess] = useState(!!successMessage);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, isDirty },
    setFocus,
    watch,
    trigger,
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: searchParams.get('email') || '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors and focus on email field on mount
  useEffect(() => {
    clearError();
    const timer = setTimeout(() => {
      setFocus('email');
    }, 100);
    return () => clearTimeout(timer);
  }, [setFocus, clearError]);

  // Clear success message after delay
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Clear errors when user starts typing
  useEffect(() => {
    const subscription = watch(() => {
      if ((error || localErrors.length > 0) && hasAttemptedSubmit) {
        clearError();
        setLocalErrors([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, error, localErrors, clearError, hasAttemptedSubmit]);

  // Enhanced error handler
  const handleFormErrors = useCallback((fieldErrors: Record<string, { message?: string }>) => {
    const errorMessages: string[] = [];

    Object.entries(fieldErrors).forEach(([field, error]) => {
      if (error?.message) {
        errorMessages.push(error.message);
      }
    });

    return errorMessages;
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setHasAttemptedSubmit(true);
      clearError();
      setLocalErrors([]);

      // Trigger validation one more time before submission
      const isFormValid = await trigger();
      if (!isFormValid) {
        const fieldErrors = handleFormErrors(errors);
        if (fieldErrors.length > 0) {
          setLocalErrors(fieldErrors);
        }
        return;
      }

      await login(data);
    } catch (err) {
      setLocalErrors(['An unexpected error occurred. Please try again.']);
    }
  };

  const isLoading = status === 'loading' || isSubmitting;
  const displayErrors = error ? [error] : localErrors;
  const hasErrors = displayErrors.length > 0;

  // Get success message text
  const getSuccessMessage = () => {
    switch (successMessage) {
      case 'registered':
        return 'Account created successfully! Please sign in.';
      case 'password_reset':
        return 'Password reset successfully! Please sign in with your new password.';
      case 'verified':
        return 'Email verified successfully! Please sign in.';
      default:
        return 'Success! Please sign in.';
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLink="/register"
      footerLinkText="Create account"
    >
      <form
        className="space-y-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Success Message */}
        {showSuccess && (
          <div
            className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800 animate-in slide-in-from-top duration-300"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {getSuccessMessage()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="ml-4 shrink-0 rounded-md bg-green-50 dark:bg-green-900/30 p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                aria-label="Dismiss success message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {hasErrors && (
          <div
            className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 animate-in slide-in-from-top duration-300"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  {displayErrors.length === 1 ? 'Error signing in' : `${displayErrors.length} errors occurred`}
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                  {displayErrors.map((errorMsg, index) => (
                    <p key={index}>
                      {errorMsg}
                    </p>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setLocalErrors([]);
                }}
                className="ml-4 shrink-0 rounded-md bg-red-50 dark:bg-red-900/30 p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            disabled={isLoading}
            icon={Mail}
            inputSize="lg"
            error={errors.email?.message}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors focus:outline-none focus:underline"
              tabIndex={isLoading ? -1 : 0}
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isLoading}
              icon={Lock}
              inputSize="lg"
              error={errors.password?.message}
              className="pr-10"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />

            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={isLoading ? -1 : 0}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 transition-colors" />
              )}
            </button>
          </div>


        </div>



        {/* Submit Button */}
        <Button
          type="submit"
          loading={false} // Disable built-in spinner
          disabled={(!isValid && hasAttemptedSubmit) || isLoading}
          className="w-full flex justify-center py-3 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          size="lg"
          variant="primary"
          responsive={true}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        {/* Enhanced Accessibility Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
              Enter
            </kbd>{' '}
            to submit
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};