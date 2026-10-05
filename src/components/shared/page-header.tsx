import type * as React from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold leading-8">{title}</h1>
        {description ? <p className="text-sm text-muc-phu">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}
