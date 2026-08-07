import { test, expect } from "@playwright/test";

test.describe("Mission Control Cargo Manifest — cargo step", () => {
  test("loads the catalog with an empty manifest panel", async ({ page }) => {
    await page.goto("/mccm/cargo");

    await expect(page.getByPlaceholder("Search the cargo catalog…")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Manifest" })).toBeVisible();
    await expect(page.getByText("0 lines")).toBeVisible();
    await expect(page.getByText("No cargo added yet")).toBeVisible();
  });

  test("adding an item updates the manifest panel", async ({ page }) => {
    await page.goto("/mccm/cargo");

    await page.getByRole("button", { name: "Add" }).first().click();

    await expect(page.getByText("1 line")).toBeVisible();
    await expect(page.getByText(/Qty 1 · \$/)).toBeVisible();
  });

  test("continue link advances to the destination step", async ({ page }) => {
    await page.goto("/mccm/cargo");

    await page.getByRole("link", { name: "Continue to Destination →" }).click();

    await expect(page).toHaveURL(/\/mccm\/destination$/);
    await expect(page.getByRole("heading", { name: /Destination & Clearance/ })).toBeVisible();
  });

  test("visiting review with an empty manifest redirects back to cargo", async ({ page }) => {
    await page.goto("/mccm/review");

    await expect(page).toHaveURL(/\/mccm\/cargo$/);
  });
});
