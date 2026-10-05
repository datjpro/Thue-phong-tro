import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { moreItems } from "@/components/shared/nav-items";
import Link from "next/link";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { getLocale } from "next-intl/server";

export default async function MorePage() {
  const t = await getTranslations();
  const locale = (await getLocale()) === "en" ? "en" : "vi";
  return (
    <>
      <PageHeader title={t("nav.more")} />
      <ul className="mb-8 flex max-w-md flex-col divide-y divide-suong rounded-panel border border-suong bg-mat">
        {moreItems.map(({ href, key, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="flex min-h-14 items-center gap-3 px-4 font-medium">
              <Icon size={20} aria-hidden="true" />
              {t(`nav.${key}`)}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex max-w-md flex-col gap-4">
        <LocaleToggle current={locale} />
        <ThemeToggle />
        <SignOutButton />
      </div>
    </>
  );
}
