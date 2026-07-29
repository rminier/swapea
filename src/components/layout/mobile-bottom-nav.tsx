"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Plus, ArrowRightLeft, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/capacitor";

import { useLanguage } from "@/components/language-provider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      label: t("navbar.home") !== "navbar.home" ? t("navbar.home") : "Explore",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      label: t("listings.title") !== "listings.title" ? t("listings.title").split(" ")[0] : "Listings",
      href: "/listings",
      icon: Package,
      exact: true,
    },
    {
      label: t("navbar.new_listing") !== "navbar.new_listing" ? t("navbar.new_listing").split(" ")[0] : "Post",
      href: "/listings/new",
      icon: Plus,
      isAction: true,
    },
    {
      label: t("navbar.offers") !== "navbar.offers" ? t("navbar.offers").split(" ")[0] : "Offers",
      href: "/offers",
      icon: ArrowRightLeft,
      exact: false,
    },
    {
      label: t("navbar.settings") !== "navbar.settings" ? t("navbar.settings") : "Settings",
      href: "/settings",
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/85 backdrop-blur-xl border-t border-border/40 shadow-2xl px-4 py-2 pb-safe">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== "/";

          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => triggerHaptic()}
                className="relative -top-5 flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-brand-button flex items-center justify-center shadow-xl shadow-cyan-500/25 ring-4 ring-background transition-transform active:scale-95 hover:scale-105">
                  <Plus className="w-7 h-7 text-white stroke-[2.5]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => triggerHaptic()}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 min-w-[56px]",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110 text-cyan-500 dark:text-cyan-400"
                  )}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-sm shadow-cyan-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
