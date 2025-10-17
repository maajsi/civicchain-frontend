import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FABCreateIssueProps {
  onClick: () => void;
}

export function FABCreateIssue({ onClick }: FABCreateIssueProps) {
  return (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 z-50"
      onClick={onClick}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
