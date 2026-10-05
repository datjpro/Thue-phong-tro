"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

export function ThemeToggle({
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
  const t = useTranslations("settings");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme !== "light");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const label = dark ? t("lightMode") : t("darkMode");

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggle}
      aria-pressed={dark}
      className={className}
      title={label}
      aria-label={label}
    >
      {dark ? (
        <Sun size={16} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon size={16} strokeWidth={1.75} aria-hidden="true" />
      )}
      {showLabel ? <span className="text-xs">{label}</span> : null}
    </Button>
  );
}
