/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user: {
        id: string;
        email: string;
      } | null;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly MOCK_AI_RESPONSE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
