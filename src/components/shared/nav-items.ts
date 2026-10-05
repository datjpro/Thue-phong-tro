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

/** 4 tab điều hướng dưới ngón tay cái trên Mobile (< 1024px) theo UX-UI 5.1 */
export const bottomNavItems = [
  { href: "/", key: "overview", icon: LayoutDashboard },
  { href: "/rooms", key: "rooms", icon: Home },
  { href: "/invoices", key: "invoices", icon: Receipt },
  { href: "/more", key: "more", icon: MoreHorizontal },
] as const;

/** 4 mục menu dành riêng cho Người thuê */
export const tenantSidebarNavItems = [
  { href: "/", key: "myRoom", icon: Home },
  { href: "/invoices", key: "invoices", icon: Receipt },
  { href: "/maintenance", key: "maintenance", icon: Wrench },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export const tenantBottomNavItems = [
  { href: "/", key: "myRoom", icon: Home },
  { href: "/invoices", key: "invoices", icon: Receipt },
  { href: "/maintenance", key: "maintenance", icon: Wrench },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

/** Các mục trong trang Xem thêm trên mobile */
export const moreItems = [
  { href: "/tenants", key: "tenants", icon: Users },
  { href: "/contracts", key: "contracts", icon: FileText },
  { href: "/maintenance", key: "maintenance", icon: Wrench },
  { href: "/settings", key: "settings", icon: Settings },
] as const;
