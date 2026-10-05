import type * as React from "react";

/** Trạng thái rỗng: nói rõ thiếu gì và đúng một hành động tiếp theo. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-suong bg-mat px-6 py-12 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {description ? <p className="max-w-md text-sm text-muc-phu">{description}</p> : null}
      {action}
    </div>
  );
}
