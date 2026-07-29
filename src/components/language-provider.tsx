"use client";

import React, { createContext, useContext, useState } from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const translations = { en, es };

export type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof document !== "undefined") {
      const savedLang = document.cookie
        .split("; ")
        .find((row) => row.startsWith("language="))
        ?.split("=")[1] as Language;
      if (savedLang && (savedLang === "en" || savedLang === "es")) {
        return savedLang;
      }
    }
    return initialLanguage;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Set cookie that expires in 1 year
    document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    // Backup in localStorage
    localStorage.setItem("language", lang);
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    const dict = translations[language];
    const parts = path.split(".");
    let current: unknown = dict;
    for (const part of parts) {
      if (current == null || typeof current !== "object") return path;
      current = (current as Record<string, unknown>)[part];
    }
    
    let val = typeof current === "string" ? current : path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        val = val.replace(`{${key}}`, String(value));
      });
    }
    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
