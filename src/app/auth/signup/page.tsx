"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export default function SignupPage() {
  const { t } = useLanguage();

  return (
    <AuthLayout
      title={t("auth.signup_title")}
      description={t("auth.signup_subtitle")}
    >
      <div className="grid gap-6">
        <SignupForm />
        <div className="text-center text-sm">
          {t("auth.already_have_account")}{" "}
          <Link
            href="/auth/login"
            className="font-bold text-primary hover:underline"
          >
            {t("auth.login_button")}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
