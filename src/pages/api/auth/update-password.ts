import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { password } = await request.json();

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
};
