"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  coordinates: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        loading: false,
        error: "Geolocation is not supported by your browser",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        // Only use fallback location if permission is explicitly denied
        if (error.code === error.PERMISSION_DENIED) {
          setState({
            coordinates: { lat: 17.385044, lng: 78.486671 }, // Hyderabad fallback
            loading: false,
            error: "Location permission denied. Using default location.",
          });
        } else {
          // For other errors, don't set coordinates
          setState({
            coordinates: null,
            loading: false,
            error: error.message,
          });
        }
      },
      {
        enableHighAccuracy: true, // Request exact location
        timeout: 10000,
        maximumAge: 0, // Don't use cached position
      }
    );
  }, []);

  return state;
}
