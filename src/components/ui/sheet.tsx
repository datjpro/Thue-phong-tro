"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

/** Sheet từ dưới lên trên mobile, panel bên phải trên desktop. */
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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex max-h-[92dvh] flex-col overflow-y-auto bg-mat p-6 shadow-xl",
            "inset-x-0 bottom-0 rounded-t-panel",
            "md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-[440px] md:rounded-none",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="text-sm text-muc-phu">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="flex size-11 items-center justify-center rounded-control hover:bg-suong/60"
              aria-label="Close"
            >
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
