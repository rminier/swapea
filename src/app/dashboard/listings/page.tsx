"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ListingManagementCard } from "@/components/dashboard/listing-management-card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, Search, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function DashboardListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: listings = [], isLoading, refetch: fetchListings } = useQuery({
    queryKey: ["myManagedListings"],
    queryFn: async () => {
      const res = await fetch("/api/me/listings");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filteredListings = listings.filter((l: { title: string }) => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container max-w-6xl mx-auto px-4 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight font-heading flex items-center gap-3">
              <Package className="h-10 w-10 text-primary" />
              Manage My Listings
            </h1>
            <p className="text-lg text-muted-foreground">
              You have {listings.length} active listings on the marketplace.
            </p>
          </div>
          <Button render={<Link href="/listings/new" />} className="rounded-2xl font-bold px-8 py-6 text-lg bg-brand-button">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Listing
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search your listings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
            />
          </div>
          <Button variant="outline" className="h-12 rounded-xl px-6 font-bold border-border/50 bg-muted/30">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Loading your inventory...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredListings.map((listing) => (
              <ListingManagementCard 
                key={listing.id} 
                listing={listing} 
                onRefresh={fetchListings} 
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center space-y-6 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">No listings found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchQuery ? "No listings match your search criteria." : "You haven't posted any items yet. Start trading today!"}
              </p>
            </div>
            {!searchQuery && (
              <Button render={<Link href="/listings/new" />} variant="outline" className="rounded-xl font-bold">
                Create your first listing
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
