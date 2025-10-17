"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const notificationCount = 0; // TODO: Fetch from API

  return (
    <Button variant="ghost" size="icon" className="relative hover:bg-accent transition-colors">
      <Bell className="h-5 w-5" />
      {notificationCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground animate-pulse">
          {notificationCount > 9 ? "9+" : notificationCount}
        </Badge>
      )}
    </Button>
  );
}
