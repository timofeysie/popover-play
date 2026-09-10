import { test, expect } from "@playwright/test";

test("land grab: pause, step, and the profiles panel", async ({ page }) => {
  await page.goto("/land-grab");

  // The "Play" section is open by default; the demo canvas mounts inside it.
  const tick = page.getByTestId("landgrab-tick");
  await expect(tick).toBeVisible();

  // Wait for the sim to actually start ticking (cold Vite start can lag the
  // first paint well past a fixed timeout).
  const tickValue = async () => Number((await tick.textContent())!.match(/tick (\d+)/)![1]);
  await expect.poll(tickValue, { timeout: 15000 }).toBeGreaterThan(0);

  // Pause -> tick count should hold.
  await page.getByRole("button", { name: "Pause" }).click();
  await page.waitForTimeout(800);
  const pausedValue = await tickValue();
  await page.waitForTimeout(600);
  expect(await tickValue()).toBe(pausedValue);

  // Step -> exactly one tick advances.
  await page.getByRole("button", { name: "Step" }).click();
  await page.waitForTimeout(500);
  const steppedValue = await tickValue();
  expect(steppedValue).toBe(pausedValue + 1);

  // Profiles panel.
  await page.getByRole("button", { name: "Profiles" }).click();
  const panel = page.getByTestId("bot-profile-panel");
  await expect(panel.getByRole("heading", { name: "Profiles & tuning" })).toBeVisible();
  await expect(panel.getByText("Red Surveyor")).toBeVisible();

  // Red starts as a Surveyor: its card shows the archetype and the Surveyor-only
  // knobs, not the Rambler's homesick length.
  const redCard = page.getByTestId("bot-card-bot-red");
  const redArchetype = redCard.getByLabel("Archetype");
  await expect(redArchetype).toHaveValue("surveyor");
  await expect(redCard.getByText("Max trail exposure")).toBeVisible();
  await expect(redCard.getByText("Homesick trail length")).toHaveCount(0);

  // Switching Red to Rambler swaps the rendered field set.
  await redArchetype.selectOption("rambler");
  await expect(redCard.getByText("Homesick trail length")).toBeVisible();
  await expect(redCard.getByText("Max trail exposure")).toHaveCount(0);

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
  await expect.poll(tickValue, { timeout: 5000 }).toBeGreaterThan(steppedValue);
});
