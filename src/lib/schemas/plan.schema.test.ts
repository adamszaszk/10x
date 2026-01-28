import { describe, it, expect } from "vitest";
import { CreatePlanCommandSchema } from "./plan.schema";

describe("Plan Schemas", () => {
  describe("CreatePlanCommandSchema", () => {
    const validCommand = {
      destination_name: "Paris",
      plan_data: { some: "data" },
    };

    it("should validate a valid command", () => {
      const result = CreatePlanCommandSchema.safeParse(validCommand);
      expect(result.success).toBe(true);
    });

    it("should fail if destination_name is empty", () => {
      const input = { ...validCommand, destination_name: "" };
      const result = CreatePlanCommandSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Destination name is required");
      }
    });

    it("should fail if destination_name exceeds max length", () => {
      const input = { ...validCommand, destination_name: "a".repeat(256) };
      const result = CreatePlanCommandSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Destination name is too long");
      }
    });

    it("should fail if plan_data is empty object", () => {
      const input = { ...validCommand, plan_data: {} };
      const result = CreatePlanCommandSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Plan data cannot be empty");
      }
    });

    it("should fail if plan_data is missing", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { plan_data: _, ...input } = validCommand;
      const result = CreatePlanCommandSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
