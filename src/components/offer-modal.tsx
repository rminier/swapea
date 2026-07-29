"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface OfferModalProps {
  targetListingId: string;
  targetListingTitle: string;
  trigger?: React.ReactElement;
}

interface UserListing {
  id: string;
  title: string;
  images: string[];
}

export function OfferModal({ targetListingId, targetListingTitle, trigger }: OfferModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user's listings to use in the offer
  const { data: myListings, isLoading } = useQuery<UserListing[]>({
    queryKey: ["myListings"],
    queryFn: async () => {
      const res = await fetch("/api/me/listings");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: open,
  });

  const handleOffer = async () => {
    if (selectedListings.length === 0) {
      toast.error("Please select at least one item to offer.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetListingId,
          offeredListingIds: selectedListings,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to make offer");
      }

      toast.success("Offer sent successfully!");
      setOpen(false);
      setSelectedListings([]);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedListings(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600">Make Offer</Button>} />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Select one or more of your listings to offer for &quot;{targetListingTitle}&quot;.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-4"><div className="animate-pulse w-6 h-6 rounded-full bg-muted"></div></div>
          ) : myListings?.length === 0 ? (
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">You don&apos;t have any items to offer.</p>
              <Button render={<Link href="/listings/new" />} variant="outline">
                Create a Listing
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {myListings?.map((listing) => (
                  <div 
                    key={listing.id} 
                    className={`flex items-center space-x-4 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedListings.includes(listing.id) ? "border-purple-500 bg-purple-500/10" : "border-border/50 hover:border-purple-500/50"
                    }`}
                    onClick={() => toggleSelection(listing.id)}
                  >
                    <Checkbox 
                      checked={selectedListings.includes(listing.id)}
                      onCheckedChange={() => toggleSelection(listing.id)}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={listing.images[0] || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100"} alt={listing.title} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{listing.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleOffer} 
            disabled={isSubmitting || selectedListings.length === 0}
            className="bg-brand-button"
          >
            {isSubmitting ? "Sending..." : "Send Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
