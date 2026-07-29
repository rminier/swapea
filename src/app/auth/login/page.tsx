import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your email to sign in to your account"
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
              Or continue with
            </span>
          </div>
        </div>
        <OAuthButtons />
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-bold text-primary hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
