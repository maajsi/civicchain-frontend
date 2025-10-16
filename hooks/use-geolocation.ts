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
        // Default to Hyderabad if permission denied
        setState({
          coordinates: { lat: 17.385044, lng: 78.486671 },
          loading: false,
          error: error.message,
        });
      }
    );
  }, []);

  return state;
}
