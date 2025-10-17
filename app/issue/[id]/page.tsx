"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import clientApi from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReverseGeocode } from "@/hooks/use-reverse-geocode";
import { getUserRole } from "@/lib/auth";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const issueId = params?.id as string;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUserId(localStorage.getItem('civicchain_user_id'));
    }
  }, []);

  const { data: issueData, isLoading } = useQuery({
    queryKey: ["issue", issueId],
    queryFn: async () => {
      const response = await clientApi.get(`/issue/${issueId}`);
      return response.data;
    },
    enabled: !!issueId && status === "authenticated",
  });

  const { data: reporterData, isLoading: reporterLoading } = useQuery({
    queryKey: ["user", issueData?.issue?.user_id],
    queryFn: async () => {
      const response = await clientApi.get(`/user/${issueData.issue.user_id}`);
      return response.data;
    },
    enabled: !!issueData?.issue?.user_id,
  });

  // Get address from coordinates
  const { address, loading: geoLoading } = useReverseGeocode(
    issueData?.issue?.latitude,
    issueData?.issue?.longitude
  );

  // Verify issue mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }
      const response = await clientApi.post(`/issue/${issueId}/verify`, { 
        user_id: currentUserId 
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      console.log("Verify response data:", data);
      
      const txHash = data?.blockchain_tx_hash || data?.transaction_hash;
      
      const message = txHash 
        ? (
            <span>
              Issue verified successfully! ✓ <br />
              <a
                href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 hover:text-blue-800"
              >
                View on Solana Explorer →
              </a>
            </span>
          )
        : "Issue verified successfully!";
      toast.success(message);
    },
    onError: (error: unknown) => {
      let errorMsg = "Failed to verify issue";
      if (typeof error === "object" && error !== null) {
        const err = error as any;
        errorMsg = err.response?.data?.error || err.message || errorMsg;
      }
      toast.error(errorMsg);
    },
  });

  const handleVerify = () => {
    verifyMutation.mutate();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || !issueData?.issue) {
    return null;
  }

  const issue = issueData.issue;
  const reporter = reporterData?.user;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://152.42.157.189:3000';
  const userRole = getUserRole();
  
  // Show verify button if:
  // 1. Status is resolved
  // 2. User is a citizen
  // 3. User is not the reporter
  const canVerify = 
    issue.status?.toLowerCase() === 'resolved' && 
    userRole === 'citizen' && 
    currentUserId !== issue.user_id;
  
  function getImageUrl(url: string) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pothole: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      water: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      streetlight: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      garbage: "bg-green-500/10 text-green-700 border-green-500/20",
      other: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    };
    return colors[category?.toLowerCase()] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      "in-progress": "bg-blue-500/10 text-blue-700 border-blue-500/20",
      resolved: "bg-green-500/10 text-green-700 border-green-500/20",
      rejected: "bg-red-500/10 text-red-700 border-red-500/20",
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden border">
            {/* Issue Image */}
            {issue.image_url && (
              <div className="relative h-96 w-full bg-muted">
                <Image
                  src={getImageUrl(issue.image_url)}
                  alt="Issue"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getCategoryColor(issue.category)} border font-medium`}>
                  {issue.category || "Other"}
                </Badge>
                <Badge className={`${getStatusColor(issue.status)} border font-medium`}>
                  {issue.status || "Pending"}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  Issue Details
                </h1>
                <p className="text-lg text-foreground leading-relaxed">
                  {issue.description}
                </p>
              </div>

              {/* Reporter Info */}
              {reporterLoading ? (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ) : reporter ? (
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-2">Reported by</p>
                  <Link
                    href={`/profile/${reporter.user_id}`}
                    className="flex items-center gap-3 group hover:bg-muted/80 p-2 rounded-lg transition-colors"
                  >
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={reporter.profile_picture_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-white font-semibold">
                        {reporter.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {reporter.name || "Anonymous User"}
                      </p>
                      <p className="text-sm text-muted-foreground">View profile →</p>
                    </div>
                  </Link>
                </div>
              ) : null}

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {geoLoading ? (
                      <span className="animate-pulse text-sm">Loading location...</span>
                    ) : (
                      address
                    )}
                  </p>
                  {issue.latitude && issue.longitude && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Reported on</p>
                  <p className="font-medium">
                    {new Date(issue.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Verify Button */}
              {canVerify && (
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Verify this resolution</p>
                      <p className="text-sm text-muted-foreground">
                        Confirm that this issue has been resolved properly
                      </p>
                    </div>
                    <Button
                      onClick={handleVerify}
                      disabled={verifyMutation.status === 'pending'}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white gap-2"
                    >
                      {verifyMutation.status === 'pending' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Verify Resolution
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Engagement Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Upvotes</p>
                  <p className="text-2xl font-bold text-green-700">{issue.upvotes || 0}</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Downvotes</p>
                  <p className="text-2xl font-bold text-red-700">{issue.downvotes || 0}</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Verifications</p>
                  <p className="text-2xl font-bold text-blue-700">{issue.verification_count || 0}</p>
                </div>
              </div>

              {/* Blockchain Info */}
              {issue.blockchain_tx_hash && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Blockchain Transaction</p>
                  <a
                    href={`https://explorer.solana.com/tx/${issue.blockchain_tx_hash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-mono text-sm underline break-all"
                  >
                    {issue.blockchain_tx_hash}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
