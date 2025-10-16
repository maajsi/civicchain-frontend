"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocationIcon } from "@/components/icons/location-icon";
import { ShieldIcon, CheckCircleIcon, ZapIcon, UsersIcon } from "@/components/icons/feature-icons";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-5xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12 animate-fade-in-up">
          {/* Logo Icon */}
          <div className="flex justify-center animate-float">
            <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary to-chart-2 rounded-3xl shadow-2xl flex items-center justify-center">
              <LocationIcon className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent animate-gradient">
              CivicChain
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground/80">
            Blockchain-Powered Civic Engagement
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Empowering citizens and governments to collaborate on infrastructure issues with
            transparency, accountability, and trust.
          </p>
        </div>

        {/* Features Card */}
        <Card className="p-8 sm:p-10 bg-card/80 backdrop-blur-sm border-border shadow-xl animate-fade-in-up animation-delay-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Feature 1: 100% Transparent */}
            <div className="flex items-center gap-4 group hover:translate-x-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <ShieldIcon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-foreground/80 font-medium">100% Transparent</span>
            </div>

            {/* Feature 2: Blockchain Verified */}
            <div className="flex items-center gap-4 group hover:translate-x-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-chart-2/10 flex items-center justify-center flex-shrink-0 group-hover:bg-chart-2/20 transition-colors">
                <CheckCircleIcon className="w-6 h-6 text-chart-2" />
              </div>
              <span className="text-foreground/80 font-medium">Blockchain Verified</span>
            </div>

            {/* Feature 3: Instant Reporting */}
            <div className="flex items-center gap-4 group hover:translate-x-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <ZapIcon className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-foreground/80 font-medium">Instant Reporting</span>
            </div>

            {/* Feature 4: Community Driven */}
            <div className="flex items-center gap-4 group hover:translate-x-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-chart-3/10 flex items-center justify-center flex-shrink-0 group-hover:bg-chart-3/20 transition-colors">
                <UsersIcon className="w-6 h-6 text-chart-3" />
              </div>
              <span className="text-foreground/80 font-medium">Community Driven</span>
            </div>
          </div>

          {/* Sign In with Google Button */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
            
            {/* Trust Badge */}
            <p className="text-xs text-muted-foreground text-center">
              Trusted by 50,000+ citizens and 100+ government departments
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
