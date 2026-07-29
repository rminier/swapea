"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCondition } from "@/lib/enums";

const CATEGORIES = [
  // Standard Categories
  "Clothing - Shirts",
  "Clothing - Pants",
  "Clothing - Shoes",
  "Clothing - Accessories",
  "Clothing - Maternity",
  "Electronics",
  "Video Games - Accessories",
  "Video Games - Consoles",
  "Video Games - Games",
  "Collectibles - Cards",
  "Collectibles - Figures",
  "Collectibles - Mystery Brands",
  "Collectibles - Miscellaneous",
  "Toys",
  "Kids - Toys",
  "Kids - Baby Items",
  "Kids - Clothing",
  "Health Products",
  "Books - Academic",
  "Books - Recreational",
  "Home - Furniture",
  "Home - Miscellaneous",
  "Tools",
  "Sports",
  "Miscellaneous & Others",
  
  // Legacy Categories (to support seeded data)
  "Home", "Clothing", "Books", "Garden", "Collectibles", "Instruments",

  // Premium Categories
  "Home Appliances",
  "Jewelry",
  "Cars",
  "Auto Parts",
  "Designer Brands",
  "Real Estate",
  "Handcrafts",
  "Music"
];

export function ListingsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [condition, setCondition] = useState(searchParams.get("condition") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) params.set("search", search);
    else params.delete("search");
    
    if (category !== "all") params.set("category", category);
    else params.delete("category");
    
    if (condition !== "all") params.set("condition", condition);
    else params.delete("condition");
    
    if (sort !== "newest") params.set("sort", sort);
    else params.delete("sort");

    const query = params.toString();
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        router.push(`/listings${query ? `?${query}` : ""}`);
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, category, condition, sort, router, searchParams]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setCondition("all");
    setSort("newest");
  };

  const hasFilters = search || category !== "all" || condition !== "all" || sort !== "newest";

  return (
    <div className="space-y-6 bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm mb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-background/50 border-border/50"
          />
        </div>

        {/* Category */}
        <Select value={category} onValueChange={(val) => setCategory(val || "")}>
          <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Condition */}
        <Select value={condition} onValueChange={(val) => setCondition(val || "")}>
          <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/50">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Condition</SelectItem>
            {Object.keys(ListingCondition).map((cond) => (
              <SelectItem key={cond} value={cond}>
                {cond.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={(val) => setSort(val || "")}>
          <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="reputation">User Reputation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground">
            {isPending ? "Updating results..." : "Filters applied"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <FilterX className="h-3 w-3 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
