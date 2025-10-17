"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserId } from "@/lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) return null;
  const userId = typeof window !== 'undefined' ? getUserId() : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-border hover:border-primary transition-colors">
            <AvatarImage src={session.user.image || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground font-semibold">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="font-semibold leading-none">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(userId ? `/profile/${userId}` : "/profile") } className="cursor-pointer">
          <User className="h-4 w-4 mr-2" />
          Profile & Reputation
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
