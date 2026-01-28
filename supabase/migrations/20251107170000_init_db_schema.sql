-- VibeTravels Initial Schema Migration
--
-- This migration sets up the initial database schema for the VibeTravels application.
-- It includes tables for managing user profiles, travel preferences, and saved plans,
-- along with the necessary security policies and automation.
--
-- Affected Tables:
-- - public.travel_styles
-- - public.traveler_types
-- - public.profiles
-- - public.plans
--
-- Special Considerations:
-- - Row-Level Security (RLS) is enabled on all tables.
-- - A trigger is created to automatically provision a user profile on new user signup.
-- - A cron job is scheduled to reset monthly plan generation quotas.

-- ==== Step 1: Create `travel_styles` table ====
-- Stores predefined and user-defined travel style options.
create table public.travel_styles (
    id uuid primary key default gen_random_uuid(),
    name text not null unique check (length(name) <= 255),
    is_predefined boolean not null default false
);

-- Add comments to the table and columns for clarity.
comment on table public.travel_styles is 'Stores predefined and user-defined travel style options (e.g., "Relaxation", "Adventure").';
comment on column public.travel_styles.name is 'The name of the travel style.';
comment on column public.travel_styles.is_predefined is 'True if this is a common, system-provided option.';

-- Enable Row-Level Security for the `travel_styles` table.
alter table public.travel_styles enable row level security;

-- Create RLS policies for `travel_styles`.
-- This table is intended to be public and readable by everyone.
create policy "allow public read access for anon"
on public.travel_styles
for select
to anon
using (true);

create policy "allow public read access for authenticated users"
on public.travel_styles
for select
to authenticated
using (true);


-- ==== Step 2: Create `traveler_types` table ====
-- Stores predefined and user-defined traveler type options.
create table public.traveler_types (
    id uuid primary key default gen_random_uuid(),
    name text not null unique check (length(name) <= 255),
    is_predefined boolean not null default false
);

-- Add comments to the table and columns for clarity.
comment on table public.traveler_types is 'Stores predefined and user-defined traveler type options (e.g., "Solo", "Family").';
comment on column public.traveler_types.name is 'The name of the traveler type.';
comment on column public.traveler_types.is_predefined is 'True if this is a common, system-provided option.';

-- Enable Row-Level Security for the `traveler_types` table.
alter table public.traveler_types enable row level security;

-- Create RLS policies for `traveler_types`.
-- This table is also public and readable by everyone.
create policy "allow public read access for anon"
on public.traveler_types
for select
to anon
using (true);

create policy "allow public read access for authenticated users"
on public.traveler_types
for select
to authenticated
using (true);


-- ==== Step 3: Create `profiles` table ====
-- Stores user-specific preferences and metadata, linked to the `auth.users` table.
create table public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    travel_style_id uuid references public.travel_styles(id),
    traveler_type_id uuid references public.traveler_types(id),
    interests text[] not null default '{}'::text[],
    past_travel_experiences text[] not null default '{}'::text[],
    generation_count integer not null default 0 check (generation_count >= 0 and generation_count <= 20)
);

-- Add comments to the table and columns for clarity.
comment on table public.profiles is 'Stores user-specific preferences and metadata.';
comment on column public.profiles.user_id is 'Foreign key to the user in Supabase''s `auth.users` table.';
comment on column public.profiles.generation_count is 'Tracks the number of plans generated in the current month.';

-- Enable Row-Level Security for the `profiles` table.
alter table public.profiles enable row level security;

-- Create RLS policies for `profiles`.
-- Users should only be able to read and update their own profile.
create policy "allow individual read access"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "allow individual update access"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- ==== Step 4: Create `plans` table ====
-- Stores the AI-generated travel plans that users have saved.
create table public.plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    destination_name text not null check (length(destination_name) <= 255),
    plan_data jsonb not null,
    created_at timestamptz not null default now()
);

-- Add comments to the table and columns for clarity.
comment on table public.plans is 'Stores the AI-generated travel plans that users have saved.';
comment on column public.plans.destination_name is 'The name of the destination for easy listing.';
comment on column public.plans.plan_data is 'The full, structured AI-generated plan content.';

-- Enable Row-Level Security for the `plans` table.
alter table public.plans enable row level security;

-- Create RLS policies for `plans`.
-- Users can manage their own plans (read, insert, delete).
create policy "allow individual read access"
on public.plans
for select
to authenticated
using (auth.uid() = user_id);

create policy "allow individual insert access"
on public.plans
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "allow individual delete access"
on public.plans
for delete
to authenticated
using (auth.uid() = user_id);


-- ==== Step 5: Create function and trigger to handle new user profiles ====
-- This function automatically inserts a new row into `public.profiles` when a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Add a comment to the function for clarity.
comment on function public.handle_new_user() is 'Automatically creates a profile for a new user.';

-- Create the trigger that executes the function after a new user is inserted into `auth.users`.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==== Step 6: Schedule cron job to reset monthly quota ====
-- This cron job runs at midnight on the first day of every month to reset the `generation_count` for all users.
-- Note: This requires the `pg_cron` extension to be enabled in your Supabase project.

-- Enable the pg_cron extension if it's not already enabled.
create extension if not exists pg_cron with schema extensions;

-- Grant usage on the cron schema to the postgres role.
-- This is necessary for the cron job to be scheduled correctly.
grant usage on schema cron to postgres;

select cron.schedule(
    'reset-monthly-quota',
    '0 0 1 * *', -- cron syntax for "at 00:00 on day-of-month 1"
    $$
      update public.profiles set generation_count = 0;
    $$
);
