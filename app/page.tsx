"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationIcon } from "@/components/icons/location-icon";
import { ShieldIcon, CheckCircleIcon, ZapIcon, UsersIcon } from "@/components/icons/feature-icons";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/users" });
  };

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/users");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl space-y-8 animate-fade-in-up">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          {/* Logo Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary via-primary to-chart-2 rounded-3xl shadow-lg flex items-center justify-center">
              <LocationIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
              CivicChain
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground">
            Blockchain-Powered Civic Engagement
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Empowering citizens and governments to collaborate on infrastructure issues with
            transparency, accountability, and trust.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Feature 1: 100% Transparent */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                <ShieldIcon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">100% Transparent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Every transaction and report is publicly verifiable on the blockchain for complete accountability.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 2: Blockchain Verified */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-chart-2/50">
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center group-hover:bg-chart-2/20 group-hover:scale-110 transition-all">
                <CheckCircleIcon className="w-6 h-6 text-chart-2" />
              </div>
              <CardTitle className="text-lg">Blockchain Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                All civic issues are immutably recorded and cryptographically secured for trust and integrity.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 3: Instant Reporting */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-amber-500/50">
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition-all">
                <ZapIcon className="w-6 h-6 text-amber-500" />
              </div>
              <CardTitle className="text-lg">Instant Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Submit infrastructure issues in real-time and get immediate confirmation on the blockchain.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 4: Community Driven */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-chart-3/50">
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center group-hover:bg-chart-3/20 group-hover:scale-110 transition-all">
                <UsersIcon className="w-6 h-6 text-chart-3" />
              </div>
              <CardTitle className="text-lg">Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Empower citizens to collaborate with local governments for effective civic engagement.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              {status === "loading" ? (
                <Button 
                  size="lg"
                  disabled
                  className="w-full sm:w-auto px-8"
                >
                  Loading...
                </Button>
              ) : session ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">
                    Welcome, {session.user?.name}!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You are signed in as {session.user?.email}
                  </p>
                </div>
              ) : (
                <>
                  <Button 
                    size="lg"
                    onClick={handleSignIn}
                    className="w-full sm:w-auto px-8 gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Trusted by 50,000+ citizens and 100+ government departments
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
