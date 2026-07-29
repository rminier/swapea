"use client";

import { useListingsQuery } from "@/hooks/use-listings-query";
import { Badge } from "@/components/ui/badge";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppliedFilters() {
  const { query, updateQuery, clearFilters } = useListingsQuery();

  const activeFilters: { label: string; onRemove: () => void }[] = [];

  if (query.q) {
    activeFilters.push({
      label: `Search: ${query.q}`,
      onRemove: () => updateQuery({ q: "" }),
    });
  }

  query.categories.forEach(cat => {
    activeFilters.push({
      label: cat,
      onRemove: () => updateQuery({ categories: query.categories.filter(c => c !== cat) }),
    });
  });

  query.conditions.forEach(cond => {
    activeFilters.push({
      label: cond.replace("_", " "),
      onRemove: () => updateQuery({ conditions: query.conditions.filter(c => c !== cond) }),
    });
  });

  if (query.minReputation > 0) {
    activeFilters.push({
      label: `Rating: ${query.minReputation}+`,
      onRemove: () => updateQuery({ minReputation: 0 }),
    });
  }

  if (query.promotedOnly) {
    activeFilters.push({
      label: "Promoted",
      onRemove: () => updateQuery({ promotedOnly: false }),
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <span className="text-sm font-medium text-muted-foreground mr-2">Active filters:</span>
      {activeFilters.map((filter, i) => (
        <Badge
          key={i}
          variant="secondary"
          className="pl-3 pr-1 py-1 rounded-full gap-1 border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          {filter.label}
          <button
            onClick={filter.onRemove}
            className="p-0.5 hover:bg-background rounded-full transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        className="text-xs h-7 rounded-full text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3 w-3 mr-1.5" />
        Clear all
      </Button>
    </div>
  );
}
