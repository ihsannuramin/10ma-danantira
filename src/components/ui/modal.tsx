"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "./button";

/**
 * Native <dialog> gives focus trapping, Esc to close and inert background.
 * Reserved for destructive confirmations (Design.md §35).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // Several modals can share a page; each needs its own label id.
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-white p-0 text-ink shadow-float backdrop:bg-ink/50"
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h2 id={titleId} className="text-h3">
              {title}
            </h2>
            {description && <p className="mt-1 text-body-sm text-muted">{description}</p>}
          </div>
          <IconButton label="Tutup" onClick={onClose} className="-mr-2 -mt-2">
            <X className="size-5" aria-hidden />
          </IconButton>
        </div>
        {children}
      </div>
    </dialog>
  );
}
