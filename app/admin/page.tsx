"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import clientApi from "@/lib/client-api";
import { getUserRole } from "@/lib/auth";
import { toast } from "sonner";
import { showTxToast } from "@/lib/toast";
import { useReverseGeocode } from "@/hooks/use-reverse-geocode";
import { 
  FileText, 
  BarChart3, 
  ChevronDown,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Menu,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/header/user-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { 
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("issues");
  const [timeFilter] = useState("This Week");
  const [sidebarOpen, setSidebarOpen] = useState(false);


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
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 border-r bg-card flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
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
            <button 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab("issues");
              setSidebarOpen(false);
            }}
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
            onClick={() => {
              setActiveTab("analytics");
              setSidebarOpen(false);
            }}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-30">
          <div className="px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Mobile Menu Button */}
                <button 
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <div className="hidden md:flex w-12 h-12 bg-gradient-to-br from-primary to-chart-2 rounded-2xl items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">CivicChain Admin</h1>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Greater Hyderabad Municipal Corporation</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* Content Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {activeTab === "issues" ? "Issues Management" : "Analytics Dashboard"}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  {activeTab === "issues" 
                    ? "Manage and track all civic infrastructure issues" 
                    : "Performance insights and trends"}
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                <button className="flex items-center gap-2 px-3 md:px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm">
                  <span className="font-medium">{timeFilter}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex-1 sm:flex-initial">
                        <Button disabled className="w-full sm:w-auto flex items-center gap-2 opacity-60 cursor-not-allowed text-sm">
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Coming Soon</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* ISSUES TAB */}
            {activeTab === "issues" && (
              <div key="issues-tab">
                <IssuesTab issues={dashboardData?.top_priority_issues || []} stats={stats} />
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <div key="analytics-tab">
                <AnalyticsTab stats={stats} categoryBreakdown={stats?.category_breakdown || []} />
              </div>
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
    lat: issue.lat,
    lng: issue.lng,
    region: issue.region,
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

      {/* Issues Table - Desktop */}
      <Card className="overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ISSUE</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">STATUS</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">PRIORITY</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">REPORTED BY</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">VIEW</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">UPDATE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
                      <p className="text-lg font-semibold text-muted-foreground">No issues found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue, index) => (
                  <IssueRow key={issue.id} issue={issue} index={index} />
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

      {/* Issues Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredIssues.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-lg font-semibold text-muted-foreground">No issues found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          </Card>
        ) : (
          <>
            {filteredIssues.map((issue, index) => (
              <IssueCard key={issue.id} issue={issue} index={index} />
            ))}
            <Card className="p-4 bg-muted/20">
              <p className="text-sm text-muted-foreground text-center">
                Showing {filteredIssues.length} of {apiIssues.length} top priority issues
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Total issues: {displayStats.total_issues}
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// Issue Row Component with Reverse Geocoding
type IssueRowData = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  region: string;
  status: string;
  priority: number;
  image: string;
  upvotes: number;
  downvotes: number;
  reporter: string;
};

function IssueRow({ issue, index }: { issue: IssueRowData; index: number }) {
  const { address } = useReverseGeocode(issue.lat, issue.lng);
  const displayLocation = address !== "Unknown location" ? address : issue.region || `${issue.lat.toFixed(4)}, ${issue.lng.toFixed(4)}`;

  return (
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
              {displayLocation}
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
        <span className="text-sm font-medium text-foreground">{issue.reporter}</span>
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
      <td className="px-6 py-4">
        <UpdateStatusButton issueId={issue.id} currentStatus={issue.status} />
      </td>
    </tr>
  );
}

// Mobile Issue Card Component
function IssueCard({ issue, index }: { issue: IssueRowData; index: number }) {
  const { address } = useReverseGeocode(issue.lat, issue.lng);
  const displayLocation = address !== "Unknown location" ? address : issue.region || `${issue.lat.toFixed(4)}, ${issue.lng.toFixed(4)}`;

  return (
    <Card 
      className="p-4 hover:shadow-md transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="space-y-4">
        {/* Issue Header */}
        <div className="flex gap-3">
          <Image 
            src={issue.image} 
            alt={issue.title}
            width={80}
            height={80}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground line-clamp-2">{issue.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="truncate">{displayLocation}</span>
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
          <span className="ml-auto">
            Reported by: <span className="font-medium text-foreground">{issue.reporter}</span>
          </span>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            issue.status === "open" 
              ? "bg-red-500/10 text-red-600" 
              : issue.status === "in-progress"
              ? "bg-blue-500/10 text-blue-600"
              : "bg-green-500/10 text-green-600"
          }`}>
            {issue.status === "open" && <AlertCircle className="w-3 h-3 flex-shrink-0" />}
            {issue.status === "in-progress" && <Clock className="w-3 h-3 flex-shrink-0" />}
            {issue.status === "resolved" && <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
            <span className="capitalize">{issue.status.replace("-", " ")}</span>
          </span>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
            issue.priority >= 90 ? "bg-red-500 text-white" :
            issue.priority >= 80 ? "bg-orange-500 text-white" :
            "bg-yellow-500 text-white"
          }`}>
            {issue.priority}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Link href={`/issue/${issue.id}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-primary border border-primary/20 hover:bg-primary/10 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
          </Link>
          <div className="flex-1">
            <UpdateStatusButton issueId={issue.id} currentStatus={issue.status} />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Update Status Button Component
function UpdateStatusButton({ issueId, currentStatus }: { issueId: string; currentStatus: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(currentStatus);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string; proofImage?: File }) => {
      if (data.proofImage) {
        const formData = new FormData();
        formData.append("status", data.status);
        formData.append("proof", data.proofImage);
        
        const response = await clientApi.post(`/issue/${issueId}/update-status`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } else {
        const response = await clientApi.post(`/issue/${issueId}/update-status`, {
          status: data.status,
        });
        return response.data;
      }
    },
    onSuccess: (data) => {
      showTxToast("Status updated successfully!", data?.blockchain_tx_hash || data?.transaction_hash);
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setIsOpen(false);
      setProofImage(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update status", {
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    if (newStatus === currentStatus && !proofImage) {
      toast.info("No changes made");
      return;
    }
    
    updateStatusMutation.mutate({ status: newStatus, proofImage: proofImage || undefined });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Update
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Issue Status</DialogTitle>
            <DialogDescription>
              Change the status of this issue and optionally attach proof image. This will be recorded on the blockchain.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status</label>
              <div className="px-3 py-2 bg-muted rounded-lg">
                <span className="text-sm capitalize">{currentStatus.replace("-", " ")}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Proof Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              {proofImage && (
                <p className="text-xs text-muted-foreground">
                  Selected: {proofImage.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setNewStatus(currentStatus);
                setProofImage(null);
              }}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
  
  // Prepare chart data
  const categoryChartData = categoryBreakdown.map((cat) => ({
    category: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
    count: cat.count,
  }));

  const statusChartData = [
    { status: "Open", count: stats.open_issues || 0, fill: "hsl(var(--chart-1))" },
    { status: "In Progress", count: stats.in_progress_issues || 0, fill: "hsl(var(--chart-2))" },
    { status: "Resolved", count: stats.resolved_issues || 0, fill: "hsl(var(--chart-3))" },
    { status: "Closed", count: stats.closed_issues || 0, fill: "hsl(var(--chart-4))" },
  ].filter(item => item.count > 0);

  const statusChartConfig = {
    count: {
      label: "Issues",
    },
    open: {
      label: "Open",
      color: "hsl(var(--chart-1))",
    },
    inProgress: {
      label: "In Progress",
      color: "hsl(var(--chart-2))",
    },
    resolved: {
      label: "Resolved",
      color: "hsl(var(--chart-3))",
    },
    closed: {
      label: "Closed",
      color: "hsl(var(--chart-4))",
    },
  };
  
  return (
    <div className="space-y-8">
      {/* Top Stats Grid with Claymorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
            className={`relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-background via-card/80 to-secondary/30 p-4 md:p-6 shadow-xl backdrop-blur-sm border border-border/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up ${
              hoveredCard === stat.label ? "ring-2 ring-primary/50" : ""
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg transform transition-transform duration-300 ${hoveredCard === stat.label ? "scale-110 rotate-3" : ""}`}>
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 font-medium">{stat.label}</p>
                <p className="text-2xl md:text-4xl font-bold text-foreground mb-1 transition-all duration-300">{stat.value}</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: "Open Issues", value: openPercentage, total: 100, color: "text-red-500", strokeColor: "#ef4444", strokeColorEnd: "#f43f5e", count: stats.open_issues || 0 },
          { label: "In Progress", value: inProgressPercentage, total: 100, color: "text-blue-500", strokeColor: "#3b82f6", strokeColorEnd: "#4f46e5", count: stats.in_progress_issues || 0 },
          { label: "Resolved", value: resolutionRate, total: 100, color: "text-green-500", strokeColor: "#10b981", strokeColorEnd: "#059669", count: stats.resolved_issues || 0 },
          { label: "Closed", value: totalIssues > 0 ? Math.round(((stats.closed_issues || 0) / totalIssues) * 100) : 0, total: 100, color: "text-gray-500", strokeColor: "#6b7280", strokeColorEnd: "#4b5563", count: stats.closed_issues || 0 }
        ].map((item, index) => (
          <div
            key={item.label}
            className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-card/90 via-background/50 to-secondary/20 p-4 md:p-6 shadow-xl border border-border/50 backdrop-blur-sm hover:scale-105 transition-all duration-500 animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 md:w-32 md:h-32 mb-3 md:mb-4">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <defs>
                    <linearGradient id={`radial-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={item.strokeColor} />
                      <stop offset="100%" stopColor={item.strokeColorEnd} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-muted/30"
                  />
                  {/* Only render progress arc if value > 0 */}
                  {item.value > 0 && (
                    <circle
                      cx="50%"
                      cy="50%"
                      r="42%"
                      stroke={`url(#radial-gradient-${index})`}
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(item.value / item.total) * 264} 264`}
                      className="transition-all duration-1000 ease-out drop-shadow-lg"
                    />
                  )}
                </svg>
                {/* Center Value */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl md:text-3xl font-bold ${item.color}`}>{item.value}%</span>
                </div>
              </div>
              <p className="text-xs md:text-sm font-semibold text-foreground text-center">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.count} issues</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Issues by Category - Bar Chart */}
        <Card className="p-4 md:p-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-chart-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="text-base md:text-xl">Issues by Category</span>
            </h3>
          </div>
          {categoryChartData.length > 0 ? (
            <div className="space-y-3 md:space-y-5">
              {(() => {
                const categoryColors: Record<string, { bg: string; text: string }> = {
                  pothole: { bg: "bg-orange-500", text: "text-orange-500" },
                  garbage: { bg: "bg-green-500", text: "text-green-500" },
                  streetlight: { bg: "bg-yellow-500", text: "text-yellow-500" },
                  water: { bg: "bg-blue-500", text: "text-blue-500" },
                  other: { bg: "bg-gray-500", text: "text-gray-500" }
                };
                
                const totalCategoryCount = categoryBreakdown.reduce((sum, cat) => sum + cat.count, 0);
                
                return categoryBreakdown.length > 0 ? categoryBreakdown.map((category, index) => {
                  const percentage = totalCategoryCount > 0 ? Math.round((category.count / totalCategoryCount) * 100) : 0;
                  const colors = categoryColors[category.category.toLowerCase()] || categoryColors.other;
                  
                  return (
                    <div key={category.category} className="space-y-2 md:space-y-3 group animate-fade-in-up hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${colors.bg} animate-pulse flex-shrink-0`}></div>
                          <span className="text-xs md:text-sm font-semibold text-foreground capitalize truncate">{category.category}</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
                          <span className="text-xs md:text-sm text-muted-foreground font-medium whitespace-nowrap">{category.count}</span>
                          <span className={`text-sm md:text-base font-bold ${colors.text} w-10 md:w-14 text-right`}>{percentage}%</span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 md:h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
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
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No category data available</p>
            </div>
          )}
        </Card>

        {/* Status Breakdown - Pie Chart */}
        <Card className="p-4 md:p-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-chart-3 to-chart-4">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-base md:text-xl">Status Breakdown</span>
            </h3>
          </div>
          {statusChartData.length > 0 ? (
            <ChartContainer config={statusChartConfig} className="h-[300px] md:h-[400px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={statusChartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No status data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Citizen Feedback - Coming Soon */}
      <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-card/90 via-background/50 to-secondary/20 p-4 md:p-8 shadow-xl border border-border/50 backdrop-blur-sm overflow-hidden">
        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none select-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2 md:gap-3">
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
      <Card className="p-4 md:p-8 bg-gradient-to-r from-primary to-chart-2 text-white hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">Download Detailed Reports</h3>
            <p className="text-sm md:text-base text-white/80">Export comprehensive analytics data in CSV or PDF format</p>
          </div>
          <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1 sm:flex-initial">
                    <Button disabled variant="secondary" className="w-full sm:w-auto bg-white/60 text-primary/60 cursor-not-allowed text-sm">
                      Export CSV
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coming Soon</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1 sm:flex-initial">
                    <Button disabled variant="secondary" className="w-full sm:w-auto bg-white/40 text-white/60 cursor-not-allowed backdrop-blur-sm text-sm">
                      Export PDF
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coming Soon</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>
    </div>
  );
}
