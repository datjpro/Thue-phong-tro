"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action";

/**
 * Gọi Server Action từ form: hiện toast thành công/lỗi theo khóa i18n, rồi refresh dữ liệu.
 * Tên toast thành công dùng đúng động từ của nút (UX-UI mục 9).
 */
export function useSubmit<TInput, TData>(
  action: (input: TInput) => Promise<ActionResult<TData>>,
  opts: { successKey: string; onSuccess?: (data: TData) => void },
) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(input: TInput) {
    setError(null);
    startTransition(async () => {
      const result = await action(input);
      if (!result.ok) {
        const message = t.has(`errors.${result.error}`)
          ? t(`errors.${result.error}`)
          : t("errors.generic");
        setError(message);
        toast.error(message);
        return;
      }
      toast.success(t(opts.successKey));
      opts.onSuccess?.(result.data);
      router.refresh();
    });
  }

  return { submit, pending, error };
}
