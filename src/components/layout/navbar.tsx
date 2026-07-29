"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

export function Navbar() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-heading font-black text-2xl tracking-tight inline-block text-brand-gradient">
              Swapea
            </span>
          </Link>
          
          <div className="hidden md:flex relative max-w-md w-full ml-8">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("navbar.search_placeholder")}
              className="w-full bg-background rounded-full pl-9 md:w-[300px] lg:w-[400px]"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <nav className="flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            {status === "authenticated" ? (
              <>
                <Link href="/listings/new">
                  <Button variant="default" className="rounded-full bg-brand-button hidden sm:flex">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("navbar.new_listing")}
                  </Button>
                </Link>
                <UserNav user={session.user} />
              </>
            ) : status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" className="rounded-full">{t("navbar.login")}</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="rounded-full bg-brand-button">{t("navbar.signup")}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
