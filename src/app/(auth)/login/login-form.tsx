"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(data.get("email")),
      password: String(data.get("password")),
    });
    setPending(false);
    if (error) {
      setError(t("invalid"));
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left">
      <div suppressHydrationWarning>
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@example.com"
          autoComplete="email"
          required
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>
      <div suppressHydrationWarning>
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>
      {error ? (
        <p id="login-error" role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        className="min-h-12 text-base mt-2"
        disabled={pending}
      >
        {pending ? "Đang đăng nhập..." : t("signIn")}
      </Button>
    </form>
  );
}
