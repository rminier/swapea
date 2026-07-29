import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ShieldCheck, Flag, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OfferModal } from "@/components/offer-modal";
import { Button } from "@/components/ui/button";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!listing || listing.softDeleted || !listing.visibility) {
    notFound();
  }

  const parsedListing = {
    ...listing,
    images: JSON.parse(listing.images as string) as string[],
    tags: JSON.parse(listing.tags as string) as string[],
  };

  const conditionColors: Record<string, string> = {
    NEW: "bg-green-500/10 text-green-500",
    LIKE_NEW: "bg-emerald-500/10 text-emerald-500",
    GOOD: "bg-blue-500/10 text-blue-500",
    FAIR: "bg-yellow-500/10 text-yellow-500",
    POOR: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden shadow-lg border border-border/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={parsedListing.images[0] || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"} 
              alt={parsedListing.title} 
              className="w-full h-full object-cover"
            />
          </div>
          {parsedListing.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {parsedListing.images.slice(1).map((img, i) => (
                <div key={i} className="w-24 h-24 flex-shrink-0 bg-muted rounded-xl overflow-hidden border border-border/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${parsedListing.title} ${i+2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm border-border/50">
                {parsedListing.category}
              </Badge>
              <Badge variant="secondary" className={`text-xs border-0 ${conditionColors[parsedListing.condition] || ""}`}>
                {parsedListing.condition.replace("_", " ")}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{parsedListing.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {parsedListing.location}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Listed {formatDistanceToNow(new Date(parsedListing.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          <div className="p-5 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={parsedListing.user.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white"><UserIcon className="w-6 h-6" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{parsedListing.user.name}</p>
                <div className="flex items-center text-sm text-amber-500">
                  <span className="font-bold">{parsedListing.user.reputation.toFixed(1)}</span>
                  <span className="text-xs ml-1 text-muted-foreground">★ Rating</span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              {/* Check if user is the owner, if not show make offer */}
              <OfferModal 
                targetListingId={parsedListing.id} 
                targetListingTitle={parsedListing.title} 
                trigger={
                  <Button size="lg" className="w-full md:w-auto rounded-full bg-brand-button text-lg px-8">
                    Make Offer
                  </Button>
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {parsedListing.description}
            </div>
          </div>

          <div className="pt-6 border-t border-border/30 flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Verified Trader</span>
            </div>
            <button className="flex items-center hover:text-red-400 transition-colors">
              <Flag className="w-4 h-4 mr-1.5" />
              <span>Report Listing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
