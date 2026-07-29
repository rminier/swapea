"use client";

import { useState } from "react";
import { useListingsQuery } from "@/hooks/use-listings-query";
import { ListingCondition } from "@/lib/enums";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, ChevronLeft, ChevronRight, ChevronDown, MapPin, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryStructure {
  name: string;
  dbValue: string;
  subcategories?: { name: string; dbValue: string }[];
}

const CATEGORY_STRUCTURE: CategoryStructure[] = [
  {
    name: "Clothing",
    dbValue: "Clothing",
    subcategories: [
      { name: "Shirts", dbValue: "Clothing - Shirts" },
      { name: "Pants", dbValue: "Clothing - Pants" },
      { name: "Shoes", dbValue: "Clothing - Shoes" },
      { name: "Accessories", dbValue: "Clothing - Accessories" },
      { name: "Maternity", dbValue: "Clothing - Maternity" },
    ]
  },
  {
    name: "Electronics",
    dbValue: "Electronics"
  },
  {
    name: "Video Games",
    dbValue: "Video Games",
    subcategories: [
      { name: "Accessories", dbValue: "Video Games - Accessories" },
      { name: "Consoles", dbValue: "Video Games - Consoles" },
      { name: "Games", dbValue: "Video Games - Games" },
    ]
  },
  {
    name: "Collectibles",
    dbValue: "Collectibles",
    subcategories: [
      { name: "Cards", dbValue: "Collectibles - Cards" },
      { name: "Figures", dbValue: "Collectibles - Figures" },
      { name: "Mystery Brands", dbValue: "Collectibles - Mystery Brands" },
      { name: "Miscellaneous", dbValue: "Collectibles - Miscellaneous" },
    ]
  },
  {
    name: "Toys",
    dbValue: "Toys"
  },
  {
    name: "Kids",
    dbValue: "Kids",
    subcategories: [
      { name: "Toys", dbValue: "Kids - Toys" },
      { name: "Baby Items", dbValue: "Kids - Baby Items" },
      { name: "Clothing", dbValue: "Kids - Clothing" },
    ]
  },
  {
    name: "Health Products",
    dbValue: "Health Products"
  },
  {
    name: "Books",
    dbValue: "Books",
    subcategories: [
      { name: "Academic", dbValue: "Books - Academic" },
      { name: "Recreational", dbValue: "Books - Recreational" },
    ]
  },
  {
    name: "Home",
    dbValue: "Home",
    subcategories: [
      { name: "Furniture", dbValue: "Home - Furniture" },
      { name: "Miscellaneous", dbValue: "Home - Miscellaneous" },
    ]
  },
  {
    name: "Garden",
    dbValue: "Garden"
  },
  {
    name: "Instruments",
    dbValue: "Instruments"
  },
  {
    name: "Tools",
    dbValue: "Tools"
  },
  {
    name: "Sports",
    dbValue: "Sports"
  },
  {
    name: "Miscellaneous & Others",
    dbValue: "Miscellaneous & Others"
  },
  // Premium Categories
  {
    name: "Home Appliances 🔒",
    dbValue: "Home Appliances"
  },
  {
    name: "Jewelry 🔒",
    dbValue: "Jewelry"
  },
  {
    name: "Cars 🔒",
    dbValue: "Cars"
  },
  {
    name: "Auto Parts 🔒",
    dbValue: "Auto Parts"
  },
  {
    name: "Designer Brands 🔒",
    dbValue: "Designer Brands"
  },
  {
    name: "Real Estate 🔒",
    dbValue: "Real Estate"
  },
  {
    name: "Handcrafts 🔒",
    dbValue: "Handcrafts"
  },
  {
    name: "Music 🔒",
    dbValue: "Music"
  }
];

interface FacetCounts {
  categories: { name: string; count: number }[];
  conditions: { name: string; count: number }[];
}

