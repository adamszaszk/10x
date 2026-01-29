import { test, expect } from "@playwright/test";

// Use a known existing user or a reliable way to authenticate in tests
const TEST_EMAIL = process.env.E2E_USERNAME || "test@test.com";
const TEST_PASSWORD = process.env.E2E_PASSWORD || "password";

test.describe("VibeTravels Critical Path", () => {
  test("User can login, generate a plan, save it, and then delete it", async ({ page }) => {
    // 1. Login
    await page.goto("/login");

    // Fill in login form
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Wait for inputs to be strictly visible and interactive
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Workaround for hydration overwriting inputs:
    // Focus, type, and verify. If empty (hydration reset), retry.
    await emailInput.focus();
    await emailInput.fill(TEST_EMAIL);

    // Short wait to see if hydration wipes it
    await page.waitForTimeout(500);

    // If value got wiped by hydration, fill it again
    if ((await emailInput.inputValue()) === "") {
      await emailInput.fill(TEST_EMAIL);
    }

    await passwordInput.focus();
    await passwordInput.fill(TEST_PASSWORD);

    // Final verification before click
    await expect(emailInput).toHaveValue(TEST_EMAIL);
    await expect(passwordInput).toHaveValue(TEST_PASSWORD);

    await submitButton.click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL("/dashboard");

    // 2. Generate Plan
    // Check for unique element on dashboard to ensure loaded
    await expect(page.locator('[data-test-id="dashboard-container"]')).toBeVisible();

    const promptText = "A 2-day trip to Paris, focusing on museums and cafes.";
    await page.fill('textarea[name="prompt"]', promptText);
    await page.click('button:has-text("Generate Plan")');

    // Wait for generation (this might take time, so we increase timeout or wait for specific element)
    // Looking for the Plan Preview modal/overlay
    // We need to identify the selector for the save button in the preview
    const saveButton = page.locator('button:has-text("Save to My Plans")');
    await expect(saveButton).toBeVisible({ timeout: 60000 }); // Give it up a minute for AI generation

    // 3. Save Plan
    await saveButton.click();

    // 4. Verify & Cleanup
    // Wait for modal to disappear
    await expect(saveButton).not.toBeVisible();

    // Should now be on plan details page
    await expect(page).toHaveURL(/\/plans\/.+/);

    // Verify plan details are visible
    await expect(page.locator('[data-test-id="plan-details-container"]')).toBeVisible();

    // Delete the plan
    // Assuming there is a delete button on the details page
    // We might need to confirm a dialog
    // The dialog is custom alert dialog, not browser native dialog
    await page.click('button:has-text("Delete Plan")');
    const confirmDelete = page.locator('[data-test-id="confirm-delete-plan-button"]');
    await confirmDelete.click();

    // Verify redirect after deletion (likely back to plans list or dashboard)
    await expect(page).toHaveURL(/\/plans/);

    // Optional: Verify plan is gone from list
    // This assumes the deleted plan was unique enough or we capture its ID
  });
});
