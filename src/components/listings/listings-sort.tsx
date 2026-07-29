"use client";

import { useListingsQuery } from "@/hooks/use-listings-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ListingsSort() {
  const { query, updateQuery } = useListingsQuery();

  return (
    <Select value={query.sort} onValueChange={(val) => updateQuery({ sort: val || undefined })}>
      <SelectTrigger className="w-[180px] rounded-full bg-card border-border/50 shadow-sm">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest First</SelectItem>
        <SelectItem value="oldest">Oldest First</SelectItem>
        <SelectItem value="reputation">Highest Reputation</SelectItem>
        <SelectItem value="most_active">Most Active</SelectItem>
      </SelectContent>
    </Select>
  );
}
