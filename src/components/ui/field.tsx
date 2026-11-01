import { CircleAlert } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const controlBase =
  "w-full rounded-md border bg-white px-4 text-body text-ink placeholder:text-muted/70 transition-colors " +
  "focus:border-ink focus:outline-none disabled:bg-soft disabled:text-muted";

const controlBorder = (invalid: boolean) => (invalid ? "border-danger" : "border-line");

export const errorId = (id: string) => `${id}-error`;
export const hintId = (id: string) => `${id}-hint`;

function describedBy(id: string, hint?: ReactNode, error?: string) {
  return [hint ? hintId(id) : null, error ? errorId(id) : null].filter(Boolean).join(" ") || undefined;
}

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label + control + hint + inline error. Every input gets a visible label. */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-body-sm font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (opsional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId(id)} className="text-caption text-muted">
          {hint}
        </p>
      )}
      <FieldError id={id} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={errorId(id)} className="flex items-center gap-1 text-caption font-medium text-danger" role="alert">
      <CircleAlert className="size-3.5 shrink-0" aria-hidden />
      {error}
    </p>
  );
}

type ControlExtras = { invalid?: boolean; hint?: ReactNode; error?: string };

export function Input({
  className,
  invalid,
  hint,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & ControlExtras) {
  const isInvalid = invalid ?? Boolean(error);
  return (
    <input
      className={cn(controlBase, controlBorder(isInvalid), "h-12", className)}
      aria-invalid={isInvalid || undefined}
      aria-describedby={props.id ? describedBy(props.id, hint, error) : undefined}
      {...props}
    />
  );
}

export function Select({
  className,
  invalid,
  hint,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & ControlExtras) {
  const isInvalid = invalid ?? Boolean(error);
  return (
    <select
      className={cn(controlBase, controlBorder(isInvalid), "h-12 appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23111' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      aria-invalid={isInvalid || undefined}
      aria-describedby={props.id ? describedBy(props.id, hint, error) : undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  invalid,
  hint,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & ControlExtras) {
  const isInvalid = invalid ?? Boolean(error);
  return (
    <textarea
      className={cn(controlBase, controlBorder(isInvalid), "min-h-24 py-3", className)}
      aria-invalid={isInvalid || undefined}
      aria-describedby={props.id ? describedBy(props.id, hint, error) : undefined}
      {...props}
    />
  );
}
