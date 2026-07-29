"use client";

import Link from "next/link";
import { MapPin, Clock, Star, Sparkles, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string;
    condition: string;
    location: string;
    createdAt: string;
    isPromoted?: boolean;
    offersCount?: number;
    user: {
      name: string;
      reputation: number;
      username?: string | null;
    };
  };
  hideUser?: boolean;
}

const conditionColors: Record<string, string> = {
  NEW: "bg-green-500/10 text-green-500",
  LIKE_NEW: "bg-emerald-500/10 text-emerald-500",
  GOOD: "bg-blue-500/10 text-blue-500",
  FAIR: "bg-yellow-500/10 text-yellow-500",
  POOR: "bg-red-500/10 text-red-500",
};

function formatTimeShort(date: Date | string): string {
  const d = new Date(date);
  const diffInSeconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (isNaN(diffInSeconds) || diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return `${Math.floor(diffInDays / 30)}mo ago`;
}

export function ListingCardEnhanced({ listing, hideUser = false }: ListingCardProps) {
  return (
    <Link href={`/listings/${listing.id}`} className="group h-full block">
      <Card className={cn(
        "h-full overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 group-hover:border-primary/20 flex flex-col justify-between pt-0",
        listing.isPromoted && "border-amber-500/30 bg-amber-500/5 shadow-md shadow-amber-500/5"
      )}>
        <div>
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.images[0] || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"}
              alt={listing.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Overlay Badges */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-white border-0 px-2 py-0.5 rounded-md">
                {listing.category}
              </Badge>
              <Badge variant="outline" className={cn("text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-0 shadow-sm", conditionColors[listing.condition])}>
                {listing.condition.replace("_", " ")}
              </Badge>
            </div>

            {listing.isPromoted && (
              <div className="absolute bottom-2 left-2 pointer-events-none">
                <Badge className="bg-amber-500 text-white border-0 text-[9px] uppercase tracking-wider font-bold gap-1 shadow-lg shadow-amber-500/20 px-2 py-0.5">
                  <Sparkles className="h-2.5 w-2.5" />
                  Promoted
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-3 sm:p-4 space-y-2">
            <h3 className="font-bold text-sm sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {listing.title}
            </h3>

            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed pt-0.5">
              {listing.description}
            </p>
          </CardContent>
        </div>

        {hideUser ? (
          <CardFooter className="px-3 py-2.5 sm:px-4 sm:py-3 border-t border-border/30 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{formatTimeShort(listing.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{listing.offersCount || 0}</span>
            </div>
          </CardFooter>
        ) : (
          <CardFooter className="px-3 py-2.5 sm:px-4 sm:py-3 border-t border-border/30 bg-muted/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                {listing.user?.name?.[0]?.toUpperCase() || listing.user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="truncate max-w-[70px] sm:max-w-[100px] font-semibold text-muted-foreground">
                {listing.user?.name || listing.user?.username || "User"}
              </span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {listing.user && (
                <div className="flex items-center text-amber-500 font-extrabold gap-0.5">
                  <span>{(listing.user.reputation ?? 0).toFixed(1)}</span>
                  <Star className="h-3 w-3 fill-current inline" />
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
