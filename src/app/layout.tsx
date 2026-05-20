import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/app/header";
import ToastProvider from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "我的商店 · 精选好物",
  description: "精选全球好物，品质保证，闪电送达。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 selection:bg-indigo-200">
        <ToastProvider>
          <Header />
          <div className="flex-1 animate-fadeIn">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
