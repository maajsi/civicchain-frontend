"use client";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ActiveFilterBadgesProps {
  selectedCategories: string[];
  selectedStatuses: string[];
  radius: number;
  onRemoveCategory: (category: string) => void;
  onRemoveStatus: (status: string) => void;
  onResetRadius: () => void;
  onClearAll: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  pothole: "🕳️ Pothole",
  garbage: "🗑️ Garbage",
  streetlight: "💡 Streetlight",
  water: "💧 Water",
  other: "📋 Other",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function ActiveFilterBadges({
  selectedCategories,
  selectedStatuses,
  radius,
  onRemoveCategory,
  onRemoveStatus,
  onResetRadius,
  onClearAll,
}: ActiveFilterBadgesProps) {
  const hasFilters =
    selectedCategories.length > 0 ||
    selectedStatuses.length > 0 ||
    radius !== 5000;

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border-2 animate-fade-in-up shadow-sm">
      <span className="text-sm font-semibold text-muted-foreground">
        Active Filters:
      </span>

      {selectedCategories.map((category) => (
        <Badge
          key={category}
          variant="secondary"
          className="gap-1.5 pl-3 pr-2 py-1.5 cursor-pointer hover:bg-secondary/80 transition-colors text-sm font-medium"
          onClick={() => onRemoveCategory(category)}
        >
          {CATEGORY_LABELS[category] || category}
          <X className="h-3.5 w-3.5 ml-1" />
        </Badge>
      ))}

      {selectedStatuses.map((status) => (
        <Badge
          key={status}
          variant="secondary"
          className="gap-1.5 pl-3 pr-2 py-1.5 cursor-pointer hover:bg-secondary/80 transition-colors text-sm font-medium"
          onClick={() => onRemoveStatus(status)}
        >
          {STATUS_LABELS[status] || status}
          <X className="h-3.5 w-3.5 ml-1" />
        </Badge>
      ))}

      {radius !== 5000 && (
        <Badge
          variant="secondary"
          className="gap-1.5 pl-3 pr-2 py-1.5 cursor-pointer hover:bg-secondary/80 transition-colors text-sm font-medium"
          onClick={onResetRadius}
        >
          📍 {(radius / 1000).toFixed(1)} km radius
          <X className="h-3.5 w-3.5 ml-1" />
        </Badge>
      )}

      {hasFilters && (
        <button
          onClick={onClearAll}
          className="ml-auto text-sm font-semibold text-destructive hover:text-destructive/80 hover:underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
