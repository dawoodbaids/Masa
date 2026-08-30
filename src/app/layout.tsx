import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ماسة — حكاية تُروى طبقةً بعد طبقة",
  description: "تجربة تفاعلية في قلب حبة البقلاوة",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
