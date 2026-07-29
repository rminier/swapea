"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ArrowRightLeft, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CounterOfferModal } from "@/components/counter-offer-modal";

import { useSession } from "next-auth/react";
import { AuthPromptBanner } from "@/components/auth-prompt-banner";
import { SubscriptionTiers } from "@/components/subscription-tiers";

export default function OffersPage() {
  const { data: session, status: authStatus } = useSession();
  const [activeTab, setActiveTab] = useState("received");

  const { data: offers, isLoading, refetch } = useQuery({
    queryKey: ["offers", activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/offers?type=${activeTab}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: authStatus === "authenticated",
  });

  if (authStatus === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
        <AuthPromptBanner 
          title="Access Offers & Trades" 
          description="Log in or create a Swapea account to view active offers, send trade proposals, and upgrade your plan." 
          callbackUrl="/offers" 
        />
        <SubscriptionTiers 
          onUpgrade={() => {
            window.location.href = "/auth/login?callbackUrl=/offers";
          }}
        />
      </div>
    );
  }

  const handleStatusChange = async (offerId: string, status: string) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update offer");
      toast.success(`Offer ${status.toLowerCase()}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update offer");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Offers & Trades</h1>

      <Tabs defaultValue="received" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 rounded-full border-b-2 border-primary"></div></div>
          ) : offers?.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-border/50 border-dashed">
              <p className="text-muted-foreground text-lg mb-4">No {activeTab} offers found.</p>
              <Link href="/">
                <Button variant="outline">
                  {activeTab === "sent" ? "Explore Listings" : "Create a Listing"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {offers?.map((offer: {
                id: string;
                priority?: boolean;
                protected?: boolean;
                status: string;
                createdAt: string;
                proposingUserId: string;
                proposingUser?: { name?: string | null };
                targetListingId: string;
                targetListing: { title: string; condition: string; images: string[] };
                offeredListings: Array<{ id: string; title: string; condition: string; images: string[] }>;
                trade?: { id: string } | null;
              }) => (
                <Card key={offer.id} className={`overflow-hidden transition-all duration-300 ${
                  offer.priority 
                    ? "border-amber-500/50 bg-gradient-to-br from-amber-500/5 via-card to-card shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20" 
                    : "border-border/50 bg-card/50 backdrop-blur-sm"
                }`}>
                  <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center">
                    
                    {/* The other person's item(s) */}
                    <div className="flex-1 w-full border rounded-xl p-4 bg-background">
                      <div className="text-sm text-muted-foreground mb-2">
                        {activeTab === "received" ? "They offered:" : "You offered:"}
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {offer.offeredListings.map((listing) => (
                          <div key={listing.id} className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={listing.images[0]} alt={listing.title} className="w-16 h-16 rounded-md object-cover" />
                            <div>
                              <p className="font-semibold text-sm line-clamp-1">{listing.title}</p>
                              <p className="text-xs text-muted-foreground">{listing.condition}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center justify-center bg-muted rounded-full p-3 border">
                      <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Your item */}
                    <div className="flex-1 w-full border rounded-xl p-4 bg-background">
                      <div className="text-sm text-muted-foreground mb-2">
                        {activeTab === "received" ? "For your:" : "For their:"}
                      </div>
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={offer.targetListing.images[0]} alt={offer.targetListing.title} className="w-16 h-16 rounded-md object-cover" />
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{offer.targetListing.title}</p>
                          <p className="text-xs text-muted-foreground">{offer.targetListing.condition}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border/30">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                       <Badge className={cn(
                        "border text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full",
                        offer.status === "ACCEPTED" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
                        offer.status === "DECLINED" && "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
                        offer.status === "CANCELLED" && "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/20",
                        offer.status === "PENDING" && "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
                        offer.status === "COUNTERED" && "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                      )} variant="outline">
                        {offer.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                      </span>
                      {offer.priority && (
                        <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current animate-pulse" />
                          PRIORITY
                        </Badge>
                      )}
                      {offer.protected && (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          SECURE SWAP
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {offer.status === "PENDING" && activeTab === "received" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(offer.id, "DECLINED")}>
                            Decline
                          </Button>
                          <CounterOfferModal
                            offerId={offer.id}
                            proposingUserId={offer.proposingUserId}
                            proposingUserName={offer.proposingUser?.name || "User"}
                            currentlyOfferedListingIds={offer.offeredListings.map((l) => l.id)}
                            targetListingTitle={offer.targetListing.title}
                            onSuccess={refetch}
                          />
                          <Button size="sm" onClick={() => handleStatusChange(offer.id, "ACCEPTED")} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0">
                            Accept Offer
                          </Button>
                        </>
                      )}

                      {offer.status === "COUNTERED" && activeTab === "received" && (
                        <span className="text-xs text-amber-500 font-medium px-3 py-1 bg-amber-500/5 rounded-full border border-amber-500/10">
                          Awaiting proposer response
                        </span>
                      )}
                      
                      {offer.status === "PENDING" && activeTab === "sent" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(offer.id, "CANCELLED")}>
                          Cancel Offer
                        </Button>
                      )}

                      {offer.status === "COUNTERED" && activeTab === "sent" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(offer.id, "DECLINED")}>
                            Decline Counter
                          </Button>
                          <Button size="sm" onClick={() => handleStatusChange(offer.id, "ACCEPTED")} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0">
                            Accept Counter
                          </Button>
                        </>
                      )}

                      {offer.status === "ACCEPTED" && (
                        <Link href={offer.trade ? `/trades/${offer.trade.id}` : `/listings/${offer.targetListingId}`}>
                          <Button size="sm" className="bg-brand-button">
                            View Trade
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
