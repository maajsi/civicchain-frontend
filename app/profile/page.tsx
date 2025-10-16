"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import clientApi from "@/lib/client-api";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Trophy, 
  CheckCircle2, 
  Users, 
  Star, 
  Calendar, 
  Eye,
  MapPin,
  TrendingUp,
  Shield,
  Award
} from "lucide-react";

