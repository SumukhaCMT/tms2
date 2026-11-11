import { List, LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ViewMode = "list" | "grid";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({
  view,
  onViewChange,
}: ViewToggleProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-md border p-1"
      role="group"
      aria-label="View options"
    >
      <Button
        type="button"
        variant={view === "list" ? "default" : "ghost"}
        size="icon"
        className="cursor-pointer"
        title="List View"
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() => onViewChange("list")}
      >
        <List className="size-4" />
      </Button>

      <Button
        type="button"
        variant={view === "grid" ? "default" : "ghost"}
        size="icon"
        className="cursor-pointer"
        title="Grid View"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="size-4" />
      </Button>
    </div>
  );
}