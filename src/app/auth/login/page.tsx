"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import Link from "next/link";
import { Suspense } from "react";
import { useLanguage } from "@/components/language-provider";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <AuthLayout
      title={t("auth.login_title")}
      description={t("auth.login_subtitle")}
    >
      <div className="grid gap-6">
        <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded-xl" />}>
          <LoginForm />
        </Suspense>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("auth.or_continue_with") || "Or continue with"}
            </span>
          </div>
        </div>
        <OAuthButtons />
        <div className="text-center text-sm">
          {t("auth.dont_have_account")}{" "}
          <Link
            href="/auth/signup"
            className="font-bold text-primary hover:underline"
          >
            {t("auth.signup_button")}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
