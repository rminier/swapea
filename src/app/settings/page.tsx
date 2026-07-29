"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useLanguage, Language } from "@/components/language-provider";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleLanguageChange = (val: Language | null) => {
    if (val) {
      setLanguage(val);
      router.refresh();
    }
  };

  const { data: subData, refetch } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const handleUpgrade = async (plan: string) => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Upgrade checkout failed");
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch {
      toast.error("Failed to process upgrade checkout");
    } finally {
      setIsUpgrading(false);
    }
  };

  const currentPlan = subData?.subscription?.active ? subData.subscription.plan : "FREE";

  const tiers = [
    {
      id: "FREE",
      name: t("settings.tiers.free.name"),
      price: "$0",
      description: t("settings.tiers.free.desc"),
      features: [
        t("settings.tiers.free.f1"),
        t("settings.tiers.free.f2"),
        t("settings.tiers.free.f3"),
      ],
      buttonColor: "bg-slate-700 text-white hover:bg-slate-800",
    },
    {
      id: "BASIC",
      name: t("settings.tiers.basic.name"),
      price: "$1",
      description: t("settings.tiers.basic.desc"),
      features: [
        t("settings.tiers.basic.f1"),
        t("settings.tiers.basic.f2"),
        t("settings.tiers.basic.f3"),
      ],
      buttonColor: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20",
    },
    {
      id: "PREMIUM",
      name: t("settings.tiers.premium.name"),
      price: "$5",
      description: t("settings.tiers.premium.desc"),
      features: [
        t("settings.tiers.premium.f1"),
        t("settings.tiers.premium.f2"),
        t("settings.tiers.premium.f3"),
      ],
      buttonColor: "bg-brand-button",
    },
    {
      id: "VIP",
      name: t("settings.tiers.vip.name"),
      price: "$20",
      description: t("settings.tiers.vip.desc"),
      features: [
        t("settings.tiers.vip.f1"),
        t("settings.tiers.vip.f2"),
        t("settings.tiers.vip.f3"),
        t("settings.tiers.vip.f4"),
      ],
      buttonColor: "bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-amber-500/20 font-bold border-0",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-16">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight font-heading text-brand-gradient">
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Profile Info & Language preferences */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold font-heading">{t("settings.profile_info")}</CardTitle>
              <CardDescription>{t("settings.profile_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("settings.name")}</p>
                <p className="font-bold text-lg">{session?.user?.name || "N/A"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("settings.email")}</p>
                <p className="font-bold text-lg">{session?.user?.email || "N/A"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("settings.membership")}</p>
                <div className="pt-1">
                  <Badge className="px-3 py-1 font-black bg-purple-500/10 text-purple-500 border border-purple-500/20 uppercase tracking-widest text-xs">
                    {currentPlan}
                  </Badge>
                </div>
              </div>
              {subData?.subscription?.expiresAt && currentPlan !== "FREE" && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("settings.renewal_date")}</p>
                  <p className="font-bold text-muted-foreground">{new Date(subData.subscription.expiresAt).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-border/40 py-4">
              <Button variant="outline" className="w-full rounded-xl font-bold">{t("settings.edit_profile")}</Button>
            </CardFooter>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold font-heading">{t("settings.language_title")}</CardTitle>
              <CardDescription>{t("settings.language_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("settings.language_select_label")}
                </label>
                <Select value={language} onValueChange={(val: Language | null) => handleLanguageChange(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("settings.language_select_label")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 {t("settings.english")}</SelectItem>
                    <SelectItem value="es">🇪🇸 {t("settings.spanish")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight font-heading">{t("settings.subscription_plans")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("settings.subscription_desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tiers.map((tier) => {
              const isCurrent = currentPlan === tier.id;
              return (
                <Card 
                  key={tier.id} 
                  className={`relative border-border/50 bg-card/30 backdrop-blur-sm rounded-3xl overflow-hidden shadow-md transition-all flex flex-col justify-between hover:shadow-xl hover:scale-[1.01] duration-300 ${
                    isCurrent ? "ring-2 ring-purple-500 border-transparent bg-gradient-to-b from-purple-500/5 to-transparent" : ""
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase">
                      {t("settings.active_plan")}
                    </div>
                  )}
                  
                  <CardHeader className="space-y-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-black">{tier.name}</CardTitle>
                      <CardDescription className="text-xs min-h-[32px]">{tier.description}</CardDescription>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-extrabold tracking-tight">{tier.price}</span>
                      <span className="text-muted-foreground text-xs pb-1">/month</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-grow">
                    <ul className="space-y-2.5">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-xs text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-border/40 bg-muted/10">
                    <Button 
                      className={`w-full rounded-2xl font-bold py-5 transition-all duration-300 ${tier.buttonColor}`}
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={isUpgrading || isCurrent}
                    >
                      {isCurrent 
                        ? t("settings.current_plan_button") 
                        : isUpgrading 
                        ? t("settings.processing") 
                        : t("settings.subscribe_to", { name: tier.name })}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