export function FilterPanel({ meta }: { meta?: { facetCounts: FacetCounts } }) {
  const { query, updateQuery, clearFilters } = useListingsQuery();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Clothing", "Collectibles", "Video Games", "Books", "Home"]);

  const handleCategoryChange = (cat: CategoryStructure, checked: boolean) => {
    let newCats = [...query.categories];
    const dbValues = [cat.dbValue, ...(cat.subcategories?.map(s => s.dbValue) || [])];
    
    if (checked) {
      dbValues.forEach(val => {
        if (!newCats.includes(val)) newCats.push(val);
      });
    } else {
      newCats = newCats.filter(c => !dbValues.includes(c));
    }
    updateQuery({ categories: newCats });
  };

  const handleSubcategoryChange = (parent: CategoryStructure, subDbValue: string, checked: boolean) => {
    let newCats = [...query.categories];
    if (checked) {
      if (!newCats.includes(subDbValue)) newCats.push(subDbValue);
    } else {
      newCats = newCats.filter(c => c !== subDbValue);
      newCats = newCats.filter(c => c !== parent.dbValue);
    }
    updateQuery({ categories: newCats });
  };

  const toggleExpand = (dbValue: string) => {
    setExpandedCategories(prev =>
      prev.includes(dbValue)
        ? prev.filter(v => v !== dbValue)
        : [...prev, dbValue]
    );
  };

  const getCount = (type: 'categories' | 'conditions', name: string) => {
    return meta?.facetCounts[type]?.find(f => f.name === name)?.count || 0;
  };

  const getGroupCount = (cat: CategoryStructure) => {
    let count = getCount('categories', cat.dbValue);
    if (cat.subcategories) {
      cat.subcategories.forEach(sub => {
        count += getCount('categories', sub.dbValue);
      });
    }
    return count;
  };

  const handleConditionChange = (cond: string, checked: boolean) => {
    const newConds = checked 
      ? [...query.conditions, cond]
      : query.conditions.filter(c => c !== cond);
    updateQuery({ conditions: newConds });
  };

  return (
    <div className={cn(
      "relative h-full transition-all duration-300 ease-in-out border-r border-border/50 bg-card/30 backdrop-blur-md",
      collapsed ? "w-16" : "w-72"
    )}>
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-4 z-10 h-8 w-8 rounded-full border border-border bg-background shadow-sm hover:bg-muted"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className={cn(
        "flex flex-col h-full",
        collapsed ? "items-center py-8" : "p-6"
      )}>
        {collapsed ? (
          <div className="space-y-6">
            <Filter className="h-6 w-6 text-primary" />
            <div className="h-px w-8 bg-border" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-xl tracking-tight">Filters</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs h-7 rounded-full hover:text-destructive"
              >
                Reset
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-8 pb-10">
                {/* Promoted Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <Label htmlFor="promoted" className="text-sm font-medium cursor-pointer">Promoted Only</Label>
                  </div>
                  <Switch 
                    id="promoted" 
                    checked={query.promotedOnly}
                    onCheckedChange={(checked) => updateQuery({ promotedOnly: checked })}
                  />
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Category</h3>
                  <div className="space-y-3">
                    {CATEGORY_STRUCTURE.map((cat) => (
                      <div key={cat.dbValue} className="space-y-2">
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {cat.subcategories ? (
                              <button
                                type="button"
                                onClick={() => toggleExpand(cat.dbValue)}
                                className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
                              >
                                {expandedCategories.includes(cat.dbValue) ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                              </button>
                            ) : (
                              <div className="w-5" />
                            )}
                            <Checkbox 
                              id={`cat-${cat.dbValue}`}
                              checked={query.categories.includes(cat.dbValue)}
                              onCheckedChange={(checked) => handleCategoryChange(cat, !!checked)}
                              className="rounded-md"
                            />
                            <Label htmlFor={`cat-${cat.dbValue}`} className="text-sm font-semibold cursor-pointer truncate group-hover:text-primary transition-colors">
                              {cat.name}
                            </Label>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded flex-shrink-0">
                            {getGroupCount(cat)}
                          </span>
                        </div>

                        {cat.subcategories && expandedCategories.includes(cat.dbValue) && (
                          <div className="ml-9 border-l border-border/40 pl-4 space-y-2.5 py-1">
                            {cat.subcategories.map((sub) => (
                              <div key={sub.dbValue} className="flex items-center justify-between group/sub">
                                <div className="flex items-center space-x-3">
                                  <Checkbox 
                                    id={`sub-${sub.dbValue}`}
                                    checked={query.categories.includes(sub.dbValue)}
                                    onCheckedChange={(checked) => handleSubcategoryChange(cat, sub.dbValue, !!checked)}
                                    className="rounded-md"
                                  />
                                  <Label htmlFor={`sub-${sub.dbValue}`} className="text-xs font-medium cursor-pointer text-muted-foreground group-hover/sub:text-primary transition-colors">
                                    {sub.name}
                                  </Label>
                                </div>
                                <span className="text-[10px] text-muted-foreground/75 font-mono">
                                  {getCount('categories', sub.dbValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Condition</h3>
                  <div className="grid gap-3">
                    {Object.keys(ListingCondition).map((cond) => (
                      <div key={cond} className="flex items-center justify-between group">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id={`cond-${cond}`}
                            checked={query.conditions.includes(cond)}
                            onCheckedChange={(checked) => handleConditionChange(cond, !!checked)}
                            className="rounded-md"
                          />
                          <Label htmlFor={`cond-${cond}`} className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors">
                            {cond.replace("_", " ")}
                          </Label>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                          {getCount('conditions', cond)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reputation Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Min Reputation</h3>
                    <div className="flex items-center text-amber-500 font-bold text-sm">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      {query.minReputation}
                    </div>
                  </div>
                  <Slider 
                    defaultValue={[query.minReputation]}
                    max={5}
                    step={0.1}
                    onValueCommit={([val]) => updateQuery({ minReputation: val })}
                    className="py-2"
                  />
                </div>

                {/* Radius Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Distance (km)</h3>
                    <div className="flex items-center text-primary font-bold text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {query.radiusKm}
                    </div>
                  </div>
                  <Slider 
                    defaultValue={[query.radiusKm]}
                    max={200}
                    step={5}
                    onValueCommit={([val]) => updateQuery({ radiusKm: val })}
                    className="py-2"
                  />
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}
