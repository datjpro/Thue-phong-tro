import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const store = await cookies();
  const value = store.get("locale")?.value;
  const locale: Locale = value === "en" ? "en" : "vi";
  return {
    locale,
    timeZone: "Asia/Ho_Chi_Minh",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
