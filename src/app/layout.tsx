import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Toaster } from "sonner";
import "./globals.css";

const font = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thuê phòng trọ",
  description: "Quản lý phòng trọ",
};

// Script chạy trước khi paint: nạp theme và ngăn chặn extension trình duyệt (Bitwarden, Brave...)
// tiêm thuộc tính (bis_skin_checked, bis_register, __processed_...) gây lỗi hydration mismatch của React.
const headScript = `
try {
  var t = localStorage.getItem("theme");
  if (t === "dark") document.documentElement.dataset.theme = "dark";
  var tp = localStorage.getItem("theme_preset");
  if (tp) document.documentElement.dataset.themePreset = tp;
  var fs = localStorage.getItem("font_size");
  if (fs) document.documentElement.dataset.fontSize = fs;
} catch(e) {}
try {
  var origSet = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (typeof name === "string" && (name.indexOf("bis_") === 0 || name.indexOf("__processed_") === 0)) return;
    return origSet.apply(this, arguments);
  };
  var obs = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var attr = mutations[i].attributeName;
      if (attr && (attr.indexOf("bis_") === 0 || attr.indexOf("__processed_") === 0)) {
        mutations[i].target.removeAttribute(attr);
      }
    }
  });
  obs.observe(document.documentElement, { attributes: true, subtree: true });
} catch(e) {}
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline head script is static and verified */}
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body className={font.className} suppressHydrationWarning>
        <NextIntlClientProvider>
          {children}
          <Toaster position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
