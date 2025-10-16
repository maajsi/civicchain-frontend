import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { List, Map as MapIcon, Filter, Search } from "lucide-react";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "list" | "map";
  onViewModeChange: (mode: "list" | "map") => void;
  onFilterOpen: () => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onFilterOpen,
}: SearchFilterBarProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search issues by location or type..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="icon"
          onClick={() => onViewModeChange("list")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "map" ? "default" : "outline"}
          size="icon"
          onClick={() => onViewModeChange("map")}
        >
          <MapIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onFilterOpen}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
