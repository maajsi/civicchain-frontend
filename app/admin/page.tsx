"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clientApi from "@/lib/client-api";
import { getUserRole } from "@/lib/auth";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Settings,
  Bell,
  ChevronDown,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/header/user-menu";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("issues");
  const [timeFilter, setTimeFilter] = useState("This Week");

  // 🚨 TEMPORARY: Force government role for testing - REMOVE THIS IN PRODUCTION
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('civicchain_user_role', 'government');
    }
  }, []);

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
              <IssuesTab issues={dashboardData?.heatmap_data || []} stats={stats} />
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <AnalyticsTab stats={stats} categoryBreakdown={dashboardData?.stats?.category_breakdown || []} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Issues Tab Component
function IssuesTab({ issues, stats }: { issues: any[]; stats: any }) {
  const [statusFilter, setStatusFilter] = useState("all");
  
  const mockIssues = [
    {
      id: "1",
      title: "Large pothole on Main Street",
      location: "Main Street, Sector 5",
      status: "open",
      priority: 95,
      assignedTeam: "Unassigned",
      image: "/api/placeholder/80/80",
      category: "pothole"
    },
    {
      id: "2",
      title: "Garbage overflow at market area",
      location: "Market Road, Sector 3",
      status: "in-progress",
      priority: 88,
      assignedTeam: "Team B - Sanitation",
      image: "/api/placeholder/80/80",
      category: "garbage"
    },
    {
      id: "3",
      title: "Water pipeline leak causing flooding",
      location: "Highway Junction, Sector 2",
      status: "in-progress",
      priority: 92,
      assignedTeam: "Team C - Water",
      image: "/api/placeholder/80/80",
      category: "water"
    },
    {
      id: "4",
      title: "Streetlights not working for a week",
      location: "Park Avenue, Sector 7",
      status: "resolved",
      priority: 79,
      assignedTeam: "Team D - Electrical",
      image: "/api/placeholder/80/80",
      category: "streetlight"
    },
    {
      id: "5",
      title: "Broken drainage cover dangerous",
      location: "Lake Road, Sector 6",
      status: "open",
      priority: 86,
      assignedTeam: "Unassigned",
      image: "/api/placeholder/80/80",
      category: "drainage"
    }
  ];

  const filteredIssues = statusFilter === "all" 
    ? mockIssues 
    : mockIssues.filter(issue => issue.status === statusFilter);

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
              <p className="text-2xl font-bold">{stats.open_issues || 0}</p>
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
              <p className="text-2xl font-bold">{stats.in_progress_issues || 0}</p>
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
              <p className="text-2xl font-bold">{stats.resolved_issues || 0}</p>
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
              <p className="text-2xl font-bold">{stats.total_issues || 0}</p>
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
        <Button 
          variant={statusFilter === "resolved" ? "default" : "outline"}
          onClick={() => setStatusFilter("resolved")}
          className="transition-all duration-300"
        >
          Resolved
        </Button>
      </div>

      {/* Issues Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ISSUE</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">STATUS</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">PRIORITY</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ASSIGNED TEAM</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredIssues.map((issue, index) => (
                <tr 
                  key={issue.id} 
                  className="hover:bg-muted/30 transition-colors duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={issue.image} 
                        alt={issue.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{issue.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          {issue.location}
                        </p>
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
                      <span className="leading-none">{issue.status.replace("-", " ")}</span>
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
                    <span className="text-sm text-muted-foreground italic">
                      {issue.assignedTeam}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredIssues.length} of {mockIssues.length} issues
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ stats, categoryBreakdown }: { stats: any; categoryBreakdown: any[] }) {
  return (
    <div className="space-y-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Issues</p>
              <p className="text-3xl font-bold text-foreground">{stats.total_issues || 1250}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  12%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Resolution Rate</p>
              <p className="text-3xl font-bold text-foreground">87%</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  8%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold text-foreground">3.2d</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-red-500 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  3%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Satisfaction Score</p>
              <p className="text-3xl font-bold text-foreground">4.3/5</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  5%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Category */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Issues by Category
            </h3>
            <button className="text-sm text-primary hover:underline">View Details</button>
          </div>
          <div className="space-y-4">
            {[
              { name: "Potholes", count: 342, percentage: 32, color: "bg-orange-500" },
              { name: "Garbage", count: 289, percentage: 27, color: "bg-green-500" },
              { name: "Streetlights", count: 187, percentage: 17, color: "bg-yellow-500" },
              { name: "Water", count: 156, percentage: 15, color: "bg-blue-500" },
              { name: "Other", count: 98, percentage: 9, color: "bg-gray-500" }
            ].map((category, index) => (
              <div key={category.name} className="space-y-2 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{category.count}</span>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">{category.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${category.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Issue Trends */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Issue Trends Over Time
            </h3>
            <button className="text-sm text-primary hover:underline">View Details</button>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month, index) => {
              const heights = [40, 65, 45, 80, 60, 70, 55];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="w-full bg-gradient-to-t from-primary to-chart-2 rounded-t-lg transition-all duration-1000 hover:scale-105" style={{ height: `${heights[index]}%` }}></div>
                  <span className="text-xs text-muted-foreground">{month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Resolution Rates by Ward */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Resolution Rates by Ward
          </h3>
          <select className="px-4 py-2 border rounded-lg text-sm">
            <option>All Wards</option>
            <option>Ward 1-4</option>
            <option>Ward 5-8</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { ward: "Ward 1", rate: 87, color: "bg-blue-500" },
            { ward: "Ward 2", rate: 92, color: "bg-green-500" },
            { ward: "Ward 3", rate: 78, color: "bg-yellow-500" },
            { ward: "Ward 4", rate: 85, color: "bg-blue-500" },
            { ward: "Ward 5", rate: 94, color: "bg-green-500" },
            { ward: "Ward 6", rate: 81, color: "bg-blue-500" },
            { ward: "Ward 7", rate: 88, color: "bg-blue-500" },
            { ward: "Ward 8", rate: 76, color: "bg-orange-500" }
          ].map((ward, index) => (
            <Card key={ward.ward} className="p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex flex-col items-center text-center">
                <p className="text-sm text-muted-foreground mb-2">{ward.ward}</p>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${ward.color} text-white font-bold text-xl mb-2`}>
                  {ward.rate}%
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div className={`h-full ${ward.color} transition-all duration-1000`} style={{ width: `${ward.rate}%` }}></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Citizen Feedback */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Citizen Feedback
          </h3>
          <span className="text-sm text-muted-foreground">Average NPS: <span className="text-green-500 font-semibold">+42</span></span>
        </div>
        <div className="space-y-4">
          {[
            { issue: "Pothole on Main Street", ward: "Ward 5", date: "2024-01-18", rating: 5, feedback: "Excellent work! The pothole was fixed within 3 days. Very satisfied with the response time." },
            { issue: "Garbage overflow", ward: "Ward 3", date: "2024-01-17", rating: 4, feedback: "Good work, but took a bit longer than expected. Overall happy with the resolution." },
            { issue: "Street light repair", ward: "Ward 7", date: "2024-01-16", rating: 3, feedback: "Issue resolved but communication could have been better." }
          ].map((feedback, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-foreground">{feedback.issue}</p>
                  <p className="text-sm text-muted-foreground">{feedback.ward} • {feedback.date}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < feedback.rating ? "text-yellow-500" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{feedback.feedback}</p>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 py-3 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium">
          View All Feedback
        </button>
      </Card>

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
