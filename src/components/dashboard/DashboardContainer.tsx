import { useState, useEffect } from "react";
import type { PlanDto, GeneratedPlanDto, ProfileDto, CreatePlanCommand } from "../../types";
import { QuotaIndicator } from "./QuotaIndicator";
import { AIInputForm } from "./AIInputForm";
import { RecentPlansList } from "./RecentPlansList";
import { PlanPreviewContainer } from "../plans/PlanPreviewContainer";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export default function DashboardContainer() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [recentPlans, setRecentPlans] = useState<PlanDto[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanDto | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [profileRes, plansRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/plans?limit=3&order=desc"),
        ]);

        if (!profileRes.ok || !plansRes.ok) throw new Error("Failed to load dashboard data");

        const profileData = await profileRes.json();
        const plansData = await plansRes.json();

        setProfile(profileData);
        setRecentPlans(plansData.data);
      } catch {
        setError("Failed to load your dashboard. Please refresh the page.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handlePlanGenerated = (plan: GeneratedPlanDto) => {
    setGeneratedPlan(plan);
  };

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard this plan? It cannot be recovered.")) {
      setGeneratedPlan(null);
    }
  };

  const handleSave = async () => {
    if (!generatedPlan) return;
    setIsSaving(true);
    try {
      const payload: CreatePlanCommand = {
        destination_name: generatedPlan.destination_name,
        plan_data: generatedPlan.plan_data,
      };

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save plan");
      
      const newPlan = await res.json();

      // On success:
      // 1. Clear generated plan (closes preview)
      setGeneratedPlan(null);
      // 2. Redirect to the new plan details page
      window.location.href = `/plans/${newPlan.id}`;
    } catch {
      alert("Failed to save plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const GENERATION_LIMIT = 20;

  if (isLoadingData) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8 pb-24">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">Ready to plan your next adventure?</p>
      </header>

      {/* Quota Section */}
      {profile && <QuotaIndicator used={profile.generation_count} limit={GENERATION_LIMIT} />}

      {/* Main Action Section */}
      <section className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Plan</h2>
        <AIInputForm
          onPlanGenerated={handlePlanGenerated}
          disabled={!profile || profile.generation_count >= GENERATION_LIMIT}
        />
        {profile && profile.generation_count >= GENERATION_LIMIT && (
          <p className="text-destructive text-sm mt-2">You have reached your monthly limit.</p>
        )}
      </section>

      {/* Recent Plans Section */}
      <RecentPlansList plans={recentPlans} isLoading={false} />

      {/* Preview Overlay */}
      {generatedPlan && (
        <PlanPreviewContainer plan={generatedPlan} onDiscard={handleDiscard} onSave={handleSave} isSaving={isSaving} />
      )}
    </div>
  );
}
