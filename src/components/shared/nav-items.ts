import { FileText, Home, LayoutDashboard, Receipt, Settings, Users, Wrench } from "lucide-react";

export const mainNavItems = [
  { href: "/", key: "overview", icon: LayoutDashboard },
  { href: "/rooms", key: "rooms", icon: Home },
  { href: "/invoices", key: "invoices", icon: Receipt },
] as const;

export const moreItems = [
  { href: "/tenants", key: "tenants", icon: Users },
  { href: "/contracts", key: "contracts", icon: FileText },
  { href: "/maintenance", key: "maintenance", icon: Wrench },
  { href: "/settings", key: "settings", icon: Settings },
] as const;
