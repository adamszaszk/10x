import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TagInput } from "../ui/TagInput";
import { Loader2 } from "lucide-react";
import type { ProfileDto, TravelStyleDto, TravelerTypeDto } from "../../types";
import { Alert, AlertDescription } from "../ui/alert";
import type { ProfileFormValues } from "../../lib/schemas/profile.schema";
import { useProfileForm } from "./hooks/useProfileForm";

interface ProfileFormProps {
  initialData: ProfileDto;
  travelStyles: TravelStyleDto[];
  travelerTypes: TravelerTypeDto[];
  onSave: (values: ProfileFormValues) => Promise<void>;
}

export function ProfileForm({ initialData, travelStyles, travelerTypes, onSave }: ProfileFormProps) {
  const { form, isSaving, error, onSubmit } = useProfileForm({ initialData, onSave });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="travel_style_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Travel Style *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred style" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {travelStyles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>This helps AI understand how you like to travel.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="traveler_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Traveler Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Who do you usually travel with?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {travelerTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests *</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type an interest (e.g. History, Food) and press Enter"
                />
              </FormControl>
              <FormDescription>Add tags for things you enjoy doing while traveling.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="past_travel_experiences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Past Travel Experiences</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Type a location (e.g. Paris, Tokyo) and press Enter"
                />
              </FormControl>
              <FormDescription>Help us avoid suggesting places you&apos;ve already visited.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </form>
    </Form>
  );
}
