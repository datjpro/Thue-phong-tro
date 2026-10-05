"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, type ButtonProps } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({
  variant = "ghost",
  size = "sm",
  showLabel = true,
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  showLabel?: boolean;
  className?: string;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
      title={t("signOut")}
      aria-label={t("signOut")}
    >
      <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
      {showLabel ? <span className="text-xs">{t("signOut")}</span> : null}
    </Button>
  );
}
