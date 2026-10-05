import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { requireContext } from "@/lib/session";

export default async function SettingsPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations("settings");
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />
      <SettingsForm
        propertyId={propertyId}
        defaults={{
          name: property.name,
          electricPrice: property.electricPrice,
          waterPrice: property.waterPrice,
          dueDay: property.dueDay,
        }}
      />
    </>
  );
}
