import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanDisplay } from "./PlanDisplay";

describe("PlanDisplay", () => {
  const mockDestination = "Paris";

  it("renders correctly with parsed object data", () => {
    const mockData = {
      introduction: "Welcome to Paris.",
      why_visit: "City of Light.",
      things_to_do: "Visit Eiffel Tower.",
      sample_itinerary: "Day 1: Louvre.",
    };

    render(<PlanDisplay data={mockData} destinationName={mockDestination} />);

    expect(screen.getByText("Welcome to Paris.")).toBeInTheDocument();
    expect(screen.getByText(`Why Visit ${mockDestination}?`)).toBeInTheDocument();
    expect(screen.getByText("City of Light.")).toBeInTheDocument();
    expect(screen.getByText("Visit Eiffel Tower.")).toBeInTheDocument();
    expect(screen.getByText("Day 1: Louvre.")).toBeInTheDocument();
  });

  it("renders correctly with JSON string data", () => {
    const mockDataObj = {
      introduction: "Welcome to Rome.",
      why_visit: "History.",
      things_to_do: "Colosseum.",
      sample_itinerary: "Day 1: Vatican.",
    };
    const mockDataString = JSON.stringify(mockDataObj);

    render(<PlanDisplay data={mockDataString} destinationName="Rome" />);

    expect(screen.getByText("Welcome to Rome.")).toBeInTheDocument();
    expect(screen.getByText("Why Visit Rome?")).toBeInTheDocument();
  });

  it("handles missing fields gracefully (resilience)", () => {
    // Pass partial data. Typescript might complain, so cast as any to simulate runtime bad data
    const partialData = {
      introduction: "Just intro",
      // other fields missing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    render(<PlanDisplay data={partialData} destinationName="Nowhere" />);

    expect(screen.getByText("Just intro")).toBeInTheDocument();
    // It should not crash, verify header is still present even if content is empty/undefined
    expect(screen.getByText("Why Visit Nowhere?")).toBeInTheDocument();
  });
});
