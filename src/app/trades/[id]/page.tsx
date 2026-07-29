import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { TradeChat } from "@/components/trade-chat";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft } from "lucide-react";
import Link from "next/link";

interface TradePageProps {
  params: Promise<{ id: string }>;
}

export default async function TradePage({ params }: TradePageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div className="p-10 text-center">Please log in to view this trade.</div>;
  }

  const trade = await prisma.trade.findUnique({
    where: { id },
    include: {
      offer: {
        include: {
          targetListing: { include: { user: true } },
          offeredListings: true,
          proposingUser: true,
        }
      }
    }
  });

  if (!trade) {
    notFound();
  }

  // Parse strings to arrays
  trade.offer.targetListing.images = JSON.parse(trade.offer.targetListing.images as unknown as string);
  trade.offer.targetListing.tags = JSON.parse(trade.offer.targetListing.tags as unknown as string);

  trade.offer.offeredListings = trade.offer.offeredListings.map((listing) => ({
    ...listing,
    images: JSON.parse(listing.images),
    tags: JSON.parse(listing.tags),
  }));

  // Ensure user is part of the trade
  const isTargetOwner = trade.offer.targetListing.userId === session.user.id;
  const isProposer = trade.offer.proposingUserId === session.user.id;

  if (!isTargetOwner && !isProposer) {
    return <div className="p-10 text-center">Unauthorized. You are not part of this trade.</div>;
  }

  const otherUser = isProposer ? trade.offer.targetListing.user : trade.offer.proposingUser;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Trade Room</h1>
        <Badge variant={trade.status === "COMPLETED" ? "default" : "outline"} className="text-sm py-1 px-3">
          Status: {trade.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trade Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-center">The Exchange</h3>
            
            <div className="space-y-6">
              {/* Target Listing */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">{isProposer ? "You are receiving" : "You are giving"}</p>
                <Link href={`/listings/${trade.offer.targetListingId}`}>
                  <div className="border border-border/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                    <img src={trade.offer.targetListing.images[0]} className="w-full aspect-video object-cover" />
                    <div className="p-3">
                      <p className="font-medium line-clamp-1">{trade.offer.targetListing.title}</p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="flex justify-center">
                <div className="bg-muted p-2 rounded-full border border-border/50">
                  <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>

              {/* Offered Listings */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">{isProposer ? "You are giving" : "You are receiving"}</p>
                <div className="flex gap-2 justify-center">
                  {trade.offer.offeredListings.map((listing) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`} className="flex-1">
                      <div className="border border-border/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors bg-background">
                        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                        <img src={listing.images[0]} className="w-full aspect-square object-cover" />
                        <div className="p-2">
                          <p className="text-xs font-medium line-clamp-1">{listing.title}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-center text-muted-foreground mb-4">Trading with <span className="font-semibold text-foreground">{otherUser.name}</span></p>
              {trade.status !== "COMPLETED" && (
                <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium shadow-sm transition-all text-sm">
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 h-full">
          <TradeChat tradeId={trade.id} />
        </div>
      </div>
    </div>
  );
}
