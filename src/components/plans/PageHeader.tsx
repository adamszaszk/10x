import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const PageHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold tracking-tight">My Plans</h1>
      <Button asChild>
        <a href="/dashboard">
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </a>
      </Button>
    </div>
  );
};
