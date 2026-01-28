import { createSupabaseServerInstance } from "../db/supabase.client";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PAGES = ["/", "/login", "/recover-password", "/reset-password"];

const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/callback",
  "/api/auth/reset-password-email",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // 1. Initialize Supabase
  // We initialize it for all requests to ensure session availability (e.g. for Header)
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Make supabase available in locals
  locals.supabase = supabase;

  // 2. Check Session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email ?? "",
      id: user.id,
    };
  }

  // 3. Define Access Control
  const pathname = url.pathname;

  // Ignore assets and internal Astro routes
  if (
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(css|js|jpg|png|svg|ico|json)$/)
  ) {
    return next();
  }

  const isPublicPage = PUBLIC_PAGES.includes(pathname);
  // Determine if the route is a public API route
  // We check purely based on the pathname being in the list
  const isPublicApi = PUBLIC_API_ROUTES.includes(pathname);
  const isPublic = isPublicPage || isPublicApi;

  // 4. Handle Redirection Logic
  if (user) {
    // If user is authenticated and tries to access login page, redirect to dashboard
    if (pathname === "/login") {
      return redirect("/dashboard");
    }
  } else {
    // If user is NOT authenticated
    if (!isPublic) {
      // And tries to access a protected route

      // Return 401 for API requests instead of redirecting
      if (pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }

      // Redirect to login for pages
      return redirect("/login");
    }
  }

  return next();
});
