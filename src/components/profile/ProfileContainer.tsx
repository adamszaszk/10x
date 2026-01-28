import { useState, useEffect } from "react";
import { ProfileForm } from "./ProfileForm";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import type { ProfileDto, TravelStyleDto, TravelerTypeDto, UpdateProfileCommand } from "../../types";

export default function ProfileContainer() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [styles, setStyles] = useState<TravelStyleDto[]>([]);
  const [types, setTypes] = useState<TravelerTypeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add cache-busting timestamp to prevent caching empty results
        const t = new Date().getTime();
        const [profileRes, stylesRes, typesRes] = await Promise.all([
          fetch(`/api/profile?t=${t}`),
          fetch(`/api/travel-styles?t=${t}`),
          fetch(`/api/traveler-types?t=${t}`),
        ]);

        if (!profileRes.ok) throw new Error("Failed to load profile");
        if (!stylesRes.ok) throw new Error("Failed to load travel styles");
        if (!typesRes.ok) throw new Error("Failed to load traveler types");

        const profileData = await profileRes.json();
        const stylesData = await stylesRes.json();
        const typesData = await typesRes.json();

        setProfile(profileData);
        setStyles(stylesData || []);
        setTypes(typesData || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (values: UpdateProfileCommand) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    // Determine if we should redirect (Onboarding complete)
    // For simplicity, we always redirect to dashboard on successful save here
    window.location.href = "/dashboard";
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Travel Profile</h1>
        <p className="text-muted-foreground mt-2">
          Tell us about your preferences so we can tailor the best travel experiences for you.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <ProfileForm initialData={profile} travelStyles={styles} travelerTypes={types} onSave={handleSave} />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="border rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
