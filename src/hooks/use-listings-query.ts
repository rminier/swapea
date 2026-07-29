import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface ListingsQuery {
  q: string;
  categories: string[];
  conditions: string[];
  tags: string[];
  lat?: number;
  lng?: number;
  radiusKm: number;
  minReputation: number;
  sort: string;
  promotedOnly: boolean;
  cursor?: string;
}

export function useListingsQuery() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = useMemo((): ListingsQuery => ({
    q: searchParams.get("q") || "",
    categories: searchParams.getAll("category[]"),
    conditions: searchParams.getAll("condition[]"),
    tags: searchParams.getAll("tags[]"),
    lat: searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined,
    lng: searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined,
    radiusKm: parseInt(searchParams.get("radiusKm") || "50"),
    minReputation: parseFloat(searchParams.get("minReputation") || "0"),
    sort: searchParams.get("sort") || "newest",
    promotedOnly: searchParams.get("promotedOnly") === "true",
    cursor: searchParams.get("cursor") || undefined,
  }), [searchParams]);

  const updateQuery = useCallback((updates: Partial<ListingsQuery>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Helper to handle arrays and single values
    const setParam = (key: string, value: string | string[] | number | boolean | undefined, isArray: boolean = false) => {
      if (isArray) {
        params.delete(`${key}[]`);
        (value as string[]).forEach(v => params.append(`${key}[]`, v));
      } else {
        if (value !== undefined && value !== "" && value !== 0 && value !== false && value !== "all" && value !== "newest" && value !== 50) {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      }
    };

    if ("q" in updates) setParam("q", updates.q);
    if ("categories" in updates) setParam("category", updates.categories, true);
    if ("conditions" in updates) setParam("condition", updates.conditions, true);
    if ("tags" in updates) setParam("tags", updates.tags, true);
    if ("lat" in updates) setParam("lat", updates.lat);
    if ("lng" in updates) setParam("lng", updates.lng);
    if ("radiusKm" in updates) setParam("radiusKm", updates.radiusKm);
    if ("minReputation" in updates) setParam("minReputation", updates.minReputation);
    if ("sort" in updates) setParam("sort", updates.sort);
    if ("promotedOnly" in updates) setParam("promotedOnly", updates.promotedOnly);
    
    // Always clear cursor on new filter
    if (!("cursor" in updates)) {
      params.delete("cursor");
    } else {
      setParam("cursor", updates.cursor);
    }

    const newQuery = params.toString();
    router.push(`/listings${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
  }, [router, searchParams]);

  const clearFilters = useCallback(() => {
    router.push("/listings");
  }, [router]);

  return { query, updateQuery, clearFilters };
}
