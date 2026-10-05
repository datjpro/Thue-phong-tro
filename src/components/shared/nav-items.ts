import {
  FileText,
  Home,
  LayoutDashboard,
  MoreHorizontal,
  Receipt,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

/** Thứ tự 7 mục menu trong sidebar desktop theo đúng AGENTS.md */
export const sidebarNavItems = [
  { href: "/", key: "overview", icon: LayoutDashboard },
  { href: "/rooms", key: "rooms", icon: Home },
  { href: "/invoices", key: "invoices", icon: Receipt },
  { href: "/tenants", key: "tenants", icon: Users },
  { href: "/contracts", key: "contracts", icon: FileText },
  { href: "/maintenance", key: "maintenance", icon: Wrench },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

/** 5 tab điều hướng dưới ngón tay cái trên Mobile (< 1024px) */
export const bottomNavItems = [
  { href: "/", key: "overview", icon: LayoutDashboard },
  { href: "/rooms", key: "rooms", icon: Home },
  { href: "/invoices", key: "invoices", icon: Receipt },
  { href: "/tenants", key: "tenants", icon: Users },
  { href: "/more", key: "more", icon: MoreHorizontal },
] as const;

/** Các mục còn lại xuất hiện trong trang/menu "Thêm" */
export const moreItems = [
  { href: "/contracts", key: "contracts", icon: FileText },
  { href: "/maintenance", key: "maintenance", icon: Wrench },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

// Legacy export compatibility
export const mainNavItems = bottomNavItems.slice(0, 4);
