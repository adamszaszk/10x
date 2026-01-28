import { describe, it, expect, vi, beforeEach } from "vitest";
import { onRequest } from "./index";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Mock astro:middleware - must be before imports or handled by vitest
vi.mock("astro:middleware", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defineMiddleware: (fn: any) => fn,
}));

// Mock supabase db client
vi.mock("../db/supabase.client", () => ({
  createSupabaseServerInstance: vi.fn(),
  cookieOptions: {},
}));

describe("Middleware", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockContext: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockNext: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    mockNext = vi.fn().mockResolvedValue("next-response");

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
    };

    vi.mocked(createSupabaseServerInstance).mockReturnValue(mockSupabase);

    mockContext = {
      locals: {},
      cookies: {
        set: vi.fn(),
        get: vi.fn(),
      },
      url: new URL("http://localhost:4321/"),
      request: new Request("http://localhost:4321/"),
      redirect: vi.fn().mockReturnValue("redirect-response"),
    };
  });

  const runMiddleware = async () => {
    // cast onRequest to Function since we mocked defineMiddleware to return the function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (onRequest as any)(mockContext, mockNext);
  };

  describe("Public Access", () => {
    it("should allow access to public home page without user", async () => {
      // Arrange
      mockContext.url = new URL("http://localhost:4321/");
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      // Act
      const result = await runMiddleware();

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(result).toBe("next-response");
      expect(mockContext.locals.user).toBeUndefined();
    });

    it("should allow access to login page without user", async () => {
      // Arrange
      mockContext.url = new URL("http://localhost:4321/login");
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      // Act
      await runMiddleware();

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it("should allow access to public API routes", async () => {
      // Arrange
      mockContext.url = new URL("http://localhost:4321/api/auth/login");
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      // Act
      await runMiddleware();

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Protected Route Redirection", () => {
    it("should redirect to login for protected pages when unauthenticated", async () => {
      // Arrange
      mockContext.url = new URL("http://localhost:4321/dashboard");
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      // Act
      const result = await runMiddleware();

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockContext.redirect).toHaveBeenCalledWith("/login");
      expect(result).toBe("redirect-response");
    });

    it("should redirect to login for profile page when unauthenticated", async () => {
      // Arrange
      mockContext.url = new URL("http://localhost:4321/profile");
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      // Act
      await runMiddleware();

      // Assert
      expect(mockContext.redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("API Security", () => {
    it("should return 401 for protected API routes when unauthenticated", async () => {
      // Arrange
      mockContext.url = new URL("http://localhost:4321/api/plans");
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      // Act
      const result = await runMiddleware();

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockContext.redirect).not.toHaveBeenCalled();

      // Check response
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(401);

      const body = await result.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });
  });

  describe("Session Hydration & Auth Logic", () => {
    it("should populate locals.user and allow access to dashboard when authenticated", async () => {
      // Arrange
      const mockUser = { id: "123", email: "test@example.com" };
      mockContext.url = new URL("http://localhost:4321/dashboard");
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      // Act
      await runMiddleware();

      // Assert
      expect(mockContext.locals.user).toEqual({
        id: "123",
        email: "test@example.com",
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it("should redirect authenticated user from login to dashboard", async () => {
      // Arrange
      const mockUser = { id: "123", email: "test@example.com" };
      mockContext.url = new URL("http://localhost:4321/login");
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      // Act
      await runMiddleware();

      // Assert
      expect(mockContext.redirect).toHaveBeenCalledWith("/dashboard");
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Asset Ignoring", () => {
    it("should skip middleware logic for static assets", async () => {
      // Arrange
      mockContext.url = new URL("http://localhost:4321/image.png");
      // If it skips logic, it might not even call user check if placed before
      // But in current implementation, user check is before asset check?
      // Let's check implementation behavior through test.
      // Reading code:
      // 1. Init supabase
      // 2. Check session
      // 3. Define Access Control (check pathname)
      // IF pathname matches asset -> return next()

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      // Act
      await runMiddleware();

      // Assert
      expect(mockNext).toHaveBeenCalled();
      // It shouldn't redirect even if unauthenticated
      expect(mockContext.redirect).not.toHaveBeenCalled();
    });
  });
});
