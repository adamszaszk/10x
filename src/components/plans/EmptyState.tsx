import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <Map className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No plans yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        You haven&apos;t saved any travel plans yet. Start exploring the world by creating your first itinerary!
      </p>
      <Button asChild>
        <a href="/dashboard">Create New Plan</a>
      </Button>
    </div>
  );
};
