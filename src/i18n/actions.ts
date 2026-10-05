"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLocale(locale: "vi" | "en"): Promise<void> {
  (await cookies()).set("locale", locale === "en" ? "en" : "vi", { path: "/", maxAge: 31_536_000 });
  revalidatePath("/", "layout");
}
