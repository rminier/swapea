import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { cookies } from "next/headers";
import { Language } from "@/components/language-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swapea - The Trade-Only Marketplace",
  description: "Trade your items with ease. No cash, just value.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Swapea",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value || "en") as Language;

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background font-sans">
        <Providers initialLanguage={lang}>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <MobileBottomNav />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
