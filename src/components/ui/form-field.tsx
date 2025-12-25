import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Label } from './label';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, touched, className, required, ...props }, ref) => {
    const hasError = touched && error;
    
    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="text-sm">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          ref={ref}
          className={cn(
            className,
            hasError && 'border-destructive ring-2 ring-destructive/20 focus-visible:ring-destructive/30 animate-shake'
          )}
          {...props}
        />
        {hasError && (
          <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };