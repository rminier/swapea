"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  MoreVertical, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Sparkles,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ManagedListing {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  visibility: boolean;
  isPromoted?: boolean;
  images: string[];
}

interface ListingManagementCardProps {
  listing: ManagedListing;
  onRefresh: () => void;
}

export function ListingManagementCard({ listing, onRefresh }: ListingManagementCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const images = listing.images;
  const mainImage = images[0] || "/placeholder.png";

  const { data: subData } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const plan = subData?.subscription?.active ? subData.subscription.plan : "FREE";
  const isVip = plan === "VIP";

  const toggleVisibility = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: !listing.visibility }),
      });
      if (res.ok) {
        toast.success(listing.visibility ? "Listing hidden" : "Listing is now public");
        onRefresh();
      }
    } catch {
      toast.error("Failed to update listing");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteListing = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Listing deleted");
        onRefresh();
      }
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setIsUpdating(false);
    }
  };

  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const purchaseHighlight = async () => {
    setIsPurchasing(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}/highlight`, { method: "POST" });
      if (!res.ok) throw new Error("Purchase failed");
      toast.success("Listing Highlighted! Your item is now featured for 7 days.");
      setIsPromoOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to purchase highlight");
    } finally {
      setIsPurchasing(false);
    }
  };

  const purchaseProfileBoost = async () => {
    setIsPurchasing(true);
    try {
      const res = await fetch(`/api/users/boost`, { method: "POST" });
      if (!res.ok) throw new Error("Purchase failed");
      toast.success("Profile Boosted! Your profile is highlighted for 7 days.");
      setIsPromoOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to purchase profile boost");
    } finally {
      setIsPurchasing(false);
    }
  };

  const purchaseAutoBump = async () => {
    setIsPurchasing(true);
    setTimeout(() => {
      toast.success("Auto-Relist Activated! Your item will be bumped every 48 hours for 7 days.");
      setIsPromoOpen(false);
      setIsPurchasing(false);
      onRefresh();
    }, 1500);
  };

  const handleBoost = async () => {
    if (!isVip) {
      setIsPromoOpen(true);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}/promote`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to boost listing");
      }

      toast.success("Listing boosted successfully! It will now appear at the top of results.");
      onRefresh();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to boost listing");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card className="group border-border/50 bg-card/30 hover:bg-card/50 transition-all rounded-3xl overflow-hidden shadow-sm hover:shadow-xl py-0">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row h-full">
            {/* Image Section */}
            <div className="relative w-full sm:w-48 h-48 sm:h-auto">
              <Image
                src={mainImage}
                alt={listing.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {!listing.visibility && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Badge variant="outline" className="text-white border-white gap-1.5 font-bold">
                    <EyeOff className="h-3 w-3" />
                    HIDDEN
                  </Badge>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-heading line-clamp-1">{listing.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      <span className="text-primary">{listing.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                      </span>
                      {listing.isPromoted && (
                        <>
                          <span>•</span>
                          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            BOOSTED
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full h-8 w-8" />}>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl">
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit Listing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={toggleVisibility} className="cursor-pointer gap-2">
                        {listing.visibility ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Hide from Public
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={deleteListing} className="cursor-pointer gap-2 text-red-500 focus:text-red-500">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Quick Stats & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-bold text-foreground">24</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Views</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-bold text-foreground">3</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Offers</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    render={<Link href={`/listings/${listing.id}`} />}
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-9 px-4 font-bold"
                  >
                    View Public
                  </Button>
                  <Button 
                    onClick={handleBoost} 
                    disabled={isUpdating || listing.isPromoted}
                    className={`rounded-xl h-9 px-4 font-bold flex items-center gap-1.5 transition-all duration-300 border-0 ${
                      listing.isPromoted 
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-default" 
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105"
                    }`}
                  >
                    {listing.isPromoted ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Boosted
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        Boost
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPromoOpen} onOpenChange={setIsPromoOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border-border/50 bg-card/90 backdrop-blur-md shadow-2xl">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-2xl font-black font-heading bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Swapea Boost Manager
            </DialogTitle>
            <DialogDescription className="text-xs">
              Increase your trading success with premium temporary boosts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Highlight Listing */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 mt-0.5">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">Highlight Listing</h4>
                  <span className="text-xs font-black text-amber-500">$2.00 / week</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Pin this specific item at the top of results. Increases offers by up to 3x!
                </p>
                <Button 
                  onClick={purchaseHighlight} 
                  disabled={isPurchasing}
                  size="sm"
                  className="rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 border-0 text-[10px] h-7 px-3.5"
                >
                  {isPurchasing ? "Processing..." : "Purchase Highlight"}
                </Button>
              </div>
            </div>

            {/* Profile Boost */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 mt-0.5">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">Profile Boost</h4>
                  <span className="text-xs font-black text-blue-500">$5.00 / week</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Glowing avatar highlights across Swapea. Draws massive traffic to your catalog!
                </p>
                <Button 
                  onClick={purchaseProfileBoost} 
                  disabled={isPurchasing}
                  size="sm"
                  className="rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 border-0 text-[10px] h-7 px-3.5"
                >
                  {isPurchasing ? "Processing..." : "Purchase Boost"}
                </Button>
              </div>
            </div>

            {/* Auto Relist Bumper */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 mt-0.5">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">Auto-Relist & Bump</h4>
                  <span className="text-xs font-black text-emerald-500">$1.50 / week</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Programmatically bump your listing back to the front page feed every 48 hours automatically.
                </p>
                <Button 
                  onClick={purchaseAutoBump} 
                  disabled={isPurchasing}
                  size="sm"
                  className="rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 border-0 text-[10px] h-7 px-3.5"
                >
                  {isPurchasing ? "Processing..." : "Activate Bump"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/40 pt-3 flex sm:justify-between items-center gap-4">
            <p className="text-[9px] text-muted-foreground">
              VIP members get listing highlights for free.
            </p>
            <Button 
              variant="ghost" 
              onClick={() => setIsPromoOpen(false)}
              className="rounded-xl font-bold h-8 text-[11px]"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
