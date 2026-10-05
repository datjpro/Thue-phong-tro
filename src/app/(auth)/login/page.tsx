import { Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const t = await getTranslations("auth");
  return (
    <main
      className="flex min-h-dvh items-center justify-center p-4 bg-background"
      suppressHydrationWarning
    >
      <div
        className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 sm:p-8 shadow-xl text-center"
        suppressHydrationWarning
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
          <Building2 size={24} aria-hidden="true" />
        </div>
        <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{t("subtitle")}</p>
        <LoginForm />
      </div>
    </main>
  );
}
