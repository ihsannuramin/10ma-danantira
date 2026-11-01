import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StateProps = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** Icon → headline → explanation → primary action (Design.md §33). */
export function EmptyState({ icon, title, description, action, className }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-line bg-white px-6 py-10 text-center",
        className,
      )}
    >
      {icon && <div className="flex size-14 items-center justify-center rounded-full bg-lime text-ink [&>svg]:size-7">{icon}</div>}
      <div className="flex flex-col gap-1">
        <p className="text-h3">{title}</p>
        {description && <p className="max-w-xs text-body-sm text-muted">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** What happened → why → what to do (Design.md §34). */
export function ErrorState({ title, description, action, className }: Omit<StateProps, "icon">) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center gap-3 rounded-lg border border-danger/30 bg-white px-6 py-10 text-center", className)}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <CircleAlert className="size-7" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-h3">{title}</p>
        {description && <p className="max-w-xs text-body-sm text-muted">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Inline banner for form-level errors. */
export function Alert({ title, description }: { title: string; description?: string }) {
  return (
    <div role="alert" className="flex gap-3 rounded-md border border-danger/30 bg-danger/5 p-4 text-body-sm">
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {description && <p className="text-muted">{description}</p>}
      </div>
    </div>
  );
}
