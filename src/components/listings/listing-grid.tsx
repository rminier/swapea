"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useListingsQuery } from "@/hooks/use-listings-query";
import { ListingCardEnhanced } from "./listing-card-enhanced";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Inbox, RefreshCw } from "lucide-react";
import { useInView } from "react-intersection-observer";

export function ListingGrid({ initialData }: { initialData: unknown }) {
  const { query } = useListingsQuery();
  const { ref, inView } = useInView();

  const fetchListings = async ({ pageParam }: { pageParam?: string }) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    query.categories.forEach(c => params.append("category[]", c));
    query.conditions.forEach(c => params.append("condition[]", c));
    if (query.minReputation > 0) params.set("minReputation", query.minReputation.toString());
    if (query.promotedOnly) params.set("promotedOnly", "true");
    params.set("radiusKm", query.radiusKm.toString());
    params.set("sort", query.sort);
    if (pageParam) params.set("cursor", pageParam);
    params.set("limit", "12");

    const res = await fetch(`/api/listings?${params.toString()}`);
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ["listings", query],
    queryFn: fetchListings,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: {
      pages: [initialData as { items: Parameters<typeof ListingCardEnhanced>[0]['listing'][]; nextCursor?: string }],
      pageParams: [undefined],
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <RefreshCw className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Something went wrong</h3>
          <p className="text-muted-foreground">We couldn&apos;t load the listings. Please try again.</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="rounded-full">
          Retry Connection
        </Button>
      </div>
    );
  }

  const allItems = data?.pages.flatMap((page) => page.items) || [];

  if (allItems.length === 0 && !isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground/50">
          <Inbox className="h-12 w-12" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h3 className="text-2xl font-bold">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or searching for something else to find what you&apos;re looking for.
          </p>
        </div>
        <Button render={<Link href="/listings" />} variant="default" className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
          Clear all filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {allItems.map((listing) => (
          <ListingCardEnhanced key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Loading States */}
      <div ref={ref} className="flex justify-center py-10">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-3 text-muted-foreground animate-in fade-in">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading more treasures...</span>
          </div>
        ) : hasNextPage ? (
          <Button 
            onClick={() => fetchNextPage()} 
            variant="ghost" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Load more items
          </Button>
        ) : allItems.length > 0 ? (
          <p className="text-sm text-muted-foreground font-medium italic">
            You&apos;ve reached the end of the marketplace.
          </p>
        ) : null}
      </div>
    </div>
  );
}
