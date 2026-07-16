import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="px-1 text-[13px] font-semibold uppercase tracking-wide text-muted"
      >
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>

      {children}

      {error ? (
        <p role="alert" className="px-1 text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="px-1 text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}