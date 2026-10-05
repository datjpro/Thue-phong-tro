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
    const identifier = String(data.get("identifier") || "").trim();
    const password = String(data.get("password") || "").trim();

    setPending(true);
    setError(null);

    // Chuẩn hóa tên đăng nhập: nếu nhập số phòng (e.g. "101", "Phòng 101") thì map sang email alias
    const isEmail = identifier.includes("@");
    const normalizedIdentifier = identifier
      .toLowerCase()
      .replace(/phòng|phong|p\.|\s/gi, "")
      .trim();
    const email = isEmail ? identifier : `phong${normalizedIdentifier}@tro.local`;

    const { error } = await authClient.signIn.email({
      email,
      password,
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
        <Label htmlFor="identifier">Tài khoản (Số phòng) hoặc Email</Label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          placeholder="Ví dụ: 101 hoặc chutro@example.com"
          autoComplete="username"
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
          placeholder="Mật khẩu hoặc số CCCD"
          autoComplete="current-password"
          required
        />
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          💡 Người thuê phòng đăng nhập bằng{" "}
          <strong className="font-medium text-foreground">Số phòng</strong> và mật khẩu là{" "}
          <strong className="font-medium text-foreground">Số CCCD</strong>.
        </p>
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
