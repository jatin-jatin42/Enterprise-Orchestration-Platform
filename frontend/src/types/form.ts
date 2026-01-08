import type { FieldError, FieldValues } from 'react-hook-form';

export interface FormFieldValidation {
  required?: string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: unknown) => string | boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: FormFieldValidation;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  hidden?: boolean;
}

export interface FormState<T extends FieldValues = FieldValues> {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  errors: Record<keyof T, FieldError>;
  touched: Record<keyof T, boolean>;
}