"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Mail, Code } from "lucide-react";
import { useState } from "react";

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const login = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        onClick={() => login("google")}
        disabled={!!isLoading}
        className="rounded-xl h-11"
      >
        <Mail className="mr-2 h-4 w-4" />
        Google
      </Button>
      <Button
        variant="outline"
        onClick={() => login("github")}
        disabled={!!isLoading}
        className="rounded-xl h-11"
      >
        <Code className="mr-2 h-4 w-4" />
        Github
      </Button>
    </div>
  );
}
