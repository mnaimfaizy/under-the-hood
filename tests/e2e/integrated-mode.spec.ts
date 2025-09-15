import { test, expect } from "@playwright/test";

test.describe("Integrated mode", () => {
  test("Play runs scenario and updates narration", async ({ page }) => {
    await page.goto("/");

    // Force Integrated mode via dev hook to avoid flaky button text across browsers
    await page.evaluate(() => {
      (window as any).__setMode?.("integrated");
    });
    const integratedHeading = page.getByRole("heading", {
      name: /Integrated Simulation Bridge Demo/i,
    });
    await expect(integratedHeading).toBeVisible();

    // Speed up playback
    const speedSlider = page.getByRole("slider", { name: /Playback speed/i });
    await speedSlider.focus();
    // Move to max by pressing ArrowRight a few times
    for (let i = 0; i < 8; i++) await speedSlider.press("ArrowRight");

    // Capture initial narration text from Integrated demo panel
    const narration = page.getByTestId("bridge-narration");
    const initialText = (await narration.textContent())?.trim();

    // Click Play in global controls (not the demo's ▶️ Play)
    const globalPlay = page
      .locator('[aria-label="Simulation controls"]')
      .getByRole("button", { name: /^Play$/ });
    await globalPlay.click();

    // Expect narration to change within a few seconds
    await expect(narration).not.toHaveText(initialText || "", { timeout: 5000 });

    // Optional: pause to avoid runaway
    const globalPause = page
      .locator('[aria-label="Simulation controls"]')
      .getByRole("button", { name: /^Pause$/ });
    await globalPause.click();
  });
});
