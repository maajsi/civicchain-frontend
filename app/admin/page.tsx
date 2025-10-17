"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clientApi from "@/lib/client-api";
import { getUserRole } from "@/lib/auth";
import { toast } from "sonner";
import { 
  FileText, 
  BarChart3, 
  Bell,
  ChevronDown,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/header/user-menu";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("issues");
  const [timeFilter] = useState("This Week");


  // Check if user is authorized
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      const userRole = getUserRole();
      if (userRole !== "government") {
        toast.error("Access denied. Government role required.");
        router.push("/users");
      }
    }
  }, [status, router]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await clientApi.get("/admin/dashboard");
      return response.data;
    },
    enabled: status === "authenticated" && getUserRole() === "government",
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || getUserRole() !== "government") {
    return null;
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-2 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">CivicChain</h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("issues")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "issues"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <FileText className="w-5 h-5" />
            Issues
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "analytics"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-white font-semibold">
              {session.user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin User</p>
              <p className="text-xs text-muted-foreground">Super Administrator</p>
            </div>
          </div>
          <button
            onClick={() => {
              toast.info("Logout functionality");
            }}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-2 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">CivicChain Admin</h1>
                  <p className="text-sm text-muted-foreground">Greater Hyderabad Municipal Corporation</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Content Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  {activeTab === "issues" ? "Issues Management" : "Analytics Dashboard"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {activeTab === "issues" 
                    ? "Manage and track all civic infrastructure issues" 
                    : "Performance insights and trends"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                  <span className="text-sm font-medium">{timeFilter}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <Button className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* ISSUES TAB */}
            {activeTab === "issues" && (
              <IssuesTab issues={dashboardData?.top_priority_issues || []} stats={stats} />
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <AnalyticsTab stats={stats} categoryBreakdown={stats?.category_breakdown || []} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Issues Tab Component
import Image from "next/image";
import Link from "next/link";

type TopPriorityIssue = {
  issue_id: string;
  reporter_user_id: string;
  reporter_name: string;
  reporter_profile_pic: string;
  image_url: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  region: string;
  status: string;
  priority_score: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
};

type Stats = {
  open_issues?: number;
  in_progress_issues?: number;
  resolved_issues?: number;
  total_issues?: number;
  closed_issues?: number;
  total_citizens?: number;
  avg_priority?: string;
};

function IssuesTab({ issues, stats }: { issues: TopPriorityIssue[]; stats: Stats }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://152.42.157.189:3000';
  
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder-issue.png';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  // Map API issues to display format
  const apiIssues = issues.map(issue => ({
    id: issue.issue_id,
    title: issue.description.substring(0, 60) + (issue.description.length > 60 ? '...' : ''),
    location: issue.region || `${issue.lat.toFixed(4)}, ${issue.lng.toFixed(4)}`,
    status: issue.status.toLowerCase().replace('_', '-') as "open" | "in-progress" | "resolved",
    priority: Math.round(issue.priority_score),
    assignedTeam: "Unassigned", // Not provided by API
    image: getImageUrl(issue.image_url),
    category: issue.category,
    fullDescription: issue.description,
    upvotes: issue.upvotes,
    downvotes: issue.downvotes,
    reporter: issue.reporter_name,
  }));

  const filteredIssues = statusFilter === "all" 
    ? apiIssues.filter(issue => issue.status !== "resolved") 
    : apiIssues.filter(issue => issue.status === statusFilter && issue.status !== "resolved");

  // Use real stats from API
  const displayStats = {
    open_issues: stats?.open_issues ?? 0,
    in_progress_issues: stats?.in_progress_issues ?? 0,
    resolved_issues: stats?.resolved_issues ?? 0,
    total_issues: stats?.total_issues ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold">{displayStats.open_issues}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{displayStats.in_progress_issues}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold">{displayStats.resolved_issues}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{displayStats.total_issues}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button 
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
          className="transition-all duration-300"
        >
          All Issues
        </Button>
        <Button 
          variant={statusFilter === "open" ? "default" : "outline"}
          onClick={() => setStatusFilter("open")}
          className="transition-all duration-300"
        >
          Open
        </Button>
        <Button 
          variant={statusFilter === "in-progress" ? "default" : "outline"}
          onClick={() => setStatusFilter("in-progress")}
          className="transition-all duration-300"
        >
          In Progress
        </Button>
      </div>

      {/* Issues Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ISSUE</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">STATUS</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">PRIORITY</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ASSIGNED TEAM</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
                      <p className="text-lg font-semibold text-muted-foreground">No issues found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue, index) => (
                  <tr 
                    key={issue.id} 
                    className="hover:bg-muted/30 transition-colors duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Image 
                          src={issue.image} 
                          alt={issue.title}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="max-w-md">
                          <p className="font-semibold text-foreground line-clamp-1">{issue.title}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            {issue.location}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              {issue.upvotes}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                              {issue.downvotes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        issue.status === "open" 
                          ? "bg-red-500/10 text-red-600" 
                          : issue.status === "in-progress"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-green-500/10 text-green-600"
                      }`}>
                        {issue.status === "open" && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                        {issue.status === "in-progress" && <Clock className="w-3.5 h-3.5 flex-shrink-0" />}
                        {issue.status === "resolved" && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span className="leading-none capitalize">{issue.status.replace("-", " ")}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                          issue.priority >= 90 ? "bg-red-500 text-white" :
                          issue.priority >= 80 ? "bg-orange-500 text-white" :
                          "bg-yellow-500 text-white"
                        }`}>
                          {issue.priority}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        Reported by <span className="font-medium text-foreground">{issue.reporter}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/issue/${issue.id}`}>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredIssues.length} of {apiIssues.length} top priority issues
            </p>
            <p className="text-xs text-muted-foreground">
              Total issues in system: {displayStats.total_issues}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Analytics Tab Component
type CategoryBreakdown = {
  category: string;
  count: number;
};

function AnalyticsTab({ stats, categoryBreakdown }: { stats: Stats; categoryBreakdown: CategoryBreakdown[] }) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Calculate resolution rate
  const totalIssues = stats.total_issues || 0;
  const resolvedIssues = stats.resolved_issues || 0;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
  
  // Calculate percentages for radial charts
  const openPercentage = totalIssues > 0 ? Math.round(((stats.open_issues || 0) / totalIssues) * 100) : 0;
  const inProgressPercentage = totalIssues > 0 ? Math.round(((stats.in_progress_issues || 0) / totalIssues) * 100) : 0;
  
  return (
    <div className="space-y-8">
      {/* Top Stats Grid with Claymorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Issues", value: stats.total_issues || 0, valueType: "number", icon: BarChart3, color: "blue", gradient: "from-blue-500 to-blue-600" },
          { label: "Total Citizens", value: stats.total_citizens || 0, valueType: "number", icon: CheckCircle2, color: "green", gradient: "from-green-500 to-emerald-600" },
          { label: "Avg Priority", value: stats.avg_priority ? parseFloat(stats.avg_priority).toFixed(1) : "0", valueType: "string", icon: Clock, color: "purple", gradient: "from-purple-500 to-violet-600" },
          { label: "Resolution Rate", value: `${resolutionRate}%`, valueType: "string", icon: AlertCircle, color: "orange", gradient: "from-orange-500 to-amber-600" }
        ].map((stat, index) => (
          <div
            key={stat.label}
            onMouseEnter={() => setHoveredCard(stat.label)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-card/80 to-secondary/30 p-6 shadow-xl backdrop-blur-sm border border-border/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up ${
              hoveredCard === stat.label ? "ring-2 ring-primary/50" : ""
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg transform transition-transform duration-300 ${hoveredCard === stat.label ? "scale-110 rotate-3" : ""}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">{stat.label}</p>
                <p className="text-4xl font-bold text-foreground mb-1 transition-all duration-300">{stat.value}</p>
                <p className="text-xs text-muted-foreground">Real-time data</p>
              </div>
            </div>
            
            {/* Shimmer Effect on Hover */}
            {hoveredCard === stat.label && (
              <div className="absolute inset-0 animate-shimmer"></div>
            )}
          </div>
        ))}
      </div>

      {/* Radial Progress Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Open Issues", value: openPercentage, total: 100, color: "text-red-500", strokeColor: "#ef4444", strokeColorEnd: "#f43f5e", count: stats.open_issues || 0 },
          { label: "In Progress", value: inProgressPercentage, total: 100, color: "text-blue-500", strokeColor: "#3b82f6", strokeColorEnd: "#4f46e5", count: stats.in_progress_issues || 0 },
          { label: "Resolved", value: resolutionRate, total: 100, color: "text-green-500", strokeColor: "#10b981", strokeColorEnd: "#059669", count: stats.resolved_issues || 0 },
          { label: "Closed", value: totalIssues > 0 ? Math.round(((stats.closed_issues || 0) / totalIssues) * 100) : 0, total: 100, color: "text-gray-500", strokeColor: "#6b7280", strokeColorEnd: "#4b5563", count: stats.closed_issues || 0 }
        ].map((item, index) => (
          <div
            key={item.label}
            className="relative rounded-3xl bg-gradient-to-br from-card/90 via-background/50 to-secondary/20 p-6 shadow-xl border border-border/50 backdrop-blur-sm hover:scale-105 transition-all duration-500 animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <defs>
                    <linearGradient id={`radial-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={item.strokeColor} />
                      <stop offset="100%" stopColor={item.strokeColorEnd} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted/30"
                  />
                  {/* Animated Progress Circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={`url(#radial-gradient-${index})`}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(item.value / item.total) * 351.86} 351.86`}
                    className="transition-all duration-1000 ease-out drop-shadow-lg"
                  />
                </svg>
                {/* Center Value */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${item.color}`}>{item.value}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground text-center">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.count} issues</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Category - Enhanced */}
        <div className="rounded-3xl bg-gradient-to-br from-card/90 via-background/50 to-secondary/20 p-8 shadow-xl border border-border/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-chart-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              Issues by Category
            </h3>
          </div>
          <div className="space-y-5">
            {(() => {
              const categoryColors: Record<string, { bg: string; text: string }> = {
                pothole: { bg: "bg-orange-500", text: "text-orange-500" },
                garbage: { bg: "bg-green-500", text: "text-green-500" },
                streetlight: { bg: "bg-yellow-500", text: "text-yellow-500" },
                water: { bg: "bg-blue-500", text: "text-blue-500" },
                drainage: { bg: "bg-cyan-500", text: "text-cyan-500" },
                other: { bg: "bg-gray-500", text: "text-gray-500" }
              };
              
              const totalCategoryCount = categoryBreakdown.reduce((sum, cat) => sum + cat.count, 0);
              
              return categoryBreakdown.length > 0 ? categoryBreakdown.map((category, index) => {
                const percentage = totalCategoryCount > 0 ? Math.round((category.count / totalCategoryCount) * 100) : 0;
                const colors = categoryColors[category.category.toLowerCase()] || categoryColors.other;
                
                return (
                  <div key={category.category} className="space-y-3 group animate-fade-in-up hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${colors.bg} animate-pulse`}></div>
                        <span className="text-sm font-semibold text-foreground capitalize">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-muted-foreground font-medium">{category.count} issues</span>
                        <span className={`text-base font-bold ${colors.text} w-14 text-right`}>{percentage}%</span>
                      </div>
                    </div>
                    <div className="relative w-full h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`absolute h-full ${colors.bg} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                        style={{ 
                          width: `${percentage}%`,
                        }}
                      >
                        <div className="absolute inset-0 animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No category data available</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Issue Trends - Enhanced */}
        <div className="rounded-3xl bg-gradient-to-br from-card/90 via-background/50 to-secondary/20 p-8 shadow-xl border border-border/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-chart-3 to-chart-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              Monthly Issue Trends
            </h3>
            <button className="text-sm text-primary hover:underline font-medium">View All</button>
          </div>
          <div className="h-64 flex items-end justify-between gap-3">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month, index) => {
              const heights = [40, 65, 45, 80, 60, 70, 55];
              const gradients = [
                "from-chart-1 to-chart-2",
                "from-chart-2 to-chart-3",
                "from-chart-3 to-chart-4",
                "from-chart-4 to-chart-5",
                "from-chart-5 to-primary",
                "from-primary to-chart-1",
                "from-chart-1 to-chart-3"
              ];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative w-full rounded-t-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300" style={{ height: `${heights[index]}%` }}>
                    <div className={`absolute inset-0 bg-gradient-to-t ${gradients[index]} group-hover:scale-105 transition-transform duration-300`}>
                      <div className="absolute inset-0 animate-shimmer"></div>
                    </div>
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                      <div className="bg-foreground text-background px-3 py-1 rounded-lg text-xs font-semibold shadow-xl">
                        {Math.round(heights[index] * 1.5)} issues
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Citizen Feedback - Coming Soon */}
      <div className="relative rounded-3xl bg-gradient-to-br from-card/90 via-background/50 to-secondary/20 p-8 shadow-xl border border-border/50 backdrop-blur-sm overflow-hidden">
        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none select-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              Citizen Feedback
            </h3>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="text-sm text-muted-foreground">Average NPS:</span>
              <span className="text-lg text-green-600 font-bold">+42</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { issue: "Pothole on Main Street", ward: "Ward 5", date: "2024-01-18", rating: 5, feedback: "Excellent work! The pothole was fixed within 3 days. Very satisfied with the response time.", color: "from-green-500/10 to-emerald-500/10" },
              { issue: "Garbage overflow", ward: "Ward 3", date: "2024-01-17", rating: 4, feedback: "Good work, but took a bit longer than expected. Overall happy with the resolution.", color: "from-blue-500/10 to-cyan-500/10" },
              { issue: "Street light repair", ward: "Ward 7", date: "2024-01-16", rating: 3, feedback: "Issue resolved but communication could have been better.", color: "from-yellow-500/10 to-orange-500/10" }
            ].map((feedback, index) => (
              <div 
                key={index} 
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${feedback.color} p-5 border border-border/30`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-foreground text-base mb-1">{feedback.issue}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {feedback.ward}
                      <span className="mx-1">•</span>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {feedback.date}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < feedback.rating ? "text-yellow-500" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{feedback.feedback}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 text-sm text-primary rounded-xl font-semibold">
            View All Feedback →
          </button>
        </div>

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md">
          <div className="text-center space-y-6 max-w-md px-8 animate-fade-in-up">
            {/* Animated Icon */}
            <div className="relative mx-auto w-24 h-24 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-chart-2 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                <svg className="w-12 h-12 text-primary animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="inline-block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_100%] animate-gradient blur-xl opacity-60"></div>
                <div className="relative px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-chart-2 shadow-2xl">
                  <span className="text-2xl font-bold text-white tracking-wide">COMING SOON</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h4 className="text-xl font-bold text-foreground">Citizen Feedback Analytics</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track and analyze citizen satisfaction ratings, NPS scores, and detailed feedback to improve service quality and response times.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Launching in Q4 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Reports Section */}
      <Card className="p-8 bg-gradient-to-r from-primary to-chart-2 text-white hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Download Detailed Reports</h3>
            <p className="text-white/80">Export comprehensive analytics data in CSV or PDF format</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Export CSV
            </Button>
            <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
              Export PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
