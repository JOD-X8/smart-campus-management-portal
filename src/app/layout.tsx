import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/store/provider";

export const metadata: Metadata = {
  title: "Smart Campus Management Portal",
  description: "Next-generation Academic ERP and Campus Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
