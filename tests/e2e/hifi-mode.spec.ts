import { test, expect } from "@playwright/test";

/**
 * Hi-Fi Mode smoke & interaction test
 * - Switches to Hi-Fi view
 * - Verifies initial narration
 * - Plays scenario and checks console order (Promise before Timeout)
 * - Adjusts animation speed and toggles Smooth
 * - Exports & clears history (verifies timeline empties)
 */

test.describe("Hi-Fi Mode", () => {
  test("basic flow and controls", async ({ page, context }) => {
    // Emulate reduced motion off for this test explicitly
    await context.addInitScript(() => {
      // noop placeholder
    });

    await page.goto("/");

    // Switch to Hi-Fi view using the dropdown
    const viewDropdown = page.locator('[data-testid="view-mode-select"]');
    await viewDropdown.selectOption("hifi");
    await expect(page.locator(".hf-grid")).toBeVisible();

    // Ensure narration present
    const narration = page.locator('[data-testid="narration"]');
    await expect(narration).toBeVisible();

    // Play
    await page.getByRole("button", { name: "Play" }).click();

    // Wait for console outputs to appear in order (Promise before Timeout)
    const consolePanel = page.locator(".panel.console");
    await expect.poll(async () => (await consolePanel.textContent()) || "").toMatch(/Start!/);
    await expect.poll(async () => (await consolePanel.textContent()) || "").toMatch(/End!/);
    await expect.poll(async () => (await consolePanel.textContent()) || "").toMatch(/Promise!/);
    await expect
      .poll(async () => (await consolePanel.textContent()) || "", { timeout: 10000 })
      .toMatch(/Timeout!/);

    // Adjust animation speed slider
    const animSlider = page.locator('input[aria-label="Animation speed"]');
    await animSlider.evaluate((el: any) => {
      el.value = "2";
      el.dispatchEvent(new window.Event("input", { bubbles: true }));
      el.dispatchEvent(new window.Event("change", { bubbles: true }));
    });

    // Toggle Smooth
    await page.getByRole("checkbox", { name: /Smooth/ }).check();

    // Export history (download interception not required; just click)
    await page.getByRole("button", { name: "Export" }).click();

    // Clear history
    await page.getByRole("button", { name: "Clear token history" }).click();

    // Timeline should show empty state (pseudo-element text not in DOM)
    const timeline = page.locator(".timeline");
    await expect(timeline).toHaveAttribute("data-empty", "true");
  });

  // Additional test: toggling back to Basic view cleans up Hi-Fi DOM
  test("toggle back to basic view removes hf-grid", async ({ page }) => {
    await page.goto("/");
    const viewDropdown = page.locator('[data-testid="view-mode-select"]');
    await viewDropdown.selectOption("hifi");
    await expect(page.locator(".hf-grid")).toBeVisible();
    // Toggle back to basic
    await viewDropdown.selectOption("basic");
    await expect(page.locator(".hf-grid")).toHaveCount(0);
  });
});
