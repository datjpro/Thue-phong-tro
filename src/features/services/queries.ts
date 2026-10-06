import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contractServices, propertyServices } from "@/db/schema";

export type PropertyServiceItem = typeof propertyServices.$inferSelect;

export async function listPropertyServices(propertyId: string): Promise<PropertyServiceItem[]> {
  return db
    .select()
    .from(propertyServices)
    .where(eq(propertyServices.propertyId, propertyId))
    .orderBy(desc(propertyServices.createdAt));
}

export type ContractServiceDetail = {
  id: string;
  serviceId: string;
  name: string;
  chargeType: string;
  unitPrice: number;
  quantity: number;
  effectivePrice: number;
  total: number;
};

export async function getContractServices(
  propertyId: string,
  contractId: string,
): Promise<ContractServiceDetail[]> {
  const rows = await db
    .select({
      id: contractServices.id,
      serviceId: contractServices.serviceId,
      name: propertyServices.name,
      chargeType: propertyServices.chargeType,
      unitPrice: propertyServices.unitPrice,
      customPrice: contractServices.customPrice,
      quantity: contractServices.quantity,
    })
    .from(contractServices)
    .innerJoin(propertyServices, eq(contractServices.serviceId, propertyServices.id))
    .where(
      and(
        eq(contractServices.propertyId, propertyId),
        eq(contractServices.contractId, contractId),
        eq(propertyServices.isActive, "yes"),
      ),
    );

  return rows.map((r) => {
    const effectivePrice = r.customPrice ?? r.unitPrice;
    return {
      id: r.id,
      serviceId: r.serviceId,
      name: r.name,
      chargeType: r.chargeType,
      unitPrice: r.unitPrice,
      quantity: r.quantity,
      effectivePrice,
      total: effectivePrice * r.quantity,
    };
  });
}
