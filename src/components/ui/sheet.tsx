"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

/** Sheet từ dưới lên trên mobile, panel trượt bên phải trên desktop. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity duration-200" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex max-h-[90dvh] flex-col overflow-y-auto bg-card p-5 sm:p-6 shadow-2xl border-border/80",
            "inset-x-0 bottom-0 rounded-t-2xl border-t",
            "md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-[460px] md:rounded-none md:border-l md:border-t-0",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4 border-b border-border/40 pb-3">
            <div>
              <Dialog.Title className="text-lg font-bold tracking-tight text-foreground">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Đóng"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
