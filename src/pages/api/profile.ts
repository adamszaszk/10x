import type { APIRoute } from "astro";
import { UpdateProfileCommandSchema } from "../../lib/schemas/profile.schema";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { supabase } = locals;

  const { data, error } = await supabase.from("profiles").select("*").single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;

  // 1. Get the current user to ensure we have the ID for the update clause
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Parse and validate the request body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parseResult = UpdateProfileCommandSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response(JSON.stringify({ error: "Validation failed", details: parseResult.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const updateData = parseResult.data;

  // 3. Update the profile
  const { data, error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id).select().single();

  if (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
