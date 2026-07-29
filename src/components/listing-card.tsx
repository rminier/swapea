import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCondition } from "@/lib/enums";
import { MapPin, Clock, Star } from "lucide-react";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    images: string[];
    condition: ListingCondition;
    location: string;
    createdAt: Date | string;
    category: string;
    user?: {
      name: string | null;
      reputation: number;
    };
  };
}

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

export function ListingCard({ listing }: ListingCardProps) {
  const conditionColors: Record<ListingCondition, string> = {
    NEW: "bg-green-500/20 text-green-400 font-bold border-0",
    LIKE_NEW: "bg-emerald-500/20 text-emerald-400 font-bold border-0",
    GOOD: "bg-blue-500/20 text-blue-400 font-bold border-0",
    FAIR: "bg-yellow-500/20 text-yellow-400 font-bold border-0",
    POOR: "bg-red-500/20 text-red-400 font-bold border-0",
  };

  return (
    <Link href={`/listings/${listing.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 bg-card/60 backdrop-blur-sm border-border/50 flex flex-col justify-between pt-0">
        <div>
          {/* Image & Badges Overlay */}
          <div className="aspect-[4/3] relative overflow-hidden bg-muted rounded-t-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.images[0] || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600"}
              alt={listing.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <Badge
                variant="outline"
                className="bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-white border-0 px-2 py-0.5 rounded-md"
              >
                {listing.category}
              </Badge>
              <Badge 
                variant="secondary" 
                className={`text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 shadow-sm ${conditionColors[listing.condition]}`}
              >
                {listing.condition.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <CardContent className="p-3 sm:p-4 space-y-2">
            <h3 className="font-bold text-sm sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {listing.title}
            </h3>

            <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium pt-1">
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                <span className="truncate max-w-[80px] sm:max-w-[120px]">{listing.location}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                <span>{formatTimeShort(listing.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </div>

        {listing.user && (
          <CardFooter className="px-3 py-2.5 sm:px-4 sm:py-3 border-t border-border/30 bg-muted/20 flex justify-between items-center text-xs">
            <span className="truncate max-w-[90px] sm:max-w-[120px] font-semibold text-muted-foreground">
              {listing.user.name || "User"}
            </span>
            <div className="flex items-center text-amber-500 font-extrabold gap-0.5">
              <span>{(listing.user.reputation ?? 0).toFixed(1)}</span>
              <Star className="h-3 w-3 fill-current inline" />
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
