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

export function ListingCardEnhanced({ listing, hideUser = false }: ListingCardProps) {
  return (
    <Link href={`/listings/${listing.id}`} className="group h-full block">
      <Card className={cn(
        "h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 group-hover:border-primary/20 pt-0",
        listing.isPromoted && "border-amber-500/30 bg-amber-500/5 shadow-md shadow-amber-500/5"
      )}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.images[0] || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"}
            alt={listing.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border-0 text-[10px] uppercase tracking-wider font-bold">
              {listing.category}
            </Badge>
            {listing.isPromoted && (
              <Badge className="bg-amber-500 text-white border-0 text-[10px] uppercase tracking-wider font-bold gap-1 shadow-lg shadow-amber-500/20">
                <Sparkles className="h-3 w-3" />
                Promoted
              </Badge>
            )}
          </div>
          
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              {listing.location}
            </div>
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {listing.title}
            </h3>
            <Badge variant="outline" className={cn("text-[10px] whitespace-nowrap", conditionColors[listing.condition])}>
              {listing.condition.replace("_", " ")}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </CardContent>

        {hideUser ? (
          <CardFooter className="px-4 py-3 border-t border-border/50 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span className="font-semibold">{listing.offersCount || 0}</span>
            </div>
          </CardFooter>
        ) : (
          <CardFooter className="px-4 py-3 border-t border-border/50 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                {listing.user?.name?.[0]?.toUpperCase() || listing.user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-xs font-medium">{listing.user?.name || listing.user?.username || "User"}</span>
              {listing.user && (
                <div className="flex items-center text-[10px] text-amber-500 font-bold ml-1">
                  <Star className="h-3 w-3 fill-current mr-0.5" />
                  {(listing.user.reputation ?? 0).toFixed(1)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-semibold">{listing.offersCount || 0}</span>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
