"use client";

import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useListingsQuery } from "@/hooks/use-listings-query";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useLanguage } from "@/components/language-provider";

export function SearchBar() {
  const { query, updateQuery } = useListingsQuery();
  const { t } = useLanguage();
  const [value, setValue] = useState(query.q);
  const [prevQueryQ, setPrevQueryQ] = useState(query.q);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  if (prevQueryQ !== query.q) {
    setPrevQueryQ(query.q);
    setValue(query.q);
  }

  const fetchSuggestions = async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/listings/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Suggestions fetch failed", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newVal);
      if (newVal.length > 1) setOpen(true);
      else setOpen(false);
    }, 300);
  };

  const handleSearch = (q: string) => {
    updateQuery({ q });
    setOpen(false);
  };

  const clearSearch = () => {
    setValue("");
    updateQuery({ q: "" });
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={value}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(value)}
              placeholder={t("listings.search_placeholder")}
              className="pl-12 pr-10 h-14 rounded-2xl bg-card border-border/50 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 text-lg transition-all"
            />
            {value && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>
        {suggestions.length > 0 && (
          <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
            <Command>
              <CommandList>
                <CommandGroup heading="Suggestions">
                  {suggestions.map((s) => (
                    <CommandItem
                      key={s}
                      onSelect={() => {
                        setValue(s);
                        handleSearch(s);
                      }}
                      className="cursor-pointer py-3"
                    >
                      <Search className="mr-2 h-4 w-4 opacity-50" />
                      {s}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
