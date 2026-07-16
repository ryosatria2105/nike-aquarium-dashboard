import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { TabBar } from "@/components/ui/TabBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Laporan Toko",
  description:
    "Kelola laporan penjualan, pantau aktivitas shift, dan analisis performa toko dalam satu aplikasi.",

  openGraph: {
    title: "Dashboard Laporan Toko",
    description:
      "Kelola laporan penjualan, pantau aktivitas shift, dan analisis performa toko dalam satu aplikasi.",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Dashboard Laporan Toko",
    description:
      "Kelola laporan penjualan, pantau aktivitas shift, dan analisis performa toko dalam satu aplikasi.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F2F7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ToastProvider>
          <div className="flex flex-1 flex-col pb-tabbar-safe">{children}</div>
          <TabBar />
        </ToastProvider>
      </body>
    </html>
  );
}