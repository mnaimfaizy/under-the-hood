import { test, expect } from "@playwright/test";

/**
 * Kid Mode smoke test
 * - Loads the app
 * - Selects a scenario
 * - Plays the simulation
 * - Asserts narration changes in expected order-like fashion
 */

test.describe("Kid Mode scenarios", () => {
  test("Timer vs Promise shows microtasks before macrotasks", async ({ page }) => {
    await page.goto("/");

    // choose scenario if not default
    await page.selectOption('select[aria-label="Choose scenario"]', "timer-vs-promise");

    // click play
    await page.getByRole("button", { name: "Play" }).click();

    // wait for narration to mention microtasks then macrotasks
    const narration = page.locator('[data-testid="narration"]');
    await expect(narration).toContainText("Promises");
    await expect(narration).toContainText("Timers");

    // eventually ends
    await expect(narration).toContainText("All done");
  });
});
