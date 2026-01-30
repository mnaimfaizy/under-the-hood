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

    // step through the simulation manually
    const narration = page.locator('[data-testid="narration"]');

    // Step 1: Start sync code
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Start sync code");

    // Step 2: setTimeout moves to macrotask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait Task moves to Waiting Line");

    // Step 3: Promise moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Quick Task moves to");

    // Step 4: Drain microtasks
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Drain microtasks (Quick Task runs first)");

    // Step 5: Promise moves to call stack
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("moves to Task Robot");

    // Step 6: Promise completes
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Quick Task completes!");
  });

  test("Microtask Chain demonstrates starvation", async ({ page }) => {
    await page.goto("/");
    await page.selectOption('select[aria-label="Choose scenario"]', "microtask-chain");

    const narration = page.locator('[data-testid="narration"]');

    // Step 1: Start the promise party
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Start the quick task party");

    // Step 2: Promise 1 moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Quick 1 moves to");

    // Step 3: Promise 2 moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Quick 2 moves to");

    // Step 4: Promise 3 moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Quick 3 moves to");

    // Step 5: setTimeout moves to macrotask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait Task moves to Waiting Line");

    // Step 6: Drain microtasks
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Speedy lane is busy");

    // Step 7: Run macrotask
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("moves to Task Robot");
  });

  test("Nested Timeouts shows FIFO order", async ({ page }) => {
    await page.goto("/");
    await page.selectOption('select[aria-label="Choose scenario"]', "nested-timeouts");

    const narration = page.locator('[data-testid="narration"]');

    // Step 1: Set up the timer lineup
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Set up the timer lineup!");

    // Step 2: Timer A moves to macrotask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait A moves to Waiting Line");

    // Step 3: Timer B moves to macrotask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait B moves to Waiting Line");

    // Step 4: Timer C moves to macrotask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait C moves to Waiting Line");

    // Step 5: First timer runs
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("First wait task in line goes!");

    // Step 6: First timer moves to call stack
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait A moves to Task Robot");

    // Step 7: First timer completes
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait A completes!");

    // Step 8: First timer removed
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Task completed and removed");

    // Step 9: Second timer runs
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Next wait task in line goes!");

    // Step 10: Second timer moves to call stack
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait B moves to Task Robot");

    // Step 11: Second timer completes
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait B completes!");

    // Step 12: Second timer removed
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Task completed and removed");

    // Step 13: Third timer runs
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Last wait task in line goes!");

    // Step 14: Third timer moves to call stack
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait C moves to Task Robot");

    // Step 15: Third timer completes
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Wait C completes!");
  });

  test("Async/Await shows microtask continuation", async ({ page }) => {
    await page.goto("/");
    await page.selectOption('select[aria-label="Choose scenario"]', "async-await");

    const narration = page.locator('[data-testid="narration"]');

    // Step 1: Async function begins
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Async function begins!");

    // Step 2: Async Start moves to call stack
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Async Start moves to Task Robot");

    // Step 3: Log before await
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Log before await");

    // Step 4: Pausing at await
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Pausing at await");

    // Step 5: Await Resume moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Resume moves to");

    // Step 5: Drain microtasks
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Speedy Lane");
  });

  test("DOM Click shows event handler enqueuing", async ({ page }) => {
    await page.goto("/");
    await page.selectOption('select[aria-label="Choose scenario"]', "dom-click");

    const narration = page.locator('[data-testid="narration"]');

    // Step 1: Page loads and sets up click listener
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Page loads and sets up click listener");

    // Step 2: Click Handler moves to macrotask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Click Handler moves to Waiting Line");

    // Step 3: Click handler runs
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Click handler runs when stack is free!");
  });
});
