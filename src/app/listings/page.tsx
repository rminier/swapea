import { SearchBar } from "@/components/listings/search-bar";
import { FilterPanel } from "@/components/listings/filter-panel";
import { AppliedFilters } from "@/components/listings/applied-filters";
import { ListingGrid } from "@/components/listings/listing-grid";
import { ListingsSort } from "@/components/listings/listings-sort";

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string;
    "category[]"?: string | string[];
    "condition[]"?: string | string[];
    "tags[]"?: string | string[];
    lat?: string;
    lng?: string;
    radiusKm?: string;
    minReputation?: string;
    sort?: string;
    promotedOnly?: string;
    cursor?: string;
  }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  
  // Normalize search params for API call
  const apiUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/listings`);
  if (params.q) apiUrl.searchParams.set("q", params.q);
  
  const cats = Array.isArray(params["category[]"]) ? params["category[]"] : params["category[]"] ? [params["category[]"]] : [];
  cats.forEach(c => apiUrl.searchParams.append("category[]", c));
  
  const conds = Array.isArray(params["condition[]"]) ? params["condition[]"] : params["condition[]"] ? [params["condition[]"]] : [];
  conds.forEach(c => apiUrl.searchParams.append("condition[]", c));
  
  if (params.minReputation) apiUrl.searchParams.set("minReputation", params.minReputation);
  if (params.promotedOnly) apiUrl.searchParams.set("promotedOnly", params.promotedOnly);
  if (params.sort) apiUrl.searchParams.set("sort", params.sort);
  if (params.cursor) apiUrl.searchParams.set("cursor", params.cursor);
  apiUrl.searchParams.set("limit", "12");

  // Fetch initial data SSR with fallback to prevent HTML error page JSON parse crashes
  let initialData = { 
    items: [], 
    nextCursor: undefined,
    meta: { 
      facetCounts: { 
        categories: [] as { name: string; count: number }[], 
        conditions: [] as { name: string; count: number }[] 
      } 
    } 
  };

  try {
    const res = await fetch(apiUrl.toString(), { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        initialData = data;
      }
    }
  } catch (err) {
    console.error("SSR listings fetch fallback triggered:", err);
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Left Sidebar Filter (Desktop) */}
      <aside className="hidden md:block h-full shrink-0 border-r border-border/50">
        <FilterPanel meta={initialData.meta} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header/Search Area */}
        <div className="p-6 border-b border-border/40 bg-card/10 backdrop-blur-sm z-10">
          <div className="container max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <SearchBar />
              </div>
              <div className="flex items-center justify-between lg:justify-end gap-4">
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  Showing <span className="font-bold text-foreground">{initialData.items.length}</span> results
                </p>
                <ListingsSort />
              </div>
            </div>
            <AppliedFilters />
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-7xl mx-auto p-6 lg:p-8">
            <ListingGrid initialData={initialData} />
          </div>
        </div>
      </main>
    </div>
  );
}
