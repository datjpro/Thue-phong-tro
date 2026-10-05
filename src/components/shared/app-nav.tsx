"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Activity,
  Building2,
  Clock,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
  Wifi,
} from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch (_) {}
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("sidebar_collapsed", String(next));
    } catch (_) {}
  }

  return (
    <aside
      className={cn(
        "no-print hidden shrink-0 border-r border-suong bg-mat transition-all duration-200 lg:block select-none",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      <div className="sticky top-0 flex h-[calc(100dvh-28px)] flex-col justify-between p-3 pb-4">
        <div className="flex flex-col gap-1">
          {/* Brand header */}
          <div
            className={cn(
              "mb-5 flex items-center justify-between pb-1",
              collapsed ? "flex-col gap-3" : "px-2",
            )}
          >
            <Link
              href="/"
              className="flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-90"
              title={collapsed ? t("brand") : undefined}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-la/10 text-la">
                <Building2 size={20} strokeWidth={1.75} aria-hidden="true" />
              </div>
              {!collapsed ? (
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-base font-bold tracking-tight text-muc">
                    {t("brand")}
                  </span>
                  <span className="truncate text-[11px] text-muc-phu">Quản lý phòng trọ</span>
                </div>
              ) : null}
            </Link>

            {/* Collapse / Expand toggle button */}
            <button
              type="button"
              onClick={toggleCollapse}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muc-phu hover:bg-giay hover:text-muc transition-colors"
              title={collapsed ? "Mở rộng thanh menu" : "Thu gọn thành Left Rail"}
              aria-label={collapsed ? "Mở rộng thanh menu" : "Thu gọn thành Left Rail"}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} strokeWidth={1.75} />
              ) : (
                <PanelLeftClose size={18} strokeWidth={1.75} />
              )}
            </button>
          </div>

          {/* Nav links in exact order */}
          <nav className="flex flex-col gap-0.5" aria-label="Menu chính">
            {sidebarNavItems.map(({ href, key, icon: Icon }) => {
              const active = isActive(pathname, href);
              const label = t(key);
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center rounded-[8px] text-sm transition-colors select-none",
                    collapsed ? "justify-center px-0 w-full" : "gap-3 px-3",
                    active
                      ? "bg-la/10 text-la font-semibold"
                      : "text-muc-phu hover:bg-giay hover:text-muc font-normal",
                  )}
                >
                  <Icon
                    size={19}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className={cn("shrink-0", active ? "text-la" : "text-muc-phu")}
                  />
                  {!collapsed ? <span className="truncate">{label}</span> : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User Controls */}
        <div className="flex flex-col gap-1.5 border-t border-suong pt-3">
          <div
            className={cn("flex", collapsed ? "flex-col gap-1.5 items-center" : "flex-col gap-1")}
          >
            <ThemeToggle
              showLabel={!collapsed}
              size={collapsed ? "icon" : "sm"}
              className={cn(collapsed ? "size-9" : "w-full justify-start px-2.5")}
            />
            <SignOutButton
              showLabel={!collapsed}
              size={collapsed ? "icon" : "sm"}
              className={cn(
                "text-muc-phu hover:bg-danger/10 hover:text-danger",
                collapsed ? "size-9" : "w-full justify-start px-2.5",
              )}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopBar() {
  const t = useTranslations("nav");

  return (
    <header className="no-print sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-suong bg-mat px-4 lg:hidden">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-la/10 text-la">
          <Building2 size={18} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <span className="text-base font-bold tracking-tight text-muc">{t("brand")}</span>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle showLabel={false} size="icon" />
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
      className="no-print fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-suong bg-mat pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {bottomNavItems.map(({ href, key, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-full flex-col items-center justify-center gap-1 text-center transition-colors select-none",
              active
                ? "text-la font-medium before:absolute before:top-0 before:inset-x-5 before:h-[3px] before:bg-la before:rounded-full"
                : "text-muc-phu hover:text-muc",
            )}
          >
            <Icon size={24} aria-hidden="true" strokeWidth={1.75} />
            <span className="text-[12px] leading-tight">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopBottomBar() {
  return (
    <footer className="no-print fixed inset-x-0 bottom-0 z-30 hidden h-7 w-full shrink-0 items-center justify-between border-t border-suong bg-mat px-4 text-[11px] text-muc-phu select-none lg:flex">
      {/* Trái: Trạng thái máy chủ, Database, Lưu lượng */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-medium text-muc">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <span className="font-semibold text-muc">Hệ thống trực tuyến</span>
        </div>

        <span className="h-3 w-px bg-suong" aria-hidden="true" />

        <div className="flex items-center gap-1.5 transition-colors hover:text-muc">
          <Database size={13} strokeWidth={1.75} className="text-muc-phu" aria-hidden="true" />
          <span>PostgreSQL 17</span>
        </div>

        <span className="h-3 w-px bg-suong" aria-hidden="true" />

        <div className="flex items-center gap-1.5 transition-colors hover:text-muc">
          <Activity size={13} strokeWidth={1.75} className="text-la" aria-hidden="true" />
          <span>
            Lưu lượng: <strong className="font-medium text-muc tabular-nums">12 lượt</strong> / hôm
            nay
          </span>
        </div>

        <span className="h-3 w-px bg-suong" aria-hidden="true" />

        <div className="flex items-center gap-1.5 transition-colors hover:text-muc">
          <Wifi size={13} strokeWidth={1.75} className="text-success" aria-hidden="true" />
          <span className="tabular-nums">Độ trễ 24ms</span>
        </div>
      </div>

      {/* Phải: Múi giờ, Encoding, Phiên bản */}
      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Clock size={12} strokeWidth={1.75} aria-hidden="true" />
          <span>Asia/Ho_Chi_Minh</span>
        </div>

        <span className="h-3 w-px bg-suong" aria-hidden="true" />

        <span>UTF-8</span>

        <span className="h-3 w-px bg-suong" aria-hidden="true" />

        <span className="font-mono text-[10px] text-muc-phu">v0.1.0</span>
      </div>
    </footer>
  );
}
