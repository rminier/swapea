"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);

  const resendEmail = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Verification email resent!");
    }, 1500);
  };

  return (
    <AuthLayout
      title="Check your email"
      description="We've sent a verification link to your email address"
    >
      <div className="grid gap-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Mail className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Click the button below to resend.
          </p>
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl"
            onClick={resendEmail}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Email
          </Button>
        </div>
        <Link href="/auth/login" className="text-sm font-bold text-primary hover:underline inline-flex items-center justify-center">
          Back to login
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </AuthLayout>
  );
}
