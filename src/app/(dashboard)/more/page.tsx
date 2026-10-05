import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { moreItems } from "@/components/shared/nav-items";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default async function MorePage() {
  const t = await getTranslations();
  const locale = (await getLocale()) === "en" ? "en" : "vi";

  return (
    <PageTransition className="space-y-6">
      <PageHeader title={t("nav.more")} description="Các tính năng và tùy chọn hệ thống" />

      <div className="max-w-md space-y-4">
        {/* Navigation links card */}
        <div className="flex flex-col divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          {moreItems.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 font-medium text-foreground transition-colors hover:bg-muted/40 active:bg-muted/60"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <span>{t(`nav.${key}`)}</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" aria-hidden="true" />
            </Link>
          ))}
        </div>

        {/* System & user preferences */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-2">
              {t("settings.language")}
            </span>
            <LocaleToggle current={locale} />
          </div>

          <div className="pt-3 border-t border-border/40">
            <span className="text-xs font-medium text-muted-foreground block mb-2">Giao diện</span>
            <ThemeToggle />
          </div>

          <div className="pt-3 border-t border-border/40">
            <SignOutButton />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
