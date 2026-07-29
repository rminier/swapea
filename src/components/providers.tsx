"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider, Language } from "@/components/language-provider";

export function Providers({ 
  children,
  initialLanguage = "en",
}: { 
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider initialLanguage={initialLanguage}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme={false}
          >
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
