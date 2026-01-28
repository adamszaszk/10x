import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormSchema, type ProfileFormValues } from "../../../lib/schemas/profile.schema";
import type { ProfileDto } from "../../../types";

interface UseProfileFormProps {
  initialData: ProfileDto;
  onSave: (values: ProfileFormValues) => Promise<void>;
}

export function useProfileForm({ initialData, onSave }: UseProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      travel_style_id: initialData.travel_style_id || undefined,
      traveler_type_id: initialData.traveler_type_id || undefined,
      interests: initialData.interests || [],
      past_travel_experiences: initialData.past_travel_experiences || [],
    },
  });

  const handleSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(values);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save profile.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    isSaving,
    error,
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
