"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { bottomNavItems, sidebarNavItems } from "./nav-items";
import { SignOutButton } from "./sign-out-button";
import { ThemeToggle } from "./theme-toggle";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="no-print hidden w-[240px] shrink-0 border-r border-border/60 bg-card lg:block">
      <div className="sticky top-0 flex h-dvh flex-col justify-between p-4">
        <div className="flex flex-col gap-1">
          {/* Brand header */}
          <Link
            href="/"
            className="mb-5 flex items-center gap-2.5 px-3 py-1.5 transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20 text-primary ring-1 ring-primary/30">
              <Building2 size={20} aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">
                {t("brand")}
              </span>
              <span className="text-[11px] text-muted-foreground">Quản lý phòng trọ</span>
            </div>
          </Link>

          {/* Nav links in exact order */}
          <nav className="flex flex-col gap-1" aria-label="Menu chính">
            {sidebarNavItems.map(({ href, key, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all select-none",
                    active
                      ? "bg-primary/15 text-primary border-l-2 border-primary font-semibold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <Icon
                    size={18}
                    aria-hidden="true"
                    className={cn(active ? "text-primary" : "text-muted-foreground")}
                  />
                  <span>{t(key)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border/60 pt-3">
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopBar() {
  const t = useTranslations("nav");

  return (
    <header className="no-print sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/60 bg-card/80 px-4 backdrop-blur-md lg:hidden">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <Building2 size={18} aria-hidden="true" />
        </div>
        <span className="text-base font-bold tracking-tight text-foreground">{t("brand")}</span>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label="Thanh điều hướng dưới"
      className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border/80 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      {bottomNavItems.map(({ href, key, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 py-1 text-center transition-colors select-none",
              active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-transform active:scale-95",
                active && "bg-primary/15 text-primary",
              )}
            >
              <Icon size={18} aria-hidden="true" />
            </div>
            <span className="text-[11px] leading-tight truncate max-w-[64px]">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
