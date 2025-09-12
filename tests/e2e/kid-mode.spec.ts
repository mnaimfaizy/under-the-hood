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

  test("Microtask Chain demonstrates starvation", async ({ page }) => {
    await page.goto("/");
    await page.selectOption('select[aria-label="Choose scenario"]', "microtask-chain");
    await page.getByRole("button", { name: "Play" }).click();

    const narration = page.locator('[data-testid="narration"]');
    await expect(narration).toContainText("VIP lane is busy");
    await expect(narration).toContainText("Timer waits");
    await expect(narration).toContainText("All done");
  });

  test("Nested Timeouts shows FIFO order", async ({ page }) => {
    await page.goto("/");
    await page.selectOption('select[aria-label="Choose scenario"]', "nested-timeouts");
    await page.getByRole("button", { name: "Play" }).click();

    const narration = page.locator('[data-testid="narration"]');
    await expect(narration).toContainText("First timer");
    await expect(narration).toContainText("Next timer");
    await expect(narration).toContainText("Last timer");
    await expect(narration).toContainText("All done");
  });

  test("Async/Await shows microtask continuation", async ({ page }) => {
    await page.goto("/");
    await page.selectOption('select[aria-label="Choose scenario"]', "async-await");
    await page.getByRole("button", { name: "Play" }).click();

    const narration = page.locator('[data-testid="narration"]');
    await expect(narration).toContainText("Async function begins");
    await expect(narration).toContainText("Await resumes");
    await expect(narration).toContainText("All done");
  });

  test("DOM Click shows event handler enqueuing", async ({ page }) => {
    await page.goto("/");
    await page.selectOption('select[aria-label="Choose scenario"]', "dom-click");
    await page.getByRole("button", { name: "Play" }).click();

    const narration = page.locator('[data-testid="narration"]');
    await expect(narration).toContainText("Click handler runs");
    await expect(narration).toContainText("All done");
  });
});
