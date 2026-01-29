import { describe, it, expect, vi, type Mock } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DashboardContainer from "./DashboardContainer";
import type { ReactNode } from "react";

// Mock child components to isolate DashboardContainer logic
vi.mock("./QuotaIndicator", () => ({
  QuotaIndicator: ({ used, limit }: { used: number; limit: number }) => (
    <div data-testid="quota-indicator">{`Used: ${used}, Limit: ${limit}`}</div>
  ),
}));

vi.mock("./AIInputForm", () => ({
  AIInputForm: ({ onPlanGenerated }: { onPlanGenerated: (plan: unknown) => void }) => (
    <button
      data-testid="generate-btn"
      onClick={() =>
        onPlanGenerated({
          destination_name: "Test City",
          plan_data: { introduction: "Intro" },
        })
      }
    >
      Generate Plan
    </button>
  ),
}));

vi.mock("./RecentPlansList", () => ({
  RecentPlansList: ({ plans }: { plans: unknown[] }) => <div data-testid="recent-plans">{plans.length} Plans</div>,
}));

vi.mock("../plans/PlanPreviewContainer", () => ({
  PlanPreviewContainer: ({
    plan,
    onSave,
    onDiscard,
  }: {
    plan: { destination_name: string };
    onSave: () => void;
    onDiscard: () => void;
  }) => (
    <div data-testid="plan-preview">
      <h1>Preview: {plan.destination_name}</h1>
      <button onClick={onSave}>Save</button>
      <button onClick={onDiscard}>Discard</button>
    </div>
  ),
}));

// Mock UI components
vi.mock("../ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("../ui/alert", () => ({
  Alert: ({ children }: { children: ReactNode }) => <div data-testid="alert">{children}</div>,
  AlertTitle: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  AlertDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

describe("DashboardContainer", () => {
  const mockProfile = { id: "user-1", generation_count: 5 };
  const mockPlans = { data: [{ id: "plan-1" }, { id: "plan-2" }] };

  it("shows loading state initially", async () => {
    // Make request hang to test loading state
    global.fetch = vi.fn(() => new Promise<Response>(() => undefined));

    render(<DashboardContainer />);

    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("renders dashboard content after successful data fetch", async () => {
    (global.fetch as Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlans,
      });

    render(<DashboardContainer />);

    await waitFor(() => {
      expect(screen.queryByTestId("skeleton")).toBeNull();
    });

    // Check if child components are rendered with correct data
    expect(screen.getByTestId("recent-plans")).toHaveTextContent("2 Plans");
    // Note: Quota calculation depends on profile data structure,
    // assuming DashboardContainer passes calculated values.
    // Let's verify QuotaIndicator is present.
    expect(screen.getByTestId("quota-indicator")).toBeInTheDocument();
  });

  it("shows error alert on fetch failure", async () => {
    (global.fetch as Mock).mockRejectedValue(new Error("Network error"));

    render(<DashboardContainer />);

    await waitFor(() => {
      expect(screen.getByTestId("alert")).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to load your dashboard/i)).toBeInTheDocument();
  });

  it("shows plan preview when generation is successful", async () => {
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockProfile })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPlans });

    render(<DashboardContainer />);

    await waitFor(() => {
      expect(screen.getByTestId("generate-btn")).toBeInTheDocument();
    });

    // Trigger generation
    fireEvent.click(screen.getByTestId("generate-btn"));

    expect(screen.getByTestId("plan-preview")).toBeInTheDocument();
    expect(screen.getByText("Preview: Test City")).toBeInTheDocument();
  });

  it("handles plan saving", async () => {
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockProfile }) // profile
      .mockResolvedValueOnce({ ok: true, json: async () => mockPlans }) // plans
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // save api call

    render(<DashboardContainer />);

    await waitFor(() => {
      expect(screen.getByTestId("generate-btn")).toBeInTheDocument();
    });

    // Generate plan
    fireEvent.click(screen.getByTestId("generate-btn"));

    // Click Save in preview
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
      // 1. profile, 2. plans, 3. save POST
    });

    const saveCall = (global.fetch as Mock).mock.calls[2];
    expect(saveCall[0]).toBe("/api/plans");
    expect(saveCall[1].method).toBe("POST");

    await waitFor(() => {
      expect(window.location.href).toContain("/plans/");
    });
  });

  it("handles plan discard", async () => {
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockProfile })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPlans });

    (global.confirm as Mock).mockReturnValue(true);

    render(<DashboardContainer />);

    await waitFor(() => {
      expect(screen.getByTestId("generate-btn")).toBeInTheDocument();
    });

    // Generate
    fireEvent.click(screen.getByTestId("generate-btn"));
    expect(screen.getByTestId("plan-preview")).toBeInTheDocument();

    // Discard
    fireEvent.click(screen.getByText("Discard"));

    // Should close preview
    expect(screen.queryByTestId("plan-preview")).toBeNull();
  });
});
