import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details below to create your account"
    >
      <div className="grid gap-6">
        <SignupForm />
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
