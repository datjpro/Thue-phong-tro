import { eq } from "drizzle-orm";
import { CreditCard, Home, Phone, User } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { FontSizeSelector } from "@/components/shared/font-size-selector";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { db } from "@/db";
import { properties, tenants } from "@/db/schema";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { requireContext } from "@/lib/session";

export default async function SettingsPage() {
  const ctx = await requireContext();
  const t = await getTranslations("settings");
  const locale = (await getLocale()) === "en" ? "en" : "vi";
  const isTenant = ctx.role === "tenant";

  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, ctx.propertyId))
    .limit(1);

  let tenantProfile = null;
  if (isTenant && ctx.tenantId) {
    const [tp] = await db.select().from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
    tenantProfile = tp;
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title={t("title")}
        description={isTenant ? "Tùy chọn giao diện và thông tin tài khoản" : t("subtitle")}
      />

      <div className={isTenant ? "max-w-xl space-y-6" : "grid gap-6 lg:grid-cols-[1fr_360px]"}>
        {/* For Landlord: Settings form */}
        {!isTenant ? (
          <div>
            <SettingsForm
              propertyId={ctx.propertyId}
              defaults={{
                name: property.name,
                electricPrice: property.electricPrice,
                waterPrice: property.waterPrice,
                dueDay: property.dueDay,
              }}
            />
          </div>
        ) : (
          /* For Tenant: Personal Info Card */
          <div className="rounded-xl border border-suong bg-mat p-5 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-muc">Thông tin người thuê</h3>
            <div className="divide-y divide-suong text-sm">
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-muc-phu">
                  <User size={15} /> Họ và tên
                </span>
                <span className="font-semibold text-muc">
                  {tenantProfile?.fullName ?? ctx.userName}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-muc-phu">
                  <Home size={15} /> Phòng đang thuê
                </span>
                <span className="font-semibold text-muc">{ctx.roomName ?? "Chưa phân phòng"}</span>
              </div>
              {tenantProfile?.idNumber ? (
                <div className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-muc-phu">
                    <CreditCard size={15} /> Số CCCD / Định danh
                  </span>
                  <span className="font-mono font-medium text-muc">{tenantProfile.idNumber}</span>
                </div>
              ) : null}
              {tenantProfile?.phone ? (
                <div className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-muc-phu">
                    <Phone size={15} /> Số điện thoại
                  </span>
                  <span className="font-mono font-medium text-muc">{tenantProfile.phone}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Preferences card */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-suong bg-mat p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-muc">Tùy chọn giao diện</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-muc-phu block mb-1.5">
                  Cỡ chữ hiển thị
                </span>
                <FontSizeSelector />
              </div>
              <div className="pt-3 border-t border-suong/60">
                <span className="text-xs font-medium text-muc-phu block mb-1.5">
                  Chủ đề hiển thị
                </span>
                <ThemeToggle />
              </div>
              <div className="pt-3 border-t border-suong/60">
                <span className="text-xs font-medium text-muc-phu block mb-1.5">
                  {t("language")}
                </span>
                <LocaleToggle current={locale} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
