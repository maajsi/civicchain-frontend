"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, CheckCircle, Star} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import clientApi from "@/lib/client-api";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

export function ProfileModal({ open, onClose, userId }: ProfileModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const endpoint = userId ? `/user/${userId}` : "/user/me";
      const response = await clientApi.get(endpoint);
      return response.data.user;
    },
    enabled: open,
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <p>Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const profile = data || {
    name: "User",
    profile_pic: "",
    rep: 0,
    created_at: new Date().toISOString(),
    issues_reported: 0,
    issues_resolved: 0,
    total_upvotes: 0,
    verifications_done: 0,
    badges: [],
  };

  const level = Math.floor(profile.rep / 100);
  const levelProgress = (profile.rep % 100);
  const nextLevelRep = (level + 1) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <h2 className="text-xl font-semibold">Profile & Reputation</h2>
        </DialogHeader>

        {/* Header Card */}
        <Card className="bg-gradient-to-br from-primary to-chart-2 text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white">
                  <AvatarImage src={profile.profile_pic} />
                  <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-yellow-900">
                  {level}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold">{profile.name}</h3>
                <p className="text-blue-100 text-sm">
                  Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
                    ⭐ Level {level}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
                    ⚡ {profile.rep} Rep
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress to Level {level + 1}</span>
                    <span className="font-semibold">{profile.rep}/{nextLevelRep}</span>
                  </div>
                  <Progress value={levelProgress} className="bg-white/20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Issues Reported" value={profile.issues_reported} icon="📋" />
          <StatCard label="Resolved" value={profile.issues_resolved} icon="✅" valueColor="text-green-600" />
          <StatCard label="Total Upvotes" value={profile.total_upvotes} icon="👍" valueColor="text-blue-600" />
          <StatCard label="Verifications" value={profile.verifications_done} icon="🔍" valueColor="text-purple-600" />
        </div>

        {/* Badges Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badges & Achievements
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <BadgeCard
              title="Top Reporter"
              description="Reported 50+ issues"
              icon={<Trophy className="h-8 w-8 text-yellow-500" />}
              earned={profile.badges.includes("Top Reporter")}
              progress={Math.min(100, (profile.issues_reported / 50) * 100)}
            />
            <BadgeCard
              title="Verifier"
              description="Verified 25 resolved issues"
              icon={<CheckCircle className="h-8 w-8 text-green-500" />}
              earned={profile.badges.includes("Verifier")}
              progress={Math.min(100, (profile.verifications_done / 25) * 100)}
            />
            <BadgeCard
              title="Community Hero"
              description="Received 500+ upvotes"
              icon={<Star className="h-8 w-8 text-blue-500" />}
              earned={profile.badges.includes("Community Hero")}
              progress={Math.min(100, (profile.total_upvotes / 500) * 100)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value, icon, valueColor = "text-foreground" }: { label: string; value: number; icon: string; valueColor?: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="text-2xl mb-1">{icon}</div>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function BadgeCard({ title, description, icon, earned, progress }: { title: string; description: string; icon: React.ReactNode; earned: boolean; progress: number }) {
  return (
    <Card className={earned ? "border-primary" : "opacity-60"}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center gap-2">
          {icon}
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
          {earned ? (
            <Badge variant="default" className="mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Earned
            </Badge>
          ) : (
            <div className="w-full">
              <p className="text-xs text-muted-foreground mb-1">Progress</p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
