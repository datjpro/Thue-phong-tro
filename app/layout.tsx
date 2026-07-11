import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "../components/ui/Toast";

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-sora",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TroViet - Tìm phòng trọ ưng ý chỉ trong vài phút",
  description: "Hàng ngàn phòng trọ, chung cư mini, nhà nguyên căn được xác minh thực tế — cập nhật giá mỗi ngày.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                console.error = (...args) => {
                  if (args[0] && typeof args[0] === 'string' && (
                    args[0].includes('hydration') ||
                    args[0].includes('Hydration') ||
                    args[0].includes('bis_skin_checked')
                  )) {
                    return;
                  }
                  originalError(...args);
                };
              }
            `
          }}
        />
      </head>
      <body 
        className="min-h-full flex flex-col bg-white text-[--color-ink]"
        suppressHydrationWarning
      >
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
