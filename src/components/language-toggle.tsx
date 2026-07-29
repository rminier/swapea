"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLanguage, Language } from "@/components/language-provider";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
        <div className="relative flex items-center justify-center">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language / Cambiar idioma</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
          <span className={language === "en" ? "font-extrabold text-primary" : ""}>
            🇺🇸 {t("settings.english")}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("es")}>
          <span className={language === "es" ? "font-extrabold text-primary" : ""}>
            🇪🇸 {t("settings.spanish")}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
