"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useAppStore } from "@/store/app-store";
import clientApi from "@/lib/client-api";
import { authenticateWithBackend, getUserRole } from "@/lib/auth";
import { toast } from "sonner";

import { IssueCard } from "@/components/issues/issue-card";
import { SearchFilterBar } from "@/components/issues/search-filter-bar";
import { FABCreateIssue } from "@/components/issues/fab-create-issue";
import { CreateIssueModal } from "@/components/modals/create-issue-modal";
import { NotificationBell } from "@/components/header/notification-bell";
import { UserMenu } from "@/components/header/user-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { coordinates, loading: geoLoading } = useGeolocation();
  const { setLocation } = useAppStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // 🚨 TEMPORARY: Force government role for testing - REMOVE THIS IN PRODUCTION
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('civicchain_user_role', 'government');
    }
  }, []);

  // Immediate redirect check for government users
  useEffect(() => {
    const userRole = getUserRole();
    if (userRole === 'government' && status === 'authenticated') {
      router.push('/admin');
    }
  }, [router, status]);

  // Authenticate with backend when session is available (only run once)
  useEffect(() => {
    let isMounted = true;


    const doBackendAuth = async () => {
      if (status === "authenticated" && session?.user && isMounted) {
        try {
          console.log("Attempting backend authentication...");
          const response = await authenticateWithBackend();
          if (!isMounted) return;
          if (response.success) {
            console.log("Backend authentication successful:", response);
            
            // Check user role and redirect if government user
            const userRole = getUserRole();
            if (userRole === 'government') {
              router.push('/admin');
              return;
            }
            
            if (response.is_new) {
              toast.success("Welcome to CivicChain! 🎉");
            } else {
              toast.success("Welcome back!");
            }
          } else {
            console.error("Backend auth failed - no success flag");
            toast.error("Backend authentication failed");
          }
        } catch (error: any) {
          if (!isMounted) return;
          console.error("Backend authentication error:", error);
          const errorMsg = error.response?.data?.error || error.message || "Failed to authenticate with backend";
          toast.error(`Auth Error: ${errorMsg}`);
        } finally {
          if (isMounted) setIsAuthenticating(false);
        }
      } else if (status === "unauthenticated") {
        if (isMounted) router.push("/");
      } else if (status === "loading") {
        if (isMounted) setIsAuthenticating(true);
      } else {
        if (isMounted) setIsAuthenticating(false);
      }
    };

    doBackendAuth();

    return () => {
      isMounted = false;
    };
  }, [status, session?.user?.email, router]); // Only re-run if status or user email changes

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (coordinates) {
      setLocation(coordinates);
    }
  }, [coordinates, setLocation]);

  // Fetch nearby issues
  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ["issues", coordinates?.lat, coordinates?.lng, searchQuery],
    queryFn: async () => {
      if (!coordinates) return null;
      
      const response = await clientApi.get("/issues", {
        params: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          radius: 5000, // 5km
          // Don't send status filter - backend returns all by default
        },
      });
      return response.data;
    },
    enabled: !!coordinates && !isAuthenticating, // Wait for auth to complete
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const response = await clientApi.post(`/issues/${issueId}/upvote`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Upvoted successfully!");
    },
    onError: () => {
      toast.error("Failed to upvote");
    },
  });

  // Downvote mutation
  const downvoteMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const response = await clientApi.post(`/issues/${issueId}/downvote`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Downvoted");
    },
    onError: () => {
      toast.error("Failed to downvote");
    },
  });

  const handleUpvote = (id: string) => {
    upvoteMutation.mutate(id);
  };

  const handleDownvote = (id: string) => {
    downvoteMutation.mutate(id);
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/issue/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleIssueClick = (id: string) => {
    router.push(`/issue/${id}`);
  };

  if (status === "loading" || geoLoading || isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const issues = issuesData?.issues || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-2 rounded-2xl shadow-md flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  CivicChain
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {coordinates ? "Hyderabad, Telangana" : "Loading location..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Welcome back!</h2>
          <p className="text-base sm:text-lg text-muted-foreground">Here are the civic issues near you</p>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
            Welcome back!
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Here are the civic issues near you
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-sm font-medium">{coordinates ? "Hyderabad, Telangana" : "Loading location..."}</span>
          </div>
        </div>

        <div className="animate-fade-in-up animation-delay-200">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterOpen={() => {
              toast.info("Advanced filters coming soon");
            }}
          />
        </div>

        {/* Issues Grid */}
        <div className="mt-6 sm:mt-8">
          {issuesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <Skeleton className="h-56 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : issues.length === 0 ? (
            <Card className="text-center py-12 sm:py-20">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold">No issues found in your area</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Be the first to report an issue and make your community better!</p>
                </div>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  size="lg"
                  className="mt-4"
                >
                  Report First Issue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {issues
                .filter((issue: any) =>
                  searchQuery
                    ? issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      issue.region?.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )
                .map((issue: any, index: number) => (
                  <div
                    key={issue.issue_id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <IssueCard
                      issue={issue}
                      onUpvote={handleUpvote}
                      onDownvote={handleDownvote}
                      onShare={handleShare}
                      onClick={handleIssueClick}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        <FABCreateIssue onClick={() => setCreateModalOpen(true)} />
      </main>

      {/* Modals */}
      <CreateIssueModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["issues"] });
          setCreateModalOpen(false);
          toast.success("Issue reported successfully! 🎉");
        }}
      />
    </div>
  );
}
