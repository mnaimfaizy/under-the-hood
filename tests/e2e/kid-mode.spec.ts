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
    await expect(narration).toContainText("setTimeout moves to the macrotask line");

    // Step 3: Promise moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Promise moves to the microtask VIP lane");

    // Step 4: Drain microtasks
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Drain microtasks (Promise runs first)");

    // Step 5: Run macrotask
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Run macrotask (Timer runs after microtasks)");

    // Step 6: Scenario end
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("All done");
  });

  test("Microtask Chain demonstrates starvation", async ({ page }) => {
    await page.goto("/");
    await page.selectOption('select[aria-label="Choose scenario"]', "microtask-chain");

    const narration = page.locator('[data-testid="narration"]');

    // Step 1: Start the promise party
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Start the promise party!");

    // Step 2: Promise 1 moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Promise 1 moves to the microtask VIP lane");

    // Step 3: Promise 2 moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Promise 2 moves to the microtask VIP lane");

    // Step 4: Promise 3 moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Promise 3 moves to the microtask VIP lane");

    // Step 5: setTimeout moves to macrotask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("setTimeout moves to the macrotask line");

    // Step 6: Drain microtasks
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("VIP lane is busy with promise friends!");

    // Step 7: Run macrotask
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Timer waits patiently in the big line.");

    // Step 8: Scenario end
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("All done");
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
    await expect(narration).toContainText("Timer A moves to the macrotask line");

    // Step 3: Timer B moves to macrotask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Timer B moves to the macrotask line");

    // Step 4: Timer C moves to macrotask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Timer C moves to the macrotask line");

    // Step 5: First timer runs
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("First timer in line goes!");

    // Step 6: Next timer runs
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Next timer in line goes!");

    // Step 7: Last timer runs
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Last timer in line goes!");

    // Step 8: Scenario end
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("All done");
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
    await expect(narration).toContainText("Async Start moves to the Call Stack");

    // Step 3: Log before await
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Log before await");

    // Step 4: Await Resume moves to microtask queue
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Await Resume moves to the microtask VIP lane");

    // Step 5: Drain microtasks
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Await resumes in VIP lane!");

    // Step 6: Scenario end
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("All done");
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
    await expect(narration).toContainText("Click Handler moves to the macrotask line");

    // Step 3: Click handler runs
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("Click handler runs when stack is free!");

    // Step 4: Scenario end
    await page.keyboard.press("ArrowRight");
    await expect(narration).toContainText("All done");
  });
});
