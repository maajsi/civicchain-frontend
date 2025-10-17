"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  initialPosition: { lat: number; lng: number };
  onLocationChange: (coords: { lat: number; lng: number }) => void;
}

function LocationMarker({ position, onPositionChange }: { 
  position: { lat: number; lng: number };
  onPositionChange: (coords: { lat: number; lng: number }) => void;
}) {
  const [markerPosition, setMarkerPosition] = useState(position);

  useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setMarkerPosition(newPos);
      onPositionChange(newPos);
    },
  });

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  return <Marker position={markerPosition} icon={icon} draggable={true} eventHandlers={{
    dragend: (e) => {
      const marker = e.target;
      const position = marker.getLatLng();
      const newPos = { lat: position.lat, lng: position.lng };
      setMarkerPosition(newPos);
      onPositionChange(newPos);
    },
  }} />;
}

export function LocationPicker({ initialPosition, onLocationChange }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border">
      <MapContainer
        center={[initialPosition.lat, initialPosition.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={initialPosition} onPositionChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}
