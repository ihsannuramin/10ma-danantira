import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldError } from "./field";

type Option = { value: string; label: ReactNode; description?: ReactNode };

type GroupProps = {
  name: string;
  legend: ReactNode;
  options: Option[];
  error?: string;
  className?: string;
  /** Visually hide the legend (it stays available to screen readers). */
  hideLegend?: boolean;
};

type SegmentedProps = GroupProps & {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  layout?: "segmented" | "cards";
};

/**
 * Single choice built on native radios, so keyboard and screen-reader
 * behaviour come for free. "segmented" matches the Singles/Doubles control in
 * the showcase; "cards" stacks options with descriptions.
 */
export function SegmentedControl({
  name,
  legend,
  options,
  error,
  className,
  hideLegend,
  defaultValue,
  value,
  onChange,
  layout = "segmented",
}: SegmentedProps) {
  const id = `${name}-group`;
  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className={cn("mb-1.5 text-body-sm font-semibold", hideLegend && "sr-only")}>{legend}</legend>
      <div
        className={cn(
          layout === "segmented" ? "grid auto-cols-fr grid-flow-col gap-1 rounded-md bg-soft p-1" : "flex flex-col gap-2",
        )}
      >
        {options.map((option) => (
          <label key={option.value} className="relative block cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              className="peer sr-only"
              {...(value !== undefined
                ? { checked: value === option.value, onChange: () => onChange?.(option.value) }
                : { defaultChecked: defaultValue === option.value, onChange: onChange && (() => onChange(option.value)) })}
            />
            {layout === "segmented" ? (
              <span className="flex min-h-11 items-center justify-center gap-1.5 rounded-sm px-3 text-body-sm font-semibold text-muted transition-colors peer-checked:bg-lime peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-ink">
                {option.label}
              </span>
            ) : (
              <span className="flex min-h-12 items-center gap-3 rounded-md border border-line bg-white px-4 py-3 text-body-sm transition-colors peer-checked:border-ink peer-checked:bg-lime/30 peer-focus-visible:outline-2 peer-focus-visible:outline-ink">
                <span className="flex-1">
                  <span className="block font-semibold">{option.label}</span>
                  {option.description && <span className="block text-caption text-muted">{option.description}</span>}
                </span>
              </span>
            )}
          </label>
        ))}
      </div>
      <FieldError id={id} error={error} />
    </fieldset>
  );
}

type CheckboxGroupProps = GroupProps & { defaultValues?: string[] };

/** Multi-select pills (e.g. availability). */
export function CheckboxChips({ name, legend, options, error, className, defaultValues = [] }: CheckboxGroupProps) {
  const id = `${name}-group`;
  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)}>
      <legend className="mb-1.5 text-body-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="checkbox"
              name={name}
              value={option.value}
              defaultChecked={defaultValues.includes(option.value)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-body-sm font-semibold text-muted transition-colors peer-checked:border-ink peer-checked:bg-lime peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-ink [&>svg]:hidden peer-checked:[&>svg]:block">
              <Check className="size-4" aria-hidden />
              {option.label}
            </span>
          </label>
        ))}
      </div>
      <FieldError id={id} error={error} />
    </fieldset>
  );
}
