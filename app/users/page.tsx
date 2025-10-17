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

export default function UsersPage() {
  // Always redirect based on userRole if already authenticated (handles reloads)
  // (Moved below variable declarations to avoid 'used before declaration' error)
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { coordinates, loading: geoLoading } = useGeolocation();
  const { setLocation } = useAppStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

    // Always redirect based on userRole if already authenticated (handles reloads)
    useEffect(() => {
      if (status === "authenticated") {
        const userRole = getUserRole();
        if (userRole === "government") {
          router.replace("/admin");
        } else if (userRole === "citizen") {
          router.replace("/users");
        }
      }
    }, [status, router]);



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
            
            // Role-based routing after backend authentication
            const userRole = getUserRole();
            if (userRole === 'government') {
              router.push('/admin');
              return;
            } else {
              router.push('/users');
              return;
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
    queryKey: ["issues", coordinates?.lat, coordinates?.lng, searchQuery, selectedTypes],
    queryFn: async () => {
      if (!coordinates) return null;
      const params: Record<string, any> = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius: 5000,
      };
      if (selectedTypes.length > 0) {
        params.category = selectedTypes.join(",");
      }
      const response = await clientApi.get("/issues", { params });
      return response.data;
    },
    enabled: !!coordinates && !isAuthenticating,
    refetchInterval: 30000,
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const user_id = typeof window !== 'undefined' ? localStorage.getItem('civicchain_user_id') : null;
      const response = await clientApi.post(`/issues/${issueId}/upvote`, { user_id });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      if (data?.issue?.blockchain_tx_hash) {
        toast.success(
          <span>
            Upvoted successfully! <br />
            <a
              href={`https://explorer.solana.com/tx/${data.issue.blockchain_tx_hash}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              View on Solana Explorer
            </a>
          </span>
        );
      } else {
        toast.success("Upvoted successfully!");
      }
    },
    onError: () => {
      toast.error("Failed to upvote");
    },
  });

  // Downvote mutation
  const downvoteMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const user_id = typeof window !== 'undefined' ? localStorage.getItem('civicchain_user_id') : null;
      const response = await clientApi.post(`/issues/${issueId}/downvote`, { user_id });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      if (data?.issue?.blockchain_tx_hash) {
        toast.success(
          <span>
            Downvoted! <br />
            <a
              href={`https://explorer.solana.com/tx/${data.issue.blockchain_tx_hash}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              View on Solana Explorer
            </a>
          </span>
        );
      } else {
        toast.success("Downvoted");
      }
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
  // Helper to prefix image URLs from backend
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://152.42.157.189:3000';
  function getImageUrl(url: string) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-2 rounded-2xl shadow-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
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
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
            selectedTypes={selectedTypes}
            onTypeToggle={(type) => {
              setSelectedTypes((prev) =>
                prev.includes(type)
                  ? prev.filter((t) => t !== type)
                  : [...prev, type]
              );
            }}
          />
        </div>

        {/* Issues Grid */}
        <div className="mt-8">
          {issuesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-center py-20 animate-fade-in-up">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-chart-2/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No issues found in your area</h3>
              <p className="text-muted-foreground mb-6">Be the first to report an issue and make your community better!</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary to-chart-2 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Report First Issue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      issue={{ ...issue, image_url: getImageUrl(issue.image_url) }}
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
