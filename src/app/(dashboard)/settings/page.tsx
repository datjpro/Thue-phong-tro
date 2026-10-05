import { eq } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { requireContext } from "@/lib/session";

export default async function SettingsPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations("settings");
  const locale = (await getLocale()) === "en" ? "en" : "vi";
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  return (
    <PageTransition className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Settings form */}
        <div>
          <SettingsForm
            propertyId={propertyId}
            defaults={{
              name: property.name,
              electricPrice: property.electricPrice,
              waterPrice: property.waterPrice,
              dueDay: property.dueDay,
            }}
          />
        </div>

        {/* Preferences card */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground">Tùy chọn giao diện</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1.5">
                  {t("language")}
                </span>
                <LocaleToggle current={locale} />
              </div>
              <div className="pt-2 border-t border-border/40">
                <span className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Chủ đề hiển thị
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
