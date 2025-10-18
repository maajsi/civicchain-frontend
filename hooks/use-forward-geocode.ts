import { useState } from "react";

export interface LocationSuggestion {
  display_name: string;
  short_name?: string; // Add short name field
  lat: string;
  lon: string;
  address: {
    city?: string;
    state?: string;
    country?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    town?: string;
    village?: string;
  };
}

export function useForwardGeocode() {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const searchLocation = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            "User-Agent": "CivicChain-Frontend/1.0",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Add shortened display names to each suggestion
        const enhancedData = data.map((item: LocationSuggestion) => {
          const parts = [];
          
          // Priority 1: Neighbourhood or suburb
          if (item.address.neighbourhood) {
            parts.push(item.address.neighbourhood);
          } else if (item.address.suburb) {
            parts.push(item.address.suburb);
          } else if (item.address.road) {
            parts.push(item.address.road);
          }
          
          // Priority 2: City
          if (item.address.city) {
            parts.push(item.address.city);
          } else if (item.address.town) {
            parts.push(item.address.town);
          } else if (item.address.village) {
            parts.push(item.address.village);
          }
          
          // Create short name (max 2 parts)
          const shortName = parts.slice(0, 2).join(", ") || item.display_name;
          
          return {
            ...item,
            short_name: shortName,
          };
        });
        
        setSuggestions(enhancedData);
      } else {
        console.error("Forward geocoding failed:", response.statusText);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error during forward geocoding:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSuggestions = () => setSuggestions([]);

  return {
    suggestions,
    loading,
    searchLocation,
    clearSuggestions,
  };
}
