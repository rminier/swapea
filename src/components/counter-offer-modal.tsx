"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CounterOfferModalProps {
  offerId: string;
  proposingUserId: string;
  proposingUserName: string;
  currentlyOfferedListingIds: string[];
  targetListingTitle: string;
  onSuccess?: () => void;
  trigger?: React.ReactElement;
}

interface UserListing {
  id: string;
  title: string;
  images: string[];
  condition: string;
  category: string;
}

export function CounterOfferModal({
  offerId,
  proposingUserId,
  proposingUserName,
  currentlyOfferedListingIds,
  targetListingTitle,
  onSuccess,
  trigger,
}: CounterOfferModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedListings, setSelectedListings] = useState<string[]>(currentlyOfferedListingIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch proposing user's listings to choose from for the counter offer
  const { data: userProfile, isLoading } = useQuery<{ listings: UserListing[] }>({
    queryKey: ["userListings", proposingUserId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${proposingUserId}?allListings=true`);
      if (!res.ok) throw new Error("Failed to fetch proposer listings");
      return res.json();
    },
    enabled: open,
  });

  const listings = userProfile?.listings || [];

  const handleCounter = async () => {
    if (selectedListings.length === 0) {
      toast.error("Please select at least one item to request.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/offers/${offerId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COUNTERED",
          offeredListingIds: selectedListings,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit counter offer");
      }

      toast.success("Counter offer submitted successfully!");
      setOpen(false);
      if (onSuccess) onSuccess();
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

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-600 hover:bg-purple-500/10">Counter Offer</Button>} />
      <DialogContent className="sm:max-w-[550px] bg-card/90 backdrop-blur-xl border border-border/40 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Make a Counter Offer
          </DialogTitle>
          <DialogDescription>
            Select which items you want from <span className="font-semibold text-foreground">{proposingUserName}</span>&apos;s inventory in exchange for your &quot;{targetListingTitle}&quot;.
          </DialogDescription>
        </DialogHeader>

        {/* Search input to filter Bob's inventory */}
        {listings.length > 5 && (
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search proposer's inventory..."
              className="pl-9 bg-muted/30 border-transparent rounded-full focus-visible:ring-purple-500"
            />
          </div>
        )}

        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="animate-spin w-8 h-8 rounded-full border-b-2 border-purple-500"></div>
              <p className="text-xs text-muted-foreground animate-pulse">Fetching inventory...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center p-8 bg-muted/20 border border-dashed rounded-xl">
              <p className="text-muted-foreground text-sm">This user doesn&apos;t have any other active listings to trade.</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center p-8 bg-muted/20 border border-dashed rounded-xl">
              <p className="text-muted-foreground text-sm">No items match your search query.</p>
            </div>
          ) : (
            <ScrollArea className="h-[320px] pr-2">
              <div className="space-y-3">
                {filteredListings.map((listing) => {
                  const isChecked = selectedListings.includes(listing.id);
                  return (
                    <div
                      key={listing.id}
                      onClick={() => toggleSelection(listing.id)}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                        isChecked
                          ? "border-purple-500 bg-purple-500/10 shadow-sm shadow-purple-500/5 scale-[1.01]"
                          : "border-border/50 bg-background/50 hover:border-purple-500/40 hover:bg-muted/30"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleSelection(listing.id)}
                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={listing.images[0] || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-1 text-foreground">{listing.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize bg-background/50 border-border/50">
                            {listing.category.split(" - ")[0]}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize bg-muted border-0">
                            {listing.condition.toLowerCase().replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border/30 pt-4 mt-2">
          <div className="text-xs text-muted-foreground font-medium">
            {selectedListings.length} {selectedListings.length === 1 ? "item" : "items"} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button
              onClick={handleCounter}
              disabled={isSubmitting || selectedListings.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-full px-5 transition-all duration-300 transform hover:scale-[1.03] active:translate-y-[1px]"
            >
              {isSubmitting ? "Submitting..." : "Submit Counter Offer"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
