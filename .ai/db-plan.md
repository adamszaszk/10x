# VibeTravels Database Schema

This document outlines the PostgreSQL database schema for the VibeTravels MVP, designed for the Supabase ecosystem.

## 1. Tables

### `travel_styles`
Stores predefined and user-defined travel style options.

| Column        | Data Type | Constraints                               | Description                                  |
|---------------|-----------|-------------------------------------------|----------------------------------------------|
| `id`          | `uuid`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`| Unique identifier for the travel style.      |
| `name`        | `text`    | `NOT NULL`, `UNIQUE`, `CHECK (length(name) <= 255)` | The name of the travel style (e.g., "Relaxation"). |
| `is_predefined` | `boolean` | `NOT NULL`, `DEFAULT false`               | `true` if this is a common, system-provided option. |

### `traveler_types`
Stores predefined and user-defined traveler type options.

| Column        | Data Type | Constraints                               | Description                                 |
|---------------|-----------|-------------------------------------------|---------------------------------------------|
| `id`          | `uuid`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`| Unique identifier for the traveler type.    |
| `name`        | `text`    | `NOT NULL`, `UNIQUE`, `CHECK (length(name) <= 255)` | The name of the traveler type (e.g., "Solo"). |
| `is_predefined` | `boolean` | `NOT NULL`, `DEFAULT false`               | `true` if this is a common, system-provided option. |

### `profiles`
Stores user-specific preferences and metadata, linked to the `auth.users` table.

| Column                    | Data Type | Constraints                                                                                             | Description                                                              |
|---------------------------|-----------|---------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `user_id`                 | `uuid`    | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE`                                            | Foreign key to the user in Supabase's `auth.users` table.                |
| `travel_style_id`         | `uuid`    | `NULLABLE`, `REFERENCES travel_styles(id)`                                                              | Foreign key to the user's preferred travel style.                        |
| `traveler_type_id`        | `uuid`    | `NULLABLE`, `REFERENCES traveler_types(id)`                                                             | Foreign key to the user's traveler type.                                 |
| `interests`               | `text[]`  | `NOT NULL`, `DEFAULT '{}'::text[]`                                                                      | An array of the user's interests (e.g., "history", "food").              |
| `past_travel_experiences` | `text[]`  | `NOT NULL`, `DEFAULT '{}'::text[]`                                                                      | An array of places the user has previously visited.                      |
| `generation_count`        | `integer` | `NOT NULL`, `DEFAULT 0`, `CHECK (generation_count >= 0 AND generation_count <= 20)`                     | Tracks the number of plans generated in the current month.               |

### `plans`
Stores the AI-generated travel plans that users have saved.

| Column             | Data Type   | Constraints                                                              | Description                                                        |
|--------------------|-------------|--------------------------------------------------------------------------|--------------------------------------------------------------------|
| `id`               | `uuid`      | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                               | Unique identifier for the saved plan.                              |
| `user_id`          | `uuid`      | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE`                | Foreign key to the user who owns the plan.                         |
| `destination_name` | `text`      | `NOT NULL`, `CHECK (length(destination_name) <= 255)`                    | The name of the destination for easy listing.                      |
| `plan_data`        | `jsonb`     | `NOT NULL`                                                               | The full, structured AI-generated plan content.                    |
| `created_at`       | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                              | Timestamp of when the plan was saved.                              |

## 2. Relationships

-   **`auth.users` to `profiles`**: One-to-One. Each user in `auth.users` has exactly one corresponding row in `profiles`. This is enforced by the `user_id` primary key in `profiles`.
-   **`profiles` to `travel_styles`**: Many-to-One. Many user profiles can reference one travel style.
-   **`profiles` to `traveler_types`**: Many-to-One. Many user profiles can reference one traveler type.
-   **`auth.users` to `plans`**: One-to-Many. A user can have many saved plans, but each plan belongs to only one user.

## 3. Indexes

-   An index will be automatically created for the primary key of each table.
-   An index will be automatically created for each foreign key constraint.
-   **`profiles_user_id_idx`**: Index on `profiles(user_id)` to optimize fetching a user's profile. (Created by FK)
-   **`plans_user_id_idx`**: Index on `plans(user_id)` to optimize fetching a user's saved plans. (Created by FK)

## 4. PostgreSQL Policies (Row-Level Security)

RLS will be enabled on the `profiles` and `plans` tables to ensure users can only access and modify their own data.

### `profiles` Table Policies
-   **`Allow individual read access`**:
    -   `USING (auth.uid() = user_id)`
-   **`Allow individual update access`**:
    -   `WITH CHECK (auth.uid() = user_id)`

### `plans` Table Policies
-   **`Allow individual read access`**:
    -   `USING (auth.uid() = user_id)`
-   **`Allow individual insert access`**:
    -   `WITH CHECK (auth.uid() = user_id)`
-   **`Allow individual delete access`**:
    -   `USING (auth.uid() = user_id)`

## 5. Automation and Additional Notes

-   **Profile Creation Trigger**: A PostgreSQL trigger will be created to automatically insert a new row into the `public.profiles` table whenever a new user signs up (i.e., is inserted into `auth.users`).
    ```sql
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (user_id)
      VALUES (new.id);
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    ```

-   **Quota Reset Cron Job**: A `pg_cron` job will be scheduled to run at midnight on the first day of every month to reset the `generation_count` for all users.
    ```sql
    SELECT cron.schedule('reset-monthly-quota', '0 0 1 * *', $$
      UPDATE public.profiles SET generation_count = 0;
    $$);
    ```

-   **Data Integrity**: `ON DELETE CASCADE` is used on foreign keys referencing `auth.users.id` to ensure that if a user is deleted, all their associated data (profile and plans) is also automatically deleted, maintaining referential integrity.
-   **Flexibility**: The `plan_data` column uses `jsonb` to allow for flexible and evolving plan structures without requiring schema migrations.
-   **Predefined Options**: The `is_predefined` flag in `travel_styles` and `traveler_types` allows the application to distinguish between a set of default options and custom, user-entered values in the future.
