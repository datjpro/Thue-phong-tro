"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { mainNavItems as main, moreItems as more } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  return (
    <aside className="no-print hidden w-60 shrink-0 border-r border-suong bg-mat lg:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-1 p-4">
        <p className="mb-4 px-3 text-lg font-bold text-la">{t("brand")}</p>
        {[...main, ...more].map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-control px-3 text-base font-medium hover:bg-giay",
              isActive(pathname, href) && "bg-la/10 text-la",
            )}
          >
            <Icon size={20} aria-hidden="true" />
            {t(key)}
          </Link>
        ))}
      </div>
    </aside>
  );
}

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const moreActive = more.some((m) => isActive(pathname, m.href)) || pathname === "/more";
  const items = [
    ...main.map((m) => ({ ...m, active: isActive(pathname, m.href) })),
    { href: "/more", key: "more", icon: MoreHorizontal, active: moreActive },
  ];
  return (
    <nav
      aria-label={t("brand")}
      className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-suong bg-mat pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {items.map(({ href, key, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center gap-0.5 text-sm font-medium",
            active ? "text-la" : "text-muc-phu",
          )}
        >
          <Icon size={22} aria-hidden="true" />
          {t(key)}
        </Link>
      ))}
    </nav>
  );
}
