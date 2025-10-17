"use client";

import { useState, useEffect } from "react";

interface ReverseGeocodeResult {
  address: string;
  loading: boolean;
  error: string | null;
}

// Cache to avoid redundant API calls
const geocodeCache = new Map<string, string>();

export function useReverseGeocode(lat?: number, lng?: number): ReverseGeocodeResult {
  const [address, setAddress] = useState<string>("Unknown location");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng) {
      setAddress("Unknown location");
      return;
    }

    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache first
    if (geocodeCache.has(cacheKey)) {
      setAddress(geocodeCache.get(cacheKey)!);
      return;
    }

    const fetchAddress = async () => {
      setLoading(true);
      setError(null);

      try {
        // Using OpenStreetMap Nominatim API (free, no API key required)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'CivicChain App', // Required by Nominatim
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch address");
        }

        const data = await response.json();
        
        // Build a readable address from the response
        let formattedAddress = "";
        
        if (data.address) {
          const parts = [];
          
          // Add road/street
          if (data.address.road) parts.push(data.address.road);
          
          // Add neighborhood or suburb
          if (data.address.neighbourhood) parts.push(data.address.neighbourhood);
          else if (data.address.suburb) parts.push(data.address.suburb);
          
          // Add city
          if (data.address.city) parts.push(data.address.city);
          else if (data.address.town) parts.push(data.address.town);
          else if (data.address.village) parts.push(data.address.village);
          
          // Add state if available
          if (data.address.state) parts.push(data.address.state);
          
          formattedAddress = parts.join(", ");
        }
        
        const finalAddress = formattedAddress || data.display_name || "Unknown location";
        
        // Cache the result
        geocodeCache.set(cacheKey, finalAddress);
        setAddress(finalAddress);
      } catch (err: unknown) {
        let message = "Unknown error";
        if (typeof err === "object" && err !== null && "message" in err) {
          message = (err as { message?: string }).message || message;
        }
        console.error("Reverse geocoding error:", err);
        setError(message);
        setAddress("Unknown location");
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to avoid rate limiting
    const timeoutId = setTimeout(fetchAddress, 100);

    return () => clearTimeout(timeoutId);
  }, [lat, lng]);

  return { address, loading, error };
}
