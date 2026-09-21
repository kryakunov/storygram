import { expect, test } from "@playwright/test";

test("homepage search opens a public story viewer", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /смотреть сторис инстаграм анонимно/i }),
  ).toBeVisible();

  await page.getByLabel("Открытый никнейм").fill("luna.travels");
  await page.getByRole("button", { name: "Смотреть истории" }).click();

  await expect(page).toHaveURL(/u=luna\.travels/);
  await expect(page.getByRole("heading", { name: "Luna Travels" })).toBeVisible();
  await expect(page.getByText("@luna.travels")).toBeVisible();

  await page.getByRole("button", { name: /Восход у парома/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Восход у парома/ })).toBeVisible();
  await page.getByRole("button", { name: "Закрыть просмотр" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
