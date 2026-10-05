import type * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id?: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  renderMobileCard?: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  renderMobileCard,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Desktop view: Table */}
      <div
        className={cn(
          "hidden overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm md:block",
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              {columns.map((col, index) => {
                const headerKey = col.id ?? `head-${index}`;
                return (
                  <TableHead
                    key={headerKey}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                      col.headerClassName,
                    )}
                  >
                    {col.header}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const rowKey = keyExtractor(row);
              return (
                <TableRow
                  key={rowKey}
                  className="border-border/40 hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col, cIndex) => {
                    const cellKey = `${rowKey}-${col.id ?? cIndex}`;
                    return (
                      <TableCell key={cellKey} className={col.className}>
                        {col.cell(row)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view: Card list */}
      {renderMobileCard ? (
        <div className="flex flex-col gap-3 md:hidden">
          {data.map((row) => (
            <div key={keyExtractor(row)}>{renderMobileCard(row)}</div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card md:hidden">
          {data.map((row) => {
            const rowKey = keyExtractor(row);
            return (
              <div key={rowKey} className="p-4">
                {columns.map((col, cIndex) => {
                  const mobileKey = `${rowKey}-${col.id ?? cIndex}`;
                  return (
                    <div key={mobileKey} className="flex justify-between py-1 text-sm">
                      <span className="text-muted-foreground">{col.header}</span>
                      <span>{col.cell(row)}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
