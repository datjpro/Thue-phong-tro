import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const t = await getTranslations("auth");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4" suppressHydrationWarning>
      <div
        className="w-full max-w-sm rounded-panel border border-suong bg-mat p-6 text-center"
        suppressHydrationWarning
      >
        <h1 className="mb-1 text-2xl font-bold text-la">{t("title")}</h1>
        <p className="mb-6 text-sm text-muc-phu">{t("subtitle")}</p>
        <LoginForm />
      </div>
    </main>
  );
}
