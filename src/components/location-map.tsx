"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

interface LocationMapProps {
  locationName: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function LocationMap({ locationName }: LocationMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.0060 }); // Default NYC
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Geocode location string to lat/lng using free Nominatim API
    async function geocode() {
      if (!locationName) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
          }
        }
      } catch (err) {
        console.warn("Geocoding failed", err);
      } finally {
        setLoading(false);
      }
    }
    geocode();
  }, [locationName]);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.05}%2C${coords.lat - 0.05}%2C${coords.lng + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <MapPin className="w-4 h-4 text-purple-500" />
          <span>{locationName || "Approximate Location"}</span>
        </div>
        <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full flex items-center gap-1">
          <Navigation className="w-3 h-3 text-purple-400" /> Approximate Radius (~2km)
        </span>
      </div>

      <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-border/50 shadow-inner bg-card/60">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-muted/40 animate-pulse text-xs text-muted-foreground">
            Loading Map Area...
          </div>
        ) : (
          <iframe
            title={`Approximate location map for ${locationName}`}
            src={mapUrl}
            className="w-full h-full border-0 opacity-85 hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
