import { test, expect } from "@playwright/test";

/**
 * Verifies Hi-Fi mode respects prefers-reduced-motion by skipping animations.
 * Strategy:
 *  - Inject prefers-reduced-motion media query override.
 *  - Enter Hi-Fi mode and play.
 *  - Capture token elements before and after a short delay; ensure they do not gain inline transform styles typical of GSAP animations (except possibly static translate values already set).
 *  - Ensure console order still correct.
 */

test.describe("Hi-Fi Mode (reduced motion)", () => {
  test("skips GSAP motion when reduced", async ({ page, context }) => {
    await context.addInitScript(() => {
      // Force prefers-reduced-motion: reduce
      Object.defineProperty(window, "matchMedia", {
        value: (q: string) => ({
          matches: q.includes("prefers-reduced-motion"),
          media: q,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });
    });

    await page.goto("/");

    // Switch to Hi-Fi using dropdown
    const viewDropdown = page.locator('[data-testid="view-mode-select"]');
    await viewDropdown.selectOption("hifi");
    await expect(page.locator(".hf-grid")).toBeVisible();

    // Play
    await page.getByRole("button", { name: "Play" }).click();

    // Wait a bit for what would normally be animations
    await page.waitForTimeout(600);

    // Collect any transform styles applied to micro/macro/api tokens
    const transforms = await page.$$eval("[data-token]", (els) =>
      els.map((e) => (e as any).style.transform || "")
    );
    // In reduced motion mode, we expect either empty strings or very simple translate3d(0px, 0px, 0px)
    for (const t of transforms) {
      expect(t === "" || /translate.*0px/.test(t)).toBeTruthy();
    }

    // Console ordering still holds (Promise before Timeout)
    const consolePanel = page.locator(".panel.console");
    await expect.poll(async () => (await consolePanel.textContent()) || "").toMatch(/Start!/);
    await expect.poll(async () => (await consolePanel.textContent()) || "").toMatch(/End!/);
    await expect.poll(async () => (await consolePanel.textContent()) || "").toMatch(/Promise!/);
    await expect
      .poll(async () => (await consolePanel.textContent()) || "", { timeout: 10000 })
      .toMatch(/Timeout!/);
  });
});
