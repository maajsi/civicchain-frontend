"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, X, MapPin, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface AdvancedFiltersProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
}

const CATEGORIES = [
  { id: "pothole", label: "Pothole", icon: "🕳️", color: "from-orange-500 to-orange-600" },
  { id: "garbage", label: "Garbage", icon: "🗑️", color: "from-green-500 to-green-600" },
  { id: "streetlight", label: "Streetlight", icon: "💡", color: "from-yellow-500 to-yellow-600" },
  { id: "water", label: "Water", icon: "💧", color: "from-blue-500 to-blue-600" },
  { id: "drainage", label: "Drainage", icon: "🌊", color: "from-cyan-500 to-cyan-600" },
  { id: "other", label: "Other", icon: "📋", color: "from-gray-500 to-gray-600" },
];

const STATUSES = [
  { id: "open", label: "Open", icon: "🔴", color: "from-red-500 to-red-600" },
  { id: "in_progress", label: "In Progress", icon: "🔵", color: "from-blue-500 to-blue-600" },
  { id: "resolved", label: "Resolved", icon: "🟢", color: "from-green-500 to-green-600" },
  { id: "closed", label: "Closed", icon: "⚫", color: "from-gray-500 to-gray-600" },
];

export function AdvancedFilters({
  selectedCategories,
  onCategoriesChange,
  selectedStatuses,
  onStatusesChange,
  radius,
  onRadiusChange,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [tempCategories, setTempCategories] = useState(selectedCategories);
  const [tempStatuses, setTempStatuses] = useState(selectedStatuses);
  const [tempRadius, setTempRadius] = useState(radius);

  // Sync temp state with props when they change externally (e.g., from ActiveFilterBadges)
  useEffect(() => {
    setTempCategories(selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    setTempStatuses(selectedStatuses);
  }, [selectedStatuses]);

  useEffect(() => {
    setTempRadius(radius);
  }, [radius]);

  const handleApply = () => {
    onCategoriesChange(tempCategories);
    onStatusesChange(tempStatuses);
    onRadiusChange(tempRadius);
    setOpen(false);
  };

  const handleReset = () => {
    setTempCategories([]);
    setTempStatuses([]);
    setTempRadius(5000);
  };

  const handleClear = () => {
    onCategoriesChange([]);
    onStatusesChange([]);
    onRadiusChange(5000);
    setTempCategories([]);
    setTempStatuses([]);
    setTempRadius(5000);
    setOpen(false);
  };

  const toggleCategory = (categoryId: string) => {
    setTempCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleStatus = (statusId: string) => {
    setTempStatuses((prev) =>
      prev.includes(statusId)
        ? prev.filter((s) => s !== statusId)
        : [...prev, statusId]
    );
  };

  const activeFiltersCount =
    selectedCategories.length + selectedStatuses.length + (radius !== 5000 ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 relative h-12 px-6 border-2 hover:border-primary transition-colors"
          size="lg"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="font-semibold">Filters</span>
          {activeFiltersCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold bg-primary"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 border-b bg-gradient-to-br from-background to-muted/30">
          <SheetHeader className="space-y-2">
            <SheetTitle className="text-3xl font-bold">Filters</SheetTitle>
            <SheetDescription className="text-base text-muted-foreground">
              Customize your search to find specific issues
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-10">
          {/* Category Filter */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-xl font-bold">Category</h3>
                <p className="text-sm text-muted-foreground mt-1">Select issue types to filter</p>
              </div>
              {tempCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempCategories([])}
                  className="h-9 text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map((category) => {
                const isSelected = tempCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`
                      relative flex items-center gap-4 p-5 rounded-2xl transition-all duration-200
                      ${
                        isSelected
                          ? "bg-primary/10 ring-2 ring-primary shadow-lg scale-[1.02]"
                          : "bg-muted/30 hover:bg-muted/50 hover:scale-[1.01] border-2 border-transparent"
                      }
                    `}
                  >
                    <span className="text-4xl">{category.icon}</span>
                    <span className={`font-semibold ${isSelected ? "text-primary" : ""}`}>
                      {category.label}
                    </span>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Status Filter */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-xl font-bold">Status</h3>
                <p className="text-sm text-muted-foreground mt-1">Filter by resolution status</p>
              </div>
              {tempStatuses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempStatuses([])}
                  className="h-9 text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {STATUSES.map((status) => {
                const isSelected = tempStatuses.includes(status.id);
                return (
                  <button
                    key={status.id}
                    onClick={() => toggleStatus(status.id)}
                    className={`
                      relative flex items-center gap-4 p-5 rounded-2xl transition-all duration-200
                      ${
                        isSelected
                          ? "bg-primary/10 ring-2 ring-primary shadow-lg scale-[1.02]"
                          : "bg-muted/30 hover:bg-muted/50 hover:scale-[1.01] border-2 border-transparent"
                      }
                    `}
                  >
                    <span className="text-2xl">{status.icon}</span>
                    <span className={`font-semibold ${isSelected ? "text-primary" : ""}`}>
                      {status.label}
                    </span>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Radius Filter */}
          <div className="space-y-6">
            <div className="pb-3 border-b">
              <h3 className="text-xl font-bold">Search Radius</h3>
              <p className="text-sm text-muted-foreground mt-1">How far to search from your location</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {(tempRadius / 1000).toFixed(1)} km
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {tempRadius.toLocaleString()} meters
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-2">
                <Slider
                  value={[tempRadius]}
                  onValueChange={([value]) => setTempRadius(value)}
                  min={500}
                  max={20000}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-4">
                  <span className="font-medium">500m</span>
                  <span className="font-medium">20km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-muted/20 space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 h-12 font-semibold"
            >
              Reset All
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 h-12 font-semibold bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
            >
              Apply Filters
            </Button>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={handleClear}
              className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Active Filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
