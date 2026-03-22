import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "노틸",
  description: "필기가 곧 웹사이트가 되는 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
