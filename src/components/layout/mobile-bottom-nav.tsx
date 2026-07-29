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

  const getLabel = (key: string, fallback: string) => {
    const translation = t(key);
    if (!translation || translation === key) return fallback;
    return translation.split(" ")[0];
  };

  const navItems = [
    {
      label: getLabel("navbar.home", "Explore"),
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      label: getLabel("listings.title", "Listings"),
      href: "/listings",
      icon: Package,
      exact: true,
    },
    {
      label: getLabel("navbar.new_listing", "Post"),
      href: "/listings/new",
      icon: Plus,
      isAction: true,
    },
    {
      label: getLabel("navbar.offers", "Offers"),
      href: "/offers",
      icon: ArrowRightLeft,
      exact: false,
    },
    {
      label: getLabel("navbar.settings", "Settings"),
      href: "/settings",
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-2xl border-t border-border/60 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] px-3 pt-1.5 pb-[max(12px,env(safe-area-inset-bottom))]">
      <nav className="flex items-center justify-between max-w-md mx-auto h-12">
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
                className="relative -top-4 flex items-center justify-center shrink-0"
              >
                <div className="w-13 h-13 rounded-full bg-brand-button flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-4 ring-background transition-transform active:scale-95 hover:scale-105">
                  <Plus className="w-6 h-6 text-white stroke-[2.5]" />
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
                "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[56px] text-center",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative flex flex-col items-center">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110 text-cyan-500 dark:text-cyan-400"
                  )}
                />
                {isActive && (
                  <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-sm shadow-cyan-400" />
                )}
              </div>
              <span className="text-[10px] leading-none font-medium tracking-tight mt-1.5 whitespace-nowrap block">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
