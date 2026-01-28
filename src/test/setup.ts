import { vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Global mocks
beforeEach(() => {
  // Global fetch mock
  global.fetch = vi.fn();

  // Mock window properties if window exists (jsdom environment)
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { reload: vi.fn() },
    });
    global.confirm = vi.fn();
    global.alert = vi.fn();
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});
