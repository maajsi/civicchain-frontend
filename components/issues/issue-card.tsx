import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, MapPin, Share2, Clock } from "lucide-react";

interface IssueCardProps {
  issue: {
    issue_id: string;
    image_url: string;
    description: string;
    category: "pothole" | "garbage" | "streetlight" | "water" | "other";
    status: "open" | "in_progress" | "resolved" | "closed";
    priority_score: number;
    upvotes: number;
    downvotes: number;
    region?: string;
    distance?: number;
    created_at: string;
  };
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onShare: (id: string) => void;
  onClick: (id: string) => void;
}

export function IssueCard({
  issue,
  onUpvote,
  onDownvote,
  onShare,
  onClick,
}: IssueCardProps) {
  const categoryColors = {
    pothole: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30",
    garbage: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30",
    streetlight: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30",
    water: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    other: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30",
  };

  const statusColors = {
    open: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    resolved: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30",
    closed: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30",
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getDistanceString = () => {
    if (!issue.distance) return "";
    const km = (issue.distance / 1000).toFixed(1);
    return `${km} km away`;
  };

  return (
    <Card
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-primary/50 bg-card hover:-translate-y-1"
      onClick={() => onClick(issue.issue_id)}
    >
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden bg-muted">
        <img
          src={issue.image_url}
          alt={issue.description}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-issue.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <Badge
            className={`${categoryColors[issue.category]} font-medium capitalize shadow-sm`}
          >
            {issue.category}
          </Badge>
          <Badge
            className={`${statusColors[issue.status]} font-medium capitalize shadow-sm`}
          >
            {issue.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Priority Score Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-br from-primary to-chart-2 text-primary-foreground px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
          ⚡ {Math.round(issue.priority_score)}
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-3 pt-4">
        <h3 className="text-base sm:text-lg font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {issue.description}
        </h3>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-2">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="line-clamp-1">
            {issue.region || "Unknown location"}
          </span>
          {issue.distance && (
            <>
              <span>•</span>
              <span className="whitespace-nowrap">{getDistanceString()}</span>
            </>
          )}
        </div>
      </CardHeader>

      {/* Footer - Actions */}
      <CardFooter className="flex gap-2 pt-0 pb-4 px-4 sm:px-6">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-500/10 dark:hover:text-green-400 dark:hover:border-green-500/30 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onUpvote(issue.issue_id);
          }}
        >
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          {issue.upvotes}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:border-red-500/30 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDownvote(issue.issue_id);
          }}
        >
          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          {issue.downvotes}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onShare(issue.issue_id);
          }}
        >
          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </CardFooter>

      {/* Time Footer */}
      <div className="px-4 sm:px-6 pb-4 pt-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-3">
          <Clock className="h-3 w-3" />
          <span>{getTimeAgo(issue.created_at)}</span>
        </div>
      </div>
    </Card>
  );
}
