import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCondition } from "@/lib/enums";
import { MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    images: string[];
    condition: ListingCondition;
    location: string;
    createdAt: Date;
    category: string;
    user?: {
      name: string | null;
      reputation: number;
    };
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const conditionColors: Record<ListingCondition, string> = {
    NEW: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    LIKE_NEW: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
    GOOD: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    FAIR: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    POOR: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  };

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50 pt-0">
        <div className="aspect-[4/3] relative overflow-hidden bg-muted rounded-t-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.images[0] || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600"}
            alt={listing.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <Badge 
            variant="secondary" 
            className={`absolute top-3 right-3 shadow-sm border-0 ${conditionColors[listing.condition]}`}
          >
            {listing.condition.replace("_", " ")}
          </Badge>
          <Badge
            variant="outline"
            className="absolute top-3 left-3 bg-background/80 backdrop-blur-md border-0"
          >
            {listing.category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mt-2 space-x-4">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">{listing.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
        {listing.user && (
          <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/10 mt-2 text-sm">
            <span className="text-muted-foreground">{listing.user.name || "User"}</span>
            <div className="flex items-center text-amber-500">
              <span className="font-medium">{(listing.user.reputation ?? 0).toFixed(1)}</span>
              <span className="text-xs ml-1 text-muted-foreground">★</span>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
