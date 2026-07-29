"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, LogIn, UserPlus, Sparkles } from "lucide-react";

interface AuthPromptBannerProps {
  title: string;
  description: string;
  callbackUrl?: string;
}

export function AuthPromptBanner({ title, description, callbackUrl = "/offers" }: AuthPromptBannerProps) {
  const loginUrl = `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const signupUrl = `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <Card className="border-border/50 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl mb-10">
      <CardContent className="p-8 text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-black tracking-tight font-heading flex items-center justify-center gap-2">
            {title}
            <Sparkles className="h-5 w-5 text-amber-500" />
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-md mx-auto">
          <Link href={loginUrl} className="w-full sm:w-auto">
            <Button className="w-full rounded-full font-bold px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </Link>

          <Link href={signupUrl} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full rounded-full font-bold px-8 py-6 border-border/80 hover:bg-muted/50 flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create Account
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
