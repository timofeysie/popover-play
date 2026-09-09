import { test, expect } from "@playwright/test";

test("land grab: pause, step, and the profiles panel", async ({ page }) => {
  await page.goto("/land-grab");

  // The "Play" section is open by default; the demo canvas mounts inside it.
  const tick = page.getByTestId("landgrab-tick");
  await expect(tick).toBeVisible();

  // Let the sim run a bit.
  await page.waitForTimeout(1200);
  const runningValue = Number((await tick.textContent())!.match(/tick (\d+)/)![1]);
  expect(runningValue).toBeGreaterThan(0);

  // Pause -> tick count should hold.
  await page.getByRole("button", { name: "Pause" }).click();
  await page.waitForTimeout(800);
  const pausedValue = Number((await tick.textContent())!.match(/tick (\d+)/)![1]);
  await page.waitForTimeout(600);
  const stillPaused = Number((await tick.textContent())!.match(/tick (\d+)/)![1]);
  expect(stillPaused).toBe(pausedValue);

  // Step -> exactly one tick advances.
  await page.getByRole("button", { name: "Step" }).click();
  await page.waitForTimeout(500);
  const steppedValue = Number((await tick.textContent())!.match(/tick (\d+)/)![1]);
  expect(steppedValue).toBe(pausedValue + 1);

  // Profiles panel.
  await page.getByRole("button", { name: "Profiles" }).click();
  const panel = page.getByTestId("bot-profile-panel");
  await expect(panel.getByRole("heading", { name: "Profiles & tuning" })).toBeVisible();
  await expect(panel.getByText("Red Bot")).toBeVisible();
  await expect(panel.getByText("Homesick trail length").first()).toBeVisible();

  // Autopilot toggle exists on the You card.
  await expect(panel.getByRole("checkbox", { name: /Autopilot/ })).toBeVisible();

  // Nudge a slider and confirm the bound value updates.
  const jitterRow = panel.locator("div", { has: page.locator("#bot-red-jitter") }).first();
  await expect(jitterRow).toContainText("0.5");
  const slider = page.locator("#bot-red-jitter");
  await slider.focus();
  await slider.press("ArrowRight");
  await slider.press("ArrowRight");
  await expect(jitterRow).toContainText("0.7");

  await page.screenshot({ path: "test-results/landgrab-controls.png", fullPage: true });

  // Resume works.
  await page.getByRole("button", { name: "Resume" }).click();
  await page.waitForTimeout(700);
  const resumedValue = Number((await tick.textContent())!.match(/tick (\d+)/)![1]);
  expect(resumedValue).toBeGreaterThan(steppedValue);
});
