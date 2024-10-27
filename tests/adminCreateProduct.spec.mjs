import { test, expect } from "@playwright/test";

test("Admin creates new product", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.getByPlaceholder("Enter Your Email ").fill("admin@gmail.com");
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill("admin123");
    await page.getByRole("button", { name: "LOGIN" }).click();
    
    await page.waitForURL("http://localhost:3000");
    await page.getByRole("button", { name: "Admin" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByRole('link', { name: 'Create Product' })).toBeVisible();
    await page.getByRole('link', { name: 'Create Product' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/admin/create-product");

    await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();
    await page.click('.ant-select-selector');
    await page.waitForSelector('.ant-select-item-option');
    await page.click('.ant-select-item-option[title="Default"]');
    await expect(page.locator('.ant-select-selection-item')).toHaveText('Default');

    await page.getByPlaceholder("write a name").fill("Default name");
    await page.getByPlaceholder("write a description").fill("Default description");
    await page.getByPlaceholder("write a Price").fill("100");
    await page.getByPlaceholder("write a quantity").fill("1");

    await page.getByRole("button", { name: "CREATE PRODUCT" }).click();
    await page.waitForURL("http://localhost:3000/dashboard/admin/products");
});