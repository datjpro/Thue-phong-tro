import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contractTenants, invoices, payments, properties, rooms, tenants } from "@/db/schema";

export async function listInvoices(propertyId: string) {
  return db
    .select({
      id: invoices.id,
      roomId: invoices.roomId,
      period: invoices.period,
      roomName: rooms.name,
      total: invoices.total,
      paidAmount: invoices.paidAmount,
      status: invoices.status,
      dueDate: invoices.dueDate,
    })
    .from(invoices)
    .innerJoin(rooms, eq(rooms.id, invoices.roomId))
    .where(and(eq(invoices.propertyId, propertyId), isNull(invoices.deletedAt)))
    .orderBy(desc(invoices.period), rooms.name);
}

export async function getInvoiceDetail(propertyId: string, invoiceId: string) {
  const [row] = await db
    .select({ invoice: invoices, roomName: rooms.name, propertyName: properties.name })
    .from(invoices)
    .innerJoin(rooms, eq(rooms.id, invoices.roomId))
    .innerJoin(properties, eq(properties.id, invoices.propertyId))
    .where(
      and(
        eq(invoices.propertyId, propertyId),
        eq(invoices.id, invoiceId),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);
  if (!row) return null;

  const [tenant] = await db
    .select({ fullName: tenants.fullName })
    .from(contractTenants)
    .innerJoin(tenants, eq(tenants.id, contractTenants.tenantId))
    .where(
      and(
        eq(contractTenants.propertyId, propertyId),
        eq(contractTenants.contractId, row.invoice.contractId),
        eq(contractTenants.isPrimary, "yes"),
      ),
    )
    .limit(1);

  const paymentRows = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.propertyId, propertyId),
        eq(payments.invoiceId, invoiceId),
        isNull(payments.deletedAt),
      ),
    )
    .orderBy(desc(payments.paidAt));

  return { ...row, tenantName: tenant?.fullName ?? null, payments: paymentRows };
}
