"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useForwardGeocode,
  LocationSuggestion,
} from "@/hooks/use-forward-geocode";

interface LocationSearchInputProps {
  onLocationSelect: (lat: number, lng: number, displayName: string) => void;
  onClear: () => void;
  currentLocation?: string;
}

export function LocationSearchInput({
  onLocationSelect,
  onClear,
  currentLocation,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, loading, searchLocation, clearSuggestions } =
    useForwardGeocode();
  const inputRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    onLocationSelect(lat, lng, suggestion.display_name);
    setQuery("");
    clearSuggestions();
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery("");
    clearSuggestions();
    setShowSuggestions(false);
    onClear();
  };

  return (
    <div className="relative w-full" ref={inputRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={
            currentLocation
              ? `Searching near: ${currentLocation}`
              : "Search by location..."
          }
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-10 h-10"
        />
        {(query || currentLocation) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.trim().length >= 3 || loading) && (
        <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {!loading && suggestions.length === 0 && query.trim().length >= 3 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No locations found. Try a different search.
            </div>
          )}

          {!loading &&
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectLocation(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-start gap-3 border-b border-border last:border-b-0"
              >
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {suggestion.address.road || suggestion.address.city}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {suggestion.display_name}
                  </p>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
