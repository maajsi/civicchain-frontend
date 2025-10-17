"use client";

import { useSession } from "next-auth/react";
import { getUserId } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import clientApi from "@/lib/client-api";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  CheckCircle2,
  Users,
  MapPin,
  TrendingUp,
  Shield,
  Award,
} from "lucide-react";

// Type definitions for user and badge
type UserProfile = {
  user_id: string;
  name: string;
  profile_pic: string;
  rep: number;
  created_at: string;
  issues_reported: number;
  issues_resolved: number;
  total_upvotes: number;
  verifications_done: number;
  badges: string[];
};


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const myUserId = typeof window !== 'undefined' ? getUserId() : null;

  // Fetch user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      // If viewing own profile, always use myUserId (UUID) for /user/{id}
      const endpoint = myUserId && userId === myUserId ? `/user/${myUserId}` : `/user/${userId}`;
      const response = await clientApi.get(endpoint);
      return response.data;
    },
    enabled: !!session,
  });

  const BADGES = [
    {
      id: "first_reporter",
      icon: MapPin,
      name: "First Reporter",
      description: "Reported your first issue",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      check: (user: UserProfile) => user.issues_reported >= 1,
      progress: (user: UserProfile) => Math.min((user.issues_reported / 1) * 100, 100),
    },
    {
      id: "top_reporter",
      icon: Trophy,
      name: "Top Reporter",
      description: "Reported 10+ issues",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      check: (user: UserProfile) => user.issues_reported >= 10,
      progress: (user: UserProfile) => Math.min((user.issues_reported / 10) * 100, 100),
    },
    {
      id: "civic_hero",
      icon: Users,
      name: "Civic Hero",
      description: "Reported 50+ issues",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      check: (user: UserProfile) => user.issues_reported >= 50,
      progress: (user: UserProfile) => Math.min((user.issues_reported / 50) * 100, 100),
    },
    {
      id: "verifier",
      icon: CheckCircle2,
      name: "Verifier",
      description: "Verified 10 resolved issues",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      check: (user: UserProfile) => user.verifications_done >= 10,
      progress: (user: UserProfile) => Math.min((user.verifications_done / 10) * 100, 100),
    },
    {
      id: "trusted_voice",
      icon: Award,
      name: "Trusted Voice",
      description: "Earned 200+ Rep",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      check: (user: UserProfile) => user.rep >= 200,
      progress: (user: UserProfile) => Math.min((user.rep / 200) * 100, 100),
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (status === "loading" || isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profileData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  const user = profileData.user;
  const level = Math.floor(user.rep / 100);
  const levelProgress = user.rep % 100;
  const nextLevelRep = (level + 1) * 100;
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/users")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h1 className="text-2xl font-bold">Profile & Reputation</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header Card */}
        <Card className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white p-8 mb-8 border-0 shadow-xl animate-fade-in-up">
          <div className="flex items-start gap-6">
            {/* Avatar with Level Badge */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={user.profile_pic} alt={user.name} />
                <AvatarFallback className="text-3xl font-bold bg-blue-400">
                  {user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-yellow-900 shadow-lg border-4 border-white">
                {level}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
              <p className="text-blue-100 mb-4">
                Member since {formatDate(user.created_at)}
              </p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">Level {level}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">{user.rep} Rep</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress to Level {level + 1}</span>
                  <span className="font-bold">{user.rep} / {nextLevelRep}</span>
                </div>
                <Progress value={levelProgress} className="h-3 bg-white/30" />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up animation-delay-200">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold">{user.issues_reported}</p>
              <p className="text-sm text-muted-foreground">Issues Reported</p>
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{user.issues_resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{user.total_upvotes}</p>
              <p className="text-sm text-muted-foreground">Total Upvotes</p>
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-600">{user.verifications_done}</p>
              <p className="text-sm text-muted-foreground">Verifications</p>
            </div>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="p-8 animate-fade-in-up animation-delay-400 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Badges & Achievements</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BADGES.map((badge) => {
              const Icon = badge.icon;
              const earned = badge.check(user);
              const progress = badge.progress(user);
              return (
                <Card
                  key={badge.id}
                  className={`p-6 transition-all duration-300 ${
                    earned
                      ? "border-2 border-primary shadow-lg hover:shadow-xl hover:-translate-y-1"
                      : "opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-16 w-16 rounded-2xl ${badge.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-8 w-8 ${badge.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg mb-1">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {badge.description}
                      </p>
                      {earned ? (
                        <Badge className="bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Earned
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span className="font-semibold">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-48 w-full mb-8 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </main>
    </div>
  );
}
